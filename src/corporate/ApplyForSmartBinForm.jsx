import React, { useState, useEffect, useMemo, useRef, } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/CorporateTopBar';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import useCorporateStore from '../store/useCorporateStore';
import AlatPayButton from '../components/AlatPayButton';
import useAuthStore from '../store/authStore';
import SmartBinApplicationForm from '../components/CorporateSmartBinApplicationForm';

const SmartBinApplication = () => {
    // --- State ---
    const [applications, setApplications] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortColumn, setSortColumn] = useState('date');
    const [sortDirection, setSortDirection] = useState('dsc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [rowActionModal, setRowActionModal] = useState(false);
    const [currentDataId, setCurrentDataId] = useState("");
    const [viewApplicationModal, setViewApplicationModal] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [appDetails, setAppDetail] = useState({});
    const navigate = useNavigate();
    const [isApplyFormModalOpen, setIsApplyFormModalOpen] = useState(false);
    const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: string } | null
    const Corporate = useCorporateStore.getState().corporateInfo;
    const [pickUpAmount, setPickUpAmount] = useState(100);
    const [debitType, setDebitType] = useState(''); // 'wallet' or 'smartbin'
    const [isLoading, setIsLoading] = useState(false); // Loading state for fetchData


    // --- Modal states ---
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentAttemptInProgress, setPaymentAttemptInProgress] = useState(false);

    // --- Payment modal data ---
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(''); // Initialize as empty

    const paymentOptions = [
        { id: 'alatPay', text: 'Pay with Alat By Wema', icon: AlatIcon }, // Ensure AlatIcon is available
    ];


    const clearNotification = () => {
        setNotification(null);
    };



    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                clearNotification();
            }, 5000); // Hide after 5 seconds
            return () => clearTimeout(timer); // Cleanup timer on component unmount or notification change
        }
    }, [notification]);

    // PAYEMENT SUBMIT AFTER TOPUP
    //   const submitTopUpAfterPayment = async () => {
    //     const userId = useAuthStore.getState().user?.id;

    //     if (!topUpAmount || topUpAmount < 100 || topUpAmount > 1000000) {
    //       setNotification({ type: "error", message: "Enter a valid amount" });
    //       return;
    //     }

    //     try {
    //       const { data } = await api.post("/corporate/wallets/topup", {
    //         userId,
    //         walletAcctNo: "",
    //         amount: topUpAmount,
    //         channel: "ALATPay",
    //         narration: "",
    //       });

    //       console.log("TopUp Response:", data);

    //       if (data.succeeded || data.success) {
    //         // Get reference from response
    //         const reference =
    //           data?.reference ||
    //           data?.data?.transactionReference ||
    //           data?.data?.reference;

    //         if (reference) {
    //           console.log("Calling verifyAlatPayTransaction with:", reference);
    //           await verifyAlatPayTransaction(reference);
    //         } else {
    //           console.warn("No reference returned from top-up response");
    //         }

    //         setNotification({
    //           type: "success",
    //           message: data.message || "Top-up successful!",
    //         });

    //         fetchBalance(); // Refresh balance
    //         closeModal("topup"); // Close top-up modal
    //         openModal("success"); // Show success modal
    //       } else {
    //         setNotification({
    //           type: "error",
    //           message: data.message || "Error during TopUp!",
    //         });
    //       }
    //     } catch (error) {
    //       console.error(error);
    //       setNotification({ type: "error", message: "TopUp failed!" });
    //     }
    //   };

    const verifyAlatPayTransaction = async (reference) => {
        console.log(" verifyAlatPayTransaction CALLED with reference:", reference);
        console.log(" Reference type:", typeof reference);
        console.log(" Reference length:", reference?.length);

        try {
            console.log(" Making API call to verify AlatPay transaction");
            console.log(" API endpoint:", `/api/v1/wallets/mock-verify?reference=${reference}`);

            const { data } = await api.get(
                `/api/v1/wallets/mock-verify?reference=${reference}`
            );
            console.log(" AlatPay verification API response:", data);
            console.log(" Response success status:", data?.success || data?.succeeded);

            if (data?.success || data?.succeeded) {
                console.log(" AlatPay verification SUCCESSFUL");
                setNotification({
                    type: "success",
                    message: "Payment verified successfully!",
                });
            } else {
                console.log(" AlatPay verification FAILED");
                console.log(" Error message:", data?.message);
                setNotification({
                    type: "error",
                    message: data?.message || "Verification failed.",
                });
            }

            return data; //  return it if needed
        } catch (error) {
            console.error(" AlatPay verification API ERROR:", error);
            console.error(" Error details:", {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            setNotification({
                type: "error",
                message: "Payment verification failed.",
            });
            return null; //  indicate failure
        }
    };

    const fetchData = async () => {
        try {
            setIsLoading(true); // Start loading
            const { data } = await api.get(`/corporates/smart-bin/applications?page=${currentPage}&limit=${itemsPerPage}`);
            if (data.success) {
                const newData = data.data.map((item, index) => ({
                    id: item._id,
                    sn: index + 1 + (currentPage - 1) * itemsPerPage,
                    orderId: item.transactionReference,
                    binType: item.binType,
                    branch: item.branch,
                    date: item.createdAt?.slice(0, 10),
                    address: item.address,
                    status: item.applicationHistory[item.applicationHistory.length - 1].status,
                    deliveredDate: item?.deliveredDate,
                    deliveredBy: item?.deliveredBy,
                    approvedDate: item?.approvedDate,
                    paymentStatus: item.paymentStatus || 'unpaid', // Add payment status
                    transactionReference: item.transactionReference, // Add for payment checking
                }));

                // Check payment status for each application
                const applicationsWithPaymentStatus = await Promise.all(
                    newData.map(async (app) => {
                        const paymentStatus = await checkPaymentStatus(app.transactionReference);
                        return {
                            ...app,
                            paymentStatus: paymentStatus
                        };
                    })
                );

                setApplications(applicationsWithPaymentStatus);
                
                // Extract pagination data from meta.paging structure
                const paginationData = data.meta?.paging;
                if (paginationData) {
                    setTotalPages(paginationData.pages);
                    setTotalItems(paginationData.total);
                } else {
                    // Fallback to old structure if meta.paging doesn't exist
                    setTotalPages(data.data.totalPages);
                    setTotalItems(data.data.totalCount);
                }
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false); // Stop loading regardless of success or failure
        }
    }

    // Function to check payment status for a specific application
    const checkPaymentStatus = async (transactionReference) => {
        try {
            console.log('🔍 Checking payment status for:', transactionReference);
            
            // First, check if we have any smart bin payments in the general payments list
            const { data } = await api.get(`/corporate/payments?AccountNo=${useCorporateStore.getState().corporateInfo.accountNo}&page=1&limit=100`);
            
            if (data.succeeded || data.success) {
                const transactions = data.data?.transactions || data.transactions || [];
                
                // First, check if there's a payment with matching transaction reference
                const matchingPayment = transactions.find(transaction => 
                    transaction.transactionReference === transactionReference
                );
                
                if (matchingPayment) {
                    console.log('Found matching payment for this application:', matchingPayment);
                    // Verify this specific payment was actually successful
                    const isActuallyPaid = await verifyActualPayment(matchingPayment);
                    if (isActuallyPaid) {
                        return 'paid';
                    }
                    return matchingPayment.status?.toLowerCase() || 'unpaid';
                }
                
                // If no matching payment found, check for smart bin payments that might be related
                // but only if we have a specific way to link them to this application
                const smartBinPayments = transactions.filter(transaction => {
                    // Check if the transaction is related to smart bin application
                    const isSmartBinPayment = (
                        (transaction.narration && transaction.narration.toLowerCase().includes('smart bin application payment')) ||
                        (transaction.paymentPurpose && transaction.paymentPurpose.toLowerCase().includes('smart bin application')) ||
                        (transaction.meta?.description && transaction.meta.description.toLowerCase().includes('smart bin')) ||
                        (transaction.service && transaction.service.toLowerCase().includes('smart bin'))
                    );
                    
                    return isSmartBinPayment;
                });
                
                if (smartBinPayments.length > 0) {
                    // Only consider these payments if we can verify they're related to this specific application
                    // For now, we'll be conservative and not assume any smart bin payment is for this application
                    console.log('Found smart bin payments but cannot verify they are for this specific application');
                }
                
                console.log('No payments found for this smart bin application');
                return 'unpaid';
            } else {
                console.log('Failed to fetch payments:', data.message);
                return 'unpaid';
            }
        } catch (error) {
            console.error('Error checking payment status:', error);
            return 'unpaid';
        }
    };

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

    // Function to verify if payment was actually made (more thorough check)
    // const verifyPaymentWasMade = async (transactionReference) => {
    //     try {
    //         console.log('🔍 Verifying if payment was actually made for:', transactionReference);
            
    //         const { data } = await api.get(`/corporate/payments?AccountNo=${useCorporateStore.getState().corporateInfo.accountNo}&page=1&limit=100`);
            
    //         if (data.succeeded || data.success) {
    //             const transactions = data.data?.transactions || data.transactions || [];
                
    //             // Look for any successful payment related to smart bin
    //             const smartBinPayments = transactions.filter(transaction => {
    //                 const isSmartBinRelated = (
    //                     (transaction.narration && transaction.narration.toLowerCase().includes('smart bin application payment')) ||
    //                     (transaction.paymentPurpose && transaction.paymentPurpose.toLowerCase().includes('smart bin application')) ||
    //                     (transaction.meta?.description && transaction.meta.description.toLowerCase().includes('smart bin')) ||
    //                     (transaction.service && transaction.service.toLowerCase().includes('smart bin'))
    //                 );
                    
    //                 return isSmartBinRelated;
    //             });
                
    //             // Verify each smart bin payment to see if any was actually successful
    //             for (const payment of smartBinPayments) {
    //                 const isActuallyPaid = await verifyActualPayment(payment);
    //                 if (isActuallyPaid) {
    //                     console.log('✅ Payment verification successful:', payment);
    //                     return true;
    //                 }
    //             }
                
    //             // If no smart bin payments found, check if there's a payment with matching transaction reference
    //             const matchingPayment = transactions.find(transaction => 
    //                 transaction.transactionReference === transactionReference
    //             );
                
    //             if (matchingPayment) {
    //                 const isActuallyPaid = await verifyActualPayment(matchingPayment);
    //                 if (isActuallyPaid) {
    //                     console.log('✅ Matching payment verified as successful:', matchingPayment);
    //                     return true;
    //                 }
    //             }
                
    //             console.log('❌ No successful payment found for smart bin application');
    //             return false;
    //         }
            
    //         return false;
    //     } catch (error) {
    //         console.error('Error verifying payment:', error);
    //         return false;
    //     }
    // };

    // Function to get payment status display
    const getPaymentStatusDisplay = (paymentStatus) => {
        switch (paymentStatus?.toLowerCase()) {
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

    useEffect(() => {
        fetchData();
    }, [currentPage]);

    useEffect(() => {
        const details = applications.find((item) => item.id === currentDataId);
        setAppDetail(details);
    }, [currentDataId, applications])

    // --- Computed Properties ---
    const filteredApplications = useMemo(() => {
        if (!searchQuery) {
            return applications;
        }
        const lowerQuery = searchQuery.toLowerCase();
        return applications.filter(app => {
            return (
                app.orderId.toLowerCase().includes(lowerQuery) ||
                app.address.toLowerCase().includes(lowerQuery) ||
                app.status.toLowerCase().includes(lowerQuery) ||
                (app.date).includes(lowerQuery)
            );
        });
    }, [applications, searchQuery]);

    const sortedApplications = useMemo(() => {
        return [...filteredApplications].sort((a, b) => {
            let valA = a[sortColumn];
            let valB = b[sortColumn];

            if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }

            if (sortColumn === 'date') {
                valA = new Date(valA);
                valB = new Date(valB);
            }

            let comparison = 0;
            if (valA > valB) {
                comparison = 1;
            } else if (valA < valB) {
                comparison = -1;
            }

            return sortDirection === 'dsc' ? (comparison * -1) : comparison;
        });
    }, [filteredApplications, sortColumn, sortDirection]);


    // --- Methods ---
    const sortBy = (columnKey) => {
        if (sortColumn === columnKey) {
            setSortDirection(sortDirection === 'asc' ? 'dsc' : 'asc');
        } else {
            setSortColumn(columnKey);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    const sortIcon = (columnKey) => {
        if (sortColumn !== columnKey) return '↕';
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    const changePage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-zinc-100 text-zinc-800 border-zinc-300';
            case 'approved':
                return 'bg-sky-100 text-sky-800 border-sky-300';
            case 'delivered':
                return 'bg-green-100 text-green-800 border-green-300';
            default:
                return 'bg-zinc-100 text-zinc-800 border-zinc-300';
        }
    };

    // const formatDate = (dateString) => {
    //     if (!dateString) return '';
    //     const parts = dateString.split('-');
    //     if (parts.length === 3) {
    //         return `${parts[2]}-${parts[1]}-${parts[0].slice(-2)}`;
    //     }
    //     return dateString;
    // };

    // Placeholder Action Methods
    const filterData = () => {
        console.log("Filter action triggered");
        setNotification({ type: 'error', message: 'Coming soon..' });
    };

    const exportData = () => {
        console.log("Export action triggered");
        setNotification({ type: 'error', message: 'Coming soon..' });
    };

    const applyAction = () => {
        setIsApplyFormModalOpen(true); // <-- Open the new modal
    };

    const handleRowAction = (appId) => {
        setCurrentDataId(appId);
        console.log("Row action triggered for ID:", appId);
        setRowActionModal(true);
    };

    const handleTrack = () => {
        localStorage.setItem("appId", currentDataId);
        navigate("/appmanager")
    }
    const modalRef = useRef();

    const handleBackgroundClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            setRowActionModal(false);
        }
    };


    const closeApplyFormModal = () => {
        setIsApplyFormModalOpen(false);
    };



    // Handler called by the SmartBinApplicationForm when submission is successful
    const handleApplicationSubmitSuccess = (submittedApplicationData) => {
        console.log("Parent received successful submission:", submittedApplicationData);
        // Show success notification
        setNotification({ type: 'success', message: 'Smart Bin application submitted successfully!' });
        // Refresh the list of applications to show the new one
        closeApplyFormModal();
        openModal('payment');
        fetchData();
        // Close the form modal (handled by the child component calling onClose)
        // Optionally update local state immediately if needed (optimistic update)
    };

    //  const fetchPickUpAmount = async () => {
    //         try {
    //             const response = await api.get("/Wallet/fetch-amount?paymentType=waste");
    //             console.log("Response from fetch-amount:", response);
    //             const data = response.data.data;
    //             if (response.data.succeeded) {
    //                 setPickUpAmount(data.amountToDebit);
    //                 setDebitType(data.debitType);
    //                 console.log(debitType, " debit type");
    //                 console.log("Smart bin amount fetched:", data.amountToDebit);
    //             } else {
    //                 console.error("Failed to fetch smart bin amount:", response.message);
    //             }
    //         } catch (error) {
    //             console.error("Error fetching smart bin amount:", error);
    //         }
    //     };

    // useEffect(() => {
    //     fetchPickUpAmount();
    // }, []);
    // --- Modal Handlers ---

    const openModal = (modalName) => {
        if (modalName === 'payment') {
            setIsPaymentModalOpen(true);
            setSelectedPaymentMethod(''); // Reset payment method when modal opens
            // Don't set payment attempt flag here - only set it when user actually selects a payment method
        }
    };

    const closeModal = (modalName) => {
        if (modalName === 'payment') {
            setIsPaymentModalOpen(false);
            setSelectedPaymentMethod(''); // Reset payment method when modal closes
            
            // Only refresh data if there was a payment attempt that wasn't completed
            if (paymentAttemptInProgress) {
                setPaymentAttemptInProgress(false);
                // Only refresh if we're not already in the middle of a payment process
                // This prevents continuous refreshing
                console.log('Payment modal closed without completion, ensuring unpaid status');
            }
        }
    };

    // Function to handle payment method selection
    const handlePaymentMethodSelection = (method) => {
        setSelectedPaymentMethod(method);
        // Only set payment attempt flag when user actually selects a payment method
        if (method) {
            setPaymentAttemptInProgress(true);
        }
    };

    // --- Action Handlers ---
    // Function to submit Smart Bin application after payment
    const SubmitPickupRequest = async ({ ref, amount, channel }) => {
        try {
            console.log("Payment successful, Smart Bin application already submitted");

            // The Smart Bin application was already submitted by the form
            // Just show success and refresh the data
            setNotification({
                type: 'success',
                message: 'Payment successful! Smart Bin application submitted.'
            });

            // Reset payment attempt flag since payment was successful
            setPaymentAttemptInProgress(false);

            // Close the payment modal first
            closeModal('payment');

            // Add a delay to allow backend to process the payment
            setTimeout(async () => {
                console.log("Refreshing data after payment delay...");
                await fetchData();
            }, 2000); // 2 second delay

            return true;
        } catch (error) {
            console.error("Error in payment success flow:", error);
            setNotification({
                type: 'error',
                message: 'Error processing payment success'
            });
            return false;
        }
    };

    // Function to handle AlatPay payment for Smart Bin (similar to Wallet.jsx submitTopUpAfterPayment)
    const submitSmartBinAlatPay = async (amount) => {
        const userId = useAuthStore.getState().user?.id;

        if (!amount || amount < 100) {
            setNotification({ type: "error", message: "Enter a valid amount" });
            return;
        }

        try {
            console.log("🔍 Submitting Smart Bin AlatPay payment with amount:", amount);

            // Call backend to initiate AlatPay payment (similar to topup endpoint)
            const { data } = await api.post("/corporate/wallets/charge", {
                userId,
                amount: amount,
                channel: "ALATPay",
                narration: "Smart Bin Application Payment",
                paymentPurpose: "Smart Bin Application"
            });

            console.log("🔍 Smart Bin Wallet Charge AlatPay Response:", data);

            if (data.succeeded || data.success) {
                // Get reference from backend response (like in Wallet.jsx)
                const reference =
                    data?.reference ||
                    data?.data?.transactionReference ||
                    data?.data?.reference;

                if (reference) {
                    console.log("🔍 Backend provided reference:", reference);
                    console.log("�� Calling verifyAlatPayTransaction with:", reference);
                    const verifyResult = await verifyAlatPayTransaction(reference);

                    if (verifyResult?.success || verifyResult?.succeeded) {
                        console.log(" AlatPay verification successful, proceeding with Smart Bin application");
                        // Proceed with Smart Bin application
                        await SubmitPickupRequest({ ref: reference, amount, channel: "alatPay" });
                    } else {
                        console.error(" AlatPay verification failed");
                        setNotification({ type: "error", message: "AlatPay verification failed" });
                        // Reset payment attempt flag since payment failed
                        setPaymentAttemptInProgress(false);
                    }
                } else {
                    console.warn(" No reference returned from backend response");
                    setNotification({ type: "error", message: "No payment reference received" });
                    // Reset payment attempt flag since payment failed
                    setPaymentAttemptInProgress(false);
                }
            } else {
                setNotification({
                    type: "error",
                    message: data.message || "Error during AlatPay payment!",
                });
                // Reset payment attempt flag since payment failed
                setPaymentAttemptInProgress(false);
            }
        } catch (error) {
            console.error(" Error in submitSmartBinAlatPay:", error);
            setNotification({ type: "error", message: "AlatPay payment failed!" });
            // Reset payment attempt flag since payment failed
            setPaymentAttemptInProgress(false);
        }
    };

    // --- Action Handlers ---
    const handlePayment = async (response) => {
        console.log("🔍 handlePayment called with response:", response);
        let ref, channel;
        let amount = pickUpAmount; // Use the fetched amount
        if (selectedPaymentMethod === 'wallet') {
            ref = response.reference;
            channel = "wallet";
            console.log("🔍 Processing wallet payment with ref:", ref);
        }
        else if (selectedPaymentMethod === 'alatPay') {
            // AlatPay is now handled by submitSmartBinAlatPay function
            console.log("🔍 AlatPay payment handled by submitSmartBinAlatPay");
            return;
        }
        console.log("🔍 Final reference and channel:", { ref, channel, amount });

        if (ref !== '' && amount !== '' && channel !== '') {
            if (!selectedPaymentMethod) {
                setNotification({ type: 'error', message: "Select a payment method" });
                return;
            }
            console.log("🔍 Processing Payment with:", selectedPaymentMethod);

            console.log("🔍 Calling SubmitPickupRequest with:", { ref, amount, channel });
            await SubmitPickupRequest({ ref, amount, channel }).finally(() => {
                console.log("SubmitPickupRequest completed");
            });
            closeModal('payment');
        } else {
            console.error(" Payment response missing required fields:", { ref, amount, channel });
            setNotification({ type: 'error', message: "Error submitting" });
            // handleBack(); // Removed handleBack call here, as it's tied to the button click
        }
    };

    // handleBack removed as it's now handled by the button directly

    const handlePaymentWithWallet = async () => {
        try {
            const response = await api.post("/corporate/wallets/charge", {
                userId: useAuthStore.getState().token,
                drAccountNo: Corporate.accountNo,
                amount: pickUpAmount,
                narration: "Smart Bin Application Payment",
                paymentPurpose: "Smart Bin Application"
            });
            const data = response.data;
            console.log("Response from debit-wallet:", data);
            if (data.succeeded || data.success) {
                console.log("Wallet payment successful:", data.success, "and message:", data.message);

                // Extract reference from response message or use a default
                let successRef = data.reference || data.data?.reference;

                // If no reference in response, try to extract from message
                if (!successRef && data.message) {
                    let successMessage = data.message.split('|');
                    if (successMessage.length > 1) {
                        successRef = successMessage[1];
                    }
                }

                // If still no reference, create a timestamp-based one
                if (!successRef) {
                    successRef = `WALLET_${Date.now()}`;
                }

                // Call handlePayment with wallet response
                await handlePayment({
                    reference: successRef,
                    channel: "wallet",
                    data: { reference: successRef }
                });

                setNotification({ type: 'success', message: 'Payment successful!' });
            } else {
                console.error("Wallet payment failed:", data.message);
                setNotification({ type: 'error', message: data.message || "Error processing wallet payment" });
                // Reset payment attempt flag since payment failed
                setPaymentAttemptInProgress(false);
            }
        }
        catch (error) {
            console.error("Error processing wallet payment:", error);
            setNotification({ type: 'error', message: "Error processing wallet payment" });
            // Reset payment attempt flag since payment failed
            setPaymentAttemptInProgress(false);
        }
    };

    // Function to cancel/delete smart bin application
    const handleCancelApplication = async (applicationId) => {
        // Show confirmation dialog
        const isConfirmed = window.confirm(
            'Are you sure you want to cancel this Smart Bin application? This action cannot be undone.'
        );
        
        if (!isConfirmed) {
            return;
        }
        
        try {
            console.log('Cancelling smart bin application:', applicationId);
            
            const { data } = await api.delete(`/corporates/smart-bin/applications/${applicationId}`);
            
            if (data.success || data.succeeded) {
                setNotification({
                    type: 'success',
                    message: 'Smart Bin application cancelled successfully!'
                });
                
                // Refresh the applications list
                await fetchData();
                
                // Close the action modal
                setRowActionModal(false);
            } else {
                setNotification({
                    type: 'error',
                    message: data.message || 'Failed to cancel application'
                });
            }
        } catch (error) {
            console.error('Error cancelling application:', error);
            setNotification({
                type: 'error',
                message: 'Error cancelling application. Please try again.'
            });
        }
    };

    // Function to retry payment for failed applications
    const handleRetryPayment = async (applicationId) => {
        try {
            console.log('Retrying payment for application:', applicationId);
            
            // Close the action modal
            setRowActionModal(false);
            
            // Set the current application for payment
            setCurrentDataId(applicationId);
            
            // Open payment modal
            openModal('payment');
            
        } catch (error) {
            console.error('Error retrying payment:', error);
            setNotification({
                type: 'error',
                message: 'Error retrying payment. Please try again.'
            });
        }
    };

    // Function to handle pay now action
    const handlePayNow = async (applicationId) => {
        try {
            console.log('Initiating payment for application:', applicationId);
            
            // Close the action modal
            setRowActionModal(false);
            
            // Set the current application for payment
            setCurrentDataId(applicationId);
            
            // Open payment modal
            openModal('payment');
            
        } catch (error) {
            console.error('Error initiating payment:', error);
            setNotification({
                type: 'error',
                message: 'Error initiating payment. Please try again.'
            });
        }
    };


    return (


        <div className="flex sans h-screen max-w-screen">

            <Sidebar addkey="1" />
            <div className=" bg-zinc-100 min-h-screen   flex flex-col flex-1 overflow-y-auto  ">
                <Topbar />

                <div className="bg-zinc-100 font-sans">
                    <main className="p-4 md:p-10">
                        <div className="p-5 md:p-8 rounded-lg w-full  mx-auto">
                            {/* Header */}
                            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-xl md:text-2xl font-semibold text-zinc-800">Applications</h1>
                                    <span className="bg-green-700 text-green-50 text-xs font-semibold px-2.5 py-2 rounded-full">
                                        {applications.length}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <button
                                        onClick={applyAction}
                                        type="button"
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-green-700 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                        </svg>
                                        Apply for Smart Bin
                                    </button>
                                </div>
                            </div>

                            {/* Search and Actions */}
                            <div className="flex lg:flex-row flex-col justify-between gap-4 mb-6">
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 text-green-700 flex items-center pl-3">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                        </svg>
                                    </span>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search members..."
                                        className="w-full lg:w-[24rem] pl-10 pr-4 py-2 border border-zinc-300 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <button
                                        onClick={filterData}
                                        type="button"
                                        className="px-4 lg:mx-4 py-2 border border-zinc-300 text-sm font-medium rounded-xl text-zinc-700 bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        Filter
                                    </button>
                                    <button
                                        onClick={exportData}
                                        type="button"
                                        className="px-4 py-2 mx-4 border border-zinc-300 lg:mx-0 text-sm font-medium rounded-xl text-zinc-700 bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        Export
                                    </button>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="table-container border border-zinc-200 rounded-2xl">
                                <table className="w-full min-w-[768px] text-sm text-left text-zinc-600">
                                    <thead className="font-light text-zinc-700 uppercase bg-white">
                                        <tr>
                                            <th scope="col" className="px-4 py-3 w-24" role="button" onClick={() => sortBy('sn')}>
                                                <div className="flex items-center justify-between">
                                                    S/N <span className={`sort-icon ${sortColumn === 'sn' ? 'active' : ''}`}>
                                                        {sortIcon('sn')}
                                                    </span>
                                                </div>
                                            </th>
                                            <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('orderId')}>
                                                <div className="flex items-center justify-between">
                                                    Order ID <span className={`sort-icon ${sortColumn === 'orderId' ? 'active' : ''}`}>
                                                        {sortIcon('orderId')}
                                                    </span>
                                                </div>
                                            </th>
                                            <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('date')}>
                                                <div className="flex items-center justify-between">
                                                    Date <span className={`sort-icon ${sortColumn === 'date' ? 'active' : ''}`}>
                                                        {sortIcon('date')}
                                                    </span>
                                                </div>
                                            </th>
                                            <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('binType')}>
                                                <div className="flex items-center justify-between">
                                                    Bin Type <span className={`sort-icon ${sortColumn === 'bintype' ? 'active' : ''}`}>
                                                        {sortIcon('bintype')}
                                                    </span>
                                                </div>
                                            </th>
                                            <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('branch')}>
                                                <div className="flex items-center justify-between">
                                                    Branch <span className={`sort-icon ${sortColumn === 'branch' ? 'active' : ''}`}>
                                                        {sortIcon('branch')}
                                                    </span>
                                                </div>
                                            </th>
                                            <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('address')}>
                                                <div className="flex items-center justify-between">
                                                    Address <span className={`sort-icon ${sortColumn === 'address' ? 'active' : ''}`}>
                                                        {sortIcon('address')}
                                                    </span>
                                                </div>
                                            </th>
                                            <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('status')}>
                                                <div className="flex items-center justify-between">
                                                    Status <span className={`sort-icon ${sortColumn === 'status' ? 'active' : ''}`}>
                                                        {sortIcon('status')}
                                                    </span>
                                                </div>
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-center">Payment</th>
                                            <th scope="col" className="px-4 py-3 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan="9" className="text-center py-10">
                                                    <div className="flex items-center justify-center">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
                                                        <span className="ml-3 text-zinc-500">Loading applications...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : totalItems === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center py-10 text-zinc-500">No applications found.</td>
                                            </tr>
                                        ) : (
                                            sortedApplications.map(app => (
                                                <tr key={app.id} className="bg-white border-b border-zinc-200 hover:bg-zinc-50 lg:h-20">
                                                    <td className="px-4 py-3 font-medium text-zinc-900">{app.sn}</td>
                                                    <td className="px-4 py-3 font-medium text-zinc-900 whitespace-nowrap">{app.orderId}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">{(app.date)}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">{(app.binType)}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">{(app.branch)}</td>

                                                    <td className="px-4 py-3">{app.address}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className={`px-3 py-1 border rounded-full text-xs font-medium inline-block ${getStatusClass(app.status)}`}>
                                                            {app.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className={`px-3 py-1 border rounded-full text-xs font-medium inline-block ${getPaymentStatusDisplay(app.paymentStatus).className}`}>
                                                            {getPaymentStatusDisplay(app.paymentStatus).text}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button
                                                            onClick={() => handleRowAction(app.id)}
                                                            type="button"
                                                            className="p-1 text-zinc-500 hover:text-zinc-700"
                                                        >
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
                                <span className="text-sm text-zinc-700">
                                    Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
                                    <span className="mx-2">|</span>
                                    Total <span className="font-semibold">{totalItems}</span> items
                                </span>
                                <div className="inline-flex rounded-md shadow-sm -space-x-px" role="group">
                                    <button
                                        onClick={() => changePage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        type="button"
                                        className="px-3 mr-4 py-2 text-sm font-medium text-zinc-500 bg-white border border-zinc-300 hover:bg-zinc-100 focus:z-10 focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => changePage(currentPage + 1)}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        type="button"
                                        className="px-3 py-2 text-sm font-medium text-zinc-50 bg-green-700 border border-zinc-300 hover:bg-green-600 focus:z-10 focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>

                {rowActionModal && appDetails && (
                    <div
                        onClick={handleBackgroundClick}
                        className="fixed inset-0 bg-black/40  z-50 font-sans flex lg:justify-end justify-center items-center lg:items-center min-h-screen overflow-y-auto p-4"
                    >
                        <div
                            ref={modalRef}
                            onClick={(e) => e.stopPropagation()}
                            className=" max-w-4xl p-4 lg:mr-14 bg-white flex rounded-xl shadow-xl flex-col"
                        >
                            <p onClick={() => setViewApplicationModal(true)} className='p-2 cursor-pointer hover:bg-gray-100 rounded'>View</p>
                            <p className='p-2 cursor-pointer hover:bg-gray-100 rounded' onClick={() => handleTrack()}>Track application</p>

                            {/* Show Cancel and Pay Now only for unpaid applications */}
                            {(appDetails?.paymentStatus === 'unpaid' || !appDetails?.paymentStatus) && (
                                <>
                                    <p 
                                        className='text-red-600 p-2 cursor-pointer hover:bg-red-50 rounded' 
                                        onClick={() => handleCancelApplication(currentDataId)}
                                    >
                                        Cancel Application
                                    </p>
                                    <p 
                                        className='text-green-700 p-2 cursor-pointer hover:bg-green-50 rounded' 
                                        onClick={() => handlePayNow(currentDataId)}
                                    >
                                        Pay Now
                                    </p>
                                </>
                            )}

                            {/* Show Retry Payment for failed payments */}
                            {appDetails?.paymentStatus === 'failed' && (
                                <p 
                                    className='text-blue-600 p-2 cursor-pointer hover:bg-blue-50 rounded' 
                                    onClick={() => handleRetryPayment(currentDataId)}
                                >
                                    Retry Payment
                                </p>
                            )}

                            {/* Show payment status for paid applications */}
                            {appDetails?.paymentStatus === 'paid' && (
                                <p className='text-green-600 p-2 cursor-pointer bg-green-50 rounded font-medium'>
                                    ✓ Payment Completed
                                </p>
                            )}

                            {/* Show pending status for pending payments */}
                            {appDetails?.paymentStatus === 'pending' && (
                                <p className='text-yellow-600 p-2 cursor-pointer bg-yellow-50 rounded font-medium'>
                                    ⏳ Payment Pending
                                </p>
                            )}

                        </div>
                    </div>
                )}

                {viewApplicationModal && appDetails && (
                    <div
                        className="fixed inset-0 bg-black/20 z-50 font-sans flex lg:justify-end justify-center items-center lg:items-center min-h-screen overflow-y-auto"
                    >

                        <aside
                            className={`fixed top-0 right-0 z-50 lg:h-screen h-full lg:w-[550px] w-full bg-white flex flex-col transform transition-transform delay-200 ease-in-out duration-1000 ${viewApplicationModal ? 'translate-x-0' : 'translate-x-full'
                                }`}
                        >
                            <div className="p-6 border-b border-zinc-200 ">
                                {/* Top Title Row */}
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-semibold text-zinc-800">Application details</h2>
                                    <button
                                        onClick={() => { setViewApplicationModal(false), setRowActionModal(false) }}
                                        className="text-zinc-500 hover:text-black text-2xl"
                                    >
                                        &times;
                                    </button>
                                </div>
                            </div>

                            {/* Details Section */}
                            <div className="p-6 flex flex-col gap-6">
                                {/* OrderID */}
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">OrderID</span>
                                    <span className="font-semibold text-zinc-800">{appDetails?.orderId}</span>
                                </div>

                                {/* Date */}
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Date</span>
                                    <span className="font-semibold text-zinc-800">{appDetails?.date}</span>
                                </div>

                                {/* Address */}
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Address</span>
                                    <span className="font-semibold text-zinc-800 text-right">
                                        {appDetails?.address}
                                    </span>
                                </div>

                                {/* Status */}
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-500">Status</span>
                                    <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-300 rounded-full text-sm">
                                        {appDetails?.status}
                                    </span>
                                </div>

                                {
                                    appDetails?.status == 'APPROVED' &&
                                    (
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">Approval Date:</span>
                                            <span className="font-semibold text-zinc-800">{appDetails?.approvedDate}</span>
                                        </div>
                                    )
                                }
                                {
                                    appDetails?.status == 'DELIVERED' &&
                                    (
                                        <>
                                            <div className="flex justify-between">
                                                <span className="text-zinc-500">Delivered on:</span>
                                                <span className="font-semibold text-zinc-800">{appDetails?.deliveredDate}</span>
                                            </div>

                                            {/* Delivered by */}
                                            <div className="flex justify-between">
                                                <span className="text-zinc-500">Delivered by</span>
                                                <span className="font-semibold text-zinc-800">{appDetails?.deliveredBy}</span>
                                            </div>
                                        </>
                                    )
                                }
                            </div>
                        </aside>

                    </div>
                )}
                {isApplyFormModalOpen && ( // <-- Use the new state
                    <div className="fixed inset-0  bg-zinc-950/70 bg-opacity-50 backdrop-blur-lg  z-50 font-sans flex lg:items-center justify-center min-h-screen overflow-y-auto p-4">
                        <main className="w-full max-w-7xl bg-white">
                            {/* Pass props to the new component */}
                            <SmartBinApplicationForm
                                onClose={closeApplyFormModal} // Tell it how to close itself
                                onSubmitSuccess={handleApplicationSubmitSuccess} // Tell it how to notify success
                            />
                        </main>
                    </div>
                )}


            </div>

            {notification && (
                <div
                    // Using fixed positioning to overlay on the page
                    className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg max-w-sm z-50 ${notification.type === 'success' ? 'bg-green-100 border border-green-400 text-green-800' : 'bg-red-100 border border-red-400 text-red-800'
                        }`}
                    // ARIA roles for accessibility
                    role={notification.type === 'error' ? 'alert' : 'status'}
                >
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{notification.message}</p>
                        {/* Close button for the notification */}
                        <button
                            onClick={clearNotification}
                            className={`ml-4 text-xl font-semibold leading-none ${notification.type === 'success' ? 'text-green-800 hover:text-green-900' : 'text-red-800 hover:text-red-900'} focus:outline-none`}
                            aria-label="Close notification"
                        >
                            &times; {/* Unicode multiplication sign for 'x' */}
                        </button>
                    </div>
                </div>
            )}

            {isPaymentModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content lg:p-8">
                        <div className="flex justify-between items-center py-6 mx-8 border-b border-zinc-200">
                            <h3 className="text-lg font-semibold text-zinc-800">Select Payment Method</h3>
                            <button
                                onClick={() => closeModal('payment')}
                                aria-label="Close"
                                className="text-zinc-700 hover:text-red-600"
                            >
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="py-6 space-y-4">
                            <label className="px-6 py-4 rounded-lg flex items-center gap-4">
                                <WalletIcon />
                                <span className="text-sm font-medium text-zinc-800 flex-grow">
                                    {`Pay from wallet (${pickUpAmount})`}
                                </span>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    id="wallet"
                                    value="wallet"
                                    checked={selectedPaymentMethod === 'wallet'}
                                    onChange={() => handlePaymentMethodSelection('wallet')}
                                    className="custom-radio"
                                />
                            </label>
                            {paymentOptions.map((option) => {
                                const Icon = option.icon;
                                return (
                                    <label
                                        key={option.id}
                                        className="px-6 py-4 rounded-lg flex items-center gap-4"
                                    >
                                        <Icon />
                                        <span className="text-sm font-medium text-zinc-800 flex-grow">
                                            {option.text}
                                        </span>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            id={`payment_${option.id}`}
                                            value={option.id}
                                            checked={selectedPaymentMethod === option.id}
                                            onChange={() => handlePaymentMethodSelection(option.id)}
                                            className="custom-radio"
                                        />
                                    </label>
                                );
                            })}
                        </div>
                        <div className="px-6 py-4 flex flex-col items-center gap-3">
                            {!selectedPaymentMethod ? (
                                <p className="text-sm text-zinc-500">Please select a payment method</p>
                            ) : selectedPaymentMethod === 'alatPay' ? (
                                <AlatPayButton
                                    //all details provided by the api request in the component
                                    metadata={{
                                        accountNo:
                                            useCorporateStore.getState().corporateInfo.accountNo,
                                    }}
                                    customerName={
                                        useCorporateStore.getState().corporateInfo.companyName ||
                                        "Corporate User"
                                    }
                                    email={
                                        useAuthStore.getState().email || "manifestomixx@gmail.com"
                                    }
                                    redirectUrl="https://smartbin-frontend-staging.up.railway.app/payment-success"
                                    amount={pickUpAmount}
                                    onTransaction={(response) => {
                                        console.log(" AlatPay onTransaction called with response:", response);
                                        // console.log(" Full response structure:", JSON.stringify(response, null, 2));

                                        // Call the new function that handles backend integration
                                        submitSmartBinAlatPay(pickUpAmount);
                                    }}
                                    onClose={() => {
                                        console.log(" AlatPay window closed");
                                    }}
                                    onPaymentWindowOpen={() => {
                                        console.log(" AlatPay payment window opened");
                                        closeModal("payment"); // Close the modal once payment window opens
                                    }}
                                    buttonText="Pay Now with ALATPay"
                                    buttonClassName="btn btn-primary w-full"
                                />
                            ) : selectedPaymentMethod === 'wallet' ? (
                                <button
                                    onClick={handlePaymentWithWallet}
                                    className="btn btn-primary w-full"
                                >
                                    Make Payment
                                </button>
                            ) : null}
                            <button
                                onClick={() => { closeModal('payment'); openModal('pickup'); }} // Inline handleBack logic
                                className="w-full text-center font-medium text-green-700 hover:text-green-900 py-2"
                            >
                                Go back
                            </button>
                        </div>
                    </div>
                </div>
            )}



        </div>

    );

};

// --- Icons (Keep or move to shared file) ---
const AlatIcon = () => (
    <span className="font-medium text-zinc-800 flex items-center gap-1">
        <img
            src="/images/alat-logo.png"
            alt="Alat Logo"
            className="w-10 h-10 mx-2 inline-block rounded-sm"
        />
    </span>
);

const WalletIcon = () => (
    <svg className="w-8 h-8 mx-2 inline-block rounded-sm" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M18.039 13.5515C17.619 13.9615 17.379 14.5515 17.439 15.1815C17.529 16.2615 18.519 17.0515 19.599 17.0515H21.499V18.2415C21.499 20.3115 19.809 22.0015 17.739 22.0015H6.25902C4.18902 22.0015 2.49902 20.3115 2.49902 18.2415V11.5115C2.49902 9.44147 4.18902 7.75146 6.25902 7.75146H17.739C19.809 7.75146 21.499 9.44147 21.499 11.5115V12.9515H19.479C18.919 12.9515 18.409 13.1715 18.039 13.5515Z"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M2.49902 12.4132V7.84328C2.49902 6.65328 3.22902 5.59323 4.33902 5.17323L12.279 2.17323C13.519 1.70323 14.849 2.62326 14.849 3.95326V7.75325"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M22.5588 13.9716V16.0317C22.5588 16.5817 22.1188 17.0316 21.5588 17.0516H19.5988C18.5188 17.0516 17.5288 16.2616 17.4388 15.1816C17.3788 14.5516 17.6188 13.9616 18.0388 13.5516C18.4088 13.1716 18.9188 12.9517 19.4788 12.9517H21.5588C22.1188 12.9717 22.5588 13.4216 22.5588 13.9716Z"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M7 12H14"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const CloseIcon = ({ className = 'w-5 h-5' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
);

export default SmartBinApplication;
