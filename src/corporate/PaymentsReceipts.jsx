import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/CorporateTopBar';
import PaymentNav from '../components/PaymentNav';
import useCorporateStore from '../store/useCorporateStore';
import api from '../api/axiosConfig';
import { exportToCSV } from '../utils/exportHelper';

const PaymentReceipts = () => {
    // --- State ---
    const [receipts, setReceipts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortColumn, setSortColumn] = useState('date');
    const [sortDirection, setSortDirection] = useState('dsc');
    const [currentPage, setCurrentPage] = useState(1);
    const [notification, setNotification] = useState(null);

    // --- Filter States ---
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [serviceFilter, setServiceFilter] = useState('All');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');

    const itemsPerPage = 10;

    const navigate = useNavigate()

    const fetchData = async () => {
        try {
            const endpoint = `/corporate/payments?AccountNo=${useCorporateStore.getState().corporateInfo.accountNo}&page=1&limit=10000`;
            console.log("Calling API endpoint:", endpoint);
            
            const { data } = await api.get(endpoint);
            if (data.succeeded || data.success) {
                const transactions = data.data?.transactions || data.transactions || [];
                const newData = transactions.map((item) => {
                    let paymentMethod = item.paymentMethod || "N/A";
                    if (
                        paymentMethod.toLowerCase() === "wallet" &&
                        (
                            (item.service && item.service.toLowerCase().includes("alat")) ||
                            (item.meta?.description && item.meta.description.toLowerCase().includes("alat")) ||
                            (item.transactionReference && item.transactionReference.toLowerCase().includes("alat"))
                        )
                    ) {
                        paymentMethod = "alatPay";
                    }
                    
                    let service = item.service || "Payment";
                    if (
                        service.toLowerCase() === "wallet charge" &&
                        (
                            (item.narration && item.narration.toLowerCase().includes("subscription")) ||
                            (item.paymentPurpose && item.paymentPurpose.toLowerCase().includes("subscription")) ||
                            (item.meta?.description && item.meta.description.toLowerCase().includes("subscription"))
                        )
                    ) {
                        service = "Subscription";
                    }
                    
                    return {
                        id: item._id || item.id,
                        transactionRef: item.transactionReference || item.id,
                        receiptRef: item.transactionReference || item.id,
                        date: (item.createdAt || item.date)?.slice(0, 10),
                        service: service,
                        amount: item.amount,
                        paymentMethod: paymentMethod
                    };
                });
                setReceipts(newData);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const parts = dateString.split('-');
        if (parts.length === 3) {
            return `${parts[0]}-${parts[1]}-${parts[2]}`;
        }
        return dateString;
    };

    // --- Computed Properties ---
    const uniqueServices = useMemo(() => {
        const services = receipts.map(r => r.service).filter(Boolean);
        return [...new Set(services)];
    }, [receipts]);

    const filteredReceipts = useMemo(() => {
        let result = receipts;

        // 1. Search Query
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(receipt => {
                return (
                    (receipt.transactionRef || '').toLowerCase().includes(lowerQuery) ||
                    (receipt.receiptRef || '').toLowerCase().includes(lowerQuery) ||
                    (receipt.service || '').toLowerCase().includes(lowerQuery) ||
                    formatDate(receipt.date).toLowerCase().includes(lowerQuery) ||
                    (receipt.amount || '').toString().toLowerCase().includes(lowerQuery)
                );
            });
        }

        // 2. Service Filter
        if (serviceFilter !== 'All') {
            result = result.filter(receipt => receipt.service === serviceFilter);
        }

        // 3. Date Range Filters
        if (startDateFilter) {
            result = result.filter(receipt => receipt.date >= startDateFilter);
        }
        if (endDateFilter) {
            result = result.filter(receipt => receipt.date <= endDateFilter);
        }

        return result;
    }, [receipts, searchQuery, serviceFilter, startDateFilter, endDateFilter]);

    const sortedReceipts = useMemo(() => {
        return [...filteredReceipts].sort((a, b) => {
            let valA = a[sortColumn];
            let valB = b[sortColumn];

            if (sortColumn === 'amount') {
                valA = Number(valA) || 0;
                valB = Number(valB) || 0;
            } else if (typeof valA === 'string') {
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
    }, [filteredReceipts, sortColumn, sortDirection]);





    const paginatedReceipts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sortedReceipts.slice(startIndex, endIndex);
    }, [sortedReceipts, currentPage]);

    const totalItems = sortedReceipts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, serviceFilter, startDateFilter, endDateFilter]);

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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const clearFilters = () => {
        setServiceFilter('All');
        setStartDateFilter('');
        setEndDateFilter('');
        setSearchQuery('');
    };

    const filterData = () => {
        setShowFilterPanel(prev => !prev);
    };

    const exportData = () => {
        if (sortedReceipts.length === 0) {
            setNotification({ type: 'error', message: "No receipts available to export." });
            return;
        }

        try {
            const exportRows = sortedReceipts.map((r, index) => ({
                "S/N": index + 1,
                "Transaction Ref": r.transactionRef,
                "Receipt Ref": r.receiptRef,
                "Service": r.service,
                "Amount (NGN)": r.amount,
                "Date": r.date
            }));

            exportToCSV(exportRows, "payment_receipts");
            setNotification({ type: 'success', message: "Receipts exported successfully!" });
        } catch (error) {
            console.error("Export error:", error);
            setNotification({ type: 'error', message: "An error occurred during export." });
        }
    };


    const handleDownload = (receiptId) => {
        localStorage.setItem('receiptId', receiptId);
        navigate("/receipt")
        console.log("Download receipt:", receiptId);


    };

    return (
        <div>
            <div className="flex sans h-screen">
                <Sidebar addkey="1" />
                <div className="flex-1 bg-zinc-100 min-h-screen overflow-y-auto">
                    <Topbar />
                    <div className="bg-zinc-100 font-sans">
                        <main className="p-4 md:px-4">
                            <div className="p-5 md:p-8 rounded-lg w-full mx-auto">
                                {/* Header */}
                                <div className="flex flex-wrap justify-between items-center gap-4 mb-2">
                                    <div className="flex flex-col gap-2">
                                        <h1 className="text-xl md:text-2xl font-semibold text-zinc-800">Payment</h1>
                                        <span className='text-zinc-500'> Track your waste disposal</span>
                                    </div>
                                </div>


                                <PaymentNav />
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
                                            placeholder="Search receipts..."
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
                                        {/* Service Filter */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Service</label>
                                            <select
                                                value={serviceFilter}
                                                onChange={(e) => setServiceFilter(e.target.value)}
                                                className="w-full px-3 py-2 border border-zinc-300 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
                                            >
                                                <option value="All">All Services</option>
                                                {uniqueServices.map(service => (
                                                    <option key={service} value={service}>{service}</option>
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
                                                {(serviceFilter !== 'All' || startDateFilter || endDateFilter) && (
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
                                                <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('sn')}>
                                                    <div className="flex items-center justify-between">
                                                        S/N <span className={`sort-icon ${sortColumn === 'sn' ? 'active' : ''}`}>
                                                            {sortIcon('sn')}
                                                        </span>
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('transactionRef')}>
                                                    <div className="flex items-center justify-between">
                                                        Transaction Ref <span className={`sort-icon ${sortColumn === 'transactionRef' ? 'active' : ''}`}>
                                                            {sortIcon('transactionRef')}
                                                        </span>
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('receiptRef')}>
                                                    <div className="flex items-center justify-between">
                                                        Receipt Ref <span className={`sort-icon ${sortColumn === 'receiptRef' ? 'active' : ''}`}>
                                                            {sortIcon('receiptRef')}
                                                        </span>
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('service')}>
                                                    <div className="flex items-center justify-between">
                                                        Service <span className={`sort-icon ${sortColumn === 'service' ? 'active' : ''}`}>
                                                            {sortIcon('service')}
                                                        </span>
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('amount')}>
                                                    <div className="flex items-center justify-between">
                                                        Amount <span className={`sort-icon ${sortColumn === 'amount' ? 'active' : ''}`}>
                                                            {sortIcon('amount')}
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
                                                <th scope="col" className="pl-6 py-3 text-left">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedReceipts.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7" className="text-center py-10 text-zinc-500">No receipts found.</td>
                                                </tr>
                                            ) : (
                                                paginatedReceipts.map((receipt, index) => {
                                                    const sn = (currentPage - 1) * itemsPerPage + index + 1;
                                                    return (
                                                        <tr key={receipt.id || receipt.transactionRef} className="bg-white border-b border-zinc-200 hover:bg-zinc-50 lg:h-20">
                                                            <td className="px-4 py-3 font-medium text-zinc-900">{sn}</td>
                                                            <td className="px-4 py-3 font-medium text-zinc-900 whitespace-nowrap">{receipt.transactionRef}</td>
                                                            <td className="px-4 py-3 whitespace-nowrap">{receipt.receiptRef}</td>
                                                            <td className="px-4 py-3">{receipt.service}</td>
                                                            <td className="px-4 py-3 whitespace-nowrap">{formatCurrency(receipt.amount)}</td>
                                                            <td className="px-4 py-3 whitespace-nowrap">{formatDate(receipt.date)}</td>
                                                            <td className="px-4 py-3 text-left">
                                                                <button
                                                                    onClick={() => handleDownload(receipt.id)}
                                                                    type="button"
                                                                    className="p-1 text-zinc-500 hover:text-zinc-700 flex flex-row"
                                                                >
                                                                    <svg className='h-4 w-4' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#007836" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                        <path d="M7 10L12 15L17 10" stroke="#007836" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                        <path d="M12 15V3" stroke="#007836" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                    <span className='px-4 text-green-700'>Download</span>
                                                                </button>
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
                        </main>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default PaymentReceipts;