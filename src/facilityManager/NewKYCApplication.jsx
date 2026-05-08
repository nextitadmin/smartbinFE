import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/FacilityMgrSideBar';
import Topbar from '../components/FacilityMgrTopBar';
import KycStatusCard from '../components/KycStatusCard';
import api from '../api/axiosConfig';
import useAuthStore from '../store/authStore';

function NewKycApplication() {






    // const title = 'Where is my Smart Bin?';
    const [kycStatus, setKycStatus] = useState(false);
    const navigate = useNavigate();

    const startkyc = () => {
        navigate('/kycapplication');
    }


    const checkStatus = async () => {
        try {
            const { data } = await api.get('/facility-manager/kyc/status')
            if (data.succeeded) {
                setKycStatus(true);
            } else {
                setKycStatus(false);
            }
        } catch (error) {
            console.log("error", error);
        }
    }

    useEffect(() => {
        checkStatus();
    }, [])

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
                                kycStatus ? (
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





            </div>
        </div>
    );
}

export default NewKycApplication;