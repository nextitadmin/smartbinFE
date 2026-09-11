import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import KycStatusCard from '../components/KycStatusCard';
import api from '../api/axiosConfig';
import useAuthStore from '../store/authStore';

function NewKycApplication() {
    const [kycStatus, setKycStatus] = useState(false);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const clearNotification = () => {
        setNotification(null);
    };

    useEffect(() => {
        if (location.state?.notification) {
            setNotification(location.state.notification);
            // Clear location state so notification does not reappear on reload
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                clearNotification();
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const startkyc = () => {
        navigate('/kycapplication');
    };

    const checkStatus = async () => {
        try {
            const { data } = await api.get('/resident/kyc/status');
            const statusInfo = data?.data || data;
            const succeeded = data?.succeeded || data?.success;
            if (succeeded && statusInfo) {
                const isStatusActive = (status) => {
                    const s = (status || '').toLowerCase();
                    return s === 'submitted' || s === 'pending' || s === 'approved';
                };
                const hasSubmitted = Boolean(
                    statusInfo.hasSubmittedIdentity || 
                    statusInfo.hasSubmittedAddress ||
                    statusInfo.hasSubmittedPersonalInformation ||
                    isStatusActive(statusInfo.identityVerificationStatus) ||
                    isStatusActive(statusInfo.addressVerificationStatus)
                );
                setKycStatus(hasSubmitted);  
            } else {
                setKycStatus(false); 
            }
        } catch (error) {
            console.log("error", error);
            setKycStatus(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkStatus();
    }, []);

    // const trackOrder = () => {
    //     console.log("Tracking order:", orderIdInput || orderDetails.id);
    // };


    return (
        <div className='flex sans h-screen'>

            <Sidebar addkey="1" />


            <div className="flex-1 bg-zinc-100 min-h-screen overflow-y-auto">

                <Topbar />




                <div className="flex flex-row justify-between items-center gap-4 mb-2 p-8">
                    <div className="flex flex-col  gap-2">
                        <h1 className="text-xl md:text-2xl font-semibold text-zinc-800">KYC application</h1>
                        <span className='text-zinc-500'> Complete your KYC application</span>

                    </div>

                    <div className="text-center pt-6">
                        <p className="text-sm text-zinc-600">

                            <button

                                className="font-medium text-green-600 hover:text-green-800 hover:underline focus:outline-none"
                            >
                                Having issues? Contact Support
                            </button>
                        </p>
                    </div>
                </div>



                <section className=" flex items-center justify-center mx-auto my-36 px-4 sm:px-6 lg:px-8">

                    <div className=" flex flex-col ">


                    <div className="flex flex-col">
                    {
                        loading ? (
                            <div className="flex items-center justify-center p-16">
                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-700 border-t-transparent"></div>
                            </div>
                        ) : kycStatus ? (
                            <KycStatusCard />
                        ) : (
                        <div className="max-w-xl w-full flex flex-col items-center justify-center text-center">
                            <img src="./images/documenticon.svg" alt="KYC Icon" className="my-4" />
                            <h2 className="text-3xl mb-1 sans">Let’s know you</h2>
                            <p className="text-zinc-400 mb-8 mt-2 font-light">
                            Please complete our Know Your Customer (KYC) application. This will help us verify your identity.
                            </p>






                            <button
                            onClick={startkyc}
                            className="bg-green-700 hover:bg-green-800 text-white lg:w-1/2 rounded-xl text-lg mb-6 flex flex-row items-center justify-center p-3"
                            >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                strokeWidth={1.5} stroke="currentColor" className="size-8 mx-4">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            <p>New Application</p>
                            </button>
                        </div>
                        )
                    }
                    </div>

                       

                       



                        

                    </div>



                </section>

                {notification && (
                    <div
                        className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg max-w-sm z-50 transition-all duration-300 ${
                            notification.type === 'success'
                                ? 'bg-green-100 border border-green-400 text-green-700'
                                : 'bg-red-100 border border-red-400 text-red-700'
                        }`}
                        role={notification.type === 'error' ? 'alert' : 'status'}
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{notification.message}</p>
                            <button
                                onClick={clearNotification}
                                className={`ml-4 text-xl font-semibold leading-none ${
                                    notification.type === 'success'
                                        ? 'text-green-700 hover:text-green-800'
                                        : 'text-red-700 hover:text-red-800'
                                } focus:outline-none`}
                                aria-label="Close notification"
                            >
                                &times;
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default NewKycApplication;