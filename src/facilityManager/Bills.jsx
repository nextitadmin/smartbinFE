import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/FacilityMgrSideBar';
import Topbar from '../components/FacilityMgrTopBar';
import api from '../api/axiosConfig';
import useAuthStore from '../store/authStore';

const Bills = () => {
    // --- State ---
    const [applications, setApplications] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortColumn, setSortColumn] = useState('dueDate');
    const [sortDirection, setSortDirection] = useState('dsc');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [notification, setNotification] = useState(null);
    const [currentId, setCurrentId] = useState('');
    const [currentAmount, setCurrentAmount] = useState('');
    const itemsPerPage = 6;

    // --- Dev Mode Flag ---
    const devMode = true; // Set to true for development, false for production

    // navigate 
    const navigate = useNavigate()

    // --- Demo Data ---
    const demoData = [
        {
            sn: 1,
            billId: '#OD12589048',
            customerName: 'Adebimpe Soriyan',
            customerType: 'Resident',
            dueDate: '21-01-25',
            service: 'Waste Bin Disposal',
            status: 'Pending',
            amount: 20000,
        },
        {
            sn: 2,
            billId: '#OD12589048',
            customerName: 'Blue Way Limited',
            customerType: 'Coporate',
            dueDate: '22-01-25',
            service: 'Waste Bin Disposal',
            status: 'Pending',
            amount: 11250,
        },
        {
            sn: 3,
            billId: '#OD12589048',
            customerName: 'Soya Limited Enterprises',
            customerType: 'Coporate',
            dueDate: '24-01-25',
            service: 'Waste Bin Disposal',
            status: 'Pending',
            amount: 20000,
        },
        {
            sn: 4,
            billId: '#OD12589048',
            customerName: 'Martins Madueke',
            customerType: 'Resident',
            dueDate: '28-01-25',
            service: 'Waste Bin Disposal',
            status: 'Pending',
            amount: 6000,
        },
        {
            sn: 5,
            billId: '#OD12589048',
            customerName: 'Fisayo Mabel',
            customerType: 'Resident',
            dueDate: '28-01-25',
            service: 'Waste Bin Disposal',
            status: 'Pending',
            amount: 12600,
        },
        {
            sn: 6,
            billId: '#OD12589048',
            customerName: 'Chicken & Co. Restaurant',
            customerType: 'Coporate',
            dueDate: '28-01-25',
            service: 'Waste Bin Disposal',
            status: 'Pending',
            amount: 3500,
        },
    ];

    // --- Bills Data ---
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
            const { data } = await api.get('/facility-manager/bill');
            if (data.success && Array.isArray(data.data)) {
                const newData = data.data.map((item, index) => ({
                    id: `${item.wasteID}-${index}`,
                    sn: index + 1 + (currentPage - 1) * itemsPerPage,
                    billId: item.wasteID,
                    customerName: item.customerName || '', // Add customer name
                    customerType: item.customerType || '', // Add customer type
                    dueDate: item.dueDate?.slice(0, 10),
                    service: item.serviceType,
                    status: item.status,
                    amount: item.amount,
                }));
                setApplications(newData);
                setTotalPages(data.totalPages || 1);
                setTotalItems(data.totalCount || newData.length);
            } else {
                // If API call fails, use demo data in dev mode
                if (devMode) {
                    console.warn("API call failed. Using demo data.");
                    const paginatedDemoData = demoData.slice(
                        (currentPage - 1) * itemsPerPage,
                        currentPage * itemsPerPage
                    );
                    setApplications(paginatedDemoData);
                    setTotalPages(Math.ceil(demoData.length / itemsPerPage));
                    setTotalItems(demoData.length);
                } else {
                    throw new Error("API call failed.");
                }
            }
        } catch (error) {
            console.log(error);
            // Use demo data in dev mode
            if (devMode) {
                console.warn("API call failed. Using demo data.");
                const paginatedDemoData = demoData.slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage
                );
                setApplications(paginatedDemoData);
                setTotalPages(Math.ceil(demoData.length / itemsPerPage));
                setTotalItems(demoData.length);
            } else {
                setNotification({ type: 'error', message: 'Failed to fetch bills. Please try again.' });
            }
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const parts = dateString.split('-');
        if (parts.length === 3) {
            return `${parts[0]}-${parts[1]}-${parts[2]}`;
        }
        return dateString;
    };

    // --- Computed Properties ---
    const filteredApplications = useMemo(() => {
        if (!searchQuery) {
            return applications;
        }
        const lowerQuery = searchQuery.toLowerCase();
        return applications.filter(app => {
            return (
                app.billId.toLowerCase().includes(lowerQuery) ||
                app.service.toLowerCase().includes(lowerQuery) ||
                app.status.toLowerCase().includes(lowerQuery) ||
                formatDate(app.dueDate).includes(lowerQuery) ||
                app.customerName.toLowerCase().includes(lowerQuery) || // Include customer name
                app.customerType.toLowerCase().includes(lowerQuery) // Include customer type
            );
        });
    }, [applications, searchQuery]);

    const sortedApplications = useMemo(() => {
        return [...filteredApplications].sort((a, b) => {
            let valA = a[sortColumn];
            let valB = b[sortColumn];
            if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }
            if (sortColumn === 'dueDate') {
                // Convert dates to comparable format (YY-MM-DD)
                valA = new Date(`20${valA.split('-').reverse().join('-')}`);
                valB = new Date(`20${valB.split('-').reverse().join('-')}`);
            }
            if (sortColumn === 'amount') {
                valA = Number(valA);
                valB = Number(valB);
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
            case 'pending':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'paid':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'delivered':
                return 'bg-green-100 text-green-800 border-green-300';
            default:
                return 'bg-zinc-100 text-zinc-800 border-zinc-300';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount);
    };

    // Placeholder Action Methods
    const filterData = () => {
        console.log("Filter action triggered");
        setNotification({ type: 'error', message: "Coming soon.." });
    };

    const exportData = () => {
        console.log("Export action triggered");
        setNotification({ type: 'error', message: "Coming soon.." });
    };

    const handleRowAction = (appId, amount, customerName) => {
        openModal('action');
        setCurrentId(appId);
        setCurrentAmount(amount);
        setCurrentCustomerName(customerName); // Store customer name
        console.log("Row action triggered for ID:", appId);
    };

    // Modal states
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [currentCustomerName, setCurrentCustomerName] = useState('');

    // Modal handlers
    const openModal = (modalName) => {
        if (modalName === 'action') setIsActionModalOpen(true);
    };

    const closeModal = (modalName) => {
        if (modalName === 'action') {
            setIsActionModalOpen(false);
            setCurrentId('');
            setCurrentAmount('');
            setCurrentCustomerName('');
        }
    };

    // Action handlers
    const handlePayment = async () => {
        if (!selectedPaymentMethod) {
            setNotification({ type: 'error', message: "Select a payment method" });
            return;
        }
        const dataToSend = {
            billID: currentId,
            paymentMode: selectedPaymentMethod,
            amount: currentAmount
        };
        try {
            const { data } = await api.post('/Wallet/pay-my-bill', dataToSend);
            if (data.succeeded) {
                setNotification({ type: 'success', message: data.message || 'Paid successfully!' });
                setCurrentId('');
                setCurrentAmount('');
                closeModal('action');
            } else {
                setNotification({ type: 'error', message: data.message || "Error submitting" });
                setCurrentId('');
                setCurrentAmount('');
                closeModal('action');
            }
        } catch (error) {
            console.error("Error submitting payment:", error);
            setNotification({ type: 'error', message: "Error submitting" });
            setCurrentId('');
            setCurrentAmount('');
            closeModal('action');
        }
    };

    const handleViewBill = () => {
        navigate("/view-bill")
        closeModal('action');
    };

    return (
        <div>
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
                                        <h1 className="text-xl md:text-2xl font-semibold text-zinc-800">Bills</h1>
                                        <span className="bg-green-700 text-green-50 text-xs font-semibold px-2.5 py-2 rounded-full">
                                            {applications.length}
                                        </span>
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
                                            placeholder="Search bills..."
                                            className="w-full lg:w-[24rem] pl-10 pr-4 py-2 border border-zinc-300 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <button
                                            onClick={filterData}
                                            type="button"
                                            className="px-4 lg:mx-4 py-2 border border-zinc-300 text-sm font-medium rounded-xl text-zinc-700 bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
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
                                                <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('billId')}>
                                                    <div className="flex items-center justify-between">
                                                        Bill ID <span className={`sort-icon ${sortColumn === 'billId' ? 'active' : ''}`}>
                                                            {sortIcon('billId')}
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
                                                <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('customerType')}>
                                                    <div className="flex items-center justify-between">
                                                        Customer Type <span className={`sort-icon ${sortColumn === 'customerType' ? 'active' : ''}`}>
                                                            {sortIcon('customerType')}
                                                        </span>
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('dueDate')}>
                                                    <div className="flex items-center justify-between">
                                                        Due Date <span className={`sort-icon ${sortColumn === 'dueDate' ? 'active' : ''}`}>
                                                            {sortIcon('dueDate')}
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
                                            {sortedApplications.length === 0 ? (
                                                <tr>
                                                    <td colSpan="9" className="text-center py-10 text-zinc-500">No bills found.</td>
                                                </tr>
                                            ) : (
                                                sortedApplications.map(app => (
                                                    <tr key={app.id} className="bg-white border-b border-zinc-200 hover:bg-zinc-50 lg:h-20">
                                                        <td className="px-4 py-3 font-medium text-zinc-900">{app.sn}</td>
                                                        <td className="px-4 py-3 font-medium text-zinc-900 whitespace-nowrap">{app.billId}</td>
                                                        <td className="px-4 py-3">{app.customerName}</td>
                                                        <td className="px-4 py-3">{app.customerType}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap">{formatDate(app.dueDate)}</td>
                                                        <td className="px-4 py-3">{app.service}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap">{formatCurrency(app.amount)}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <span className={`px-3 py-1 border rounded-full text-xs font-medium inline-block ${getStatusClass(app.status)}`}>
                                                                {app.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <button
                                                                onClick={() => handleRowAction(app.billId, app.amount, app.customerName)}
                                                                type="button"
                                                                className="p-1 text-zinc-500 hover:text-zinc-700"
                                                            >
                                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                                </svg>
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
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10l3.293-3.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L10.586 14l-3.293-3.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>

                </div>
            </div>
            {isActionModalOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-end p-4 overflow-hidden">
                    <div className="w-full max-w-md h-full bg-white rounded-lg shadow ">
                        <div className="flex items-center justify-between p-4 border-b border-zinc-200 ">
                            <h3 className="text-xl font-semibold text-zinc-900">
                                Bill Actions

                            </h3>
                            <button
                                onClick={() => closeModal('action')}
                                aria-label="Close"
                                className="text-zinc-400 bg-transparent hover:bg-zinc-200 hover:text-zinc-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-zinc-600 dark:hover:text-white"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 011.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <p className="text-base text-zinc-500 dark:text-zinc-400">
                                {'{{{... can put bill details here }}}'}
                            </p>
                            <button
                                onClick={handleViewBill}
                                className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            >
                                View Bill
                            </button>
                            <button
                                onClick={handlePayment}
                                className="w-full text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                            >
                                Pay Bill
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {notification && (
                <div
                    className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg max-w-sm z-50 ${notification.type === 'success' ? 'bg-green-100 border border-green-400 text-green-800' : 'bg-red-100 border border-red-400 text-red-800'
                        }`}
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

export default Bills;