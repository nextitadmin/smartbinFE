import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/AgentSidebar';
import Topbar from '../components/AgentTopBar';
import api from "../api/axiosConfig.js";
import useAuthStore from '../store/authStore';







const KYCApplication = () => {

    // --- State ---




    // --- Dynamic Options Data ---





    // --- Progress Step Component ---

    // --- Progress Connector ---



    // --- State ---
    const [currentStage, setCurrentStage] = useState(1);
    const [notification, setNotification] = useState(null);
    const [formData, setFormData] = useState({
        personal: {
            lastName: '',
            firstName: '',
            email: '',
            phone: '',
            nationality: '',
            gender: ''
        },
        documents: {
            idType: '',
            idNumber: '',
            file: null,
            fileName: ''
        },
        agency: { // New section for agency information
            agencyName: '',
            registrationNumber: '',
            businessEmail: '',
            businessPhone: '',
            branches: [
                { name: '', address: '' }
            ],
            agencyCertificate: null // New field for agency certificate
        },

    });
    const navigate = useNavigate();
    const clearNotification = () => {
        setNotification(null);
    };

    useEffect(() => {
        const checkKycStatus = async () => {
            try {
                const { data } = await api.get('/agent/kyc/status');
                if (data.success && data.data) {
                    const { hasSubmittedPersonalInformation, hasSubmittedAddress, hasSubmittedIdentity } = data.data;
                    const hasStartedKyc = hasSubmittedPersonalInformation || hasSubmittedAddress || hasSubmittedIdentity;
                    if (hasStartedKyc) {
                        navigate('/newkycapplication');
                    }
                }
            } catch (error) {
                console.log('KYC status check failed:', error);
            }
        };

        checkKycStatus();
    }, [navigate]);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                clearNotification();
            }, 5000); // Hide after 5 seconds
            return () => clearTimeout(timer); // Cleanup timer on component unmount or notification change
        }
    }, [notification]);

    // --- Handlers ---
    const handleInputChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleBranchInputChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            agency: {
                ...prev.agency,
                branches: prev.agency.branches.map((branch, i) =>
                    i === index ? { ...branch, [field]: value } : branch
                )
            }
        }));
    };

    const addBranch = () => {
        setFormData(prev => ({
            ...prev,
            agency: {
                ...prev.agency,
                branches: [...prev.agency.branches, { name: '', address: '' }]
            }
        }));
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (!allowedTypes.includes(file.type)) {
                setNotification({ type: 'error', message: "Invalid file type. Please upload PNG, JPG, or PDF." });
                event.target.value = ''; // Reset file input
                return;
            }
            if (file.size > maxSize) {
                setNotification({ type: 'error', message: "File exceeds 10MB limit." });
                event.target.value = ''; // Reset file input
                return;
            }
            setFormData(prev => ({
                ...prev,
                documents: {
                    ...prev.documents,
                    file,
                    fileName: file.name
                }
            }));
        }
    };
    const handleAgencyDocUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (!allowedTypes.includes(file.type)) {
                setNotification({ type: 'error', message: "Invalid file type. Please upload PNG, JPG, or PDF." });
                event.target.value = ''; // Reset file input
                return;
            }
            if (file.size > maxSize) {
                setNotification({ type: 'error', message: "File exceeds 10MB limit." });
                event.target.value = ''; // Reset file input
                return;
            }
            setFormData(prev => ({
                ...prev,
                agency: {
                    ...prev.agency,
                    file,
                    agencyCertificate: file.name
                }
            }));
        }
    };
    const removeFile = () => {
        setFormData(prev => ({
            ...prev,
            documents: {
                ...prev.documents,
                file: null,
                fileName: ''
            }
        }));
        // If you have a file input ref, you might want to reset it here too:
        // e.g., fileInputRef.current.value = null;
    };



    const removeBranch = (index) => {
        setFormData(prev => ({
            ...prev,
            agency: {
                ...prev.agency,
                branches: prev.agency.branches.filter((_, i) => i !== index)
            }
        }));
    };

    const nextStage = () => {
        // Validation logic
        if (currentStage === 2) {
            if (
                !formData.agency.agencyName ||
                !formData.agency.registrationNumber ||
                !formData.agency.businessEmail ||
                !formData.agency.businessPhone ||
                formData.agency.branches.some(branch => !branch.name || !branch.address)
            ) {
                setNotification({ type: 'error', message: 'Fill all the details' });
                console.log('Please fill in all required fields.', formData);
                return;
            }
        }
        if (currentStage < 4) {
            setCurrentStage(currentStage + 1);
        }
    };

    const prevStage = () => {
        if (currentStage > 1) {
            setCurrentStage(currentStage - 1);
        }
    };

    const handleSubmit = async () => {
        // Ensure all validations pass one last time (optional, as nextStage should handle it)
        if (!formData.agency.agencyName ||
            !formData.agency.registrationNumber ||
            !formData.agency.businessEmail ||
            !formData.agency.businessPhone ||
            formData.agency.branches.some(branch => !branch.name || !branch.address)
        ) {
            setNotification({ type: 'error', message: 'Please ensure all agency details are filled correctly.' });
            return;
        }
        try {
            const payload = {
                residentID: useAuthStore.getState().token,
                agencyName: formData.agency.agencyName,
                registrationNumber: formData.agency.registrationNumber,
                businessEmail: formData.agency.businessEmail,
                businessPhone: formData.agency.businessPhone,
                branches: formData.agency.branches.map(branch => ({
                    name: branch.name,
                    address: branch.address
                }))
            };
            console.log("Submitting KYC with payload:", payload);
            const { data } = await api.post(
                '/agent/kyc',
                payload
            );
            if (data.succeeded || data.success) {
                setNotification({ type: 'success', message: 'Submitted successfully!' });
                setCurrentStage(4); // Move to confirmation stage
            } else {
                setNotification({ type: 'error', message: data.message || "Error submitting" });
            }
        } catch (error) {
            console.log("Error creating KYC", error);
            setNotification({ type: 'error', message: "Error submitting. Check console for details." });
        }
    };

    // --- Progress Step Component ---
    const ProgressStep = ({ number, active, completed, label }) => (
        <div className="flex-1 flex flex-col items-center text-center">
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold mb-1 transition-all duration-300 ${completed ? 'bg-green-500 border-green-500 text-white' : active ? 'border-green-700 bg-green-700 text-white' : 'border-zinc-300 text-zinc-400'
                }`}>
                {completed ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                ) : (
                    <span>{number}</span>
                )}
            </div>
            <span className={`text-xs md:text-sm ${active || completed ? 'text-zinc-800 font-medium' : 'text-zinc-500'
                }`}>
                {label}
            </span>
        </div>
    );

    // --- Progress Connector ---
    const ProgressConnector = ({ active }) => (
        <div className={`flex-1 mt-4 h-0.5 transition-colors duration-300 ${active ? 'bg-green-500' : 'bg-zinc-300'
            }`} />
    );

    const handleDone = () => {
        navigate("/kycapplication") // Or wherever 'Done' should lead
    }

    const nationalityOptions = [
        { value: 'Nigerian', label: 'Nigerian' },
        { value: 'Other', label: 'Other' }
    ];



    const genderOptions = [
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' }
    ];
    const idTypeOptions = [
        { value: 'NIN', label: 'National ID Card (NIN)' },
        { value: 'VotersCard', label: 'Voter\'s Card' }
    ];

    return (
        <div>
            <div className="flex sans h-screen max-w-screen">
                <Sidebar addkey="1" />
                <div className=" bg-zinc-100 min-h-screen flex flex-col flex-1 overflow-y-auto ">
                    <Topbar />
                    <div className="font-sans">
                        <main className="flex items-start justify-center py-10 px-4">
                            <div className=" md:p-10 rounded-lg w-full container mx-auto">
                                {/* Header */}
                                <div className="flex lg:flex-row flex-col justify-between items-center pb-4 mb-8">
                                    <div className='lg:mb-0 mb-8'>
                                        <h1 className="text-xl md:text-2xl font-semibold text-zinc-800">KYC Application</h1>
                                        <p className="text-sm text-zinc-600">Complete your KYC application to access all features.</p>
                                    </div>
                                    <a href="#" className="text-sm text-green-700 hover:underline">Having issues? Contact Support</a>
                                </div>
                                {/* Progress Steps */}
                                <div className="mb-10 px-2 md:px-6">
                                    <div className="flex items-start justify-between">
                                        <ProgressStep number={1} active={currentStage >= 1} completed={currentStage > 1} label="Personal Information" />
                                        <ProgressConnector active={currentStage > 1} />
                                        <ProgressStep number={2} active={currentStage >= 2} completed={currentStage > 2} label="Agency Information" />
                                        <ProgressConnector active={currentStage > 2} />
                                        <ProgressStep number={3} active={currentStage >= 3} completed={currentStage > 3} label="Address Information" />
                                    </div>
                                </div>
                                {/* Form Stages */}
                                <div>
                                    {currentStage === 1 && (
                                        <div className="lg:px-16 lg:pt-16 pb-4 p-4 bg-white rounded-lg shadow">
                                            <h2 className="text-xl font-semibold text-zinc-700 mb-2">Personal Information</h2>
                                            <p className="text-sm text-zinc-500 mb-6">Fill out your personal information.</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                                {/* Surname Input */}
                                                <div>
                                                    <label htmlFor="lastName" className="block text-sm font-medium text-zinc-700 mb-1">
                                                        Surname
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="lastName"
                                                        value={formData.personal.lastName}
                                                        onChange={(e) => handleInputChange('personal', 'lastName', e.target.value)}
                                                        required
                                                        placeholder="Enter your surname"
                                                        className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-150 ease-in-out text-sm placeholder-zinc-400"
                                                    />
                                                </div>
                                                {/* First Name Input */}
                                                <div>
                                                    <label htmlFor="firstName" className="block text-sm font-medium text-zinc-700 mb-1">
                                                        First Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="firstName"
                                                        value={formData.personal.firstName}
                                                        onChange={(e) => handleInputChange('personal', 'firstName', e.target.value)}
                                                        required
                                                        placeholder="Enter your first name"
                                                        className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-150 ease-in-out text-sm placeholder-zinc-400"
                                                    />
                                                </div>
                                                {/* Email Input */}
                                                <div>
                                                    <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1">
                                                        Email Address
                                                    </label>
                                                    <input
                                                        type="email"
                                                        id="email"
                                                        value={formData.personal.email}
                                                        onChange={(e) => handleInputChange('personal', 'email', e.target.value)}
                                                        required
                                                        placeholder="example@email.com"
                                                        className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-150 ease-in-out text-sm placeholder-zinc-400"
                                                    />
                                                </div>
                                                {/* Phone Input */}
                                                <div>
                                                    <label htmlFor="phone" className="block text-sm font-medium text-zinc-700 mb-1">
                                                        Phone Number
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        id="phone"
                                                        value={formData.personal.phone}
                                                        onChange={(e) => handleInputChange('personal', 'phone', e.target.value)}
                                                        required
                                                        placeholder="+234 800 000 0000"
                                                        className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-150 ease-in-out text-sm placeholder-zinc-400"
                                                    />
                                                </div>
                                                {/* Nationality Dropdown */}
                                                <div>
                                                    <label htmlFor="nationality" className="block text-sm font-medium text-zinc-700 mb-1">
                                                        Nationality
                                                    </label>
                                                    <select
                                                        id="nationality"
                                                        value={formData.personal.nationality}
                                                        onChange={(e) => handleInputChange('personal', 'nationality', e.target.value)}
                                                        required
                                                        className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-150 ease-in-out text-sm placeholder-zinc-400 pr-8 bg-white"
                                                    >
                                                        <option value="">Select Nationality</option>
                                                        {nationalityOptions.map(option => (
                                                            <option key={option.value} value={option.value}>{option.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {/* Gender Dropdown */}
                                                <div>
                                                    <label htmlFor="gender" className="block text-sm font-medium text-zinc-700 mb-1">
                                                        Gender
                                                    </label>
                                                    <select
                                                        id="gender"
                                                        value={formData.personal.gender}
                                                        onChange={(e) => handleInputChange('personal', 'gender', e.target.value)}
                                                        required
                                                        className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-150 ease-in-out text-sm placeholder-zinc-400 pr-8 bg-white"
                                                    >
                                                        <option value="">Select gender</option>
                                                        {genderOptions.map(option => (
                                                            <option key={option.value} value={option.value}>{option.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {/* ID Type Dropdown */}
                                                <div>
                                                    <label htmlFor="idType" className="block text-sm font-medium text-zinc-700 mb-1">
                                                        Select ID Type
                                                    </label>
                                                    <select
                                                        id="idType"
                                                        value={formData.documents.idType}
                                                        onChange={(e) => handleInputChange('documents', 'idType', e.target.value)}
                                                        required
                                                        className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-150 ease-in-out text-sm placeholder-zinc-400 pr-8 bg-white"
                                                    >
                                                        <option value="">Select ID Type</option>
                                                        {idTypeOptions.map(option => (
                                                            <option key={option.value} value={option.value}>{option.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {/* ID Number Input */}
                                                <div>
                                                    <label htmlFor="idNumber" className="block text-sm font-medium text-zinc-700 mb-1">
                                                        ID Number
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="idNumber"
                                                        value={formData.documents.idNumber}
                                                        onChange={(e) => handleInputChange('documents', 'idNumber', e.target.value)}
                                                        required
                                                        placeholder="Enter ID Number"
                                                        className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-150 ease-in-out text-sm placeholder-zinc-400"
                                                    />
                                                </div>
                                            </div>
                                            {/* File Upload Section */}
                                            <div className="mt-6">
                                                <label htmlFor="uploadID" className="block text-sm font-medium text-zinc-700 mb-1">
                                                    Upload ID
                                                </label>
                                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md">
                                                    <div className="space-y-1 text-center">
                                                        <svg className="mx-auto h-12 w-12 text-zinc-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                        <div className="flex text-sm text-zinc-600">
                                                            <p>Drag &amp; drop a file here</p>
                                                        </div>
                                                        <p className="text-xs text-zinc-500">JPG, PNG, file size no more than 10MB</p>
                                                        <button
                                                            type="button"
                                                            className="mt-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                                            onClick={() => document.getElementById('fileInput').click()}
                                                        >
                                                            Select file
                                                        </button>
                                                        <input
                                                            id="fileInput"
                                                            type="file"
                                                            accept=".png,.jpg,.jpeg,.pdf"
                                                            style={{ display: 'none' }}
                                                            onChange={handleFileUpload}
                                                        />
                                                    </div>
                                                </div>
                                                {formData.documents.fileName ? (
                                                    <p className="mt-2 text-sm text-zinc-600">
                                                        Uploaded file: <span className="font-medium text-green-700">{formData.documents.fileName}</span>
                                                        <button onClick={removeFile} type="button" className="ml-2 text-red-600 hover:text-red-800 text-xs font-medium">
                                                            (Remove)
                                                        </button>
                                                    </p>
                                                ) : (
                                                    <p className="mt-2 text-sm text-zinc-500">No file uploaded</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {currentStage === 2 && (
                                        <div className="lg:px-16 lg:pt-16 pb-4 bg-white p-4 rounded-lg shadow">
                                            <h2 className="text-xl font-semibold text-zinc-700 mb-2">Agency Information</h2>
                                            <p className="text-sm text-zinc-500 mb-6">Fill out your agency information.</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 ">
                                                {/* Agency Name */}
                                                <div>
                                                    <label htmlFor="agencyName" className="block text-sm font-medium text-zinc-700 mb-1">
                                                        Agency Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="agencyName"
                                                        value={formData.agency.agencyName}
                                                        onChange={(e) => handleInputChange('agency', 'agencyName', e.target.value)}
                                                        required
                                                        placeholder="Enter agency name"
                                                        className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-150 ease-in-out text-sm placeholder-zinc-400"
                                                    />
                                                </div>
                                                {/* Registration Number */}
                                                <div>
                                                    <label htmlFor="registrationNumber" className="block text-sm font-medium text-zinc-700 mb-1">
                                                        Registration Number
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="registrationNumber"
                                                        value={formData.agency.registrationNumber}
                                                        onChange={(e) => handleInputChange('agency', 'registrationNumber', e.target.value)}
                                                        required
                                                        placeholder="Enter registration number"
                                                        className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-150 ease-in-out text-sm placeholder-zinc-400"
                                                    />
                                                </div>
                                                {/* Business Email */}
                                                <div>
                                                    <label htmlFor="businessEmail" className="block text-sm font-medium text-zinc-700 mb-1">
                                                        Business Email Address
                                                    </label>
                                                    <input
                                                        type="email"
                                                        id="businessEmail"
                                                        value={formData.agency.businessEmail}
                                                        onChange={(e) => handleInputChange('agency', 'businessEmail', e.target.value)}
                                                        required
                                                        placeholder="example@agency.com"
                                                        className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-150 ease-in-out text-sm placeholder-zinc-400"
                                                    />
                                                </div>
                                                {/* Business Phone */}
                                                <div>
                                                    <label htmlFor="businessPhone" className="block text-sm font-medium text-zinc-700 mb-1">
                                                        Business Phone Number
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        id="businessPhone"
                                                        value={formData.agency.businessPhone}
                                                        onChange={(e) => handleInputChange('agency', 'businessPhone', e.target.value)}
                                                        required
                                                        placeholder="+234 800 000 0000"
                                                        className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-150 ease-in-out text-sm placeholder-zinc-400"
                                                    />
                                                </div>
                                            </div>
                                            {/* Branches */}
                                            {formData.agency.branches.map((branch, index) => (
                                                <div key={index} className="mt-6 grid grid-cols-1 md:grid-cols-19 gap-x-6 gap-y-5 justify-center items-center">
                                                    {/* Branch Name */}
                                                    <div className='col-span-8'>
                                                        <label htmlFor={`branchName-${index}`} className="block text-sm font-medium text-zinc-700 mb-1">
                                                            Branch Name
                                                        </label>
                                                        <input
                                                            type="text"
                                                            id={`branchName-${index}`}
                                                            value={branch.name}
                                                            onChange={(e) => handleBranchInputChange(index, 'name', e.target.value)}
                                                            required
                                                            placeholder="e.g Ketu"
                                                            className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-150 ease-in-out text-sm placeholder-zinc-400"
                                                        />
                                                    </div>
                                                    {/* Branch Address */}
                                                    <div className='col-span-8'>
                                                        <label htmlFor={`branchAddress-${index}`} className="block text-sm font-medium text-zinc-700 mb-1">
                                                            Branch Address
                                                        </label>
                                                        <input
                                                            type="text"
                                                            id={`branchAddress-${index}`}
                                                            value={branch.address}
                                                            onChange={(e) => handleBranchInputChange(index, 'address', e.target.value)}
                                                            required
                                                            placeholder="Enter branch address"
                                                            className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-150 ease-in-out text-sm placeholder-zinc-400"
                                                        />
                                                    </div>
                                                    {/* Remove Branch Button */}
                                                    <div className="flex items-end justify-start col-span-3  ">

                                                        <button
                                                            type="button"
                                                            onClick={() => removeBranch(index)}
                                                            className="border-red-600 border py-3 px-2 md:mt-6  rounded-lg text-red-600 hover:text-red-800 text-sm font-medium"
                                                        >
                                                            Remove Branch
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {/* Add New Branch */}
                                            <div className="mt-6">
                                                <button
                                                    onClick={addBranch}
                                                    type="button"
                                                    className="inline-flex items-center  py-2 border border-transparent rounded-md   font-medium text-green-700 hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                                >
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                                    Add new branch
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {currentStage === 3 && (
                                        <div className="lg:px-16 lg:pt-16 pb-4 p-4 bg-white rounded-lg shadow">
                                            <h2 className="text-xl font-semibold text-zinc-700 mb-2">Upload Documents</h2>
                                            <p className="text-sm text-zinc-500 mb-6">Upload your identification documents</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">


                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                                                        Agency registration certificate
                                                    </label>
                                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-zinc-300 border-dashed rounded-xl file-input-area relative"> {/* Added relative positioning */}
                                                        <div className="space-y-1 text-center py-8"> {/* Adjusted padding */}
                                                            <svg className="mx-auto h-10 w-10 text-zinc-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                            <div className="flex text-sm text-zinc-600">
                                                                <p className="pl-1">Click to upload or drag and drop</p>
                                                            </div>
                                                            <p className="text-xs text-zinc-500">PNG, JPG, PDF up to 10MB</p>
                                                            <input type="file" onChange={handleAgencyDocUpload} accept=".png,.jpg,.jpeg,.pdf" className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                                                        </div>
                                                    </div>
                                                    {formData.agency.agencyCertificate ? (
                                                        <p className="mt-2 text-sm text-zinc-600">
                                                            Uploaded file: <span className="font-medium text-green-700">{formData.agency.agencyCertificate}</span>
                                                            <button onClick={removeFile} type="button" className="ml-2 text-red-600 hover:text-red-800 text-xs font-medium">
                                                                (Remove)
                                                            </button>
                                                        </p>
                                                    ) : (
                                                        <p className="mt-2 text-sm text-zinc-500">No file uploaded</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {currentStage === 4 && (
                                        <div className="text-center py-12 lg:px-16 lg:pt-16 pb-4 bg-white rounded-lg shadow">
                                            <div className="inline-block bg-green-100 p-4 rounded-full mb-4">
                                                <svg className="w-12 h-12 text-green-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <h2 className="text-2xl font-semibold text-zinc-800 mb-3">Congratulations!</h2>
                                            <p className="text-zinc-600">Your KYC information has been submitted successfully.</p>
                                            <p className="text-zinc-600 mt-1">We will review your details and get back to you shortly.</p>
                                            <button
                                                type="button"
                                                className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                                onClick={handleDone}
                                            >
                                                Done
                                            </button>
                                        </div>
                                    )}


                                </div>
                                {/* Navigation Buttons */}
                                <div className={`flex  mt-6 lg:px-16 lg:pb-10 p-4 rounded-b-lg  ${currentStage > 1 && currentStage < 4 ? 'justify-between' : 'justify-end'}`}>
                                    {currentStage > 1 && currentStage < 4 && (
                                        <button
                                            onClick={prevStage}
                                            type="button"
                                            className="inline-flex items-center px-6 py-3 border border-zinc-300 text-sm font-medium rounded-lg text-zinc-700 bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                        >
                                            Back
                                        </button>
                                    )}
                                    {currentStage < 4 && (
                                        <button
                                            onClick={currentStage === 3 ? handleSubmit : nextStage}
                                            type="button"
                                            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                        >
                                            {currentStage === 3 ? 'Submit KYC' : 'Next'}
                                        </button>
                                    )}
                                </div>
                            </div>
                            {notification && (
                                <div
                                    className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg max-w-sm z-50 ${notification.type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'
                                        }`}
                                    role={notification.type === 'error' ? 'alert' : 'status'}
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium">{notification.message}</p>
                                        <button
                                            onClick={clearNotification}
                                            className={`ml-4 text-xl font-semibold leading-none ${notification.type === 'success' ? 'text-green-700 hover:text-green-800' : 'text-red-700 hover:text-red-800'} focus:outline-none`}
                                            aria-label="Close notification"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                </div>
                            )}
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KYCApplication;