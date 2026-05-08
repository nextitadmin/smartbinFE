import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/FacilityMgrSideBar';
import Topbar from '../components/FacilityMgrTopBar';
import api from '../api/axiosConfig';

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

const CloseIcon = ({ className = 'w-5 h-5' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
);

const TeamMembers = () => {
    // --- State ---
    const [applications, setApplications] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortColumn, setSortColumn] = useState('date');
    const [sortDirection, setSortDirection] = useState('dsc');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const itemsPerPage = 6;
    const [notification, setNotification] = useState(null);
    const [activeActionMenu, setActiveActionMenu] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);
    const [editData, setEditData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        location: '',
        branch: ''
    });



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
            const { data } = await api.delete(`/team-members/${userToDelete.id}`);
            if (data.success) {
                setNotification({ type: 'success', message: data.message || 'Deleted successfully!' });
                setIsDeleteModalOpen(false);
                setUserToDelete(null);
                setIsSuccessModalOpen(true);
                fetchData(); // refresh the list
            } else {
                setNotification({ type: 'error', message: data.message || "Error deleting" });
                setIsDeleteModalOpen(false);
                setUserToDelete(null);
            }
        } catch (error) {
            setNotification({ type: 'error', message: "Error deleting team member" });
            console.log("API Error:", error);
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
        }
    };

    const handleEditClick = (user) => {
        setUserToEdit(user);
        setEditData({
            name: user.name,
            email: user.emailAddress,
            phoneNumber: user.phoneNo,
            location: '', // assuming not in current data
            branch: user.branch
        });
        setIsEditModalOpen(true);
        setActiveActionMenu(null);
    };

    const handleEditDataChange = (e) => {
        const { id, value } = e.target;
        setEditData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSubmitEdit = async () => {
        if (editData.name && editData.email && editData.phoneNumber && editData.branch) {
            try {
                const { data } = await api.put(`/team-members/${userToEdit.id}`, editData);
                if (data.success) {
                    setNotification({ type: 'success', message: data.message || 'Updated successfully!' });
                    setIsEditModalOpen(false);
                    fetchData(); // refresh the list
                } else {
                    setNotification({ type: 'error', message: data.message || "Error updating" });
                }
            } catch (error) {
                setNotification({ type: 'error', message: "Error updating" });
                console.log("API Error:", error);
            }
        } else {
            setNotification({ type: 'error', message: "Fill all fields" });
        }
    };

    const fetchData = async () => {
        try {
            const { data } = await api.get(`/team-members?page=${currentPage}&limit=${itemsPerPage}`);
            if (data.success) {
                const newData = data.data.map((item, index) => ({
                    sn: index + 1 + (currentPage - 1) * itemsPerPage,
                    id: item._id,
                    name: item.name,
                    dateAdded: item.createdAt?.slice(0, 10),
                    emailAddress: item.email,
                    phoneNo: item.phoneNumber,
                    branch: item.branch,
                    isDeleted: false
                }));
                setApplications(newData);
                setTotalPages(data.meta.paging.pages);
                setTotalItems(data.meta.paging.total);
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        // Add serial numbers to wastes data
        fetchData()
    }, [currentPage]);




    // --- Computed Properties ---
    const filteredApplications = useMemo(() => {
        if (!searchQuery) {
            return applications;
        }
        const lowerQuery = searchQuery.toLowerCase();
        return applications.filter(app => {
            return (
                app.name.toLowerCase().includes(lowerQuery) ||
                app.emailAddress.toLowerCase().includes(lowerQuery) ||
                app.phoneNo.toLowerCase().includes(lowerQuery) ||
                app.branch.toLowerCase().includes(lowerQuery) ||
                app.dateAdded.includes(lowerQuery)
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

            // if (sortColumn === 'date') {
            //     // Convert dates to comparable format (YY-MM-DD)
            //     valA = new Date(`20${valA.split('-').reverse().join('-')}`);
            //     valB = new Date(`20${valB.split('-').reverse().join('-')}`);
            // }

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





    // Placeholder Action Methods


    const exportData = () => {
        console.log("Export action triggered");
        setNotification({ type: 'error', message: 'Coming soon..' });
    };

    // const handleRowAction = (appId) => {
    //     console.log("Row action triggered for ID:", appId);
    // };


    // Modal states
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

    // Payment modal data


    // Pickup modal data
    const [newMemberData, setNewMemberData] = useState({
        name: '',
        email: '',
        phone: '',
        location: '',
        branch: ''
    });

    // Subscription modal data


    // Helper functions


    // Modal handlers
    const openModal = (modalName) => {

        if (modalName === 'newMember') {
            setIsAddMemberModalOpen(true);
            setNewMemberData({
                name: '',
                email: '',
                phone: '',
                location: '',
                branch: ''
            });
        }
        if (modalName === 'editMember') {
            setIsEditModalOpen(true);
        }
    };

    const closeModal = (modalName) => {
        if (modalName === 'newMember') {
            setIsAddMemberModalOpen(false);
            setNewMemberData({
                name: '',
                email: '',
                phone: '',
                location: '',
                branch: ''
            });
        }
        if (modalName === 'editMember') {
            setIsEditModalOpen(false);
            setUserToEdit(null);
            setEditData({
                name: '',
                email: '',
                phoneNumber: '',
                location: '',
                branch: ''
            });
        }
    };

    // Action handlers

    const handleNewMemberDataChange = (e) => {
        const { id, value } = e.target;
        setNewMemberData(prev => ({
            ...prev,
            [id]: value
        }));
    };





    const handleSubmitNewMember = async () => {

        if (newMemberData.name && newMemberData.email && newMemberData.phone && newMemberData.branch) {

            try {
                const { data } = await api.post("/team-members/add-member", {
                    name: newMemberData.name,
                    email: newMemberData.email,
                    phoneNumber: newMemberData.phone,
                    location: newMemberData.location,
                    branch: newMemberData.branch
                });

                if (data.success) {
                    setNotification({ type: 'success', message: data.message || 'Submitted successfully!' });
                    setIsAddMemberModalOpen(false);

                }
                else {
                    setNotification({ type: 'error', message: data.message || "Error submitting" });
                }
            } catch (error) {
                setNotification({ type: 'error', message: "Error submitting" });
                console.log("API Error:", error);
            }
        } else {
            setNotification({ type: 'error', message: "Fill all fields" });
        }
    };



    return (

        <div>
            <div className="flex sans h-screen max-w-screen">

                <Sidebar addkey="1" />
                <div className=" bg-zinc-100 min-h-screen   flex flex-col flex-1 overflow-y-auto  ">

                    <Topbar />
                    <div className="bg-zinc-100 font-sans">
                        <main className="p-4 md:p-10">
                            <div className="p-5 md:p-8 rounded-lg w-full mx-auto">
                                {/* Header */}
                                <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-xl md:text-2xl font-semibold text-zinc-800">Team Members</h1>
                                        <span className="bg-green-700 text-green-50 text-xs font-semibold px-2.5 py-2 rounded-full">
                                            {applications.length}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => openModal('newMember')}
                                            className="inline-flex items-center px-4 py-2 gap-3 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-green-700 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                        >

                                            Add new member
                                            <PlusIcon />
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
                                            placeholder="Search waste collections..."
                                            className="w-full lg:w-[24rem] pl-10 pr-4 py-2 border border-zinc-300 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
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
                                                <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('name')}>
                                                    <div className="flex items-center justify-between">
                                                        Name <span className={`sort-icon ${sortColumn === 'name' ? 'active' : ''}`}>
                                                            {sortIcon('name')}
                                                        </span>
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('emailAddress')}>
                                                    <div className="flex items-center justify-between">
                                                        Email <span className={`sort-icon ${sortColumn === 'emailAddress' ? 'active' : ''}`}>
                                                            {sortIcon('emailAddress')}
                                                        </span>
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('phoneNo')}>
                                                    <div className="flex items-center justify-between">
                                                        Phone Number<span className={`sort-icon ${sortColumn === 'phoneNo' ? 'active' : ''}`}>
                                                            {sortIcon('phoneNo')}
                                                        </span>
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('branch')}>
                                                    <div className="flex items-center justify-between">
                                                        Branch <span className={`sort-icon ${sortColumn === 'branch' ? 'active' : ''}`}>
                                                            {sortIcon('branch')}
                                                        </span>
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('dateAdded')}>
                                                    <div className="flex items-center justify-between">
                                                        Date Added<span className={`sort-icon ${sortColumn === 'dateAdded' ? 'active' : ''}`}>
                                                            {sortIcon('dateAdded')}
                                                        </span>
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-4 py-3 text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedApplications.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7" className="text-center py-10 text-zinc-500">No team members found.</td>
                                                </tr>
                                            ) : (
                                                sortedApplications.map(app => (
                                                    <tr key={app.id} className="bg-white border-b border-zinc-200 hover:bg-zinc-50 lg:h-20">
                                                        <td className="px-4 py-3 font-medium text-zinc-900">{app.sn}</td>
                                                        <td className="px-4 py-3 font-medium text-zinc-900 whitespace-nowrap">{app.name}</td>
                                                        <td className="px-4 py-3 font-medium text-zinc-900 whitespace-nowrap">{app.emailAddress}</td>
                                                        <td className="px-4 py-3 font-medium text-zinc-900 whitespace-nowrap">{app.phoneNo}</td>
                                                        <td className="px-4 py-3 font-medium text-zinc-900 whitespace-nowrap">{app.branch}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap">{app.dateAdded}</td>
                                                        <td className="py-4 px-6 text-sm text-zinc-500 relative">
                                                            <DotsVerticalIcon onClick={() => handleActionMenuToggle(app.id)} />
                                                            {activeActionMenu === app.id && (
                                                                <div className="absolute right-8 top-0 z-10 w-48 bg-white rounded-xl shadow-lg border border-zinc-200">
                                                                    <a href="#" onClick={(e) => { e.preventDefault(); handleEditClick(app); }} className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100">Edit</a>
                                                                    <a href="#" onClick={(e) => { e.preventDefault(); handleDeleteClick(app); }} className="block px-4 py-2 text-sm text-red-600 hover:bg-zinc-100">Delete</a>
                                                                </div>
                                                            )}
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
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </main>
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

            {/* Pickup Modal */}
            {isAddMemberModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content lg:py-12 lg:px-8 p-4">
                        <div className="flex justify-between items-center pb-6">
                            <div>
                                <h3 className="text-2xl font-semibold text-zinc-800">Add team member</h3>
                                <p className="text-zinc-500 mt-1">Add agents to your agency</p>
                            </div>
                            <button
                                onClick={() => closeModal('newMember')}
                                aria-label="Close"
                                className="text-zinc-700 hover:text-red-600 self-start"
                            >
                                <CloseIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <form className="py-6 space-y-5">

                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={newMemberData.name}
                                    onChange={handleNewMemberDataChange}
                                    required
                                    rows="3"
                                    className="form-input"
                                    placeholder="Name"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="text"
                                    id="email"
                                    value={newMemberData.email}
                                    onChange={handleNewMemberDataChange}
                                    required
                                    rows="3"
                                    className="form-input"
                                    placeholder="Email address"
                                />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-zinc-700 mb-1">
                                    Phone number
                                </label>
                                <input
                                    type="text"
                                    id="phone"
                                    value={newMemberData.phone}
                                    onChange={handleNewMemberDataChange}
                                    required
                                    rows="3"
                                    className="form-input"
                                    placeholder="Phone number"
                                />
                            </div>
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-zinc-700 mb-1">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    id="location"
                                    value={newMemberData.location}
                                    onChange={handleNewMemberDataChange}
                                    className="form-input"
                                    placeholder="Location"
                                />
                            </div>
                            <div>
                                <label htmlFor="branch" className="block text-sm font-medium text-zinc-700 mb-1">
                                    Branch
                                </label>
                                <input
                                    type="text"
                                    id="branch"
                                    value={newMemberData.branch}
                                    onChange={handleNewMemberDataChange}
                                    required
                                    rows="3"
                                    className="form-input"
                                    placeholder="Enter branch"
                                />
                            </div>
                        </form>

                        <div className="py-4 flex justify-end">
                            <button
                                type="button"
                                onClick={handleSubmitNewMember}
                                className="btn btn-primary w-full text-sm rounded-xl"
                            >
                                Add member
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Member Modal */}
            {isEditModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content lg:py-12 lg:px-8 p-4">
                        <div className="flex justify-between items-center pb-6">
                            <div>
                                <h3 className="text-2xl font-semibold text-zinc-800">Edit team member</h3>
                                <p className="text-zinc-500 mt-1">Edit team member details</p>
                            </div>
                            <button
                                onClick={() => closeModal('editMember')}
                                aria-label="Close"
                                className="text-zinc-700 hover:text-red-600 self-start"
                            >
                                <CloseIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <form className="py-6 space-y-5">

                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={editData.name}
                                    onChange={handleEditDataChange}
                                    required
                                    className="form-input"
                                    placeholder="Name"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={editData.email}
                                    onChange={handleEditDataChange}
                                    required
                                    className="form-input"
                                    placeholder="Email address"
                                />
                            </div>
                            <div>
                                <label htmlFor="phoneNumber" className="block text-sm font-medium text-zinc-700 mb-1">
                                    Phone number
                                </label>
                                <input
                                    type="text"
                                    id="phoneNumber"
                                    value={editData.phoneNumber}
                                    onChange={handleEditDataChange}
                                    required
                                    className="form-input"
                                    placeholder="Phone number"
                                />
                            </div>
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-zinc-700 mb-1">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    id="location"
                                    value={editData.location}
                                    onChange={handleEditDataChange}
                                    className="form-input"
                                    placeholder="Location"
                                />
                            </div>
                            <div>
                                <label htmlFor="branch" className="block text-sm font-medium text-zinc-700 mb-1">
                                    Branch
                                </label>
                                <input
                                    type="text"
                                    id="branch"
                                    value={editData.branch}
                                    onChange={handleEditDataChange}
                                    required
                                    className="form-input"
                                    placeholder="Enter branch"
                                />
                            </div>
                        </form>

                        <div className="py-4 flex justify-end">
                            <button
                                type="button"
                                onClick={handleSubmitEdit}
                                className="btn btn-primary w-full text-sm rounded-xl"
                            >
                                Update member
                            </button>
                        </div>
                    </div>
                </div>
            )}
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




export default TeamMembers;