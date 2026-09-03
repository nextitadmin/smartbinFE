// src/components/SmartBinReport.js
import React, { useState, useEffect, useMemo } from 'react'; // Added useMemo

import Sidebar from '../components/FacilityMgrSideBar';
import Topbar from '../components/FacilityMgrTopBar';

// --- Data Layer (Integrated) ---






const simulateUpdateData = async () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() > 0.3) {
                resolve({ success: true, message: "Update was successful!" });
            } else {
                reject({ success: false, message: "Update failed. Please try again." });
            }
        }, 1500);
    });
};
// --- End Data Layer ---


// --- Icon Components ---
const LoadingSpinner = ({ className = "h-5 w-5" }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const SuccessIcon = ({ className = "h-6 w-6" }) => (<svg className={className} stroke="currentColor" fill="none" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /> </svg>);
const ErrorIcon = ({ className = "h-6 w-6" }) => (<svg className={className} stroke="currentColor" fill="none" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg>);

const SortIcon = ({ direction }) => {
    if (!direction) return <span className="text-zinc-400">↕</span>;
    if (direction === 'asc') return <span className="text-green-600">↑</span>;
    return <span className="text-green-600">↓</span>;
};
// --- End Icon Components ---

const ITEMS_PER_PAGE = 15; // Define items per page for pagination

const SmartBinReport = () => {
    const [reportData, setReportData] = useState({
        reportTitle: "My Report",
        reportPeriod: "JAN 01 - JUL 03",
        generatedDate: "",
        totalBinsOrdered: 200,
        items: [{
            sn: 1,
            id: "#03db24",
            orderId: "#03db24",
            date: "02/04/2025",
            address: "Lagos",
            weightKgTon: "20kg",
            status: "Pending",
        }]
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });

    // State for sorting and pagination
    const [sortColumn, setSortColumn] = useState('sn');
    const [sortDirection, setSortDirection] = useState('asc'); // Default ascending
    const [currentPage, setCurrentPage] = useState(1);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const datePart = date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
        return datePart;
    };

    useEffect(() => {
        const binData = JSON.parse(localStorage.getItem('binreport'));
        console.log(binData);
        const reportsData = binData.data.map((item, index) => ({
            sn: index + 1,
            id: item.orderId,
            orderId: item.orderId,
            date: item.generatedDate,
            address: item.address,
            weightKgTon: item.weight,
            status: item.status,
        }));
        setReportData({
            reportTitle: binData?.title || 'Report',
            reportPeriod: typeof binData?.period === 'object' ? `${binData.period.from || ''} - ${binData.period.to || ''}` : (binData?.period || ''),
            generatedDate: binData?.generationDate || '',
            totalBinsOrdered: reportsData.length,
            items: reportsData
        });
        setIsLoading(false);
    }, []);

    useEffect(() => {
        let timer;
        if (notification.show) {
            timer = setTimeout(() => setNotification({ show: false, type: '', message: '' }), 5000);
        }
        return () => clearTimeout(timer);
    }, [notification.show]);

    const handleSimulateUpdate = async () => {
        setIsUpdating(true);
        setNotification({ show: false, type: '', message: '' });
        try {
            const response = await simulateUpdateData({ reportId: reportData?.reportTitle, timestamp: new Date() });
            setNotification({ show: true, type: 'success', message: response.message });
        } catch (error) {
            const errorMessage = error?.message || "An unknown error occurred during the update.";
            setNotification({ show: true, type: 'error', message: errorMessage });
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'activated': return 'bg-orange-100 text-orange-700 border border-orange-300';
            case 'delivered': return 'bg-green-100 text-green-700 border border-green-300';
            case 'scheduled for delivery': return 'bg-purple-100 text-purple-700 border border-purple-300';
            case 'inventory': return 'bg-blue-100 text-blue-700 border border-blue-300';
            case 'pending': return 'bg-zinc-100 text-zinc-600 border border-zinc-300';
            default: return 'bg-zinc-100 text-zinc-600 border border-zinc-300';
        }
    };

    // Sorting logic
    const handleSort = (columnKey) => {
        if (sortColumn === columnKey) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(columnKey);
            setSortDirection('asc');
        }
        setCurrentPage(1); // Reset to first page on sort
    };

    const sortedItems = useMemo(() => {
        const items = [...reportData.items];
        return [...items].sort((a, b) => {
            let valA = a[sortColumn];
            let valB = b[sortColumn];

            if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }

            if (sortColumn === 'date') {
                const parseDate = (val) => {
                    if (val instanceof Date) return val;
                    if (typeof val === 'string') {
                        // Try to detect DD-MM-YY or DD-MM-YYYY
                        const ddmmyy = val.match(/^(\d{2})-(\d{2})-(\d{2,4})$/);
                        if (ddmmyy) {
                            const [, day, month, year] = ddmmyy;
                            const fullYear = year.length === 2 ? 2000 + parseInt(year) : parseInt(year);
                            return new Date(fullYear, parseInt(month) - 1, parseInt(day));
                        }
                        // Fallback to Date constructor for ISO or browser-parsable formats
                        return new Date(val);
                    }
                    return new Date(0); // fallback invalid date
                };

                const dateA = parseDate(valA);
                const dateB = parseDate(valB);

                valA = dateA.getTime();
                valB = dateB.getTime();
            }


            let comparison = 0;
            if (valA > valB) {
                comparison = 1;
            } else if (valA < valB) {
                comparison = -1;
            }

            return sortDirection === 'dsc' ? (comparison * -1) : comparison;
        });
    }, [sortColumn, sortDirection, reportData.items]);

    // Pagination logic
    const totalPages = useMemo(() => {
        if (!sortedItems) return 0;
        return Math.ceil(sortedItems.length / ITEMS_PER_PAGE);
    }, [sortedItems]);

    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedItems, currentPage]);

    const changePage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };




    // Table Headers Definition
    const tableHeaders = [
        { key: 'sn', label: 'S/N', className: 'w-16 text-left pl-2', sortable: true },
        { key: 'orderId', label: 'Order ID', className: 'flex-1 min-w-[120px] px-2', sortable: true },
        { key: 'date', label: 'Date', className: 'flex-1 min-w-[100px] px-2', sortable: true },
        { key: 'address', label: 'Address', className: 'flex-[2] min-w-[220px] px-2', sortable: true },
        { key: 'status', label: 'Status', className: 'flex-1 min-w-[140px] text-center px-2', sortable: true },
    ];


    return (

        <div>
            <div className="flex sans h-screen">
                <Sidebar addkey="1" />
                <div className="flex-1 bg-zinc-100 min-h-screen overflow-y-auto">
                    <Topbar />
                    <div className="bg-zinc-100 font-sans">
                        <main className="p-4 md:px-4">
                            <div className="lg:p-5 md:p-8 rounded-lg w-full  ">
                                {/* Header */}
                                <div className="flex flex-wrap justify-between items-center gap-4 mb-2">
                                    <div className="flex flex-col gap-2">
                                        <h1 className="text-xl md:text-2xl font-semibold text-zinc-800">Bin Request report</h1>
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
                                <div className="min-h-screen bg-zinc-100 p-4 md:p-6 font-sans">
                                    {/* Notification Popup */}
                                    {notification.show && (<div className={`fixed top-5 right-5 p-4 rounded-md shadow-xl text-white z-50 w-auto max-w-sm ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}> <div className="flex items-start"> {notification.type === 'success' ? <SuccessIcon className="h-5 w-5 mr-2 mt-0.5" /> : <ErrorIcon className="h-5 w-5 mr-2 mt-0.5" />} <span className="flex-1 text-sm">{notification.message}</span> <button onClick={() => setNotification({ ...notification, show: false })} className="ml-3 text-xl font-light leading-none hover:text-zinc-200">&times;</button> </div> </div>)}

                                    <div className="  bg-white ">
                                        <div className="p-6 md:p-8">
                                            {/* Header (Title, Period, Generated Date) */}
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 pb-4 "> <div> <h1 className="text-2xl md:text-3xl font-bold text-zinc-800">{reportData.reportTitle}</h1> <p className="text-sm text-zinc-500 mt-1">{reportData.reportPeriod}</p> </div> <p className=" text-zinc-700 mt-2 sm:mt-0 whitespace-nowrap">Date generated: {reportData.generatedDate}</p> </div>
                                            {/* Summary Section (Total Bins) */}
                                            <div className="text-center my-8 md:my-10"> <p className="text-5xl md:text-6xl  text-zinc-700">{reportData.totalBinsOrdered}</p> <p className="text-sm text-zinc-400 tracking-wider uppercase mt-1">BIN ORDERED</p> </div>
                                            {/* Simulate Update Button */}
                                            <div className="my-6  justify-end hidden"> <button onClick={handleSimulateUpdate} disabled={isUpdating || isLoading} className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg flex items-center disabled:opacity-60 disabled:cursor-not-allowed text-sm transition-colors duration-150"> {isUpdating && <LoadingSpinner className="text-white mr-2 h-4 w-4" />} {isUpdating ? 'Processing...' : 'Simulate Update'} </button> </div>

                                            {/* Table Section */}
                                            <div className="overflow-x-auto pb-4">
                                                <div className="min-w-[768px] w-full align-middle inline-block border border-zinc-200 rounded-xl">
                                                    {/* Table Header with Sorting */}
                                                    <div className="flex  p-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider rounded-t-md border-b border-zinc-200">
                                                        {tableHeaders.map(header => (
                                                            <div key={header.key} className={`${header.className} flex items-center  p-4`}>
                                                                {header.sortable ? (
                                                                    <button onClick={() => handleSort(header.key)} className="flex items-center hover:text-green-600 focus:outline-none w-full">
                                                                        <span>{header.label}</span>
                                                                        <SortIcon direction={sortColumn === header.key ? sortDirection : null} />
                                                                    </button>
                                                                ) : (
                                                                    <span>{header.label}</span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Table Body */}
                                                    {/* {isLoading && paginatedItems.length === 0 && (<div className="p-6 text-center text-zinc-500"> <LoadingSpinner className="text-green-500 h-6 w-6 mx-auto" /> <p className="mt-2">Fetching report details...</p> </div>)}
                                                    {!isLoading && paginatedItems.length === 0 && (<div className="p-6 text-center text-zinc-500 text-sm">No bin order records found for this period.</div>)} */}

                                                    {isLoading ? (
                                                        <div className="p-6 text-center text-zinc-500">
                                                            <LoadingSpinner className="text-green-500 h-6 w-6 mx-auto" />
                                                            <p className="mt-2">Fetching report details...</p>
                                                        </div>
                                                    ) : paginatedItems.length === 0 ? (
                                                        <div className="p-6 text-center text-zinc-500 text-sm">
                                                            No bin order records found for this period.
                                                        </div>
                                                    ) : (
                                                        paginatedItems.map((item) => (
                                                            <div key={item.id} className="flex items-center border-b border-zinc-200 lg:p-6 p-4 hover:bg-zinc-50 transition-colors duration-150 text-sm">
                                                                <div className={`${tableHeaders.find(h => h.key === 'sn').className} text-center text-zinc-500`}>{item.sn}</div>
                                                                <div className={`${tableHeaders.find(h => h.key === 'orderId').className} font-medium text-zinc-700`}>{item.orderId}</div>
                                                                <div className={`${tableHeaders.find(h => h.key === 'date').className} text-zinc-600`}>{formatDate(item.date)}</div>
                                                                <div className={`${tableHeaders.find(h => h.key === 'address').className} text-zinc-600 leading-snug`}>{item.address}</div>
                                                                <div className={`${tableHeaders.find(h => h.key === 'status').className} text-left`}>
                                                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full inline-block min-w-[90px] text-center ${getStatusClass(item.status)}`}>
                                                                        {item.status}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}

                                                </div>
                                            </div>

                                            {/* Pagination Controls */}
                                            {totalPages > 1 && (
                                                <div className="flex flex-col md:flex-row justify-between items-center mt-6 pt-4 border-t border-zinc-200">
                                                    <span className="text-sm text-zinc-600 mb-2 md:mb-0">
                                                        Page <span className="font-semibold text-zinc-800">{currentPage}</span> of <span className="font-semibold text-zinc-800">{totalPages}</span>
                                                        <span className="mx-2 hidden md:inline">|</span>
                                                        <span className="block md:inline mt-1 md:mt-0">Total <span className="font-semibold text-zinc-800">{reportData?.items?.length || 0}</span> items</span>
                                                    </span>
                                                    <div className="inline-flex rounded-md shadow-sm -space-x-px" role="group">
                                                        <button
                                                            onClick={() => changePage(currentPage - 1)}
                                                            disabled={currentPage === 1}
                                                            type="button"
                                                            className="px-3 py-2 text-sm font-medium text-zinc-500 bg-white border border-zinc-300 rounded-l-md hover:bg-zinc-50 focus:z-10 focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                                            <span className="sr-only">Previous</span>
                                                        </button>
                                                        {/* Page numbers could be added here for more complex pagination */}
                                                        <button
                                                            onClick={() => changePage(currentPage + 1)}
                                                            disabled={currentPage === totalPages || totalPages === 0}
                                                            type="button"
                                                            className="px-3 py-2 text-sm font-medium text-zinc-500 bg-white border border-zinc-300 rounded-r-md hover:bg-zinc-50 focus:z-10 focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
                                                            <span className="sr-only">Next</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </div>


    );
};

export default SmartBinReport;