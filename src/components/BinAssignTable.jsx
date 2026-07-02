import React, { useState, useMemo, useEffect } from 'react';
import AssignBinModal from './AssignBinModal';
import api from '../api/axiosConfig';

// --- SVG ICONS ---

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
    // ── No dummy data — start empty, show spinner until fetch resolves ──
    const [bins, setBins] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const binsPerPage = 6;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBin, setSelectedBin] = useState(null);

    const availableTenants = [
        'Babatunde Ajegunle',
        'Chioma Nwosu',
        'Emeka Okafor',
        'Fatima Bello',
        'Tunde Adebayo',
    ];

    // ─── Fetch ────────────────────────────────────────────────────────────────
    // setIsLoading(false) is in finally so the spinner stays until the request
    // settles — previously setBins(initialBins) ran synchronously before the
    // fetch, causing dummy rows to flash on screen.

    const fetchApprovedBins = async (page = 1) => {
        setIsLoading(true);
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
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchApprovedBins(currentPage);
    }, [currentPage]);

    // ─── Handlers ─────────────────────────────────────────────────────────────

    const handleExport = () => alert('Export data feature coming soon!');

    const handleOpenModal = (bin) => {
        setSelectedBin(bin);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedBin(null);
    };

    const handleAssignBin = (bin, tenant) => {
        console.log(`Assigning Bin ${bin.binId} to ${tenant}`);
        alert(`Bin ${bin.binId} has been assigned to ${tenant}.`);
        handleCloseModal();
        fetchApprovedBins(currentPage); // refresh after assign
    };

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = null;
            key = null;
        }
        setSortConfig({ key, direction });
    };

    // ─── Derived data ─────────────────────────────────────────────────────────

    const sortedAndFilteredBins = useMemo(() => {
        let items = [...bins];

        if (searchTerm) {
            items = items.filter((bin) =>
                Object.values(bin).some((val) =>
                    String(val).toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }

        if (sortConfig.key && sortConfig.direction) {
            items.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return items;
    }, [bins, searchTerm, sortConfig]);

    const totalPages = Math.ceil(sortedAndFilteredBins.length / binsPerPage);
    const paginatedBins = sortedAndFilteredBins.slice((currentPage - 1) * binsPerPage, currentPage * binsPerPage);

    const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage((p) => p + 1); };
    const handlePrevPage = () => { if (currentPage > 1) setCurrentPage((p) => p - 1); };

    const SortableHeader = ({ label, columnKey }) => (
        <th
            className="py-3 px-4 sm:px-6 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-pointer select-none"
            onClick={() => requestSort(columnKey)}
        >
            {label}
            {sortConfig.key === columnKey ? <SortIcon direction={sortConfig.direction} /> : <SortIcon />}
        </th>
    );

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen font-sans">
            <div className="mx-auto">
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
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-10 pr-4 py-2 border border-zinc-300 bg-white rounded-md focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Export data
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-16 text-zinc-500 text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 animate-spin">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                </svg>
                                Loading bins...
                            </div>
                        ) : (
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
                                    {paginatedBins.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-10 text-zinc-500 text-sm">No bins found.</td>
                                        </tr>
                                    ) : (
                                        paginatedBins.map((bin, index) => (
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
                                                            onClick={() => handleOpenModal(bin)}
                                                            className="px-6 py-2 text-sm font-medium text-zinc-800 bg-[#A1D762] rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A1D762]"
                                                        >
                                                            Assign
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <AssignBinModal
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        onAssign={handleAssignBin}
                        bin={selectedBin}
                        tenants={availableTenants}
                    />

                    {/* Pagination */}
                    {!isLoading && (
                        <div className="flex items-center justify-between py-3 px-4 sm:px-6 border-t border-zinc-200">
                            <div className="text-sm text-zinc-700">
                                Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages || 1}</span>
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
                    )}
                </div>
            </div>
        </div>
    );
}