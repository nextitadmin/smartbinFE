import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import PaymentNav from '../components/PaymentNav';
import api from '../api/axiosConfig';

const PaymentReceipts = ({ transactionId }) => {
    // --- State ---
    const [receipts, setReceipts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortColumn, setSortColumn] = useState('date');
    const [sortDirection, setSortDirection] = useState('dsc');
    const [currentPage, setCurrentPage] = useState(1);
    const [notification, setNotification] = useState(null);
    const [totalPages, setTotalPages] = useState(0); // FIX: was '' (string), causes broken disabled checks
    const itemsPerPage = 6;

    const navigate = useNavigate();

    // FIX: wrapped in useCallback so useEffect dependency array is stable
    const fetchData = useCallback(async () => {
        if (!transactionId) return; // FIX: guard against undefined transactionId
        try {
            const { data } = await api.get(`/api/v1/agents/payment/receipt/${transactionId}`, {
                params: { page: currentPage, limit: itemsPerPage },
            });
            if (data.success) {
                const newData = data.data.data.map((item, index) => ({
                    sn: index + 1 + (currentPage - 1) * itemsPerPage,
                    id: item.transactionid,
                    transactionRef: item.transactionReference ?? '',
                    receiptRef: item.transactionReference ?? '',
                    date: item.transactionDate?.slice(0, 10) ?? '',
                    service: item.description ?? '',
                    // FIX: store amount as a number consistently; formatting is done at render time
                    amount: Number(item.amount) || 0,
                }));
                setReceipts(newData);
                setTotalPages(data.data.totalPages);
            }
        } catch (error) {
            console.error('Failed to fetch receipts:', error);
            setNotification({ type: 'error', message: 'Failed to load receipts. Please try again.' });
        }
    }, [transactionId, currentPage]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Notification auto-dismiss ---
    const clearNotification = () => setNotification(null);

    useEffect(() => {
        if (!notification) return;
        const timer = setTimeout(clearNotification, 5000);
        return () => clearTimeout(timer);
    }, [notification]);

    // FIX: formatDate was a no-op — it now formats a YYYY-MM-DD ISO string to DD-MM-YYYY
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        if (!year || !month || !day) return dateString;
        return `${day}-${month}-${year}`;
    };

    // --- Computed Properties ---
    // NOTE: search/sort operates on the current page only (server-side pagination).
    // For full-dataset search, move search params to the API query instead.
    const filteredReceipts = useMemo(() => {
        if (!searchQuery) return receipts;
        const lowerQuery = searchQuery.toLowerCase();
        return receipts.filter(receipt =>
            receipt.sn.toString().includes(lowerQuery) ||
            receipt.transactionRef.toLowerCase().includes(lowerQuery) ||
            receipt.receiptRef.toLowerCase().includes(lowerQuery) ||
            receipt.service.toLowerCase().includes(lowerQuery) ||
            // FIX: amount is now a number, so format it for string comparison
            formatCurrency(receipt.amount).toLowerCase().includes(lowerQuery) ||
            formatDate(receipt.date).toLowerCase().includes(lowerQuery)
        );
    }, [receipts, searchQuery]);

    const sortedReceipts = useMemo(() => {
        return [...filteredReceipts].sort((a, b) => {
            let valA = a[sortColumn];
            let valB = b[sortColumn];

            if (sortColumn === 'date') {
                // ISO date strings (YYYY-MM-DD) sort correctly as strings; parse for safety
                valA = new Date(valA).getTime() || 0;
                valB = new Date(valB).getTime() || 0;
            } else if (sortColumn === 'amount' || sortColumn === 'sn') {
                valA = Number(valA);
                valB = Number(valB);
            } else if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }

            const comparison = valA > valB ? 1 : valA < valB ? -1 : 0;
            return sortDirection === 'dsc' ? -comparison : comparison;
        });
    }, [filteredReceipts, sortColumn, sortDirection]);

    // --- Methods ---
    const sortBy = (columnKey) => {
        if (sortColumn === columnKey) {
            setSortDirection(prev => (prev === 'asc' ? 'dsc' : 'asc'));
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
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const filterData = () => {
        setNotification({ type: 'error', message: 'Coming soon..' });
    };

    const exportData = () => {
        setNotification({ type: 'error', message: 'Coming soon..' });
    };

    const handleDownload = (receiptId) => {
        localStorage.setItem('receiptId', receiptId);
        navigate('/receipt');
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
                                        <span className='text-zinc-500'>Track your waste disposal</span>
                                    </div>
                                </div>

                                <PaymentNav />

                                {/* Search and Actions */}
                                <div className="flex lg:flex-row flex-col justify-between gap-4 mb-6">
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 text-green-700 flex items-center pl-3">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
                                        <button onClick={filterData} type="button" className="px-4 lg:mx-4 py-2 border border-zinc-300 text-sm font-medium rounded-xl text-zinc-700 bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                            Filter
                                        </button>
                                        <button onClick={exportData} type="button" className="px-4 py-2 mx-4 border border-zinc-300 lg:mx-0 text-sm font-medium rounded-xl text-zinc-700 bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                            Export
                                        </button>
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="table-container border border-zinc-200 rounded-2xl">
                                    <table className="w-full min-w-[768px] text-sm text-left text-zinc-600">
                                        <thead className="font-light text-zinc-700 uppercase bg-white">
                                            <tr>
                                                {[
                                                    { key: 'sn', label: 'S/N' },
                                                    { key: 'transactionRef', label: 'Transaction Ref' },
                                                    { key: 'receiptRef', label: 'Receipt Ref' },
                                                    { key: 'service', label: 'Service' },
                                                    { key: 'amount', label: 'Amount' },
                                                    { key: 'date', label: 'Date' },
                                                ].map(({ key, label }) => (
                                                    <th key={key} scope="col" className="px-4 py-3" role="button" onClick={() => sortBy(key)}>
                                                        <div className="flex items-center justify-between">
                                                            {label}
                                                            <span className={`sort-icon ${sortColumn === key ? 'active' : ''}`}>
                                                                {sortIcon(key)}
                                                            </span>
                                                        </div>
                                                    </th>
                                                ))}
                                                <th scope="col" className="pl-6 py-3 text-left">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedReceipts.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7" className="text-center py-10 text-zinc-500">No receipts found.</td>
                                                </tr>
                                            ) : (
                                                sortedReceipts.map((receipt) => (
                                                    <tr key={`${receipt.sn}-${receipt.transactionRef}`} className="bg-white border-b border-zinc-200 hover:bg-zinc-50 lg:h-20">
                                                        <td className="px-4 py-3 font-medium text-zinc-900">{receipt.sn}</td>
                                                        <td className="px-4 py-3 font-medium text-zinc-900 whitespace-nowrap">{receipt.transactionRef}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap">{receipt.receiptRef}</td>
                                                        <td className="px-4 py-3">{receipt.service}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap">{formatCurrency(receipt.amount)}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap">{formatDate(receipt.date)}</td>
                                                        <td className="px-4 py-3 text-left">
                                                            <button onClick={() => handleDownload(receipt.id)} type="button" className="p-1 text-zinc-500 hover:text-zinc-700 flex flex-row">
                                                                <svg className='h-4 w-4' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#007836" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M7 10L12 15L17 10" stroke="#007836" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M12 15V3" stroke="#007836" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                                <span className='px-4 text-green-700'>Download</span>
                                                            </button>
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
                                        Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
                                        <span className="mx-2">|</span>
                                        Total <span className="font-semibold">{receipts.length}</span> items
                                    </span>
                                    <div className="inline-flex rounded-md shadow-sm -space-x-px" role="group">
                                        <button
                                            onClick={() => changePage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            type="button"
                                            className="px-3 mr-4 py-2 text-sm font-medium text-zinc-500 bg-white border border-zinc-300 hover:bg-zinc-100 focus:z-10 focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => changePage(currentPage + 1)}
                                            disabled={currentPage === totalPages || totalPages === 0}
                                            type="button"
                                            className="px-3 py-2 text-sm font-medium text-zinc-50 bg-green-700 border border-zinc-300 hover:bg-green-600 focus:z-10 focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Notification Toast */}
                            {notification && (
                                <div
                                    className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg max-w-sm z-50 ${notification.type === 'success'
                                        ? 'bg-green-100 border border-green-400 text-green-800'
                                        : 'bg-red-100 border border-red-400 text-red-800'
                                        }`}
                                    role={notification.type === 'error' ? 'alert' : 'status'}
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium">{notification.message}</p>
                                        <button
                                            onClick={clearNotification}
                                            className={`ml-4 text-xl font-semibold leading-none focus:outline-none ${notification.type === 'success' ? 'text-green-800 hover:text-green-900' : 'text-red-800 hover:text-red-900'}`}
                                            aria-label="Close notification"
                                        >
                                            &times;
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