import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

// ─── Icons ────────────────────────────────────────────────────────────────────

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

// ─── Confirmation Modal ───────────────────────────────────────────────────────

const ConfirmationModal = ({ show, onClose, onConfirm, userData }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 font-inter">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-zinc-900">Confirm User Details</h3>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="text-zinc-700 text-sm mb-6 max-h-96 overflow-y-auto pr-2">
                    {[
                        ['User ID', userData.userId],
                        ['First Name', userData.firstName],
                        ['Last Name', userData.lastName],
                        ['Email Address', userData.email],
                        ['Phone Number', userData.phoneNumber],
                        ['Bin Type', userData.binType],
                        ['LAWMA Customer Type', userData.lawmaCustomerType],
                        ['Building Name', userData.buildingName],
                        ['Building Type', userData.buildingType],
                        ['House Number', userData.houseNumber],
                        ['Flat Number', userData.flatNumber],
                        ['Full Address', userData.address],
                        ['Local Government', userData.localGovernment],
                        ['Closest Landmark', userData.closestLandmark],
                    ].map(([label, value]) => (
                        <p key={label} className="mb-2">
                            <span className="font-medium">{label}:</span> {value}
                        </p>
                    ))}
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="inline-flex justify-center rounded-md border border-zinc-300 bg-white py-2 px-4 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="inline-flex justify-center rounded-md border border-transparent bg-green-700 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                        Confirm Add User
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Success Modal ────────────────────────────────────────────────────────────

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
                <button onClick={onClose} className="inline-flex justify-center rounded-md border border-transparent bg-green-700 py-2 px-6 text-base font-medium text-white shadow-sm hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                    Close
                </button>
            </div>
        </div>
    );
};

// ─── Main SignUpModal ─────────────────────────────────────────────────────────

const SignUpModal = ({ show, onClose }) => {

    // Field names match the API spec exactly:
    // POST /api/v1/facility-managers/user
    // { userId, firstName, lastName, email, phoneNumber, houseNumber, flatNumber,
    //   buildingName, buildingType, address, localGovernment, closestLandmark,
    //   lawmaCustomerType, binType }
    const emptyForm = {
        userId: '',   // was: payerId
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',   // was: phoneNo
        binType: '',
        buildingName: '',
        buildingType: '',
        houseNumber: '',   // was: houseNo
        flatNumber: '',   // was: flatNumber (same) / flatNo in payload
        address: '',
        localGovernment: '',   // was: lga
        closestLandmark: '',   // was: closestLandmark (same) / closestLandMark in payload
        lawmaCustomerType: '',
    };

    const [userData, setUserData] = useState(emptyForm);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [options, setOptions] = useState({
        buildingTypes: ['Duplex', 'Bungalow', 'Block of Flats', 'Terrace', 'Detached', 'Semi-Detached', 'Other'],
        lgas: [],
        lawmaCustomerTypes: ['New', 'Existing'],
    });

    // ─── Fetch LGAs ───────────────────────────────────────────────────────────

    const fetchLga = async () => {
        try {
            const response = await api.get('/utility/get-lgas');
            if (response.data?.success && Array.isArray(response.data.data)) {
                setOptions((prev) => ({ ...prev, lgas: response.data.data }));
            }
        } catch (error) {
            console.error('Error fetching LGAs:', error);
        }
    };

    useEffect(() => {
        fetchLga();
    }, []);

    // ─── Form handlers ────────────────────────────────────────────────────────

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData((prev) => ({ ...prev, [name]: value }));
        setErrorMessage('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleConfirmAddUser();
    };

    // ─── API call ─────────────────────────────────────────────────────────────
    // Payload field names now match the API spec exactly — this was causing the 400.

    const handleConfirmAddUser = async () => {
        setShowConfirmationModal(false);
        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const payload = {
                userId: userData.userId,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                phoneNumber: userData.phoneNumber,
                houseNumber: userData.houseNumber,
                flatNumber: userData.flatNumber,
                buildingName: userData.buildingName,
                buildingType: userData.buildingType,
                address: userData.address,
                localGovernment: userData.localGovernment,
                closestLandmark: userData.closestLandmark,
                lawmaCustomerType: userData.lawmaCustomerType,
                binType: userData.binType,
            };

            const response = await api.post('/facility-managers/user', payload);

            if (response.data?.success || response.data?.succeeded) {
                setSuccessMessage(response.data.message || 'User registered successfully!');
                setShowSuccessModal(true);
            } else {
                setErrorMessage(response.data?.message || 'Failed to register user. Please try again.');
            }
        } catch (error) {
            console.error('Submission error:', error);
            const msg = error.response?.data?.message || 'An error occurred during submission.';
            setErrorMessage(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
        setUserData(emptyForm);
        onClose();
    };

    if (!show) return null;

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="fixed inset-0 bg-white flex items-center justify-center p-4 z-40 font-inter overflow-y-auto">
            <div className="bg-white rounded-lg w-full max-w-5xl overflow-hidden flex flex-col transform transition-all sm:my-8 sm:align-middle sm:w-full md:ml-[15%] max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-5 flex justify-between items-center">
                    <h2 className="text-2xl text-zinc-900">Sign up new users</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
                        <XMarkIcon className="w-7 h-7" />
                    </button>
                </div>

                {/* Error banner */}
                {errorMessage && (
                    <div className="mx-6 mb-2 px-4 py-3 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm">
                        {errorMessage}
                    </div>
                )}

                {/* Scrollable form */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">

                        {/* Bin Type */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="lg:col-span-2">
                                <label htmlFor="binType" className="block text-sm font-medium text-zinc-700">Bin type</label>
                                <select id="binType" name="binType" value={userData.binType} onChange={handleChange} required
                                    className="mt-1 block w-full rounded-xl border border-zinc-300 focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14 bg-white">
                                    <option value="">Select Bin type</option>
                                    <option value="smart">Smart</option>
                                    <option value="non_Smart">Non Smart</option>
                                </select>
                            </div>
                        </div>

                        {/* Personal info */}
                        <section>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <div>
                                    <label htmlFor="userId" className="block text-sm font-medium text-zinc-700">User ID</label>
                                    <input type="text" id="userId" name="userId" value={userData.userId} onChange={handleChange}
                                        placeholder="User ID"
                                        className="mt-1 block w-full rounded-xl border border-zinc-300 focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14" />
                                </div>

                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-zinc-700">First Name</label>
                                    <input type="text" id="firstName" name="firstName" value={userData.firstName} onChange={handleChange}
                                        placeholder="First Name" required
                                        className="mt-1 block w-full rounded-xl border border-zinc-300 focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14" />
                                </div>

                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-zinc-700">Last Name</label>
                                    <input type="text" id="lastName" name="lastName" value={userData.lastName} onChange={handleChange}
                                        placeholder="Last Name" required
                                        className="mt-1 block w-full rounded-xl border border-zinc-300 focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14" />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-zinc-700">Email address</label>
                                    <input type="email" id="email" name="email" value={userData.email} onChange={handleChange}
                                        placeholder="Email address" required
                                        className="mt-1 block w-full rounded-xl border border-zinc-300 focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14" />
                                </div>

                                <div>
                                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-zinc-700">Phone Number</label>
                                    <input type="tel" id="phoneNumber" name="phoneNumber" value={userData.phoneNumber} onChange={handleChange}
                                        placeholder="Phone number"
                                        className="mt-1 block w-full rounded-xl border border-zinc-300 focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14" />
                                </div>

                                <div>
                                    <label htmlFor="lawmaCustomerType" className="block text-sm font-medium text-zinc-700">LAWMA Customer type</label>
                                    <select id="lawmaCustomerType" name="lawmaCustomerType" value={userData.lawmaCustomerType} onChange={handleChange}
                                        className="mt-1 block w-full rounded-xl border border-zinc-300 focus:border-green-700 focus:ring-green-700 sm:text-sm p-3 h-14 bg-white">
                                        <option value="">Select existing or new</option>
                                        <option value="Returning">Existing</option>
                                        <option value="New">New</option>
                                    </select>
                                </div>
                            </div>


                            <div className='mt-12'>
                                <h2 className='text-green-600 text-xl font-semibold'>Additional Details</h2>
                            </div>
                            {/* Address fields */}
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-x-5 gap-y-6 mt-12">

                                <div className="md:col-span-2">
                                    <label htmlFor="buildingName" className="block text-sm font-medium text-zinc-700 mb-1">Building/Facility name</label>
                                    <input type="text" id="buildingName" name="buildingName" value={userData.buildingName} onChange={handleChange}
                                        placeholder="Building Name" required
                                        className="form-input w-full border border-zinc-300 p-4 rounded-xl" />
                                </div>

                                <div className="md:col-span-2">
                                    <label htmlFor="buildingType" className="block text-sm font-medium text-zinc-700 mb-1">Building Type</label>
                                    <select id="buildingType" name="buildingType" value={userData.buildingType} onChange={handleChange} required
                                        className="form-select w-full border border-zinc-300 p-3 rounded-xl">
                                        <option disabled value="">Building Type</option>
                                        {options.buildingTypes.map((o) => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label htmlFor="houseNumber" className="block text-sm font-medium text-zinc-700 mb-1">House number</label>
                                    <input type="text" id="houseNumber" name="houseNumber" value={userData.houseNumber} onChange={handleChange}
                                        placeholder="House Number" required
                                        className="form-input w-full border border-zinc-300 p-4 rounded-xl" />
                                </div>

                                <div className="md:col-span-2">
                                    <label htmlFor="flatNumber" className="block text-sm font-medium text-zinc-700 mb-1">Flat number</label>
                                    <input type="text" id="flatNumber" name="flatNumber" value={userData.flatNumber} onChange={handleChange}
                                        placeholder="Flat Number" required
                                        className="form-input w-full border border-zinc-300 p-4 rounded-xl" />
                                </div>

                                <div className="md:col-span-2">
                                    <label htmlFor="localGovernment" className="block text-sm font-medium text-zinc-700 mb-1">Local Government</label>
                                    <select id="localGovernment" name="localGovernment" value={userData.localGovernment} onChange={handleChange} required
                                        className="form-select w-full border border-zinc-300 p-3 rounded-xl">
                                        <option disabled value="">Select Local Government</option>
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
                                    <input type="text" id="closestLandmark" name="closestLandmark" value={userData.closestLandmark} onChange={handleChange}
                                        placeholder="Street name"
                                        className="w-full p-4 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm placeholder-zinc-400" />
                                </div>

                                <div className="md:col-span-6">
                                    <label htmlFor="address" className="block text-sm font-medium text-zinc-700 mb-1">Full Address <span className="text-red-500">*</span></label>
                                    <input id="address" name="address" value={userData.address} onChange={handleChange} required
                                        placeholder="Enter your Address"
                                        className="w-full p-4 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm placeholder-zinc-400" />
                                </div>
                            </div>
                        </section>

                        {/* Actions */}
                        <div className="pt-6 flex justify-end space-x-3">
                            <button type="button" onClick={onClose}
                                className="inline-flex justify-center rounded-lg border border-green-700 bg-white py-4 px-6 text-base font-medium text-green-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                                Cancel
                            </button>
                            <button type="submit" disabled={isSubmitting}
                                className={`inline-flex justify-center rounded-lg border border-transparent py-4 px-12 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out ${isSubmitting ? 'bg-zinc-400 cursor-not-allowed' : 'bg-green-700 hover:bg-green-800 focus:ring-green-500'}`}>
                                {isSubmitting ? 'Registering...' : 'Register user'}
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