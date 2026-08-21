import React, { useState, useEffect, useMemo } from 'react';

import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

// --- Data Layer & API Simulation ---

// Default data (same as before)
const defaultReportData = {
    title: 'My Report',
    generatedDate: 'Loading...',
    dateRange: 'Loading...',
    totalPaymentMade: 0,
    smartBinPurchaseTotal: 0,
    wasteDisposalTotal: 0,
    walletFundingTotal: 0,
    smartBinPurchaseProgress: 0,
    wasteDisposalProgress: 0,
    walletFundingProgress: 0,
    transactions: [],
};

// Simulate fetching data from an API (same as before)
const fetchReportData = () => {
    console.log('Simulating API call...');
    return new Promise((resolve,) => {
        setTimeout(() => {
            // Uncomment to test error state
            // if (Math.random() > 0.7) {
            //   console.error("Simulated API error");
            //   reject(new Error("Failed to fetch report data."));
            //   return;
            // }
            const fetchedData = {
                title: 'My Report',
                generatedDate: '20th July, 2024 5:32 pm',
                dateRange: 'JAN 01 - JUL 03',
                totalPaymentMade: 20000,
                smartBinPurchaseTotal: 35000,
                wasteDisposalTotal: 176000,
                walletFundingTotal: 1000000,
                smartBinPurchaseProgress: 64,
                wasteDisposalProgress: 72,
                walletFundingProgress: 56,
                transactions: [
                    { id: '#OD12589048', receiptId: '#OD12589048', service: 'Smart Bin Purchase', amount: 20000, date: '21-01-25', paymentMethod: 'Wallet' },
                    { id: '#OD12589049', receiptId: '#OD12589049', service: 'Waste Bin Disposal', amount: 11250, date: '22-01-25', paymentMethod: 'Alat By Wema' },
                    { id: '#OD12589050', receiptId: '#OD12589050', service: 'Waste Bin Disposal', amount: 20000, date: '24-01-25', paymentMethod: 'Alat By Wema' },
                    { id: '#OD12589051', receiptId: '#OD12589051', service: 'Waste Bin Disposal', amount: 6000, date: '28-01-25', paymentMethod: 'Wallet' },
                    { id: '#OD12589052', receiptId: '#OD12589052', service: 'Subscription', amount: 12600, date: '28-01-25', paymentMethod: 'Credit Card' },
                    { id: '#OD12589053', receiptId: '#OD12589053', service: 'Wallet top-up', amount: 3500, date: '28-01-25', paymentMethod: 'Alat By Wema' },
                    { id: '#OD12589054', receiptId: '#OD12589054', service: 'Waste Bin Disposal', amount: 3500, date: '28-01-25', paymentMethod: 'Alat By Wema' },
                    { id: '#OD12589055', receiptId: '#OD12589055', service: 'Subscription', amount: 3500, date: '28-01-25', paymentMethod: 'Alat By Wema' },
                    { id: '#OD12589056', receiptId: '#OD12589056', service: 'Waste Bin Disposal', amount: 3500, date: '28-01-25', paymentMethod: 'Alat By Wema' },
                    { id: '#OD12589057', receiptId: '#OD12589057', service: 'Wallet top', amount: 3500, date: '28-01-25', paymentMethod: 'Alat By Wema' },
                    { id: '#OD12589058', receiptId: '#OD12589058', service: 'Waste Bin Disposal', amount: 3500, date: '28-01-25', paymentMethod: 'Alat By Wema' },
                    { id: '#OD12589059', receiptId: '#OD12589059', service: 'Subscription', amount: 3500, date: '28-01-25', paymentMethod: 'Alat By Wema' },
                    { id: '#OD12589060', receiptId: '#OD12589060', service: 'Waste Bin Disposal', amount: 3500, date: '28-01-25', paymentMethod: 'Alat By Wema' },
                    // Add more dummy data for pagination testing if needed
                    { id: '#OD12589061', receiptId: '#OD12589061', service: 'Smart Bin Purchase', amount: 15000, date: '29-01-25', paymentMethod: 'Wallet' },
                    { id: '#OD12589062', receiptId: '#OD12589062', service: 'Waste Bin Disposal', amount: 5000, date: '30-01-25', paymentMethod: 'Credit Card' },
                ],
            };
            console.log('Simulated data fetched:', fetchedData);
            resolve(fetchedData);
        }, 1500);
    });
};

// --- Helper Functions ---

// Format currency (Naira) (same as before)
const formatCurrency = (amount) => {
    if (amount >= 1000000) {
        return `N${(amount / 1000000).toFixed(0)}M`;
    }
    if (amount >= 1000) {
        return `N${(amount / 1000).toFixed(0)}k`;
    }
    return `N${amount}`;
};

// --- React Component ---

const PaymentReportPage = () => {
    // State for report data, loading, and notifications (same as before)
    const [reportData, setReportData] = useState(defaultReportData);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // --- State for Table Features ---
    const [filterQuery, setFilterQuery] = useState(''); // State for the search/filter input
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' }); // State for sorting { key: 'columnName', direction: 'ascending' | 'descending' }
    const [currentPage, setCurrentPage] = useState(1); // State for the current page number
    const itemsPerPage = 12; // State for items per page



    // Fetch data on mount (same as before)
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setError(null);
            setSuccess(null);
            try {
                const storedData = JSON.parse(localStorage.getItem('paymentreport'));
                if (storedData) {
                    const innerData = storedData.data?.data || storedData.data || {};
                    const chartSummary = innerData.chartSummary || {};
                    const breakdown = chartSummary.breakdown || {};
                    
                    const smartBinTotal = breakdown["Smart Bin Purchase"]?.totalAmount || 0;
                    const smartBinPercent = breakdown["Smart Bin Purchase"]?.percentage || 0;
                    
                    const wasteTotal = breakdown["Waste Bin Disposal"]?.totalAmount || 0;
                    const wastePercent = breakdown["Waste Bin Disposal"]?.percentage || 0;
                    
                    const walletFundingTotal = breakdown["Wallet Top-Up"]?.totalAmount || 0;
                    const walletFundingPercent = breakdown["Wallet Top-Up"]?.percentage || 0;
                    
                    const transactionsList = innerData.records || innerData.transactions || [];
                    const transactions = transactionsList.map((item, index) => ({
                        id: item.transactionId || item.id || `TXN-${index + 1}`,
                        receiptId: item.receiptId || `REC-${index + 1}`,
                        service: item.service || 'N/A',
                        amount: item.amount ?? 0,
                        date: item.paidAt || item.date || new Date().toISOString(),
                        paymentMethod: item.paymentMethod || 'N/A'
                    }));

                    setReportData({
                        title: storedData.title || 'Untitled Report',
                        generatedDate: storedData.generationDate || '',
                        dateRange: storedData.period || '',
                        totalPaymentMade: chartSummary.totalPayment ?? 0,
                        smartBinPurchaseTotal: smartBinTotal,
                        wasteDisposalTotal: wasteTotal,
                        walletFundingTotal: walletFundingTotal,
                        smartBinPurchaseProgress: smartBinPercent,
                        wasteDisposalProgress: wastePercent,
                        walletFundingProgress: walletFundingPercent,
                        transactions
                    });
                } else {
                    const data = await fetchReportData();
                    setReportData(data);
                }
                setSuccess('Report data loaded successfully!');
                setTimeout(() => setSuccess(null), 3000);
            } catch (err) {
                console.error('Error fetching report data:', err);
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
                setReportData(defaultReportData);
                setTimeout(() => setError(null), 5000);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // --- Memoized Data Processing for Table ---
    const processedTransactions = useMemo(() => {
        let filteredData = [...reportData.transactions]; // Start with a copy of original transactions

        // 1. Filtering
        if (filterQuery) {
            const lowerCaseQuery = filterQuery.toLowerCase();
            filteredData = filteredData.filter(item =>
                Object.values(item).some(value =>
                    String(value).toLowerCase().includes(lowerCaseQuery)
                )
            );
        }

        // 2. Sorting
        if (sortConfig.key !== null) {
            filteredData.sort((a, b) => {
                const valA = a[sortConfig.key];
                const valB = b[sortConfig.key];

                // Basic comparison (can be enhanced for different data types)
                if (valA < valB) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (valA > valB) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }

        return filteredData; // Return filtered and sorted data
    }, [reportData.transactions, filterQuery, sortConfig]); // Recalculate when these change

    // --- Memoized Pagination Logic ---
    const paginatedTransactions = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return processedTransactions.slice(startIndex, endIndex); // Slice the processed data for the current page
    }, [processedTransactions, currentPage, itemsPerPage]); // Recalculate when these change

    // --- Event Handlers ---

    // Handle clicking on table headers for sorting
    const requestSort = (key) => {
        let direction = 'ascending';
        // If clicking the same key, toggle direction
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1); // Reset to first page on sort
    };

    // Handle filter input change
    const handleFilterChange = (event) => {
        setFilterQuery(event.target.value);
        setCurrentPage(1); // Reset to first page on filter change
    };

    // Handle changing the current page
    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) { // Basic boundary check
            setCurrentPage(newPage);
        }
    };

    // Calculate total pages for pagination controls
    const totalPages = Math.ceil(processedTransactions.length / itemsPerPage);

    // --- Render Logic ---

    return (

        <div>
            <div className="flex sans h-screen">
                <Sidebar addkey="1" />
                <div className="flex-1 bg-zinc-100 min-h-screen overflow-y-auto">
                    <Topbar />
                    <div className="bg-zinc-100 font-sans">
                        <main className="p-4 md:px-4">
                            <div className="lg:p-5 md:p-8 rounded-lg w-full  mx-auto max-w-[93vw]">
                                {/* Header */}
                                <div className="flex flex-wrap justify-between items-center gap-4 mb-2">
                                    <div className="flex flex-col gap-2">
                                        <h1 className="text-xl md:text-2xl font-semibold text-zinc-800">Payment History report</h1>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <button
                                            type="button"

                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-green-700 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                        >
                                            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                            </svg>
                                            Export Data
                                        </button>
                                    </div>
                                </div>


                                <div className="p-6 md:p-6 lg:p-8 bg-white min-h-screen font-sans my-20">
                                    {/* Header Section (same as before) */}
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 ">
                                        <div>
                                            <h1 className="text-2xl lg:text-3xl  font-semibold text-zinc-800">{reportData.title}</h1>
                                            <p className="text-sm text-zinc-500 mt-1">{reportData.dateRange}</p>
                                        </div>
                                        <p className="lg:text-lg text-zinc-600  mt-2 sm:mt-0">
                                            Date generated : {reportData.generatedDate}
                                        </p>
                                    </div>

                                    {/* Loading Indicator (same as before) */}
                                    {isLoading && (
                                        <div className="text-center p-4 my-4 bg-blue-100 text-blue-700 rounded-md">
                                            Loading report data... Please wait.
                                        </div>
                                    )}

                                    {/* Error Notification (same as before) */}
                                    {error && (
                                        <div className="text-center p-4 my-4 bg-red-100 text-red-700 rounded-md">
                                            Error: {error}
                                        </div>
                                    )}

                                    {/* Success Notification (same as before) */}
                                    {success && (
                                        <div className="text-center p-4 my-4 bg-green-100 text-green-700 rounded-md">
                                            {success}
                                        </div>
                                    )}

                                    {/* --- Main Content Area (Stats, Progress, Table) --- */}
                                    {!isLoading && !error && (
                                        <>
                                            {/* Summary Stats Section (same as before) */}
                                            <div className="mb-8 lg:p-4  flex lg:flex-row flex-col justify-between items-center  ">
                                                <div className='lg:w-5/9 w-full justify-center items-start flex flex-col lg:mb-0 mb-6'>
                                                    <h2 className="text-xs text-zinc-500  uppercase tracking-wider">Total Payment Made</h2>
                                                    <p className="text-3xl md:text-4xl font-bold text-zinc-800 ">{formatCurrency(reportData.totalPaymentMade)}</p>
                                                </div>
                                                <div className="lg:w-4/9 w-full flex flex-row justify-between items-center ">
                                                    <div className="flex flex-col">
                                                        <p className="lg:text-3xl text-xl font-semibold text-zinc-700 py-2">{formatCurrency(reportData.smartBinPurchaseTotal)}</p>
                                                        <p className="text-xs text-zinc-500 border-l-4 border-green-700 px-1">SMART BIN PURCHASE</p>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <p className="lg:text-3xl text-xl font-semibold text-zinc-700 py-2">{formatCurrency(reportData.wasteDisposalTotal)}</p>
                                                        <p className="text-xs text-zinc-500 border-l-4 border-green-700 px-1">WASTE DISPOSAL</p>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <p className="lg:text-3xl text-xl font-semibold text-zinc-700 py-2">{formatCurrency(reportData.walletFundingTotal)}</p>
                                                        <p className="text-xs text-zinc-500 border-l-4 border-green-700 px-1">WALLET FUNDING</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Progress Bars Section (same as before) */}
                                            <div className="mb-8 lg:p-4 lg:max-w-2/3 ">
                                                <div className="space-y-4">
                                                    {/* Smart Bin Purchase Progress */}
                                                    <div>
                                                        <div className="flex justify-between items-center mb-1">
                                                            <div className="w-full bg-zinc-200  lg:h-12 h-8 ">
                                                                <div
                                                                    className="bg-green-500 lg:h-12 h-8  justify-start items-center flex"
                                                                    style={{ width: `${reportData.smartBinPurchaseProgress}%` }}
                                                                    aria-valuenow={reportData.smartBinPurchaseProgress} aria-valuemin={0} aria-valuemax={100}
                                                                >
                                                                    <p className='text-white px-4 text-xs'> SMART BIN PURCHASE</p>
                                                                </div>
                                                            </div>
                                                            <span className="text-xs font-semibold text-green-700 px-4">{reportData.smartBinPurchaseProgress}%</span>
                                                        </div>

                                                    </div>
                                                    {/* Waste Disposal Progress */}
                                                    <div>
                                                        <div className="flex justify-between items-center mb-1">
                                                            <div className="w-full bg-zinc-200 lg:h-12 h-8 ">
                                                                <div
                                                                    className="bg-green-700 lg:h-12 h-8  justify-start items-center flex"
                                                                    style={{ width: `${reportData.wasteDisposalProgress}%` }}
                                                                    aria-valuenow={reportData.wasteDisposalProgress} aria-valuemin={0} aria-valuemax={100}
                                                                >
                                                                    <p className='text-white px-4 text-xs'> WASTE DISPOSAL</p>
                                                                </div>
                                                            </div>

                                                            <span className="text-xs font-semibold text-green-700 px-4">{reportData.wasteDisposalProgress}%</span>
                                                        </div>

                                                    </div>
                                                    {/* Wallet Funding Progress */}
                                                    <div>
                                                        <div className="flex justify-between items-center mb-1">
                                                            <div className="w-full bg-zinc-200 lg:h-12 h-8 ">
                                                                <div
                                                                    className="bg-green-600 lg:h-12 h-8  justify-start items-center flex"
                                                                    style={{ width: `${reportData.walletFundingProgress}%` }}
                                                                    aria-valuenow={reportData.walletFundingProgress} aria-valuemin={0} aria-valuemax={100}
                                                                >
                                                                    <p className='text-white px-4 text-xs'>  WALLET FUNDING</p>



                                                                </div>
                                                            </div>
                                                            <span className="text-xs font-semibold text-green-700 px-4">{reportData.walletFundingProgress}%</span>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>

                                            {/* --- Enhanced Transactions Table Section --- */}
                                            <div className=" overflow-hidden">
                                                {/* Filter Input */}
                                                <div className="p-6 hidden">
                                                    <input
                                                        type="text"
                                                        placeholder="Filter transactions..."
                                                        value={filterQuery}
                                                        onChange={handleFilterChange}
                                                        className="w-full p-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>

                                                {/* Responsive Table Wrapper */}
                                                <div className="overflow-x-auto  border border-zinc-300 rounded-2xl">
                                                    <table className="w-full min-w-[768px] text-sm text-left text-zinc-700"> {/* Increased min-width slightly */}
                                                        {/* Table Header with Sorting */}
                                                        <thead className="text-xs text-zinc-700  uppercase py-4 ">
                                                            <tr>
                                                                {/* Add onClick handlers and visual indicators for sortable columns */}
                                                                <th scope="col" className="lg:p-6 p-2">S/N</th>
                                                                <th scope="col" className="p-6 cursor-pointer hover:bg-zinc-200" onClick={() => requestSort('id')}>
                                                                    Transaction ID {sortConfig.key === 'id' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                                                                </th>
                                                                <th scope="col" className="p-6 cursor-pointer hover:bg-zinc-200" onClick={() => requestSort('receiptId')}>
                                                                    Receipt ID {sortConfig.key === 'receiptId' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                                                                </th>
                                                                <th scope="col" className="p-6 cursor-pointer hover:bg-zinc-200" onClick={() => requestSort('service')}>
                                                                    Service {sortConfig.key === 'service' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                                                                </th>
                                                                <th scope="col" className="p-6  cursor-pointer hover:bg-zinc-200" onClick={() => requestSort('amount')}>
                                                                    Amount (N) {sortConfig.key === 'amount' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                                                                </th>
                                                                <th scope="col" className="p-6 cursor-pointer hover:bg-zinc-200" onClick={() => requestSort('date')}>
                                                                    Date {sortConfig.key === 'date' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                                                                </th>
                                                                <th scope="col" className="p-6 cursor-pointer hover:bg-zinc-200" onClick={() => requestSort('paymentMethod')}>
                                                                    Payment Method {sortConfig.key === 'paymentMethod' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        {/* Table Body - Renders Paginated Data */}
                                                        <tbody>
                                                            {paginatedTransactions.length > 0 ? (
                                                                paginatedTransactions.map((transaction, index) => {
                                                                    // Calculate the original index based on pagination
                                                                    const originalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                                                                    return (
                                                                        <tr key={transaction.id} className="bg-white border-t border-zinc-300  hover:bg-zinc-50 ">
                                                                            <td className="lg:p-6 p-2">{originalIndex}</td> {/* Use original index */}
                                                                            <td className="lg:p-6 p-2 font-medium text-zinc-900 whitespace-nowrap">{transaction.id}</td>
                                                                            <td className="lg:p-6 p-2">{transaction.receiptId}</td>
                                                                            <td className="lg:p-6 p-2">{transaction.service}</td>
                                                                            <td className="lg:p-6 p-2">{transaction.amount.toLocaleString()}</td>
                                                                            <td className="lg:p-6 p-2">{transaction.date}</td>
                                                                            <td className="lg:p-6 p-2">{transaction.paymentMethod}</td>
                                                                        </tr>
                                                                    );
                                                                })
                                                            ) : (
                                                                // Display when no transactions match filter or no data
                                                                <tr>
                                                                    <td colSpan={7} className="text-center py-4 text-zinc-500">
                                                                        {filterQuery ? 'No transactions match your filter.' : 'No transactions found for this period.'}
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                {/* Pagination Controls */}
                                                {totalPages > 1 && (
                                                    <div className="flex flex-col sm:flex-row justify-between items-center p-4  text-sm text-zinc-600">
                                                        {/* Items per page selector (optional) */}
                                                        {/* <div className="mb-2 sm:mb-0">
                            <label htmlFor="itemsPerPage" className="mr-2">Items per page:</label>
                            <select
                                id="itemsPerPage"
                                value={itemsPerPage}
                                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                className="p-1 border border-zinc-300 rounded-md"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div> */}

                                                        {/* Page Info */}
                                                        <div className="mb-2 sm:mb-0">
                                                            Page {currentPage} of {totalPages} ({processedTransactions.length} items)
                                                        </div>

                                                        {/* Navigation Buttons */}
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handlePageChange(currentPage - 1)}
                                                                disabled={currentPage === 1}
                                                                className="px-3 py-1 border border-zinc-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-100"
                                                            >
                                                                Previous
                                                            </button>
                                                            <button
                                                                onClick={() => handlePageChange(currentPage + 1)}
                                                                disabled={currentPage === totalPages}
                                                                className="px-3 py-1 border border-zinc-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-100"
                                                            >
                                                                Next
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>

                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentReportPage;
