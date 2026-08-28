import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/CorporateTopBar";
import api from "../api/axiosConfig.js"; // Ensure correct path
import useAuthStore from "../store/authStore";
import useCorporateStore from "../store/useCorporateStore";
import { uploadFile } from "../utils/fileUpload.js";

const KYCApplication = () => {
    // --- State ---
    const [currentStage, setCurrentStage] = useState(1);
    const [notification, setNotification] = useState(null);
    const [isModalOpen, setIsShowModal] = useState(false);
    const [isReuploadModalOpen, setIsReuploadModalOpen] = useState(false);
    const [reuploadDocumentId, setReuploadDocumentId] = useState(null);
    const [member, setMember] = useState([]);
    const [editMember, setEditMember] = useState(null);
    // Removed documents state as it's replaced by submissionStatus
    const [submissionStatus, setSubmissionStatus] = useState(null); // 'submitting', 'success', 'error', null

    const [formData, setFormData] = useState({
        company: {
            regNo: "",
            companyName: "",
            email: "",
            phone: "",
            businessSector: "",
            address: "", // Added address to company data
        },
        documents: {
            // idType: "", // Removed if not needed in final payload
            idNumber: "", // NIN for Business Registration Certificate
            file: null,
            fileName: "",
        },
        personal: {
            firstName: "",
            lastName: "",
            gender: "",
            phone: "",
            jobTitle: "",
            nationality: "",
            email: "",
            address: "",
            idNumber: "", // NIN for Personal ID
            documents: {
                // idType: "", // Removed if not needed in final payload
                idNumber: "", // Might be redundant, using personal.idNumber instead
                file: null,
                fileName: "",
            }
        }
    });

    // --- Dynamic Options Data ---
    const businessSectorOptions = [
        { value: "Agriculture", label: "Agriculture" },
        { value: "Automotive", label: "Automotive" },
        { value: "Construction", label: "Construction" },
        { value: "Consulting", label: "Consulting" },
        { value: "Consumer Goods", label: "Consumer Goods" },
        { value: "Education", label: "Education" },
        { value: "Energy", label: "Energy" },
        { value: "Entertainment", label: "Entertainment" },
        { value: "Fashion & Apparel", label: "Fashion & Apparel" },
        { value: "Finance", label: "Finance" },
        { value: "Food & Beverage", label: "Food & Beverage" },
        { value: "Healthcare", label: "Healthcare" },
        { value: "Hospitality", label: "Hospitality" },
        { value: "Information Technology", label: "Information Technology" },
        { value: "Legal Services", label: "Legal Services" },
        { value: "Logistics & Transportation", label: "Logistics & Transportation" },
        { value: "Manufacturing", label: "Manufacturing" },
        { value: "Media & Publishing", label: "Media & Publishing" },
        { value: "Mining", label: "Mining" },
        { value: "Non-Profit", label: "Non-Profit" },
        { value: "Oil & Gas", label: "Oil & Gas" },
        { value: "Pharmaceuticals", label: "Pharmaceuticals" },
        { value: "Real Estate", label: "Real Estate" },
        { value: "Retail", label: "Retail" },
        { value: "Telecommunications", label: "Telecommunications" },
        { value: "Textile", label: "Textile" },
        { value: "Tourism", label: "Tourism" },
        { value: "Utilities", label: "Utilities" },
        { value: "Waste Management", label: "Waste Management" },
        { value: "Wholesale & Distribution", label: "Wholesale & Distribution" },
    ];

    const nationalityOptions = [
        { value: "Nigerian", label: "Nigerian" },
        { value: "Other", label: "Other" },
    ];

    const genderOptions = [
        { value: "Male", label: "Male" },
        { value: "Female", label: "Female" }
    ];

    const navigate = useNavigate();

    // --- Notification Timer ---
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const { corporateInfo, fetchCorporateInfo } = useCorporateStore();

    // --- Initial Check (Placeholder Logic) ---
    const checkStatus = async () => {
        try {
            // Placeholder: This logic might need review based on actual API behavior
            const { data } = await api.get(
                `/CorporateKYC/check-corporate-kyc-status?corporateID=${useAuthStore.getState().token}`
            );
            if (data.succeeded) {
                // navigate("/dashboard"); // Example: Navigate away if already submitted
                console.log("KYC already initiated or completed.");
            }
        } catch (error) {
            console.log("KYC status check error (might be expected):", error?.response?.data || error.message);
            // If not found or error, user can proceed with application
        }
    };

    useEffect(() => {
        checkStatus();
        fetchCorporateInfo();
    }, []);

    useEffect(() => {
        if (corporateInfo) {
            setFormData(prev => ({
                ...prev,
                company: {
                    ...prev.company,
                    companyName: prev.company.companyName || corporateInfo.businessName || '',
                    email: prev.company.email || corporateInfo.emailAddress || '',
                    phone: prev.company.phone || corporateInfo.phoneNo || '',
                    address: prev.company.address || corporateInfo.address || '',
                },
                personal: {
                    ...prev.personal,
                    firstName: prev.personal.firstName || corporateInfo.firstName || '',
                    lastName: prev.personal.lastName || corporateInfo.lastName || '',
                    email: prev.personal.email || corporateInfo.emailAddress || '',
                    phone: prev.personal.phone || corporateInfo.phoneNo || '',
                    address: prev.personal.address || corporateInfo.address || '',
                }
            }));
        }
    }, [corporateInfo]);

    // --- Modal Handlers ---
    const handleOpenModal = () => {
        setFormData(prev => ({
            ...prev,
            personal: {
                firstName: "",
                lastName: "",
                gender: "",
                phone: "",
                jobTitle: "",
                nationality: "",
                email: "",
                address: "",
                idNumber: "",
                documents: { idType: "", idNumber: "", file: null, fileName: "" }
            }
        }));
        setEditMember(null);
        setIsShowModal(true);
    };

    const handleCloseModal = () => setIsShowModal(false);

    const handleCloseReuploadModal = () => {
        setIsReuploadModalOpen(false);
        setReuploadDocumentId(null);
        setFormData(prev => ({
            ...prev,
            documents: { ...prev.documents, file: null, fileName: "" },
        }));
    };

    // --- Form & Member Handlers ---
    const handleInputChange = (section, field, value) => {
        setFormData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const { firstName, lastName, email, phone, gender, nationality, jobTitle, address, idNumber } = formData.personal;
        const isValid = firstName && lastName && email && phone && nationality && gender && address && jobTitle && idNumber;

        if (!isValid) {
            setNotification({ type: "error", message: "Please fill all member details" });
            return;
        }

        const newMember = {
            name: `${firstName} ${lastName}`,
            email, phone, gender, nationality, address, jobTitle, idNumber,
            firstName, lastName,
            // Include documents state for this member if needed later for upload
            documents: { ...formData.personal.documents }
        };

        if (editMember !== null) {
            setMember(prev => prev.map((m, i) => (i === editMember ? newMember : m)));
        } else {
            setMember(prev => [...prev, newMember]);
        }
        setEditMember(null);
        handleCloseModal();
    };

    const handleDeleteMember = (indexToDelete) => {
        setMember(prev => prev.filter((_, index) => index !== indexToDelete));
    };

    const handleEditMember = (index) => {
        const memberToEdit = member[index];
        if (!memberToEdit) return;
        setEditMember(index);
        setFormData({
            ...formData,
            personal: {
                firstName: memberToEdit.firstName || "",
                lastName: memberToEdit.lastName || "",
                email: memberToEdit.email || "",
                phone: memberToEdit.phone || "",
                gender: memberToEdit.gender || "",
                nationality: memberToEdit.nationality || "",
                jobTitle: memberToEdit.jobTitle || "",
                address: memberToEdit.address || "",
                idNumber: memberToEdit.idNumber || "", // NIN
                documents: memberToEdit.documents || {
                    idType: "", idNumber: "", file: null, fileName: "",
                },
            },
        });
        handleOpenModal();
    };

    // --- Navigation & Validation ---
    const nextStage = () => {
        if (currentStage === 1) {
            if (!formData.company.regNo || !formData.company.companyName ||
                !formData.company.email || !formData.company.phone ||
                !formData.company.businessSector) {
                setNotification({ type: "error", message: "Fill all the details" });
                return;
            }
        }
        if (currentStage === 2) {
            if (!formData.documents.idNumber || !formData.documents.file) {
                setNotification({ type: "error", message: "Fill all the details" });
                return;
            }
        }
        if (currentStage === 3) {
            if (member.length === 0) {
                setNotification({ type: "error", message: "Please add at least one member before proceeding." });
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

    // --- File Handling ---
    const handleFileUpload = (event, target = "documents") => {
        const file = event.target.files[0];
        if (!file) return;
        const allowedTypes = ["image/png", "image/jpeg", "application/pdf"];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!allowedTypes.includes(file.type)) {
            setNotification({ type: "error", message: "Invalid file type. Please upload PNG, JPG, or PDF." });
            event.target.value = "";
            return;
        }
        if (file.size > maxSize) {
            setNotification({ type: "error", message: "File exceeds 10MB limit." });
            event.target.value = "";
            return;
        }

        if (target === "documents") {
            setFormData(prev => ({
                ...prev,
                documents: { ...prev.documents, file, fileName: file.name },
            }));
        } else if (target === "personal.documents") {
            setFormData(prev => ({
                ...prev,
                personal: {
                    ...prev.personal,
                    documents: { ...prev.personal.documents, file, fileName: file.name },
                },
            }));
        }
    };

    const removeFile = (target = "documents") => {
        if (target === "documents") {
            setFormData(prev => ({
                ...prev,
                documents: { ...prev.documents, file: null, fileName: "" },
            }));
        } else if (target === "personal.documents") {
            setFormData(prev => ({
                ...prev,
                personal: {
                    ...prev.personal,
                    documents: { ...prev.personal.documents, file: null, fileName: "" },
                },
            }));
        }
        // Reset file input if you have a ref
    };

    // --- New Submission Handler ---
    const handleSubmit = async () => {
        const formatErrorMessage = (err, defaultMsg = "An error occurred.") => {
            if (!err) return defaultMsg;
            const responseData = err.response?.data;
            const msg = responseData?.message || responseData?.Message || err.message;
            if (Array.isArray(msg)) {
                return msg.join(', ');
            }
            return msg || defaultMsg;
        };

        // Basic validation
        if (member.length === 0) {
            setNotification({ type: "error", message: "Please add at least one member before submitting." });
            return;
        }

        // 1. Set submission state to 'submitting' and navigate to Stage 4
        setSubmissionStatus('submitting');
        setCurrentStage(4);

        try {
            // 2. Handle Business Registration Certificate upload
            let certificateImageUrl = null;
            const corporateFile = formData.documents.file;
            if (corporateFile) {
                try {
                    const res = await uploadFile(corporateFile);
                    certificateImageUrl = res.url;
                    console.log("Business Registration Certificate uploaded:", res);
                } catch (uploadError) {
                    console.error("Certificate upload failed:", uploadError.message);
                    throw new Error(`Failed to upload Business Registration Certificate: ${uploadError.message}`);
                }
            } else {
                throw new Error("Business Registration Certificate file is required.");
            }

            // 3. Handle document uploads for each Authorized Signatory
            const membersWithDocuments = await Promise.all(member.map(async (m) => {
                let memberIdImageUrl = null;
                // Check if the member object has a documents property with a file
                if (m.documents?.file) {
                    try {
                        const res = await uploadFile(m.documents.file);
                        memberIdImageUrl = res.url;
                        console.log(`Signatory ${m.firstName} ${m.lastName} ID uploaded:`, res);
                    } catch (uploadError) {
                        console.error(`Signatory ${m.firstName} ${m.lastName} ID upload failed:`, uploadError.message);
                        throw new Error(`Failed to upload ID document for signatory ${m.firstName} ${m.lastName}: ${uploadError.message}`);
                    }
                } else {
                    // Decide if a signatory document is mandatory. If so, throw an error.
                    console.warn(`No ID document provided for signatory ${m.firstName} ${m.lastName}. Proceeding without it.`);
                    // Uncomment the line below if it IS mandatory:
                    // throw new Error(`ID document is required for signatory ${m.firstName} ${m.lastName}.`);
                }

                return {
                    lastName: m.lastName || "",
                    firstName: m.firstName || "",
                    email: m.email || "",
                    phoneNumber: m.phone || "",
                    nationality: m.nationality || "",
                    gender: m.gender || "",
                    jobTitle: m.jobTitle || "",
                    address: m.address || "",
                    NinNo: m.idNumber || "", // Use the NIN from personal section
                    idDocument: memberIdImageUrl || "" // Use the uploaded URL or empty string
                };
            }));

            // 4. Format the payload according to the specified structure
            const payload = {
                companyInformation: {
                    businessName: formData.company.companyName || "",
                    businessRegistrationNumber: formData.company.regNo || "",
                    email: formData.company.email || "",
                    phoneNumber: formData.company.phone || "",
                    businessSector: formData.company.businessSector || "",
                    address: formData.company.address || ""
                },
                businessRegistrationCertificate: {
                    NinNo: formData.documents.idNumber || "", // NIN for the certificate
                    idDocument: certificateImageUrl || "" // Use the uploaded URL
                },
                authorizedSignatories: membersWithDocuments
            };

            // 5. Log the payload before sending
            console.log("Submitting KYC Payload:", JSON.stringify(payload, null, 2));

            // 6. Send the POST request using the imported api instance
            const response = await api.post("/corporate/kyc", payload);

            // 7. Handle successful response
            if (response.data.success || response.data.succeeded) {
                try {
                    // Update company info via PATCH
                    const companyInfoPayload = {
                        address: formData.company.address || "",
                        businessRegistrationNumber: formData.company.regNo || "",
                        businessSector: formData.company.businessSector || ""
                    };

                    await api.patch(
                        "/corporate/kyc/add-company-info",
                        companyInfoPayload
                    );

                    // Update ID verification via PATCH
                    const verificationPayload = {
                        NinNo: formData.documents.idNumber,
                        idDocument: certificateImageUrl
                    };

                    const verificationRes = await api.patch(
                        "/corporate/kyc/add-id-verification",
                        verificationPayload
                    );

                    // Add each authorized signatory as a corporate member via POST
                    for (const memberDoc of membersWithDocuments) {
                        const memberPayload = {
                            firstName: memberDoc.firstName,
                            lastName: memberDoc.lastName,
                            email: memberDoc.email,
                            phoneNumber: memberDoc.phoneNumber,
                            nationality: memberDoc.nationality,
                            gender: memberDoc.gender,
                            jobTitle: memberDoc.jobTitle,
                            address: memberDoc.address,
                            NinNo: memberDoc.NinNo,
                            idDocument: memberDoc.idDocument
                        };

                        await api.post(
                            "/corporate/kyc/add-corporate-member",
                            memberPayload
                        );
                    }

                    if (verificationRes.data.success || verificationRes.data.succeeded) {
                        console.log("KYC Submission and ID Verification Successful:", response.data, verificationRes.data);
                        setSubmissionStatus('success');
                    } else {
                        console.error("ID Verification failed:", verificationRes.data);
                        setSubmissionStatus('error');
                        const errorMsg = Array.isArray(verificationRes.data.message) ? verificationRes.data.message.join(', ') : (verificationRes.data.message || "ID Verification failed.");
                        setNotification({
                            type: "error",
                            message: errorMsg,
                        });
                    }
                } catch (verificationError) {
                    console.error("Error during ID verification PATCH:", verificationError);
                    setSubmissionStatus('error');
                    setNotification({
                        type: "error",
                        message: formatErrorMessage(verificationError, "ID Verification failed. Check console for details."),
                    });
                }
            } else {
                console.error("KYC Submission failed:", response.data);
                setSubmissionStatus('error');
                const errorMsg = Array.isArray(response.data.message) ? response.data.message.join(', ') : (response.data.message || "An error occurred during submission. Please try again.");
                setNotification({
                    type: "error",
                    message: errorMsg,
                });
            }

        } catch (error) {
            // 8. Handle errors during upload or API call
            console.error("KYC Submission Error:", error);
            setSubmissionStatus('error');
            setNotification({
                type: "error",
                message: formatErrorMessage(error, "An error occurred during submission. Please try again."),
            });
        }
    };

    // --- Progress Step Component ---
    const ProgressStep = ({ number, active, completed, label }) => (
        <div className="flex-1 flex flex-col items-center text-center">
            <div
                className={`w-6 h-6 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center font-bold mb-1 transition-all duration-300 ${completed
                    ? "bg-green-500 border-green-500 text-white"
                    : active
                        ? "border-green-700 bg-green-700 text-white"
                        : "border-zinc-300 text-zinc-400"
                    }`}
            >
                {completed ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="w-3 h-3 md:w-4 md:h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                ) : (
                    <span className="text-xs md:text-sm">{number}</span>
                )}
            </div>
            <span className={`text-xs md:text-sm ${active || completed ? "text-zinc-800 font-medium" : "text-zinc-500"}`}>
                {label}
            </span>
        </div>
    );

    const ProgressConnector = ({ active }) => (
        <div className={`flex-1 mt-4 h-0.5 transition-colors duration-300 ${active ? "bg-green-500" : "bg-zinc-300"}`} />
    );

    const handleDone = () => {
        navigate("/dashboard"); // Adjust route as needed
    };

    // --- Clear notification helper ---
    const clearNotification = () => setNotification(null);

    return (
        <div>
            <div className="flex sans h-screen max-w-screen">
                <Sidebar addkey="1" />
                <div className=" bg-zinc-100 min-h-screen flex flex-col flex-1 overflow-y-auto ">
                    <Topbar />
                    <div className="font-sans">
                        <main className="flex items-start justify-center py-6 md:py-10 px-2 md:px-4">
                            <div className="w-full max-w-4xl lg:max-w-7xl mx-auto">
                                {/* Header */}
                                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center pb-4 mb-6 md:mb-8 gap-4">
                                    <div className="w-full lg:w-auto">
                                        <h1 className="text-lg md:text-xl lg:text-2xl font-semibold text-zinc-800">
                                            KYC Application
                                        </h1>
                                        <p className="text-sm text-zinc-600 mt-1">
                                            Complete your KYC application
                                        </p>
                                    </div>
                                    <a href="#" className="text-sm text-green-700 hover:underline whitespace-nowrap">
                                        Having issues? Contact Support
                                    </a>
                                </div>

                                {/* Progress Steps (Hidden on Stage 4) */}
                                {currentStage < 4 && (
                                    <div className="mb-8 md:mb-10 px-2 md:px-6">
                                        <div className="flex items-start justify-between">
                                            <ProgressStep number={1} active={currentStage >= 1} completed={currentStage > 1} label="Company Information" />
                                            <ProgressConnector active={currentStage > 1} />
                                            <ProgressStep number={2} active={currentStage >= 2} completed={currentStage > 2} label="Identification Documents" />
                                            <ProgressConnector active={currentStage > 2} />
                                            <ProgressStep number={3} active={currentStage >= 3} completed={currentStage > 3} label="Authorized signatories" />
                                        </div>
                                    </div>
                                )}

                                <div className="bg-white rounded-lg max-w-7xl mx-auto shadow-sm">
                                    {/* Form Stages */}
                                    <div>
                                        {/* Stage 1: Company Information */}
                                        {currentStage === 1 && (
                                            <div className="p-4 md:p-6 lg:px-16 lg:pt-16 pb-6">
                                                <h2 className="text-lg md:text-xl font-semibold text-zinc-700 mb-2">Company Information</h2>
                                                <p className="text-sm text-zinc-500 mb-6">Fill out your company information.</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-x-6 md:gap-y-5">
                                                    {[
                                                        { id: "companyName", label: "Company Name", value: formData.company.companyName, placeholder: "Enter your Company name" },
                                                        { id: "regNo", label: "Registration number", value: formData.company.regNo, placeholder: "Registration number" },
                                                        { id: "email", label: "Company email address", value: formData.company.email, placeholder: "example@email.com", type: "email" },
                                                        { id: "phone", label: "Business Phone Number", value: formData.company.phone, placeholder: "+234 800 000 0000", type: "tel" },
                                                    ].map((field) => (
                                                        <div key={field.id}>
                                                            <label htmlFor={field.id} className="block text-sm font-medium text-zinc-700 mb-1">{field.label}</label>
                                                            <input
                                                                type={field.type || "text"}
                                                                id={field.id}
                                                                value={field.value}
                                                                onChange={(e) => handleInputChange("company", field.id, e.target.value)}
                                                                required
                                                                placeholder={field.placeholder}
                                                                className="w-full p-3 md:p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-150 ease-in-out text-sm placeholder-zinc-400"
                                                            />
                                                        </div>
                                                    ))}
                                                    <div>
                                                        <label htmlFor="businessSector" className="block text-sm font-medium text-zinc-700 mb-1">Business sector/Industry</label>
                                                        <select
                                                            id="businessSector"
                                                            value={formData.company.businessSector}
                                                            onChange={(e) => handleInputChange("company", "businessSector", e.target.value)}
                                                            required
                                                            className="w-full p-3 border border-zinc-300 text-zinc-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-150 ease-in-out text-sm placeholder-zinc-400 pr-8 bg-white"
                                                        >
                                                            <option value="" className="text-zinc-700">Select Business Sector</option>
                                                            {businessSectorOptions.map((option) => (
                                                                <option key={option.value} value={option.value}>{option.label}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label htmlFor="companyAddress" className="block text-sm font-medium text-zinc-700 mb-1">Address</label>
                                                        <textarea
                                                            id="companyAddress" // Changed ID for clarity
                                                            value={formData.company.address} // Correctly bind to company.address
                                                            onChange={(e) => handleInputChange("company", "address", e.target.value)} // Correctly update company.address
                                                            required
                                                            placeholder="Company Address"
                                                            className="w-full p-3 h-24 md:h-30 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-150 ease-in-out text-sm placeholder-zinc-400 resize-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Stage 2: Identification Documents */}
                                        {currentStage === 2 && (
                                            <div className="p-4 md:p-6 lg:px-16 lg:pt-16 pb-6">
                                                <h2 className="text-lg md:text-xl font-semibold text-zinc-700 mb-2">Upload Business registration certificate</h2>
                                                <p className="text-sm text-zinc-500 mb-6">Upload your company registration certificate</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-x-6 md:gap-y-5">
                                                    <div className="md:col-span-2">
                                                        <label htmlFor="certificateIdNumber" className="block text-sm font-medium text-zinc-700 mb-1">NIN</label>
                                                        <input
                                                            type="text"
                                                            id="certificateIdNumber" // Changed ID for clarity
                                                            value={formData.documents.idNumber}
                                                            onChange={(e) => handleInputChange('documents', 'idNumber', e.target.value)}
                                                            required
                                                            placeholder="NIN Number"
                                                            className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-150 ease-in-out text-sm placeholder-zinc-400"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-zinc-700 mb-1">Upload Document</label>
                                                        <div className="mt-1 flex justify-center px-4 md:px-6 pt-4 md:pt-5 pb-4 border-2 border-zinc-300 border-dashed rounded-xl file-input-area relative">
                                                            <div className="space-y-1 text-center py-6 md:py-8 w-full">
                                                                <span className="flex items-center justify-center h-12 w-12 md:h-14 md:w-14 bg-zinc-100 rounded-full mx-auto">
                                                                    <svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto h-8 w-8 md:h-10 md:w-10 text-zinc-400">
                                                                        <path d="M7.0013 11.583C7.0013 8.03918 9.87414 5.16634 13.418 5.16634C16.5571 5.16634 19.172 7.42172 19.7262 10.4008C19.8039 10.8186 20.1026 11.161 20.5059 11.2948C22.8285 12.0651 24.5013 14.2552 24.5013 16.833C24.5013 20.0547 21.8896 22.6663 18.668 22.6663C18.0236 22.6663 17.5013 23.1887 17.5013 23.833C17.5013 24.4773 18.0236 24.9997 18.668 24.9997C23.1783 24.9997 26.8346 21.3433 26.8346 16.833C26.8346 13.4585 24.7886 10.5645 21.872 9.31918C20.874 5.58401 17.4683 2.83301 13.418 2.83301C8.58548 2.83301 4.66797 6.75052 4.66797 11.583C4.66797 11.7 4.67027 11.8165 4.67484 11.9325C2.58019 13.141 1.16797 15.4043 1.16797 17.9997C1.16797 21.8657 4.30198 24.9997 8.16797 24.9997C8.8123 24.9997 9.33464 24.4773 9.33464 23.833C9.33464 23.1887 8.8123 22.6663 8.16797 22.6663C5.59064 22.6663 3.5013 20.577 3.5013 17.9997C3.5013 16.0661 4.67751 14.4046 6.35806 13.6966C6.84437 13.4918 7.13263 12.986 7.06103 12.4632C7.0217 12.176 7.0013 11.8822 7.0013 11.583Z" fill="#475367" />
                                                                        <path d="M13.2262 17.1277C13.6682 16.7348 14.3344 16.7348 14.7764 17.1277L16.5264 18.6833C17.008 19.1113 17.0514 19.8487 16.6233 20.3303C16.2488 20.7516 15.6376 20.8376 15.168 20.5659V26.1663C15.168 26.8107 14.6456 27.333 14.0013 27.333C13.357 27.333 12.8346 26.8107 12.8346 26.1663V20.5659C12.3651 20.8376 11.7538 20.7516 11.3793 20.3303C10.9513 19.8487 10.9946 19.1113 11.4762 18.6833L13.2262 17.1277Z" fill="#475367" />
                                                                    </svg>
                                                                </span>
                                                                <div className="flex text-sm text-zinc-600 justify-center">
                                                                    <p className="pl-1"><span className="text-green-700 font-semibold">Click to upload</span> or drag and drop</p>
                                                                </div>
                                                                <p className="text-xs text-zinc-500">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                                                                <input
                                                                    type="file"
                                                                    onChange={(e) => handleFileUpload(e, "documents")}
                                                                    accept=".png,.jpg,.jpeg,.pdf"
                                                                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                                                                />
                                                                <div className="flex items-center gap-2 w-full my-4 md:my-6">
                                                                    <span className="flex-grow h-px bg-zinc-100"></span>
                                                                    <span className="text-zinc-400 text-sm font-medium">OR</span>
                                                                    <span className="flex-grow h-px bg-zinc-100"></span>
                                                                </div>
                                                                <button className="bg-green-700 text-white py-2 md:py-3 px-4 md:px-5 rounded-lg font-semibold text-sm md:text-base">
                                                                    Browse Files
                                                                </button>
                                                            </div>
                                                        </div>
                                                        {formData.documents.fileName ? (
                                                            <p className="mt-2 text-sm text-zinc-600">
                                                                Uploaded file: <span className="font-medium text-green-700">{formData.documents.fileName}</span>
                                                                <button onClick={() => removeFile("documents")} type="button" className="ml-2 text-red-600 hover:text-red-800 text-xs font-medium">(Remove)</button>
                                                            </p>
                                                        ) : (
                                                            <p className="mt-2 text-sm text-zinc-500">No file uploaded</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Stage 3: Authorized Signatories */}
                                        {currentStage === 3 && (
                                            <div className="p-4 md:p-6 lg:px-16 lg:pt-16 pb-6 flex flex-col">
                                                <div>
                                                    <h1 className="text-xl md:text-2xl font-semibold">Signatories</h1>
                                                    <p className="text-zinc-400 text-sm md:text-base">Complete KYC for authorized signatories in your company</p>
                                                </div>
                                                <div className="space-y-4 mt-8 md:mt-10">
                                                    {member.length > 0 ? (
                                                        <>
                                                            {member.map((member, index) => (
                                                                <div key={index} className="">
                                                                    <div className="p-3 md:p-4 bg-zinc-100 rounded flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                                        <h3 className="text-base md:text-lg font-semibold text-zinc-800">{index + 1}. {member.name}</h3>
                                                                        <div className="flex flex-col sm:flex-row gap-2">
                                                                            <button onClick={() => handleEditMember(index)} className="text-green-600 py-2 px-3 md:px-4 rounded-lg text-sm md:text-base">Edit Details</button>
                                                                            <button className="text-red-500 py-2 px-3 md:px-4 rounded-lg text-sm md:text-base" onClick={() => handleDeleteMember(index)}>Delete</button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            <div className="flex justify-center mt-6">
                                                                <button className="text-white bg-green-600 hover:bg-green-700 py-2 md:py-3 px-5 md:px-7 rounded-2xl space-x-3 text-sm md:text-base flex items-center gap-2" onClick={handleOpenModal}>
                                                                    <span className="text-lg font-semibold">+</span><span>Add More Members</span>
                                                                </button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="flex flex-col justify-center items-center my-20 md:my-30">
                                                            <div className="text-center space-y-2">
                                                                <h1 className="text-lg md:text-xl font-semibold">No member added</h1>
                                                                <p className="text-zinc-400 text-sm md:text-base">There are no signatories added yet</p>
                                                                <button className="text-white bg-green-600 hover:bg-green-700 py-2 md:py-3 px-5 md:px-7 rounded-2xl mt-3 space-x-3 text-sm md:text-base" onClick={handleOpenModal}>
                                                                    <span>+</span> <span>Add member</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Stage 4: Submission Status */}
                                        {currentStage === 4 && (
                                            <div className="text-center px-4 md:px-5 py-8 md:py-12 lg:px-16 lg:pt-16 pb-4">
                                                {/* --- New Stage 4 UI --- */}
                                                {submissionStatus === 'submitting' && (
                                                    <div className="flex flex-col items-center justify-center py-10">
                                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mb-4"></div>
                                                        <h2 className="text-xl font-semibold text-zinc-700">Submitting KYC Information...</h2>
                                                        <p className="text-zinc-500 mt-2">Please wait while we process your application.</p>
                                                    </div>
                                                )}

                                                {submissionStatus === 'success' && (
                                                    <div className="flex flex-col items-center justify-center py-10">
                                                        <div className="rounded-full bg-green-100 p-3 mb-4">
                                                            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                                            </svg>
                                                        </div>
                                                        <h2 className="text-xl font-semibold text-zinc-700">KYC Submission Successful!</h2>
                                                        <p className="text-zinc-500 mt-2">Your application has been submitted successfully.</p>
                                                        <button
                                                            onClick={handleDone}
                                                            className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                                        >
                                                            Done
                                                        </button>
                                                    </div>
                                                )}

                                                {submissionStatus === 'error' && (
                                                    <div className="flex flex-col items-center justify-center py-10">
                                                        <div className="rounded-full bg-red-100 p-3 mb-4">
                                                            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                                            </svg>
                                                        </div>
                                                        <h2 className="text-xl font-semibold text-zinc-700">KYC Submission Failed</h2>
                                                        <p className="text-zinc-500 mt-2">There was an error submitting your application. Please try again.</p>
                                                        <div className="flex gap-4 mt-6">
                                                            <button
                                                                onClick={() => {
                                                                    setSubmissionStatus(null);
                                                                    setCurrentStage(3);
                                                                }}
                                                                className="px-6 py-3 border border-green-700 text-green-700 rounded-lg font-medium hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                                            >
                                                                Back to Edit
                                                            </button>
                                                            <button
                                                                onClick={handleSubmit}
                                                                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                                            >
                                                                Retry
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                                {/* --- End New Stage 4 UI --- */}
                                            </div>
                                        )}
                                    </div>

                                    {/* Navigation Buttons (Hidden on Stage 4) */}
                                    {currentStage < 4 && (
                                        <div className={`flex mt-6 p-4 md:p-6 lg:px-16 lg:pb-10 rounded-b-lg shadow-sm ${currentStage > 1 && currentStage < 4 ? "justify-between" : "justify-end"}`}>
                                            {currentStage > 1 && currentStage < 4 && (
                                                <button
                                                    onClick={prevStage}
                                                    type="button"
                                                    className="inline-flex items-center px-4 md:px-6 py-2 md:py-3 border border-zinc-300 text-sm font-medium rounded-lg text-zinc-700 bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                                >
                                                    Back
                                                </button>
                                            )}
                                            {currentStage < 4 && (
                                                <button
                                                    // onClick={nextStage} // --- Removed default nextStage for Stage 3 ---
                                                    onClick={currentStage === 3 ? handleSubmit : nextStage} // --- Use handleSubmit on Stage 3 ---
                                                    type="button"
                                                    className="inline-flex items-center px-4 md:px-6 py-2 md:py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                                // Optional: Disable during submission if using isSubmitting state
                                                // disabled={isSubmitting}
                                                >
                                                    {/* {currentStage === 3 ? "Submit" : "Next"} */}
                                                    {currentStage === 3 && submissionStatus === 'submitting' ? 'Submitting...' : 'Next'}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Notification Toast */}
                            {notification && (
                                <div className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg max-w-sm z-50 ${notification.type === "success" ? "bg-green-100 border border-green-400 text-green-700" : "bg-red-100 border border-red-400 text-red-700"}`} role={notification.type === "error" ? "alert" : "status"}>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium">{notification.message}</p>
                                        <button onClick={clearNotification} className={`ml-4 text-xl font-semibold leading-none ${notification.type === "success" ? "text-green-700 hover:text-green-800" : "text-red-700 hover:text-red-800"} focus:outline-none`} aria-label="Close notification">&times;</button>
                                    </div>
                                </div>
                            )}

                            {/* Add Member Modal */}
                            {isModalOpen && (
                                <div className="fixed inset-0 bg-black/30 flex items-center justify-center md:pl-50 p-2 md:p-4 z-40 transition-opacity duration-300 ease-in-out">
                                    <div className="bg-white rounded-2xl shadow-xl px-4 md:px-10 lg:px-8 py-6 md:py-8 lg:py-12 w-full max-w-sm md:max-w-lg lg:max-w-2xl max-h-[85vh] md:max-h-[90vh] lg:max-h-[100vh] overflow-y-auto">
                                        <h2 className="text-lg md:text-xl font-semibold text-zinc-700 mb-2">Authorized Signatories</h2>
                                        <p className="text-sm text-zinc-500 mb-4 md:mb-6">Complete KYC application for your signatories</p>
                                        <form onSubmit={handleFormSubmit}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-x-6 lg:gap-y-5">
                                                {[
                                                    { id: "lastName", label: "Surname", value: formData.personal.lastName, placeholder: "Surname" },
                                                    { id: "firstName", label: "First Name", value: formData.personal.firstName, placeholder: "First Name" },
                                                    { id: "email", label: "Email address", value: formData.personal.email, placeholder: "example@email.com", type: "email" },
                                                    { id: "phone", label: "Phone Number", value: formData.personal.phone, placeholder: "+234 800 000 0000", type: "tel" },
                                                ].map((field) => (
                                                    <div key={field.id}>
                                                        <label htmlFor={field.id} className="block text-sm font-medium text-zinc-700 mb-1">{field.label}</label>
                                                        <input
                                                            type={field.type || "text"}
                                                            id={field.id}
                                                            value={field.value}
                                                            onChange={(e) => handleInputChange("personal", field.id, e.target.value)}
                                                            required
                                                            placeholder={field.placeholder}
                                                            className="w-full p-2.5 md:p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-150 ease-in-out text-sm placeholder-zinc-400"
                                                        />
                                                    </div>
                                                ))}
                                                <div>
                                                    <label htmlFor="nationality" className="block text-sm font-medium text-zinc-700 mb-1">Nationality</label>
                                                    <select
                                                        id="nationality"
                                                        value={formData.personal.nationality}
                                                        onChange={(e) => handleInputChange("personal", "nationality", e.target.value)}
                                                        required
                                                        className="w-full p-2.5 md:p-3 border border-zinc-300 text-zinc-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-150 ease-in-out text-sm placeholder-zinc-400 pr-8 bg-white"
                                                    >
                                                        <option value="" className="text-zinc-700">Country</option>
                                                        {nationalityOptions.map((option) => (
                                                            <option key={option.value} value={option.value}>{option.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label htmlFor="gender" className="block text-sm font-medium text-zinc-700 mb-1">Gender</label>
                                                    <select
                                                        id="gender"
                                                        value={formData.personal.gender}
                                                        onChange={(e) => handleInputChange("personal", "gender", e.target.value)}
                                                        required
                                                        className="w-full p-2.5 md:p-3 border border-zinc-300 text-zinc-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-150 ease-in-out text-sm placeholder-zinc-400 pr-8 bg-white"
                                                    >
                                                        <option value="" className="text-zinc-700">Select Gender</option>
                                                        {genderOptions.map((option) => (
                                                            <option key={option.value} value={option.value}>{option.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label htmlFor="jobTitle" className="block text-sm font-medium text-zinc-700 mb-1">Job title</label>
                                                    <input
                                                        type="text"
                                                        id="jobTitle"
                                                        value={formData.personal.jobTitle}
                                                        onChange={(e) => handleInputChange("personal", "jobTitle", e.target.value)}
                                                        required
                                                        placeholder="Job Title"
                                                        className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-150 ease-in-out text-sm placeholder-zinc-400"
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="personalAddress" className="block text-sm font-medium text-zinc-700 mb-1">Address</label> {/* Changed ID for clarity */}
                                                    <input
                                                        type="text"
                                                        id="personalAddress" // Changed ID for clarity
                                                        value={formData.personal.address}
                                                        onChange={(e) => handleInputChange("personal", "address", e.target.value)}
                                                        required
                                                        placeholder="Personal Address"
                                                        className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-150 ease-in-out text-sm placeholder-zinc-400"
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label htmlFor="personalIdNumber" className="block text-sm font-medium text-zinc-700 mb-1">NIN</label> {/* Changed ID for clarity */}
                                                    <input
                                                        type="text"
                                                        id="personalIdNumber" // Changed ID for clarity
                                                        value={formData.personal.idNumber}
                                                        onChange={(e) => handleInputChange("personal", "idNumber", e.target.value)}
                                                        required
                                                        placeholder="NIN Number"
                                                        className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-150 ease-in-out text-sm placeholder-zinc-400"
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-zinc-700 mb-1">Upload Document</label>
                                                    <div className="mt-1 flex justify-center px-4 md:px-6 pt-4 md:pt-5 pb-4 border-2 border-zinc-300 border-dashed rounded-xl file-input-area relative">
                                                        <div className="space-y-1 text-center py-6 md:py-8 w-full">
                                                            <span className="flex items-center justify-center h-12 w-12 md:h-14 md:w-14 bg-zinc-100 rounded-full mx-auto">
                                                                <svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto h-8 w-8 md:h-10 md:w-10 text-zinc-400">
                                                                    <path d="M7.0013 11.583C7.0013 8.03918 9.87414 5.16634 13.418 5.16634C16.5571 5.16634 19.172 7.42172 19.7262 10.4008C19.8039 10.8186 20.1026 11.161 20.5059 11.2948C22.8285 12.0651 24.5013 14.2552 24.5013 16.833C24.5013 20.0547 21.8896 22.6663 18.668 22.6663C18.0236 22.6663 17.5013 23.1887 17.5013 23.833C17.5013 24.4773 18.0236 24.9997 18.668 24.9997C23.1783 24.9997 26.8346 21.3433 26.8346 16.833C26.8346 13.4585 24.7886 10.5645 21.872 9.31918C20.874 5.58401 17.4683 2.83301 13.418 2.83301C8.58548 2.83301 4.66797 6.75052 4.66797 11.583C4.66797 11.7 4.67027 11.8165 4.67484 11.9325C2.58019 13.141 1.16797 15.4043 1.16797 17.9997C1.16797 21.8657 4.30198 24.9997 8.16797 24.9997C8.8123 24.9997 9.33464 24.4773 9.33464 23.833C9.33464 23.1887 8.8123 22.6663 8.16797 22.6663C5.59064 22.6663 3.5013 20.577 3.5013 17.9997C3.5013 16.0661 4.67751 14.4046 6.35806 13.6966C6.84437 13.4918 7.13263 12.986 7.06103 12.4632C7.0217 12.176 7.0013 11.8822 7.0013 11.583Z" fill="#475367" />
                                                                    <path d="M13.2262 17.1277C13.6682 16.7348 14.3344 16.7348 14.7764 17.1277L16.5264 18.6833C17.008 19.1113 17.0514 19.8487 16.6233 20.3303C16.2488 20.7516 15.6376 20.8376 15.168 20.5659V26.1663C15.168 26.8107 14.6456 27.333 14.0013 27.333C13.357 27.333 12.8346 26.8107 12.8346 26.1663V20.5659C12.3651 20.8376 11.7538 20.7516 11.3793 20.3303C10.9513 19.8487 10.9946 19.1113 11.4762 18.6833L13.2262 17.1277Z" fill="#475367" />
                                                                </svg>
                                                            </span>
                                                            <div className="flex text-sm text-zinc-600 justify-center">
                                                                <p className="pl-1"><span className="text-green-700 font-semibold">Click to upload</span> or drag and drop</p>
                                                            </div>
                                                            <p className="text-xs text-zinc-500">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                                                            <input
                                                                type="file"
                                                                onChange={(e) => handleFileUpload(e, "personal.documents")}
                                                                accept=".png,.jpg,.jpeg,.pdf"
                                                                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                                                            />
                                                            <div className="flex items-center gap-2 w-full my-4 md:my-6">
                                                                <span className="flex-grow h-px bg-zinc-100"></span>
                                                                <span className="text-zinc-400 text-sm font-medium">OR</span>
                                                                <span className="flex-grow h-px bg-zinc-100"></span>
                                                            </div>
                                                            <button className="bg-green-600 hover:bg-green-700 text-white py-2 md:py-3 px-4 md:px-5 rounded-lg font-semibold text-sm md:text-base">
                                                                Browse Files
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {formData.personal.documents.fileName ? (
                                                        <p className="mt-2 text-sm text-zinc-600">
                                                            Uploaded file: <span className="font-medium text-green-700">{formData.personal.documents.fileName}</span>
                                                            <button onClick={() => removeFile("personal.documents")} type="button" className="ml-2 text-red-600 hover:text-red-800 text-xs font-medium">(Remove)</button>
                                                        </p>
                                                    ) : (
                                                        <p className="mt-2 text-sm text-zinc-500">No file uploaded</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 my-4 md:my-5 items-center justify-end pt-4 md:pt-5">
                                                <button className="w-full sm:w-auto py-2 md:py-2.5 lg:py-3 px-3 md:px-4 lg:px-5 border border-green-700 text-green-700 rounded-lg text-sm md:text-base" onClick={handleCloseModal}>Cancel</button>
                                                <button className="w-full sm:w-auto py-2 md:py-2.5 lg:py-3 px-3 md:px-4 lg:px-5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm md:text-base">Save</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {/* Reupload Modal (if needed, logic can be kept or removed) */}
                            {/* {isReuploadModalOpen && (
                // ... (Keep or remove based on requirements)
              )} */}

                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KYCApplication;