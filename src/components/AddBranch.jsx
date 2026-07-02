import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Added useCallback and useMemo import
// --- Import your Axios instance --- (Update the path to YOUR actual file)
import api from '../api/axiosConfig'; // <-- IMPORTANT: Update this path

// --- Helper Components & Icons ---
const Spinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-zinc-500 hover:text-zinc-800">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

export default function AddBranchModal({ isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        branchName: '',
        address: '',
        lga: '',
        landmark: '',
        state: '',
        lawmaCustomerType: 'Returning'
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState('');

    const [lgas, setLgas] = useState([]);
    const [loadingLgas, setLoadingLgas] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        const fetchLgas = async () => {
            setLoadingLgas(true);
            try {
                const { data } = await api.get('/utility/get-lgas');
                if (Array.isArray(data)) {
                    setLgas(data);
                } else if (data?.success && Array.isArray(data.data)) {
                    setLgas(data.data);
                }
            } catch (error) {
                console.error('Error fetching LGAs:', error);
            } finally {
                setLoadingLgas(false);
            }
        };
        fetchLgas();
    }, [isOpen]);

    const nigerianStates = useMemo(() => {
        const states = lgas.map(item => typeof item === 'string' ? '' : item.state).filter(Boolean);
        return Array.from(new Set(states)).sort();
    }, [lgas]);

    const filteredLgas = useMemo(() => {
        if (!formData.state) return [];
        return lgas.filter(item => typeof item !== 'string' && item.state === formData.state);
    }, [lgas, formData.state]);

    // --- Improved handleClose with useCallback ---
    const handleClose = useCallback(() => {
        if (isSubmitting) return;
        onClose();
    }, [isSubmitting, onClose]); // Dependencies for useCallback

    // --- Effect for Escape Key ---
    useEffect(() => {
        const handleEsc = (event) => {
            // Use modern event.key instead of deprecated keyCode
            if (event.key === 'Escape') {
                handleClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, handleClose]); // Added handleClose to dependencies

    // --- Effect to Reset Form ---
    useEffect(() => {
        if (!isOpen) {
            setFormData({
                branchName: '',
                address: '',
                lga: '',
                landmark: '',
                state: '',
                lawmaCustomerType: 'Returning'
            });
            setErrors({});
            setApiError('');
            setIsSubmitting(false);
        }
    }, [isOpen]);

    // --- Handlers ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            // --- Clear LGA if state changes ---
            if (name === 'state' && newData.lga && newData.state !== prev.state) {
                newData.lga = ''; // Clear LGA selection
            }
            return newData;
        });
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.branchName.trim()) newErrors.branchName = "Branch name is required.";
        if (!formData.address.trim()) newErrors.address = "Branch address is required.";
        if (formData.address.trim().length < 10) newErrors.address = "Address should be at least 10 characters long.";
        if (!formData.lga) newErrors.lga = "Please select a Local Government Area.";
        if (!formData.landmark.trim()) newErrors.landmark = "Closest landmark is required.";
        if (!formData.state) newErrors.state = "Please select a state.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // --- Refactored handleSubmit ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        const payload = {
            branchName: formData.branchName,
            branchAddress: formData.address,
            localGovernmentArea: formData.lga,
            closestLandmark: formData.landmark,
            state: formData.state,
            lawmaCustomerType: formData.lawmaCustomerType
        };

        try {
            const response = await api.post('/corporate/add-branch', payload);

            if (response.status >= 200 && response.status < 300) {
                // Success: Check for a message in response.data if available
                const successMessage = response.data?.message || "Branch added successfully!";
                onSuccess(successMessage);
                handleClose();
            } else {
                throw new Error(`Unexpected response status: ${response.status}`);
            }
        } catch (error) {
            console.error("API Error:", error);

            let errorMessage = "An unexpected error occurred. Please try again.";

            if (error.response) {
                console.error("Error Data:", error.response.data);
                console.error("Error Status:", error.response.status);
                console.error("Error Headers:", error.response.headers);

                // --- Enhanced Error Parsing ---
                const errorData = error.response.data;
                if (errorData) {
                    // Case 1: Backend sends a specific message string
                    if (typeof errorData === 'string') {
                        errorMessage = errorData;
                    }
                    // Case 2: Backend sends { message: "..." }
                    else if (typeof errorData === 'object' && errorData.message) {
                        errorMessage = errorData.message;
                    }
                    // Case 3: Backend sends { errors: [...] } (common in validation)
                    else if (typeof errorData === 'object' && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
                        // Take the first error message, or join them
                        errorMessage = errorData.errors[0]; // Or errorData.errors.join(', ')
                    }
                    // Case 4: Backend sends { error: "..." } (another common pattern)
                    else if (typeof errorData === 'object' && errorData.error) {
                        errorMessage = errorData.error;
                    }
                    // Add more cases as needed based on your backend's error format
                }

                // Specific HTTP status code handling (can override generic message parsing)
                if (error.response.status === 409) {
                    errorMessage = "A branch with this name or details already exists.";
                } else if (error.response.status >= 500) {
                    errorMessage = "Server error. Please try again later.";
                }
                // Add handling for 400 (Bad Request), 401/403 (Auth) if relevant

            } else if (error.request) {
                console.error("Error Request:", error.request);
                errorMessage = "No response received from server. Please check your connection and try again.";
            } else {
                console.error("Error Message:", error.message);
                // Keep the default fallback message
            }

            setApiError(errorMessage);
            // Do NOT close modal or call onSuccess here
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 transition-opacity duration-300"
            onClick={handleClose}
        >
            <div
                className="bg-white rounded-xl w-full max-w-xl transform transition-all duration-300 animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 relative">
                    <div className='mb-8 mt-2'>
                        <h2 className="text-2xl font-bold text-zinc-800 mb-6">Add branch</h2>
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-100 transition-colors"
                            aria-label="Close modal"
                            disabled={isSubmitting}
                        >
                            <CloseIcon />
                        </button>
                    </div>
                    {apiError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{apiError}</span>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="space-y-5">
                            <div>
                                <label htmlFor="branchName" className="block text-sm font-medium text-zinc-700 mb-1">Branch name</label>
                                <input
                                    type="text"
                                    id="branchName"
                                    name="branchName"
                                    value={formData.branchName}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-3 border rounded-md placeholder-zinc-400 focus:outline-none focus:ring-2 ${errors.branchName ? 'border-red-500 focus:ring-red-500' : 'border-zinc-300 focus:ring-green-700'}`}
                                    placeholder="e.g., Ikeja Main Branch"
                                    disabled={isSubmitting}
                                    required // Accessibility/UX improvement
                                />
                                {errors.branchName && <p className="text-red-600 text-xs mt-1">{errors.branchName}</p>}
                            </div>
                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-zinc-700 mb-1">Address of branch</label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-3 border rounded-md placeholder-zinc-400 focus:outline-none focus:ring-2 ${errors.address ? 'border-red-500 focus:ring-red-500' : 'border-zinc-300 focus:ring-green-700'}`}
                                    placeholder="e.g., 123 Awolowo Avenue"
                                    disabled={isSubmitting}
                                    required
                                />
                                {errors.address && <p className="text-red-600 text-xs mt-1">{errors.address}</p>}
                            </div>
                            <div>
                                <label htmlFor="state" className="block text-sm font-medium text-zinc-700 mb-1">State</label>
                                <select
                                    id="state"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-3 border rounded-md bg-white focus:outline-none focus:ring-2 ${errors.state ? 'border-red-500 focus:ring-red-500' : 'border-zinc-300 focus:ring-green-700'}`}
                                    disabled={isSubmitting || loadingLgas}
                                    required
                                >
                                    <option value="" disabled>
                                        {loadingLgas ? 'Loading states...' : 'Select a state'}
                                    </option>
                                    {nigerianStates.map(state => <option key={`state-${state}`} value={state}>{state}</option>)}
                                </select>
                                {errors.state && <p className="text-red-600 text-xs mt-1">{errors.state}</p>}
                            </div>
                            <div>
                                <label htmlFor="lga" className="block text-sm font-medium text-zinc-700 mb-1">Local Government area</label>
                                <select
                                    id="lga"
                                    name="lga"
                                    value={formData.lga}
                                    onChange={handleInputChange}
                                    disabled={!formData.state || isSubmitting}
                                    className={`w-full px-3 py-3 border rounded-md bg-white focus:outline-none focus:ring-2 ${errors.lga ? 'border-red-500 focus:ring-red-500' : 'border-zinc-300 focus:ring-green-700'} disabled:bg-zinc-100 disabled:cursor-not-allowed`}
                                    required
                                >
                                    <option value="" disabled>Select an LGA</option>
                                    {filteredLgas.map(lgaObj => {
                                        const name = typeof lgaObj === 'string' ? lgaObj : lgaObj.name;
                                        return <option key={`lga-${name}`} value={name}>{name}</option>;
                                    })}
                                </select>
                                {errors.lga && <p className="text-red-600 text-xs mt-1">{errors.lga}</p>}
                            </div>
                            <div>
                                <label htmlFor="landmark" className="block text-sm font-medium text-zinc-700 mb-1">Closest Landmark</label>
                                <input
                                    type="text"
                                    id="landmark"
                                    name="landmark"
                                    value={formData.landmark}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-3 border rounded-md placeholder-zinc-400 focus:outline-none focus:ring-2 ${errors.landmark ? 'border-red-500 focus:ring-red-500' : 'border-zinc-300 focus:ring-green-700'}`}
                                    placeholder="e.g., Beside Shoprite Mall"
                                    disabled={isSubmitting}
                                    required
                                />
                                {errors.landmark && <p className="text-red-600 text-xs mt-1">{errors.landmark}</p>}
                            </div>
                            <div>
                                <label htmlFor="lawmaCustomerType" className="block text-sm font-medium text-zinc-700 mb-1">LAWMA customer type</label>
                                <select
                                    id="lawmaCustomerType"
                                    name="lawmaCustomerType"
                                    value={formData.lawmaCustomerType}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-3 border border-zinc-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-sm"
                                    disabled={isSubmitting}
                                    required
                                >
                                    <option value="New">New</option>
                                    <option value="Returning">Returning</option>
                                </select>
                            </div>
                        </div>
                        <div className="my-6 flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isSubmitting}
                                className="px-6 py-3 border border-green-700 rounded-md font-medium text-green-700 bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-400 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex items-center px-6 py-3 border border-transparent rounded-md font-medium text-white bg-green-700 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-700 disabled:bg-green-400 disabled:cursor-not-allowed"
                            >
                                {isSubmitting && <Spinner />}
                                {isSubmitting ? 'Adding...' : 'Add branch'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};