import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

// --- Helper Components & Icons ---

// Loading Spinner SVG Icon
const LoadingSpinner = () => (
    <svg
        className="animate-spin h-8 w-8 text-zinc-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
    >
        <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
        ></circle>
        <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
    </svg>
);

// Close (X) SVG Icon from Heroicons
const XMarkIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// A single detail item component for reusability
const DetailItem = ({ label, value, highlight = false }) => (
    <div>
        <p className="text-sm text-zinc-900  ">{label}</p>
        <p
            className={`text-base  ${highlight ? 'text-green-600' : 'text-zinc-800'}`}
        >
            {value || '-'}
        </p>
    </div>
);


// --- Main Component: TenantDetailsSideBar ---

const TenantDetailsSideBar = ({ tenantId, isOpen, onClose }) => {
    const [tenantData, setTenantData] = useState({
                dateAdded: '',
                payerId: '',
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                lawmaType: '',
                binType: '',
                binId: '',
                binStatus: '',
                buildingName: '',
                buildingType: '',
                houseNumber: '',
                flatNumber: '',
                localGovernment: '',
                closestLandmark: '',
                fullAddress: '',
            });
    const [isLoading, setIsLoading] = useState(false);

    // Mock API call simulation
    console.log(tenantId);
    useEffect(() => {
        // Don't fetch if the sidebar is closed or there's no ID
        if (!isOpen || !tenantId) {
            return;
        }

        const fetchTenantData = async () => {
            setIsLoading(true);

            try {
                const { data } = await api.get('/facility-managers/user/tenants');
                if (data.success && Array.isArray(data.data)){
                    const item = data.data.find(t => t._id === tenantId || t.id === tenantId);
                    if (item) {
                        const newData = {
                            dateAdded: item.createdAt ? item.createdAt.slice(0,10) : '',
                            payerId: item.payerId || item.payerID || '-',
                            firstName: item.firstName,
                            lastName: item.lastName,
                            email: item.email,
                            phone: item.phoneNumber || item.phoneNo || '-',
                            lawmaType: item.lawmaCustomerType,
                            binType: item.binType || '-',
                            binId: item.binId || item.binID || '-',
                            binStatus: item.binStatus || item.statusName || '-',
                            buildingName: item.buildingName,
                            buildingType: item.buildingType,
                            houseNumber: item.houseNumber || item.houseNo,
                            flatNumber: item.flatNumber || item.flatNo,
                            localGovernment: item.localGovernmentArea?.name || item.localGovernmentArea?.id || item.lga,
                            closestLandmark: item.closestLandmark || item.landMark,
                            fullAddress: item.address || item.residentialAddress,
                        };
                        setTenantData(newData);
                    }
                }
            } catch (error) {
                console.log("Error fetching action details", error);
            }
           
            setIsLoading(false);
        };

        fetchTenantData();
    }, [tenantId, isOpen]); // Rerun effect if ID or open state changes

    // Handle Escape key press to close the sidebar
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 overflow-hidden"
            aria-labelledby="slide-over-title"
            role="dialog"
            aria-modal="true"
        >
            <div className="absolute inset-0 overflow-hidden">
                {/* Background overlay */}
                <div
                    className="absolute inset-0 bg-black/50 transition-opacity"
                    aria-hidden="true"
                    onClick={onClose}
                ></div>

                {/* This is the container that was changed */}
                <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
                    <div
                        className="pointer-events-auto w-screen max-w-2xl transform transition ease-in-out duration-500 sm:duration-700 "
                    >
                        <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl p-8">
                            {/* Header */}
                            <div className="px-4 sm:px-6 py-4 border-b border-zinc-200">
                                <div className="flex items-start justify-between">
                                    <h2 className="text-xl font-semibold text-zinc-900" id="slide-over-title">
                                        Tenant details
                                    </h2>
                                    <div className="ml-3 flex h-7 items-center">
                                        <button
                                            type="button"
                                            className="rounded-md bg-white text-zinc-400 hover:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                            onClick={onClose}
                                        >
                                            <span className="sr-only">Close panel</span>
                                            <XMarkIcon />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="relative mt-6 flex-1 px-4 sm:px-6">
                                {isLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
                                        <LoadingSpinner />
                                    </div>
                                )}

                                {tenantData && !isLoading && (
                                    <div className="space-y-12 pt-4">
                                        <div className="grid grid-cols-2 gap-x-6 gap-y-10">
                                            <DetailItem label="Date added" value={tenantData.dateAdded} />
                                            <DetailItem label="Payer ID" value={tenantData.payerId} />
                                            <DetailItem label="First Name" value={tenantData.firstName} />
                                            <DetailItem label="Last Name" value={tenantData.lastName} />
                                            <DetailItem label="Email address" value={tenantData.email} />
                                            <DetailItem label="Phone number" value={tenantData.phone} />
                                            <DetailItem label="LAWMA Type" value={tenantData.lawmaType} />
                                            <DetailItem label="Bin type" value={tenantData.binType} />
                                            <DetailItem label="Bin ID" value={tenantData.binId} />
                                            <DetailItem label="Bin status" value={tenantData.binStatus} highlight={tenantData.binStatus === 'Assigned'} />
                                            <DetailItem label="Building name" value={tenantData.buildingName} />
                                            <DetailItem label="Building type" value={tenantData.buildingType} />
                                            <DetailItem label="House number" value={tenantData.houseNumber} />
                                            <DetailItem label="Flat number" value={tenantData.flatNumber} />
                                            <DetailItem label="Local Government" value={tenantData.localGovernment} />
                                            <DetailItem label="Closest Landmark" value={tenantData.closestLandmark} />
                                        </div>
                                        <div>
                                            <DetailItem label="Full address" value={tenantData.fullAddress} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Demo Component: How to use the sidebar ---

export default TenantDetailsSideBar;


