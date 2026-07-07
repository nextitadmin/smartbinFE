import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import api from "../api/axiosConfig.js"

const CreatePayerID = () => {
    // State for form data
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        dateOfBirth: null,
        nin: '',

        termsAccepted: false
    });

    const [notification, setNotification] = useState(null);

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

    // State for submitted data
    // const [submittedData, setSubmittedData] = useState(null);

    const formatErrorMessage = (errorObjOrMsg) => {
        if (!errorObjOrMsg) return '';
        if (typeof errorObjOrMsg === 'string') return errorObjOrMsg;
        if (Array.isArray(errorObjOrMsg)) {
            return errorObjOrMsg.map(item => typeof item === 'object' ? JSON.stringify(item) : item).join(', ');
        }
        if (typeof errorObjOrMsg === 'object') {
            return errorObjOrMsg.message || JSON.stringify(errorObjOrMsg);
        }
        return String(errorObjOrMsg);
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'nin') {
            // Allow only digits up to 11 characters
            const digits = value.replace(/\D/g, '').slice(0, 11);
            setFormData(prev => ({
                ...prev,
                [name]: digits
            }));
            return;
        }
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const navigate = useNavigate();

    // Handle form submission
    const handleSubmit = async (e) => {
        console.log("Form submitted with data:", formData);
        e.preventDefault();

        if (formData.nin.length !== 11) {
            setNotification({ type: 'error', message: 'NIN must be exactly 11 digits' });
            return;
        }

        try {
            const { data } = await api.post('/payer',
                { ...formData }
            )

            if (data.success) {
                navigate('/createidsuccess');
                setNotification({ type: 'success', message: 'Created successfully!' });
            }
            else {
                setNotification({ type: 'error', message: formatErrorMessage(data.message) || 'Error creating payer Id' });
            }
        } catch (error) {
            console.log("Error is", error);
            const errMsg = error.response?.data?.message || error.response?.data?.errors || error.message || 'Error creating payer Id';
            setNotification({ type: 'error', message: formatErrorMessage(errMsg) });
        }
    };

    // Handle cancel action
    const handleCancel = () => {
        console.log("Form Cancelled");
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            dateOfBirth: null,
            nin: '',

            termsAccepted: false
        });
        // setSubmittedData(null);
    };
    // const [menuOpen, setMenuOpen] = useState(false);
    // const toggleMenu = () => {
    //     setMenuOpen(!menuOpen);
    // };

    return (
        <div className="font-sans">
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        {/* Logo and Title */}
                        <div className="flex items-center">
                            <div className="bg-yellow-500 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                                <img
                                    src="./images/sealLogo.svg"
                                    alt="Lagos State Logo"
                                    className="w-12 h-12 object-contain"
                                />
                            </div>
                            <div className="text-xs lg:text-sm">
                                <p className="font-bold">UTILITIES SERVICE PROVIDER INITIATIVE BY</p>
                                <p>THE LAGOS STATE GOVERNMENT</p>
                            </div>
                        </div>

                        {/* Mobile Menu Button
                        <button
                            onClick={toggleMenu}
                            className="block lg:hidden focus:outline-none"
                            aria-label="Toggle menu"
                        >
                            {!menuOpen ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            )}
                        </button>

                        {/* Desktop Navigation */}
                        {/* <nav className="hidden lg:flex items-center space-x-6">
                            <a href="/" className="text-green-800 hover:text-green-600">Home</a>
                            <a href="./track.html" className="text-zinc-700 hover:text-green-600">Track Smart Bin</a>
                            <a href="#" className="text-zinc-700 hover:text-green-600">Partners</a>
                            <div className="flex items-center space-x-2">
                                <a
                                    href="#"
                                    className="border border-green-700 text-green-700 px-6 py-2 rounded-lg hover:bg-green-50"
                                >
                                    Login
                                </a>
                                <a
                                    href="#"
                                    className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-600"
                                >
                                    Sign Up
                                </a>
                            </div>
                        </nav>
                    </div> */}

                        {/* Mobile Navigation Menu */}
                        {/* {menuOpen && (
                        <div className="lg:hidden mt-4 transition-all duration-300 ease-in-out">
                            <nav className="flex flex-col space-y-4 py-2">
                                <a href="#" className="text-green-800 hover:text-green-600 flex items-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 mr-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                        />
                                    </svg>
                                    Home
                                </a>
                                <a href="#" className="text-zinc-700 hover:text-green-600 flex items-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 mr-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                                        />
                                    </svg>
                                    Track Smart Bin
                                </a>
                                <a href="#" className="text-zinc-700 hover:text-green-600 flex items-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 mr-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                    </svg>
                                    Partners
                                </a>
                                <div className="flex space-x-2 pt-2">
                                    <a
                                        href="#"
                                        className="border border-green-700 text-green-700 px-6 py-2 rounded-lg hover:bg-green-50 w-full text-center flex items-center justify-center"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 mr-1"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                                            />
                                        </svg>
                                        Login
                                    </a>
                                    <a
                                        href="#"
                                        className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-600 w-full text-center flex items-center justify-center"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 mr-1"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                            />
                                        </svg>
                                        Sign Up
                                    </a>
                                </div>
                            </nav>
                        </div>
                    )}  */}
                    </div>
                </div>
            </header>


            <div className='my-4 max-w-8xl pl-36 py-10'>
                <NavLink to="/residentonboard"> <button className='flex flex-row items-center justify-centerp-4 rounded-2xl text-2xl'> <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8 pr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
                    Back
                </button>
                </NavLink>
            </div>
            <main className="flex items-center justify-center  p-4">
                <div className="bg-white p-6 md:p-10 w-full py-12 max-w-5xl">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-zinc-800 mb-2">Create PayerID</h1>
                        <p className="text-zinc-600">Let's create a payerID for you</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-8">
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

                                    // pattern="[A-Za-z\s]+"
                                    title="Please enter only letters and spaces"
                                    required
                                    className="w-full p-3 border border-zinc-300 rounded-md focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none transition duration-150 ease-in-out"
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
                                    title="Please enter only letters and spaces"
                                    required
                                    className="w-full p-3 border border-zinc-300 rounded-md focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none transition duration-150 ease-in-out"
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
                                    // placeholder="example@email.com"
                                    required
                                    className="w-full p-3 border border-zinc-300 rounded-md focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none transition duration-150 ease-in-out"
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
                                    placeholder="+234"
                                    // pattern="^\+?[0-9\s\-()]+$"


                                    title="Please enter a valid phone number (e.g., +234 800 000 0000)"
                                    required
                                    className="w-full p-3 border border-zinc-300 rounded-md focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none transition duration-150 ease-in-out"
                                />
                            </div>

                            <div>
                                <label htmlFor="dob" className="block text-sm font-medium text-zinc-700 mb-1">
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    id="dob"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth || ''}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full p-3 border border-zinc-300 rounded-md focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none transition duration-150 ease-in-out text-zinc-500 relative"
                                />
                            </div>

                            <div>
                                <label htmlFor="nin" className="block text-sm font-medium text-zinc-700 mb-1">
                                    NIN
                                </label>
                                <input
                                    type="text"
                                    id="nin"
                                    name="nin"
                                    value={formData.nin}
                                    onChange={handleInputChange}
                                    placeholder="Your NIN (11 digits)"
                                    pattern="\d{11}"
                                    maxLength={11}
                                    title="Please enter exactly 11 digits"
                                    required
                                    className="w-full p-3 border border-zinc-300 rounded-md focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none transition duration-150 ease-in-out"
                                />
                            </div>


                            <div className="md:col-span-2 flex items-center mt-2">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    name="termsAccepted"
                                    checked={formData.termsAccepted}
                                    onChange={handleInputChange}
                                    required
                                    className="h-4 w-4 text-green-600 border-zinc-300 rounded focus:ring-green-700"
                                />
                                <label htmlFor="terms" className="ml-2 block text-sm text-zinc-900">
                                    I agree to the <a href="#" className="text-green-600 hover:underline">Terms and Conditions</a>
                                </label>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="py-2 px-6 border border-zinc-300 rounded-md text-zinc-700 font-medium hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-300 transition duration-150 ease-in-out"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="py-2 px-6 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-700 transition duration-150 ease-in-out"
                            >
                                Create Payer ID
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
            </main>
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
        </div>
    );
};

export default CreatePayerID;