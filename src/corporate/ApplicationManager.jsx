import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/CorporateTopBar';
import useCorporateStore from '../store/useCorporateStore';

const descriptions = {
    ACTIVATED: "Smart Bin has been successfully activated",
    DELIVERED: "Your smart Bin was delivered on ",
    INVENTORY: "Your smart Bin has been allocated in inventory",
    PENDING: "Your application has been received and is awaiting approval"
}

function AppManager() {

    const navigate = useNavigate();
    const [currentId, setCurrentId] = useState("");
    const [orderDetails, setOrderDetails] = useState({})
    const [paymentStatus, setPaymentStatus] = useState('unpaid');

    const handleBack = () => {
        localStorage.removeItem("appId");
        navigate('/applyforsmartbin')
    }

    useEffect(() => {
        setCurrentId(localStorage.getItem("appId"));
    }, []);

    useEffect(() => {
        if (currentId) {
            fetchData();
        }
    }, [currentId]);

    // Function to verify if a specific payment was actually successful
    const verifyActualPayment = async (payment) => {
        try {
            console.log('🔍 Verifying actual payment success for:', payment.transactionReference);
            
            // Check if it's a wallet payment
            if (payment.paymentMethod === 'wallet' || payment.service === 'Wallet Charge') {
                // For wallet payments, check if the wallet/charge was successful
                // We can verify this by checking if the transaction exists and is successful
                if (payment.status?.toLowerCase() === 'successful' || 
                    payment.status?.toLowerCase() === 'paid' || 
                    payment.status?.toLowerCase() === 'completed') {
                    console.log('✅ Wallet payment verified as successful');
                    return true;
                }
            }
            
            // Check if it's an AlatPay payment
            if (payment.paymentMethod === 'alatPay' || 
                payment.transactionReference?.includes('ALAT') ||
                payment.narration?.toLowerCase().includes('alat')) {
                
                // For AlatPay payments, verify using the mock-verify endpoint
                try {
                    const verifyResponse = await api.get(`/api/v1/wallets/mock-verify?reference=${payment.transactionReference}`);
                    console.log('🔍 AlatPay verification response:', verifyResponse.data);
                    
                    if (verifyResponse.data?.success || verifyResponse.data?.succeeded) {
                        console.log('✅ AlatPay payment verified as successful');
                        return true;
                    } else {
                        console.log('❌ AlatPay payment verification failed');
                        return false;
                    }
                } catch (verifyError) {
                    console.error('Error verifying AlatPay payment:', verifyError);
                    return false;
                }
            }
            
            // For other payment methods, check the status
            if (payment.status?.toLowerCase() === 'successful' || 
                payment.status?.toLowerCase() === 'paid' || 
                payment.status?.toLowerCase() === 'completed') {
                console.log('✅ Payment verified as successful based on status');
                return true;
            }
            
            console.log('❌ Payment not verified as successful');
            return false;
        } catch (error) {
            console.error('Error verifying actual payment:', error);
            return false;
        }
    };

    // Function to check payment status
    const checkPaymentStatus = async (transactionReference) => {
        try {
            console.log('🔍 Checking payment status for:', transactionReference);
            
            // First, check if we have any smart bin payments in the general payments list
            const accountNo = useCorporateStore.getState().corporateInfo?.accountNo || '';
            const { data } = await api.get(`/corporate/payments?AccountNo=${accountNo}&page=1&limit=100`);
            
            if (data.succeeded || data.success) {
                const transactions = data.data?.transactions || data.transactions || [];
                console.log('🔍 Total transactions found:', transactions.length);
                
                // Look for payments related to smart bin applications with more specific criteria
                const smartBinPayments = transactions.filter(transaction => {
                    console.log('🔍 Checking transaction:', {
                        reference: transaction.transactionReference,
                        narration: transaction.narration,
                        paymentPurpose: transaction.paymentPurpose,
                        service: transaction.service,
                        meta: transaction.meta
                    });
                    
                    // More specific smart bin payment detection
                    const isSmartBinPayment = (
                        // Must have specific smart bin narration
                        (transaction.narration && transaction.narration.toLowerCase().includes('smart bin application payment')) ||
                        // Must have specific smart bin payment purpose
                        (transaction.paymentPurpose && transaction.paymentPurpose.toLowerCase().includes('smart bin application')) ||
                        // Must have specific smart bin service
                        (transaction.service && transaction.service.toLowerCase().includes('smart bin application')) ||
                        // Must have specific smart bin meta description
                        (transaction.meta?.description && transaction.meta.description.toLowerCase().includes('smart bin application'))
                    );
                    
                    if (isSmartBinPayment) {
                        console.log('✅ Found smart bin payment:', transaction.transactionReference);
                    }
                    
                    return isSmartBinPayment;
                });
                
                console.log('🔍 Smart bin payments found:', smartBinPayments.length);
                
                if (smartBinPayments.length > 0) {
                    // For each smart bin payment, verify if it was actually successful
                    for (const payment of smartBinPayments) {
                        console.log('🔍 Verifying smart bin payment:', payment.transactionReference);
                        const isActuallyPaid = await verifyActualPayment(payment);
                        if (isActuallyPaid) {
                            console.log('✅ Found verified successful payment for smart bin:', payment);
                            setPaymentStatus('paid');
                            return 'paid';
                        }
                    }
                    
                    // Check for pending payments
                    const pendingPayment = smartBinPayments.find(payment => 
                        payment.status?.toLowerCase() === 'pending'
                    );
                    
                    if (pendingPayment) {
                        console.log('⏳ Found pending smart bin payment');
                        setPaymentStatus('pending');
                        return 'pending';
                    } else {
                        // Check for failed payments
                        const failedPayment = smartBinPayments.find(payment => 
                            payment.status?.toLowerCase() === 'failed'
                        );
                        
                        if (failedPayment) {
                            console.log('❌ Found failed smart bin payment');
                            setPaymentStatus('failed');
                            return 'failed';
                        }
                    }
                }
                
                // If no smart bin payments found, check if there's a payment with matching transaction reference
                if (transactionReference) {
                    const matchingPayment = transactions.find(transaction => 
                        transaction.transactionReference === transactionReference
                    );
                    
                    if (matchingPayment) {
                        console.log('🔍 Found matching payment by reference:', matchingPayment);
                        // Verify this specific payment was actually successful
                        const isActuallyPaid = await verifyActualPayment(matchingPayment);
                        if (isActuallyPaid) {
                            console.log('✅ Matching payment verified as successful');
                            setPaymentStatus('paid');
                            return 'paid';
                        }
                        console.log('❌ Matching payment not verified as successful');
                        const status = matchingPayment.status?.toLowerCase() || 'unpaid';
                        setPaymentStatus(status);
                        return status;
                    }
                }
                
                console.log('🔍 No smart bin payments found for this application');
                setPaymentStatus('unpaid');
                return 'unpaid';
            } else {
                console.log('Failed to fetch payments:', data.message);
                setPaymentStatus('unpaid');
                return 'unpaid';
            }
        } catch (error) {
            console.error('Error checking payment status:', error);
            setPaymentStatus('unpaid');
            return 'unpaid';
        }
    };

    // Function to get payment status display
    const getPaymentStatusDisplay = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid':
            case 'successful':
            case 'completed':
                return {
                    text: 'Paid',
                    className: 'border-green-500 bg-green-100 text-green-900'
                };
            case 'pending':
                return {
                    text: 'Pending',
                    className: 'border-yellow-500 bg-yellow-100 text-yellow-900'
                };
            case 'failed':
                return {
                    text: 'Failed',
                    className: 'border-red-500 bg-red-100 text-red-900'
                };
            default:
                return {
                    text: 'Unpaid',
                    className: 'border-red-500 bg-red-100 text-red-900'
                };
        }
    };

    const fetchData = async () => {
        try {
            const { data } = await api.get(`/corporates/smart-bin/applications/${currentId}`);
            if (data.success || data.succeeded) {
                const appData = data.data?.data || data.data || {};
                const history = Array.isArray(appData.applicationHistory) ? appData.applicationHistory : [];

                const enhancedTrackingInfos = history.map((event, index, arr) => ({
                    ...event,
                    isCurrent: index === arr.length - 1,
                    isCompleted: event.status?.toLowerCase() === 'delivered' || event.status?.toLowerCase() === 'activated'
                }));

                setOrderDetails({
                    ...appData,
                    trackInfos: enhancedTrackingInfos
                });
                console.log("Application details:", appData);

                // Check payment status after fetching application details
                const ref = appData.transactionReference || appData.id;
                if (ref) {
                    await checkPaymentStatus(ref);
                }
            }
        } catch (error) {
            console.log("error", error);
        }
    }


    function formatDate(dateString) {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "N/A";

        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();

        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');

        const suffix =
            day % 10 === 1 && day !== 11 ? 'st' :
                day % 10 === 2 && day !== 12 ? 'nd' :
                    day % 10 === 3 && day !== 13 ? 'rd' : 'th';

        const period = hours >= 12 ? 'PM' : 'AM';
        const formattedHour = hours % 12 || 12;

        return `${day}${suffix} ${month} ${year} ${formattedHour}:${minutes}${period}`;
    }

    const formatDelivery = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "N/A";

        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        const suffix =
            day % 10 === 1 && day !== 11 ? 'st' :
                day % 10 === 2 && day !== 12 ? 'nd' :
                    day % 10 === 3 && day !== 13 ? 'rd' : 'th';

        return `${day}${suffix} ${month}, ${year}`;
    }

    // const trackOrder = () => {
    //     console.log("Tracking order:", orderIdInput || orderDetails.id);
    // };

    const getDiscriptions = (item) => {
        if (item.status === "DELIVERED") {
            const delivery = formatDelivery(item.date);
            return `${descriptions[item.status]} on ${delivery}`;
        }
        return descriptions[item.status];
    }

    const getStatusBadgeClasses = (status) => {
        switch (status?.toLowerCase()) {
            case 'activated': return 'bg-orange-100 text-orange-700';
            case 'delivered': return 'bg-green-100 text-green-700';
            case 'scheduled for delivery': return 'bg-purple-100 text-purple-700';
            case 'inventory': return 'bg-sky-100 text-sky-700';
            case 'pending': return 'bg-zinc-100 text-zinc-800';
            default: return 'bg-zinc-100 text-zinc-700';
        }
    };


    const getContentBoxClasses = (event) => {
        if (event.isCurrent) {
            return 'border border-green-700 bg-white';
        } else {
            return 'bg-white border border-zinc-200/80';
        }
    };

    return (

        <div className="flex sans h-screen max-w-screen">


            <Sidebar addkey="1" />

            <div className=" bg-zinc-100 min-h-screen   flex flex-col flex-1 overflow-y-auto  ">

                <Topbar />




                <div className='flex lg:flex-row flex-col items-center justify-between px-6 py-4 '>
                    <div className=' text-xl text-zinc-800 cursor-pointer' onClick={() => handleBack()}>
                        ← Back
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                const ref = orderDetails?.transactionReference || orderDetails?.id;
                                if (ref) checkPaymentStatus(ref);
                            }}
                            className="px-4 py-2 text-sm font-medium rounded-lg text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            Refresh Payment Status
                        </button>
                    </div>
                </div>
                <section className="max-w-5xl mx-auto my-20 px-4 sm:px-6 lg:px-8">
                    {/* <h1 className="text-3xl font-bold text-center text-zinc-900 mb-6">
                        {title}
                    </h1>

                    <div className="flex items-center gap-3 mb-16 max-w-md mx-auto border border-zinc-200 p-2 rounded-[16px] shadow-2xl shadow-zinc-200">
                        <input
                            type="text"
                            value={orderIdInput}
                            onChange={(e) => setOrderIdInput(e.target.value)}
                            placeholder={orderDetails.id}
                            className="flex-grow px-4 py-2.5 rounded-lg focus:ring-2 focus:outline-none focus:ring-green-700 focus:border-green-700 text-zinc-700"
                        />
                        <button
                            onClick={trackOrder}
                            className="px-7 py-2.5 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-150 ease-in-out"
                        >
                            Track Bin
                        </button>
                    </div> */}

                    <div className="flex items-center justify-center">
                        <div className="bg-white border border-zinc-800/10 rounded-[40px] p-7 mb-10 lg:w-2/3 hover:shadow-2xl shadow-zinc-200 transition duration-300 lg:min-w-[600px]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                <div className="flex items-center gap-3">

                                    <svg
                                        width="40"
                                        height="40"
                                        viewBox="0 0 40 40"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M5.2832 12.4L19.9998 20.9167L34.6165 12.45"
                                            stroke="#292D32"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M20 36.0167V20.9"
                                            stroke="#292D32"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M36.0167 21.3834V15.2834C36.0167 12.9834 34.3667 10.1834 32.35 9.06674L23.4501 4.13337C21.5501 3.06671 18.45 3.06671 16.55 4.13337L7.65003 9.06674C5.63337 10.1834 3.9834 12.9834 3.9834 15.2834V24.7168C3.9834 27.0168 5.63337 29.8167 7.65003 30.9334L16.55 35.8668C17.5 36.4001 18.75 36.6667 20 36.6667C21.25 36.6667 22.5001 36.4001 23.4501 35.8668"
                                            stroke="#292D32"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M32.0003 35.6667C34.9459 35.6667 37.3337 33.2789 37.3337 30.3334C37.3337 27.3878 34.9459 25 32.0003 25C29.0548 25 26.667 27.3878 26.667 30.3334C26.667 33.2789 29.0548 35.6667 32.0003 35.6667Z"
                                            stroke="#007836"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M38.3337 36.6667L36.667 35"
                                            stroke="#007836"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>

                                    <div>
                                        <p className="text-sm text-zinc-500 font-normal">Order ID</p>
                                        <p className="font-medium text-zinc-900">{orderDetails?.transactionReference || orderDetails?.id || 'N/A'}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-500 font-normal">Date Processed</p>
                                    <p className="font-medium text-zinc-900">{formatDate(orderDetails?.datePending || orderDetails?.createdAt || orderDetails?.updatedAt)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-500 font-normal">Customer</p>
                                    <p className="font-medium text-zinc-900">{orderDetails?.customerName || (orderDetails?._doc ? `${orderDetails._doc.firstName || ''} ${orderDetails._doc.lastName || ''}`.trim() : '') || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-500 font-normal">Destination</p>
                                    <p className="font-medium text-zinc-900 leading-snug">{orderDetails?.address || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-500 font-normal">Payment Status</p>
                                    <span className={`px-3 py-1 border rounded-full text-xs font-medium inline-block ${getPaymentStatusDisplay(paymentStatus).className}`}>
                                        {getPaymentStatusDisplay(paymentStatus).text}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-0">
                        {orderDetails?.trackInfos &&
                            orderDetails.trackInfos.length > 0 ? (
                            orderDetails.trackInfos.map((event, index) => (
                                <div
                                    key={index}
                                    className={`timeline-item flex gap-4 sm:gap-6 ${event.isCompleted ? 'completed' : ''}`}
                                >
                                    <div className="icon-line-column relative flex-shrink-0 w-12 flex justify-center pt-7">
                                        <div className={`timeline-icon-wrapper flex-shrink-0 w-6 h-6 p-1 flex items-center justify-center ${event.isCompleted ? 'bg-green-700' : 'bg-zinc-300'}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.496-12.744a.75.75 0 0 1 1.04-.208Z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                    </div>

                                    <div className={`flex-grow p-6 rounded-[32px] lg:min-w-[750px] mb-3 lg:pl-12 ${getContentBoxClasses(event)}`}>
                                        <div className="flex flex-col sm:flex-row items-start sm:justify-between">
                                            <div>
                                                <p className="font-medium text-zinc-700">{formatDate(event?.timestamp)}</p>
                                                <p className="text-xs text-zinc-400 mt-0.5">{event?.description}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium mt-2 sm:mt-0 whitespace-nowrap ${getStatusBadgeClasses(event.status)}`}>
                                                {event?.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )
                            : (
                                <p className="text-sm text-zinc-500">Loading tracking details...</p>
                            )}

                    </div>
                </section>




            </div>
        </div>
    );
}

export default AppManager;