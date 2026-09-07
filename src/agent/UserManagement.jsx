import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/AgentSidebar';
import Topbar from '../components/AgentTopBar';
import SignUpModal from '../components/AgentSignUpModal';
import EditUserModal from '../components/AgentEditUser';
import CsvUploader from '../components/CsvUploader';
import api from '../api/axiosConfig';
import { exportToCSV } from '../utils/exportHelper';

const devMode = false;

const getUserDate = (user) => {
    if (user.rawDate instanceof Date && !isNaN(user.rawDate.getTime())) {
        return user.rawDate;
    }
    if (user.createdAt) {
        const d = new Date(user.createdAt);
        if (!isNaN(d.getTime())) return d;
    }
    if (user.dateAdded && typeof user.dateAdded === 'string') {
        const parts = user.dateAdded.split('-');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            let year = parseInt(parts[2], 10);
            if (year < 100) year += 2000;
            const parsed = new Date(year, month, day);
            if (!isNaN(parsed.getTime())) return parsed;
        }
    }
    return null;
};

const fetchUsers = async () => {
    const getList = (res) => {
        if (!res || !res.data) return [];
        const payload = res.data;
        if (payload.success || payload.succeeded) {
            const inner = payload.data;
            if (Array.isArray(inner)) return inner;
            if (inner && Array.isArray(inner.data)) return inner.data;
            if (inner && Array.isArray(inner.corporates)) return inner.corporates;
            if (inner && Array.isArray(inner.residents)) return inner.residents;
        }
        if (Array.isArray(payload)) return payload;
        return [];
    };

    const mapUser = (item, type) => {
        const name = item.fullName || item.name || item.businessName || item.companyName || `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'No Name';
        const email = item.email || item.emailAddress || '-';
        const phoneNumber = item.phoneNumber || item.phoneNo || item.phone || '-';
        const dateAddedRaw = item.createdAt || item.dateAdded || item.createdDate || item.date;
        const date = dateAddedRaw ? new Date(dateAddedRaw) : null;
        const isValidDate = date && !isNaN(date.getTime());
        const dateAdded = isValidDate 
            ? `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getFullYear()).slice(-2)}`
            : (item.dateAdded || 'N/A');

        return {
            id: item._id || item.id,
            name,
            email,
            customerType: type,
            phoneNumber,
            dateAdded,
            createdAt: item.createdAt || item.dateAdded || item.createdDate || item.date || null,
            rawDate: isValidDate ? date : null,
        };
    };

    try {
        const [corpRes, resRes] = await Promise.all([
            api.get("/corporates-management"),
            api.get("/residents-management")
        ]);

        const corporates = getList(corpRes).map(item => mapUser(item, 'Corporate'));
        const residents = getList(resRes).map(item => mapUser(item, 'Resident'));

        return [...corporates, ...residents];
    } catch (error) {
        console.error("Error fetching corporate and resident users:", error);
        return [];
    }
};


// --- SVG ICONS (Heroicons) ---
const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="31" viewBox="0 0 36 31" fill="none" className="size-8 mt-12">
        <path
            d="M13 2.25H9.52C8.71825 2.25015 7.93765 2.50725 7.29274 2.98358C6.64783 3.45992 6.17256 4.1304 5.93667 4.89667L1.91667 17.9617C1.80656 18.3185 1.75039 18.6899 1.75 19.0633V26C1.75 26.9946 2.14509 27.9484 2.84835 28.6516C3.55161 29.3549 4.50544 29.75 5.5 29.75H30.5C31.4946 29.75 32.4484 29.3549 33.1516 28.6516C33.8549 27.9484 34.25 26.9946 34.25 26V19.0633C34.25 18.69 34.1933 18.3183 34.0833 17.9617L30.0667 4.89667C29.8308 4.1304 29.3555 3.45992 28.7106 2.98358C28.0657 2.50725 27.2851 2.25015 26.4833 2.25H23M1.75 18.5H8.18333C8.87966 18.5002 9.56219 18.6942 10.1545 19.0604C10.7467 19.4266 11.2253 19.9505 11.5367 20.5733L11.9633 21.4267C12.2748 22.0498 12.7537 22.5738 13.3463 22.94C13.9388 23.3062 14.6217 23.5001 15.3183 23.5H20.6817C21.3783 23.5001 22.0612 23.3062 22.6537 22.94C23.2463 22.5738 23.7252 22.0498 24.0367 21.4267L24.4633 20.5733C24.7748 19.9502 25.2537 19.4262 25.8463 19.06C26.4388 18.6938 27.1217 18.4999 27.8183 18.5H34.25M18 1V14.75M18 14.75L13 9.75M18 14.75L23 9.75"
            stroke="#007836"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-zinc-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);

const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 text-zinc-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const DotsVerticalIcon = ({ onClick }) => (
    <svg onClick={onClick} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 cursor-pointer text-zinc-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-red-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-white bg-green-500 rounded-full p-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

// --- MAIN COMPONENT ---
const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [customerTypeFilter, setCustomerTypeFilter] = useState({ Resident: false, Corporate: false });
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [dateFilter, setDateFilter] = useState({
        preset: 'all',
        startDate: '',
        endDate: '',
    });
    const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
    const customerFilterRef = useRef(null);
    const dateFilterRef = useRef(null);

    const [activeActionMenu, setActiveActionMenu] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [notification, setNotification] = useState(null);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedUserType, setSelectedUserType] = useState('');
    const usersPerPage = 6;

    const clearNotification = () => {
        setNotification(null);
    };

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (customerFilterRef.current && !customerFilterRef.current.contains(event.target)) {
                setIsFilterOpen(false);
            }
            if (dateFilterRef.current && !dateFilterRef.current.contains(event.target)) {
                setIsDateFilterOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch users on mount
    useEffect(() => {
        const loadUsers = async () => {
            const usersData = await fetchUsers();
            setUsers(usersData);
            setFilteredUsers(usersData);
        };
        loadUsers();
    }, []);

    // Handle filtering
    useEffect(() => {
        let result = users;

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(user =>
                (user.name && user.name.toLowerCase().includes(term)) ||
                (user.email && user.email.toLowerCase().includes(term)) ||
                (user.phoneNumber && user.phoneNumber.toLowerCase().includes(term))
            );
        }

        // Customer type filter
        const activeFilters = Object.keys(customerTypeFilter).filter(key => customerTypeFilter[key]);
        if (activeFilters.length > 0) {
            result = result.filter(user => activeFilters.includes(user.customerType));
        }

        // Date added filter
        if (dateFilter.startDate || dateFilter.endDate) {
            result = result.filter(user => {
                const userDate = getUserDate(user);
                if (!userDate) return false;

                const userTime = userDate.getTime();

                if (dateFilter.startDate) {
                    const [y, m, d] = dateFilter.startDate.split('-').map(Number);
                    const startTime = new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
                    if (userTime < startTime) return false;
                }

                if (dateFilter.endDate) {
                    const [y, m, d] = dateFilter.endDate.split('-').map(Number);
                    const endTime = new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
                    if (userTime > endTime) return false;
                }

                return true;
            });
        }

        setFilteredUsers(result);
        setCurrentPage(1); // Reset to first page on filter change
    }, [searchTerm, customerTypeFilter, dateFilter, users]);

    // Pagination logic
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Action handlers
    const handleActionMenuToggle = (userId) => {
        setActiveActionMenu(activeActionMenu === userId ? null : userId);
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
        setActiveActionMenu(null);
    };

    const confirmDelete = async () => {
        try {
            if (!userToDelete) return;
            let response;
            const userId = userToDelete.id;

            if (userToDelete.customerType.toLowerCase() === 'corporate') {
                response = await api.delete(`/corporates-management/${userId}`);
            } else {
                response = await api.delete(`/residents-management/${userId}`);
            }

            const isSuccess = response.data?.success || response.data?.succeeded || false;
            if (isSuccess) {
                setUsers(users.filter(u => u.id !== userId));
                setIsDeleteModalOpen(false);
                setUserToDelete(null);
                setIsSuccessModalOpen(true);
            } else {
                alert("Failed to delete user: " + (response.data?.message || 'Unknown error'));
            }
        } catch (error) {
            console.error("Deletion error:", error);
            alert("An error occurred while deleting the user: " + (error.response?.data?.message || error.message));
        }
    };

    const handleComingSoon = (feature) => {
        setNotification({
            type: 'info',
            message: `${feature} feature is coming soon! Stay tuned!`,
            duration: 3000,
        });
    };

    const handleExportData = () => {
        if (!filteredUsers || filteredUsers.length === 0) {
            setNotification({
                type: 'error',
                message: 'No users available to export.',
                duration: 3000,
            });
            return;
        }

        try {
            const exportRows = filteredUsers.map((user, index) => ({
                "S/N": index + 1,
                "Name": user.name || 'No Name',
                "Email Address": user.email || '-',
                "Customer Type": user.customerType || '-',
                "Phone Number": user.phoneNumber || '-',
                "Date Added": user.dateAdded || '-',
            }));

            exportToCSV(exportRows, "users_directory");
            setNotification({
                type: 'success',
                message: `Successfully exported ${exportRows.length} user records!`,
                duration: 3000,
            });
        } catch (error) {
            console.error("Export error:", error);
            setNotification({
                type: 'error',
                message: error.message || 'An error occurred while exporting data.',
                duration: 3000,
            });
        }
    };

    const handleFilterChange = (type) => {
        setCustomerTypeFilter(prev => ({ ...prev, [type]: !prev[type] }));
    };

    const applyDatePreset = (preset) => {
        const now = new Date();
        const formatDateStr = (d) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        if (preset === 'today') {
            const todayStr = formatDateStr(now);
            setDateFilter({ preset: 'today', startDate: todayStr, endDate: todayStr });
        } else if (preset === 'this_week') {
            const startOfWeek = new Date(now);
            const day = now.getDay();
            const diff = now.getDate() - day + (day === 0 ? -6 : 1);
            startOfWeek.setDate(diff);
            setDateFilter({
                preset: 'this_week',
                startDate: formatDateStr(startOfWeek),
                endDate: formatDateStr(now),
            });
        } else if (preset === 'this_month') {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            setDateFilter({
                preset: 'this_month',
                startDate: formatDateStr(startOfMonth),
                endDate: formatDateStr(now),
            });
        } else if (preset === 'last_30_days') {
            const past30 = new Date(now);
            past30.setDate(now.getDate() - 30);
            setDateFilter({
                preset: 'last_30_days',
                startDate: formatDateStr(past30),
                endDate: formatDateStr(now),
            });
        } else if (preset === 'all') {
            setDateFilter({ preset: 'all', startDate: '', endDate: '' });
        }
    };

    const getDateButtonLabel = () => {
        if (dateFilter.preset === 'today') return 'Today';
        if (dateFilter.preset === 'this_week') return 'This week';
        if (dateFilter.preset === 'this_month') return 'This month';
        if (dateFilter.preset === 'last_30_days') return 'Last 30 days';
        if (dateFilter.startDate && dateFilter.endDate) {
            if (dateFilter.startDate === dateFilter.endDate) return dateFilter.startDate;
            return `${dateFilter.startDate} - ${dateFilter.endDate}`;
        }
        if (dateFilter.startDate) return `From ${dateFilter.startDate}`;
        if (dateFilter.endDate) return `To ${dateFilter.endDate}`;
        return 'Date added';
    };

    const hasActiveDateFilter = Boolean(dateFilter.startDate || dateFilter.endDate);
    const hasAnyActiveFilter = customerTypeFilter.Resident || customerTypeFilter.Corporate || hasActiveDateFilter;

    const resetFilters = () => {
        setSearchTerm('');
        setCustomerTypeFilter({ Resident: false, Corporate: false });
        setDateFilter({ preset: 'all', startDate: '', endDate: '' });
        setIsFilterOpen(false);
        setIsDateFilterOpen(false);
    };

    const handleUploadComplete = (uploadedUsers) => {
        if (!Array.isArray(uploadedUsers) || uploadedUsers.length === 0) return;

        const today = new Date();
        const dateAdded = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getFullYear()).slice(-2)}`;

        const normalizedUsers = uploadedUsers.map((user, index) => {
            const name = (user.name || `${user.firstName || ''} ${user.lastName || ''}`).trim() || 'Unknown User';
            const customerTypeRaw = user.customerType || user.customer_type || 'resident';
            const customerType = `${String(customerTypeRaw).charAt(0).toUpperCase()}${String(customerTypeRaw).slice(1).toLowerCase()}`;
            const dateObj = user.createdAt || user.dateAdded ? new Date(user.createdAt || user.dateAdded) : today;
            const validDate = !isNaN(dateObj.getTime()) ? dateObj : today;

            return {
                id: user.id ?? `uploaded-${Date.now()}-${index}`,
                name,
                email: user.email || user.companyEmail || '',
                customerType,
                phoneNumber: user.phoneNumber || user.companyPhoneNumber || '',
                dateAdded: user.dateAdded || dateAdded,
                rawDate: validDate,
                createdAt: user.createdAt || user.dateAdded || today,
                ...user,
            };
        });

        setUsers(prevUsers => [...normalizedUsers, ...prevUsers]);
        setNotification({ type: 'success', message: `${normalizedUsers.length} users uploaded successfully.`, duration: 3000 });
    };

    const activeFilterCount = Object.values(customerTypeFilter).filter(Boolean).length;


    return (

        <div>
            <div className="flex sans h-screen max-w-screen">

                <Sidebar addkey="1" />
                <div className=" bg-zinc-100 min-h-screen   flex flex-col flex-1 overflow-y-auto  ">

                    <Topbar />

                    <div className="bg-zinc-100 font-sans">
                        <main className="p-4 ">
                            <div className=" min-h-screen font-sans p-4 md:p-8">
                                <div className=" mx-auto  rounded-lg p-4 sm:p-6">
                                    {/* Header */}
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                                        <div className="flex items-center mb-4 md:mb-0">
                                            <h1 className="text-xl font-semibold text-zinc-800">User Directory</h1>
                                            <span className="ml-2 bg-green-700 text-zinc-100 text-xs font-bold p-2 rounded-full">{filteredUsers.length}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <CsvUploader uploadEndpoint="user-management/upload-user" onUploadComplete={handleUploadComplete} />
                                            <button onClick={() => setIsAddUserModalOpen(true)} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-xl hover:bg-green-800">
                                                <PlusIcon />
                                                <span>Sign up new user</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Search and Filters */}
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 space-y-4 lg:space-y-0">
                                        <div className="relative flex-grow lg:max-w-xs">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <SearchIcon />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Search members"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-xl focus:ring-green-500 focus:border-green-500"
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {hasAnyActiveFilter && (
                                                <button onClick={resetFilters} className="px-4 py-2 text-sm font-medium text-green-700 rounded-xl hover:bg-zinc-50 flex items-center gap-1">
                                                    Reset filter <span>&times;</span>
                                                </button>
                                            )}
                                            {!hasAnyActiveFilter && (
                                                <span className="px-3 py-2 text-sm font-medium text-zinc-500">
                                                    Filter by:
                                                </span>
                                            )}
                                            <div className="relative" ref={customerFilterRef}>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsFilterOpen(!isFilterOpen);
                                                        setIsDateFilterOpen(false);
                                                    }}
                                                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-xl border transition ${
                                                        activeFilterCount > 0
                                                            ? 'bg-green-50 border-green-600 text-green-700 font-semibold'
                                                            : 'bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-50'
                                                    }`}
                                                >
                                                    <span>Customer type</span>
                                                    {activeFilterCount > 0 && <span className="ml-2 bg-green-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">{activeFilterCount}</span>}
                                                    <ChevronDownIcon />
                                                </button>
                                                {isFilterOpen && (
                                                    <div className="absolute z-20 mt-2 w-48 bg-white rounded-xl shadow-lg border border-zinc-200 right-0">
                                                        <div className="p-2">
                                                            <label className="flex items-center space-x-3 p-2 hover:bg-zinc-100 rounded-xl cursor-pointer">
                                                                <input type="checkbox" className="h-4 w-4 text-green-600 border-zinc-300 rounded focus:ring-green-500" checked={customerTypeFilter.Resident} onChange={() => handleFilterChange('Resident')} />
                                                                <span className="text-sm text-zinc-700">Residents</span>
                                                            </label>
                                                            <label className="flex items-center space-x-3 p-2 hover:bg-zinc-100 rounded-xl cursor-pointer">
                                                                <input type="checkbox" className="h-4 w-4 text-green-600 border-zinc-300 rounded focus:ring-green-500" checked={customerTypeFilter.Corporate} onChange={() => handleFilterChange('Corporate')} />
                                                                <span className="text-sm text-zinc-700">Corporates</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Date added filter dropdown */}
                                            <div className="relative" ref={dateFilterRef}>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsDateFilterOpen(!isDateFilterOpen);
                                                        setIsFilterOpen(false);
                                                    }}
                                                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-xl border transition ${
                                                        hasActiveDateFilter
                                                            ? 'bg-green-50 border-green-600 text-green-700 font-semibold'
                                                            : 'bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-50'
                                                    }`}
                                                >
                                                    <span>{getDateButtonLabel()}</span>
                                                    {hasActiveDateFilter && (
                                                        <span className="ml-2 w-2 h-2 rounded-full bg-green-600"></span>
                                                    )}
                                                    <ChevronDownIcon />
                                                </button>
                                                {isDateFilterOpen && (
                                                    <div className="absolute z-20 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-zinc-200 right-0 p-4 space-y-4">
                                                        <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                                                            <span className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Date added</span>
                                                            {hasActiveDateFilter && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => applyDatePreset('all')}
                                                                    className="text-xs text-red-600 hover:text-red-700 font-medium hover:underline"
                                                                >
                                                                    Clear
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Quick Presets */}
                                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                                            <button
                                                                type="button"
                                                                onClick={() => applyDatePreset('today')}
                                                                className={`px-3 py-2 rounded-xl border text-left transition font-medium ${
                                                                    dateFilter.preset === 'today'
                                                                        ? 'bg-green-50 border-green-600 text-green-700 font-semibold'
                                                                        : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                                                                }`}
                                                            >
                                                                Today
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => applyDatePreset('this_week')}
                                                                className={`px-3 py-2 rounded-xl border text-left transition font-medium ${
                                                                    dateFilter.preset === 'this_week'
                                                                        ? 'bg-green-50 border-green-600 text-green-700 font-semibold'
                                                                        : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                                                                }`}
                                                            >
                                                                This week
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => applyDatePreset('this_month')}
                                                                className={`px-3 py-2 rounded-xl border text-left transition font-medium ${
                                                                    dateFilter.preset === 'this_month'
                                                                        ? 'bg-green-50 border-green-600 text-green-700 font-semibold'
                                                                        : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                                                                }`}
                                                            >
                                                                This month
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => applyDatePreset('last_30_days')}
                                                                className={`px-3 py-2 rounded-xl border text-left transition font-medium ${
                                                                    dateFilter.preset === 'last_30_days'
                                                                        ? 'bg-green-50 border-green-600 text-green-700 font-semibold'
                                                                        : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                                                                }`}
                                                            >
                                                                Last 30 days
                                                            </button>
                                                        </div>

                                                        {/* Custom Range */}
                                                        <div className="pt-2 border-t border-zinc-100 space-y-2">
                                                            <span className="text-xs font-semibold text-zinc-600">Custom date range</span>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                <div>
                                                                    <label className="block text-[11px] text-zinc-500 mb-1">From</label>
                                                                    <input
                                                                        type="date"
                                                                        value={dateFilter.startDate}
                                                                        onChange={(e) => {
                                                                            setDateFilter(prev => ({
                                                                                ...prev,
                                                                                preset: 'custom',
                                                                                startDate: e.target.value
                                                                            }));
                                                                        }}
                                                                        className="w-full px-2.5 py-1.5 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none text-zinc-700"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-[11px] text-zinc-500 mb-1">To</label>
                                                                    <input
                                                                        type="date"
                                                                        value={dateFilter.endDate}
                                                                        onChange={(e) => {
                                                                            setDateFilter(prev => ({
                                                                                ...prev,
                                                                                preset: 'custom',
                                                                                endDate: e.target.value
                                                                            }));
                                                                        }}
                                                                        className="w-full px-2.5 py-1.5 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none text-zinc-700"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex justify-end pt-2 border-t border-zinc-100">
                                                            <button
                                                                type="button"
                                                                onClick={() => setIsDateFilterOpen(false)}
                                                                className="px-4 py-1.5 bg-green-700 text-white rounded-xl text-xs font-medium hover:bg-green-800 transition cursor-pointer"
                                                            >
                                                                Done
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={handleExportData}
                                                className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-xl hover:bg-zinc-50 hover:text-zinc-900 transition shadow-xs cursor-pointer"
                                                title="Export user directory as CSV"
                                            >
                                                <DownloadIcon />
                                                <span>Export data</span>
                                            </button>
                                        </div>
                                    </div>


                                    {/* Table */}
                                    <div className="overflow-x-auto bg-white rounded-2xl ">
                                        <table className="min-w-full bg-white">
                                            <thead className="bg-zinc-50">
                                                <tr>
                                                    <th className="py-3 px-6 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">S/N</th>
                                                    <th className="py-3 px-6 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Name</th>
                                                    <th className="py-3 px-6 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Email address</th>
                                                    <th className="py-3 px-6 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Customer type</th>
                                                    <th className="py-3 px-6 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Phone number</th>
                                                    <th className="py-3 px-6 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Date added</th>
                                                    <th className="py-3 px-6 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-200">
                                                {paginatedUsers.map((user, index) => (
                                                    <tr key={user.id} className="hover:bg-zinc-50">
                                                        <td className="py-4 px-6 text-sm text-zinc-500">{(currentPage - 1) * usersPerPage + index + 1}</td>
                                                        <td className="py-4 px-6 text-sm font-medium text-zinc-900">{user.name}</td>
                                                        <td className="py-4 px-6 text-sm text-zinc-500">{user.email}</td>
                                                        <td className="py-4 px-6 text-sm text-zinc-500">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.customerType === 'Corporate' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                                                {user.customerType}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6 text-sm text-zinc-500">{user.phoneNumber}</td>
                                                        <td className="py-4 px-6 text-sm text-zinc-500">{user.dateAdded}</td>
                                                        <td className="py-4 px-6 text-sm text-zinc-500 relative">
                                                            <DotsVerticalIcon onClick={() => handleActionMenuToggle(user.id)} />
                                                            {activeActionMenu === user.id && (
                                                                <div className="absolute right-8 top-0 z-10 w-48 bg-white rounded-xl shadow-lg border border-zinc-200">
                                                                    <a href="#" onClick={(e) => { 
                                                                        e.preventDefault(); 
                                                                        setActiveActionMenu(null); 
                                                                        setSelectedUserId(user.id);
                                                                        setSelectedUserType(user.customerType.toLowerCase());
                                                                        setIsEditUserModalOpen(true); 
                                                                    }} className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100">Edit user details</a>
                                                                    <a href="#" onClick={(e) => { e.preventDefault(); handleDeleteClick(user); }} className="block px-4 py-2 text-sm text-red-600 hover:bg-zinc-100">Delete</a>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    <div className="flex items-center justify-between py-3">
                                        <div className="text-sm text-zinc-700">
                                            Page {currentPage} of {totalPages}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button onClick={handlePrevPage} disabled={currentPage === 1} className="p-2 border border-zinc-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                                            </button>
                                            <button onClick={handleNextPage} disabled={currentPage === totalPages} className="p-2 border border-zinc-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Delete Confirmation Modal */}
                                {isDeleteModalOpen && (
                                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
                                            <div className="flex justify-center mb-4">
                                                <TrashIcon />
                                            </div>
                                            <h2 className="text-xl font-bold text-zinc-800 mb-2">Delete user?</h2>
                                            <p className="text-zinc-600 mb-6">Are you sure you want to delete this user's details. Note that the action cannot be reversed.</p>
                                            <div className="flex justify-center space-x-4">
                                                <button onClick={() => setIsDeleteModalOpen(false)} className="px-6 py-2 rounded-xl text-zinc-700 border border-zinc-300 hover:bg-zinc-100">Cancel</button>
                                                <button onClick={confirmDelete} className="px-6 py-2 rounded-xl text-white bg-red-600 hover:bg-red-700">Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Success Modal */}
                                {isSuccessModalOpen && (
                                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
                                            <div className="flex justify-center mb-4">
                                                <CheckCircleIcon />
                                            </div>
                                            <h2 className="text-xl font-bold text-green-600 mb-2">User deleted successfully</h2>
                                            <p className="text-zinc-600 mb-6">You have successfully deleted the user details.</p>
                                            <button onClick={() => setIsSuccessModalOpen(false)} className="w-full px-6 py-3 rounded-xl text-white bg-green-600 hover:bg-green-700">Back to dashboard</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </main>
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

            <SignUpModal
                show={isAddUserModalOpen}
                onClose={() => setIsAddUserModalOpen(false)}
                devMode={devMode}
            />
            <EditUserModal
                show={isEditUserModalOpen}
                onClose={() => setIsEditUserModalOpen(false)}
                devMode={false}
                userType={selectedUserType}
                userId={selectedUserId}
            />
        </div>


    );
}
export default UserManagement;