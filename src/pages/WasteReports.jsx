import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import BinDisposalLineChart from '../components/BinDisposalLineChart';
import { exportToCSV } from '../utils/exportHelper';

const WasteReports = () => {
    // --- State ---
    const [reports, setReports] = useState([]);
    const [chartDetails, setChartDetails] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortColumn, setSortColumn] = useState('');
    const [sortDirection, setSortDirection] = useState('dsc');
    const [currentPage, setCurrentPage] = useState(1);
    const [notification, setNotification] = useState(null);
    const [summary, setSummary] = useState({});

    // --- Filter States ---
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [statusFilter, setStatusFilter] = useState('All');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');

    const itemsPerPage = 12;

    // --- Reports Data ---
    
    useEffect(() => {
        const wasteData = JSON.parse(localStorage.getItem('wastereport'));
        if (!wasteData) return;

        const periodVal = wasteData.period || "";
        const genDate = wasteData.generationDate || "";
        const titleVal = wasteData.title || "";

        const innerData = wasteData.data?.data || wasteData.data || {};

        const totalDisposed = innerData.wasteSummary?.totalDisposed 
            ?? innerData.summary?.totalPickups 
            ?? innerData.summary?.totalDisposed 
            ?? 0;

        const totalWeight = innerData.wasteSummary?.totalWeight 
            ?? innerData.summary?.totalWeight 
            ?? 0;

        setSummary({
            period: periodVal,
            generationDate: genDate,
            title: titleVal,
            totalDisposed,
            totalWeight
        });

        setChartDetails(innerData.wasteGraph || []);

        const rawList = innerData.wasteData || innerData.pickups || [];
        const reportsData = rawList.map((item, index) => ({
            sn: index + 1,
            wasteId: item.wasteId || item._id || item.orderId || `WP-${index + 1}`,
            date: item.generatedDate || item.pickupDate || item.date || new Date().toISOString(),
            address: item.address || 'N/A',
            weightKgTon: item.weight ?? 0,
            status: item.status || 'pending',
        }));
        setReports(reportsData);
    }, []);

    const formatDate = (dateString) => {
            const date = new Date(dateString);
            const datePart = date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
            return datePart;
        };

    const formatWeight = (weight) => {
        return `${weight} kg`;
    };

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
    // --- Computed Properties ---
    const uniqueStatuses = useMemo(() => {
        const statuses = reports.map(r => r.status).filter(Boolean);
        return [...new Set(statuses)];
    }, [reports]);

    const filteredReports = useMemo(() => {
        let result = reports;

        // 1. Search Query
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(report => {
                return (
                    (report.wasteId || '').toLowerCase().includes(lowerQuery) ||
                    (report.address || '').toLowerCase().includes(lowerQuery) ||
                    (report.status || '').toLowerCase().includes(lowerQuery) ||
                    formatDate(report.date).includes(lowerQuery) ||
                    (report.weightKgTon || '').toString().includes(lowerQuery)
                );
            });
        }

        // 2. Status Filter
        if (statusFilter !== 'All') {
            result = result.filter(report => report.status === statusFilter);
        }

        // 3. Date Filters
        if (startDateFilter) {
            result = result.filter(report => report.date >= startDateFilter);
        }
        if (endDateFilter) {
            result = result.filter(report => report.date <= endDateFilter);
        }

        return result;
    }, [reports, searchQuery, statusFilter, startDateFilter, endDateFilter]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, startDateFilter, endDateFilter]);

    const sortedReports = useMemo(() => {
        return [...filteredReports].sort((a, b) => {
            let valA = a[sortColumn];
            let valB = b[sortColumn];

            if (sortColumn === 'weightKgTon') {
                // Numeric comparison for weights
                valA = Number(valA);
                valB = Number(valB);
            } else if (typeof valA === 'string') {
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
                        const [ , day, month, year ] = ddmmyy;
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
    }, [filteredReports, sortColumn, sortDirection]);

    const paginatedReports = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return sortedReports.slice(start, end);
    }, [sortedReports, currentPage]);

    const totalPages = useMemo(() => {
        if (sortedReports.length === 0) return 0;
        return Math.ceil(sortedReports.length / itemsPerPage);
    }, [sortedReports]);

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
        switch (status.toLowerCase()) {
            case 'delivered':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-zinc-100 text-zinc-800 border-zinc-300';
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
        if (sortedReports.length === 0) {
            setNotification({ type: 'error', message: "No records to export." });
            return;
        }

        try {
            const exportRows = sortedReports.map((report, index) => ({
                "S/N": index + 1,
                "Waste ID": report.wasteId,
                "Date": report.date,
                "Address": report.address,
                "Weight (kg)": report.weightKgTon,
                "Status": report.status
            }));
            exportToCSV(exportRows, "waste_reports");
            setNotification({ type: 'success', message: "Waste reports exported successfully!" });
        } catch (error) {
            console.error("Export error:", error);
            setNotification({ type: 'error', message: "An error occurred during export." });
        }
    };

    const handleRowAction = (wasteId) => {
        console.log("Row action triggered for ID:", wasteId);
        setNotification({ type: 'error', message: 'Coming soon..' });
    };

    return (
        <div>
            <div className="flex sans h-screen">
                <Sidebar addkey="1" />
                <div className="flex-1 bg-zinc-100 min-h-screen overflow-y-auto">
                    <Topbar />
                    <div className="bg-zinc-100 font-sans">
                        <main className="p-4 md:px-4">
                            <div className="p-5 md:p-8 rounded-lg w-full  mx-auto max-w-[93vw]">
                                {/* Header */}
                                <div className="flex flex-wrap justify-between items-center gap-4 mb-2">
                                    <div className="flex flex-col gap-2">
                                        <h1 className="text-xl md:text-2xl font-semibold text-zinc-800">Waste Reports</h1>
                                        <span className='text-zinc-500'>Track your waste disposal history</span>
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
                                            placeholder="Search reports..."
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

                                {/* Chart */}
                                <div className='bg-white rounded-t-2xl border border-zinc-200 flex flex-col  pb-20 '>

                                    <div className=' w-full flex lg:flex-row flex-col justify-between lg:items-center p-8 lg:p-12 '>
                                        <div className='lg:items-center flex flex-col justify-center lg:mb-0 mb-4'>
                                            <p className='flex flex-col'> <span className='text-xl font-semibold'>
                                                {summary.title}</span> <span className='text-zinc-500'>{summary.period}</span></p>

                                        </div>
                                        <div className=' flex llg:flex-row flex-co  items-center' >

                                            <p className='flex lg:flex-row flex-col'>
                                                <span>Date generated: </span>
                                                <span>
                                                    {summary.generationDate}</span>
                                            </p>

                                        </div>
                                    </div>



                                    <section className=" flex lg:flex-row flex-col justify-between mt-8">
                                        <div className='lg:ml-8 flex lg:flex-col space-x-4 flex-row lg:justify-center w-2-9 p-4'>
                                            <p className='flex flex-col py-4'> <span className='lg:text-5xl text-3xl font-bold'>{summary.totalDisposed}</span> <span className='uppercase text-zinc-400 font-light'>wastes Disposed</span></p>
                                            <p className='flex flex-col py-4'> <span className='lg:text-5xl text-3xl font-bold'>{summary.totalWeight}</span> <span className='uppercase  text-zinc-400 font-ligh'>Kg/Tonnes</span></p>
                                        </div>
                                        <div className='lg:w-7/9 w-full'> <BinDisposalLineChart data={chartDetails}/></div>
                                    </section>

                                </div>


                                {/* Table */}
                                <div className="table-container border border-zinc-200 bg-white rounded-b-2xl p-4">

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
                                                <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('address')}>
                                                    <div className="flex items-center justify-between">
                                                        Address <span className={`sort-icon ${sortColumn === 'address' ? 'active' : ''}`}>
                                                            {sortIcon('address')}
                                                        </span>
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('weightKgTon')}>
                                                    <div className="flex items-center justify-between">
                                                        Weight (kg) <span className={`sort-icon ${sortColumn === 'weightKgTon' ? 'active' : ''}`}>
                                                            {sortIcon('weightKgTon')}
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
                                                <th scope="col" className="pl-6 py-3 text-left">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedReports.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7" className="text-center py-10 text-zinc-500">No reports found.</td>
                                                </tr>
                                            ) : (
                                                paginatedReports.map((report) => (
                                                    <tr key={report.wasteId + report.sn} className="bg-white border-b border-zinc-200 hover:bg-zinc-50 lg:h-20  last:border-0">
                                                        <td className="px-4 py-3 font-medium text-zinc-900">{report.sn}</td>
                                                        <td className="px-4 py-3 font-medium text-zinc-900 whitespace-nowrap">{report.wasteId}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap">{formatDate(report.date)}</td>
                                                        <td className="px-4 py-3">{report.address}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap">{formatWeight(report.weightKgTon)}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <span className={`px-3 py-1 border rounded-full text-xs font-medium inline-block ${getStatusClass(report.status)}`}>
                                                                {report.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-left">
                                                            <button
                                                                onClick={() => handleRowAction(report.wasteId)}
                                                                type="button"
                                                                className="p-1 text-zinc-500 hover:text-zinc-700 flex flex-row"
                                                            >
                                                                <svg className='h-4 w-4 ' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                                        Total <span className="font-semibold">{reports.length}</span> items
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

export default WasteReports;