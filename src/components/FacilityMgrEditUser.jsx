import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

// Raw SVG Icons from Heroicons (adjusted for direct use)
const EyeIcon = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 9.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);
const EyeSlashIcon = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.981 18.062A10.05 10.05 0 0 0 12 21.75c4.23 0 7.962-2.31 9.963-5.738M2.378 9.313a10.05 10.05 0 0 1 10.278-5.816c1.026 0 2.02.11 2.973.32M12 12c2.485 0 4.5-2.015 4.5-4.5S14.485 3 12 3c-2.484 0-4.5 2.015-4.5 4.5S9.516 12 12 12ZM12 12v6.75" />
    </svg>
);
const ChevronDownIcon = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);
const ChevronUpIcon = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
    </svg>
);
const PlusIcon = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);
const XMarkIcon = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);
const CheckCircleIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

// Branch Form Component (Collapsible)
const BranchForm = ({ branch, index, onUpdate, onRemove, onToggleCollapse, isCollapsed }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        onUpdate(index, { ...branch, [name]: value });
    };

    return (
        <div className={`mb-4 ${isCollapsed ? 'bg-zinc-100 p-4' : ''}`}>
            <div className="flex justify-between items-center cursor-pointer" onClick={() => onToggleCollapse(index)}>
                <h4 className="text-lg font-semibold text-zinc-700">{branch.branchName || `Branch ${index + 1}`}</h4>
                {isCollapsed ? <ChevronDownIcon /> : <ChevronUpIcon />}
            </div>

            {!isCollapsed && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor={`branchName-${index}`} className="block text-sm font-medium text-zinc-700">Branch Name</label>
                        <input
                            type="text"
                            id={`branchName-${index}`}
                            name="branchName"
                            value={branch.branchName || ''}
                            onChange={handleChange}
                            placeholder="e.g. Ketu, Laddu, Alapere"
                            className="mt-1 block w-full rounded-xl border border-zinc-300 focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14"
                        />
                    </div>
                    <div>
                        <label htmlFor={`lawmaCustomerType-${index}`} className="block text-sm font-medium text-zinc-700">LAWMA Customer Type</label>
                        <select
                            id={`lawmaCustomerType-${index}`}
                            name="lawmaCustomerType"
                            value={branch.lawmaCustomerType || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-xl border border-zinc-300 focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14 bg-white"
                        >
                            <option value="">Select</option>
                            <option value="existing">Existing</option>
                            <option value="new">New</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor={`localGovernment-${index}`} className="block text-sm font-medium text-zinc-700">Local Government</label>
                        <select
                            id={`localGovernment-${index}`}
                            name="localGovernment"
                            value={branch.localGovernment || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-xl border border-zinc-300 focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14 bg-white"
                        >
                            <option value="">Local Government</option>
                            <option value="ikeja">Ikeja</option>
                            <option value="eti-osa">Eti-Osa</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor={`closestLandmark-${index}`} className="block text-sm font-medium text-zinc-700">Closest Landmark</label>
                        <input
                            type="text"
                            id={`closestLandmark-${index}`}
                            name="closestLandmark"
                            value={branch.closestLandmark || ''}
                            onChange={handleChange}
                            placeholder="Closest landmark"
                            className="mt-1 block w-full rounded-xl border border-zinc-300 focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor={`address-${index}`} className="block text-sm font-medium text-zinc-700">Address</label>
                        <input
                            type="text"
                            id={`address-${index}`}
                            name="address"
                            value={branch.address || ''}
                            onChange={handleChange}
                            placeholder="Address"
                            className="mt-1 block w-full rounded-xl border border-zinc-300 focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14"
                        />
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => onToggleCollapse(index)}
                            className="inline-flex justify-center rounded-md border border-transparent bg-green-700 py-2 px-6 font-medium text-white hover:bg-green-800 transition duration-150 ease-in-out"
                        >
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={() => onRemove(index)}
                            className="inline-flex justify-center rounded-md border border-red-600 py-2 px-4 text-sm font-medium text-red-500 hover:text-white hover:bg-red-700 transition duration-150 ease-in-out"
                        >
                            Remove Branch
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Confirmation Modal
const ConfirmationModal = ({ show, onClose, onConfirm, userData, branches }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 font-inter">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-zinc-900">Confirm Update User</h3>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="text-zinc-700 text-sm mb-6 max-h-96 overflow-y-auto pr-2">
                    <p className="mb-2"><span className="font-medium">Customer Type:</span> <span className="capitalize">{userData.customerType}</span></p>
                    {userData.customerType === 'corporate' ? (
                        <>
                            <p className="mb-2"><span className="font-medium">Business Name:</span> {userData.businessName}</p>
                            <p className="mb-2"><span className="font-medium">Company Email Address:</span> {userData.companyEmailAddress}</p>
                            <p className="mb-2"><span className="font-medium">Company Telephone:</span> {userData.companyTelephone}</p>
                            <p className="mb-2"><span className="font-medium">First Name:</span> {userData.corporateFirstName}</p>
                            <p className="mb-2"><span className="font-medium">Last Name:</span> {userData.corporateLastName}</p>
                            <p className="mb-2"><span className="font-medium">Phone Number:</span> {userData.corporatePhoneNumber}</p>
                            <p className="mb-2"><span className="font-medium">Email Address:</span> {userData.corporateEmailAddress}</p>
                        </>
                    ) : (
                        <>
                            <p className="mb-2"><span className="font-medium">Payer ID:</span> {userData.payerId}</p>
                            <p className="mb-2"><span className="font-medium">First Name:</span> {userData.firstName}</p>
                            <p className="mb-2"><span className="font-medium">Last Name:</span> {userData.lastName}</p>
                            <p className="mb-2"><span className="font-medium">Email Address:</span> {userData.emailAddress}</p>
                            <p className="mb-2"><span className="font-medium">Phone Number:</span> {userData.phoneNumber}</p>
                            <p className="mb-2"><span className="font-medium">LAWMA Customer Type:</span> {userData.lawmaCustomerType}</p>
                            <p className="mb-2"><span className="font-medium">Building Type:</span> {userData.buildingType}</p>
                            <p className="mb-2"><span className="font-medium">House Number:</span> {userData.houseNumber}</p>
                            <p className="mb-2"><span className="font-medium">Flat Number:</span> {userData.flatNumber}</p>
                            <p className="mb-2"><span className="font-medium">Full Address:</span> {userData.fullAddress}</p>
                            <p className="mb-2"><span className="font-medium">Local Government:</span> {userData.localGovernment}</p>
                            <p className="mb-2"><span className="font-medium">Closest Landmark:</span> {userData.closestLandmark}</p>
                        </>
                    )}
                    {userData.customerType === 'corporate' && branches.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-zinc-200">
                            <h4 className="font-semibold text-zinc-800 mb-3">Company Branches:</h4>
                            {branches.map((branch, idx) => (
                                <div key={idx} className="mb-3 p-3 bg-zinc-100 rounded-md">
                                    <p className="font-medium text-zinc-700">Branch {idx + 1}:</p>
                                    <p className="ml-2 text-zinc-600">Name: {branch.branchName || 'N/A'}</p>
                                    <p className="ml-2 text-zinc-600">LAWMA Customer Type: {branch.lawmaCustomerType || 'N/A'}</p>
                                    <p className="ml-2 text-zinc-600">Local Government: {branch.localGovernment || 'N/A'}</p>
                                    <p className="ml-2 text-zinc-600">Closest Landmark: {branch.closestLandmark || 'N/A'}</p>
                                    <p className="ml-2 text-zinc-600">Address: {branch.address || 'N/A'}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="inline-flex justify-center rounded-md border border-zinc-300 bg-white py-2 px-4 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-150 ease-in-out"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="inline-flex justify-center rounded-md border border-transparent bg-green-700 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-150 ease-in-out"
                    >
                        Confirm Update User
                    </button>
                </div>
            </div>
        </div>
    );
};

// Success Modal
const SuccessModal = ({ show, onClose, message }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 font-inter">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm text-center">
                <div className="flex justify-center mb-4">
                    <CheckCircleIcon className="w-16 h-16 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 mb-3">Success!</h3>
                <p className="text-zinc-700 mb-6">{message}</p>
                <button
                    onClick={onClose}
                    className="inline-flex justify-center rounded-md border border-transparent bg-green-700 py-2 px-6 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-150 ease-in-out"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

// Main EditUserModal Component
const EditUserModal = ({ show, onClose, devMode = false, userType, userId, onSuccess }) => {
    const [userData, setUserData] = useState({
        customerType: '',
        payerId: '',
        firstName: '',
        lastName: '',
        emailAddress: '',
        phoneNumber: '',
        lawmaCustomerType: '',
        buildingType: '',
        buildingName: '',
        houseNumber: '',
        flatNumber: '',
        fullAddress: '',
        localGovernment: '',
        closestLandmark: '',
        binType: '',
        businessName: '',
        companyEmailAddress: '',
        companyTelephone: '',
        corporateFirstName: '',
        corporateLastName: '',
        corporatePhoneNumber: '',
        corporateEmailAddress: '',
        password: '',
        confirmPassword: '',
    });

    const [branches, setBranches] = useState([{
        branchName: '',
        lawmaCustomerType: '',
        localGovernment: '',
        closestLandmark: '',
        address: '',
        isCollapsed: false
    }]);

    const [lgas, setLgas] = useState([]);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const fetchLga = async () => {
        try {
            const { data } = await api.get("/utility/get-lgas");
            if ((data.succeeded || data.success) && Array.isArray(data.data)) {
                setLgas(data.data);
            }
        } catch (error) {
            console.error("Error fetching LGA:", error);
        }
    };

    const mockApiCall = (userData, devMode) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (devMode) {
                    console.log("Dev Mode: Using dummy data for API call.");
                    resolve({
                        success: true,
                        message: "User fetched successfully (Dev Mode)",
                        data: { ...userData, id: `dummy-${Date.now()}` },
                    });
                } else {
                    console.log("Live Mode: Simulating real API call.");
                    resolve({
                        success: true,
                        message: "User fetched successfully!",
                        data: { ...userData, id: `real-${Date.now()}` },
                    });
                }
            }, 1000);
        });
    };

    // Fetch user data
    const getUser = async (userType, userId) => {
        try {
            if (!devMode) {
                const { data } = await api.get('/facility-managers/user/tenants');
                if (data.success && Array.isArray(data.data)) {
                    const item = data.data.find(t => t._id === userId || t.id === userId);
                    if (item) {
                        setUserData({
                            customerType: 'tenant',
                            payerId: item.payerId || item.payerID || '',
                            firstName: item.firstName || '',
                            lastName: item.lastName || '',
                            emailAddress: item.email || '',
                            phoneNumber: item.phoneNumber || item.phoneNo || '',
                            lawmaCustomerType: item.lawmaCustomerType || '',
                            buildingType: item.buildingType || '',
                            buildingName: item.buildingName || '',
                            houseNumber: item.houseNumber || item.houseNo || '',
                            flatNumber: item.flatNumber || item.flatNo || '',
                            fullAddress: item.address || item.residentialAddress || '',
                            localGovernment: item.localGovernment || item.localGovernmentArea?.id || item.localGovernmentArea?.name || item.lga || '',
                            closestLandmark: item.closestLandmark || item.landMark || '',
                            binType: item.binType || '',
                        });
                        return;
                    }
                }
            }

            const response = await mockApiCall({ id: userId, type: userType }, devMode);
            if (response.success && response.data) {
                const fetchedData = response.data;
                setUserData(prev => ({
                    ...prev,
                    customerType: userType,
                    ...fetchedData
                }));
                if (userType === 'corporate' && fetchedData.branches?.length > 0) {
                    setBranches(fetchedData.branches.map(branch => ({
                        ...branch,
                        isCollapsed: false
                    })));
                }
            }
        } catch (error) {
            console.error("Failed to fetch user:", error);
        }
    };

    useEffect(() => {
        if (show) {
            fetchLga();
            if (userId && userType) {
                getUser(userType, userId);
            }
        }
    }, [show, userId, userType]);

    // Handle input changes for main user data
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Add a new corporate branch
    const addBranch = () => {
        setBranches((prevBranches) => [
            ...prevBranches,
            {
                branchName: '',
                lawmaCustomerType: '',
                localGovernment: '',
                closestLandmark: '',
                address: '',
                isCollapsed: false
            },
        ]);
    };

    // Update a specific corporate branch
    const updateBranch = (index, updatedBranch) => {
        setBranches((prevBranches) =>
            prevBranches.map((branch, i) => (i === index ? updatedBranch : branch))
        );
    };

    // Remove a corporate branch
    const removeBranch = (indexToRemove) => {
        setBranches((prevBranches) => prevBranches.filter((_, i) => i !== indexToRemove));
    };

    // Toggle collapse state for a branch form
    const toggleBranchCollapse = (indexToToggle) => {
        setBranches((prevBranches) =>
            prevBranches.map((branch, i) =>
                i === indexToToggle ? { ...branch, isCollapsed: !branch.isCollapsed } : branch
            )
        );
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (userData.password !== userData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        setShowConfirmationModal(true);
    };

    // Confirm and proceed with API call
    const handleConfirmAddUser = async () => {
        setShowConfirmationModal(false);
        setIsSubmitting(true);
        try {
            const dataToSend = { ...userData };
            if (userData.customerType === 'corporate') {
                dataToSend.branches = branches;
            }

            let responseData;
            if (!devMode) {
                const payload = {
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    email: userData.emailAddress || userData.email,
                    phoneNumber: userData.phoneNumber,
                    houseNumber: userData.houseNumber,
                    flatNumber: userData.flatNumber,
                    buildingName: userData.buildingName,
                    buildingType: userData.buildingType,
                    address: userData.fullAddress || userData.address,
                    localGovernment: userData.localGovernment,
                    closestLandmark: userData.closestLandmark,
                    lawmaCustomerType: userData.lawmaCustomerType,
                    binType: userData.binType,
                };
                const res = await api.patch(`/facility-managers/user/${userId}`, payload);
                responseData = res.data;
            } else {
                responseData = await editUserMockApiCall(dataToSend, devMode);
            }

            if (responseData.success || responseData.succeeded) {
                setSuccessMessage(responseData.message || "User updated successfully!");
                setShowSuccessModal(true);
                if (onSuccess) onSuccess();
            } else {
                console.error("API Error:", responseData.message);
                alert("Failed to update user: " + responseData.message);
            }
        } catch (error) {
            console.error("Submission error:", error);
            const errMsg = error.response?.data?.message || "An error occurred during submission.";
            alert("Failed to update user: " + errMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Close success modal and reset form/close main modal
    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
        onClose(); // Close the main modal
        setUserData({
            customerType: '',
            payerId: '',
            firstName: '',
            lastName: '',
            emailAddress: '',
            phoneNumber: '',
            lawmaCustomerType: '',
            buildingType: '',
            houseNumber: '',
            flatNumber: '',
            fullAddress: '',
            localGovernment: '',
            closestLandmark: '',
            businessName: '',
            companyEmailAddress: '',
            companyTelephone: '',
            corporateFirstName: '',
            corporateLastName: '',
            corporatePhoneNumber: '',
            corporateEmailAddress: '',
            password: '',
            confirmPassword: '',
        });
        setBranches([]);
    };

    // Mock API call for editing user
    const editUserMockApiCall = (userData, devMode) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (devMode) {
                    resolve({
                        success: true,
                        message: "User updated successfully (Dev Mode)",
                        data: userData,
                    });
                } else {
                    resolve({
                        success: true,
                        message: "User updated successfully!",
                        data: { ...userData, updatedAt: new Date().toISOString() },
                    });
                }
            }, 1500);
        });
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-white flex items-center justify-center p-4 z-40 font-inter overflow-y-auto">
            <div className="bg-white rounded-lg w-full max-w-5xl overflow-hidden flex flex-col transform transition-all sm:my-8 sm:align-middle sm:w-full md:ml-[15%] max-h-[90vh]">
                {/* Modal Header */}
                <div className="px-6 py-5 flex justify-between items-center">
                    <h2 className="text-2xl text-zinc-900">Edit User</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
                        <XMarkIcon className="w-7 h-7" />
                    </button>
                </div>
                {/* Scrollable Form Container */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Customer Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="customerType" className="block text-sm font-medium text-zinc-700">Customer Type</label>
                                <input
                                    type="text"
                                    id="customerType"
                                    name="customerType"
                                    value={userData.customerType ? userData.customerType.charAt(0).toUpperCase() + userData.customerType.slice(1) : ''}
                                    disabled
                                    className="mt-1 block w-full rounded-xl border border-zinc-300 bg-zinc-100 text-zinc-600 focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14"
                                />
                            </div>
                        </div>

                        {/* Resident or Corporate Fields */}
                        {userData.customerType === 'resident' || userData.customerType === 'tenant' ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="payerId" className="block text-sm font-medium text-zinc-700">Payer ID</label>
                                        <input
                                            type="text"
                                            id="payerId"
                                            name="payerId"
                                            value={userData.payerId}
                                            onChange={handleChange}
                                            placeholder="Payer ID"
                                            className="mt-1 block w-full rounded-xl border border-zinc-300 focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="firstName" className="block text-sm font-medium text-zinc-700">First Name</label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            value={userData.firstName}
                                            onChange={handleChange}
                                            placeholder="First Name"
                                            required
                                            className="mt-1 block w-full rounded-xl border border-zinc-300 focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="lastName" className="block text-sm font-medium text-zinc-700">Last Name</label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            value={userData.lastName}
                                            onChange={handleChange}
                                            placeholder="Last Name"
                                            required
                                            className="mt-1 block w-full rounded-xl border border-zinc-300 focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="emailAddress" className="block text-sm font-medium text-zinc-700">Email address</label>
                                        <input
                                            type="email"
                                            id="emailAddress"
                                            name="emailAddress"
                                            value={userData.emailAddress}
                                            onChange={handleChange}
                                            placeholder="Email address"
                                            required
                                            className="mt-1 block w-full rounded-xl border border-zinc-300 focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-zinc-700">Phone Number</label>
                                        <input
                                            type="tel"
                                            id="phoneNumber"
                                            name="phoneNumber"
                                            value={userData.phoneNumber}
                                            onChange={handleChange}
                                            placeholder="Phone number"
                                            required
                                            className="mt-1 block w-full rounded-xl border border-zinc-300 focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="lawmaCustomerType" className="block text-sm font-medium text-zinc-700">LAWMA Customer type</label>
                                        <select
                                            id="lawmaCustomerType"
                                            name="lawmaCustomerType"
                                            value={userData.lawmaCustomerType || ''}
                                            onChange={handleChange}
                                            required
                                            className="mt-1 block w-full rounded-xl border border-zinc-300 focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14 bg-white"
                                        >
                                            <option value="">Select existing or new</option>
                                            <option value="Returning">Existing</option>
                                            <option value="New">New</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="buildingName" className="block text-sm font-medium text-zinc-700">Building/Facility name</label>
                                        <input
                                            type="text"
                                            id="buildingName"
                                            name="buildingName"
                                            value={userData.buildingName}
                                            onChange={handleChange}
                                            placeholder="Building Name"
                                            required
                                            className="mt-1 block w-full rounded-xl border border-zinc-300 focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="buildingType" className="block text-sm font-medium text-zinc-700">Building Type</label>
                                        <select
                                            id="buildingType"
                                            name="buildingType"
                                            value={userData.buildingType || ''}
                                            onChange={handleChange}
                                            required
                                            className="mt-1 block w-full rounded-xl border border-zinc-300 focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14 bg-white"
                                        >
                                            <option value="">Building type</option>
                                            {['Duplex', 'Bungalow', 'Block of Flats', 'Terrace', 'Detached', 'Semi-Detached', 'Other'].map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="houseNumber" className="block text-sm font-medium text-zinc-700">House number</label>
                                        <input
                                            type="text"
                                            id="houseNumber"
                                            name="houseNumber"
                                            value={userData.houseNumber}
                                            onChange={handleChange}
                                            placeholder="House number"
                                            required
                                            className="mt-1 block w-full rounded-xl border border-zinc-300 focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="flatNumber" className="block text-sm font-medium text-zinc-700">Flat number</label>
                                        <input
                                            type="text"
                                            id="flatNumber"
                                            name="flatNumber"
                                            value={userData.flatNumber}
                                            onChange={handleChange}
                                            placeholder="Flat number"
                                            required
                                            className="mt-1 block w-full rounded-xl border border-zinc-300 focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label htmlFor="fullAddress" className="block text-sm font-medium text-zinc-700">Full Address</label>
                                        <input
                                            type="text"
                                            id="fullAddress"
                                            name="fullAddress"
                                            value={userData.fullAddress}
                                            onChange={handleChange}
                                            placeholder="Address"
                                            required
                                            className="mt-1 block w-full rounded-xl border border-zinc-300 focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="localGovernment" className="block text-sm font-medium text-zinc-700">Local Government</label>
                                        <select
                                            id="localGovernment"
                                            name="localGovernment"
                                            value={userData.localGovernment || ''}
                                            onChange={handleChange}
                                            required
                                            className="mt-1 block w-full rounded-xl border border-zinc-300 focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14 bg-white"
                                        >
                                            <option value="">Select Local Government</option>
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
                                    </div>
                                    <div>
                                        <label htmlFor="closestLandmark" className="block text-sm font-medium text-zinc-700">Closest Landmark</label>
                                        <input
                                            type="text"
                                            id="closestLandmark"
                                            name="closestLandmark"
                                            value={userData.closestLandmark}
                                            onChange={handleChange}
                                            placeholder="Closest landmark"
                                            required
                                            className="mt-1 block w-full rounded-xl border border-zinc-300 focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="binType" className="block text-sm font-medium text-zinc-700">Bin type</label>
                                        <select
                                            id="binType"
                                            name="binType"
                                            value={userData.binType || ''}
                                            onChange={handleChange}
                                            required
                                            className="mt-1 block w-full rounded-xl border border-zinc-300 focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14 bg-white"
                                        >
                                            <option value="">Select Bin type</option>
                                            <option value="smart">Smart</option>
                                            <option value="non_Smart">Not Smart</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        ) : userData.customerType === 'corporate' && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="businessName" className="block text-sm font-medium text-zinc-700">Business Name</label>
                                        <input
                                            type="text"
                                            id="businessName"
                                            name="businessName"
                                            value={userData.businessName}
                                            onChange={handleChange}
                                            placeholder="Business name"
                                            required
                                            className="mt-1 block w-full rounded-xl border border-zinc-300 focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="companyEmailAddress" className="block text-sm font-medium text-zinc-700">Company Email Address</label>
                                        <input
                                            type="email"
                                            id="companyEmailAddress"
                                            name="companyEmailAddress"
                                            value={userData.companyEmailAddress}
                                            onChange={handleChange}
                                            placeholder="Company Email Address"
                                            required
                                            className="mt-1 block w-full rounded-xl border border-zinc-300 focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="companyTelephone" className="block text-sm font-medium text-zinc-700">Company Telephone</label>
                                        <input
                                            type="tel"
                                            id="companyTelephone"
                                            name="companyTelephone"
                                            value={userData.companyTelephone}
                                            onChange={handleChange}
                                            placeholder="Company telephone"
                                            className="mt-1 block w-full rounded-xl border border-zinc-300 focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="corporateFirstName" className="block text-sm font-medium text-zinc-700">First Name</label>
                                        <input
                                            type="text"
                                            id="corporateFirstName"
                                            name="corporateFirstName"
                                            value={userData.corporateFirstName}
                                            onChange={handleChange}
                                            placeholder="First Name"
                                            required
                                            className="mt-1 block w-full rounded-xl border border-zinc-300 focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="corporateLastName" className="block text-sm font-medium text-zinc-700">Last Name</label>
                                        <input
                                            type="text"
                                            id="corporateLastName"
                                            name="corporateLastName"
                                            value={userData.corporateLastName}
                                            onChange={handleChange}
                                            placeholder="Last Name"
                                            required
                                            className="mt-1 block w-full rounded-xl border border-zinc-300 focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="corporatePhoneNumber" className="block text-sm font-medium text-zinc-700">Phone Number</label>
                                        <input
                                            type="tel"
                                            id="corporatePhoneNumber"
                                            name="corporatePhoneNumber"
                                            value={userData.corporatePhoneNumber}
                                            onChange={handleChange}
                                            placeholder="Phone Number"
                                            className="mt-1 block w-full rounded-xl border border-zinc-300 focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="corporateEmailAddress" className="block text-sm font-medium text-zinc-700">Email Address</label>
                                        <input
                                            type="email"
                                            id="corporateEmailAddress"
                                            name="corporateEmailAddress"
                                            value={userData.corporateEmailAddress}
                                            onChange={handleChange}
                                            placeholder="Email Address"
                                            required
                                            className="mt-1 block w-full rounded-xl border border-zinc-300 focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Password fields */}
                        <section>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <label htmlFor="password" className="block text-sm font-medium text-zinc-700">Password</label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={userData.password}
                                        onChange={handleChange}
                                        placeholder="Password"
                                        required
                                        className="mt-1 block w-full rounded-xl border border-zinc-300 focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center pt-6 text-zinc-400"
                                    >
                                        {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                    </button>
                                </div>
                                <div className="relative">
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-700">Confirm Password</label>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={userData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Confirm Password"
                                        required
                                        className="mt-1 block w-full rounded-xl border border-zinc-300 focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center pt-6 text-zinc-400"
                                    >
                                        {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Corporate Branch Information */}
                        {userData.customerType === 'corporate' && (
                            <section>
                                <h3 className="text-lg font-semibold text-green-700 mb-4">Update company branches</h3>
                                {branches.map((branch, index) => (
                                    <BranchForm
                                        key={index}
                                        branch={branch}
                                        index={index}
                                        onUpdate={updateBranch}
                                        onRemove={removeBranch}
                                        onToggleCollapse={toggleBranchCollapse}
                                        isCollapsed={branch.isCollapsed}
                                    />
                                ))}
                                <button
                                    type="button"
                                    onClick={addBranch}
                                    className="inline-flex items-center py-4 border border-transparent text-lg font-medium rounded-md text-green-700 hover:text-green-800 focus:outline-none focus:ring-none"
                                >
                                    <span className='mr-2'>Add new</span> <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                                </button>
                            </section>
                        )}

                        {/* Action Buttons */}
                        <div className="pt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="inline-flex justify-center rounded-lg border border-green-700 bg-white py-4 px-6 text-base font-medium text-green-700 hover:bg-zinc-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`inline-flex justify-center rounded-lg border border-transparent py-4 px-12 text-base font-medium text-white
                  ${isSubmitting ? 'bg-zinc-400 cursor-not-allowed' : 'bg-green-700 hover:bg-green-700'}`}
                            >
                                {isSubmitting ? 'Updating...' : 'Update User'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Modals */}
                <ConfirmationModal
                    show={showConfirmationModal}
                    onClose={() => setShowConfirmationModal(false)}
                    onConfirm={handleConfirmAddUser}
                    userData={userData}
                    branches={branches}
                />
                <SuccessModal
                    show={showSuccessModal}
                    onClose={handleCloseSuccessModal}
                    message={successMessage}
                />
            </div>
        </div>
    );
};

export default EditUserModal;