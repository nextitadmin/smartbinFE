// SmartBinApplicationForm.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import useAuthStore from '../store/authStore';
import AlatPayButton from '../components/AlatPayButton'; // Ensure this path is correct

// --- Icon Components (if not imported from elsewhere) ---
const CloseIcon = ({ className = 'w-5 h-5' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
);

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


const SmartBinApplicationForm = ({ isOpen, onClose, onSubmitSuccess, initialFacilityMgrData }) => {
    // --- State ---
    const [formData, setFormData] = useState({
        tenantName: '',
        tenantId: '',
        selectedTenant: null,
        streetName: '',
        closestLandmark: '',
        email: '',
        phoneNo: '',
        payerId: '',
        buildingType: '',
        houseNo: '',
        flatNo: '',
        lga: '',
        lawmaCustomerType: 'Existing',
    });
    const [tenantsList, setTenantsList] = useState([]);
    const [isDisabled, setIsDisabled] = useState(false);
    const [selfRequest, setSelfRequest] = useState(true);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
    const [smartBinAmount, setSmartbinAmount] = useState(0);
    const [debitType, setDebitType] = useState("");
    const [notification, setNotification] = useState(null);
    const [options, setOptions] = useState({
        buildingTypes: ['Duplex', 'Bungalow', 'Block of Flats', 'Terrace', 'Detached', 'Semi-Detached', 'Other'],
        lgas: [], // Will be populated by fetchLga
        lawmaCustomerTypes: ['New', 'Existing']
    });

    const clearNotification = () => setNotification(null);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(clearNotification, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // --- Fetch Data ---
    const fetchTenants = async () => {
        try {
            const { data } = await api.get("/facility-managers/user/tenants");
            if (data.success) {
                setTenantsList(data.data || []);
            } else {
                console.error("Failed to fetch tenants:", data);
                setTenantsList([]);
            }
        } catch (error) {
            console.error("Error fetching tenants:", error);
            setTenantsList([]);
        }
    };

    const fetchTenantDetails = async (id) => {
        if (!id) return; // Prevent call if no ID
        try {
            const { data } = await api.get(`/facility-managers/user/tenants/${id}`);
            if (data.success) {
                const tenantData = data.data;
                setFormData(prev => ({
                    ...prev,
                    tenantName: tenantData.fullName,
                    tenantId: tenantData.id,
                    selectedTenant: tenantData,
                    streetName: tenantData.residentialAddress,
                    closestLandmark: tenantData.landMark,
                    email: tenantData.email,
                    phoneNo: tenantData.phoneNo,
                    payerId: tenantData.payerID,
                    buildingType: tenantData.buildingType,
                    houseNo: tenantData.houseNo,
                    flatNo: tenantData.flatNo,
                    lga: tenantData.lga,
                    lawmaCustomerType: tenantData.lawmaCustomerType || 'Existing',
                }));
            }
        } catch (error) {
            console.error("Error fetching tenant details:", error);
        }
    };

    const fetchLga = async () => {
        try {
            const { data } = await api.get("/utility/get-lgas");
            if ((data.succeeded || data.success) && Array.isArray(data.data)) {
                setOptions(prev => ({
                    ...prev,
                    lgas: data.data.map(item => typeof item === 'string' ? item : item.text || item.name || '' ).filter(Boolean)
                }));
            }
        } catch (error) {
            console.error("Error fetching LGA:", error);
        }
    };

    const fetchSmartBinAmount = async () => {
        try {
            const response = await api.get("/facility-managers/wallets");
            const data = response.data.data;
            if (response.data.succeeded) {
                setSmartbinAmount(data.amountToDebit);
                setDebitType(data.debitType);
            } else {
                console.error("Failed to fetch smart bin amount:", response.data.message);
            }
        } catch (error) {
            console.error("Error fetching smart bin amount:", error);
        }
    };

    // --- Initialize Form ---
    useEffect(() => {
        if (isOpen) {
            fetchTenants();
            fetchLga();
            fetchSmartBinAmount();
            // Pre-fill form with facility manager data if available
            if (initialFacilityMgrData) {
                setFormData(prev => ({
                    ...prev,
                    email: initialFacilityMgrData.emailAddress || '',
                    phoneNo: initialFacilityMgrData.phoneNo || '',
                    payerId: initialFacilityMgrData.payerID || '',
                }));
            }
        }
    }, [isOpen, initialFacilityMgrData]);

    useEffect(() => {
        fetchTenantDetails(formData.tenantId);
    }, [formData.tenantId]);

    // --- Handle Input Changes ---
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === "TenantName") {
            const selectedTenant = tenantsList.find(t => t.id === value);
            setFormData(prev => ({
                ...prev,
                tenantId: value,
                tenantName: selectedTenant?.fullName ?? '',
                selectedTenant,
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    // --- Form Methods ---
    const cancelForm = () => {
        setFormData({
            tenantId: '',
            tenantName: '',
            selectedTenant: null,
            email: initialFacilityMgrData?.emailAddress || '',
            phoneNo: initialFacilityMgrData?.phoneNo || '',
            payerId: initialFacilityMgrData?.payerID || '',
            buildingType: '',
            houseNo: '',
            flatNo: '',
            lga: '',
            streetName: '',
            closestLandmark: '',
            lawmaCustomerType: 'Existing',
        });
        setIsDisabled(true);
        setSelfRequest(true);
    };

    const closeForm = () => {
        onClose(); // Call parent's close function
        // Reset form state on close
        setFormData({
            tenantId: '',
            tenantName: '',
            selectedTenant: null,
            email: initialFacilityMgrData?.emailAddress || '',
            phoneNo: initialFacilityMgrData?.phoneNo || '',
            payerId: initialFacilityMgrData?.payerID || '',
            buildingType: '',
            houseNo: '',
            flatNo: '',
            streetName: '',
            lga: '',
            lawmaCustomerType: 'Existing',
            locateMe: false,
            locationLatitude: "37.7749",
            locationLongitude: "-122.4194",
        });
        setIsDisabled(true);
        setSelfRequest(true);
        setIsPaymentModalOpen(false);
        setSelectedPaymentMethod('card');
    };

    const changeDetails = (e) => {
        e.preventDefault();
        setIsDisabled(!isDisabled);
        setSelfRequest(!selfRequest);
    };

    // --- Payment Methods ---
    const openModal = () => setIsPaymentModalOpen(true);
    const closeModal = () => setIsPaymentModalOpen(false);

    const submitApplication = (e) => {
        e.preventDefault();
        console.log("Form Submitted:", formData);
        openModal(); // Open payment modal instead of closing form immediately
    };

    const handleBack = () => {
        closeModal();
        // Retain form state if needed
    };

    const handlePayment = async (response) => {
        closeModal();
        let ref, channel;
        const amount = smartBinAmount;

        if (selectedPaymentMethod === 'wallet') {
            ref = response.reference;
            channel = "wallet";
        } else if (selectedPaymentMethod === 'card') {
            ref = response.data?.reference; // Adjust based on AlatPayButton response structure
            channel = "card";
        }

        if (ref && amount && channel) {
            try {
                const payload = {
                    phoneNo: formData.phoneNo,
                    emailAddress: formData.email,
                    payerID: formData.payerId,
                    useYourAddress: selfRequest,
                    buildingType: formData.buildingType,
                    houseNo: formData.houseNo,
                    flatNo: formData.flatNo,
                    address: formData.streetName,
                    lga: formData.lga,
                    landmark: formData.closestLandmark,
                    lawmaCustomerType: formData.lawmaCustomerType,
                    paymentType: channel,
                    paidAmount: amount,
                    transRef: ref,
                };
                console.log("Submitting application with payload:", payload);
                const { data } = await api.post("/facility-managers/smart-bin/applications", payload);

                if (data.succeeded) {
                    setNotification({ type: 'success', message: 'Submitted successfully!' });
                    // Notify parent of success and close
                    onSubmitSuccess();
                } else {
                    console.error("Error submitting application:", data.message);
                    setNotification({ type: 'error', message: data.message || "Error submitting application" });
                    handleBack(); // Go back to form/payment selection
                }
            } catch (error) {
                console.error("API Error submitting application:", error);
                setNotification({ type: 'error', message: "Network error or server issue. Please try again." });
                handleBack(); // Go back to form/payment selection
            }
        } else {
            console.error("Payment response missing required fields", { ref, amount, channel });
            setNotification({ type: 'error', message: "Payment information incomplete. Please try again." });
            handleBack(); // Go back to form/payment selection
        }
    };

    const handlePaymentWithWallet = async () => {
        try {
            const response = await api.post("/Wallet/debit-wallet", {
                userId: useAuthStore.getState().token,
                drAccountNo: initialFacilityMgrData?.accountNo,
                amount: smartBinAmount,
                narration: "Smart Bin Application Payment",
                paymentPurpose: "Smart Bin Application"
            });
            const data = response.data;
            console.log("Response from debit-wallet:", data);
            if (data.succeeded) {
                const successMessage = data.message.split('|');
                const successRef = successMessage.length > 1 ? successMessage[1] : 'N/A';
                await handlePayment({ reference: successRef, channel: "wallet" });
                setNotification({ type: 'success', message: 'Payment successful!' });
            } else {
                console.error("Wallet payment failed:", data.message);
                setNotification({ type: 'error', message: data.message || "Error processing wallet payment" });
            }
        } catch (error) {
            console.error("Error processing wallet payment:", error);
            setNotification({ type: 'error', message: "Error processing wallet payment. Please try again." });
        }
    };

    if (!isOpen) return null; // Don't render if not open

    return (
        <>
            {/* Application Form Modal */}
            <div className="fixed inset-0 bg-zinc-950/70 bg-opacity-50 backdrop-blur-sm z-50 font-sans flex items-center justify-center p-4">
                <main className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="flex justify-between items-center pb-4 border-b border-zinc-200 p-6 bg-zinc-100/20">
                        <h2 className="text-xl sm:text-2xl font-semibold text-zinc-800">Apply for Smart Bin</h2>
                        <button onClick={closeForm} aria-label="Close" className="text-red-600 hover:text-zinc-600">
                            <CloseIcon />
                        </button>
                    </div>
                    <form onSubmit={submitApplication} className="flex-1 overflow-y-auto p-6 bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-x-5 gap-y-6">
                                <div className="md:col-span-3">
                                    <label htmlFor="TenantName" className="block text-sm font-medium text-zinc-700 mb-1">Tenant Name</label>
                                    <select
                                        name="TenantName"
                                        value={formData.tenantId}
                                        onChange={handleInputChange}
                                        required
                                        className="form-select w-full border border-zinc-300 p-3 rounded-xl"
                                        style={{ backgroundColor: isDisabled ? '#f4f4f5' : 'white' }}
                                    >
                                        <option disabled value="">Select Tenant</option>
                                        {tenantsList.map((tenant) => (
                                            <option key={tenant.id} value={tenant.id}>
                                                {tenant.fullName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-3">
                                    <label htmlFor="binType" className="block text-sm font-medium text-zinc-700 mb-1">Bin Type</label>
                                    <select
                                        id="binType"
                                        disabled={isDisabled}
                                        style={{ backgroundColor: isDisabled ? '#f4f4f5' : 'white' }}
                                        name="binType" // Note: This name might conflict with formData structure
                                        value="Smart" // Hardcoded as per original form
                                        // onChange={handleInputChange} // Not needed if hardcoded
                                        required
                                        className="form-select w-full border border-zinc-300 p-3 rounded-xl"
                                    >
                                        <option value="Smart">Smart</option>
                                        {/* <option value="Not Smart">Not Smart</option> Removed as likely not applicable */}
                                    </select>
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
                                    <label htmlFor="phoneNo" className="block text-sm font-medium text-zinc-700 mb-1">Telephone</label>
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
                                <div className="md:col-span-2">
                                    <label htmlFor="lawmaCustomerType" className="block text-sm font-medium text-zinc-700 mb-1">LAWMA Customer type</label>
                                    <select
                                        id="lawmaCustomerType"
                                        disabled={isDisabled}
                                        style={{ backgroundColor: isDisabled ? '#f4f4f5' : 'white' }}
                                        name="lawmaCustomerType"
                                        value={formData.lawmaCustomerType}
                                        onChange={handleInputChange}
                                        required
                                        className="form-select w-full border border-zinc-300 p-3 rounded-xl"
                                    >
                                        <option disabled value="">Select Customer Type</option>
                                        {options.lawmaCustomerTypes.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-x-5 gap-y-6 mt-12">
                                <div className="md:col-span-2">
                                    <label htmlFor="buildingType" className="block text-sm font-medium text-zinc-700 mb-1">Building Type</label>
                                    <select
                                        id="buildingType"
                                        name="buildingType"
                                        disabled={isDisabled}
                                        style={{ backgroundColor: isDisabled ? '#f4f4f5' : 'white' }}
                                        value={formData.buildingType}
                                        onChange={handleInputChange}
                                        required
                                        className="form-select w-full border border-zinc-300 p-3 rounded-xl"
                                    >
                                        <option disabled value=""> Building Type</option>
                                        {options.buildingTypes.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="houseNo" className="block text-sm font-medium text-zinc-700 mb-1">House/Building Name</label>
                                    <input
                                        type="text"
                                        id="houseNo"
                                        disabled={isDisabled}
                                        style={{ backgroundColor: isDisabled ? '#f4f4f5' : 'white' }}
                                        name="houseNo"
                                        value={formData.houseNo}
                                        onChange={handleInputChange}
                                        placeholder="House/Building Name"
                                        // required // Optional based on requirements
                                        className="form-input w-full border border-zinc-300 p-4 rounded-xl"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="flatNo" className="block text-sm font-medium text-zinc-700 mb-1">Flat number</label>
                                    <input
                                        type="text"
                                        id="flatNo"
                                        disabled={isDisabled}
                                        style={{ backgroundColor: isDisabled ? '#f4f4f5' : 'white' }}
                                        name="flatNo"
                                        value={formData.flatNo}
                                        onChange={handleInputChange}
                                        placeholder="Flat Number"
                                        // required // Optional based on requirements
                                        className="form-input w-full border border-zinc-300 p-4 rounded-xl"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="lga" className="block text-sm font-medium text-zinc-700 mb-1">Local Government</label>
                                    <select
                                        id="lga"
                                        name="lga"
                                        disabled={isDisabled}
                                        style={{ backgroundColor: isDisabled ? '#f4f4f5' : 'white' }}
                                        value={formData.lga}
                                        onChange={handleInputChange}
                                        required
                                        className="form-select w-full border border-zinc-300 p-3 rounded-xl"
                                    >
                                        <option disabled value="">Select Local Government</option>
                                        {options.lgas.map((option, index) => (
                                            <option key={`${option}-${index}`} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="closestLandmark" className="block text-sm font-medium text-zinc-700 mb-1">Closest Landmark</label>
                                    <input
                                        type="text"
                                        disabled={isDisabled}
                                        style={{ backgroundColor: isDisabled ? '#f4f4f5' : 'white' }}
                                        id="closestLandmark"
                                        name='closestLandmark'
                                        onChange={handleInputChange}
                                        value={formData.closestLandmark}
                                        placeholder="Landmark"
                                        className="w-full p-4 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-150 ease-in-out text-sm placeholder-zinc-400"
                                    />
                                </div>
                                <div className="md:col-span-6">
                                    <label htmlFor="streetName" className="block text-sm font-medium text-zinc-700 mb-1">Full Address <span className="text-red-500">*</span></label>
                                    <input
                                        id="streetName"
                                        value={formData.streetName}
                                        disabled={isDisabled}
                                        style={{ backgroundColor: isDisabled ? '#f4f4f5' : 'white' }}
                                        name='streetName'
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter your full address"
                                        className="w-full p-4 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-150 ease-in-out text-sm placeholder-zinc-400"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-8 mt-12 mb-4">
                                <button
                                    type="button"
                                    onClick={cancelForm}
                                    className="px-5 py-2 bg-white border border-green-700 rounded-md shadow-sm text-sm font-medium text-green-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-green-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    Next
                                </button>
                            </div>
                        </form>
                </main>
            </div>

            {/* Payment Modal */}
            {isPaymentModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content lg:p-8">
                        <div className="flex justify-between items-center py-6 mx-8 border-b border-zinc-200">
                            <h3 className="text-lg font-semibold text-zinc-800">Select Payment Method</h3>
                            <button
                                onClick={closeModal}
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
                                    Pay from wallet (₦{smartBinAmount})
                                </span>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    id="wallet"
                                    value="wallet"
                                    checked={selectedPaymentMethod === 'wallet'}
                                    onChange={() => setSelectedPaymentMethod('wallet')}
                                    className="custom-radio"
                                />
                            </label>
                            <label className="px-6 py-4 rounded-lg flex items-center gap-4">
                                <AlatIcon />
                                <span className="text-sm font-medium text-zinc-800 flex-grow">
                                    Pay with Alat By Wema
                                </span>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    id="card"
                                    value="card"
                                    checked={selectedPaymentMethod === 'card'}
                                    onChange={() => setSelectedPaymentMethod('card')}
                                    className="custom-radio"
                                />
                            </label>
                        </div>
                        <div className="px-6 py-4 flex flex-col items-center gap-3">
                            {selectedPaymentMethod === 'card' ? (
                                <AlatPayButton
                                    amount={smartBinAmount}
                                    onTransaction={(response) => { handlePayment(response); }} // Pass response correctly
                                    buttonText="Pay Now with ALATPay"
                                    buttonClassName="btn btn-primary w-full"
                                />
                            ) : (
                                <button
                                    onClick={handlePaymentWithWallet}
                                    className="btn btn-primary w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                                >
                                    Make Payment
                                </button>
                            )}
                            <button
                                onClick={handleBack}
                                className="w-full text-center font-medium text-green-700 hover:text-green-900 py-2"
                            >
                                Go back
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification for Form/Payment */}
            {notification && (
                <div
                    className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg max-w-sm z-50 ${notification.type === 'success' ? 'bg-green-100 border border-green-400 text-green-800' : 'bg-red-100 border border-red-400 text-red-800'}`}
                    role={notification.type === 'error' ? 'alert' : 'status'}
                >
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{notification.message}</p>
                        <button
                            onClick={clearNotification}
                            className={`ml-4 text-xl font-semibold leading-none ${notification.type === 'success' ? 'text-green-800 hover:text-green-900' : 'text-red-800 hover:text-red-900'} focus:outline-none`}
                            aria-label="Close notification"
                        >
                            &times;
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default SmartBinApplicationForm;