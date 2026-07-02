import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import useAuthStore from '../store/authStore';
import useResidentStore from '../store/useResidentStore';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
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
            src="/images/alat-logo.png"
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
    const [selectedPlanId, setSelectedPlanId] = useState('');
    const [notification, setNotification] = useState(null);
    const [subscriptionPlans, setSubscriptionPlans] = useState([]);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false); // default to open for testing
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
    const Resident = useResidentStore.getState().residentInfo;

    const paymentOptions = [
        { id: 'card', text: 'Pay with Alat By Wema', icon: AlatIcon },
    ];

     const clearNotification = () => {
            setNotification(null);
        };
    
    
    
        useEffect(() => {
            if (notification) {
                const timer = setTimeout(() => {
                    clearNotification();
                }, 5000); // Hide after 5 seconds
                return () => clearTimeout(timer); // Cleanup timer on component unmount or notification change
            }
        }, [notification]);

    useEffect(() => {
        const fetchSubscriptions = async () => {
            try {
                const { data } = await api.get('/subscription/plans');
                if (data.succeeded) {
                    const plans = data.data.map((item) => ({
                        id: item.month.toString(),
                        duration: `${item.month} month${item.month > 1 ? 's' : ''}`,
                        price: `₦${item.amount}`,
                        pricePerMonth: `₦${item.amount} per month`,
                    }));
                    setSubscriptionPlans(plans);
                }
            } catch {
                setNotification({ type: 'error', message: 'Error fetching subscription plans.' });
            }
        };
        fetchSubscriptions();
    }, []);

    const fetchSubscription = async () => {
        try {
            const response = await api.get('/subscription/plans');
            const { data } = response;
            if (data.succeeded && data.data) {
                const item = data.data;
                const sub = {
                    id: item.subscriptionType.toString(),
                    duration: `${item.subscriptionType} month${item.subscriptionType > 1 ? 's' : ''}`,
                    price: `₦${item.amount}`,
                    pricePerMonth: `₦${item.amount} per month`,
                };
                setSubscription(sub);
                setStatus('active');
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
    const handleSubscriptionBack = () => {
        setIsPaymentModalOpen(false) // Open payment modal
        setIsSubscriptionModalOpen(true)
    }

    const handleSubscription = () => {
        const plan = subscriptionPlans.find(p => p.id === selectedPlanId);
        if (!plan) {
            setNotification({ type: 'error', message: 'Please select a valid plan.' });
            return;
        }
        setIsPaymentModalOpen(true);
        setIsModalOpen(false);
    };

    const handlePaymentWithWallet = async () => {
        const selectedPlan = subscriptionPlans.find((item) => item.id === selectedPlanId);


        try {
            const response = await api.post("/Wallet/debit-wallet", {
                userId: useAuthStore.getState().token, // Assuming you have a userId in your auth store
                drAccountNo: Resident.accountNo,
                amount: parseInt(selectedPlan.price.replace(/[^\d]/g, '')),
                narration: "Subscription Payment",
                paymentPurpose: "Subscription Application"
            });
            const data = response.data;

            console.log("Response from debit-wallet:", data);

            if (data.succeeded) {
                console.log("Wallet payment successful:", data.succeeded, "and message:", data.message);

                let successMessage = data.message.split('|');
                let successRef; // Assuming the first part is the reference
                console.log(successRef);
                if (successMessage.length > 1) {
                    successRef = successMessage[1];
                }


                 handlePayment({ reference: successRef, channel: "wallet" });
                setNotification({ type: 'success', message: 'Payment successful!' });

            } else {
                console.error("Wallet payment failed:", data.message);
                setNotification({ type: 'error', message: data.message || "Error processing wallet payment" });
            }

        }
        catch (error) {
            console.error("Error processing wallet payment:", error);
            setNotification({ type: 'error', message: "Error processing wallet payment" });
        }


        // Mock response for wallet payment



    }


    const handlePayment = async (response) => {
        let ref, channel;

        if (selectedPaymentMethod === 'wallet') {
            ref = response.reference;
            channel = "wallet";

        }



        else if (selectedPaymentMethod === 'card') {
            ref = response.data.reference;
            channel = "card";
        }
        if (!selectedPaymentMethod || !selectedPlanId) {
            setNotification({ type: 'error', message: 'Select a payment method and plan.' });
            return;
        }

        const selectedPlan = subscriptionPlans.find((item) => item.id === selectedPlanId);
        if (!selectedPlan) {
            setNotification({ type: 'error', message: 'Invalid plan selected.' });
            return;
        }

        const dataToSend = {
            residentID: useAuthStore.getState().token,
            amount: parseInt(selectedPlan.price.replace(/[^\d]/g, '')),
            mode: selectedPaymentMethod,
            subscriptionChoiceMonth: selectedPlan.id,
            transRef : ref
        };

        try {
            const { data } = await api.post('/Wallet/update-subscription', dataToSend);
            if (data.succeeded) {
                setNotification({ type: 'success', message: data.message || 'Submitted successfully!' });
                fetchSubscription();
                setIsPaymentModalOpen(false);

            } else {
                setNotification({ type: 'error', message: data.message || 'Payment failed.' });
            }
        } catch {
            setNotification({ type: 'error', message: 'Error processing payment.' });
        }
    };

    const renderCurrentPlan = () => {
        if (status === 'loading') return <p>Loading subscription...</p>;
        if (status === 'error') return <p className="text-red-600">{error}</p>;
        if (!subscription) return <p>No active subscription.</p>;

        const currentPlan = subscriptionPlans.find(p => p.id === subscription.id) || subscription;

        return (
            <div className="py-6 px-4 lg:max-w-[500px] mx-auto">
                <h3 className="text-sm font-medium text-zinc-600 mb-3">Current subscription</h3>
                <div className="p-4 border border-green-700 bg-[#f7f6ff] rounded-xl flex justify-between items-center">
                    <span className="text-sm font-medium text-zinc-800">{currentPlan.duration}</span>
                    <div className="text-right">
                        <span className="text-sm font-semibold">{currentPlan.price}</span>
                        <span className="text-xs text-zinc-500 block">{currentPlan.pricePerMonth}</span>
                    </div>
                </div>
                <div className="flex justify-center mt-4">
                    <button
                        onClick={() => {
                            setSelectedPlanId(currentPlan.id);
                            setIsModalOpen(true);
                            setNotification(null);
                        }}
                        className="text-sm text-green-700 hover:text-green-800"
                    >
                        Edit subscription
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

                 {isModalOpen && (
                    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 p-4" onClick={() => setIsSubscriptionModalOpen(false)}>
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
                    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 p-4" onClick={() => setIsPaymentModalOpen(false)}>
                        <div className="bg-white rounded-xl w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Select Payment Method</h3>
                                <button onClick={() => setIsPaymentModalOpen(false)}>
                                    <CloseIcon />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <label className="px-6 py-4 rounded-lg flex items-center gap-4 border">
                                    <WalletIcon />
                                    <span className="text-sm font-medium text-zinc-800 flex-grow">
                                        {`Pay from wallet (${parseInt(subscriptionPlans.find((item) => item.id === selectedPlanId).price.replace(/[^\d]/g, ''))})`} 
                                    </span>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="wallet"
                                        checked={selectedPaymentMethod === 'wallet'}
                                        onChange={() => setSelectedPaymentMethod('wallet')}
                                    />
                                </label>

                                {paymentOptions.map((option) => {
                                    const Icon = option.icon;
                                    return (
                                        <label
                                            key={option.id}
                                            className="px-6 py-4 rounded-lg flex items-center gap-4 border"
                                        >
                                            <Icon />
                                            <span className="text-sm font-medium text-zinc-800 flex-grow">{option.text}</span>
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value={option.id}
                                                checked={selectedPaymentMethod === option.id}
                                                onChange={() => setSelectedPaymentMethod(option.id)}
                                            />
                                        </label>
                                    );
                                })}
                            </div>

                            <div className="mt-6 flex flex-col gap-3">
                                {selectedPaymentMethod === 'card' ? (
                                    <AlatPayButton
                                        amount={
                                            parseInt(
                                                subscriptionPlans.find((item) => item.id === selectedPlanId)?.price.replace(/[^\d]/g, '') || '0'
                                            )
                                        }
                                        onTransaction={handlePayment}
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
            </div>
        </div>
    );
}

export default SubscriptionPage;
