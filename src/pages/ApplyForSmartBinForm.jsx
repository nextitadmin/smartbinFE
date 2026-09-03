import React, { useState, useEffect, useMemo, useRef, } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import useResidentStore from '../store/useResidentStore';
import useAuthStore from '../store/authStore';
import SmartBinApplicationForm from '../components/SmartBinApplicationForm';
import { exportToCSV } from '../utils/exportHelper';

const SmartBinApplication = () => {
    // --- State ---
    const [applications, setApplications] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortColumn, setSortColumn] = useState('date');
    const [sortDirection, setSortDirection] = useState('dsc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // --- Filter States ---
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [statusFilter, setStatusFilter] = useState('All');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');

    const [rowActionModal, setRowActionModal] = useState(false);
    const [viewApplicationModal, setViewApplicationModal] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [appDetails, setAppDetail] = useState({});
    const navigate = useNavigate();
    const [isApplyFormModalOpen, setIsApplyFormModalOpen] = useState(false);
    const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: string } | null
    const Resident = useResidentStore.getState().residentInfo;
    const [currentDataId, setCurrentDataId] = useState("");

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



    const fetchData = async () => {
        try {
            const { data } = await api.get(`/residents/smart-bin-applications?PageNo=1&PageSize=10000`);
            if (data.success) {
                const rawData = data.data || [];
                const newData = rawData.map((item) => ({
                    id: item._id,
                    orderId: item.transactionReference,
                    binType: item.binType,
                    date: item.createdAt?.slice(0, 10),
                    address: item.address,
                    status: item.applicationHistory[item.applicationHistory.length - 1]?.status || 'Pending',
                    deliveredDate: item?.deliveredDate,
                    deliveredBy: item?.deliveredBy,
                    approvedDate: item?.approvedDate,
                }));
                setApplications(newData);
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchData();
    }, [isApplyFormModalOpen]);

    useEffect(() => {
        const details = applications.find((item) => item.id === currentDataId);
        setAppDetail(details);
    }, [currentDataId, applications])

    // --- Computed Properties ---
    const uniqueStatuses = useMemo(() => {
        const statuses = applications.map(a => a.status).filter(Boolean);
        return [...new Set(statuses)];
    }, [applications]);

    const filteredApplications = useMemo(() => {
        let result = applications;

        // 1. Search Query
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(app => {
                return (
                    (app.orderId || '').toLowerCase().includes(lowerQuery) ||
                    (app.binType || '').toLowerCase().includes(lowerQuery) ||
                    (app.address || '').toLowerCase().includes(lowerQuery) ||
                    (app.status || '').toLowerCase().includes(lowerQuery) ||
                    (app.date || '').toLowerCase().includes(lowerQuery)
                );
            });
        }

        // 2. Status Filter
        if (statusFilter !== 'All') {
            result = result.filter(app => app.status === statusFilter);
        }

        // 3. Date Filters
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
                valB = typeof valB === 'string' ? valB.toLowerCase() : valB;
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

    const totalItemsCount = sortedApplications.length;
    const totalPagesCount = Math.ceil(totalItemsCount / itemsPerPage) || 1;

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
        if (page >= 1 && page <= totalPagesCount) {
            setCurrentPage(page);
        }
    };

    const getStatusClass = (status) => {
        switch ((status ?? '').toLowerCase()) {
            case 'pending':
                return 'bg-zinc-100 text-zinc-800 border-zinc-300';
            case 'approved':
                return 'bg-sky-100 text-sky-800 border-sky-300';
            case 'delivered':
                return 'bg-green-100 text-green-800 border-green-300';
            default:
                return 'bg-zinc-100 text-zinc-800 border-zinc-300';
        }
    };

    // const formatDate = (dateString) => {
    //     if (!dateString) return '';
    //     const parts = dateString.split('-');
    //     if (parts.length === 3) {
    //         return `${parts[2]}-${parts[1]}-${parts[0].slice(-2)}`;
    //     }
    //     return dateString;
    // };

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
                "Order ID": app.orderId,
                "Bin Type": app.binType,
                "Date": app.date,
                "Address": app.address,
                "Status": app.status
            }));
            exportToCSV(exportRows, "smart_bin_applications");
            setNotification({ type: 'success', message: "Applications exported successfully!" });
        } catch (error) {
            console.error("Export error:", error);
            setNotification({ type: 'error', message: "An error occurred during export." });
        }
    };

    const applyAction = () => {
        setIsApplyFormModalOpen(true); // <-- Open the new modal
    };

    const handleRowAction = (appId) => {
        setCurrentDataId(appId);
        console.log("Row action triggered for ID:", appId);
        setRowActionModal(true);
    };

    const handleTrack = () => {
        localStorage.setItem("appId", currentDataId);
        navigate("/appmanager")
    }
    const modalRef = useRef();

    const handleBackgroundClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            setRowActionModal(false);
        }
    };


    const closeApplyFormModal = () => {
        setIsApplyFormModalOpen(false);
    };



    // Handler called by the SmartBinApplicationForm when submission is successful
    const handleApplicationSubmitSuccess = (submittedApplicationData) => {
        console.log("Parent received successful submission:", submittedApplicationData);
        // Show success notification
        setNotification({ type: 'success', message: 'Smart Bin application submitted successfully!' });
        // Refresh the list of applications to show the new one
        fetchData();
        // Close the form modal (handled by the child component calling onClose)
        // Optionally update local state immediately if needed (optimistic update)
    };


    return (


        <div className="flex sans h-screen max-w-screen">

            <Sidebar addkey="1" />
            <div className=" bg-zinc-100 min-h-screen   flex flex-col flex-1 overflow-y-auto  ">
                <Topbar />

                <div className="bg-zinc-100 font-sans">
                    <main className="p-4 md:p-10">
                        <div className="p-5 md:p-8 rounded-lg w-full  mx-auto">
                            {/* Header */}
                            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-xl md:text-2xl font-semibold text-zinc-800">Applications</h1>
                                    <span className="bg-green-700 text-green-50 text-xs font-semibold px-2.5 py-2 rounded-full">
                                        {totalItemsCount}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <button
                                        onClick={applyAction}
                                        type="button"
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-green-700 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                        </svg>
                                        Apply for Smart Bin
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
                                        placeholder="Search members..."
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

                                    {/* Date From Filter */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Date From</label>
                                        <input
                                            type="date"
                                            value={startDateFilter}
                                            onChange={(e) => setStartDateFilter(e.target.value)}
                                            className="w-full px-3 py-2 border border-zinc-300 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
                                        />
                                    </div>

                                    {/* Date To Filter */}
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
                                            <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('orderId')}>
                                                <div className="flex items-center justify-between">
                                                    Order ID <span className={`sort-icon ${sortColumn === 'orderId' ? 'active' : ''}`}>
                                                        {sortIcon('orderId')}
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
                                            <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('binType')}>
                                                <div className="flex items-center justify-between">
                                                    Bin Type <span className={`sort-icon ${sortColumn === 'binType' ? 'active' : ''}`}>
                                                        {sortIcon('binType')}
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
                                            <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('status')}>
                                                <div className="flex items-center justify-between">
                                                    Status <span className={`sort-icon ${sortColumn === 'status' ? 'active' : ''}`}>
                                                        {sortIcon('status')}
                                                    </span>
                                                </div>
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedApplications.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="text-center py-10 text-zinc-500">No applications found.</td>
                                            </tr>
                                        ) : (
                                            paginatedApplications.map((app, index) => {
                                                const sn = (currentPage - 1) * itemsPerPage + index + 1;
                                                return (
                                                    <tr key={app.id} className="bg-white border-b border-zinc-200 hover:bg-zinc-50 lg:h-20">
                                                        <td className="px-4 py-3 font-medium text-zinc-900">{sn}</td>
                                                        <td className="px-4 py-3 font-medium text-zinc-900 whitespace-nowrap">{app.orderId}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap">{app.date}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap">{app.binType}</td>
                                                        <td className="px-4 py-3">{app.address}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <span className={`px-3 py-1 border rounded-full text-xs font-medium inline-block ${getStatusClass(app.status)}`}>
                                                                {app.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <button
                                                                onClick={() => handleRowAction(app.id)}
                                                                type="button"
                                                                className="p-1 text-zinc-500 hover:text-zinc-700"
                                                            >
                                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                                                                </svg>
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
                                    Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPagesCount}</span>
                                    <span className="mx-2">|</span>
                                    Total <span className="font-semibold">{totalItemsCount}</span> items
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
                                        disabled={currentPage === totalPagesCount || totalPagesCount === 0}
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

                {rowActionModal && (
                    <div
                        onClick={handleBackgroundClick}
                        className="fixed inset-0 bg-black/40  z-50 font-sans flex lg:justify-end justify-center items-center lg:items-center min-h-screen overflow-y-auto p-4"
                    >
                        <div
                            ref={modalRef}
                            onClick={(e) => e.stopPropagation()}
                            className=" max-w-4xl p-4 lg:mr-14 bg-white flex rounded-xl shadow-xl flex-col"
                        >

                            <p onClick={() => setViewApplicationModal(true)} className='p-2 cursor-pointer'>View</p>
                            <p className='p-2 cursor-pointer' onClick={() => handleTrack()}>Track application</p>

                        </div>
                    </div>
                )}

                {viewApplicationModal && (
                    <div
                        className="fixed inset-0 bg-black/20 z-50 font-sans flex lg:justify-end justify-center items-center lg:items-center min-h-screen overflow-y-auto"
                    >

                        <aside
                            className={`fixed top-0 right-0 z-50 lg:h-screen h-full lg:w-[550px] w-full bg-white flex flex-col transform transition-transform delay-200 ease-in-out duration-1000 ${viewApplicationModal ? 'translate-x-0' : 'translate-x-full'
                                }`}
                        >
                            <div className="p-6 border-b border-zinc-200 ">
                                {/* Top Title Row */}
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-semibold text-zinc-800">Application details</h2>
                                    <button
                                        onClick={() => { setViewApplicationModal(false), setRowActionModal(false) }}
                                        className="text-zinc-500 hover:text-black text-2xl"
                                    >
                                        &times;
                                    </button>
                                </div>
                            </div>

                            {/* Details Section */}
                            <div className="p-6 flex flex-col gap-6">
                                {/* OrderID */}
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">OrderID</span>
                                    <span className="font-semibold text-zinc-800">{appDetails.orderId}</span>
                                </div>

                                {/* Date */}
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Date</span>
                                    <span className="font-semibold text-zinc-800">{appDetails.date}</span>
                                </div>

                                {/* Address */}
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Address</span>
                                    <span className="font-semibold text-zinc-800 text-right">
                                        {appDetails.address}
                                    </span>
                                </div>

                                {/* Status */}
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-500">Status</span>
                                    <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-300 rounded-full text-sm">
                                        {appDetails.status}
                                    </span>
                                </div>

                                {
                                    appDetails.status == 'APPROVED' &&
                                    (
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">Approval Date:</span>
                                            <span className="font-semibold text-zinc-800">{appDetails?.approvedDate}</span>
                                        </div>
                                    )
                                }
                                {
                                    appDetails.status == 'DELIVERED' &&
                                    (
                                        <>
                                            <div className="flex justify-between">
                                                <span className="text-zinc-500">Delivered on:</span>
                                                <span className="font-semibold text-zinc-800">{appDetails?.deliveredDate}</span>
                                            </div>

                                            {/* Delivered by */}
                                            <div className="flex justify-between">
                                                <span className="text-zinc-500">Delivered by</span>
                                                <span className="font-semibold text-zinc-800">{appDetails?.deliveredBy}</span>
                                            </div>
                                        </>
                                    )
                                }
                            </div>
                        </aside>

                    </div>
                )}
                {isApplyFormModalOpen && ( // <-- Use the new state
                    <div className="fixed inset-0  bg-zinc-950/70 bg-opacity-50 backdrop-blur-lg  z-50 font-sans flex lg:items-center justify-center min-h-screen overflow-y-auto p-4">
                        <main className="w-full max-w-7xl bg-white">
                            {/* Pass props to the new component */}
                            <SmartBinApplicationForm
                                onClose={closeApplyFormModal} // Tell it how to close itself
                                onSubmitSuccess={handleApplicationSubmitSuccess} // Tell it how to notify success
                            />
                        </main>
                    </div>
                )}


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



        </div>

    );

};

export default SmartBinApplication;
