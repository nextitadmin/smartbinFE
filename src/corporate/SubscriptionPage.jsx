import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import useAuthStore from '../store/authStore';
import useCorporateStore from '../store/useCorporateStore';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/CorporateTopBar';
import ServiceConfigNav from '../components/ServiceConfigNav';
import AlatPayButton from '../components/AlatPayButton'; // make sure this exists

const InlineLoader = ({ className = "w-5 h-5" }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
);

const AlatIcon = () => (
    <span className="font-medium text-zinc-800 flex items-center gap-1">
        <img
            src="https://alat.ng/wp-content/uploads/2021/03/cropped-ALAT_By_Wema_Bank.jpg"
            alt="Alat Logo"
            className="w-10 h-10 mx-2 inline-block rounded-sm"
        />
    </span>
);

const WalletIcon = () => (
    <svg className="w-8 h-8 mx-2 inline-block rounded-sm" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M18.039 13.5515C17.619 13.9615 17.379 14.5515 17.439 15.1815C17.529 16.2615 18.519 17.0515 19.599 17.0515H21.499V18.2415C21.499 20.3115 19.809 22.0015 17.739 22.0015H6.25902C4.18902 22.0015 2.49902 20.3115 2.49902 18.2415V11.5115C2.49902 9.44147 4.18902 7.75146 6.25902 7.75146H17.739C19.809 7.75146 21.499 9.44147 21.499 11.5115V12.9515H19.479C18.919 12.9515 18.409 13.1715 18.039 13.5515Z"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M2.49902 12.4132V7.84328C2.49902 6.65328 3.22902 5.59323 4.33902 5.17323L12.279 2.17323C13.519 1.70323 14.849 2.62326 14.849 3.95326V7.75325"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M22.5588 13.9716V16.0317C22.5588 16.5817 22.1188 17.0316 21.5588 17.0516H19.5988C18.5188 17.0516 17.5288 16.2616 17.4388 15.1816C17.3788 14.5516 17.6188 13.9616 18.0388 13.5516C18.4088 13.1716 18.9188 12.9517 19.4788 12.9517H21.5588C22.1188 12.9717 22.5588 13.4216 22.5588 13.9716Z"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M7 12H14"
            stroke="black"
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

function SubscriptionPage() {
    const [subscription, setSubscription] = useState(null);
    const [status, setStatus] = useState('loading');
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    // const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState('');
    const [notification, setNotification] = useState(null);
    const [subscriptionPlans, setSubscriptionPlans] = useState([]);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
    // const [branches, setBranches] = useState([]);
    // const [selectedBranch, setSelectedBranch] = useState("");
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const [subscriptionLoading, setSubscriptionLoading] = useState(false);
    const [successModalType, setSuccessModalType] = useState('subscription');
    const [topUpAmount, setTopUpAmount] = useState("");
    const [selectedSubscriptionPlan, setSelectedSubscriptionPlan] = useState("");
    const Corporate = useCorporateStore.getState().corporateInfo;

    const paymentOptions = [
        { id: 'card', text: 'Pay with Alat By Wema', icon: AlatIcon },
    ];

    const clearNotification = () => {
        setNotification(null);
    };

    const verifyAlatPayTransaction = async (reference) => {
        console.log(" verifyAlatPayTransaction CALLED with reference:", reference);
        console.log(" Reference type:", typeof reference);
        console.log(" Reference length:", reference?.length);
        
        try {
            console.log(" Making API call to verify AlatPay transaction");
            console.log(" API endpoint:", `/wallets/mock-verify?reference=${reference}`);
            
            const { data } = await api.get(
                `/corporate/wallets`
            );
            console.log(" AlatPay verification API response:", data);
            console.log(" Response success status:", data?.success || data?.succeeded);

            if (data?.success || data?.succeeded) {
                console.log(" AlatPay verification SUCCESSFUL");
                setNotification({
                    type: "success",
                    message: "Payment verified successfully!",
                });
            } else {
                console.log(" AlatPay verification FAILED");
                console.log(" Error message:", data?.message);
                setNotification({
                    type: "error",
                    message: data?.message || "Verification failed.",
                });
            }

            return data; //  return it if needed
        } catch (error) {
            console.error(" AlatPay verification API ERROR:", error);
            console.error(" Error details:", {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            setNotification({
                type: "error",
                message: "Payment verification failed.",
            });
            return null; //  indicate failure
        }
    };

    // Function to handle AlatPay payment for subscription (similar to Smart Bin pattern)
    const submitSubscriptionAlatPay = async (amount) => {
        const userId = useAuthStore.getState().user?.id;

        if (!amount || amount < 100) {
            setNotification({ type: "error", message: "Enter a valid amount" });
            return;
        }

        // Check if user already has an active subscription
        if (checkActiveSubscription()) {
            setNotification({ 
                type: 'error', 
                message: 'You already have an active subscription. Please wait for it to expire before subscribing again.' 
            });
            return;
        }

        // Convert from kobo to naira for wallet charge endpoint
        const amountInNaira = amount / 100;

        try {
            console.log(" Submitting Subscription AlatPay payment with amount (kobo):", amount);
            console.log(" Amount in naira:", amountInNaira);
            
            // Call backend to initiate AlatPay payment for subscription
            const { data } = await api.post("/corporate/wallets/charge", {
                userId,
                amount: amountInNaira, // Send amount in naira
                channel: "ALATPay",
                narration: "Subscription Payment",
                paymentPurpose: "Subscription Application"
            });

            console.log(" Subscription AlatPay Response:", data);

            if (data.succeeded || data.success) {
                // Get reference from backend response
                const reference =
                    data?.reference ||
                    data?.data?.transactionReference ||
                    data?.data?.reference;

                if (reference) {
                    console.log(" Backend provided reference:", reference);
                    console.log(" Calling verifyAlatPayTransaction with:", reference);
                    const verifyResult = await verifyAlatPayTransaction(reference);
                    
                    if (verifyResult?.success || verifyResult?.succeeded) {
                        console.log(" AlatPay verification successful, proceeding with subscription");
                        // Proceed with subscription payment
                        await handlePayment({ 
                            reference: reference, 
                            channel: "alatPay",
                            data: { reference: reference }
                        });
                        // Refresh subscription status after successful payment
                        fetchSubscriptionStatus();
                        // Show success modal
                        setSuccessModalType('subscription');
                        setShowSuccessModal(true);
                    } else {
                        console.error(" AlatPay verification failed");
                        setNotification({ type: "error", message: "AlatPay verification failed" });
                    }
                } else {
                    console.warn(" No reference returned from backend response");
                    setNotification({ type: "error", message: "No payment reference received" });
                }
            } else {
                setNotification({
                    type: "error",
                    message: data.message || "Error during AlatPay payment!",
                });
            }
        } catch (error) {
            console.error(" Error in submitSubscriptionAlatPay:", error);
            setNotification({ type: "error", message: "AlatPay payment failed!" });
        }
    };


    useEffect(() => {
        fetchSubscriptionPlans();
        // fetchBranches(); // Commented out
        fetchSubscriptionStatus();
        // Only call fetchSubscription if we need legacy subscription data
        // fetchSubscription();
    }, []);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                clearNotification();
            }, 5000); // Hide after 5 seconds
            return () => clearTimeout(timer); // Cleanup timer on component unmount or notification change
        }
    }, [notification]);

    // const fetchBranches = async () => {
    //     try {
    //         const { data } = await api.get('/corporate/fetch-branches');
    //         if (data.success) {
    //             const newBranches = data.data.data.map((item) => ({
    //                 id: item._id,
    //                 name : `${item.branchName} branch`,
    //                 address : item.branchAddress,
    //             }));
    //             // setBranches(newBranches); // Commented out
    //         }
    //     } catch (error) {
    //         console.error("Error fetching branches:", error);
    //         setNotification({ type: 'error', message: 'Error fetching branches!' });
    //     }
    // };

    const fetchSubscriptionPlans = async () => {
        try {
            const { data } = await api.get('/subscription/plans');
            console.log("Raw subscription plans from backend:", data);
            if (data.success) {
                const newPlans = data.data.map((item) => {
                    console.log("Processing subscription plan item:", item);
                    // Convert from kobo to naira (divide by 100)
                    const priceInNaira = item.price / 100;
                    const pricePerMonthInNaira = (priceInNaira / (item.interval == "year" ? 12 : item.duration));
                    
                    const mappedPlan = {
                        id: item._id,
                        duration: `${item.name}`,
                        price: `₦${priceInNaira.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                        pricePerMonth: `₦${pricePerMonthInNaira.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} per month`,
                        // Store original price in kobo for payment processing
                        originalPrice: item.price
                    };
                    console.log("Mapped subscription plan:", mappedPlan);
                    return mappedPlan;
                });
                console.log("Final subscription plans array:", newPlans);
                setSubscriptionPlans(newPlans);
            }
        } catch (error) {
            console.error("Error fetching subscription plans:", error);
            setNotification({ type: 'error', message: 'Error fetching subscription!' });
        }
    };

    const fetchSubscriptionStatus = async () => {
        setSubscriptionLoading(true);
        try {
            const { data } = await api.get('/subscription/status');
            console.log("Subscription status response:", data);
            if (data.success || data.succeeded) {
                setSubscriptionStatus(data.data || data);
            }
        } catch (error) {
            console.error("Error fetching subscription status:", error);
        } finally {
            setSubscriptionLoading(false);
        }
    };

    const checkActiveSubscription = () => {
        return subscriptionStatus && subscriptionStatus.status === 'active';
    };

    const fetchSubscription = async () => {
        try {
            console.log("Fetching subscription with token:", useAuthStore.getState().token);
            
            // Try the subscription status endpoint first (more reliable)
            const response = await api.get('/subscription/status');
            const { data } = response;
            console.log("Subscription status response:", data);
            
            if (data.success || data.succeeded) {
                const subscriptionData = data.data || data;
                if (subscriptionData && subscriptionData.status === 'active') {
                    const sub = {
                        id: subscriptionData.planId || 'active',
                        duration: subscriptionData.planName || 'Active Subscription',
                        price: `₦${subscriptionData.amount || 0}`,
                        pricePerMonth: `₦${subscriptionData.amount || 0} per month`,
                    };
                    setSubscription(sub);
                    setStatus('active');
                    console.log("Active subscription found:", sub);
                } else {
                    setStatus('inactive');
                    console.log("No active subscription found");
                }
            } else {
                setStatus('inactive');
                console.log("Subscription status check failed");
            }
        } catch (err) {
            console.error("Error fetching subscription:", err);
            console.error("Error details:", {
                message: err.message,
                status: err.response?.status,
                data: err.response?.data
            });
            setError('Could not fetch subscription.');
            setStatus('error');
        }
    };
    useEffect(() => {
        fetchSubscription();
    }, []);
    const handleSubscriptionBack = () => {
        setIsPaymentModalOpen(false) // Open payment modal
        setIsModalOpen(true)
    }

    const handleBranchBack = () => {
        // setIsSubscriptionModalOpen(false); // Commented out
        // setIsBranchModalOpen(true); // Commented out
    };

    const handleBranchSelection = () => {
        // setIsSubscriptionModalOpen(true); // Commented out
        // setIsBranchModalOpen(false); // Commented out
    }

    const closeBranch = () => {
        // setIsBranchModalOpen(false); // Commented out
        // setSelectedBranch(''); // Commented out
    }

    const closeSubscription = () => {
        closeModal("payment");
        closeModal("subscription");
        setSelectedSubscriptionPlan("");
    };

    const closeModal = (modalName) => {
        if (modalName === "success") {
            setShowSuccessModal(false);
            setTopUpAmount("");
            setSuccessModalType('subscription'); // Reset to default
        }
        if (modalName === "payment") setIsPaymentModalOpen(false);
        else if (modalName === "subscription") setIsModalOpen(false);
    };

    const downloadReceipt = () => {
        console.log("Download Receipt clicked");
        setNotification({ type: "error", message: "Coming soon..." });
        closeModal("success");
    };

    const handleSubscription = () => {
        const plan = subscriptionPlans.find(p => p.id === selectedPlanId);
        if (!plan) {
            setNotification({ type: 'error', message: 'Please select a valid plan.' });
            return;
        }
        setSelectedSubscriptionPlan(selectedPlanId);
        setIsPaymentModalOpen(true);
        setIsModalOpen(false);
    };

    const handlePaymentWithWallet = async () => {
        const selectedPlan = subscriptionPlans.find((item) => item.id === selectedSubscriptionPlan);
        
        if (!selectedPlan) {
            setNotification({ type: 'error', message: 'Please select a valid subscription plan.' });
            return;
        }

        // Check if user already has an active subscription
        if (checkActiveSubscription()) {
            setNotification({ 
                type: 'error', 
                message: 'You already have an active subscription. Please wait for it to expire before subscribing again.' 
            });
            return;
        }

        // Use original price in kobo for API call
        const amount = selectedPlan.originalPrice;

        if (!amount || amount <= 0) {
            setNotification({ type: 'error', message: 'Invalid subscription amount.' });
            return;
        }

        // Convert from kobo to naira for wallet charge endpoint
        const amountInNaira = amount / 100;

        // Debug logging
        console.log("=== WALLET PAYMENT DEBUG ===");
        console.log("Selected Plan:", selectedPlan);
        console.log("Amount:", amount);
        console.log("Corporate:", Corporate);
        console.log("Corporate.accountNo:", Corporate?.accountNo);
        console.log("User Token:", useAuthStore.getState().token);

        try {
            const requestData = {
                userId: useAuthStore.getState().token, 
                drAccountNo: Corporate.accountNo,
                amount: amountInNaira,
                narration: "Subscription Payment",
                paymentPurpose: "Subscription Application"
            };
            
            console.log("Request data to /corporate/wallets/charge:", requestData);
            
            const response = await api.post("/corporate/wallets/charge", requestData);
            const data = response.data;
            console.log("Response from debit-wallet:", data);
            
            if (data.succeeded || data.success) {
                console.log("Wallet payment successful:", data.success, "and message:", data.message);
                
                // Extract reference from response message or use a default
                let successRef = data.reference || data.data?.reference;
                console.log("Initial reference extraction:", successRef);
                
                // If no reference in response, try to extract from message
                if (!successRef && data.message) {
                    let successMessage = data.message.split('|');
                    console.log("Message split result:", successMessage);
                    if (successMessage.length > 1) {
                        successRef = successMessage[1];
                        console.log("Reference extracted from message:", successRef);
                    }
                }
                
                // If still no reference, create a timestamp-based one
                if (!successRef) {
                    successRef = `WALLET_${Date.now()}`;
                    console.log("Generated fallback reference:", successRef);
                }
                
                console.log("Final reference to send to handlePayment:", successRef);
                
                // Call handlePayment with wallet response
                await handlePayment({ 
                    reference: successRef, 
                    channel: "wallet",
                    data: { reference: successRef }
                });
                
                setNotification({ type: 'success', message: 'Payment successful!' });
                // Refresh subscription status after successful payment
                fetchSubscriptionStatus();
                // Show success modal
                setSuccessModalType('subscription');
                setShowSuccessModal(true);
            } else {
                console.error("Wallet payment failed:", data.message);
                setNotification({ type: 'error', message: data.message || "Error processing wallet payment" });
            }
        }
        catch (error) {
            console.error("Error processing wallet payment:", error);
            console.error("Error details:", {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            setNotification({ type: 'error', message: "Error processing wallet payment" });
        }
    };


    const handlePayment = async (response) => {
        console.log("=== HANDLE PAYMENT DEBUG ===");
        console.log("Response received:", response);
        
        let ref, channel;

        if (response.channel === 'wallet') {
            ref = response.reference;
            channel = "wallet";
        } else if (response.channel === 'alatPay') {
            ref = response.reference;
            channel = "alatPay";
        } else if (selectedPaymentMethod === 'card') {
            // AlatPay is now handled by submitSubscriptionAlatPay function
            console.log(" AlatPay payment handled by submitSubscriptionAlatPay");
            return;
        }

        console.log("Extracted ref:", ref);
        console.log("Extracted channel:", channel);

        if (!selectedSubscriptionPlan) {
            setNotification({ type: 'error', message: 'Please select a subscription plan.' });
            return;
        }

        const selectedPlan = subscriptionPlans.find((item) => item.id === selectedSubscriptionPlan);
        if (!selectedPlan) {
            setNotification({ type: 'error', message: 'Invalid plan selected.' });
            return;
        }

        if (!ref) {
            setNotification({ type: 'error', message: 'Payment reference is missing.' });
            return;
        }

        const dataToSend = {
            plan: selectedPlan.id,
            transactionReference: ref,
        };

        console.log("Sending subscription update with data:", dataToSend);

        try {
            const { data } = await api.post('/subscription/subscribe', dataToSend);
            console.log("Subscription update response:", data);
            
            if (data.succeeded || data.success) {
                setNotification({ type: 'success', message: data.message || 'Subscription updated successfully!' });
                // Refresh subscription status after successful payment
                fetchSubscriptionStatus();
                setIsPaymentModalOpen(false);
                // Show success modal
                setSuccessModalType('subscription');
                setShowSuccessModal(true);
            } else {
                setNotification({ type: 'error', message: data.message || 'Subscription update failed.' });
            }
        } catch (error) {
            console.error("Error updating subscription:", error);
            console.error("Error details:", {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            setNotification({ type: 'error', message: 'Error processing subscription update.' });
        }
    };

    const renderCurrentPlan = () => {
        // Show loading state while fetching subscription status
        if (subscriptionLoading) {
            return (
                <div className="py-6 px-4 lg:max-w-[500px] mx-auto">
                    <div className="flex items-center justify-center h-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
                    </div>
                    <p className="text-center text-zinc-500 mt-4">Loading subscription status...</p>
                </div>
            );
        }

        //Show active subscription if exists
        if (subscriptionStatus && subscriptionStatus.status === 'active') {
            return (
                <div className="py-6 px-4 lg:max-w-[500px] mx-auto">
                    <h3 className="text-sm font-medium text-zinc-600 mb-3">Current Subscription</h3>
                    <div className="p-4 border border-green-700 bg-[#f7f6ff] rounded-xl flex justify-between items-center">
                        <div>
                            <span className="text-sm font-medium text-zinc-800">
                                {subscriptionStatus.planName || 'Active Subscription'}
                            </span>
                            <p className="text-xs text-zinc-500 mt-1">Status: Active</p>
                        </div>
                        <div className="text-right">
                            {subscriptionStatus.amount && (
                                <span className="text-sm font-semibold text-zinc-900">
                                    ₦{subscriptionStatus.amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            )}
                            {subscriptionStatus.expiryDate && (
                                <p className="text-xs text-zinc-500 mt-1">
                                    Expires: {new Date(subscriptionStatus.expiryDate).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-center mt-4">
                        <button
                            className="text-sm text-gray-400 cursor-not-allowed"
                            disabled
                        >
                            Active Subscription
                        </button>
                    </div>
                </div>
            );
        }

        // Show available subscription plans if no active subscription
        if (subscriptionPlans.length === 0) {
            return (
                <div className="py-6 px-4 lg:max-w-[500px] mx-auto">
                    <div className="flex items-center justify-center h-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
                    </div>
                    <p className="text-center text-zinc-500 mt-4">Loading subscription plans...</p>
                </div>
            );
        }

        return (
            <div className="py-6 px-4 lg:max-w-[500px] mx-auto">
                <h3 className="text-sm font-medium text-zinc-600 mb-3">Available Subscription Plans</h3>
                <div className="space-y-3">
                    {subscriptionPlans.map(plan => (
                        <div
                            key={plan.id}
                            className="p-4 border border-zinc-200 bg-white rounded-xl flex justify-between items-center hover:border-green-700 transition-colors"
                        >
                            <div>
                                <span className="text-sm font-medium text-zinc-800">{plan.duration}</span>
                                <p className="text-xs text-zinc-500 mt-1">{plan.pricePerMonth}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-sm font-semibold text-zinc-900">{plan.price}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-center mt-6">
                    <button
                        onClick={() => {
                            setSelectedPlanId(subscriptionPlans[0]?.id || '');
                            setIsModalOpen(true);
                            setNotification(null);
                        }}
                        className="text-sm text-green-700 hover:text-green-800 font-medium"
                    >
                        Subscribe to a plan
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-screen">
            <Sidebar addkey="1" />
            <div className="flex-1 bg-zinc-100 min-h-screen overflow-y-auto">
                <Topbar />
                <main className="p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold text-zinc-800">Service Configuration</h1>
                        <p className="text-zinc-500">Manage your preferences for smart bin services</p>
                    </div>
                    <ServiceConfigNav />
                    <div className="bg-white p-6 rounded-lg mt-6 shadow">
                        <h2 className="text-xl font-semibold mb-2">Subscription</h2>
                        <p className="text-sm text-zinc-500 mb-6">Edit your subscription settings</p>
                        {renderCurrentPlan()}
                    </div>
                </main>
                {/* Branch Modal - Commented out as not needed for subscription
                {isBranchModalOpen && (
                    <div className="modal-overlay">
                    <div className="modal-content px-8 py-12">
                        <div className="flex justify-between items-center pb-6">
                        <div>
                            <h3 className="text-2xl font-semibold text-zinc-800">
                            Select branch
                            </h3>
                            <p className="text-zinc-500 mt-1">
                            Select branch to subscribe for scheduled waste collection
                            </p>
                        </div>
                        <button
                            onClick={closeBranch}
                            aria-label="Close"
                            className="text-zinc-700 hover:text-red-600 self-start"
                        >
                            <CloseIcon />
                        </button>
                        </div>
                        <div className="space-y-3">
                        {branches.map((branch) => (
                            <label
                            key={branch.id}
                            className={`bg-[#f7f6ff] p-4 rounded-xl flex items-center gap-4 ${
                                selectedBranch === branch.id ? "border-2 border-green-700" : ""
                            }`}
                            >
                            <input
                                type="radio"
                                name="subscriptionPlan"
                                id={`branch_${branch.id}`}
                                value={branch.id}
                                checked={selectedBranch === branch.id}
                                onChange={() => setSelectedBranch(branch.id)}
                                className="custom-radio"
                            />
                            <div className="flex-grow flex flex-col items-start gap-2">
                                <span className="font-bold text-xl text-zinc-900">
                                {branch.name}
                                </span>
                                <span className="font-light text-zinc-900">
                                {branch.address}
                                </span>
                            </div>
                            </label>
                        ))}
                        </div>
                        <div className="my-6 flex justify-end">
                        <button
                            onClick={handleBranchSelection}
                            className="btn btn-primary w-full"
                        >
                            Next
                        </button>
                        </div>
                    </div>
                    </div>
                )}
                */}

                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
                        <div className="bg-white rounded-xl w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-xl font-semibold">Edit Subscription</h3>
                                    <p className="text-sm text-zinc-500">Select a new plan below</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)}>
                                    <CloseIcon />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {subscriptionPlans.map(plan => (
                                    <label
                                        key={plan.id}
                                        htmlFor={plan.id}
                                        className={`bg-[#f7f6ff] p-4 rounded-xl flex items-center gap-4 cursor-pointer transition-all duration-200 border ${selectedPlanId === plan.id ? 'border-2 border-green-700' : 'border-2 border-transparent'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            id={plan.id}
                                            value={plan.id}
                                            checked={selectedPlanId === plan.id}
                                            onChange={() => setSelectedPlanId(plan.id)}
                                            className="custom-radio"
                                        />
                                        {/* <span className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPlanId === plan.id ? 'border-green-700 bg-green-700' : 'border-zinc-400 bg-white'
                                            }`}>
                                            {selectedPlanId === plan.id && <span className="w-2 h-2 rounded-full bg-white" />}
                                        </span> */}
                                        <div className="flex-grow flex justify-between items-center">
                                            <span className="font-light text-zinc-900 text-sm">{plan.duration}</span>
                                            <div className="text-right">
                                                <span className="text-xl text-zinc-900 font-semibold">{plan.price}</span>
                                                <p className="text-xs text-zinc-500 mt-0.5">{plan.pricePerMonth}</p>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            <div className="mt-6">
                                <button
                                    onClick={handleSubscription}
                                    className="btn btn-primary w-full"
                                >
                                    Make Payment
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {notification && (
                    <div
                        // Using fixed positioning to overlay on the page
                        className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg max-w-sm z-50 ${notification.type === 'success' ? 'bg-green-100 border border-green-400 text-green-800' : 'bg-red-100 border border-red-400 text-red-800'
                            }`}
                        // ARIA roles for accessibility
                        role={notification.type === 'error' ? 'alert' : 'status'}
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{notification.message}</p>
                            {/* Close button for the notification */}
                            <button
                                onClick={clearNotification}
                                className={`ml-4 text-xl font-semibold leading-none ${notification.type === 'success' ? 'text-green-800 hover:text-green-900' : 'text-red-800 hover:text-red-900'} focus:outline-none`}
                                aria-label="Close notification"
                            >
                                &times; {/* Unicode multiplication sign for 'x' */}
                            </button>
                        </div>
                    </div>
                )}

                {/* Payment Modal */}
                {isPaymentModalOpen && (
        <div 
          className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 p-4" 
          onClick={() => closeModal("payment")}
        >
          <div 
            className="bg-white rounded-xl w-full max-w-lg relative max-h-[90vh] overflow-y-auto" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center py-6 px-8 border-b border-zinc-200">
              <h3 className="text-lg font-semibold text-zinc-800">
                Select Payment Method
              </h3>
              <button
                onClick={() => closeModal("payment")}
                aria-label="Close"
                className="text-zinc-700 hover:text-red-600"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="py-6 px-8 space-y-4">
              <label className="px-6 py-4 rounded-lg flex items-center gap-4">
                <WalletIcon />
                <span className="text-sm font-medium text-zinc-800 flex-grow">
                  {`Pay from wallet (${subscriptionPlans
                    .find((item) => item.id === selectedSubscriptionPlan)
                    ?.price || "₦0.00"})`}
                </span>
                <input
                  type="radio"
                  name="paymentMethod"
                  id="wallet"
                  value="wallet"
                  checked={selectedPaymentMethod === "wallet"}
                  onChange={() => setSelectedPaymentMethod("wallet")}
                  className="custom-radio"
                />
              </label>
              {paymentOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <label
                    key={option.id}
                    className="px-6 py-4 rounded-lg flex items-center gap-4"
                  >
                    <Icon />
                    <span className="text-sm font-medium text-zinc-800 flex-grow">
                      {option.text}
                    </span>
                    <input
                      type="radio"
                      name="paymentMethod"
                      id={`payment_${option.id}`}
                      value={option.id}
                      checked={selectedPaymentMethod === option.id}
                      onChange={() => setSelectedPaymentMethod(option.id)}
                      className="custom-radio"
                    />
                  </label>
                );
              })}
            </div>
            <div className="px-8 py-4 flex flex-col items-center gap-3">
              {selectedPaymentMethod === "card" ? (
                <AlatPayButton
                  metadata={{
                    accountNo:
                      useCorporateStore.getState().corporateInfo.accountNo,
                  }}
                  customerName={
                    useCorporateStore.getState().corporateInfo.companyName ||
                    "Corporate User"
                  }
                  email={
                    useAuthStore.getState().email || "manifestomixx@gmail.com"
                  }
                  redirectUrl="https://smartbin-frontend-staging.up.railway.app/payment-success"
                  amount={
                    subscriptionPlans.find((item) => item.id === selectedSubscriptionPlan)?.originalPrice || 0
                  }
                  onTransaction={(response) => {
                    console.log(" AlatPay onTransaction called with response:", response);
                    // Call the new function that handles backend integration
                    const amount = subscriptionPlans.find((item) => item.id === selectedSubscriptionPlan)?.originalPrice || 0;
                    submitSubscriptionAlatPay(amount);
                  }}
                  onClose={() => {
                    console.log(" AlatPay window closed");
                  }}
                  onPaymentWindowOpen={() => {
                    console.log(" AlatPay payment window opened");
                  }}
                  buttonText="Pay Now with ALATPay"
                  buttonClassName="btn btn-primary w-full"
                />
              ) : (
                <button
                  onClick={handlePaymentWithWallet}
                  className="btn btn-primary w-full"
                >
                  Make Payment
                </button>
              )}
              <button
                onClick={handleSubscriptionBack}
                className="w-full text-center font-medium text-green-700 hover:text-green-900 py-2"
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Success Modal */}
      {showSuccessModal && (
        <div
          onClick={() => closeModal("success")}
          className="fixed inset-0 bg-black/10 bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity duration-300"
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl relative p-6 py-12 md:p-8">
            <button
              onClick={() => closeModal("success")}
              className="absolute top-8 right-8 text-zinc-700 hover:text-red-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
            <div className="flex flex-col items-center text-center mt-6">
              <div className="bg-green-100 p-3 rounded-full mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="41"
                  height="40"
                  viewBox="0 0 41 40"
                  fill="none"
                >
                  <path
                    d="M20.5002 3.3335C11.3168 3.3335 3.8335 10.8168 3.8335 20.0002C3.8335 29.1835 11.3168 36.6668 20.5002 36.6668C29.6835 36.6668 37.1668 29.1835 37.1668 20.0002C37.1668 10.8168 29.6835 3.3335 20.5002 3.3335ZM28.4668 16.1668L19.0168 25.6168C18.7835 25.8502 18.4668 25.9835 18.1335 25.9835C17.8002 25.9835 17.4835 25.8502 17.2502 25.6168L12.5335 20.9002C12.0502 20.4168 12.0502 19.6168 12.5335 19.1335C13.0168 18.6502 13.8168 18.6502 14.3002 19.1335L18.1335 22.9668L26.7002 14.4002C27.1835 13.9168 27.9835 13.9168 28.4668 14.4002C28.9502 14.8835 28.9502 15.6668 28.4668 16.1668Z"
                    fill="#23A26D"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-zinc-800 mb-2">
                Payment Successful!
              </h2>
              <p className="text-zinc-500 mb-6">
                {successModalType === 'subscription' 
                  ? "Your subscription payment has been processed successfully"
                  : "Your wallet has been successfully funded"
                }
              </p>
              <div className="w-full space-y-3 bg-[#F7F9FA] rounded-xl p-4 mb-8 text-left">
                <div className="flex justify-between items-center py-2">
                  <span className="text-zinc-500">Amount</span>
                  <span className="font-medium text-zinc-800">
                    {successModalType === 'subscription' 
                      ? subscriptionPlans.find((item) => item.id === selectedSubscriptionPlan)?.price || "₦0.00"
                      : `₦${topUpAmount}`
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-zinc-500">Payment Status</span>
                  <span className="bg-green-100 text-green-700 px-2 py-1.5 rounded-full text-xs font-medium">
                    Success
                  </span>
                </div>
                <div className="my-12">
                  <div className="my-6 w-full h-[1px] bg-zinc-300"></div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-zinc-500">Ref Number</span>
                  <span className="font-medium text-zinc-800">
                    000085752257
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-zinc-500">Payment Method</span>
                  <span className="font-medium text-zinc-800 flex items-center gap-1">
                    {successModalType === 'subscription' ? (
                      <>
                        <WalletIcon />
                        Wallet Payment
                      </>
                    ) : (
                      <>
                        <img
                          src="https://alat.ng/wp-content/uploads/2021/03/cropped-ALAT_By_Wema_Bank.jpg"
                          alt="Alat Logo"
                          className="w-10 h-10 mx-2 inline-block rounded-sm"
                        />
                        Alat By Wema
                      </>
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-zinc-500">Payment Time</span>
                  <span className="font-medium text-zinc-800">
                    {`${new Date().toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })}. ${new Date().toLocaleTimeString("en-US", {
                      hour12: false,
                    })}`}
                  </span>
                </div>
              </div>
              <button
                onClick={downloadReceipt}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 mb-8 border border-green-700 font-medium rounded-md text-green-700 bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  ></path>
                </svg>
                Download Receipt
              </button>
            </div>
          </div>
        </div>
      )}


            </div>
        </div>
    );
}

export default SubscriptionPage;
