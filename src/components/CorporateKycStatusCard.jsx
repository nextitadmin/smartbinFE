import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import useAuthStore from '../store/authStore';

// --- Default Data Layer ---
const defaultKycData = [
    { id: 'identity', name: 'Identification documents', status: 'loading' },
    { id: 'corporate_info', name: 'Corporate Information', status: 'loading' },
    { id: 'signatories', name: 'Signatories', status: 'loading' },
];

// --- Helper: Get Status Display ---
const getStatusDisplay = (status, onReupload) => {
    switch (status) {
        case 'approved':
            return {
                text: 'Approved',
                textColor: 'text-green-700',
                icon: (
                    <svg className="w-4 h-4 text-green-700 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                ),
                action: null,
            };
        case 'rejected':
        case '0':
            return {
                text: 'Rejected',
                textColor: 'text-red-600',
                icon: (
                    <svg className="w-4 h-4 text-yellow-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.493-1.697-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm0-5a1 1 0 011 1v2a1 1 0 11-2 0V9a1 1 0 011-1z" clipRule="evenodd"></path>
                    </svg>
                ),
                action: (
                    <button
                        onClick={onReupload}
                        className="ml-4 text-sm font-medium text-green-700 hover:text-green-800 underline focus:outline-none"
                    >
                        Reupload
                    </button>
                ),
            };
        case 'submitted':
        case 'pending':
            return {
                text: 'Submitted',
                textColor: 'text-zinc-400',
                icon: (
                    <svg className="w-4 h-4 text-green-700 mr-2 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="7" cy="7" r="5" fill="white" stroke="#007836" strokeWidth="4" />
                    </svg>
                ),
                action: null,
            };
        case 'loading':
        default:
            return {
                text: 'Loading...',
                textColor: 'text-zinc-400',
                icon: (
                    <svg className="animate-spin w-4 h-4 text-zinc-400 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ),
                action: null,
            };
    }
};

// --- Notification Modal Component ---
const NotificationModal = ({ isOpen, onClose, title, message, type }) => {
    if (!isOpen) return null;

    const isSuccess = type === 'success';
    const isError = type === 'error';

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center mb-4">
                    {isSuccess && (
                        <svg className="w-6 h-6 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    )}
                    {isError && (
                        <svg className="w-6 h-6 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    )}
                    <h3 className={`text-lg font-medium ${isError ? 'text-red-600' : 'text-green-600'}`}>
                        {title}
                    </h3>
                </div>
                <p className="text-gray-700 mb-6">{message}</p>
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 rounded-md ${isError ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white focus:outline-none`}
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- KYC Status Card Component ---
function KycStatusCard() {
    const [kycData, setKycData] = useState(defaultKycData);
    const [notification, setNotification] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'success'
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const showNotification = (title, message, type = 'success') => {
        setNotification({
            isOpen: true,
            title,
            message,
            type
        });
    };

    const closeNotification = () => {
        setNotification(prev => ({ ...prev, isOpen: false }));
    };

    const fetchKycStatus = async () => {
        setIsLoading(true);
        setKycData(prevData => prevData.map(item => ({ ...item, status: 'loading' })));

        try {
            const response = await api.get('/corporate/kyc/status');

            // Handle HTTP errors
            if (response.status !== 200) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = response.data;

            // Handle API response structure errors
            if (!data) {
                throw new Error('Invalid response structure');
            }

            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch KYC status');
            }

            if (!data.data) {
                throw new Error('No KYC data found in response');
            }

            const {
                hasSubmittedIdentity,
                identityVerificationStatus,
                hasSubmittedCorporateInformation,
                hasSubmittedSignatories,
                signatoryVerificationStatus,
            } = data.data;

            // Validate required fields exist
            if (typeof hasSubmittedIdentity === 'undefined' ||
                typeof identityVerificationStatus === 'undefined' ||
                typeof hasSubmittedCorporateInformation === 'undefined' ||
                typeof hasSubmittedSignatories === 'undefined' ||
                typeof signatoryVerificationStatus === 'undefined') {
                throw new Error('Incomplete KYC data in response');
            }

            setKycData([
                {
                    id: 'identity',
                    name: 'Identification documents',
                    status: hasSubmittedIdentity ? identityVerificationStatus.toLowerCase() : 'pending',
                },
                {
                    id: 'corporate_info',
                    name: 'Corporate Information',
                    status: hasSubmittedCorporateInformation ? 'submitted' : 'pending',
                },
                {
                    id: 'signatories',
                    name: 'Signatories',
                    status: hasSubmittedSignatories ? signatoryVerificationStatus.toLowerCase() : 'pending',
                },
            ]);

        } catch (error) {
            console.error('Error fetching KYC status:', error);

            // Handle different error types
            let errorMessage = 'An unexpected error occurred while fetching KYC status.';

            if (error.response) {
                // Server responded with error status
                switch (error.response.status) {
                    case 401:
                        errorMessage = 'Authentication failed. Please log in again.';
                        break;
                    case 403:
                        errorMessage = 'Access denied. You do not have permission to view this information.';
                        break;
                    case 404:
                        errorMessage = 'KYC data not found.';
                        break;
                    case 500:
                        errorMessage = 'Server error. Please try again later.';
                        break;
                    default:
                        errorMessage = error.response.data?.message || `Server error (${error.response.status})`;
                }
            } else if (error.request) {
                // Network error
                errorMessage = 'Network error. Please check your connection and try again.';
            } else if (error.message) {
                // Other errors
                errorMessage = error.message;
            }

            showNotification('Error', errorMessage, 'error');

            // Reset to default state on error
            setKycData(defaultKycData);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchKycStatus();
    }, []);

    const handleReupload = (itemId) => {
        console.log(`Reupload requested for item: ${itemId}`);
        navigate('/kycapplication');
    };

    const handleRetry = () => {
        closeNotification();
        fetchKycStatus();
    };

    return (
        <>
            <NotificationModal
                isOpen={notification.isOpen}
                onClose={closeNotification}
                title={notification.title}
                message={notification.message}
                type={notification.type}
            />

            <div className="bg-white p-6 py-8 rounded-2xl w-full lg:min-w-[600px] mx-auto font-sans">
                <div className="flex flex-col space-y-6">
                    {kycData.map((item) => {
                        const display = getStatusDisplay(item.status, () => handleReupload(item.id));

                        return (
                            <div key={item.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center flex-shrink mr-4">
                                    {display.icon}
                                    <span className="text-zinc-800">{item.name}</span>
                                </div>
                                <div className="flex items-center flex-shrink-0 text-right">
                                    <span className={`font-medium ${display.textColor}`}>
                                        {display.text}
                                    </span>
                                    {display.action}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {isLoading && (
                    <div className="mt-4 text-center text-sm text-gray-500">
                        Refreshing status...
                    </div>
                )}
            </div>
        </>
    );
}

export default KycStatusCard;