import React, { useState, useEffect, useMemo, useRef } from 'react';
import Sidebar from '../components/AgentSidebar';
import Topbar from '../components/AgentTopBar';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import AlatPayButton from '../components/AlatPayButton';
import useAuthStore from '../store/authStore';
import useAgentStore from '../store/useAgentStore';

// ─── Icons ───────────────────────────────────────────────────────────────────

const CheckIcon = ({ className = 'h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

const ChevronDownIcon = ({ className = 'h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);

const AlatIcon = () => (
    <span className="font-medium text-zinc-800 flex items-center gap-1">
        <img src="https://alat.ng/wp-content/uploads/2021/03/cropped-ALAT_By_Wema_Bank.jpg" alt="Alat Logo" className="w-10 h-10 mx-2 inline-block rounded-sm" />
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
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// ─── Constants ────────────────────────────────────────────────────────────────

const CUSTOMER_TYPES = ['Resident', 'Corporate'];

// ─── Component ────────────────────────────────────────────────────────────────

const SmartBinApplication = () => {
    const navigate = useNavigate();
    const Agent = useAgentStore.getState().agentInfo;
    const modalRef = useRef();

    // ── Table state ──
    const [applications, setApplications] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortColumn, setSortColumn] = useState('date');
    const [sortDirection, setSortDirection] = useState('dsc');
    const [currentPage, setCurrentPage] = useState(1);

    // ── Pagination — driven by meta.paging from the API ──
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const itemsPerPage = 10; // matches API default page size

    // ── Detail / modal state ──
    const [currentDataId, setCurrentDataId] = useState('');
    const [appDetails, setAppDetails] = useState({});
    const [modal, setModal] = useState(false);
    const [rowActionModal, setRowActionModal] = useState(false);
    const [viewApplicationModal, setViewApplicationModal] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [notification, setNotification] = useState(null);

    // ── Payment ──
    const [smartBinAmount, setSmartBinAmount] = useState(0);
    const [debitType, setDebitType] = useState('');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
    const paymentOptions = [{ id: 'card', text: 'Pay with Alat By Wema', icon: AlatIcon }];

    // ── Form dropdowns ──
    const [isCustomerOpen, setIsCustomerOpen] = useState(false);
    const [isCustomerListOpen, setIsCustomerListOpen] = useState(false);
    const [customerNameList, setCustomerNameList] = useState([]);

    // ── Form state ──
    const emptyForm = {
        streetName: '',
        closestLandmark: '',
        customerName: { text: '', value: '' },
        customerType: '',
        email: '',
        phoneNo: '',
        payerId: '',
        buildingType: '',
        houseNo: '',
        flatNo: '',
        lga: '',
        lawmaCustomerType: 'Existing',
    };
    const [formData, setFormData] = useState(emptyForm);
    const [isDisabled, setIsDisabled] = useState(true);
    const [selfRequest, setSelfRequest] = useState(true);

    const [options, setOptions] = useState({
        buildingTypes: ['Duplex', 'Bungalow', 'Block of Flats', 'Terrace', 'Detached', 'Semi-Detached', 'Other'],
        lgas: [],
        lawmaCustomerTypes: ['New', 'Existing'],
    });

    // ─── Notification auto-dismiss ─────────────────────────────────────────────

    useEffect(() => {
        if (!notification) return;
        const timer = setTimeout(() => setNotification(null), 5000);
        return () => clearTimeout(timer);
    }, [notification]);

    // ─── Fetch applications ────────────────────────────────────────────────────
    // API response shape:
    // {
    //   success: true,
    //   data: [...],
    //   meta: { paging: { total, page, pages, size } }
    // }

    const fetchData = async () => {
        try {
            const { data } = await api.get('/smartbin-applications', {
                params: { page: currentPage, size: itemsPerPage },
            });

            if (data.success) {
                const rows = (data.data ?? []).map((item, index) => ({
                    id: item.id,
                    sn: index + 1 + (currentPage - 1) * itemsPerPage,
                    orderId: item.orderID ?? '',
                    date: item.requestDate?.slice(0, 10) ?? '',
                    address: item.residentDetails ?? '',
                    status: item.statusName ?? '',
                    deliveredDate: item.deliveredDate ?? '',
                    deliveredBy: item.deliveredBy ?? '',
                    approvedDate: item.approvedDate ?? '',
                    customerName: item.residentFullName ?? '',
                    customerType: item.customerType ?? '',
                }));

                setApplications(rows);

                // ── Read pagination from meta.paging ──
                const paging = data.meta?.paging ?? {};
                setTotalItems(paging.total ?? 0);
                setTotalPages(paging.pages ?? 0);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage]);

    // ─── Sync appDetails when currentDataId changes ────────────────────────────

    useEffect(() => {
        const details = applications.find((item) => item.id === currentDataId);
        setAppDetails(details ?? {});
    }, [currentDataId, applications]);

    // ─── Fetch customer name list ──────────────────────────────────────────────
    // NOTE: Endpoint `/Agent/fetch-customer-name` does not exist on backend
    // Commenting out to prevent 404 errors. Form works without pre-populated customer names.

    // const fetchCustomerNameList = async () => {
    //     const isResident = formData.customerType === 'Resident';
    //     const isCorporate = formData.customerType === 'Corporate';
    //     try {
    //         const { data } = await api.get(`/Agent/fetch-customer-name?resident=${isResident}&corporate=${isCorporate}`);
    //         if (data.succeded) setCustomerNameList(data.data);
    //     } catch (error) {
    //         console.error('Error fetching customer name list:', error);
    //     }
    // };

    // useEffect(() => {
    //     fetchCustomerNameList();
    // }, [formData.customerType]);

    // ─── Fetch customer address when name selected ─────────────────────────────
    // NOTE: Endpoint `/Agent/fetch-customer-address` does not exist on backend
    // Commenting out to prevent 404 errors.

    // const fetchCustomerDetails = async () => {
    //     try {
    //         const { data } = await api.get(
    //             `/Agent/fetch-customer-address?customerType=${formData.customerType}&customerId=${formData.customerName.value}`
    //         );
    //         if (data.succeded) {
    //             setFormData((prev) => ({
    //                 ...prev,
    //                 streetName: data.data.address,
    //                 closestLandmark: data.data.closestLandMark,
    //                 email: data.data.emailAddress,
    //                 phoneNo: data.data.phoneNo,
    //                 payerId: data.data.payerId,
    //                 buildingType: data.data.buildingType,
    //                 houseNo: data.data.houseNo,
    //                 flatNo: data.data.flatNo,
    //                 lga: data.data.lga,
    //                 lawmaCustomerType: data.data.lawmaCustomerType,
    //             }));
    //         }
    //     } catch (error) {
    //         console.error('Error fetching customer details:', error);
    //     }
    // };

    // useEffect(() => {
    //     if (selfRequest && formData.customerName.value && formData.customerType) {
    //         fetchCustomerDetails();
    //     }
    // }, [formData.customerName.value, formData.customerType]);

    // ─── Fetch LGAs ───────────────────────────────────────────────────────────

    const fetchLga = async () => {
        try {
            const { data } = await api.get('/utility/get-lgas');
            if (data.succeeded) {
                setOptions((prev) => ({ ...prev, lgas: data.data.map((item) => item.text) }));
            }
        } catch (error) {
            console.error('Error fetching LGAs:', error);
        }
    };

    useEffect(() => {
        fetchLga();
    }, []);

    // ─── Fetch smart bin amount ────────────────────────────────────────────────

    const fetchSmartBinAmount = async () => {
        try {
            const response = await api.get('/agents/wallets');
            if (response.data.succeeded) {
                setSmartBinAmount(response.data.data.amountToDebit);
                setDebitType(response.data.data.debitType);
            }
        } catch (error) {
            console.error('Error fetching smart bin amount:', error);
        }
    };

    useEffect(() => {
        fetchSmartBinAmount();
    }, []);

    // ─── Computed / sorted table data ─────────────────────────────────────────

    const filteredApplications = useMemo(() => {
        if (!searchQuery) return applications;
        const lowerQuery = searchQuery.toLowerCase();
        return applications.filter(
            (app) =>
                app.orderId.toLowerCase().includes(lowerQuery) ||
                app.address.toLowerCase().includes(lowerQuery) ||
                app.status.toLowerCase().includes(lowerQuery) ||
                app.date.includes(lowerQuery)
        );
    }, [applications, searchQuery]);

    const sortedApplications = useMemo(() => {
        return [...filteredApplications].sort((a, b) => {
            let valA = a[sortColumn];
            let valB = b[sortColumn];
            if (typeof valA === 'string') { valA = valA.toLowerCase(); valB = valB.toLowerCase(); }
            if (sortColumn === 'date') { valA = new Date(valA); valB = new Date(valB); }
            let cmp = valA > valB ? 1 : valA < valB ? -1 : 0;
            return sortDirection === 'dsc' ? cmp * -1 : cmp;
        });
    }, [filteredApplications, sortColumn, sortDirection]);

    // ─── Table helpers ────────────────────────────────────────────────────────

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
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const getStatusClass = (status) => {
        switch ((status ?? '').toLowerCase()) {
            case 'pending':   return 'bg-zinc-100 text-zinc-800 border-zinc-300';
            case 'approved':  return 'bg-sky-100 text-sky-800 border-sky-300';
            case 'delivered': return 'bg-green-100 text-green-800 border-green-300';
            default:          return 'bg-zinc-100 text-zinc-800 border-zinc-300';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const parts = dateString.slice(0, 10).split('-');
        return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0].slice(-2)}` : dateString;
    };

    // ─── Action handlers ──────────────────────────────────────────────────────

    const filterData  = () => setNotification({ type: 'error', message: 'Coming soon..' });
    const exportData  = () => setNotification({ type: 'error', message: 'Coming soon..' });
    const applyAction = () => setModal(true);

    const handleRowAction = (appId) => {
        setCurrentDataId(appId);
        setRowActionModal(true);
    };

    const handleTrack = () => {
        localStorage.setItem('appId', currentDataId);
        navigate('/appmanager');
    };

    const handleBackgroundClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            setRowActionModal(false);
        }
    };

    // ─── Form helpers ─────────────────────────────────────────────────────────

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const setNewCustomerType = (type) => setFormData((prev) => ({ ...prev, customerType: type }));
    const setNewCustomerName = (type) => setFormData((prev) => ({ ...prev, customerName: type }));

    const cancelForm = () => {
        setFormData(emptyForm);
        setIsDisabled(true);
        setSelfRequest(true);
    };

    const closeForm = () => {
        setModal(false);
        setFormData(emptyForm);
        setIsDisabled(true);
        setSelfRequest(true);
    };

    const changeDetails = (e) => {
        e.preventDefault();
        setIsDisabled(!isDisabled);
        setSelfRequest(!selfRequest);
    };

    const submitApplication = (e) => {
        e.preventDefault();
        setModal(false);
        setIsPaymentModalOpen(true);
    };

    const handleBack = () => {
        const retain = isDisabled;
        setIsPaymentModalOpen(false);
        if (!retain) {
            setIsDisabled(false);
            setSelfRequest(false);
        }
        setModal(true);
    };

    // ─── Payment handlers ─────────────────────────────────────────────────────

    const handlePayment = async (response) => {
        setIsPaymentModalOpen(false);

        let ref, channel;
        const amount = smartBinAmount;

        if (selectedPaymentMethod === 'wallet') {
            ref = response.reference;
            channel = 'wallet';
        } else if (selectedPaymentMethod === 'card') {
            ref = response?.data?.reference;
            channel = 'card';
        }

        if (!ref || !amount || !channel) {
            setNotification({ type: 'error', message: 'Payment response missing required fields' });
            handleBack();
            return;
        }

        try {
            const { data } = await api.post('/Agent/agent-new-bin-application', {
                customerName: formData.customerName.value,
                customerType: formData.customerType,
                phoneNo: formData.phoneNo,
                emailAddress: formData.email,
                payerID: formData.payerId,
                useYourAddress: selfRequest,
                buildingType: formData.buildingType,
                houseNo: formData.houseNo,
                flatNo: formData.flatNo,
                address: formData.streetName,
                lga: formData.lga,
                landmark: formData.closestLandmark,
                lawmaCustomerType: formData.lawmaCustomerType,
                paymentType: channel,
                paidAmount: amount,
                transRef: ref,
            });

            if (data.succeeded) {
                setNotification({ type: 'success', message: 'Submitted successfully!' });
                fetchData(); // refresh the table
            } else {
                setNotification({ type: 'error', message: data.message || 'Error submitting' });
                handleBack();
            }
        } catch (error) {
            console.error('Error submitting application:', error);
            setNotification({ type: 'error', message: 'Error submitting' });
            handleBack();
        }
    };

    const handlePaymentWithWallet = async () => {
        try {
            const response = await api.post('/Wallet/debit-wallet', {
                userId: useAuthStore.getState().token,
                drAccountNo: Agent.accountNo,
                amount: smartBinAmount,
                narration: 'Smart Bin Application Payment',
                paymentPurpose: 'Smart Bin Application',
            });
            const data = response.data;

            if (data.succeeded) {
                const parts = data.message.split('|');
                const successRef = parts.length > 1 ? parts[1] : parts[0];
                await handlePayment({ reference: successRef, channel: 'wallet' });
                setNotification({ type: 'success', message: 'Payment successful!' });
            } else {
                setNotification({ type: 'error', message: data.message || 'Error processing wallet payment' });
            }
        } catch (error) {
            console.error('Wallet payment error:', error);
            setNotification({ type: 'error', message: 'Error processing wallet payment' });
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="flex sans h-screen max-w-screen">
            <Sidebar addkey="1" />
            <div className="bg-zinc-100 min-h-screen flex flex-col flex-1 overflow-y-auto">
                <Topbar />

                <div className="bg-zinc-100 font-sans">
                    <main className="p-4 md:p-10">
                        <div className="p-5 md:p-8 rounded-lg w-full mx-auto">

                            {/* ── Header ── */}
                            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-xl md:text-2xl font-semibold text-zinc-800">Applications</h1>
                                    <span className="bg-green-700 text-green-50 text-xs font-semibold px-2.5 py-2 rounded-full">
                                        {totalItems}
                                    </span>
                                </div>
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

                            {/* ── Search and Actions ── */}
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
                                        placeholder="Search members..."
                                        className="w-full lg:w-[24rem] pl-10 pr-4 py-2 border border-zinc-300 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <button onClick={filterData} type="button" className="px-4 lg:mx-4 py-2 border border-zinc-300 text-sm font-medium rounded-xl text-zinc-700 bg-white hover:bg-zinc-50">Filter</button>
                                    <button onClick={exportData} type="button" className="px-4 py-2 mx-4 border border-zinc-300 lg:mx-0 text-sm font-medium rounded-xl text-zinc-700 bg-white hover:bg-zinc-50">Export</button>
                                </div>
                            </div>

                            {/* ── Table ── */}
                            <div className="table-container border border-zinc-200 rounded-2xl">
                                <table className="w-full min-w-[768px] text-sm text-left text-zinc-600">
                                    <thead className="font-light text-zinc-700 uppercase bg-white">
                                        <tr>
                                            {[
                                                { key: 'sn',           label: 'S/N' },
                                                { key: 'customerName', label: 'Name' },
                                                { key: 'customerType', label: 'Customer Type' },
                                                { key: 'orderId',      label: 'Order ID' },
                                                { key: 'date',         label: 'Date' },
                                                { key: 'address',      label: 'Address' },
                                                { key: 'status',       label: 'Status' },
                                            ].map(({ key, label }) => (
                                                <th key={key} scope="col" className="px-4 py-3" role="button" onClick={() => sortBy(key)}>
                                                    <div className="flex items-center justify-between">
                                                        {label}
                                                        <span className={`sort-icon ${sortColumn === key ? 'active' : ''}`}>{sortIcon(key)}</span>
                                                    </div>
                                                </th>
                                            ))}
                                            <th scope="col" className="px-4 py-3 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedApplications.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="text-center py-10 text-zinc-500">No applications found.</td>
                                            </tr>
                                        ) : (
                                            sortedApplications.map((app) => (
                                                <tr key={app.id} className="bg-white border-b border-zinc-200 hover:bg-zinc-50 lg:h-20">
                                                    <td className="px-4 py-3 font-medium text-zinc-900">{app.sn}</td>
                                                    <td className="px-4 py-3 font-medium text-zinc-900">{app.customerName}</td>
                                                    <td className="px-4 py-3 font-medium text-zinc-900">{app.customerType}</td>
                                                    <td className="px-4 py-3 font-medium text-zinc-900 whitespace-nowrap">{app.orderId}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(app.date)}</td>
                                                    <td className="px-4 py-3">{app.address}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className={`px-3 py-1 border rounded-full text-xs font-medium inline-block ${getStatusClass(app.status)}`}>
                                                            {app.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button onClick={() => handleRowAction(app.id)} type="button" className="p-1 text-zinc-500 hover:text-zinc-700">
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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

                            {/* ── Pagination ── */}
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
                                        className="px-3 mr-4 py-2 text-sm font-medium text-zinc-500 bg-white border border-zinc-300 hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => changePage(currentPage + 1)}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        type="button"
                                        className="px-3 py-2 text-sm font-medium text-zinc-50 bg-green-700 border border-zinc-300 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>

                {/* ── Row action mini-menu ── */}
                {rowActionModal && (
                    <div onClick={handleBackgroundClick} className="fixed inset-0 bg-black/40 z-50 font-sans flex lg:justify-end justify-center items-center lg:items-center min-h-screen overflow-y-auto p-4">
                        <div ref={modalRef} onClick={(e) => e.stopPropagation()} className="max-w-4xl p-4 lg:mr-14 bg-white flex rounded-xl shadow-xl flex-col">
                            <p onClick={() => setViewApplicationModal(true)} className="p-2 cursor-pointer">View</p>
                            <p className="p-2 cursor-pointer" onClick={handleTrack}>Track application</p>
                        </div>
                    </div>
                )}

                {/* ── View Application Drawer ── */}
                {viewApplicationModal && (
                    <div className="fixed inset-0 bg-black/20 z-50 font-sans flex lg:justify-end justify-center items-center lg:items-center min-h-screen overflow-y-auto">
                        <aside className={`fixed top-0 right-0 z-50 lg:h-screen h-full lg:w-[550px] w-full bg-white flex flex-col transform transition-transform delay-200 ease-in-out duration-1000 ${viewApplicationModal ? 'translate-x-0' : 'translate-x-full'}`}>
                            <div className="p-6 border-b border-zinc-200">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-semibold text-zinc-800">Application details</h2>
                                    <button onClick={() => { setViewApplicationModal(false); setRowActionModal(false); }} className="text-zinc-500 hover:text-black text-2xl">&times;</button>
                                </div>
                            </div>
                            <div className="p-6 flex flex-col gap-6">
                                {[
                                    { label: 'OrderID',       value: appDetails.orderId },
                                    { label: 'Date',          value: formatDate(appDetails.date) },
                                    { label: 'Name',          value: appDetails.customerName },
                                    { label: 'Customer Type', value: appDetails.customerType },
                                    { label: 'Address',       value: appDetails.address },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex justify-between">
                                        <span className="text-zinc-500">{label}</span>
                                        <span className="font-semibold text-zinc-800 text-right">{value}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-500">Status</span>
                                    <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-300 rounded-full text-sm">{appDetails.status}</span>
                                </div>
                                {appDetails.status === 'APPROVED' && (
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">Approval Date</span>
                                        <span className="font-semibold text-zinc-800">{appDetails.approvedDate}</span>
                                    </div>
                                )}
                                {appDetails.status === 'DELIVERED' && (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">Delivered on</span>
                                            <span className="font-semibold text-zinc-800">{appDetails.deliveredDate}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">Delivered by</span>
                                            <span className="font-semibold text-zinc-800">{appDetails.deliveredBy}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </aside>
                    </div>
                )}

                {/* ── Apply for Smart Bin Form Modal ── */}
                {modal && (
                    <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-lg z-50 font-sans flex lg:items-center justify-center min-h-screen overflow-y-auto p-4">
                        <main className="w-full max-w-7xl bg-white">
                            <div className="shadow-lg">
                                <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-200 p-6 bg-zinc-400/20">
                                    <h2 className="text-xl sm:text-2xl font-semibold text-zinc-800">Apply for Smart Bin</h2>
                                    <button onClick={closeForm} aria-label="Close" className="text-red-600 hover:text-zinc-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <form onSubmit={submitApplication} className="p-6 bg-white">
                                    <div className="grid grid-cols-1 md:grid-cols-6 gap-x-5 gap-y-6">

                                        {/* Customer Type */}
                                        <div className="md:col-span-2 relative">
                                            <label className="block text-sm font-medium text-zinc-700 mb-1">Customer type</label>
                                            <button
                                                type="button"
                                                className={`w-full lg:p-4 p-2 pr-8 border border-zinc-300 rounded-2xl focus:ring focus:outline-none focus:ring-green-700 bg-white text-left flex justify-between items-center ${!formData.customerType ? 'text-zinc-400' : 'text-zinc-900'}`}
                                                onClick={() => setIsCustomerOpen(!isCustomerOpen)}
                                            >
                                                {formData.customerType || 'Select customer type'}
                                                <ChevronDownIcon className={`h-4 w-4 text-zinc-400 transform ${isCustomerOpen ? 'rotate-180' : ''}`} />
                                            </button>
                                            {isCustomerOpen && (
                                                <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none" role="listbox">
                                                    {CUSTOMER_TYPES.map((type, index) => (
                                                        <li key={`${type}-${index}`} className="text-zinc-900 cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-zinc-50" role="option"
                                                            onClick={() => { setNewCustomerType(type); setIsCustomerOpen(false); }}>
                                                            <span className="block truncate">{type}</span>
                                                            {formData.customerType === type && (
                                                                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-green-600"><CheckIcon className="h-5 w-5" /></span>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>

                                        {/* Customer Name */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-zinc-700 mb-1">Customer name</label>
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    className={`w-full lg:p-4 p-2 pr-8 border border-zinc-300 rounded-2xl focus:ring focus:outline-none focus:ring-green-700 bg-white text-left flex justify-between items-center ${!formData.customerName.text ? 'text-zinc-400' : 'text-zinc-900'}`}
                                                    onClick={() => setIsCustomerListOpen(!isCustomerListOpen)}
                                                >
                                                    {formData.customerName.text || 'Select customer name'}
                                                    <ChevronDownIcon className={`h-4 w-4 text-zinc-400 transform ${isCustomerListOpen ? 'rotate-180' : ''}`} />
                                                </button>
                                                {isCustomerListOpen && (
                                                    <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none" role="listbox">
                                                        {customerNameList.map((type, index) => (
                                                            <li key={`${type.value}-${index}`} className="text-zinc-900 cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-zinc-50" role="option"
                                                                onClick={() => { setNewCustomerName(type); setIsCustomerListOpen(false); }}>
                                                                <span className="block truncate">{type.text}</span>
                                                                {formData.customerName?.value === type.value && (
                                                                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-green-600"><CheckIcon className="h-5 w-5" /></span>
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div className="md:col-span-2">
                                            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1">Email address</label>
                                            <input type="email" id="email" name="email" disabled={isDisabled} style={{ backgroundColor: isDisabled ? '#f4f4f5' : 'white' }} value={formData.email || ''} onChange={handleInputChange} required className="form-input w-full border border-zinc-300 p-4 rounded-xl" />
                                        </div>

                                        {/* Phone */}
                                        <div className="md:col-span-2">
                                            <label htmlFor="phoneNo" className="block text-sm font-medium text-zinc-700 mb-1">Phone Number</label>
                                            <input type="tel" id="phoneNo" name="phoneNo" disabled={isDisabled} style={{ backgroundColor: isDisabled ? '#f4f4f5' : 'white' }} value={formData.phoneNo || ''} onChange={handleInputChange} required className="form-input w-full border border-zinc-300 p-4 rounded-xl" />
                                        </div>

                                        {/* Payer ID */}
                                        <div className="md:col-span-2">
                                            <label htmlFor="payerId" className="block text-sm font-medium text-zinc-700 mb-1">Payer ID</label>
                                            <input type="text" id="payerId" name="payerId" disabled={isDisabled} style={{ backgroundColor: isDisabled ? '#f4f4f5' : 'white' }} value={formData.payerId || ''} onChange={handleInputChange} required className="form-input w-full border border-zinc-300 p-4 rounded-xl" />
                                        </div>

                                        {/* Use customer address checkbox */}
                                        <div className="md:col-span-6 mt-1 mb-3">
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" id="not" name="not" onChange={changeDetails} value={selfRequest} checked={isDisabled} className="accent-green-700 focus:ring-green-500 h-4 w-4 border-zinc-300 rounded" />
                                                <label htmlFor="not" className="text-sm font-medium text-green-700 hover:text-green-600 hover:underline">Use customer Address</label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-6 gap-x-5 gap-y-6 mt-12">
                                        {/* Building Type */}
                                        <div className="md:col-span-2">
                                            <label htmlFor="buildingType" className="block text-sm font-medium text-zinc-700 mb-1">Building Type</label>
                                            <select id="buildingType" name="buildingType" disabled={isDisabled} style={{ backgroundColor: isDisabled ? '#f4f4f5' : 'white' }} value={formData.buildingType || ''} onChange={handleInputChange} required className="form-select w-full border border-zinc-300 p-3 rounded-xl">
                                                <option disabled value="">Building Type</option>
                                                {options.buildingTypes.map((o) => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                        </div>

                                        {/* House No */}
                                        <div className="md:col-span-2">
                                            <label htmlFor="houseNo" className="block text-sm font-medium text-zinc-700 mb-1">House number</label>
                                            <input type="text" id="houseNo" name="houseNo" disabled={isDisabled} style={{ backgroundColor: isDisabled ? '#f4f4f5' : 'white' }} value={formData.houseNo || ''} onChange={handleInputChange} placeholder="House Number" required className="form-input w-full border border-zinc-300 p-4 rounded-xl" />
                                        </div>

                                        {/* Flat No */}
                                        <div className="md:col-span-2">
                                            <label htmlFor="flatNo" className="block text-sm font-medium text-zinc-700 mb-1">Flat number</label>
                                            <input type="text" id="flatNo" name="flatNo" disabled={isDisabled} style={{ backgroundColor: isDisabled ? '#f4f4f5' : 'white' }} value={formData.flatNo || ''} onChange={handleInputChange} placeholder="Flat Number" required className="form-input w-full border border-zinc-300 p-4 rounded-xl" />
                                        </div>

                                        {/* Street address */}
                                        <div className="md:col-span-6">
                                            <label htmlFor="streetName" className="block text-sm font-medium text-zinc-700 mb-1">Address <span className="text-red-500">*</span></label>
                                            <input id="streetName" name="streetName" disabled={isDisabled} style={{ backgroundColor: isDisabled ? '#f4f4f5' : 'white' }} value={formData.streetName || ''} onChange={handleInputChange} required placeholder="Enter your Address" className="w-full p-4 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm placeholder-zinc-400" />
                                        </div>

                                        {/* LGA */}
                                        <div className="md:col-span-2">
                                            <label htmlFor="lga" className="block text-sm font-medium text-zinc-700 mb-1">Local Government</label>
                                            <select id="lga" name="lga" disabled={isDisabled} style={{ backgroundColor: isDisabled ? '#f4f4f5' : 'white' }} value={formData.lga || ''} onChange={handleInputChange} required className="form-select w-full border border-zinc-300 p-4 rounded-xl">
                                                <option disabled value="">Select Local Government</option>
                                                {options.lgas.map((o) => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                        </div>

                                        {/* Closest Landmark */}
                                        <div className="md:col-span-2">
                                            <label htmlFor="closestLandmark" className="block text-sm font-medium text-zinc-700 mb-1">Closest Landmark</label>
                                            <input type="text" id="closestLandmark" name="closestLandmark" disabled={isDisabled} style={{ backgroundColor: isDisabled ? '#f4f4f5' : 'white' }} value={formData.closestLandmark || ''} onChange={handleInputChange} placeholder="Street name" className="w-full p-4 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm placeholder-zinc-400" />
                                        </div>

                                        {/* LAWMA Customer Type */}
                                        <div className="md:col-span-2">
                                            <label htmlFor="lawmaCustomerType" className="block text-sm font-medium text-zinc-700 mb-1">LAWMA Customer type</label>
                                            <select id="lawmaCustomerType" name="lawmaCustomerType" disabled={isDisabled} style={{ backgroundColor: isDisabled ? '#f4f4f5' : 'white' }} value={formData.lawmaCustomerType || ''} onChange={handleInputChange} required className="form-select w-full border border-zinc-300 p-4 rounded-xl">
                                                <option disabled value="">Select Customer Type</option>
                                                {options.lawmaCustomerTypes.map((o) => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-8 mt-12 mb-4">
                                        <button type="button" onClick={cancelForm} className="px-5 py-2 bg-white border border-green-700 rounded-md shadow-sm text-sm font-medium text-green-700 hover:bg-zinc-50">Cancel</button>
                                        <button type="submit" className="px-6 py-2 bg-green-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700">Next</button>
                                    </div>
                                </form>
                            </div>
                        </main>
                    </div>
                )}
            </div>

            {/* ── Payment Modal ── */}
            {isPaymentModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content lg:p-8">
                        <div className="flex justify-between items-center py-6 mx-8 border-b border-zinc-200">
                            <h3 className="text-lg font-semibold text-zinc-800">Select Payment Method</h3>
                            <button onClick={() => setIsPaymentModalOpen(false)} aria-label="Close" className="text-zinc-700 hover:text-red-600">
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="py-6 space-y-4">
                            <label className="px-6 py-4 rounded-lg flex items-center gap-4">
                                <WalletIcon />
                                <span className="text-sm font-medium text-zinc-800 flex-grow">Pay from wallet (₦{smartBinAmount.toLocaleString()})</span>
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
                                    amount={smartBinAmount}
                                    onTransaction={handlePayment}
                                    buttonText="Pay Now with ALATPay"
                                    buttonClassName="btn btn-primary w-full"
                                />
                            ) : (
                                <button onClick={handlePaymentWithWallet} className="btn btn-primary w-full">Make Payment</button>
                            )}
                            <button onClick={handleBack} className="w-full text-center font-medium text-green-700 hover:text-green-900 py-2">Go back</button>
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
                        <button onClick={() => setNotification(null)} className={`ml-4 text-xl font-semibold leading-none focus:outline-none ${notification.type === 'success' ? 'text-green-800 hover:text-green-900' : 'text-red-800 hover:text-red-900'}`} aria-label="Close notification">&times;</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SmartBinApplication;