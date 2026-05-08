import React, { useEffect, useState } from "react"; // Corrected import statement
import api from "../api/axiosConfig";

const XMarkIcon = ({ className = "w-5 h-5" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={className}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18 18 6M6 6l12 12"
        />
    </svg>
);

const CheckCircleIcon = ({ className = "w-6 h-6" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={className}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
    </svg>
);

// // Mock API Call Function
// const mockApiCall = (userData, devMode) => {
//     return new Promise((resolve) => {
//         setTimeout(() => {
//             if (devMode) {
//                 // Simulate local dummy data response
//                 console.log("Dev Mode: Using dummy data for API call.");
//                 resolve({
//                     success: true,
//                     message: "User added successfully (Dev Mode)",
//                     data: { ...userData, id: `dummy-${Date.now()}` },
//                 });
//             } else {
//                 // Simulate real API call
//                 console.log("Live Mode: Simulating real API call.");
//                 resolve({
//                     success: true,
//                     message: "User added successfully!",
//                     data: { ...userData, id: `real-${Date.now()}` },
//                 });
//             }
//         }, 1500); // Simulate network delay
//     });
// };

// Confirmation Modal
const ConfirmationModal = ({ show, onClose, onConfirm, userData }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 font-inter">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-zinc-900">
                        Confirm User Details
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-zinc-600"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="text-zinc-700 text-sm mb-6 max-h-96 overflow-y-auto pr-2">


                    <>
                        <p className="mb-2">
                            <span className="font-medium">Payer ID:</span> {userData.payerId}
                        </p>
                        <p className="mb-2">
                            <span className="font-medium">First Name:</span>{" "}
                            {userData.firstName}
                        </p>
                        <p className="mb-2">
                            <span className="font-medium">Last Name:</span>{" "}
                            {userData.lastName}
                        </p>
                        <p className="mb-2">
                            <span className="font-medium">Email Address:</span>{" "}
                            {userData.email}
                        </p>
                        <p className="mb-2">
                            <span className="font-medium">Phone Number:</span>{" "}
                            {userData.phoneNo}
                        </p>
                        <p className="mb-2">
                            <span className="font-medium">Bin Type:</span> {userData.binType}
                        </p>

                        <p className="mb-2">
                            <span className="font-medium">LAWMA Customer Type:</span>{" "}
                            {userData.lawmaCustomerType}
                        </p>
                        <p className="mb-2">
                            <span className="font-medium">Building Type:</span>{" "}
                            {userData.buildingType}
                        </p>
                        <p className="mb-2">
                            <span className="font-medium">House Number:</span>{" "}
                            {userData.houseNo}
                        </p>
                        <p className="mb-2">
                            <span className="font-medium">Flat Number:</span>{" "}
                            {userData.flatNumber}
                        </p>
                        <p className="mb-2">
                            <span className="font-medium">Full Address:</span>{" "}
                            {userData.address}
                        </p>
                        <p className="mb-2">
                            <span className="font-medium">Local Government:</span>{" "}
                            {userData.lga}
                        </p>
                        <p className="mb-2">
                            <span className="font-medium">Closest Landmark:</span>{" "}
                            {userData.closestLandmark}
                        </p>
                    </>
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
                        Confirm Add User
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

// Main SignUpModal Component
const SignUpModal = ({ show, onClose }) => {
    const [userData, setUserData] = useState({
        payerId: "",
        firstName: "",
        lastName: "",
        email: "",
        phoneNo: "",
        binType: "",
        buildingType: "",
        buildingName: "",
        houseNo: "",
        flatNumber: "",
        address: "",
        lga: "",
        closestLandmark: "",
    });

    const [branches, setBranches] = useState([
        {
            branchName: "",
            lawmaCustomerType: "",
            lga: "",
            closestLandmark: "",
            address: "",
            isCollapsed: false,
        },
    ]);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle input changes for main user data
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        handleConfirmAddUser()
    };

    // Confirm and proceed with API call
    const handleConfirmAddUser = async () => {
        setShowConfirmationModal(false);
        setIsSubmitting(true);
        try {
            const dataToSend = { ...userData };
            console.log("Data to send:", dataToSend);
            let payload = {
                payerId: dataToSend.payerId,
                lastName: dataToSend.lastName,
                firstName: dataToSend.firstName,
                middleName: dataToSend.middleName || "",
                email: dataToSend.email,
                phoneNo: dataToSend.phoneNo,
                buildingName: dataToSend.buildingName,
                password: "remove",
                lawmaCustomerType: dataToSend.lawmaCustomerType,
                buildingType: dataToSend.buildingType,
                houseNo: dataToSend.houseNo,
                flatNo: dataToSend.flatNumber,
                address: dataToSend.address,
                lga: dataToSend.lga,
                closestLandMark: dataToSend.closestLandmark,
            };

            const response = await api.post(
                `/facility-managers/user`,
                payload
            );
            console.log(response.data.succeeded)

            if (response.data.succeeded) {
                setSuccessMessage(response.message);
                setShowSuccessModal(true);
            } else {
                // Handle API error
                console.error("API Error:", response.message);
                // alert("Failed to add user: " + response.message); // Replace with custom modal
            }
        } catch (error) {
            console.error("Submission error:", error);
            alert("An error occurred during submission."); // Replace with custom modal
        } finally {
            setIsSubmitting(false);
        }
    };

    // Close success modal and reset form/close main modal
    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
        onClose(); // Close the main sign-up modal
        // Reset form after successful submission and closing success modal
        setUserData({
            lastName: '',
            firstName: '',
            middleName: '',
            email: '',
            phoneNo: '',
            buildingName: '',
            password: 'remove',
            lawmaCustomerType: '',
            buildingType: '',
            houseNo: '',
            flatNo: '',
            address: '',
            lga: '',
            closestLandMark: '',
        });
        setBranches([]);
    };

    const [options, setOptions] = useState({
        buildingTypes: [
            "Duplex",
            "Bungalow",
            "Block of Flats",
            "Terrace",
            "Detached",
            "Semi-Detached",
            "Other",
        ],
        lgas: [],
        lawmaCustomerTypes: ["New", "Existing"],
    });

    const fetchLga = async () => {
        try {
            const response = await api.get("/utility/get-lgas");

            if (response.data?.success && Array.isArray(response.data.data)) {
                setOptions((prevOptions) => ({
                    ...prevOptions,
                    lgas: response.data.data,
                }));
            } else {
                console.warn("Unable to load LGAs:", response.data?.message);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchLga();
    }, []);

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-white flex items-center justify-center p-4 z-40 font-inter overflow-y-auto">
            <div className="bg-white rounded-lg w-full max-w-5xl overflow-hidden flex flex-col transform transition-all sm:my-8 sm:align-middle sm:w-full md:ml-[15%] max-h-[90vh]">
                {/* Modal Header */}
                <div className="px-6 py-5  flex justify-between items-center">
                    <h2 className="text-2xl text-zinc-900">Sign up new users</h2>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-zinc-600"
                    >
                        <XMarkIcon className="w-7 h-7" />
                    </button>
                </div>

                {/* Scrollable Form Container */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Customer Type and Payer ID / Business Name */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="lg:col-span-2">
                                <label
                                    htmlFor="binType"
                                    className="block  text-sm font-medium text-zinc-700"
                                >
                                    Bin type
                                </label>
                                <select
                                    id="binType"
                                    name="binType"
                                    value={userData.binType}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full lg:col-span-2 rounded-xl border border-zinc-300  focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14 bg-white"
                                >
                                    <option value="">Select Bin type</option>
                                    <option value="Smart">Smart</option>
                                    <option value="NotSmart">Not Smart</option>
                                </select>
                            </div>
                        </div>

                        {/* Resident Personal Information / Corporate Contact Information */}
                        <section>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="payerId"
                                        className="block text-sm font-medium text-zinc-700"
                                    >
                                        Payer ID
                                    </label>
                                    <input
                                        type="text"
                                        id="payerId"
                                        name="payerId"
                                        value={userData.payerId}
                                        onChange={handleChange}
                                        placeholder="Payer ID"
                                        className="mt-1 block w-full rounded-xl border border-zinc-300  focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="firstName"
                                        className="block text-sm font-medium text-zinc-700"
                                    >
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={userData.firstName}
                                        onChange={handleChange}
                                        placeholder="First Name"
                                        required
                                        className="mt-1 block w-full rounded-xl border border-zinc-300  focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="lastName"
                                        className="block text-sm font-medium text-zinc-700"
                                    >
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={userData.lastName}
                                        onChange={handleChange}
                                        placeholder="Last Name"
                                        required
                                        className="mt-1 block w-full rounded-xl border border-zinc-300  focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-zinc-700"
                                    >
                                        Email address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={userData.email}
                                        onChange={handleChange}
                                        placeholder="Email address"
                                        required
                                        className="mt-1 block w-full rounded-xl border border-zinc-300  focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="phoneNo"
                                        className="block text-sm font-medium text-zinc-700"
                                    >
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="phoneNo"
                                        name="phoneNo"
                                        value={userData.phoneNo}
                                        onChange={handleChange}
                                        placeholder="Phone number"
                                        className="mt-1 block w-full rounded-xl border border-zinc-300  focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="lawmaCustomerType"
                                        className="block text-sm font-medium text-zinc-700"
                                    >
                                        LAWMA Customer type
                                    </label>
                                    <select
                                        id="lawmaCustomerType"
                                        name="lawmaCustomerType"
                                        value={userData.lawmaCustomerType}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-xl border border-zinc-300  focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14 bg-white"
                                    >
                                        <option value="">Select existing or new</option>
                                        <option value="existing">Existing</option>
                                        <option value="new">New</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-6 gap-x-5 gap-y-6 mt-12">
                                <div className="md:col-span-2">
                                    <label
                                        htmlFor="buildingName"
                                        className="block text-sm font-medium text-zinc-700 mb-1"
                                    >
                                        Building name
                                    </label>
                                    <input
                                        type="text"
                                        id="buildingName"
                                        name="buildingName"
                                        value={userData.buildingName}
                                        onChange={handleChange}
                                        placeholder="Building Name"
                                        required
                                        className="form-input w-full border border-zinc-300 p-4 rounded-xl"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label
                                        htmlFor="buildingType"
                                        className="block text-sm font-medium text-zinc-700 mb-1"
                                    >
                                        Building Type
                                    </label>
                                    <select
                                        id="buildingType"
                                        name="buildingType"
                                        value={userData.buildingType}
                                        onChange={handleChange}
                                        required
                                        className="form-select w-full border border-zinc-300 p-3 rounded-xl"
                                    >
                                        <option disabled value="">
                                            {" "}
                                            Building Type
                                        </option>
                                        {options.buildingTypes.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label
                                        htmlFor="houseNo"
                                        className="block text-sm font-medium text-zinc-700 mb-1"
                                    >
                                        House number
                                    </label>
                                    <input
                                        type="text"
                                        id="houseNo"
                                        name="houseNo"
                                        value={userData.houseNo}
                                        onChange={handleChange}
                                        placeholder="House Number"
                                        required
                                        className="form-input w-full border border-zinc-300 p-4 rounded-xl"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label
                                        htmlFor="flatNumber"
                                        className="block text-sm font-medium text-zinc-700 mb-1"
                                    >
                                        Flat number
                                    </label>
                                    <input
                                        type="text"
                                        id="flatNumber"
                                        name="flatNumber"
                                        value={userData.flatNumber}
                                        onChange={handleChange}
                                        placeholder="Flat Number"
                                        required
                                        className="form-input w-full border border-zinc-300 p-4 rounded-xl"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label
                                        htmlFor="lga"
                                        className="block text-sm font-medium text-zinc-700 mb-1"
                                    >
                                        Local Government
                                    </label>
                                    <select
                                        id="lga"
                                        name="lga"
                                        value={userData.lga}
                                        onChange={handleChange}
                                        required
                                        className="form-select w-full border border-zinc-300 p-3 rounded-xl"
                                    >
                                        <option disabled value="">
                                            Select Local Government
                                        </option>
                                        {options.lgas.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Closest Landmark Input */}
                                <div className="md:col-span-2">
                                    <label
                                        htmlFor="closestLandmark"
                                        className="block text-sm font-medium text-zinc-700 mb-1"
                                    >
                                        Closest Landmark
                                    </label>
                                    <input
                                        type="text"
                                        id="closestLandmark"
                                        name="closestLandmark"
                                        onChange={handleChange}
                                        value={userData.closestLandmark}
                                        placeholder="Street name"
                                        className="w-full p-4 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-150 ease-in-out text-sm placeholder-zinc-400"
                                    />
                                </div>

                                {/* Address Textarea */}
                                <div className="md:col-span-6">
                                    <label
                                        htmlFor="address"
                                        className="block text-sm font-medium text-zinc-700 mb-1"
                                    >
                                        Full Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="address"
                                        value={userData.address}
                                        name="address"
                                        onChange={handleChange}
                                        required
                                        rows="3"
                                        placeholder="Enter your Address"
                                        className="w-full p-4 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-150 ease-in-out text-sm placeholder-zinc-400"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Action Buttons */}
                        <div className="pt-6  flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="inline-flex justify-center rounded-lg border border-green-700 bg-white py-4 px-6 text-base font-medium text-green-700  hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-150 ease-in-out"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`inline-flex justify-center rounded-lg border border-transparent py-4 px-12 text-base font-medium text-white s focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out
                ${isSubmitting
                                        ? "bg-zinc-400 cursor-not-allowed"
                                        : "bg-green-700 hover:bg-green-700 focus:ring-green-500"
                                    }`}
                            >
                                {isSubmitting ? "Registering..." : "Register user"}
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

export default SignUpModal;
