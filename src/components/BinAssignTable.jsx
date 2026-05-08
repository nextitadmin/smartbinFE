import React, { useState, useMemo, useEffect } from 'react';
import AssignBinModal from './AssignBinModal';
import api from '../api/axiosConfig';
// --- DUMMY DATA ---
const initialBins = [
    { id: 1, binId: '#123456', status: 'Assigned', assignedTo: 'Adébímpé Sóríyán', buildingName: 'Parkview Estate' },
    { id: 2, binId: '#123457', status: 'Assigned', assignedTo: 'Adébímpé Sóríyán', buildingName: 'Chevy View' },
    { id: 3, binId: '#123458', status: 'Unassigned', assignedTo: '-', buildingName: '-' },
    { id: 4, binId: '#123459', status: 'Assigned', assignedTo: 'Martins Madueke', buildingName: 'Pinnock Beach' },
    { id: 5, binId: '#123460', status: 'Unassigned', assignedTo: '-', buildingName: 'Pinnock Beach' },
    { id: 6, binId: '#123461', status: 'Assigned', assignedTo: 'Adébímpé Sóríyán', buildingName: 'Lekki Gardens' },
    { id: 7, binId: '#123462', status: 'Assigned', assignedTo: 'Fisayo Mabel', buildingName: 'Ikoyi Towers' },
    { id: 8, binId: '#123463', status: 'Unassigned', assignedTo: '-', buildingName: '-' },
    { id: 9, binId: '#123464', status: 'Assigned', assignedTo: 'John Smith', buildingName: 'Banana Island' },
    { id: 10, binId: '#123465', status: 'Unassigned', assignedTo: '-', buildingName: 'Victoria Island' },
    { id: 11, binId: '#123466', status: 'Assigned', assignedTo: 'Jane Doe', buildingName: 'Eko Atlantic' },
    { id: 12, binId: '#123467', status: 'Assigned', assignedTo: 'Peter Jones', buildingName: 'Oniru Beach' },
    { id: 13, binId: '#123468', status: 'Unassigned', assignedTo: '-', buildingName: '-' },
    { id: 14, binId: '#123469', status: 'Assigned', assignedTo: 'Emily White', buildingName: 'Maryland Mall' },
    { id: 15, binId: '#123470', status: 'Unassigned', assignedTo: '-', buildingName: 'Ikeja City Mall' },
    { id: 16, binId: '#123471', status: 'Assigned', assignedTo: 'David Green', buildingName: 'Surulere Complex' },
    { id: 17, binId: '#123472', status: 'Assigned', assignedTo: 'Sarah Brown', buildingName: 'Apapa Wharf' },
    { id: 18, binId: '#123473', status: 'Unassigned', assignedTo: '-', buildingName: '-' },
    { id: 19, binId: '#123474', status: 'Assigned', assignedTo: 'Laura Black', buildingName: 'Festac Town' },
    { id: 20, binId: '#123475', status: 'Unassigned', assignedTo: '-', buildingName: 'Badagry Heights' },
];

// --- SVG ICONS (Heroicons) ---
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-zinc-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);

const SortIcon = ({ direction }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 inline-block text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {direction === 'asc' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />}
        {direction === 'desc' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />}
        {!direction && (
            <>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" opacity="0.3" />
            </>
        )}
    </svg>
);


// --- MAIN COMPONENT ---
export default function AssignBinTable() {
    const [bins, setBins] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const binsPerPage = 6;

    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchApprovedBins = async (page = 1) => {
        try {
            const response = await api.get(`/facility-managers/user/approved-bins?page=${page}&limit=${binsPerPage}`);
            if (response.data?.success && Array.isArray(response.data.data)) {
                const newBins = response.data.data.map((item, index) => ({
                    id: item.id ?? item._id ?? `${item.binId ?? item.binID ?? index}-${page}`,
                    binId: item.binId ?? item.binID ?? item.wasteID ?? item.id ?? `#${index + 1}`,
                    status: item.status ?? item.binStatus ?? 'Approved',
                    assignedTo: item.assignedTo ?? item.tenantName ?? item.userName ?? '-',
                    buildingName: item.buildingName ?? item.location ?? item.propertyName ?? '-',
                }));
                setBins(newBins);
            } else {
                console.warn('Approved bins API returned no data:', response.data?.message);
                setBins([]);
            }
        } catch (error) {
            console.error('Error fetching approved bins:', error);
            setBins([]);
        }
    };

    // Dummy data for demonstration
    const binToAssign = { id: 3, binId: '#123458', status: 'Unassigned' };
    const availableTenants = [
        'Babatunde Ajegunle',
        'Chioma Nwosu',
        'Emeka Okafor',
        'Fatima Bello',
        'Tunde Adebayo'
    ];

    // Function to open the modal
    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    // Function to close the modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    // Function to handle the assignment logic
    const handleAssignBin = (bin, tenant) => {
        console.log(`Assigning Bin ${bin.binId} to ${tenant}`);
        alert(`Bin ${bin.binId} has been assigned to ${tenant}.`);
        // Here you would typically update your state or make an API call
        handleCloseModal();
    };


    useEffect(() => {
        setBins(initialBins);
        fetchApprovedBins(currentPage);
    }, [currentPage]);



    const handleExport = () => {
        alert('Export data feature coming soon!');
    };

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = null; // Reset sort
            key = null;
        }
        setSortConfig({ key, direction });
    };

    const sortedAndFilteredBins = useMemo(() => {
        let sortableItems = [...bins];

        // Filter logic
        if (searchTerm) {
            sortableItems = sortableItems.filter(bin =>
                Object.values(bin).some(val =>
                    String(val).toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }

        // Sorting logic
        if (sortConfig.key !== null && sortConfig.direction !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return sortableItems;
    }, [bins, searchTerm, sortConfig]);

    // Pagination logic
    const totalPages = Math.ceil(sortedAndFilteredBins.length / binsPerPage);
    const paginatedBins = sortedAndFilteredBins.slice((currentPage - 1) * binsPerPage, currentPage * binsPerPage);

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

    const SortableHeader = ({ label, columnKey }) => (
        <th
            className="py-3 px-4 sm:px-6 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-pointer select-none"
            onClick={() => requestSort(columnKey)}
        >
            {label}
            {sortConfig.key === columnKey ? <SortIcon direction={sortConfig.direction} /> : <SortIcon />}
        </th>
    );

    return (
        <div className=" min-h-screen font-sans">
            <div className=" mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div className="relative flex-grow sm:max-w-xs w-full mb-4 sm:mb-0">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon />
                        </div>
                        <input
                            type="text"
                            placeholder="Search members"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // Reset page on new search
                            }}
                            className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Export data
                    </button>
                </div>

                {/* Table container */}
                <div className="bg-white rounded-2xl   overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead className="bg-white border-b border-zinc-200">
                                <tr>
                                    <SortableHeader label="S/N" columnKey="id" />
                                    <SortableHeader label="Bin ID" columnKey="binId" />
                                    <SortableHeader label="Bin Status" columnKey="status" />
                                    <SortableHeader label="Assigned to" columnKey="assignedTo" />
                                    <SortableHeader label="Building name" columnKey="buildingName" />
                                    <th className="py-3 px-4 sm:px-6 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200">
                                {paginatedBins.map((bin, index) => (
                                    <tr key={bin.id} className="hover:bg-zinc-50">
                                        <td className="py-4 px-4 sm:px-6 text-sm text-zinc-900 whitespace-nowrap">{(currentPage - 1) * binsPerPage + index + 1}</td>
                                        <td className="py-4 px-4 sm:px-6 text-sm text-zinc-500 whitespace-nowrap">{bin.binId}</td>
                                        <td className="py-4 px-4 sm:px-6 text-sm whitespace-nowrap">
                                            <span className={`font-medium ${bin.status === 'Assigned' ? 'text-green-600' : 'text-red-600'}`}>
                                                {bin.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 sm:px-6 text-sm text-zinc-500 whitespace-nowrap">{bin.assignedTo}</td>
                                        <td className="py-4 px-4 sm:px-6 text-sm text-zinc-500 whitespace-nowrap">{bin.buildingName}</td>
                                        <td className="py-4 px-4 sm:px-6 text-sm text-zinc-500 whitespace-nowrap">
                                            {bin.status === 'Unassigned' && (
                                                <button
                                                    onClick={() => { handleOpenModal(); }}
                                                    className="px-6 py-2 text-sm font-medium text-zinc-800 bg-[#A1D762] rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A1D762]"
                                                >
                                                    Assign
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>



                    <AssignBinModal
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        onAssign={handleAssignBin}
                        bin={binToAssign}
                        tenants={availableTenants}
                    />

                    {/* Pagination */}
                    <div className="flex items-center justify-between py-3 px-4 sm:px-6 border-t border-zinc-200">
                        <div className="text-sm text-zinc-700">
                            Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button onClick={handlePrevPage} disabled={currentPage === 1} className="p-2 border border-zinc-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                            </button>
                            <button onClick={handleNextPage} disabled={currentPage === totalPages || sortedAndFilteredBins.length === 0} className="p-2 border border-zinc-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
