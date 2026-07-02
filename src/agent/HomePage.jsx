import Sidebar from '../components/AgentSidebar';
import Topbar from '../components/AgentTopBar';
import AgentBinDisposalChart from '../components/AgentBinDisposalChart';
import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import api from '../api/axiosConfig';
import useAgentStore from '../store/useAgentStore';
import AlatPayButton from '../components/AlatPayButton';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Format a raw number as ₦1,000,000 */
const formatNaira = (amount) =>
    `₦${Number(amount ?? 0).toLocaleString('en-NG')}`;

// ─── Icon Components ─────────────────────────────────────────────────────────

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
        <path d="M18.039 13.5515C17.619 13.9615 17.379 14.5515 17.439 15.1815C17.529 16.2615 18.519 17.0515 19.599 17.0515H21.499V18.2415C21.499 20.3115 19.809 22.0015 17.739 22.0015H6.25902C4.18902 22.0015 2.49902 20.3115 2.49902 18.2415V11.5115C2.49902 9.44147 4.18902 7.75146 6.25902 7.75146H17.739C19.809 7.75146 21.499 9.44147 21.499 11.5115V12.9515H19.479C18.919 12.9515 18.409 13.1715 18.039 13.5515Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2.49902 12.4132V7.84328C2.49902 6.65328 3.22902 5.59323 4.33902 5.17323L12.279 2.17323C13.519 1.70323 14.849 2.62326 14.849 3.95326V7.75325" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22.5588 13.9716V16.0317C22.5588 16.5817 22.1188 17.0316 21.5588 17.0516H19.5988C18.5188 17.0516 17.5288 16.2616 17.4388 15.1816C17.3788 14.5516 17.6188 13.9616 18.0388 13.5516C18.4088 13.1716 18.9188 12.9517 19.4788 12.9517H21.5588C22.1188 12.9717 22.5588 13.4216 22.5588 13.9716Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 12H14" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const CloseIcon = ({ className = 'w-5 h-5' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
);

// ─── Progress Bar ─────────────────────────────────────────────────────────────

const ProgressBar = ({ label, percentage, color }) => (
    <div className="flex justify-between items-center mx-1">
        <div className="w-full bg-zinc-200 lg:h-12 h-8">
            <div
                className={`${color} lg:h-12 h-8 justify-start items-center flex`}
                style={{ width: `${percentage}%` }}
                aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}
            >
                <p className="text-white px-4 text-xs">{label}</p>
            </div>
        </div>
        <span className="text-sm font-semibold text-green-600 px-4">{percentage}%</span>
    </div>
);

// ─── Dashboard Cards (now accept props from API data) ─────────────────────────

const RegisteredUsersCard = ({ residents = 0, corporates = 0 }) => {
    const total = residents + corporates;
    const residentPct = total > 0 ? Math.round((residents / total) * 100) : 0;
    const corporatePct = total > 0 ? Math.round((corporates / total) * 100) : 0;

    return (
        <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="font-medium text-zinc-500">Registered Users</h2>
                    <p className="text-3xl font-bold text-green-800 mt-2">{total.toLocaleString()}</p>
                </div>
                <div className="flex items-center space-x-6 mt-4">
                    <div className="border-r border-zinc-200 pr-4">
                        <p className="text-zinc-400">Residents</p>
                        <p className="text-xl text-zinc-800">{residents.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-zinc-400">Corporates</p>
                        <p className="text-xl text-zinc-800">{corporates.toLocaleString()}</p>
                    </div>
                </div>
            </div>
            <div className="mt-6 space-y-4">
                <ProgressBar label="RESIDENTS" percentage={residentPct} color="bg-green-400" />
                <ProgressBar label="CORPORATES" percentage={corporatePct} color="bg-green-700" />
            </div>
        </div>
    );
};

const SmartBinApplicationsCard = ({ total = 0, residents = 0, corporates = 0 }) => (
    <div className="w-full lg:w-1/3 bg-white p-6 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-8">
            <div className="bg-green-700 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                </svg>
            </div>
        </div>
        <h2 className="font-light text-zinc-700 mt-4">Smart Bin Applications</h2>
        <p className="text-3xl font-bold text-green-700 mt-2">{total.toLocaleString()}</p>
        <div className="mt-4 border-l-2 border-zinc-200 pl-4 space-y-2">
            <div className="flex justify-between items-baseline border-l-2 border-green-700 pl-2 my-2">
                <p className="text-sm text-zinc-500">Residents</p>
                <p className="text-lg text-zinc-800">{residents.toLocaleString()}</p>
            </div>
            <div className="flex justify-between items-baseline border-l-4 border-green-700 pl-2">
                <p className="text-sm text-zinc-500">Corporates</p>
                <p className="text-lg text-zinc-800">{corporates.toLocaleString()}</p>
            </div>
        </div>
    </div>
);

const TotalBillsCard = ({ total = 0, residents = 0, corporates = 0 }) => (
    <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center">
            <h2 className="font-medium text-zinc-900">Total amount of bills</h2>
        </div>
        <p className="text-3xl font-bold text-green-700 mt-3">{formatNaira(total)}</p>
        <div className="flex items-center space-x-6 mt-8">
            <div className="border-r border-zinc-200 pr-4">
                <p className="text-xl text-zinc-500">Residents</p>
                <p className="text-2xl text-zinc-800">{formatNaira(residents)}</p>
            </div>
            <div>
                <p className="text-xl text-zinc-500">Corporates</p>
                <p className="text-2xl text-zinc-800">{formatNaira(corporates)}</p>
            </div>
        </div>
    </div>
);

const TotalPaymentsCard = ({ total = 0, residents = 0, corporates = 0 }) => (
    <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center">
            <h2 className="font-medium text-zinc-900">Total payments made</h2>
        </div>
        <p className="text-3xl font-bold text-green-700 mt-3">{formatNaira(total)}</p>
        <div className="flex items-center space-x-6 mt-8">
            <div className="border-r border-zinc-200 pr-4">
                <p className="text-xl text-zinc-500">Residents</p>
                <p className="text-2xl text-zinc-800">{formatNaira(residents)}</p>
            </div>
            <div>
                <p className="text-xl text-zinc-500">Corporates</p>
                <p className="text-2xl text-zinc-800">{formatNaira(corporates)}</p>
            </div>
        </div>
    </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const Dashboard = () => {

    // ── Modal State ──
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);

    // ── API Data State ──
    const [dashboardData, setDashboardData] = useState(null);
    const [chartDetails, setChartDetails] = useState([]);

    // ── Form / UI State ──
    const [topUpAmount, setTopUpAmount] = useState('');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
    const [selectedSubscriptionPlan, setSelectedSubscriptionPlan] = useState('');
    const [notification, setNotification] = useState(null);

    const paymentOptions = [
        { id: 'card', text: 'Pay with Alat By Wema', icon: AlatIcon },
    ];

    const subscriptionPlans = [
        { id: 1,  duration: '1 month',  price: '₦5,000',  pricePerMonth: '₦5,000 per month' },
        { id: 3,  duration: '3 months', price: '₦12,000', pricePerMonth: '₦4,000 per month' },
        { id: 6,  duration: '6 months', price: '₦20,000', pricePerMonth: '₦3,300 per month' },
        { id: 12, duration: '1 year',   price: '₦35,000', pricePerMonth: '₦2,917 per month' },
    ];

    // ── Derived values from API ──
    const d = dashboardData ?? {};

    const totalRegistered   = (d.totalResidentsRegistered ?? 0) + (d.totalCorporatesRegistered ?? 0);
    const smartBinTotal     = (d.residentSmartBinApplicationCount ?? 0) + (d.corporateSmartBinApplicationCount ?? 0);

    // Bills: sum residentBills and corporateBills arrays (each item may have an `amount` field)
    const sumBills = (arr) => (arr ?? []).reduce((acc, b) => acc + (b.amount ?? 0), 0);
    const residentBillsTotal  = sumBills(d.residentBills);
    const corporateBillsTotal = sumBills(d.corporateBills);
    const totalBills          = residentBillsTotal + corporateBillsTotal;

    // ── Notification auto-dismiss ──
    useEffect(() => {
        if (!notification) return;
        const timer = setTimeout(() => setNotification(null), 5000);
        return () => clearTimeout(timer);
    }, [notification]);

    // ── Fetch dashboard data ──
    const fetchDashboard = async () => {
        try {
            const { data } = await api.get('/agents/dashboard');
            if (data.success) {
                const payload = data.data;
                setDashboardData(payload);
                // Pass monthly breakdown to chart
                setChartDetails(payload.binDisposalAnalytics?.monthlyBreakdown ?? []);
            }
        } catch (error) {
            console.error('Dashboard fetch error:', error);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    // ── Payment handlers ──
    const handlePayment = async () => {
        if (!selectedPaymentMethod) {
            setNotification({ type: 'error', message: 'Select a payment method' });
            return;
        }
        const selectedPlan = subscriptionPlans.find((item) => item.id === selectedSubscriptionPlan);
        const dataToSend = {
            residentID: useAuthStore.getState().token,
            amount: parseInt(selectedPlan.price.replace(/[^\d]/g, '')),
            mode: selectedPaymentMethod,
            subscriptionChoice: selectedPlan.id,
        };
        try {
            const { data } = await api.post('/Wallet/new-subscription', dataToSend);
            if (data.succeeded) {
                setNotification({ type: 'success', message: data.message || 'Submitted successfully!' });
                closeModal('payment');
            } else {
                setNotification({ type: 'error', message: data.message || 'Error editing subscription!' });
                handleSubscriptionBack();
            }
        } catch (error) {
            console.error('Payment error:', error);
            setNotification({ type: 'error', message: 'Error editing subscription!' });
            handleSubscriptionBack();
        }
    };

    const handleSubscription = () => {
        if (!selectedSubscriptionPlan) {
            setNotification({ type: 'error', message: 'Select a subscription plan' });
            return;
        }
        setIsPaymentModalOpen(true);
        setIsSubscriptionModalOpen(false);
    };

    const handleSubscriptionBack = () => {
        setIsPaymentModalOpen(false);
        setIsSubscriptionModalOpen(true);
    };

    // ── Modal helpers ──
    const openModal = (modalName) => {
        closeAllModals();
        if (modalName === 'success') setShowSuccessModal(true);
        if (modalName === 'topup')   setShowTopUpModal(true);
        if (modalName === 'error')   setShowErrorModal(true);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = (modalName) => {
        if (modalName === 'success') { setShowSuccessModal(false); setTopUpAmount(''); fetchDashboard(); }
        if (modalName === 'topup')   setShowTopUpModal(false);
        if (modalName === 'error')   setShowErrorModal(false);
        if (modalName === 'payment') setIsPaymentModalOpen(false);
        if (modalName === 'subscription') setIsSubscriptionModalOpen(false);
        document.body.style.overflow = '';
    };

    const closeAllModals = () => {
        setShowSuccessModal(false);
        setShowTopUpModal(false);
        setShowErrorModal(false);
        document.body.style.overflow = '';
    };

    const closeSubscription = () => {
        closeModal('payment');
        closeModal('subscription');
        setSelectedSubscriptionPlan('');
    };

    const handleTopUpClose = () => {
        closeModal('topup');
        setTopUpAmount('');
    };

    const handleTopUpSubmit = async () => {
        if (!topUpAmount || topUpAmount < 100 || topUpAmount > 1000000) {
            setNotification({ type: 'error', message: 'Enter a valid amount' });
            return;
        }
        try {
            const { data } = await api.post('/Wallet/wallet-topup', {
                userId: useAuthStore.getState().token,
                walletAcctNo: '',
                amount: topUpAmount,
                channel: 'Alat',
                narration: '',
            });
            if (data.succeeded) {
                setNotification({ type: 'success', message: data.message || 'TopUp successful!' });
                closeModal('topup');
                openModal('success');
            } else {
                setNotification({ type: 'error', message: data.message || 'Error during TopUp!' });
            }
        } catch (error) {
            console.error('Top-up error:', error);
            setNotification({ type: 'error', message: 'Error!' });
        }
    };

    const downloadReceipt = () => {
        setNotification({ type: 'error', message: 'Coming soon...' });
        closeModal('success');
    };

    const backToDashboard = () => closeModal('error');

    // ── Greeting name ──
    const firstName = (d.fullName ?? 'there').split(' ')[0];

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div>
            <div className="flex sans max-w-screen h-screen">
                <Sidebar addkey="1" />
                <div className="bg-zinc-100 min-h-screen flex flex-col flex-1 overflow-y-auto">
                    <Topbar />

                    <main className="lg:p-12 p-4 space-y-6">
                        <header className="mb-8">
                            <h1 className="text-3xl font-bold text-slate-800">Hello, {firstName}</h1>
                        </header>

                        <div className="flex flex-col gap-6">
                            {/* Top Row */}
                            <div className="flex flex-col lg:flex-row gap-6">
                                <RegisteredUsersCard
                                    residents={d.totalResidentsRegistered ?? 0}
                                    corporates={d.totalCorporatesRegistered ?? 0}
                                />
                                <SmartBinApplicationsCard
                                    total={smartBinTotal}
                                    residents={d.residentSmartBinApplicationCount ?? 0}
                                    corporates={d.corporateSmartBinApplicationCount ?? 0}
                                />
                            </div>

                            {/* Bottom Row */}
                            <div className="flex flex-col lg:flex-row gap-6">
                                <TotalBillsCard
                                    total={totalBills}
                                    residents={residentBillsTotal}
                                    corporates={corporateBillsTotal}
                                />
                                <TotalPaymentsCard
                                    total={d.totalPayments ?? 0}
                                    residents={d.residentPayments ?? 0}
                                    corporates={d.corporatePayments ?? 0}
                                />

                                {/* Available Balance Card */}
                                <div className="flex-1 bg-card bg-cover rounded-2xl min-h-[230px] w-full">
                                    <div className="flex p-6 rounded-2xl min-h-[230px] w-full bg-[linear-gradient(288.72deg,rgba(0,120,54,0.75)_0%,#007836_98.68%)]">
                                        <div className="w-full">
                                            <p className="text-white text-xs font-light">Available Balance</p>
                                            <div className="flex items-center w-full justify-between mt-2">
                                                <h2 className="text-white text-3xl font-sans mt-1 mr-20">
                                                    {formatNaira(d.walletBalance)}
                                                </h2>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="text-white opacity-75 mr-8" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                            </div>
                                            <div className="mt-14 mb-2">
                                                <button
                                                    className="bg-white text-green-700 py-4 px-4 rounded-xl flex items-center"
                                                    onClick={() => openModal('topup')}
                                                >
                                                    Top up wallet
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chart — passes binDisposalAnalytics monthly breakdown */}
                        <section className="bg-white p-6 rounded-3xl flex flex-col items-center justify-center">
                            <AgentBinDisposalChart data={chartDetails} />
                        </section>
                    </main>
                </div>
            </div>

            {/* ── Subscription Modal ── */}
            {isSubscriptionModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content px-8 py-12">
                        <div className="flex justify-between items-center pb-6">
                            <div>
                                <h3 className="text-2xl font-semibold text-zinc-800">Subscribe now</h3>
                                <p className="text-zinc-500 mt-1">Subscribe for scheduled waste collection</p>
                            </div>
                            <button onClick={closeSubscription} aria-label="Close" className="text-zinc-700 hover:text-red-600 self-start">
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {subscriptionPlans.map((plan) => (
                                <label
                                    key={plan.id}
                                    className={`bg-[#f7f6ff] p-4 rounded-xl flex items-center gap-4 ${selectedSubscriptionPlan === plan.id ? 'border-2 border-green-700' : ''}`}
                                >
                                    <input
                                        type="radio"
                                        name="subscriptionPlan"
                                        value={plan.id}
                                        checked={selectedSubscriptionPlan === plan.id}
                                        onChange={() => setSelectedSubscriptionPlan(plan.id)}
                                        className="custom-radio"
                                    />
                                    <div className="flex-grow flex justify-between items-center">
                                        <span className="font-light text-zinc-900">{plan.duration}</span>
                                        <div className="text-right">
                                            <span className="text-xl text-zinc-900">{plan.price}</span>
                                            <p className="text-xs text-zinc-500 mt-0.5">{plan.pricePerMonth}</p>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                        <div className="my-6 flex justify-end">
                            <button onClick={handleSubscription} className="btn btn-primary w-full">Make Payment</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Payment Modal ── */}
            {isPaymentModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content lg:p-8">
                        <div className="flex justify-between items-center py-6 mx-8 border-b border-zinc-200">
                            <h3 className="text-lg font-semibold text-zinc-800">Select Payment Method</h3>
                            <button onClick={closeSubscription} aria-label="Close" className="text-zinc-700 hover:text-red-600">
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="py-6 space-y-4">
                            <label className="px-6 py-4 rounded-lg flex items-center gap-4">
                                <WalletIcon />
                                <span className="text-sm font-medium text-zinc-800 flex-grow">
                                    Pay from wallet ({formatNaira(d.walletBalance)})
                                </span>
                                <input type="radio" name="paymentMethod" value="wallet" checked={selectedPaymentMethod === 'wallet'} onChange={() => setSelectedPaymentMethod('wallet')} className="custom-radio" />
                            </label>
                            {paymentOptions.map((option) => {
                                const Icon = option.icon;
                                return (
                                    <label key={option.id} className="px-6 py-4 rounded-lg flex items-center gap-4">
                                        <Icon />
                                        <span className="text-sm font-medium text-zinc-800 flex-grow">{option.text}</span>
                                        <input type="radio" name="paymentMethod" value={option.id} checked={selectedPaymentMethod === option.id} onChange={() => setSelectedPaymentMethod(option.id)} className="custom-radio" />
                                    </label>
                                );
                            })}
                        </div>
                        <div className="px-6 py-4 flex flex-col items-center gap-3">
                            {selectedPaymentMethod === 'card' ? (
                                <AlatPayButton
                                    amount={parseInt(subscriptionPlans.find((item) => item.id === selectedSubscriptionPlan)?.price.replace(/[^\d]/g, '') ?? 0)}
                                    onTransaction={handlePayment}
                                    buttonText="Pay Now with ALATPay"
                                    buttonClassName="btn btn-primary w-full"
                                />
                            ) : (
                                <button onClick={handlePayment} className="btn btn-primary w-full">Make Payment</button>
                            )}
                            <button onClick={handleSubscriptionBack} className="w-full text-center font-medium text-green-700 hover:text-green-900 py-2">Go back</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Success Modal ── */}
            {showSuccessModal && (
                <div onClick={() => closeModal('success')} className="fixed inset-0 bg-black/10 bg-opacity-60 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl relative p-6 py-12 md:p-8">
                        <button onClick={() => closeModal('success')} className="absolute top-8 right-8 text-zinc-700 hover:text-red-600">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                        <div className="flex flex-col items-center text-center mt-6">
                            <div className="bg-green-100 p-3 rounded-full mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="41" height="40" viewBox="0 0 41 40" fill="none">
                                    <path d="M20.5002 3.3335C11.3168 3.3335 3.8335 10.8168 3.8335 20.0002C3.8335 29.1835 11.3168 36.6668 20.5002 36.6668C29.6835 36.6668 37.1668 29.1835 37.1668 20.0002C37.1668 10.8168 29.6835 3.3335 20.5002 3.3335ZM28.4668 16.1668L19.0168 25.6168C18.7835 25.8502 18.4668 25.9835 18.1335 25.9835C17.8002 25.9835 17.4835 25.8502 17.2502 25.6168L12.5335 20.9002C12.0502 20.4168 12.0502 19.6168 12.5335 19.1335C13.0168 18.6502 13.8168 18.6502 14.3002 19.1335L18.1335 22.9668L26.7002 14.4002C27.1835 13.9168 27.9835 13.9168 28.4668 14.4002C28.9502 14.8835 28.9502 15.6668 28.4668 16.1668Z" fill="#23A26D" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-semibold text-zinc-800 mb-2">Payment Successful!</h2>
                            <p className="text-zinc-500 mb-6">Your wallet has been successfully funded</p>
                            <div className="w-full space-y-3 bg-[#F7F9FA] rounded-xl p-4 mb-8 text-left">
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-zinc-500">Amount</span>
                                    <span className="font-medium text-zinc-800">{formatNaira(topUpAmount)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-zinc-500">Payment Status</span>
                                    <span className="bg-green-100 text-green-700 px-2 py-1.5 rounded-full text-xs font-medium">Success</span>
                                </div>
                                <div className="my-12">
                                    <div className="my-6 w-full h-[1px] bg-zinc-300"></div>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-zinc-500">Ref Number</span>
                                    <span className="font-medium text-zinc-800">000085752257</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-zinc-500">Payment Method</span>
                                    <span className="font-medium text-zinc-800 flex items-center gap-1">
                                        <img src="/images/alat-logo.png" alt="Alat Logo" className="w-10 h-10 mx-2 inline-block rounded-sm" />
                                        Alat By Wema
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-zinc-500">Payment Time</span>
                                    <span className="font-medium text-zinc-800">
                                        {`${new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}. ${new Date().toLocaleTimeString('en-US', { hour12: false })}`}
                                    </span>
                                </div>
                            </div>
                            <button onClick={downloadReceipt} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 mb-8 border border-green-700 font-medium rounded-md text-green-700 bg-white hover:bg-zinc-50">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                </svg>
                                Download Receipt
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Top Up Modal ── */}
            {showTopUpModal && (
                <div className="fixed inset-0 bg-black/10 bg-opacity-60 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl relative p-6 md:p-10">
                        <button onClick={handleTopUpClose} className="absolute top-10 right-8 text-zinc-700 hover:text-red-600">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                        <div className="space-y-5">
                            <div className="pb-8">
                                <h2 className="text-2xl font-semibold text-zinc-800">Top up wallet</h2>
                                <p className="text-zinc-500">Add funds to your wallet</p>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="topup-amount" className="block font-medium text-zinc-700 mb-1">Amount to Top up</label>
                                    <div className="relative mt-1 rounded-md shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="text-zinc-500">₦</span>
                                        </div>
                                        <input
                                            type="number"
                                            id="topup-amount"
                                            value={topUpAmount}
                                            onChange={(e) => setTopUpAmount(e.target.value)}
                                            required
                                            min="100"
                                            max="1000000"
                                            step="1"
                                            placeholder="20000"
                                            className="w-full pl-7 pr-4 py-2 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-green-700 mt-1">
                                        <span>Min: ₦100</span>
                                        <span>Max: ₦1,000,000</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block font-medium text-zinc-700 mb-1">Choose Payment method</label>
                                    <div className="mt-1 mb-4 flex items-center gap-2 p-3 border border-zinc-300 rounded-xl bg-zinc-50">
                                        <img src="/images/alat-logo.png" alt="Alat Logo" className="w-8 h-8 rounded-sm" />
                                        <span className="font-medium text-zinc-800">Alat By Wema</span>
                                    </div>
                                </div>
                                <AlatPayButton
                                    amount={parseInt(topUpAmount) || 0}
                                    onTransaction={handleTopUpSubmit}
                                    buttonText="Confirm Top Up"
                                    buttonClassName="w-full inline-flex justify-center items-center px-4 py-4 border border-transparent font-medium rounded-2xl shadow-sm text-white bg-green-700 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Error Modal ── */}
            {showErrorModal && (
                <div className="fixed inset-0 bg-black/10 bg-opacity-60 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl relative p-6 md:p-8">
                        <button onClick={() => closeModal('error')} className="absolute top-8 right-8 text-zinc-700 hover:text-red-600">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                        <div className="flex flex-col items-center text-center pt-12 pb-6">
                            <div className="bg-red-50 p-3 rounded-full mb-4">
                                <svg className="h-12 w-12" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M21.6709 18.585H11.6709" stroke="#D70606" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M3.3291 18.5853V10.8854C3.3291 7.48535 6.07911 4.73535 9.47911 4.73535H18.8458C22.2458 4.73535 24.9958 6.85201 24.9958 10.252" stroke="#D70606" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M29.1291 20.3314C28.2957 21.1314 27.8958 22.3647 28.2291 23.6313C28.6458 25.1813 30.1791 26.1647 31.7791 26.1647H33.3291V28.5814C33.3291 32.2647 30.3458 35.248 26.6624 35.248H9.99577C6.31243 35.248 3.3291 32.2647 3.3291 28.5814V16.9147C3.3291 13.2314 6.31243 10.248 9.99577 10.248H26.6624C30.3291 10.248 33.3291 13.248 33.3291 16.9147V19.3313H31.5291C30.5957 19.3313 29.7457 19.698 29.1291 20.3314Z" stroke="#D70606" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M36.6647 21.0321V24.4654C36.6647 25.3987 35.898 26.1654 34.948 26.1654H31.7314C29.9314 26.1654 28.2814 24.8488 28.1314 23.0488C28.0314 21.9988 28.4314 21.0154 29.1314 20.3321C29.748 19.6988 30.598 19.332 31.5314 19.332H34.948C35.898 19.332 36.6647 20.0987 36.6647 21.0321Z" stroke="#D70606" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-semibold text-zinc-800 mb-2">Insufficient balance</h2>
                            <p className="text-zinc-900 font-light mb-8 w-3/4">Your wallet could not be funded due to insufficient balance. Please try again</p>
                            <button onClick={backToDashboard} className="w-full inline-flex justify-center items-center p-4 border border-transparent font-medium rounded-2xl shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                Back To Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Toast Notification ── */}
            {notification && (
                <div
                    className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg max-w-sm z-50 ${notification.type === 'success' ? 'bg-green-100 border border-green-400 text-green-800' : 'bg-red-100 border border-red-400 text-red-800'}`}
                    role={notification.type === 'error' ? 'alert' : 'status'}
                >
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{notification.message}</p>
                        <button
                            onClick={() => setNotification(null)}
                            className={`ml-4 text-xl font-semibold leading-none ${notification.type === 'success' ? 'text-green-800 hover:text-green-900' : 'text-red-800 hover:text-red-900'} focus:outline-none`}
                            aria-label="Close notification"
                        >
                            &times;
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;