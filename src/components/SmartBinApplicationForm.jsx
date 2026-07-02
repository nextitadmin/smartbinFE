// src/components/SmartBinApplicationForm.jsx (or .tsx)
import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig'; // Make sure the path is correct
import useResidentStore from '../store/useResidentStore';
import useAuthStore from '../store/authStore';
import AlatPayButton from './AlatPayButton'; // Make sure the path is correct

const SmartBinApplicationForm = ({ onClose, onSubmitSuccess }) => {
    const Resident = useResidentStore.getState().residentInfo;
    // --- State ---
    const [formData, setFormData] = useState({
        streetName: '',
        closestLandmark: '',
        lastName: Resident?.lastName || '',
        firstName: Resident?.firstName || '',
        email: Resident?.emailAddress || '',
        phoneNo: Resident?.phoneNo || '',
        payerId: Resident?.payerID || '',
        buildingType: '',
        houseNo: '',
        flatNo: '',
        lga: '',
        binType: '',
        lawmaCustomerType: 'Returning',
        locateMe: false,
        locationLatitude: "0.0",
        locationLongitude: "0.0",
        transactionReference: '', // Add field to store the reference
    });
    const [isDisabled, setIsDisabled] = useState(true);
    const [selfRequest, setSelfRequest] = useState(true);
    const [options, setOptions] = useState({
        buildingTypes: ['Duplex', 'Bungalow', 'Block of Flats', 'Terrace', 'Detached', 'Semi-Detached', 'Other'],
        lgas: [], // Will be populated by fetchLga
        lawmaCustomerTypes: ['New', 'Returning']
    });
    const [smartBinAmount, setSmartbinAmount] = useState(100000);
    const [debitType, setDebitType] = useState("");
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
    const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: string, autoClose?: boolean } | null
    const [isSubmitting, setIsSubmitting] = useState(false); // Prevent double submission

    // --- Notifications ---
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

    // --- Fetch Data ---
    const fetchLga = async () => {
        try {
            const { data } = await api.get("/utility/get-lgas");
            if (data.success) {
                setOptions((prev) => ({
                    ...prev,
                    lgas: data.data.map((item) => item)
                }));
            }
        } catch (error) {
            console.log("Error fetching lga", error);
        }

    }

    // const fetchSmartBinAmount = async () => {
    //     try {
    //         // Assuming this endpoint still works or is updated in your `api` config
    //         const response = await api.get("/Wallet/fetch-amount?paymentType=smartbin");
    //         if (response.data?.success) {
    //             const data = response.data.data;
    //             setSmartbinAmount(data.amountToDebit);
    //             setDebitType(data.debitType);
    //         } else {
    //             console.error("Failed to fetch smart bin amount:", response.data?.message || "Unknown error");
    //             setNotification({ type: 'error', message: 'Failed to get application fee. Please try again.' });
    //         }
    //     } catch (error) {
    //         console.error("Error fetching smart bin amount:", error);
    //         setNotification({ type: 'error', message: 'Network error while getting application fee.' });
    //     }
    // };

    useEffect(() => {
        fetchLga();
        // fetchSmartBinAmount();
    }, []);

    // --- Handlers ---
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const changeDetails = (e) => {
        e.preventDefault();
        setIsDisabled(!isDisabled);
        setSelfRequest(!selfRequest);
    };

    const cancelForm = () => {
        // Reset form to initial state based on Resident data
        setFormData({
            lastName: Resident?.lastName || '',
            firstName: Resident?.firstName || '',
            email: Resident?.emailAddress || '',
            phoneNo: Resident?.phoneNo || '',
            payerId: Resident?.payerID || '',
            buildingType: '',
            houseNo: '',
            flatNo: '',
            lga: '',
            binType: '',
            closestLandmark: '',
            streetName: '',
            lawmaCustomerType: 'Returning',
            locateMe: false,
            locationLatitude: "0.0",
            locationLongitude: "0.0",
            transactionReference: '', // Reset reference
        });
        setIsDisabled(true);
        setSelfRequest(true);
    };

    // --- Updated Flow: Submit Application First ---
    const submitFormForPayment = async (e) => { // Make it async
        e.preventDefault();
        setIsSubmitting(true); // Show processing state immediately
        setNotification(null); // Clear any previous notifications

        // Basic validation
        if (!formData.firstName || !formData.lastName || !formData.email ||
            !formData.phoneNo || !formData.payerId || !formData.streetName ||
            !formData.lga || !formData.binType || !formData.buildingType ||
            !formData.houseNo || !formData.flatNo) {
            setNotification({ type: 'error', message: 'Please fill in all required fields.' });
            setIsSubmitting(false);
            return; // Stop submission if validation fails
        }

        try {
            // Prepare payload matching the new API requirements
            const payload = {
                firstName: formData.firstName,
                surname: formData.lastName, // Or use lastName if API expects that
                phoneNumber: formData.phoneNo,
                email: formData.email,
                payerId: formData.payerId,
                useYourAddress: selfRequest,
                buildingType: formData.buildingType,
                houseNumber: formData.houseNo, // Map houseNo to houseNumber
                flatNumber: formData.flatNo,   // Map flatNo to flatNumber
                streetName: formData.streetName,
                address: formData.streetName, // Assuming API expects address as well
                localGovernmentArea: formData.lga, // Map lga to localGovernmentArea
                binType: formData.binType,
                closestLandmark: formData.closestLandmark,
                lawmaCustomerType: formData.lawmaCustomerType,
                // locateMe: formData.locateMe,
                // locationLongitude: formData.locationLongitude,
                // locationLatitude: formData.locationLatitude,

                houseName: "none",
                buildingName: "none",
                amount: "10000"

                // Note: paymentMethod, amount, transactionReference are NOT included here yet
            };

            console.log("Submitting application data to backend:", payload); // Log request payload

            // Use the new API endpoint to submit the application
            const response = await api.post("/residents/apply-smart-bin", payload);
            const responseData = response.data;

            console.log("Application submission response:", responseData); // Log response

            if (responseData.success) {
                const transactionReference = responseData.data?.transactionReference;
                const applicationData = responseData.data?.application || null;

                if (transactionReference) {
                    // Set the received reference for later use in payment
                    setFormData(prev => ({ ...prev, transactionReference }));

                    // Show success notification that auto-closes
                    setNotification({
                        type: 'success',
                        message: responseData.message || 'Application submitted successfully!',
                    });

                    // Delay opening the payment modal slightly to show the message
                    setTimeout(() => {
                        setIsPaymentModalOpen(true); // Open payment modal
                        setIsSubmitting(false); // Reset submitting state
                    }, 1500); // Adjust delay as needed (1.5 seconds here)

                    // Notify the parent component about the initial success if needed
                    // onSubmitSuccess(applicationData); // Optional: call this earlier or later?

                } else {
                    console.error("Application submitted successfully, but no transaction reference found:", responseData);
                    setNotification({ type: 'error', message: 'Application submitted, but payment initiation failed (missing reference). Please contact support.' });
                    setIsSubmitting(false);
                }
            } else {
                console.error("Backend application submission error:", responseData.message);
                setNotification({ type: 'error', message: responseData.message || "Failed to submit application. Please try again." });
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error("Error submitting application to backend:", error);
            // Provide user-friendly error messages based on error type if possible
            setNotification({ type: 'error', message: "Network error or server issue. Please try again later." });
            setIsSubmitting(false);
        }
        // finally block removed as setIsSubmitting is handled in try/catch
    };

    const closeForm = () => {
        setIsPaymentModalOpen(false);
        onClose(); // Notify parent to close the modal/form
    };

    // --- Payment Logic ---
    const handleBackToForm = () => {
        setIsPaymentModalOpen(false);
        // Optionally reset notification if coming back from payment error
        // setNotification(null);
    };


    const handlePaymentWithWallet = async () => {
        setIsSubmitting(true);
        try {
            // Get the transaction reference stored after application submission
            const transactionReference = formData.transactionReference;

            if (!transactionReference) {
                console.error("Cannot process wallet payment: Missing transaction reference.");
                setNotification({ type: 'error', message: 'Payment initiation failed (missing reference). Please try again or contact support.' });
                handleBackToForm();
                return;
            }

            // Prepare payload for wallet payment, including metaData
            const walletPayload = {
                userId: useAuthStore.getState().token,
                drAccountNo: Resident?.accountNo,
                amount: smartBinAmount,
                narration: "Smart Bin Application Payment",
                paymentPurpose: "Smart Bin Application",
                metaData: {
                    transactionReference: transactionReference // Include the reference here
                    // Add other relevant data if needed by the wallet API
                }
            };

            console.log("Initiating wallet payment with payload:", walletPayload); // Log request payload

            const response = await api.post("/Wallet/debit-wallet", walletPayload);
            const data = response.data;

            console.log("Wallet payment response:", data); // Log response

            if (data.success) {
                // Success message already shown from application submission
                // You might want to update the message or show another one if needed
                // setNotification({ type: 'success', message: 'Wallet payment successful!' });

                // Close the entire form flow as payment is complete
                closeForm();
                // Optionally notify parent of final success if needed
                // onSubmitSuccess({ transactionReference, paymentMethod: "wallet" }); // Example data

            } else {
                console.error("Wallet payment failed:", data.message);
                setNotification({ type: 'error', message: data.message || "Error processing wallet payment" });
                handleBackToForm(); // Go back to payment options or form
            }
        } catch (error) {
            console.error("Error processing wallet payment:", error);
            setNotification({ type: 'error', message: "Error processing wallet payment. Please try again." });
            handleBackToForm(); // Go back to payment options or form
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePaymentViaCard = async (paymentResponse) => {
        setIsSubmitting(true);
        try {
            // Get the transaction reference stored after application submission
            const transactionReference = formData.transactionReference;

            if (!transactionReference) {
                console.error("Cannot process card payment: Missing transaction reference.");
                setNotification({ type: 'error', message: 'Payment initiation failed (missing reference). Please try again or contact support.' });
                handleBackToForm();
                return;
            }

            // Handle response from AlatPayButton (this part remains largely the same)
            // Ensure you extract the correct reference from AlatPay's response if needed
            // For this example, we assume the initial reference is used or AlatPay confirms it.
            const alatPayTransactionReference = paymentResponse?.data?.reference || paymentResponse?.reference || transactionReference;

            if (alatPayTransactionReference) {
                // Success message already shown from application submission
                // You might want to update the message or show another one if needed
                // setNotification({ type: 'success', message: 'Card payment successful!' });

                // Prepare metaData for potential verification or record keeping
                const metaData = {
                    transactionReference: transactionReference, // Original reference from application
                    alatPayReference: alatPayTransactionReference // Reference from AlatPay if different
                    // Add other relevant data if needed
                };

                console.log("Card payment successful. MetaData:", metaData); // Log metaData

                // Close the entire form flow as payment is complete
                closeForm();
                // Optionally notify parent of final success if needed
                // onSubmitSuccess({ transactionReference: alatPayTransactionReference, paymentMethod: "card", metaData }); // Example data

            } else {
                console.error("Card payment response missing transaction reference:", paymentResponse);
                setNotification({ type: 'error', message: 'Payment initiated, but confirmation failed (missing reference). Please check payment status.' });
                handleBackToForm(); // Go back to payment options or form
            }
        } catch (error) {
            console.error("Error handling card payment response:", error);
            setNotification({ type: 'error', message: "Error processing card payment response. Please check payment status." });
            handleBackToForm(); // Go back to payment options or form
        } finally {
            setIsSubmitting(false);
        }
    };


    // --- Icons (Define locally or import) ---
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
            <path d="M18.039 13.5515C17.619 13.9615 17.379 14.5515 17.439 15.1815C17.529 16.2615 18.519 17.0515 19.599 17.0515H21.499V18.2415C21.499 20.3115 19.809 22.0015 17.739 22.0015H6.25902C4.18902 22.0015 2.49902 20.3115 2.49902 18.2415V11.5115C2.49902 9.44147 4.18902 7.75146 6.25902 7.75146H17.739C19.809 7.75146 21.499 9.44147 21.499 11.5115V12.9515H19.479C18.919 12.9515 18.409 13.1715 18.039 13.5515Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2.49902 12.4132V7.84328C2.49902 6.65328 3.22902 5.59323 4.33902 5.17323L12.279 2.17323C13.519 1.70323 14.849 2.62326 14.849 3.95326V7.75325" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22.5588 13.9716V16.0317C22.5588 16.5817 22.1188 17.0316 21.5588 17.0516H19.5988C18.5188 17.0516 17.5288 16.2616 17.4388 15.1816C17.3788 14.5516 17.6188 13.9616 18.0388 13.5516C18.4088 13.1716 18.9188 12.9517 19.4788 12.9517H21.5588C22.1188 12.9717 22.5588 13.4216 22.5588 13.9716Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 12H14" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );

    const CloseIcon = ({ className = 'w-5 h-5' }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
    );

    // --- Render ---
    return (
        <div className="shadow-lg">
            {/* Form Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-200 p-6 bg-zinc-400/20">
                <h2 className="text-xl sm:text-2xl font-semibold text-zinc-800">Apply for Smart Bin</h2>
                <button onClick={closeForm} aria-label="Close" className="text-red-600 hover:text-zinc-600">
                    <CloseIcon />
                </button>
            </div>

            {/* Notification */}
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

            {/* Main Form */}
            <form onSubmit={submitFormForPayment} className="p-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-x-5 gap-y-6">
                    {/* Personal Info */}
                    <div className="md:col-span-2">
                        <label htmlFor="lastName" className="block text-sm font-medium text-zinc-700 mb-1">Surname</label>
                        <input
                            type="text"
                            id="lastName"
                            disabled={isDisabled}
                            style={{ backgroundColor: isDisabled ? '#f4f4f5' : 'white' }}
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                            className="form-input w-full border border-zinc-300 p-4 rounded-xl"
                            autoComplete="family-name"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="firstName" className="block text-sm font-medium text-zinc-700 mb-1">First name</label>
                        <input
                            type="text"
                            id="firstName"
                            disabled={isDisabled}
                            style={{ backgroundColor: isDisabled ? '#f4f4f5' : 'white' }}
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                            className="form-input w-full border border-zinc-300 p-4 rounded-xl"
                            autoComplete="given-name"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1">Email address</label>
                        <input
                            type="email"
                            id="email"
                            disabled={isDisabled}
                            style={{ backgroundColor: isDisabled ? '#f4f4f5' : 'white' }}
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="form-input w-full border border-zinc-300 p-4 rounded-xl"
                            autoComplete="email"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="phoneNo" className="block text-sm font-medium text-zinc-700 mb-1">Phone Number</label>
                        <input
                            type="tel"
                            id="phoneNo"
                            disabled={isDisabled}
                            style={{ backgroundColor: isDisabled ? '#f4f4f5' : 'white' }}
                            name="phoneNo"
                            value={formData.phoneNo}
                            onChange={handleInputChange}
                            required
                            className="form-input w-full border border-zinc-300 p-4 rounded-xl"
                            autoComplete="tel"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="payerId" className="block text-sm font-medium text-zinc-700 mb-1">Payer ID</label>
                        <input
                            type="text"
                            id="payerId"
                            disabled={isDisabled}
                            style={{ backgroundColor: isDisabled ? '#f4f4f5' : 'white' }}
                            name="payerId"
                            value={formData.payerId}
                            onChange={handleInputChange}
                            required
                            className="form-input w-full border border-zinc-300 p-4 rounded-xl"
                        />
                    </div>
                    <div className="md:col-span-6 mt-1 mb-3">
                        <div className="flex items-center gap-2">
                            <input
                                type='checkbox'
                                id="not"
                                name="locateMe" // Map checkbox to locateMe field
                                checked={formData.locateMe} // Use locateMe state
                                onChange={handleInputChange} // Handle change for locateMe
                                className='accent-green-700 focus:ring-green-500 h-4 w-4 border-zinc-300 rounded'
                            />
                            <label htmlFor="not" className="text-sm font-medium text-green-700 hover:text-green-600 hover:underline">
                                Locate Me (Optional)
                            </label>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <input
                                type='checkbox'
                                id="useAddress"
                                name="useAddress" // Not directly tied to formData, just for UI control
                                checked={selfRequest}
                                onChange={changeDetails} // Handle change for selfRequest
                                className='accent-green-700 focus:ring-green-500 h-4 w-4 border-zinc-300 rounded'
                            />
                            <label htmlFor="useAddress" className="text-sm font-medium text-green-700 hover:text-green-600 hover:underline">
                                Use your Address
                            </label>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-x-5 gap-y-6 mt-6">
                    {/* Address Info */}
                    <div className="md:col-span-2">
                        <label htmlFor="buildingType" className="block text-sm font-medium text-zinc-700 mb-1">Building Type</label>
                        <select
                            id="buildingType"
                            name="buildingType"
                            value={formData.buildingType}
                            onChange={handleInputChange}
                            required
                            className="form-select w-full border border-zinc-300 p-3 rounded-xl"
                        >
                            <option value="">Select Building Type</option>
                            {options.buildingTypes.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="houseNo" className="block text-sm font-medium text-zinc-700 mb-1">House number</label>
                        <input
                            type="text"
                            id="houseNo"
                            name="houseNo"
                            value={formData.houseNo}
                            onChange={handleInputChange}
                            placeholder="House Number"
                            required
                            className="form-input w-full border border-zinc-300 p-4 rounded-xl"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="flatNo" className="block text-sm font-medium text-zinc-700 mb-1">Flat number</label>
                        <input
                            type="text"
                            id="flatNo"
                            name="flatNo"
                            value={formData.flatNo}
                            onChange={handleInputChange}
                            className="form-input w-full border border-zinc-300 p-4 rounded-xl"
                            placeholder="Flat Number"
                            required
                        />
                    </div>
                    <div className="md:col-span-6">
                        <label htmlFor="streetName" className="block text-sm font-medium text-zinc-700 mb-1">Address  <span className="text-red-500">*</span></label>
                        <input
                            id="streetName"
                            name='streetName'
                            value={formData.streetName}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter your Street Name"
                            className="w-full p-4 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-150 ease-in-out text-sm placeholder-zinc-400"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="lga" className="block text-sm font-medium text-zinc-700 mb-1">Local Government</label>
                        <select
                            id="lga"
                            name="lga"
                            value={formData.lga}
                            onChange={handleInputChange}
                            required
                            className="form-select w-full border border-zinc-300 p-4 rounded-xl"
                        >
                             <option value="">Select Local Government</option>
                             {options.lgas.map((item) => {
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
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="closestLandmark" className="block text-sm font-medium text-zinc-700 mb-1">Closest Landmark</label>
                        <input
                            type="text"
                            id="closestLandmark"
                            name='closestLandmark'
                            value={formData.closestLandmark}
                            onChange={handleInputChange}
                            placeholder="e.g., Near XYZ School"
                            className="w-full p-4 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-150 ease-in-out text-sm placeholder-zinc-400"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="lawmaCustomerType" className="block text-sm font-medium text-zinc-700 mb-1">LAWMA Customer type</label>
                        <select
                            id="lawmaCustomerType"
                            name="lawmaCustomerType"
                            value={formData.lawmaCustomerType}
                            onChange={handleInputChange}
                            required
                            className="form-select w-full border border-zinc-300 p-4 rounded-xl"
                        >
                            <option value="">Select Customer Type</option>
                            {options.lawmaCustomerTypes.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-6">
                        <label htmlFor="binType" className="block text-sm font-medium text-zinc-700 mb-1">Bin Type <span className="text-red-500">*</span></label>
                        <select
                            id="binType"
                            name="binType"
                            value={formData.binType}
                            onChange={handleInputChange}
                            required
                            className="form-select w-full border border-zinc-300 p-4 rounded-xl"
                        >
                            <option value="">Select Bin Type</option>
                            <option value='smart'>Smart</option>
                            <option value='non_smart'>Non-smart</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-8 mt-12 mb-4">
                    <button
                        type="button"
                        onClick={cancelForm}
                        className="px-5 py-2 bg-white border border-green-700 rounded-md shadow-sm text-sm font-medium text-green-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        disabled={isSubmitting} // Disable while submitting
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-green-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        disabled={isSubmitting} // Disable while submitting
                    >
                        {isSubmitting ? 'Processing...' : 'Next'} {/* Show processing state */}
                    </button>
                </div>
            </form>

            {/* Payment Modal */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 bg-zinc-950/70 bg-opacity-50 backdrop-blur-lg z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md lg:max-w-lg">
                        <div className="flex justify-between items-center py-4 px-6 border-b border-zinc-200">
                            <h3 className="text-lg font-semibold text-zinc-800">Select Payment Method</h3>
                            <button
                                onClick={() => onClose()}
                                aria-label="Close"
                                className="text-zinc-700 hover:text-red-600"
                                disabled={isSubmitting} // Disable close while submitting
                            >
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="py-4 space-y-3">
                            {/* Wallet Option */}
                            <label className="px-4 py-3 rounded-lg flex items-center gap-4 hover:bg-zinc-50 cursor-pointer">
                                <WalletIcon />
                                <span className="text-sm font-medium text-zinc-800 flex-grow">
                                    Pay from Wallet (₦{smartBinAmount.toLocaleString()})
                                </span>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    id="wallet"
                                    value="wallet"
                                    checked={selectedPaymentMethod === 'wallet'}
                                    onChange={() => setSelectedPaymentMethod('wallet')}
                                    className="custom-radio h-5 w-5 text-green-600"
                                    disabled={isSubmitting} // Disable option while submitting
                                />
                            </label>
                            {/* Card Option (AlatPay) */}
                            <label className="px-4 py-3 rounded-lg flex items-center gap-4 hover:bg-zinc-50 cursor-pointer">
                                <AlatIcon />
                                <span className="text-sm font-medium text-zinc-800 flex-grow">
                                    Pay with Card (AlatPay)
                                </span>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    id="card"
                                    value="card"
                                    checked={selectedPaymentMethod === 'card'}
                                    onChange={() => setSelectedPaymentMethod('card')}
                                    className="custom-radio h-5 w-5 text-green-600"
                                    disabled={isSubmitting} // Disable option while submitting
                                />
                            </label>
                        </div>
                        <div className="px-4 py-4 flex flex-col items-center gap-3 border-t border-zinc-200">
                            {selectedPaymentMethod === 'card' ? (
                                <AlatPayButton
                                    amount={smartBinAmount}
                                    onTransaction={handlePaymentViaCard} // Pass the handler
                                    buttonText={isSubmitting ? "Processing..." : "Pay Now with ALATPay"}
                                    buttonClassName="btn btn-primary w-full py-3"
                                    disabled={isSubmitting} // Disable button while submitting
                                />
                            ) : (
                                <button
                                    onClick={handlePaymentWithWallet}
                                    className={`w-full py-3 px-4 rounded-md text-white font-medium ${isSubmitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                                    disabled={isSubmitting} // Disable button while submitting
                                >
                                    {isSubmitting ? 'Processing Payment...' : `Pay ₦${smartBinAmount.toLocaleString()} from Wallet`}
                                </button>
                            )}
                            <button
                                onClick={handleBackToForm}
                                className="w-full text-center font-medium text-green-700 hover:text-green-900 py-2"
                                disabled={isSubmitting} // Disable back button while submitting
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

export default SmartBinApplicationForm;