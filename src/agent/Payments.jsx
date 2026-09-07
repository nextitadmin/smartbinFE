import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/AgentSidebar';
import Topbar from '../components/AgentTopBar';
import useAgentStore from '../store/useAgentStore';
import api from '../api/axiosConfig';
import PaymentNav from '../components/PaymentNav';
import { exportToCSV } from '../utils/exportHelper';

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 text-zinc-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

const FilterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
    </svg>
);

const PaymentReceipts = () => {
    // --- State ---
    const [payments, setPayments] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortColumn, setSortColumn] = useState('date');
    const [sortDirection, setSortDirection] = useState('dsc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [notification, setNotification] = useState(null);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // --- Filter panel state ---
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [statusFilter, setStatusFilter] = useState('All');
    const [serviceFilter, setServiceFilter] = useState('All');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('All');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');



    const fetchData = async () => {
        try {
            const { data } = await api.get(`/agents/payment?page=${currentPage}&limit=${itemsPerPage}`);
            if (data.success || data.succeeded) {
                const rawTransactions =
                    data.data?.transactions ||
                    data.data?.data ||
                    data.data?.items ||
                    (Array.isArray(data.data) ? data.data : []) ||
                    (Array.isArray(data.transactions) ? data.transactions : []) ||
                    [];

                const list = Array.isArray(rawTransactions) ? rawTransactions : [];

                const defaultCustomer = `${useAgentStore.getState().agentInfo?.firstName || ''} ${useAgentStore.getState().agentInfo?.lastName || ''}`.trim() || 'Agent User';

                const newData = list.map((item) => ({
                    id: item._id || item.id,
                    transactionId: item.transactionReference || item.transactionId || item.reference || item._id || item.id || '',
                    date: (item.createdAt || item.transactionDate || item.date)?.slice(0, 10) || '',
                    service: item.service || item.description || item.meta?.description || 'Wallet Top-Up',
                    status: item.status || item.transactionStatus || 'Pending',
                    amount: item.amount ?? 0,
                    paymentMethod: item.paymentMethod || item.meta?.paymentMethod || 'wallet',
                    customerName: item.customerName || (item.user ? `${item.user.firstName || ''} ${item.user.lastName || ''}`.trim() : '') || item.userType || defaultCustomer
                }));

                setPayments(newData);

                const pages =
                    data.data?.paging?.pages ||
                    data.data?.totalPages ||
                    data.data?.paging?.totalPages ||
                    (data.data?.paging?.total ? Math.ceil(data.data.paging.total / itemsPerPage) : 1) ||
                    1;
                setTotalPages(pages);

                const total =
                    data.data?.paging?.total ||
                    data.data?.total ||
                    list.length;
                setTotalItems(total);
            }
        } catch (error) {
            console.log("Error fetching agent payments:", error);
        }
    };

    useEffect(() => {
        // Add serial numbers to wastes data
        fetchData()
    }, [currentPage]);

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
    const uniqueStatuses = useMemo(() => {
        const statuses = payments.map(p => p.status).filter(Boolean);
        const defaults = ['Successful', 'Pending', 'Failed'];
        return [...new Set([...defaults, ...statuses])];
    }, [payments]);

    const uniqueServices = useMemo(() => {
        const services = payments.map(p => p.service).filter(Boolean);
        return [...new Set(services)];
    }, [payments]);

    const uniquePaymentMethods = useMemo(() => {
        const methods = payments.map(p => p.paymentMethod).filter(Boolean);
        return [...new Set(methods)];
    }, [payments]);

    const filteredPayments = useMemo(() => {
        let result = payments;

        // 1. Search Query
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(payment => {
                return (
                    payment.transactionId?.toLowerCase().includes(lowerQuery) ||
                    payment.customerName?.toLowerCase().includes(lowerQuery) ||
                    payment.service?.toLowerCase().includes(lowerQuery) ||
                    payment.paymentMethod?.toLowerCase().includes(lowerQuery) ||
                    payment.status?.toLowerCase().includes(lowerQuery) ||
                    payment.date?.includes(lowerQuery) ||
                    payment.amount?.toString().includes(lowerQuery)
                );
            });
        }

        // 2. Status Filter
        if (statusFilter !== 'All') {
            result = result.filter(p => (p.status || '').toLowerCase() === statusFilter.toLowerCase());
        }

        // 3. Service Filter
        if (serviceFilter !== 'All') {
            result = result.filter(p => (p.service || '').toLowerCase() === serviceFilter.toLowerCase());
        }

        // 4. Payment Method Filter
        if (paymentMethodFilter !== 'All') {
            result = result.filter(p => (p.paymentMethod || '').toLowerCase() === paymentMethodFilter.toLowerCase());
        }

        // 5. Date Range Filters
        if (startDateFilter) {
            result = result.filter(p => p.date && p.date >= startDateFilter);
        }
        if (endDateFilter) {
            result = result.filter(p => p.date && p.date <= endDateFilter);
        }

        return result;
    }, [payments, searchQuery, statusFilter, serviceFilter, paymentMethodFilter, startDateFilter, endDateFilter]);

    const hasActiveFilters =
        statusFilter !== 'All' ||
        serviceFilter !== 'All' ||
        paymentMethodFilter !== 'All' ||
        Boolean(startDateFilter) ||
        Boolean(endDateFilter);

    const clearFilters = () => {
        setStatusFilter('All');
        setServiceFilter('All');
        setPaymentMethodFilter('All');
        setStartDateFilter('');
        setEndDateFilter('');
        setSearchQuery('');
    };

    // Reset to page 1 on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, serviceFilter, paymentMethodFilter, startDateFilter, endDateFilter]);

    const sortedPayments = useMemo(() => {
        return [...filteredPayments].sort((a, b) => {
            let valA = a[sortColumn];
            let valB = b[sortColumn];

            if (sortColumn === 'amount') {
                // Numeric comparison for amounts
                valA = Number(valA) || 0;
                valB = Number(valB) || 0;
            } else if (sortColumn === 'date') {
                valA = new Date(valA).getTime() || 0;
                valB = new Date(valB).getTime() || 0;
            } else if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }

            let comparison = 0;
            if (valA > valB) {
                comparison = 1;
            } else if (valA < valB) {
                comparison = -1;
            }

            return sortDirection === 'dsc' ? (comparison * -1) : comparison;
        });
    }, [filteredPayments, sortColumn, sortDirection]);

    // const paginatedPayments = useMemo(() => {
    //     const start = (currentPage - 1) * itemsPerPage;
    //     const end = start + itemsPerPage;
    //     return sortedPayments.slice(start, end);
    // }, [sortedPayments, currentPage]);



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
        switch (status?.toLowerCase() ?? "") {
            case 'successful':
            case 'completed':
            case 'paid':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'failed':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'abandoned':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'pending':
                return 'bg-amber-100 text-amber-800 border-amber-300';
            default:
                return 'bg-zinc-100 text-zinc-800 border-zinc-300';
        }
    };



    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 2
        }).format(Number(amount) || 0);
    };

    // Action Methods
    const filterData = () => {
        setShowFilterPanel(prev => !prev);
    };

    const exportData = () => {
        if (!sortedPayments || sortedPayments.length === 0) {
            setNotification({ type: 'error', message: 'No payments to export.' });
            return;
        }

        const exportRows = sortedPayments.map((p, index) => ({
            'S/N': index + 1,
            'Transaction ID': p.transactionId,
            'Customer Name': p.customerName,
            'Service': p.service,
            'Amount (NGN)': p.amount,
            'Date': p.date,
            'Payment Method': p.paymentMethod,
            'Status': p.status,
        }));

        exportToCSV(exportRows, 'agent_payments');
        setNotification({ type: 'success', message: `Successfully exported ${exportRows.length} payment records!` });
    };



    return (


        <div>
            <div className="flex sans h-screen max-w-screen">

                <Sidebar addkey="1" />
                <div className=" bg-zinc-100 min-h-screen   flex flex-col flex-1 overflow-y-auto  ">

                    <Topbar />
                    <div className="bg-zinc-100 font-sans">
                        <main className="p-4 md:px-4">
                            <div className="p-5 md:p-8 rounded-lg w-full  mx-auto">
                                {/* Header */}
                                <div className="flex flex-wrap justify-between items-center gap-4 mb-2">
                                    <div className="flex flex-col  gap-2">
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
                                            placeholder="Search payments..."
                                            className="w-full lg:w-[24rem] pl-10 pr-4 py-2 border border-zinc-300 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={filterData}
                                            type="button"
                                            className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition cursor-pointer ${
                                                showFilterPanel || hasActiveFilters
                                                    ? 'bg-green-50 border-green-500 text-green-700 font-semibold'
                                                    : 'border-zinc-300 text-zinc-700 bg-white hover:bg-zinc-50'
                                            }`}
                                        >
                                            <FilterIcon />
                                            <span>Filter</span>
                                            {hasActiveFilters && (
                                                <span className="ml-1.5 w-2 h-2 rounded-full bg-green-600"></span>
                                            )}
                                        </button>
                                        <button
                                            onClick={exportData}
                                            type="button"
                                            className="inline-flex items-center px-4 py-2 border border-zinc-300 text-sm font-medium rounded-xl text-zinc-700 bg-white hover:bg-zinc-50 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition cursor-pointer shadow-xs"
                                            title="Export payments history as CSV"
                                        >
                                            <DownloadIcon />
                                            <span>Export</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Filter Panel */}
                                {showFilterPanel && (
                                    <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-300 ease-in-out">
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
                                                {hasActiveFilters && (
                                                    <button
                                                        onClick={clearFilters}
                                                        type="button"
                                                        className="px-3 text-zinc-600 hover:text-red-600 hover:bg-zinc-100 rounded-xl text-xs font-medium border border-zinc-200 transition cursor-pointer"
                                                        title="Reset all filters"
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
                                                <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('transactionId')}>
                                                    <div className="flex items-center justify-between">
                                                        Transaction ID <span className={`sort-icon ${sortColumn === 'transactionId' ? 'active' : ''}`}>
                                                            {sortIcon('transactionId')}
                                                        </span>
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('customerName')}>
                                                    <div className="flex items-center justify-between">
                                                        Customer Name <span className={`sort-icon ${sortColumn === 'customerName' ? 'active' : ''}`}>
                                                            {sortIcon('customerName')}
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
                                                <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('paymentMethod')}>
                                                    <div className="flex items-center justify-between">
                                                        Payment Method <span className={`sort-icon ${sortColumn === 'paymentMethod' ? 'active' : ''}`}>
                                                            {sortIcon('paymentMethod')}
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
                                            {sortedPayments.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7" className="text-center py-10 text-zinc-500">No payments found.</td>
                                                </tr>
                                            ) : (
                                                sortedPayments.map((payment, index) => (
                                                    <tr key={payment.id || payment.transactionId || index} className="bg-white border-b border-zinc-200 hover:bg-zinc-50 lg:h-20">
                                                        <td className="px-4 py-3 font-medium text-zinc-900 whitespace-nowrap">{payment.transactionId}</td>
                                                        <td className="px-4 py-3">{payment.customerName}</td>
                                                        <td className="px-4 py-3">{payment.service}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap">{formatCurrency(payment.amount)}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap">{formatDate(payment.date)}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap capitalize">{payment.paymentMethod}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <span className={`px-3 py-1 border rounded-full text-xs font-medium inline-block capitalize ${getStatusClass(payment.status)}`}>
                                                                {payment.status}
                                                            </span>
                                                        </td>

                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
                                    <span className="text-sm text-zinc-700">
                                        Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages || 1}</span>
                                        <span className="mx-2">|</span>
                                        Total <span className="font-semibold">{totalItems || payments.length}</span> items
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
        </div>
    );
};

export default PaymentReceipts;