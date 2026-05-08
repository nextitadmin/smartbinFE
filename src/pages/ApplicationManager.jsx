import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

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

    const handleBack = () => {
        localStorage.removeItem("appId");
        navigate('/applyforsmartbin')
    }

    useEffect(() => {
        console.log("Order Details:",orderDetails);
        setCurrentId(localStorage.getItem("appId"));
    }, [orderDetails]);

    useEffect(() => {
        if (currentId) {
            fetchData();

        }
    }, [currentId]);

    const fetchData = async () => {
        try {
            const { data } = await api.get(`/residents/smart-bin-applications/${currentId}`);
            if (data.success) {
                const enhancedTrackingInfos = data.data.data.applicationHistory.map((event, index, arr) => ({
                    ...event,
                    isCurrent: index === arr.length - 1,
                    isCompleted: event.status?.toLowerCase() === 'delivered'
                }));

                setOrderDetails({
                    ...data.data.data,
                    trackInfos: enhancedTrackingInfos
                });
                
            }
        } catch (error) {
            console.log("error", error);
        }
    }


    function formatDate(dateString) {
        const date = new Date(dateString);

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
        const date = new Date(dateString);

        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        const suffix =
            day % 10 === 1 && day !== 11 ? 'st' :
                day % 10 === 2 && day !== 12 ? 'nd' :
                    day % 10 === 3 && day !== 13 ? 'rd' : 'th';

        return `${day}${suffix} ${month}, ${year}`
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
                                        <p className="font-medium text-zinc-900">{orderDetails?.transactionReference}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-500 font-normal">Date Processed</p>
                                    <p className="font-medium text-zinc-900">{formatDate(orderDetails?.datePending)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-500 font-normal">Customer</p>
                                    <p className="font-medium text-zinc-900">{orderDetails?.customerName }</p>
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-500 font-normal">Destination</p>
                                    <p className="font-medium text-zinc-900 leading-snug">{orderDetails?.address}</p>
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