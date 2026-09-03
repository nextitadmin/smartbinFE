
import React, { useState, useEffect, useMemo } from 'react';
import Topbar from '../components/CorporateTopBar';
import Sidebar from '../components/Sidebar';
import api from '../api/axiosConfig';
import Pay4ItButton from '../components/Pay4ItButton';
import useAuthStore from '../store/authStore';
import useCorporateStore from '../store/useCorporateStore';
import ScheduleWasteCollectionModal from '../components/CorporateSchedulePickupForm';
import { exportToCSV } from '../utils/exportHelper';

const Wastes = () => {
    // --- State (Keep only states used in Wastes itself) ---
    const [applications, setApplications] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortColumn, setSortColumn] = useState('date');
    const [sortDirection, setSortDirection] = useState('dsc');
    const [currentPage, setCurrentPage] = useState(1);

    // --- Filter States ---
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [statusFilter, setStatusFilter] = useState('All');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');

    const itemsPerPage = 10;
    const [notification, setNotification] = useState(null);
    const [pickUpAmount, setPickUpAmount] = useState(5000);
    const [debitType, setDebitType] = useState(''); // 'wallet' or 'smartbin'
    const Corporate = useCorporateStore((state) => state.corporateInfo);

    // --- Modal states ---
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isPickupModalOpen, setIsPickupModalOpen] = useState(false); // Still needed to control visibility from parent

    // --- Payment modal data ---
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
    // Assuming AlatIcon is defined or imported
    const paymentOptions = [
        { id: 'card', text: 'Pay by card/bank/transfer', icon: AlatIcon }, // Ensure AlatIcon is available
    ];

    // --- Pickup modal data (Initial state for the modal) ---
    const initialPickupData = {
        date: '',
        time: '',
        phone: '',
        address: '',
    };
    const [pickupRequestData, setPickupRequestData] = useState(initialPickupData); // State to hold data passed back from modal
    const [isPayingExisting, setIsPayingExisting] = useState(false);
    const [selectedAppForPayment, setSelectedAppForPayment] = useState(null);


    // --- Helper Functions ---
    const clearNotification = () => {
        setNotification(null);
    };

    const verifyAlatPayTransaction = async (reference) => {
        console.log(" verifyAlatPayTransaction CALLED with reference:", reference);
        console.log(" Reference type:", typeof reference);
        console.log(" Reference length:", reference?.length);

        try {
            console.log(" Making API call to verify AlatPay transaction");
            console.log(" API endpoint:", `/api/v1/wallets/mock-verify?reference=${reference}`);

            const { data } = await api.get(
                `/api/v1/wallets/mock-verify?reference=${reference}`
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

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const parts = dateString.split('-');
        if (parts.length === 3) {
            return `${parts[0]}-${parts[1]}-${parts[2]}`;
        }
        return dateString;
    };



    // --- Computed Properties ---
    const uniqueStatuses = useMemo(() => {
        const statuses = applications.map(app => app.status).filter(Boolean);
        return [...new Set(statuses)];
    }, [applications]);

    const filteredApplications = useMemo(() => {
        let result = applications;

        // 1. Search Query
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(app => {
                return (
                    (app.wasteId || '').toLowerCase().includes(lowerQuery) ||
                    (app.address || '').toLowerCase().includes(lowerQuery) ||
                    (app.representative || '').toLowerCase().includes(lowerQuery) ||
                    (app.status || '').toLowerCase().includes(lowerQuery) ||
                    formatDate(app.date).includes(lowerQuery)
                );
            });
        }

        // 2. Status Filter
        if (statusFilter !== 'All') {
            result = result.filter(app => app.status === statusFilter);
        }

        // 3. Date Range Filters
        if (startDateFilter) {
            result = result.filter(app => app.date >= startDateFilter);
        }
        if (endDateFilter) {
            result = result.filter(app => app.date <= endDateFilter);
        }

        return result;
    }, [applications, searchQuery, statusFilter, startDateFilter, endDateFilter]);

    const sortedApplications = useMemo(() => {
        return [...filteredApplications].sort((a, b) => {
            let valA = a[sortColumn];
            let valB = b[sortColumn];
            if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }
            if (sortColumn === 'date') {
                valA = valA ? new Date(valA).getTime() : 0;
                valB = valB ? new Date(valB).getTime() : 0;
            }
            let comparison = 0;
            if (valA > valB) {
                comparison = 1;
            } else if (valA < valB) {
                comparison = -1;
            }
            return sortDirection === 'dsc' ? (comparison * -1) : comparison;
        });
    }, [filteredApplications, sortColumn, sortDirection]);

    const paginatedApplications = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sortedApplications.slice(startIndex, endIndex);
    }, [sortedApplications, currentPage]);

    const totalItems = sortedApplications.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

    // Reset page on filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, startDateFilter, endDateFilter]);

    // --- Methods ---
    const sortBy = (columnKey) => {
        if (sortColumn === columnKey) {
            setSortDirection(sortDirection === 'asc' ? 'dsc' : 'asc');
        } else {
            setSortColumn(columnKey);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    const sortIcon = (columnKey) => {
        if (sortColumn !== columnKey) return '↕';
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    const changePage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const getStatusClass = (status) => {
        if (!status) return 'bg-zinc-100 text-zinc-800 border-zinc-300';
        switch (status.toLowerCase()) {
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'delivered':
                return 'bg-green-100 text-green-800 border-green-300';
            default:
                return 'bg-zinc-100 text-zinc-800 border-zinc-300';
        }
    };

    // --- Data Fetching ---
    const fetchData = async () => {
        try {
            const { data } = await api.get(`/corporate/waste-management/pickups?PageNo=1&PageSize=10000`);
            if (data.success) {
                const rawData = data.data || [];
                const list = Array.isArray(rawData) ? rawData : [];
                const newData = list.map((item) => ({
                    wasteId: item.wasteId || item._id,
                    branch: item.branch,
                    date: item.createdAt?.slice(0, 10),
                    address: item.address,
                    status: item.status,
                    representative: item.pickupBy || item.phoneNumber,
                    paymentStatus: item.payment?.status || 'unpaid'
                }));

                setApplications(newData);
            }
        } catch (error) {
            console.log(error);
        }
    };

    // const fetchPickUpAmount = async () => {
    //     try {
    //         const response = await api.get("/Wallet/fetch-amount?paymentType=waste");
    //         console.log("Response from fetch-amount:", response);
    //         const data = response.data.data;
    //         if (response.data.succeeded) {
    //             setPickUpAmount(data.amountToDebit);
    //             setDebitType(data.debitType);
    //             console.log(debitType, " debit type");
    //             console.log("Smart bin amount fetched:", data.amountToDebit);
    //         } else {
    //             console.error("Failed to fetch smart bin amount:", response.message);
    //         }
    //     } catch (error) {
    //         console.error("Error fetching smart bin amount:", error);
    //     }
    // };

    // --- Modal Handlers ---
    const openModal = (modalName) => {
        if (modalName === 'payment') setIsPaymentModalOpen(true);
        else if (modalName === 'pickup') {
            setIsPickupModalOpen(true);
            // Reset pickup data when opening modal via parent
            setPickupRequestData(initialPickupData);
        }
    };

    const closeModal = (modalName) => {
        if (modalName === 'payment') {
            setIsPaymentModalOpen(false);
            setIsPayingExisting(false);
            setSelectedAppForPayment(null);
        }
        else if (modalName === 'pickup') setIsPickupModalOpen(false);
    };

    const handleMakePayment = (app) => {
        setIsPayingExisting(true);
        setSelectedAppForPayment(app);
        openModal('payment');
    };

    const handleScheduleSubmit = (formData) => {
        setIsPayingExisting(false);
        setSelectedAppForPayment(null);
        setPickupRequestData({
            date: formData.date || formData.pickupDate || '',
            time: formData.time || formData.pickupTime || '',
            phone: formData.phone || formData.phoneNumber || '',
            address: formData.address || '',
            branch: formData.branch || null,
        });
        closeModal('pickup');
        openModal('payment');
    };


    // --- Action Handlers ---
    const handlePayment = async (response) => {
        console.log(" handlePayment called with response:", response);
        let ref, channel;
        let amount = pickUpAmount; // Use the fetched amount
        if (selectedPaymentMethod === 'wallet') {
            ref = response.reference;
            channel = "wallet";
            console.log(" Processing wallet payment with ref:", ref);
        }
        else if (selectedPaymentMethod === 'card') {
            console.log(" AlatPay payment handled by Pay4ItButton");
            return;
        }

        if (isPayingExisting) {
            setNotification({ type: 'success', message: 'Payment successful!' });
            fetchData();
            closeModal('payment');
            return;
        }

        console.log(" Final reference and channel:", { ref, channel, amount });

        if (ref !== '' && amount !== '' && channel !== '') {
            await SubmitPickupRequest({ ref, amount, channel });
        } else {
            console.error(" Payment response missing required fields");
            setNotification({ type: 'error', message: "Error submitting" });
        }
    };


    // handleBack removed as it's now handled by the button directly

    // Function to handle AlatPay payment for waste collection (similar to Smart Bin pattern)
    const submitWasteAlatPay = async (amount) => {
        const userId = useAuthStore.getState().user?.id;

        if (!amount || amount < 100) {
            setNotification({ type: "error", message: "Enter a valid amount" });
            return;
        }

        try {
            console.log(" Submitting Waste AlatPay payment with amount:", amount);

            // Call backend to initiate AlatPay payment for waste collection
            const { data } = await api.post("/corporate/wallets/charge", {

                amount: amount,
            });

            console.log(" Waste AlatPay Response:", data);

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
                        console.log(" AlatPay verification successful, proceeding with waste collection");
                        // Proceed with waste collection application
                        await SubmitPickupRequest({ ref: reference, amount, channel: "alatPay" });
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
            console.error(" Error in submitWasteAlatPay:", error);
            setNotification({ type: "error", message: "AlatPay payment failed!" });
        }
    };

    const handlePaymentWithWallet = async () => {
        try {
            const response = await api.post("/corporate/wallets/charge", {
                userId: useAuthStore.getState().token,
                drAccountNo: Corporate.accountNo,
                amount: pickUpAmount,
                narration: "Waste Collection Payment",
                paymentPurpose: "Waste Collection Application"
            });
            const data = response.data;
            console.log("Response from debit-wallet:", data);
            if (data.succeeded || data.success) {
                console.log("Wallet payment successful:", data.success, "and message:", data.message);

                // Extract reference from response message or use a default
                let successRef = data.reference || data.data?.reference;

                // If no reference in response, try to extract from message
                if (!successRef && data.message) {
                    let successMessage = data.message.split('|');
                    if (successMessage.length > 1) {
                        successRef = successMessage[1];
                    }
                }

                // If still no reference, create a timestamp-based one
                if (!successRef) {
                    successRef = `WALLET_${Date.now()}`;
                }

                // Call handlePayment with wallet response
                await handlePayment({
                    reference: successRef,
                    channel: "wallet",
                    data: { reference: successRef }
                });

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
    };

    const SubmitPickupRequest = async ({ ref, amount, channel }) => {
        if (pickupRequestData.date && pickupRequestData.time && pickupRequestData.phone && pickupRequestData.address) {
            try {
                const { data } = await api.post("/corporate/waste-management/pickups", {
                    address: pickupRequestData.address,
                    pickupDate: pickupRequestData.date,
                    phoneNumber: pickupRequestData.phone,
                    branch: pickupRequestData.branch?.name || pickupRequestData.branch || "Main",
                    pickupTime: pickupRequestData.time,
                    transactionReference: ref,
                    paymentChannel: channel,
                    amountPaid: amount,
                });
                if (data.success || data.succeeded) {
                    setNotification({ type: 'success', message: data.message?.toUpperCase() || 'Submitted successfully!' });
                    setPickupRequestData(initialPickupData);
                    closeModal('payment');
                    fetchData(); // Refresh the list
                }
                else {
                    setNotification({ type: 'error', message: data.message || "Error submitting" });
                }
            } catch (error) {
                setNotification({ type: 'error', message: "Error submitting" });
                console.log("API Error:", error);
            }
        } else {
            setNotification({ type: 'error', message: "Fill all fields" });
        }
    };




    const clearFilters = () => {
        setStatusFilter('All');
        setStartDateFilter('');
        setEndDateFilter('');
        setSearchQuery('');
    };

    const filterData = () => {
        setShowFilterPanel(prev => !prev);
    };

    const exportData = () => {
        if (sortedApplications.length === 0) {
            setNotification({ type: 'error', message: "No records to export." });
            return;
        }

        try {
            const exportRows = sortedApplications.map((app, index) => ({
                "S/N": index + 1,
                "Waste ID": app.wasteId,
                "Branch": app.branch || 'N/A',
                "Request Date": app.date,
                "Address": app.address,
                "Representative": app.representative,
                "Status": app.status,
                "Payment Status": app.paymentStatus
            }));
            exportToCSV(exportRows, "corporate_waste_pickups");
            setNotification({ type: 'success', message: "Waste pickups exported successfully!" });
        } catch (error) {
            console.error("Export error:", error);
            setNotification({ type: 'error', message: "An error occurred during export." });
        }
    };

    // --- Effects ---
    useEffect(() => {
        fetchData();
    }, []);

    // useEffect(() => {
    //     fetchPickUpAmount();
    // }, []);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                clearNotification();
            }, 5000); // Hide after 5 seconds
            return () => clearTimeout(timer); // Cleanup timer on component unmount or notification change
        }
    }, [notification]);

    // --- Render Function ---
    return (
        <div>
            <div className="flex sans h-screen max-w-screen">
                <Sidebar addkey="1" />
                <div className=" bg-zinc-100 min-h-screen   flex flex-col flex-1 overflow-y-auto  ">
                    <Topbar />
                    <div className="bg-zinc-100 font-sans">
                        <main className="p-4 md:p-10">
                            <div className="p-5 md:p-8 rounded-lg w-full mx-auto">
                                {/* Header */}
                                <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-xl md:text-2xl font-semibold text-zinc-800">Waste Collections</h1>
                                        <span className="bg-green-700 text-green-50 text-xs font-semibold px-2.5 py-2 rounded-full">
                                            {applications.length}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => openModal('pickup')}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-green-700 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                        >
                                            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                            </svg>
                                            Schedule Collection
                                        </button>
                                    </div>
                                </div>
                                {/* Search and Actions */}
                                <div className="flex lg:flex-row flex-col justify-between gap-4 mb-6">
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 text-green-700 flex items-center pl-3">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                            </svg>
                                        </span>
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search waste collections..."
                                            className="w-full lg:w-[24rem] pl-10 pr-4 py-2 border border-zinc-300 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <button
                                            onClick={filterData}
                                            type="button"
                                            className={`px-4 lg:mx-4 py-2 border border-zinc-300 text-sm font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                                                showFilterPanel ? 'bg-green-50 border-green-300 text-green-700 font-semibold' : 'text-zinc-700 bg-white hover:bg-zinc-50'
                                            }`}
                                        >
                                            Filter
                                        </button>
                                        <button
                                            onClick={exportData}
                                            type="button"
                                            className="px-4 py-2 mx-4 border border-zinc-300 lg:mx-0 text-sm font-medium rounded-xl text-zinc-700 bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                        >
                                            Export
                                        </button>
                                    </div>
                                </div>

                                {/* Filter Panel */}
                                {showFilterPanel && (
                                    <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 transition-all duration-300 ease-in-out">
                                        {/* Status Filter */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</label>
                                            <select
                                                value={statusFilter}
                                                onChange={(e) => setStatusFilter(e.target.value)}
                                                className="w-full px-3 py-2 border border-zinc-300 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
                                            >
                                                <option value="All">All Statuses</option>
                                                {uniqueStatuses.map(status => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Start Date Filter */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Date From</label>
                                            <input
                                                type="date"
                                                value={startDateFilter}
                                                onChange={(e) => setStartDateFilter(e.target.value)}
                                                className="w-full px-3 py-2 border border-zinc-300 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
                                            />
                                        </div>

                                        {/* End Date Filter */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Date To</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="date"
                                                    value={endDateFilter}
                                                    onChange={(e) => setEndDateFilter(e.target.value)}
                                                    className="w-full px-3 py-2 border border-zinc-300 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-700 flex-1"
                                                />
                                                {(statusFilter !== 'All' || startDateFilter || endDateFilter) && (
                                                    <button
                                                        onClick={clearFilters}
                                                        type="button"
                                                        className="px-2 text-zinc-500 hover:text-red-500 hover:bg-zinc-100 rounded-lg text-xs font-medium border border-zinc-200"
                                                        title="Clear Filters"
                                                    >
                                                        Reset
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Table */}
                                <div className="table-container border border-zinc-200 rounded-2xl">
                                    <table className="w-full min-w-[768px] text-sm text-left text-zinc-600">
                                        <thead className="font-light text-zinc-700 uppercase bg-white">
                                            <tr>
                                                <th scope="col" className="px-4 py-3 w-24" role="button" onClick={() => sortBy('sn')}>
                                                    <div className="flex items-center justify-between">
                                                        S/N <span className={`sort-icon ${sortColumn === 'sn' ? 'active' : ''}`}>
                                                            {sortIcon('sn')}
                                                        </span>
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('wasteId')}>
                                                    <div className="flex items-center justify-between">
                                                        Waste ID <span className={`sort-icon ${sortColumn === 'wasteId' ? 'active' : ''}`}>
                                                            {sortIcon('wasteId')}
                                                        </span>
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('date')}>
                                                    <div className="flex items-center justify-between">
                                                        Date <span className={`sort-icon ${sortColumn === 'date' ? 'active' : ''}`}>
                                                            {sortIcon('date')}
                                                        </span>
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('branch')}>
                                                    <div className="flex items-center justify-between">
                                                        Branch <span className={`sort-icon ${sortColumn === 'branch' ? 'active' : ''}`}>
                                                            {sortIcon('branch')}
                                                        </span>
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('address')}>
                                                    <div className="flex items-center justify-between">
                                                        Address <span className={`sort-icon ${sortColumn === 'address' ? 'active' : ''}`}>
                                                            {sortIcon('address')}
                                                        </span>
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('representative')}>
                                                    <div className="flex items-center justify-between">
                                                        Representative <span className={`sort-icon ${sortColumn === 'representative' ? 'active' : ''}`}>
                                                            {sortIcon('representative')}
                                                        </span>
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('status')}>
                                                    <div className="flex items-center justify-between">
                                                        Status <span className={`sort-icon ${sortColumn === 'status' ? 'active' : ''}`}>
                                                            {sortIcon('status')}
                                                        </span>
                                                    </div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedApplications.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7" className="text-center py-10 text-zinc-500">No waste collections found.</td>
                                                </tr>
                                            ) : (
                                                paginatedApplications.map((app, index) => {
                                                    const sn = (currentPage - 1) * itemsPerPage + index + 1;
                                                    return (
                                                        <tr key={app.wasteId} className="bg-white border-b border-zinc-200 hover:bg-zinc-50 lg:h-20">
                                                            <td className="px-4 py-3 font-medium text-zinc-900">{sn}</td>
                                                            <td className="px-4 py-3 font-medium text-zinc-900 whitespace-nowrap">{app.wasteId}</td>
                                                            <td className="px-4 py-3 whitespace-nowrap">{formatDate(app.date)}</td>
                                                            <td className="px-4 py-3 whitespace-nowrap">{app.branch || 'N/A'}</td>
                                                            <td className="px-4 py-3">{app.address}</td>
                                                            <td className="px-4 py-3 whitespace-nowrap">{app.representative}</td>
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                <span className={`px-3 py-1 border rounded-full text-xs font-medium inline-block ${getStatusClass(app.status)}`}>
                                                                    {app.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Pagination */}
                                <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
                                    <span className="text-sm text-zinc-700">
                                        Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
                                        <span className="mx-2">|</span>
                                        Total <span className="font-semibold">{totalItems}</span> items
                                    </span>
                                    <div className="inline-flex rounded-md shadow-sm -space-x-px" role="group">
                                        <button
                                            onClick={() => changePage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            type="button"
                                            className="px-3 mr-4 py-2 text-sm font-medium text-zinc-500 bg-white border border-zinc-300 hover:bg-zinc-100 focus:z-10 focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => changePage(currentPage + 1)}
                                            disabled={currentPage === totalPages || totalPages === 0}
                                            type="button"
                                            className="px-3 py-2 text-sm font-medium text-zinc-50 bg-green-700 border border-zinc-300 hover:bg-green-600 focus:z-10 focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {isPaymentModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content lg:p-8">
                        <div className="flex justify-between items-center py-6 mx-8 border-b border-zinc-200">
                            <h3 className="text-lg font-semibold text-zinc-800">Select Payment Method</h3>
                            <button
                                onClick={() => closeModal('payment')}
                                aria-label="Close"
                                className="text-zinc-700 hover:text-red-600"
                            >
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="py-6 space-y-4">
                            <label className="px-6 py-4 rounded-lg flex items-center gap-4">
                                <WalletIcon />
                                <span className="text-sm font-medium text-zinc-800 flex-grow">
                                    {`Pay from wallet (${pickUpAmount})`}
                                </span>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    id="wallet"
                                    value="wallet"
                                    checked={selectedPaymentMethod === 'wallet'}
                                    onChange={() => setSelectedPaymentMethod('wallet')}
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
                        <div className="px-6 py-4 flex flex-col items-center gap-3">
                            {
                                selectedPaymentMethod === 'card' ?
                                    (
                                        <Pay4ItButton
                                            amount={pickUpAmount}
                                            email={Corporate?.emailAddress || Corporate?.email || useAuthStore.getState().email || "corporate@email.com"}
                                            customerName={Corporate?.companyName || "Corporate User"}
                                            description="Waste Collection Payment"
                                            userType="corporate"
                                            customEndpoint="/corporate/wallets/charge"
                                            customPayload={{ paymentPurpose: "Waste Collection Application" }}
                                            onSuccess={async (res) => {
                                                console.log("Pay4It waste payment success:", res);
                                                const finalRef = res.reference || res.tranref;

                                                if (isPayingExisting) {
                                                    setNotification({ type: 'success', message: 'Payment successful!' });
                                                    fetchData();
                                                    closeModal('payment');
                                                } else {
                                                    await SubmitPickupRequest({ ref: finalRef, amount: pickUpAmount, channel: "card" });
                                                }
                                            }}
                                            onClose={() => {
                                                console.log("Pay4It window closed");
                                            }}
                                            buttonText="Make Payment"
                                            buttonClassName="btn btn-primary w-full"
                                        />
                                    )

                                    :
                                    (
                                        <button
                                            onClick={handlePaymentWithWallet}
                                            className="btn btn-primary w-full cursor-pointer"
                                        >
                                            Make Payment
                                        </button>
                                    )
                            }
                            <button
                                onClick={() => { closeModal('payment'); openModal('pickup'); }}
                                className="w-full text-center font-medium text-green-700 hover:text-green-900 py-2 cursor-pointer"
                            >
                                Go back
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pickup Modal - Replaced with Component */}
            <ScheduleWasteCollectionModal
                isOpen={isPickupModalOpen}
                onClose={() => closeModal('pickup')}
                onSubmit={handleScheduleSubmit} // Pass the handler
                pickUpAmount={pickUpAmount} // Pass amount if needed in modal
                notification={notification} // Pass notification state
                setNotification={setNotification} // Pass setNotification function
            />

            {/* Notification Toast */}
            {notification && (
                <div
                    className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg max-w-sm z-50 ${notification.type === 'success' ? 'bg-green-100 border border-green-400 text-green-800' : 'bg-red-100 border border-red-400 text-red-800'}`}
                    role={notification.type === 'error' ? 'alert' : 'status'}
                >
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{notification.message}</p>
                        <button
                            onClick={clearNotification}
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

// --- Icons (Keep or move to shared file) ---
const AlatIcon = () => null;

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
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
);

export default Wastes;