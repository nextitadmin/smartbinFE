import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import useAuthStore from '../store/authStore';

// --- Default Data Layer ---
// Represents the initial state before data is fetched
const defaultKycData = [
    { id: 'id_docs', name: 'Identification documents', status: 'loading' }, // Initial loading state
    { id: 'address_info', name: 'Address Information', status: 'loading' },
];

// --- Helper: Get Status Display ---
// This function centralizes the logic for displaying status text, icons, and actions
const getStatusDisplay = (status, onReupload) => {
    switch (status) {
        case 'approved':
            return {
                text: 'Approved',
                textColor: 'text-green-700',
                icon: ( // Checkmark Icon
                    <svg className="w-4 h-4 text-green-700 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                ),
                action: null,
            };
        case 'rejected':
        case '0':
            return {
                text: 'Rejected',
                textColor: 'text-red-600',
                icon: ( // Alert Icon (simplified)
                    <svg className="w-4 h-4 text-yellow-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.493-1.697-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm0-5a1 1 0 011 1v2a1 1 0 11-2 0V9a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                ),
                action: ( // Reupload Button/Link
                    <button
                        onClick={onReupload}
                        className="ml-4 text-sm font-medium text-green-700 hover:text-green-800 underline focus:outline-none"
                    >
                        Reupload
                    </button>
                ),
            };
        case 'submitted':
        case 'pending': // Treat submitted and pending similarly
            return {
                text: 'Submitted',
                textColor: 'text-zinc-400',
                icon: ( // Pending/Submitted Icon (simple circle)
                    <svg className="w-4 h-4 text-green-700 mr-2 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="7" cy="7" r="5" fill="white" stroke="#007836" stroke-width="4" />{/* Smaller inner circle */}
                    </svg>
                ),
                action: null,
            };
        case 'not_submitted':
        case 'not submitted':
        case 'unsubmitted':
            return {
                text: 'Not Submitted',
                textColor: 'text-yellow-600',
                icon: (
                    <svg className="w-4 h-4 text-yellow-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                ),
                action: (
                    <button
                        onClick={onReupload}
                        className="ml-4 text-sm font-medium text-green-700 hover:text-green-800 underline focus:outline-none"
                    >
                        Submit now
                    </button>
                ),
            };
        case 'loading':
        default:
            return {
                text: 'Loading...',
                textColor: 'text-zinc-400',
                icon: ( // Loading Spinner Icon
                    <svg className="animate-spin w-4 h-4 text-zinc-400 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ),
                action: null,
            };
    }
};


// --- KYC Status Card Component ---
function KycStatusCard({ endpoint = '/resident/kyc/status' }) {
    const [kycData, setKycData] = useState(defaultKycData);
    const navigate = useNavigate(); // Uncomment if using React Router

    // --- Fetch KYC Status Function ---
    const fetchKycStatus = async () => {
        setKycData(prevData => prevData.map(item => ({ ...item, status: 'loading' })));

        try {
            const { data } = await api.get(endpoint);

            const statusInfo = data.data || data;
            if (statusInfo) {
                const isStatusActive = (status) => {
                    const s = (status || '').toLowerCase();
                    return s === 'submitted' || s === 'pending' || s === 'approved';
                };

                const hasSubmittedId = statusInfo.hasSubmittedIdentity || isStatusActive(statusInfo.identityVerificationStatus);
                const hasSubmittedAddr = statusInfo.hasSubmittedAddress || isStatusActive(statusInfo.addressVerificationStatus);

                const documentStatus = (hasSubmittedId && statusInfo.identityVerificationStatus)
                    ? statusInfo.identityVerificationStatus
                    : (hasSubmittedId ? 'pending' : 'not_submitted');

                const addressStatus = (hasSubmittedAddr && statusInfo.addressVerificationStatus)
                    ? statusInfo.addressVerificationStatus
                    : (hasSubmittedAddr ? 'pending' : 'not_submitted');

                setKycData(prevData =>
                    prevData.map(item => {
                        if (item.id === 'id_docs') {
                            return { ...item, status: documentStatus.toLowerCase() };
                        } else if (item.id === 'address_info') {
                            return { ...item, status: addressStatus.toLowerCase() };
                        } else {
                            return item;
                        }
                    })
                );
            }
        } catch (error) {
            console.error("Error fetching KYC status:", error);
        }
    };


    // --- useEffect to fetch data on mount ---
    useEffect(() => {
        fetchKycStatus();

    }, []);
    // --- Reupload Handler ---
    const handleReupload = (itemId) => {
        console.log(`Reupload requested for item: ${itemId}`);
        navigate('/kycapplication', { state: { reuploadItem: itemId } });
    };

    return (
        <div className="bg-white p-6 py-8 rounded-2xl  w-full lg:min-w-[600px] mx-auto font-sans">
            <div className="flex flex-col space-y-6">
                {kycData.map((item) => {
                    // Get display properties based on status
                    const display = getStatusDisplay(item.status, () => handleReupload(item.id));

                    return (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                            {/* Left side: Icon and Name */}
                            <div className="flex items-center flex-shrink mr-4">
                                {display.icon}
                                <span className="text-zinc-800">{item.name}</span>
                            </div>

                            {/* Right side: Status Text and Action */}
                            <div className="flex items-center flex-shrink-0 text-right">
                                <span className={`font-medium ${display.textColor}`}>
                                    {display.text}
                                </span>
                                {display.action} {/* Render Reupload button if present */}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default KycStatusCard;