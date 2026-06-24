import React, { useEffect, useState } from 'react';
import { NavLink } from "react-router-dom";

import { useNavigate } from 'react-router-dom';
import api from "../api/axiosConfig.js"




export default function CorporateOnbordForm() {
    // localStorage.setItem("loggedIn", JSON.stringify(false));
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [notification, setNotification] = useState(null);


    // State for form data
    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        payerId: '',
        password: '',
        confirmPassword: '',
        businessName: '',
        lgaId: '',
    });
    const [lgas, setLgas] = useState([]);
    const [loadingLgas, setLoadingLgas] = useState(false);
    const [lgaError, setLgaError] = useState(null);

    const navigate = useNavigate();

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

    useEffect(() => {
        const fetchLgas = async () => {
            setLoadingLgas(true);
            try {
                const { data } = await api.get('/utility/get-lgas');
                if (Array.isArray(data)) {
                    setLgas(data);
                    setLgaError(null);
                } else if (data?.success && Array.isArray(data.data)) {
                    setLgas(data.data);
                    setLgaError(null);
                } else {
                    setLgaError('Unable to load LGAs.');
                }
            } catch (error) {
                console.error('Error fetching LGAs:', error);
                setLgaError('Unable to load LGAs.');
            } finally {
                setLoadingLgas(false);
            }
        };

        fetchLgas();
    }, []);
    // State for submitted data
    // const [submittedData, setSubmittedData] = useState(null);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const fetchData = async () => {
        try {
            const { data } = await api.get(`/payer/${formData.payerId}`);
            if (data.success) {
                setFormData({
                    ...formData,
                    firstName: data.data.firstName,
                    lastName: data.data.lastName,
                    email: data.data.email,
                    phoneNumber: data.data.phoneNumber,
                });
            }
        } catch (error) {
            console.log("Error fetching data")
        }
    }

    useEffect(() => {
        fetchData();
    }, [formData.payerId])

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.confirmPassword !== formData.password) {
                setNotification({ type: 'error', message: 'Passwords don\'t match' });
                return;
            }
            const { data } = await api.post('/corporate/register',
                { ...formData }
            );

            if (data.success) {
                setNotification({ type: 'success', message: data.message || 'Submitted successfully!' });
                navigate("/");
            }
            else {
                setNotification({ type: 'error', message: data.message || "Error submitting" });
            }

        } catch (error) {
            console.log("Error message is", error);
            setNotification({ type: 'error', message: "Error creating new corporate" });
        }
    };

    //   pattern="[A-Za-z\s]+"

    // Handle cancel action
    const handleCancel = () => {
        console.log("Form Cancelled");
        setFormData({


            firstName: '',
            middleName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            payerId: '',
            password: '',
            confirmPassword: '',
            lgaId: '',
        });
        // setSubmittedData(null);
    };

    return (
        <div className="flex min-h-screen flex-col lg:flex-row bg-white">
            {/* Left Panel */}
            <div className="lg:w-7/12 w-full h-full flex flex-col  lg:px-36 px-8 py-12 bg-white">




                <div className='lg:my-8 my-12'>

                    <div className='mb-12'>
                        <NavLink to="/signup"> <button className='flex flex-row items-center justify-centerp-4 rounded-2xl text-2xl'> <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8 pr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                        </svg>
                            Back</button></NavLink>
                    </div>


                    <div className="bg-white  w-full max-w-5xl">
                        <div className=" mb-8">
                            <h1 className="text-2xl lg:text-5xl  text-zinc-800 mb-2">As a corporate body</h1>
                            <p className="text-zinc-500 font-light max-w-11/12">Make waste disposal effortless. Create an account and start your journey to a more sustainable tomorrow.</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-5 mb-8">

                                <div className='lg:col-span-2'>
                                    <label htmlFor="payerId" className="block text-sm font-medium text-zinc-700 mb-1">
                                        Payer ID

                                    </label>
                                    <input
                                        type="text"
                                        id="payerId"
                                        name="payerId"
                                        value={formData.payerId}
                                        onChange={handleInputChange}
                                        placeholder="Payer ID"

                                        title="Please enter only letters and spaces"
                                        required
                                        className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none transition duration-150 ease-in-out"
                                    />

                                    <NavLink to='/createpayerid'>

                                        <div className='text-green-700 my-2'>


                                            I dont have one? <span className='underline'>Create Payer ID</span>
                                        </div>
                                    </NavLink>
                                </div>
                                <div className='lg:col-span-2'>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-zinc-700 mb-1">
                                        Business Name
                                    </label>
                                    <input
                                        type="text"
                                        id="businessName"
                                        name="businessName"
                                        value={formData.businessName}
                                        onChange={handleInputChange}
                                        placeholder="Business Name"
                                        pattern="[A-Za-z\s]+"
                                        title="Please enter only letters and spaces"
                                        required
                                        className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none transition duration-150 ease-in-out"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-zinc-700 mb-1">
                                        First name
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        placeholder="First name"
                                        pattern="[A-Za-z\s]+"
                                        title="Please enter only letters and spaces"
                                        required
                                        className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none transition duration-150 ease-in-out"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="middleName" className="block text-sm font-medium text-zinc-700 mb-1">
                                        Middle name
                                    </label>
                                    <input
                                        type="text"
                                        id="middleName"
                                        name="middleName"
                                        value={formData.middleName}
                                        onChange={handleInputChange}
                                        placeholder="Middle name"
                                        pattern="[A-Za-z\s]+"
                                        title="Please enter only letters and spaces"
                                        required
                                        className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none transition duration-150 ease-in-out"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-zinc-700 mb-1">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        placeholder="Last Name"
                                        pattern="[A-Za-z\s]+"
                                        title="Please enter only letters and spaces"
                                        required
                                        className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none transition duration-150 ease-in-out"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1">
                                        Email address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="example@email.com"
                                        required
                                        className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none transition duration-150 ease-in-out"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-zinc-700 mb-1">
                                        Phone no
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        placeholder="080"

                                        title="Please enter a valid phone number (e.g., +234 800 000 0000)"
                                        required
                                        className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none transition duration-150 ease-in-out"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="lgaId" className="block text-sm font-medium text-zinc-700 mb-1">
                                        LGA
                                    </label>
                                    <select
                                        id="lgaId"
                                        name="lgaId"
                                        value={formData.lgaId}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full p-3 border border-zinc-300 rounded-lg bg-white focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none transition duration-150 ease-in-out"
                                    >
                                        <option value="" disabled>
                                            {loadingLgas ? 'Loading LGAs...' : 'Select LGA'}
                                        </option>
                                        {lgas.map((item) => {
                                            const value = typeof item === 'string'
                                                ? item
                                                : item.id ?? item._id ?? item.value ?? item.name ?? item.label ?? '';
                                            const label = typeof item === 'string'
                                                ? item
                                                : item.name ?? item.lgaName ?? item.label ?? item.value ?? item;
                                            return (
                                                <option key={value || label} value={value}>
                                                    {label}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    {lgaError && <p className="text-sm text-red-600 mt-1">{lgaError}</p>}
                                </div>


                                {/* Password Field */}
                                <div className="relative lg:col-span-2">

                                    <label htmlFor="password">Password</label>

                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        name='password'
                                        className="w-full border border-zinc-300 rounded-xl px-4 py-3 pr-10 bg-white focus:outline-none focus:ring-2 focus:ring-green-700"
                                        placeholder="Password"

                                    />
                                    <svg
                                        onClick={() => setShowPassword(!showPassword)}
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-5 h-5 text-zinc-500 absolute right-4 top-1/2 mt-3  -translate-y-1/2 cursor-pointer"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d={showPassword
                                                ? 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z'
                                                : 'M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a10.05 10.05 0 012.184-3.362M9.88 9.88A3 3 0 0014.12 14.12M6.1 6.1l11.8 11.8'}
                                        />
                                    </svg>
                                </div>
                                {/* Confirm Password Field */}
                                <div className="relative lg:col-span-2" >

                                    <label htmlFor="confirmPassword">Confirm Password</label>

                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        name='confirmPassword'
                                        className="w-full border border-zinc-300 rounded-xl px-4 py-3 pr-10 bg-white focus:outline-none focus:ring-2 focus:ring-green-700"
                                        placeholder="Confirm Password"

                                    />
                                    <svg
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-5 h-5 text-zinc-500 absolute right-4 top-1/2 mt-3  -translate-y-1/2 cursor-pointer"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d={showConfirmPassword
                                                ? 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z'
                                                : 'M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a10.05 10.05 0 012.184-3.362M9.88 9.88A3 3 0 0014.12 14.12M6.1 6.1l11.8 11.8'}
                                        />
                                    </svg>
                                </div>


                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="py-2 px-6 border border-zinc-300 rounded-lg text-zinc-700 font-medium hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-300 transition duration-150 ease-in-out"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="py-2 px-6 bg-green-700 text-white rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-700 transition duration-150 ease-in-out"
                                >
                                    Sign Up
                                </button>
                            </div>

                            {/* {submittedData && (
                                <div className="mt-8 p-4 border border-zinc-200 rounded bg-zinc-50">
                                    <h3 className="font-semibold mb-2">Form Data Submitted:</h3>
                                    <pre className="text-sm text-zinc-700 whitespace-pre-wrap">{submittedData}</pre>
                                </div>
                            )} */}







                        </form>
                    </div>




                </div>
            </div >

            {/* Right Panel */}
            <div className="hidden lg:flex w-5/12 items-center justify-center bg-[url(/images/smilebin.jpg)] relative overflow-hidden bg-cover bg-no-repeat bg-center" >

                <div className='absolute top-0 my-14   '>
                    <div className=" z-20 flex flex-row items-center gap-4">
                        <img src="/images/sealLogo.svg" alt="Lagos Seal" className="h-20 mb-1 p-2" />
                        <p className="text-white font-medium text-sm uppercase tracking-wide">
                            Utilities Service Provider Initiative by<br />The Lagos State Government
                        </p>
                    </div>
                </div>


                <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white px-6 py-4 text-center z-20">
                    <p className="text-lg">“Experience the power of smart waste management. Sign up now and discover a cleaner, greener world”</p>
                </div>
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
        </div >
    );
}


