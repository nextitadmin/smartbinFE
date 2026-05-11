import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/AgentSidebar';
import Topbar from '../components/AgentTopBar';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

// ─── Icons ────────────────────────────────────────────────────────────────────

const PlusIcon = ({ className = 'h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const MagnifyingGlassIcon = ({ className = 'h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
);

const ChevronDownIcon = ({ className = 'h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);

const ChevronUpDownIcon = ({ className = 'h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
    </svg>
);

const ArrowUpIcon = ({ className = 'h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
    </svg>
);

const ArrowDownIcon = ({ className = 'h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
    </svg>
);

const XMarkIcon = ({ className = 'h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

const EllipsisVerticalIcon = ({ className = 'h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
    </svg>
);

const CheckCircleIconSolid = ({ className = 'h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.06 0l4.001-5.497Z" clipRule="evenodd" />
    </svg>
);

const ExclamationTriangleIconSolid = ({ className = 'h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
    </svg>
);

const LoadingSpinnerIcon = ({ className = 'h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${className} animate-spin`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
);

const CheckIcon = ({ className = 'h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

// ─── Constants ────────────────────────────────────────────────────────────────

const REPORT_TYPES = [
    { name: 'Payment History', value: 'payment' },
    { name: 'Bin Request',     value: 'bin' },
    { name: 'Waste pickup',    value: 'waste' },
];

const CUSTOMER_TYPES = ['Resident', 'Corporate'];

const selectedReportType = (report) => {
    switch (report) {
        case 'Payment History': return 'payment';
        case 'Bin Request':     return 'bin';
        case 'Waste pickup':    return 'waste';
        default:                return '';
    }
};

const formatGenerationDate = (isoDateString) => {
    if (!isoDateString) return 'N/A';
    try {
        const date = new Date(isoDateString);
        const datePart = date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
        const timePart = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        return `${datePart} @ ${timePart}`;
    } catch {
        return 'Invalid Date';
    }
};

// ─── Component ────────────────────────────────────────────────────────────────

const ReportsPage = () => {
    const navigate = useNavigate();

    const [reports, setReports] = useState([
        { residentID: null, customerName: 'Boyega John', reportTitle: 'second bin report5',  reportType: 'bin',   period: 'Apr 25 - Jun 25', requestBy: 'Emmanuel Akanji', generationDate: '2025-06-30T09:29:54.718499', id: '08ddb7b0-4a6c-45f5-865b-bf14a4e331ff', isDeleted: false },
        { residentID: null, customerName: 'Boyega John', reportTitle: 'second bin report5',  reportType: 'bin',   period: 'Apr 25 - Jun 25', requestBy: 'Emmanuel Akanji', generationDate: '2025-06-30T09:28:14.366719', id: '08ddb7b0-0e9d-4462-8625-a87b3433b480', isDeleted: false },
        { residentID: null, customerName: 'Boyega John', reportTitle: 'second bin report4',  reportType: 'bin',   period: 'Apr 25 - Jun 25', requestBy: 'Emmanuel Akanji', generationDate: '2025-06-30T09:27:14.578433', id: '08ddb7af-eb09-41f0-8afd-b9228df93505', isDeleted: false },
        { residentID: null, customerName: 'Boyega John', reportTitle: 'Second waste report', reportType: 'waste', period: 'Apr 25 - Jun 25', requestBy: 'Emmanuel Akanji', generationDate: '2025-06-30T09:25:40.457887', id: '08ddb7af-b2e1-441c-8bc2-92323caa48d0', isDeleted: false },
        { residentID: null, customerName: 'Boyega John', reportTitle: 'Firast waste report', reportType: 'waste', period: 'Apr 25 - May 25', requestBy: 'Emmanuel Akanji', generationDate: '2025-06-30T08:59:32.905317', id: '08ddb7ac-0c8b-4770-819e-3aef5766f80a', isDeleted: false },
        { residentID: null, customerName: 'Boyega John', reportTitle: 'Smart bin report',    reportType: 'bin',   period: 'Apr 25 - Jun 25', requestBy: 'Emmanuel Akanji', generationDate: '2025-06-30T00:52:57.319515', id: '08ddb768-129e-488d-813f-f07f654bfbff', isDeleted: false },
        { residentID: null, customerName: 'Boyega John', reportTitle: 'second bin report3',  reportType: 'bin',   period: 'Apr 25 - Jun 25', requestBy: 'Emmanuel Akanji', generationDate: '2025-06-30T00:51:09.109415', id: '08ddb767-d21e-47ba-8db3-e7e7daea83e4', isDeleted: false },
        { residentID: null, customerName: 'Boyega John', reportTitle: 'second bin report2',  reportType: 'bin',   period: 'Apr 25 - Jun 25', requestBy: 'Emmanuel Akanji', generationDate: '2025-06-30T00:48:48.5207',   id: '08ddb767-7e52-4722-8b99-542e9ce8ffb5', isDeleted: false },
        { residentID: null, customerName: 'Boyega John', reportTitle: 'second bin report',   reportType: 'bin',   period: 'Apr 25 - May 25', requestBy: 'Emmanuel Akanji', generationDate: '2025-06-30T00:47:41.106245', id: '08ddb767-5624-4655-8ac2-199bff439f38', isDeleted: false },
        { residentID: null, customerName: 'Boyega John', reportTitle: 'First-Bin Report',    reportType: 'bin',   period: 'Apr 25 - May 25', requestBy: 'Emmanuel Akanji', generationDate: '2025-06-29T19:43:46.8082',   id: '08ddb73c-e1a6-4b36-8499-f8821c6a48aa', isDeleted: false },
    ]);

    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isCustomerOpen, setIsCustomerOpen] = useState(false);
    const [isCustomerListOpen, setIsCustomerListOpen] = useState(false);
    const [customerNameList, setCustomerNameList] = useState([]);

    const [notification, setNotification] = useState({ message: '', type: '', visible: false });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterReportType, setFilterReportType] = useState('All');
    const [filterDate, setFilterDate] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'generationDate', direction: 'descending' });

    const [newReportName, setNewReportName] = useState('');
    const [newCustomerName, setNewCustomerName] = useState('');
    const [newReportType, setNewReportType] = useState('');
    const [newCustomerType, setNewCustomerType] = useState('');
    const [newReportStartDate, setNewReportStartDate] = useState('');
    const [newReportEndDate, setNewReportEndDate] = useState('');

    // ─── Fetch reports ────────────────────────────────────────────────────────
    // FIX: was a comma after the function body, making it part of a comma expression
    // with the useEffect call below it — changed to semicolon.

    const fetchReportsAPI = async () => {
        try {
            const { data } = await api.get('/agent/reports');
            // Response: { success, data: { reports: [], paging: { totalReports, page, pages, size } } }
            if (data.success) {
                const reportList = (data.data.reports ?? []).map((item) => ({
                    id:             item.id,
                    reportType:     item.reportType,
                    reportTitle:    item.reportTitle,
                    period:         item.period,
                    generationDate: item.generationDate,
                    customerName:   item.customerName,
                    requestBy:      item.requestBy,
                }));
                setReports(reportList);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        }
    }; // ← semicolon, not comma

    useEffect(() => {
        fetchReportsAPI();
        setIsLoading(false);
    }, []);

    // ─── Notification helper ──────────────────────────────────────────────────

    const showNotification = (message, type) => {
        setNotification({ message, type, visible: true });
        setTimeout(() => setNotification({ message: '', type: '', visible: false }), 3000);
    };

    // ─── Table processing ─────────────────────────────────────────────────────

    const processedReports = useMemo(() => {
        let filtered = [...reports];

        if (searchTerm) {
            filtered = filtered.filter((report) =>
                (report.reportTitle ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (report.reportType ?? '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterReportType !== 'All') {
            filtered = filtered.filter((report) => report.reportType === filterReportType);
        }

        if (filterDate) {
            filtered = filtered.filter((report) =>
                formatGenerationDate(report.generationDate).toLowerCase().includes(filterDate.toLowerCase())
            );
        }

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let valA = a[sortConfig.key];
                let valB = b[sortConfig.key];
                if (sortConfig.key === 'generationDate') {
                    valA = new Date(valA);
                    valB = new Date(valB);
                }
                if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [reports, searchTerm, filterReportType, filterDate, sortConfig]);

    const requestSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending',
        }));
    };

    // ─── Modal helpers ────────────────────────────────────────────────────────

    const handleOpenModal = () => {
        setNewReportName('');
        setNewReportType('');
        setNewCustomerType('');
        setNewCustomerName('');
        setNewReportStartDate('');
        setNewReportEndDate('');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const formatPeriod = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return `${start.toLocaleDateString('en-US', { month: 'long' })} ${start.toLocaleDateString('en-US', { day: '2-digit' })} - ${end.toLocaleDateString('en-US', { month: 'long' })} ${end.toLocaleDateString('en-US', { day: '2-digit' })}`;
    };

    const handleGenerateReportSubmit = async (e) => {
        e.preventDefault();

        if (!newReportName || !newReportType || !newReportStartDate || !newReportEndDate || !newCustomerType || !newCustomerName) {
            showNotification('Please fill all fields in the report form.', 'error');
            return;
        }
        if (new Date(newReportStartDate) > new Date(newReportEndDate)) {
            showNotification('Start date cannot be after end date.', 'error');
            return;
        }

        setIsGeneratingReport(true);
        const selectedType = selectedReportType(newReportType); // 'payment' | 'bin' | 'waste'

        try {
            // POST /api/v1/agent/reports
            const { data } = await api.post('/agent/reports', {
                reportName:   newReportName,
                customerType: newCustomerType,
                customerName: newCustomerName,
                type:         selectedType,
                startDate:    new Date(newReportStartDate).toISOString(),
                endDate:      new Date(newReportEndDate).toISOString(),
            });

            if (data.success) {
                showNotification(data.message || 'Report generated successfully!', 'success');
                handleCloseModal();
                const reportObject = {
                    period:         formatPeriod(newReportStartDate, newReportEndDate),
                    generationDate: formatGenerationDate(new Date()),
                    title:          newReportName,
                    data:           data.data,
                };
                if (selectedType === 'bin') {
                    localStorage.setItem('binreport', JSON.stringify(reportObject));
                    navigate('/smartbinreport');
                } else if (selectedType === 'waste') {
                    localStorage.setItem('wastereport', JSON.stringify(reportObject));
                    navigate('/wastereport');
                }
                // refresh the list so the new report appears
                fetchReportsAPI();
            } else {
                showNotification(data.message || 'Failed to generate report.', 'error');
            }
        } catch (error) {
            showNotification(error.message || 'An error occurred while generating the report.', 'error');
        } finally {
            setIsGeneratingReport(false);
        }
    };

    // ─── Sort icon ────────────────────────────────────────────────────────────

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return <ChevronUpDownIcon className="ml-1 h-4 w-4 text-zinc-400" />;
        if (sortConfig.direction === 'ascending') return <ArrowUpIcon className="ml-1 h-4 w-4 text-green-700" />;
        return <ArrowDownIcon className="ml-1 h-4 w-4 text-green-700" />;
    };

    const tableHeaders = [
        { key: 'reportTitle',    label: 'Report Title' },
        { key: 'customerName',   label: 'Customer Name' },
        { key: 'generationDate', label: 'Generation Date' },
        { key: 'period',         label: 'Period' },
        { key: 'reportType',     label: 'Report Type' },
    ];

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div>
            <div className="flex sans h-screen">
                <Sidebar addkey="1" />
                <div className="flex-1 bg-zinc-100 min-h-screen overflow-y-auto">
                    <Topbar />
                    <div className="bg-zinc-100 font-sans">
                        <main className="p-4 md:px-4">
                            <div className="p-4 md:p-8 font-sans">

                                {/* ── Toast Notification ── */}
                                {notification.visible && (
                                    <div className={`fixed top-5 right-5 z-50 p-4 rounded-md shadow-lg text-white flex items-center space-x-2 ${notification.type === 'success' ? 'bg-green-700' : 'bg-red-500'}`}>
                                        {notification.type === 'success'
                                            ? <CheckCircleIconSolid className="h-5 w-5" />
                                            : <ExclamationTriangleIconSolid className="h-5 w-5" />
                                        }
                                        <span>{notification.message}</span>
                                        <button onClick={() => setNotification((n) => ({ ...n, visible: false }))} className="ml-auto">
                                            <XMarkIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                )}

                                {/* ── Header ── */}
                                <header className="mb-6 flex flex-col sm:flex-row justify-between items-center">
                                    <div>
                                        <h1 className="text-2xl md:text-3xl font-semibold text-zinc-800">Reports</h1>
                                        <p className="text-zinc-500 text-lg font-light">Generate comprehensive reports to view your activities</p>
                                    </div>
                                    {processedReports.length > 0 && (
                                        <button onClick={handleOpenModal} className="mt-4 sm:mt-0 bg-green-700 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center">
                                            <PlusIcon className="mr-2 h-5 w-5" />
                                            Generate Report
                                        </button>
                                    )}
                                </header>

                                {/* ── Filters ── */}
                                <div className="mb-6 rounded-lg">
                                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                                        <div className="relative flex-grow md:max-w-xs">
                                            <input
                                                type="text"
                                                placeholder="Search here..."
                                                className="w-full p-2 pl-10 border border-zinc-300 bg-white rounded-lg focus:ring focus:outline-none focus:ring-green-700 focus:border-green-700"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
                                        </div>
                                        <div className="flex items-center text-sm text-zinc-600 md:ml-auto">Filter by:</div>
                                        <div className="relative">
                                            <select
                                                className="w-full md:w-auto p-2 pr-8 border border-zinc-300 text-zinc-700 text-sm rounded-lg appearance-none focus:ring focus:outline-none focus:ring-green-700 focus:border-green-700 bg-white"
                                                value={filterReportType}
                                                onChange={(e) => setFilterReportType(e.target.value)}
                                            >
                                                <option value="All">Report Types</option>
                                                {REPORT_TYPES.map((type) => (
                                                    <option key={type.value} value={type.value}>{type.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Filter by Date"
                                                className="w-full md:w-auto p-2 text-sm border border-zinc-300 bg-white rounded-lg focus:ring focus:outline-none focus:ring-green-700 focus:border-green-700"
                                                value={filterDate}
                                                onChange={(e) => setFilterDate(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* ── Table ── */}
                                <div className="overflow-x-auto">
                                    <h2 className="text-lg font-semibold text-zinc-700 p-4">All Reports</h2>

                                    {isLoading ? (
                                        <div className="p-6 text-center text-zinc-500 flex items-center justify-center">
                                            <LoadingSpinnerIcon className="h-6 w-6 mr-2" /> Loading reports...
                                        </div>
                                    ) : processedReports.length === 0 ? (
                                        <div className="flex flex-col justify-center items-center mt-20">
                                            <div className="max-w-xl w-full flex flex-col items-center justify-center text-center">
                                                <h2 className="text-xl mb-1 sans">No Reports to show</h2>
                                                <p className="text-zinc-400 mt-2 font-light">There are no reports to show</p>
                                                <button onClick={handleOpenModal} className="text-zinc-600 pointer lg:w-1/2 rounded-xl text-lg mb-6 flex flex-row items-center font-light justify-center p-3">
                                                    <PlusIcon className="mr-2 h-5 w-5" />
                                                    Generate Report
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-2xl">
                                            <table className="w-full min-w-[700px] m-4 bg-white">
                                                <thead className="border-b border-zinc-200">
                                                    <tr>
                                                        <th className="lg:p-6 p-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider w-12">S/N</th>
                                                        {tableHeaders.map((header) => (
                                                            <th
                                                                key={header.key}
                                                                className="lg:p-6 p-3 text-left text-sm font-medium text-zinc-500 uppercase tracking-wider cursor-pointer hover:bg-zinc-50"
                                                                onClick={() => header.key !== 'period' && requestSort(header.key)}
                                                            >
                                                                <div className="flex items-center">
                                                                    {header.label}
                                                                    {header.key !== 'period' && <SortIcon columnKey={header.key} />}
                                                                </div>
                                                            </th>
                                                        ))}
                                                        <th className="lg:p-6 p-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-zinc-200">
                                                    {processedReports.map((report, index) => (
                                                        <tr key={report.id} className="hover:bg-zinc-50 transition-colors duration-150">
                                                            <td className="lg:p-6 p-3 text-sm text-zinc-500">{index + 1}.</td>
                                                            <td className="lg:p-6 p-3 text-sm text-zinc-900 whitespace-nowrap">{report.reportTitle}</td>
                                                            <td className="lg:p-6 p-3 text-sm text-zinc-900 whitespace-nowrap">{report.customerName}</td>
                                                            <td className="lg:p-6 p-3 text-sm text-zinc-500 whitespace-nowrap">{formatGenerationDate(report.generationDate)}</td>
                                                            <td className="lg:p-6 p-3 text-sm text-zinc-500 whitespace-nowrap">{report.period}</td>
                                                            <td className="lg:p-6 p-3 text-sm text-zinc-500 whitespace-nowrap">{report.reportType}</td>
                                                            <td className="lg:p-6 p-3 text-sm text-zinc-500">
                                                                <button className="text-zinc-400 hover:text-zinc-600">
                                                                    <EllipsisVerticalIcon className="h-5 w-5" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>

                                {/* ── Generate Report Modal ── */}
                                {isModalOpen && (
                                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-40">
                                        <div className="bg-white rounded-2xl shadow-xl px-8 py-12 w-full max-w-xl max-h-[90vh] overflow-y-auto">
                                            <div className="flex justify-between items-center mb-10">
                                                <h3 className="text-2xl font-semibold text-zinc-800">Generate Report</h3>
                                                <button onClick={handleCloseModal} className="text-zinc-400 hover:text-zinc-600">
                                                    <XMarkIcon className="h-6 w-6" />
                                                </button>
                                            </div>

                                            <form onSubmit={handleGenerateReportSubmit}>
                                                {/* Report Name */}
                                                <div className="mb-4">
                                                    <label htmlFor="reportName" className="block text-sm font-medium text-zinc-700 mb-1">Report name</label>
                                                    <input
                                                        type="text"
                                                        id="reportName"
                                                        value={newReportName}
                                                        onChange={(e) => setNewReportName(e.target.value)}
                                                        placeholder="My Custom Report"
                                                        className="w-full lg:p-4 p-2 border border-zinc-300 rounded-2xl focus:ring focus:outline-none focus:ring-green-700 focus:border-green-700"
                                                        required
                                                    />
                                                </div>

                                                {/* Customer Type */}
                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium text-zinc-700 mb-1">Customer type</label>
                                                    <div className="relative">
                                                        <button
                                                            type="button"
                                                            className={`w-full lg:p-4 p-2 pr-8 border border-zinc-300 rounded-2xl focus:ring focus:outline-none focus:ring-green-700 bg-white text-left flex justify-between items-center ${!newCustomerType ? 'text-zinc-400' : 'text-zinc-900'}`}
                                                            onClick={() => setIsCustomerOpen(!isCustomerOpen)}
                                                        >
                                                            {newCustomerType || 'Select customer type'}
                                                            <ChevronDownIcon className={`h-4 w-4 text-zinc-400 transform ${isCustomerOpen ? 'rotate-180' : ''}`} />
                                                        </button>
                                                        {isCustomerOpen && (
                                                            <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none" role="listbox">
                                                                {CUSTOMER_TYPES.map((type) => (
                                                                    <li key={type} className="text-zinc-900 cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-zinc-50" role="option"
                                                                        onClick={() => { setNewCustomerType(type); setIsCustomerOpen(false); }}>
                                                                        <span className="block truncate">{type}</span>
                                                                        {newCustomerType === type && (
                                                                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-green-600"><CheckIcon className="h-5 w-5" /></span>
                                                                        )}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Customer Name */}
                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium text-zinc-700 mb-1">Customer Name</label>
                                                    <div className="relative">
                                                        <button
                                                            type="button"
                                                            className={`w-full lg:p-4 p-2 pr-8 border border-zinc-300 rounded-2xl focus:ring focus:outline-none focus:ring-green-700 bg-white text-left flex justify-between items-center ${!newCustomerName ? 'text-zinc-400' : 'text-zinc-900'}`}
                                                            onClick={() => setIsCustomerListOpen(!isCustomerListOpen)}
                                                        >
                                                            {newCustomerName || 'Select customer name'}
                                                            <ChevronDownIcon className={`h-4 w-4 text-zinc-400 transform ${isCustomerListOpen ? 'rotate-180' : ''}`} />
                                                        </button>
                                                        {isCustomerListOpen && (
                                                            <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none" role="listbox">
                                                                {customerNameList.map((name) => (
                                                                    <li key={name} className="text-zinc-900 cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-zinc-50" role="option"
                                                                        onClick={() => { setNewCustomerName(name); setIsCustomerListOpen(false); }}>
                                                                        <span className="block truncate">{name}</span>
                                                                        {newCustomerName === name && (
                                                                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-green-600"><CheckIcon className="h-5 w-5" /></span>
                                                                        )}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Report Type */}
                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium text-zinc-700 mb-1">Report type</label>
                                                    <div className="relative">
                                                        <button
                                                            type="button"
                                                            className={`w-full lg:p-4 p-2 pr-8 border border-zinc-300 rounded-2xl focus:ring focus:outline-none focus:ring-green-700 bg-white text-left flex justify-between items-center ${!newReportType ? 'text-zinc-400' : 'text-zinc-900'}`}
                                                            onClick={() => setIsOpen(!isOpen)}
                                                        >
                                                            {newReportType || 'Select report type'}
                                                            <ChevronDownIcon className={`h-4 w-4 text-zinc-400 transform ${isOpen ? 'rotate-180' : ''}`} />
                                                        </button>
                                                        {isOpen && (
                                                            <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none" role="listbox">
                                                                {REPORT_TYPES.map((type) => (
                                                                    <li key={type.name} className="text-zinc-900 cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-zinc-50" role="option"
                                                                        onClick={() => { setNewReportType(type.name); setIsOpen(false); }}>
                                                                        <span className="block truncate">{type.name}</span>
                                                                        {newReportType === type.name && (
                                                                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-green-600"><CheckIcon className="h-5 w-5" /></span>
                                                                        )}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Date range */}
                                                <div className="grid grid-cols-1 gap-4 mb-6">
                                                    <div>
                                                        <label htmlFor="startDate" className="block text-sm font-medium text-zinc-700 mb-1">Start Date</label>
                                                        <input type="date" id="startDate" value={newReportStartDate} onChange={(e) => setNewReportStartDate(e.target.value)} required className="w-full lg:p-4 p-2 border border-zinc-300 rounded-2xl focus:ring focus:outline-none focus:ring-green-700 focus:border-green-700" />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="endDate" className="block text-sm font-medium text-zinc-700 mb-1">End Date</label>
                                                        <input type="date" id="endDate" value={newReportEndDate} onChange={(e) => setNewReportEndDate(e.target.value)} required className="w-full lg:p-4 p-2 border border-zinc-300 rounded-2xl focus:ring focus:outline-none focus:ring-green-700 focus:border-green-700" />
                                                    </div>
                                                </div>

                                                <div className="flex justify-end">
                                                    <button
                                                        type="submit"
                                                        disabled={isGeneratingReport}
                                                        className="bg-green-700 hover:bg-green-600 text-white text-lg p-4 w-full rounded-lg shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px]"
                                                    >
                                                        {isGeneratingReport ? (
                                                            <><LoadingSpinnerIcon className="h-5 w-5 mr-2" />Generating...</>
                                                        ) : (
                                                            'Generate report'
                                                        )}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;