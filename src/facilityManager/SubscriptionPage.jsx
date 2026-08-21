import React, { useState, useEffect, useMemo, useRef } from 'react';
import Sidebar from '../components/FacilityMgrSideBar';
import Topbar from '../components/FacilityMgrTopBar';
import useFacilityMgrStore from '../store/useFacilityMgrStore';
import useAuthStore from '../store/authStore';
import api from '../api/axiosConfig';
import ServiceConfigNav from '../components/FacilityMgrServiceConfigNav';
import Pay4ItButton from '../components/Pay4ItButton';

const InlineLoader = ({ className = "w-5 h-5" }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
);

const AlatIcon = () => null;

const WalletIcon = () => (
    <svg className="w-8 h-8 mx-2 inline-block rounded-sm" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M18.039 13.5515C17.619 13.9615(17.379 14.5515 17.439 15.1815C17.529 16.2615 18.519 17.0515 19.599 17.0515H21.499V18.2415C21.499 20.3115 19.809 22.0015 17.739 22.0015H6.25902C4.18902 22.0015 2.49902 20.3115 2.49902 18.2415V11.5115C2.49902 9.44147 4.18902 7.75146 6.25902 7.75146H17.739C19.809 7.75146 21.499 9.44147 21.499 11.5115V12.9515H19.479C18.919 12.9515 18.409 13.1715 18.039 13.5515Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M2.49902 12.4132V7.84328C2.49902 6.65328 3.22902 5.59323 4.33902 5.17323L12.279 2.17323C13.519 1.70323 14.849 2.62326 14.849 3.95326V7.75325"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M22.5588 13.9716V16.0317C22.5588 16.5817 22.1188 17.0316 21.5588 17.0516H19.5988C18.5188 17.0516 17.5288 16.2616 17.4388 15.1816C17.3788 14.5516 17.6188 13.9616 18.0388 13.5516C18.4088 13.1716 18.9188 12.9517 19.4788 12.9517H21.5588C22.1188 12.9717 22.5588 13.4216 22.5588 13.9716Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M7 12H14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const CloseIcon = ({ className = 'w-5 h-5' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const ClientPreferences = () => {
    const fetchFacilityMgrInfo = useFacilityMgrStore((state) => state.fetchFacilityManagerInfo);
    const FacilityMgr = useFacilityMgrStore((state) => state.facilityMgrInfo);

    const [subscription, setSubscription] = useState(null);
    const [status, setStatus] = useState('loading');
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState('');
    const [notification, setNotification] = useState(null);
    const [subscriptionPlans, setSubscriptionPlans] = useState([]);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');

    // Tenant Selection States
    const [tenants, setTenants] = useState([]);
    const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
    const [selectedTenantId, setSelectedTenantId] = useState('');
    const [selectedTenant, setSelectedTenant] = useState(null);

    const paymentOptions = [
        { id: 'card', text: 'Pay by card/bank/transfer', icon: AlatIcon },
    ];

    const clearNotification = () => {
        setNotification(null);
    };

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                clearNotification();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    useEffect(() => {
        const fetchSubscriptions = async () => {
            try {
                const { data } = await api.get('/subscription/plans');
                if (data.success && Array.isArray(data.data)) {
                    const plans = data.data.map((item) => {
                        const priceInNaira = item.price / 100;
                        const pricePerMonthVal = Math.round(priceInNaira / item.duration);
                        return {
                            ...item,
                            id: item._id,
                            duration: `${item.duration} ${item.duration === 1 ? 'month' : 'months'}`,
                            price: `₦${priceInNaira.toLocaleString()}`,
                            pricePerMonth: `₦${pricePerMonthVal.toLocaleString()} per month`,
                            originalPrice: item.price
                        };
                    });
                    setSubscriptionPlans(plans);
                }
            } catch {
                setNotification({ type: 'error', message: 'Error fetching subscription plans.' });
            }
        };
        const fetchTenants = async () => {
            try {
                const { data } = await api.get("/facility-managers/user/tenants");
                if (data.success || data.succeeded) {
                    const list = Array.isArray(data.data) ? data.data : (data.data?.data || []);
                    setTenants(list);
                }
            } catch (err) {
                console.error("Error fetching tenants:", err);
            }
        };

        fetchSubscriptions();
        fetchTenants();
        fetchFacilityMgrInfo();
    }, []);

    const activeTenant = useMemo(() => {
        if (!selectedTenantId || tenants.length === 0) return null;
        return tenants.find(t => (t._id || t.id) === selectedTenantId);
    }, [selectedTenantId, tenants]);

    const fetchSubscription = async () => {
        try {
            const response = await api.get('/subscription/status');
            const { data } = response;
            if ((data.success || data.succeeded) && data.data) {
                const subscriptionData = data.data;
                if (subscriptionData && subscriptionData.status === 'active') {
                    const sub = {
                        id: subscriptionData.plan || subscriptionData.planId || 'active',
                        duration: subscriptionData.planName || 'Active Subscription',
                        price: `₦${subscriptionData.amount || 0}`,
                        pricePerMonth: `₦${subscriptionData.amount || 0} per month`,
                        endDate: subscriptionData.endDate || subscriptionData.expiryDate || null
                    };
                    setSubscription(sub);
                    setStatus('active');
                } else {
                    setStatus('inactive');
                }
            } else {
                setStatus('inactive');
            }
        } catch (err) {
            console.error(err);
            setError('Could not fetch subscription.');
            setStatus('error');
        }
    };

    useEffect(() => {
        fetchSubscription();
    }, []);

    const handleSubscription = () => {
        const plan = subscriptionPlans.find(p => p.id === selectedPlanId);
        if (!plan) {
            setNotification({ type: 'error', message: 'Please select a valid plan.' });
            return;
        }
        setIsPaymentModalOpen(true);
        setIsModalOpen(false);
    };

    const checkSubscriptionBeforePayment = async () => {
        try {
            const response = await api.get('/subscription/status');
            const { data } = response;
            if ((data.success || data.succeeded) && data.data) {
                const subscriptionData = data.data;
                if (subscriptionData && subscriptionData.status === 'active') {
                    setNotification({
                        type: 'error',
                        message: 'You already have an active subscription. Please wait for it to expire before subscribing again.'
                    });
                    const sub = {
                        id: subscriptionData.plan || subscriptionData.planId || 'active',
                        duration: subscriptionData.planName || 'Active Subscription',
                        price: `₦${subscriptionData.amount || 0}`,
                        pricePerMonth: `₦${subscriptionData.amount || 0} per month`,
                        endDate: subscriptionData.endDate || subscriptionData.expiryDate || null
                    };
                    setSubscription(sub);
                    setStatus('active');
                    return false;
                }
            }
        } catch (e) {
            console.error("Error checking subscription status:", e);
        }
        return true;
    };

    const handlePaymentWithWallet = async () => {
        const selectedPlan = subscriptionPlans.find((item) => item.id === selectedPlanId);

        if (!selectedPlan) {
            setNotification({ type: 'error', message: 'Please select a valid subscription plan.' });
            return;
        }

        if (!(await checkSubscriptionBeforePayment())) {
            return;
        }

        try {
            const amount = selectedPlan.originalPrice ? (selectedPlan.originalPrice / 100) : parseInt(String(selectedPlan.price).replace(/[^\d]/g, ''));

            const response = await api.post("/wallets/charge", {
                amount,
            });
            const data = response.data;

            if (data.succeeded || data.success) {
                let successRef;
                if (data.message && data.message.includes('|')) {
                    successRef = data.message.split('|')[1]?.trim();
                }
                if (!successRef) {
                    successRef = data.data?.transactionReference || data.data?.reference || data.data?.transRef || data.reference;
                }
                if (!successRef) {
                    successRef = 'N/A';
                }
                handlePayment({ reference: successRef, channel: "wallet" });
                setNotification({ type: 'success', message: 'Payment successful!' });
            } else {
                setNotification({ type: 'error', message: data.message || "Error processing wallet payment" });
            }
        } catch (error) {
            console.error("Error processing wallet payment:", error);
            setNotification({ type: 'error', message: "Error processing wallet payment" });
        }
    };

    const handlePayment = async (response) => {
        let ref, channel;
        if (selectedPaymentMethod === 'wallet') {
            ref = response?.reference || response?.data?.reference || response?.tranref;
            channel = "wallet";
        } else if (selectedPaymentMethod === 'card') {
            ref = response?.data?.reference || response?.reference || response?.tranref;
            channel = "card";
        }
        if (!selectedPaymentMethod) {
            setNotification({ type: 'error', message: 'Select a payment method' });
            return;
        }
        if (!ref) {
            setNotification({ type: 'error', message: 'Payment reference is missing' });
            return;
        }
        const selectedPlan = subscriptionPlans.find(p => p.id === selectedPlanId);
        if (!selectedPlan) {
            setNotification({ type: 'error', message: 'Invalid plan selected.' });
            return;
        }

        let transactionReferenceToSend = ref;

        if (selectedPaymentMethod === 'card') {
            try {
                const amount = selectedPlan.originalPrice ? (selectedPlan.originalPrice / 100) : parseInt(String(selectedPlan.price).replace(/[^\d]/g, ''));
                const chargeResponse = await api.post("/wallets/charge", {
                    amount,
                });
                const chargeData = chargeResponse.data;
                if (chargeData.succeeded || chargeData.success) {
                    let chargeRef;
                    if (chargeData.message && chargeData.message.includes('|')) {
                        chargeRef = chargeData.message.split('|')[1]?.trim();
                    }
                    if (!chargeRef) {
                        chargeRef = chargeData.data?.transactionReference || chargeData.data?.reference || chargeData.data?.transRef || chargeData.reference;
                    }
                    if (chargeRef) {
                        transactionReferenceToSend = chargeRef;
                    }
                } else {
                    setNotification({ type: 'error', message: chargeData.message || 'Failed to process subscription charge' });
                    return;
                }
            } catch (error) {
                console.error("Error processing subscription charge:", error);
                setNotification({ type: 'error', message: 'Failed to process subscription charge' });
                return;
            }
        }

        const dataToSend = {
            plan: selectedPlan.id,
            transactionReference: String(transactionReferenceToSend),
            ...(selectedTenant ? {
                userId: selectedTenant.userId || selectedTenant.id || selectedTenant._id,
                tenantId: selectedTenant.id || selectedTenant._id
            } : {})
        };

        try {
            const { data } = await api.post('/subscription/subscribe', dataToSend);
            if (data.succeeded || data.success) {
                setNotification({ type: 'success', message: data.message || 'Submitted successfully!' });
                fetchSubscription();
                setIsPaymentModalOpen(false);
                setSelectedTenant(null);
            } else {
                setNotification({ type: 'error', message: data.message || 'Payment failed.' });
            }
        } catch {
            setNotification({ type: 'error', message: 'Error processing payment.' });
        }
    };

    const handleTenantNext = () => {
        if (!activeTenant) return;
        setSelectedTenant(activeTenant);
        setIsTenantModalOpen(false);
        setIsModalOpen(true); // Open Plan Selection Modal immediately
    };

    const renderSubscriptionCard = () => {
        if (status === 'loading') {
            return (
                <div className="w-full max-w-[1000px] mx-auto bg-white border border-[#F0F2F5] rounded-[10px] p-10 min-h-[418px] flex items-center justify-center">
                    <InlineLoader className="w-8 h-8 text-green-700" />
                </div>
            );
        }

        if (status === 'error') {
            return (
                <div className="w-full max-w-[1000px] mx-auto bg-white border border-[#F0F2F5] rounded-[10px] p-10 min-h-[418px] flex items-center justify-center">
                    <p className="text-red-600 font-sans">{error}</p>
                </div>
            );
        }

        return (
            <div className="w-full max-w-[1000px] mx-auto bg-white border border-[#F0F2F5] rounded-[10px] p-10 font-sans min-h-[418px] flex flex-col justify-between">
                {/* Header (Frame 1000007493) */}
                <div className="flex flex-col gap-1 pb-6 border-b border-[#F0F2F5]">
                    <h2 className="text-[20px] font-semibold text-[#101928] leading-[145%]">Subscription</h2>
                    <p className="text-[14px] font-normal text-[#828282] leading-[145%]">Track your waste disposal</p>
                </div>

                {/* Content Area */}
                {subscription ? (
                    /* Active Subscription View */
                    <div className="flex-1 flex flex-col justify-center py-6 gap-6">
                        <div className="p-6 border border-[#007836] bg-[#f7f6ff] rounded-[10px] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 max-w-2xl mx-auto w-full">
                            <div>
                                <span className="text-base font-semibold text-[#101928] block">
                                    {subscriptionPlans.find(p => p.id === subscription.id)?.duration || subscription.duration}
                                </span>
                                <p className="text-sm text-green-700 font-medium mt-1">Status: Active</p>
                            </div>
                            <div className="text-left sm:text-right">
                                <span className="text-lg font-bold text-[#101928] block">
                                    {subscriptionPlans.find(p => p.id === subscription.id)?.price || subscription.price}
                                </span>
                                <span className="text-xs text-[#828282] block mt-1">
                                    {subscriptionPlans.find(p => p.id === subscription.id)?.pricePerMonth || subscription.pricePerMonth}
                                </span>
                                {subscription.endDate && (
                                    <span className="text-xs text-[#828282] block mt-1">
                                        Expires: {new Date(subscription.endDate).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="text-center mt-4">
                            <button
                                onClick={() => {
                                    setIsTenantModalOpen(true); // Choose tenant first to edit/change subscription
                                }}
                                className="px-8 py-3 bg-[#007836] hover:bg-[#005c28] text-white text-[14px] font-semibold rounded-[8px] transition duration-200"
                            >
                                Change plan
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Inactive / No Subscription Empty State View (Figma Spec) */
                    <div className="flex-1 flex flex-col items-center justify-center py-10 gap-3">
                        <h3 className="text-[16px] font-semibold text-black leading-[140%]">No Subscription</h3>
                        <p className="text-[12px] font-medium text-[#838383] leading-[140%] max-w-[361px] text-center">
                            You do not have an active subscription for your waste collection
                        </p>
                        <button
                            onClick={() => {
                                setIsTenantModalOpen(true);
                            }}
                            className="mt-4 px-8 py-3.5 bg-[#007836] hover:bg-[#005c28] text-white text-[14px] font-semibold rounded-[8px] transition duration-200"
                        >
                            Subscribe now
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const displayAmount = useMemo(() => {
        const p = subscriptionPlans.find(p => p.id === selectedPlanId);
        if (!p) return 0;
        return p.originalPrice ? (p.originalPrice / 100) : parseInt(String(p.price).replace(/[^\d]/g, ''));
    }, [selectedPlanId, subscriptionPlans]);

    return (
        <div>
            <div className="flex sans h-screen">
                <Sidebar addkey="1" />
                <div className="flex-1 bg-zinc-100 min-h-screen overflow-y-auto">
                    <Topbar />
                    <div className="bg-zinc-100 font-sans">
                        <main className="p-4 ">
                            <div className="p-5 md:p-8 rounded-lg w-full mx-auto">
                                <div className="flex flex-wrap justify-between items-center gap-4 mb-2">
                                    <div className="flex flex-col gap-2">
                                        <h1 className="text-xl md:text-2xl font-semibold text-zinc-800">Subscription</h1>
                                        <span className='text-zinc-500'>Manage your subscription plan and configurations</span>
                                    </div>
                                </div>

                                <ServiceConfigNav />

                                <div className="mt-8">
                                    {renderSubscriptionCard()}

                                    {selectedTenant && (
                                        <div className="max-w-[1000px] mx-auto mt-6 p-4 bg-green-50 border border-green-200 rounded-[10px] flex justify-between items-center font-sans">
                                            <span className="text-sm font-medium text-green-800">
                                                Selected Tenant: <strong className="font-semibold">{`${selectedTenant.firstName || ''} ${selectedTenant.lastName || ''}`}</strong> ({selectedTenant.buildingName || 'No Building'})
                                            </span>
                                            <button 
                                                onClick={() => setSelectedTenant(null)} 
                                                className="text-xs text-green-700 hover:text-green-900 font-semibold underline"
                                            >
                                                Clear Selection
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>

            {/* Choose Tenant Modal (Figma Spec) */}
            {isTenantModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[16px] p-10 w-full max-w-[530px] shadow-xl font-sans relative" style={{ minHeight: '551px' }}>
                        {/* Close button */}
                        <button 
                            onClick={() => setIsTenantModalOpen(false)} 
                            className="absolute right-6 top-6 text-zinc-400 hover:text-zinc-600 focus:outline-none"
                        >
                            <CloseIcon className="w-6 h-6" />
                        </button>

                        <div className="flex flex-col gap-6">
                            {/* Header Section */}
                            <div className="flex flex-col gap-2">
                                <h3 className="text-[24px] font-bold text-[#222222] leading-[110%] tracking-[-0.01em]">Choose tenant</h3>
                                <p className="text-[16px] font-medium text-[#828282] leading-[140%]">
                                    Select tenant to subscribe for scheduled waste collection
                                </p>
                            </div>

                            {/* Form Fields Container */}
                            <div className="flex flex-col gap-4 mt-2">
                                {/* Select Tenant Field */}
                                <div className="flex flex-col gap-2.5">
                                    <label className="text-[14px] font-semibold text-[#333333]">Select tenant</label>
                                    <div className="relative">
                                        <select
                                            value={selectedTenantId}
                                            onChange={(e) => setSelectedTenantId(e.target.value)}
                                            className="w-full h-[51px] px-6 border border-[#E0E0E0] rounded-[8px] bg-white text-zinc-800 text-[14px] font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-green-700"
                                        >
                                            <option value="" disabled className="text-[#B4B4B4]">Select tenant name</option>
                                            {tenants.map(t => (
                                                <option key={t._id || t.id} value={t._id || t.id}>
                                                    {`${t.firstName || ''} ${t.lastName || ''}`.trim() || t.email}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-5 top-1/2 transform -translate-y-1/2 pointer-events-none text-zinc-600">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Telephone Number Field */}
                                <div className="flex flex-col gap-2.5">
                                    <label className="text-[14px] font-semibold text-[#333333]">Telephone number</label>
                                    <input
                                        type="text"
                                        readOnly
                                        value={activeTenant?.phoneNumber || activeTenant?.phoneNo || ''}
                                        placeholder="Telephone"
                                        className="w-full h-[51px] px-6 border border-[#E0E0E0] rounded-[8px] bg-zinc-50 text-zinc-700 text-[14px] font-medium focus:outline-none placeholder-[#B4B4B4]"
                                    />
                                </div>

                                {/* Building Name Field */}
                                <div className="flex flex-col gap-2.5">
                                    <label className="text-[14px] font-semibold text-[#333333]">Building name</label>
                                    <input
                                        type="text"
                                        readOnly
                                        value={activeTenant?.buildingName || activeTenant?.building || ''}
                                        placeholder="Building name"
                                        className="w-full h-[51px] px-6 border border-[#E0E0E0] rounded-[8px] bg-zinc-50 text-zinc-700 text-[14px] font-medium focus:outline-none placeholder-[#B4B4B4]"
                                    />
                                </div>
                            </div>

                            {/* Next Button */}
                            <button
                                onClick={handleTenantNext}
                                disabled={!selectedTenantId}
                                className="w-full h-[50px] mt-2 rounded-[8px] font-semibold text-[14px] text-white flex items-center justify-center transition duration-200"
                                style={{
                                    backgroundColor: selectedTenantId ? '#007836' : 'rgba(0, 120, 54, 0.5)',
                                    cursor: selectedTenantId ? 'pointer' : 'not-allowed'
                                }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Plan Selection Modal (Figma/Resident Styled Modal) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[16px] p-8 w-full max-w-lg shadow-xl relative max-h-[90vh] overflow-y-auto font-sans">
                        <button 
                            onClick={() => setIsModalOpen(false)} 
                            className="absolute right-6 top-6 text-zinc-400 hover:text-zinc-600 focus:outline-none"
                        >
                            <CloseIcon className="w-5 h-5" />
                        </button>

                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-semibold text-zinc-900">Select Subscription Plan</h3>
                                <p className="text-sm text-zinc-500 mt-1">
                                    {selectedTenant ? `Choose a plan for ${selectedTenant.firstName} ${selectedTenant.lastName}` : 'Select a plan below'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {subscriptionPlans.length === 0 ? (
                                <div className="text-center py-6 text-zinc-500">
                                    <InlineLoader className="mx-auto mb-2" />
                                    Loading available plans...
                                </div>
                            ) : (
                                subscriptionPlans.map(plan => (
                                    <label
                                        key={plan.id}
                                        htmlFor={plan.id}
                                        className={`bg-[#f7f6ff] p-4 rounded-xl flex items-center gap-4 cursor-pointer transition-all duration-200 border ${
                                            selectedPlanId === plan.id ? 'border-2 border-green-700' : 'border-2 border-transparent'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            id={plan.id}
                                            value={plan.id}
                                            checked={selectedPlanId === plan.id}
                                            onChange={() => setSelectedPlanId(plan.id)}
                                            className="opacity-0 w-0 h-0 fixed"
                                        />
                                        <span className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                            selectedPlanId === plan.id ? 'border-green-700 bg-green-700' : 'border-zinc-400 bg-white'
                                        }`}>
                                            {selectedPlanId === plan.id && <span className="w-2 h-2 rounded-full bg-white" />}
                                        </span>
                                        <div className="flex-grow flex justify-between items-center">
                                            <span className="font-light text-zinc-900 text-sm">{plan.duration}</span>
                                            <div className="text-right">
                                                <span className="text-xl text-zinc-900 font-semibold">{plan.price}</span>
                                                <p className="text-xs text-zinc-500 mt-0.5">{plan.pricePerMonth}</p>
                                            </div>
                                        </div>
                                    </label>
                                ))
                            )}
                        </div>

                        <div className="mt-8 flex gap-4">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-3 border border-zinc-300 rounded-xl text-zinc-700 hover:bg-zinc-50 transition font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubscription}
                                disabled={!selectedPlanId}
                                className="flex-grow py-3 bg-[#007836] hover:bg-[#005c28] text-white rounded-xl transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Make Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Method Modal */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-zinc-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-zinc-800">Select Payment Method</h3>
                            <button onClick={() => setIsPaymentModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <label className="px-6 py-4 rounded-xl border border-zinc-200 flex items-center gap-4 hover:bg-zinc-50 cursor-pointer">
                                <WalletIcon />
                                <span className="text-sm font-medium text-zinc-800 flex-grow">
                                    {`Pay from wallet (₦${displayAmount.toLocaleString()})`}
                                </span>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    id="wallet"
                                    value="wallet"
                                    checked={selectedPaymentMethod === 'wallet'}
                                    onChange={() => setSelectedPaymentMethod('wallet')}
                                    className="custom-radio h-5 w-5 text-green-600"
                                />
                            </label>

                            {paymentOptions.map((option) => (
                                <label key={option.id} className="px-6 py-4 rounded-xl border border-zinc-200 flex items-center gap-4 hover:bg-zinc-50 cursor-pointer">
                                    <span className="text-sm font-medium text-zinc-800 flex-grow">
                                        {option.text}
                                    </span>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        id={option.id}
                                        value={option.id}
                                        checked={selectedPaymentMethod === option.id}
                                        onChange={() => setSelectedPaymentMethod(option.id)}
                                        className="custom-radio h-5 w-5 text-green-600"
                                    />
                                </label>
                            ))}
                        </div>

                        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex flex-col items-center gap-3">
                            {selectedPaymentMethod === 'card' ? (
                                <Pay4ItButton
                                    amount={displayAmount}
                                    email={FacilityMgr?.emailAddress || useAuthStore.getState().email || "facility@email.com"}
                                    customerName={`${FacilityMgr?.firstName || ''} ${FacilityMgr?.lastName || ''}`.trim() || "Facility Manager"}
                                    description="Smart Bin Facility Subscription"
                                    userType="Facility"
                                    onBeforePayment={checkSubscriptionBeforePayment}
                                    onSuccess={handlePayment}
                                    buttonText={`Pay ₦${displayAmount.toLocaleString()}`}
                                    buttonClassName="w-full py-3 bg-green-700 hover:bg-green-800 text-white rounded-xl font-medium transition text-center block"
                                />
                            ) : (
                                <button
                                    onClick={handlePaymentWithWallet}
                                    className="w-full py-3 bg-green-700 hover:bg-green-800 text-white rounded-xl font-medium transition"
                                >
                                    {`Pay ₦${displayAmount.toLocaleString()} from Wallet`}
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setIsPaymentModalOpen(false);
                                    setIsModalOpen(true);
                                }}
                                className="text-sm text-zinc-500 hover:text-zinc-800 font-medium py-1"
                            >
                                Back
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Notification Toast */}
            {notification && (
                <div
                    className={`fixed top-5 right-5 p-4 rounded-xl shadow-lg max-w-sm z-50 border transition-all duration-300 ${
                        notification.type === 'success'
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : 'bg-red-50 border-red-200 text-red-800'
                    }`}
                    role="alert"
                >
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-medium">{notification.message}</p>
                        <button
                            onClick={clearNotification}
                            className="text-zinc-500 hover:text-zinc-700 focus:outline-none text-lg font-bold"
                        >
                            &times;
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientPreferences;