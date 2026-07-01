import React, { useMemo, useState, useEffect } from 'react';
import Sidebar from '../components/FacilityMgrSideBar';
import Topbar from '../components/FacilityMgrTopBar';

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-zinc-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
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

const CloseIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const initialFacilities = [
  { id: 'facility-1', sn: 1, buildingName: 'Aerodome', address: '12, Awolowo Road, Ikoyi, Lagos', lga: 'Alimosho' },
  { id: 'facility-2', sn: 2, buildingName: 'Park View', address: '45, Ogunlana Drive, Surulere, Lagos', lga: 'Kosofe' },
  { id: 'facility-3', sn: 3, buildingName: 'Banana Island', address: '4, Bode Thomas Street, Surulere, Lagos', lga: 'Ajerigbe' },
  { id: 'facility-4', sn: 4, buildingName: 'Pinnock Beach', address: '8, Akin Adesola Street, Victoria Island', lga: 'Festac' },
  { id: 'facility-5', sn: 5, buildingName: 'Lekki Garden', address: '8, Akin Adesola Street, Victoria Island', lga: 'Ikorodu' },
  { id: 'facility-6', sn: 6, buildingName: 'Lekki Garden', address: '8, Akin Adesola Street, Victoria Island', lga: 'Magodo' },
];

const MyFacilities = () => {
  const [facilities, setFacilities] = useState(initialFacilities);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeActionMenu, setActiveActionMenu] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [notification, setNotification] = useState(null);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [formData, setFormData] = useState({ buildingName: '', buildingType: '', address: '', lga: '', closestLandmark: '' });

  const facilitiesPerPage = 6;

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const filteredFacilities = useMemo(() => {
    if (!searchQuery) return facilities;
    const lowerSearch = searchQuery.toLowerCase();
    return facilities.filter(item =>
      item.buildingName.toLowerCase().includes(lowerSearch) ||
      item.address.toLowerCase().includes(lowerSearch) ||
      item.lga.toLowerCase().includes(lowerSearch)
    );
  }, [facilities, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredFacilities.length / facilitiesPerPage));
  const paginatedFacilities = filteredFacilities.slice((currentPage - 1) * facilitiesPerPage, currentPage * facilitiesPerPage);

  const openAddModal = () => {
    setIsEditMode(false);
    setSelectedFacility(null);
    setFormData({ buildingName: '', buildingType: '', address: '', lga: '', closestLandmark: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (facility) => {
    setIsEditMode(true);
    setSelectedFacility(facility);
    setFormData({
      buildingName: facility.buildingName,
      buildingType: facility.buildingType || '',
      address: facility.address,
      lga: facility.lga,
      closestLandmark: facility.closestLandmark || '',
    });
    setIsModalOpen(true);
    setActiveActionMenu(null);
  };

  const handleFormChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveFacility = async () => {
    if (!formData.buildingName || !formData.buildingType || !formData.address || !formData.lga) {
      setNotification({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    if (isEditMode && selectedFacility) {
      setFacilities(prev => prev.map(item => item.id === selectedFacility.id ? { ...item, ...formData } : item));
      setNotification({ type: 'success', message: 'Facility updated successfully.' });
    } else {
      const nextFacility = {
        id: `facility-${Date.now()}`,
        sn: facilities.length + 1,
        buildingName: formData.buildingName,
        buildingType: formData.buildingType,
        address: formData.address,
        lga: formData.lga,
        closestLandmark: formData.closestLandmark,
      };
      setFacilities(prev => [...prev, nextFacility]);
      setNotification({ type: 'success', message: 'Facility added successfully.' });
    }

    setIsModalOpen(false);
  };

  const handleDeleteClick = (facility) => {
    setSelectedFacility(facility);
    setActiveActionMenu(null);
    const confirmed = window.confirm('Delete this facility?');
    if (confirmed) {
      setFacilities(prev => prev.filter(item => item.id !== facility.id));
      setNotification({ type: 'success', message: 'Facility deleted successfully.' });
      setCurrentPage(1);
    }
  };

  const handleExport = () => {
    setNotification({ type: 'info', message: 'Export feature coming soon.' });
  };

  const handlePrev = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  return (
    <div className="flex sans h-screen max-w-screen">
      <Sidebar addkey="my-facilities" />
      <div className="bg-zinc-100 min-h-screen flex flex-col flex-1 overflow-y-auto">
        <Topbar />
        <main className="p-4 md:p-6">
          <div className="min-h-screen font-sans p-4 md:p-6">
            <div className="mx-auto rounded-3xl p-4 sm:p-6 bg-white shadow-sm border border-zinc-200">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-zinc-900">My facilities</h1>
                  <span className="inline-flex items-center justify-center rounded-full bg-green-700 px-3 py-1 text-xs font-semibold text-white">{filteredFacilities.length}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                  <button onClick={handleExport} className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                    Export
                  </button>
                  <button onClick={openAddModal} className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800">
                    <PlusIcon />
                    Add facility
                  </button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_auto] items-center mb-6">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <SearchIcon />
                  </div>
                  <input
                    type="text"
                    placeholder="Search members"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="w-full rounded-2xl border border-zinc-300 bg-white py-3 pl-11 pr-4 text-sm text-zinc-800 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={handleExport} className="hidden sm:inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                    Filter
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-3xl border border-zinc-200 bg-white shadow-sm">
                <table className="min-w-full text-left text-sm text-zinc-700">
                  <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
                    <tr>
                      <th className="px-5 py-4">S/N</th>
                      <th className="px-5 py-4">Building name</th>
                      <th className="px-5 py-4">Address</th>
                      <th className="px-5 py-4">LGA</th>
                      <th className="px-5 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedFacilities.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-5 py-8 text-center text-sm text-zinc-500">No facilities found.</td>
                      </tr>
                    ) : paginatedFacilities.map(facility => (
                      <tr key={facility.id} className="border-b border-zinc-200 last:border-none hover:bg-zinc-50">
                        <td className="px-5 py-4 text-sm font-medium text-zinc-800">{facility.sn}</td>
                        <td className="px-5 py-4 text-sm text-zinc-700">{facility.buildingName}</td>
                        <td className="px-5 py-4 text-sm text-zinc-700 max-w-[320px] overflow-hidden text-ellipsis whitespace-nowrap">{facility.address}</td>
                        <td className="px-5 py-4 text-sm text-zinc-700">{facility.lga}</td>
                        <td className="px-5 py-4 text-right">
                          <div className="relative inline-flex">
                            <button onClick={() => setActiveActionMenu(activeActionMenu === facility.id ? null : facility.id)} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200">
                              <DotsVerticalIcon />
                            </button>
                            {activeActionMenu === facility.id && (
                              <div className="absolute right-0 z-10 mt-2 w-44 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg">
                                <button onClick={() => openEditModal(facility)} className="w-full px-4 py-3 text-left text-sm text-zinc-700 hover:bg-zinc-50">Edit facility</button>
                                <button onClick={() => handleDeleteClick(facility)} className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-zinc-50">Delete facility</button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-col gap-3 justify-between sm:flex-row sm:items-center">
                <div className="text-sm text-zinc-500">Page {currentPage} of {totalPages}</div>
                <div className="flex items-center gap-2">
                  <button onClick={handlePrev} disabled={currentPage === 1} className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-zinc-50">
                    Prev
                  </button>
                  <button onClick={handleNext} disabled={currentPage === totalPages} className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-zinc-50">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900">{isEditMode ? 'Edit facility' : 'Add a facility'}</h2>
                <p className="text-sm text-zinc-500">Manage the facility details for your dashboard.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100">
                <CloseIcon />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-zinc-700">
                <span>Building name</span>
                <input id="buildingName" value={formData.buildingName} onChange={handleFormChange} placeholder="Building name" className="w-full rounded-2xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100" />
              </label>
              <label className="space-y-2 text-sm text-zinc-700">
                <span>Building type</span>
                <input id="buildingType" value={formData.buildingType} onChange={handleFormChange} placeholder="Building type" className="w-full rounded-2xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100" />
              </label>
              <label className="space-y-2 text-sm text-zinc-700 sm:col-span-2">
                <span>Address of facility</span>
                <input id="address" value={formData.address} onChange={handleFormChange} placeholder="Address" className="w-full rounded-2xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100" />
              </label>
              <label className="space-y-2 text-sm text-zinc-700">
                <span>Local Government</span>
                <input id="lga" value={formData.lga} onChange={handleFormChange} placeholder="Local Government" className="w-full rounded-2xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100" />
              </label>
              <label className="space-y-2 text-sm text-zinc-700">
                <span>Closest landmark</span>
                <input id="closestLandmark" value={formData.closestLandmark} onChange={handleFormChange} placeholder="Closest landmark" className="w-full rounded-2xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100" />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50">Cancel</button>
              <button onClick={handleSaveFacility} className="rounded-xl bg-green-700 px-5 py-3 text-sm font-medium text-white hover:bg-green-800">Next</button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div className="fixed bottom-6 right-6 z-50 rounded-3xl border border-zinc-200 bg-white px-5 py-4 shadow-lg">
          <p className="text-sm font-medium text-zinc-900">{notification.message}</p>
        </div>
      )}
    </div>
  );
};

export default MyFacilities;
