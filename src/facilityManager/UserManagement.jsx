import React, { useState, useEffect } from 'react';
import Sidebar from '../components/FacilityMgrSideBar';
import Topbar from '../components/FacilityMgrTopBar';
import SignUpModal from '../components/FacilityMgrSignUpModal';
import EditUserModal from '../components/FacilityMgrEditUser';
import BinAssignTable from '../components/BinAssignTable'
import TenantDetailsSideBar from '../components/Tenantsright';
import CsvUploader from '../components/CsvUploader';
import api from '../api/axiosConfig';

const initialUsers = [
    {
        id: "user-1",
        sn: 1,
        name: "Adebimpe Soriyan",
        binStatus: "Assigned",
        binId: "#123456",
        phone: "08029389102",
        building: "Parkview Estate",
        dateAdded: "21-01-25"
    },
    {
        id: "user-2",
        sn: 2,
        name: "Blue Way Limited",
        binStatus: "Assigned",
        binId: "#123456",
        phone: "08032784726",
        building: "Chevy View",
        dateAdded: "22-01-25"
    },
    {
        id: "user-3",
        sn: 3,
        name: "Soya Limited Enterprises",
        binStatus: "Unassigned",
        binId: "-",
        phone: "08142904836",
        building: "Lekki Gardens",
        dateAdded: "24-01-25"
    },
    {
        id: "user-4",
        sn: 4,
        name: "Martins Madueke",
        binStatus: "Assigned",
        binId: "#123456",
        phone: "07023780192",
        building: "Pinnock Beach",
        dateAdded: "28-01-25"
    },
    {
        id: "user-5",
        sn: 5,
        name: "Fisayo Mabel",
        binStatus: "Unassigned",
        binId: "-",
        phone: "09011892739",
        building: "Pinnock Beach",
        dateAdded: "28-01-25"
    },
    {
        id: "user-6",
        sn: 6,
        name: "Chicken & Co. Restaurant",
        binStatus: "Assigned",
        binId: "#123456",
        phone: "07038902948",
        building: "Lekki Gardens",
        dateAdded: "28-01-25"
    },
    {
        id: "user-7",
        sn: 7,
        name: "Jide Ventures",
        binStatus: "Assigned",
        binId: "#654321",
        phone: "08022223333",
        building: "Victoria Island",
        dateAdded: "29-01-25"
    },
    {
        id: "user-8",
        sn: 8,
        name: "Tola Benson",
        binStatus: "Unassigned",
        binId: "-",
        phone: "08110000001",
        building: "Banana Island",
        dateAdded: "30-01-25"
    },
    {
        id: "user-9",
        sn: 9,
        name: "Emerald Foods",
        binStatus: "Assigned",
        binId: "#777888",
        phone: "08134445566",
        building: "Ocean View",
        dateAdded: "30-01-25"
    },
    {
        id: "user-10",
        sn: 10,
        name: "Omotola Grace",
        binStatus: "Unassigned",
        binId: "-",
        phone: "07090001122",
        building: "Crown Estate",
        dateAdded: "31-01-25"
    },
    {
        id: "user-11",
        sn: 11,
        name: "GreenTech Innovations",
        binStatus: "Assigned",
        binId: "#889900",
        phone: "08099887766",
        building: "Ikoyi Crescent",
        dateAdded: "01-02-25"
    },
    {
        id: "user-12",
        sn: 12,
        name: "Dapo Shonubi",
        binStatus: "Assigned",
        binId: "#445566",
        phone: "07011223344",
        building: "Freedom Park",
        dateAdded: "01-02-25"
    },
    {
        id: "user-13",
        sn: 13,
        name: "Sunrise Supermarket",
        binStatus: "Unassigned",
        binId: "-",
        phone: "08120000009",
        building: "Ajah Central",
        dateAdded: "02-02-25"
    },
    {
        id: "user-14",
        sn: 14,
        name: "Hope Medical Centre",
        binStatus: "Assigned",
        binId: "#998877",
        phone: "07030009988",
        building: "Gbagada Phase 2",
        dateAdded: "03-02-25"
    },
    {
        id: "user-15",
        sn: 15,
        name: "Chisom Ike",
        binStatus: "Unassigned",
        binId: "-",
        phone: "08156667788",
        building: "Osapa London",
        dateAdded: "03-02-25"
    },
    {
        id: "user-16",
        sn: 16,
        name: "Peak Realty",
        binStatus: "Assigned",
        binId: "#334455",
        phone: "08040002211",
        building: "Palm Groove",
        dateAdded: "04-02-25"
    },
    {
        id: "user-17",
        sn: 17,
        name: "New Dawn Cafe",
        binStatus: "Unassigned",
        binId: "-",
        phone: "07087776655",
        building: "Ikate Elegushi",
        dateAdded: "04-02-25"
    },
    {
        id: "user-18",
        sn: 18,
        name: "SmartHub Ltd.",
        binStatus: "Assigned",
        binId: "#111222",
        phone: "08150005511",
        building: "Ogunlana Drive",
        dateAdded: "05-02-25"
    },
    {
        id: "user-19",
        sn: 19,
        name: "Zainab Tanimu",
        binStatus: "Unassigned",
        binId: "-",
        phone: "09030008877",
        building: "Surulere Phase 1",
        dateAdded: "05-02-25"
    },
    {
        id: "user-20",
        sn: 20,
        name: "Bright Future College",
        binStatus: "Assigned",
        binId: "#112233",
        phone: "08061112233",
        building: "Magodo GRA",
        dateAdded: "06-02-25"
    }
];

const fetchUsers = async () => {
    try {
        let { data } = await api.get("/facility-managers/user/tenants");
        if (data.success) {
            return data.data.map((item, idx) => ({
                ...item,
                id: item._id || item.id || `user-${idx}`,
                sn: idx + 1,
                fullName: `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.name || 'No Name',
                statusName: item.binStatus ? (item.binStatus.charAt(0).toUpperCase() + item.binStatus.slice(1)) : 'Unassigned',
                phoneNo: item.phoneNumber || item.phone || '-',
                building: item.buildingName || item.building || '-',
                created: item.createdAt || item.dateAdded || ''
            }));
        } else {
            console.log(data, "it failed ");
            return [];
        }
    } catch (error) {
        console.log(error);
        return [];
    }
};



const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-zinc-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);
const XMarkIcon = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
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


// --- MAIN COMPONENT ---
const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    //const [customerTypeFilter, setCustomerTypeFilter] = useState({ Resident: false, Corporate: false });
    //const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [activeActionMenu, setActiveActionMenu] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [notification, setNotification] = useState(null);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
    const [location, setLocation] = useState("tenant");

    const usersPerPage = 6;



    const clearNotification = () => {
        setNotification(null);
    };

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
        let result = users || [];

        // Search filter
        if (searchTerm) {
            result = result.filter(user =>
                (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        setFilteredUsers(result);
        setCurrentPage(1); // Reset to first page on filter change
    }, [searchTerm, users]);

    // Pagination logic
    const totalPages = Math.ceil(filteredUsers?.length / usersPerPage);
    const paginatedUsers = filteredUsers?.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

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

    const confirmDelete = () => {
        setUsers(users.filter(u => u.id !== userToDelete.id));
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
        setIsSuccessModalOpen(true);
    };

    const handleComingSoon = (feature) => {
        setNotification({
            type: 'info',
            message: `${feature} feature is coming soon! Stay tuned!`,
            duration: 3000,
        });
    };


    // const handleFilterChange = (type) => {
    //     setCustomerTypeFilter(prev => ({ ...prev, [type]: !prev[type] }));
    // };

    // const resetFilters = () => {
    //     setSearchTerm('');
    //     setCustomerTypeFilter({ Resident: false, Corporate: false });
    //     setIsFilterOpen(false);
    // };

    // const activeFilterCount = Object.values(customerTypeFilter).filter(Boolean).length;

    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [selectedTenantId, setSelectedTenantId] = useState(null);

    const handleOpenSidebar = (tenantId) => {
        setSelectedTenantId(tenantId);
        setSidebarOpen(true);
    };

    const handleCloseSidebar = () => {
        setSidebarOpen(false);
        setSelectedTenantId(null); // Optional: clear the ID when closing
    };

    function extractDate(timestamp) {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }




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
                                            <span className="ml-2 bg-green-700 text-zinc-100 text-xs font-bold p-2 rounded-full">{filteredUsers?.length}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <CsvUploader />


                                            <button onClick={() => setIsAddUserModalOpen(true)} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-xl hover:bg-green-800">
                                                <PlusIcon />
                                                <span>Sign up new user</span>

                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-row  my-2  w-full py-4 border-zinc-200 ">

                                        <p onClick={() => setLocation('tenant')} className={`items-left justify-start border-b-2 py-2 px-4  ${location === 'tenant' ? 'text-green-700   border-green-700' : 'text-zinc-700 border-zinc-300'}`}>
                                            Tenant Directory
                                        </p>

                                        <p onClick={() => setLocation('bin')} className={`items-left justify-start border-b-2 py-2 px-4 ${location === 'bin' ? 'text-green-700   border-green-700' : 'text-zinc-700 border-zinc-300'}`}>
                                            Bin Directory
                                        </p>
                                    </div>

                                    {location === 'tenant' && (<>

                                        {/* Search and Filters */}
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 space-y-4 lg:space-y-0">
                                            <div className="relative flex-grow lg:max-w-xl">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <SearchIcon />
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Search members"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 border border-zinc-300 bg-white rounded-xl focus:ring-green-500 focus:border-green-500"
                                                />
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {/* {(customerTypeFilter.Resident || customerTypeFilter.Corporate) && (
                                                    <button onClick={resetFilters} className="px-4 py-2 text-sm font-medium text-green-700 rounded-xl hover:bg-zinc-50">
                                                        Reset filter <span className="ml-1">X</span>
                                                    </button>
                                                )}
                                                {(!customerTypeFilter.Resident && !customerTypeFilter.Corporate) && (
                                                    <button className="px-4 py-2 text-sm font-medium text-zinc-700 rounded-xl hover:bg-zinc-50/50">
                                                        Filter by
                                                    </button>
                                                )}
                                                <div className="relative">
                                                    <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-xl hover:bg-zinc-50">
                                                        <span>Customer type</span>
                                                        {activeFilterCount > 0 && <span className="ml-2 bg-green-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">{activeFilterCount}</span>}
                                                        <ChevronDownIcon />
                                                    </button>
                                                    {isFilterOpen && (
                                                        <div className="absolute z-10 mt-2 w-48 bg-white rounded-xl shadow-lg border border-zinc-200 right-0">
                                                            <div className="p-2">
                                                                <label className="flex items-center space-x-3 p-2 hover:bg-zinc-100 rounded-xl">
                                                                    <input type="checkbox" className="h-4 w-4 text-green-600 border-zinc-300 rounded focus:ring-green-500" checked={customerTypeFilter.Resident} onChange={() => handleFilterChange('Resident')} />
                                                                    <span>Residents</span>
                                                                </label>
                                                                <label className="flex items-center space-x-3 p-2 hover:bg-zinc-100 rounded-xl">
                                                                    <input type="checkbox" className="h-4 w-4 text-green-600 border-zinc-300 rounded focus:ring-green-500" checked={customerTypeFilter.Corporate} onChange={() => handleFilterChange('Corporate')} />
                                                                    <span>Corporates</span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <button onClick={() => handleComingSoon('Date added filter')} className="flex items-center px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-xl hover:bg-zinc-50">
                                                    <span>Date added</span>
                                                    <ChevronDownIcon />
                                                </button> */}
                                                <button onClick={() => handleComingSoon('Export data')} className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-xl hover:bg-zinc-50">
                                                    Export data
                                                </button>
                                            </div>
                                        </div>

                                        {/* Table */}
                                        <div className="overflow-x-auto bg-white rounded-2xl ">
                                            <table className="min-w-full bg-white">
                                                <thead className="bg-zinc-50">
                                                    <tr>
                                                        <th className="py-3 px-6 text-left text-xs font-medium text-zinc-500  tracking-wider">S/N</th>
                                                        <th className="py-3 px-6 text-left text-xs font-medium text-zinc-500  tracking-wider">Name</th>
                                                        <th className="py-3 px-6 text-left text-xs font-medium text-zinc-500  tracking-wider">Bin Status</th>
                                                        <th className="py-3 px-6 text-left text-xs font-medium text-zinc-500  tracking-wider">Bin ID</th>
                                                        <th className="py-3 px-6 text-left text-xs font-medium text-zinc-500  tracking-wider">Phone number</th>
                                                        <th className="py-3 px-6 text-left text-xs font-medium text-zinc-500  tracking-wider">Building name</th>
                                                        <th className="py-3 px-6 text-left text-xs font-medium text-zinc-500  tracking-wider">Date added</th>
                                                        <th className="py-3 px-6 text-left text-xs font-medium text-zinc-500  tracking-wider">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-zinc-200">
                                                    {paginatedUsers?.map((user, index) => (
                                                        <tr key={user.id + user.sn} className="hover:bg-zinc-50">
                                                            <td className="py-4 px-6 text-sm text-zinc-500">{(currentPage - 1) * usersPerPage + index + 1}</td>
                                                            <td className="py-4 px-6 text-sm font-medium text-zinc-900">{user.fullName}</td>
                                                            <td className="py-4 px-6 text-sm text-zinc-500">
                                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.statusName === 'Assigned' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                    {user.statusName}
                                                                </span>
                                                            </td>
                                                            <td className="py-4 px-6 text-sm text-zinc-500">{user.binId || '-'}</td>
                                                            <td className="py-4 px-6 text-sm text-zinc-500">{user.phoneNo}</td>
                                                            <td className="py-4 px-6 text-sm text-zinc-500">{user.building || "No Name"}</td>
                                                            <td className="py-4 px-6 text-sm text-zinc-500">{extractDate(user.created)}</td>
                                                            <td className="py-4 px-6 text-sm text-zinc-500 relative">
                                                                <DotsVerticalIcon onClick={() => handleActionMenuToggle(user.id)} />
                                                                {activeActionMenu === user.id && (
                                                                    <div className="absolute right-8 top-0 z-10 w-48 bg-white rounded-xl shadow-lg border border-zinc-200">
                                                                        {/* <p className=' flex justify-between items-center m-1 px-4 text-xs hover:bg-red-200 bg-red-50 border-t border-transparent rounded-xl text-red-500' onClick={() => setActiveActionMenu(null)}>  <span>
                                                                            Close</span><span className='p-2 '> < XMarkIcon /></span></p> */}
                                                                        <a href="#" onClick={(e) => { e.preventDefault(); handleOpenSidebar(activeActionMenu); setActiveActionMenu(null); }} className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100">View details</a>
                                                                        <a href="#" onClick={(e) => { e.preventDefault(); setIsEditUserModalOpen(true); }} className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100">Edit tenant</a>
                                                                        <a href="#" onClick={(e) => { e.preventDefault(); handleDeleteClick(user); }} className="block px-4 py-2 text-sm text-red-600 hover:bg-zinc-100">Deactivate user</a>

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
                                                Page {currentPage} of {isNaN(totalPages) ? 1 : totalPages}
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
                                    </>
                                    )}
                                    {
                                        location === 'bin' && (
                                            <>

                                                <BinAssignTable />
                                            </>
                                        )
                                    }



                                </div>


                                {/* Delete Confirmation Modal */}
                                {isDeleteModalOpen && (
                                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                        <div className="bg-white rounded-2xl  p-8  py-16 max-w-lg w-full text-center">
                                            <div className="flex justify-center mb-4">
                                                <TrashIcon />
                                            </div>
                                            <h2 className="text-xl font-bold text-red-600 mb-2">Deactivate  user?</h2>
                                            <p className="text-zinc-500 mb-6">Deactivating this tenant will remove them from your apartment. Any bins linked to their apartment will also be unassigned.</p>
                                            <div className="flex justify-center space-x-4">
                                                <button onClick={() => setIsDeleteModalOpen(false)} className="px-6 py-2 rounded-xl text-zinc-700 border border-zinc-300 hover:bg-zinc-100">Cancel</button>
                                                <button onClick={confirmDelete} className="px-6 py-2 rounded-xl text-white bg-red-600 hover:bg-red-700">Yes, Deactivate</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Delete Confirmation Modal */}


                                {/* Success Modal */}
                                {isSuccessModalOpen && (
                                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                        <div className="bg-white rounded-2xl  p-8 py-16 max-w-lg w-full text-center">
                                            <div className="flex justify-center mb-4">
                                                <img src="./images/checkgradient.png" alt="" className='h-16' />
                                            </div>
                                            <h2 className="text-xl font-bold text-green-700 mb-2">User Deactivated successfully</h2>
                                            <p className="text-zinc-600 mb-6">You have successfully remove this tenant from your apartment</p>
                                            <button onClick={() => setIsSuccessModalOpen(false)} className="w-full px-6 py-3 rounded-xl text-white bg-green-700 hover:bg-green-600">Back to dashboard</button>
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

            />
            <EditUserModal
                show={isEditUserModalOpen}
                onClose={() => setIsEditUserModalOpen(false)}
                devMode={true}
                userType="corporate"
                userId="user-123"
            />

            <TenantDetailsSideBar
                tenantId={selectedTenantId}
                isOpen={isSidebarOpen}
                onClose={handleCloseSidebar}
            />
        </div>


    );
}
export default UserManagement;