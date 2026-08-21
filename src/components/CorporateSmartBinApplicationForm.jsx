import React from 'react';
import api from '../api/axiosConfig'; // Assuming you have an axios instance configured in api.js
// --- DUMMY DATA & MOCK APIs ---
// In a real application, these would be in separate files (e.g., api.js)
import useCorporateStore from '../store/useCorporateStore';




/**
 * MOCK API: Fetches the list of available branches.
 * @returns {Promise<Array<{id: string, name: string}>>} A promise that resolves with the list of branches.
 */


/**
 * MOCK API: Fetches detailed information for a specific branch.
 * @param {string} branchId - The ID of the selected branch.
 * @returns {Promise<{address: string, localGovt: string, landmark: string}>} A promise that resolves with branch details.
 */


/**
 * MOCK API: Submits the smart bin application form.
 * @param {object} formData - The collected form data.
 * @returns {Promise<{success: boolean, message: string}>} A promise that resolves with a success message.
 */
// const submitApplicationAPI = (formData) => {
//     console.log('API CALL: Submitting application...', formData);
//     return new Promise((resolve) => {
//         setTimeout(() => {
//             console.log('API RESPONSE: Application submitted successfully.');
//             resolve({ success: true, message: 'Application submitted successfully!' });
//         }, 2000); // Simulate 2-second network delay
//     });
// };


// --- HELPER COMPONENTS ---

// Custom Select/Dropdown Component
const CustomSelect = ({ options, selected, onSelect, placeholder, disabled, isLoading }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const selectRef = React.useRef(null);

    const handleSelect = (option) => {
        onSelect(option);
        setIsOpen(false);
    };

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={selectRef}>
            <button
                type="button"
                disabled={disabled || isLoading}
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-zinc-50 border border-zinc-300 text-zinc-900 rounded-lg focus:ring-green-500 focus:border-green-500 p-3.5 text-left flex justify-between items-center disabled:bg-zinc-200 disabled:cursor-not-allowed"
            >
                <span className={selected ? 'text-zinc-900' : 'text-zinc-500'}>
                    {isLoading ? 'Loading...' : (selected ? selected.name : placeholder)}
                </span>
                <svg className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {isOpen && !disabled && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-zinc-200">
                    <ul className="max-h-60 overflow-auto">
                        {options.map((option) => (
                            <li
                                key={option.id}
                                onClick={() => handleSelect(option)}
                                className="px-4 py-2 text-zinc-700 hover:bg-green-100 cursor-pointer"
                            >
                                {option.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

// Input Field Component
const InputField = ({ id, label, type = 'text', value, onChange, placeholder, disabled = false }) => (
    <div>
        <label htmlFor={id} className="block mb-2 text-sm font-medium text-zinc-700">{label}</label>
        <input
            type={type}
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className="bg-zinc-50 border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-3.5 disabled:bg-zinc-200"
            required
        />
    </div>
);


// --- MAIN COMPONENT ---

const SmartBinApplicationForm = ({ onClose, onSubmitSuccess }) => {
    // State for form fields
    const [formData, setFormData] = React.useState({
        branch: null,
        companyAddress: '',
        lgaId: '',
        closestLandmark: '',
        surname: '',
        firstName: '',
        email: '',
        telephone: '',
    });

    // State for UI and API calls
    const [branchOptions, setBranchOptions] = React.useState([]);
    const [lgasList, setLgasList] = React.useState([]);
    const [isFetchingBranches, setIsFetchingBranches] = React.useState(true);
    const [isFetchingDetails, setIsFetchingDetails] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const corporatePayerId = useCorporateStore((state) => state.corporateInfo).payerId

    const fetchBranchesAPI = async () => {
        try {
            const { data } = await api.get('/corporate/fetch-branches');
            console.log("Branches fetched:", data);
            if (data.success) {
                let branches = data.data.data.map(branch => (
                    {
                        id: branch._id,
                        name: branch.branchName,
                        address: branch.branchAddress,
                        lgaId: branch.lgaId,
                        landmark: branch.closestLandmark
                    }));
                setBranchOptions(branches);
                setIsFetchingBranches(false);
            }
        } catch (error) {
            console.log("Failed to fetch branches:", error);
        }
    };

    const fetchLgas = async () => {
        try {
            const { data } = await api.get('/utility/get-lgas');
            if (data.success) {
                setLgasList(data.data);
            } else if (Array.isArray(data)) {
                setLgasList(data);
            }
        } catch (error) {
            console.log("Failed to fetch LGAs:", error);
        }
    };

    React.useEffect(() => {
        fetchBranchesAPI();
        fetchLgas();
    }, []);

    const getLgaName = (lgaId) => {
        if (!lgaId) return '';
        const found = lgasList.find(item => item._id === lgaId || item.id === lgaId);
        return found ? found.name : lgaId;
    };


    const handleBranchSelect = (branch) => {
        setFormData(prev => ({ ...prev, branch, companyAddress: '', lgaId: '', closestLandmark: '' }));
        setIsFetchingDetails(true);

        const branchDetail = branchOptions.find(b => b.id === branch.id);

        if (branchDetail) {
            setFormData(prev => ({
                ...prev,
                companyAddress: branchDetail.address,
                lgaId: branchDetail.lgaId,
                closestLandmark: branchDetail.landmark
            }));
        }
        setIsFetchingDetails(false);
    };

    // Handle standard input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const CloseIcon = ({ className = 'w-5 h-5' }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
    );
    // Handle form submission 
    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Create payload mapping formData to API requirements
        const payload = {
            firstName: formData.firstName || "Not provided",
            surname: formData.surname || "Not provided",
            email: formData.email || "notprovided@example.com",
            phoneNumber: formData.telephone || "",           // Map telephone to phoneNumber
            payerId: corporatePayerId || "N/A",                                  // NOT AVAILABLE IN FORM DATA
            address: formData.companyAddress || "",          // Map companyAddress to address
            closestLandmark: formData.closestLandmark || "Not specified",
            localGovernmentArea: formData.lgaId || "",   // Map localGovt to localGovernmentArea
            branch: formData.branch.name || "Main Branch",
            lawmaCustomerType: "Returning",                  // REQUIRED FIXED VALUE
            binType: "smart"                                 // REQUIRED FIXED VALUE
        };

        console.log("Submitting application with payload:", payload);

        // Make API call using your configured axios instance
        api.post('/corporates/smart-bin/applications', payload)
            .then(response => {
                console.log("Application submitted successfully:", response.data);
                onSubmitSuccess(); // Notify parent component of success
            })
            .catch(error => {
                console.error("Submission failed:", error);
                // Handle error appropriately (show error message to user)
            })
            .finally(() => setIsSubmitting(false));
    };
    return (
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-full">
            <div className="p-6 sm:p-8 border-b border-zinc-200 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-zinc-800">Apply for Smart Bin</h2>
                <button onClick={onClose} aria-label="Close" className="text-red-600 hover:text-zinc-600">
                    <CloseIcon />
                </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                {/* Branch Selection */}
                <div>
                    <label className="block mb-2 text-sm font-medium text-zinc-700">Select branch</label>
                    <CustomSelect
                        placeholder="Select a branch"
                        options={branchOptions}
                        selected={formData.branch}
                        onSelect={handleBranchSelect}
                        isLoading={isFetchingBranches}
                        disabled={isFetchingBranches}
                    />
                </div>

                {/* Address Details - Populated from API */}
                <div className="relative">
                    {isFetchingDetails && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-lg">
                            <svg className="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    )}
                    <div className="space-y-6">
                        <InputField
                            id="companyAddress"
                            label="Company address"
                            value={formData.companyAddress}
                            onChange={handleInputChange}
                            placeholder="Automatically filled after branch selection"
                            disabled={true}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField
                                id="localGovt"
                                label="Local Government"
                                value={getLgaName(formData.lgaId)}
                                onChange={handleInputChange}
                                placeholder="Auto-filled"
                                disabled={true}
                            />
                            <InputField
                                id="closestLandmark"
                                label="Closest landmark"
                                value={formData.closestLandmark}
                                onChange={handleInputChange}
                                placeholder="Auto-filled"
                                disabled={true}
                            />
                        </div>
                    </div>
                </div>

                {/* User Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                        id="surname"
                        label="Surname"
                        value={formData.surname}
                        onChange={handleInputChange}
                        placeholder="e.g. Mayode"
                    />
                    <InputField
                        id="firstName"
                        label="First name"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="e.g. Emmanuela"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                        id="email"
                        label="Email address"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="e.g. name@company.com"
                    />
                    <InputField
                        id="telephone"
                        label="Telephone"
                        type="tel"
                        value={formData.telephone}
                        onChange={handleInputChange}
                        placeholder="e.g. +234 905 778 39"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-4 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-8 py-3 text-sm font-semibold text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-400 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || isFetchingDetails || !formData.branch}
                        className="px-8 py-3 text-sm font-semibold text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting...
                            </>
                        ) : (
                            'Next'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SmartBinApplicationForm;
