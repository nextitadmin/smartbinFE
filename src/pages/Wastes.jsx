import React, { useState, useEffect, useMemo } from 'react';
import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';
import api from '../api/axiosConfig';
import AlatPayButton from '../components/AlatPayButton';
import useAuthStore from '../store/authStore';
import useResidentStore from '../store/useResidentStore';



const Wastes = () => {
    // --- State ---
    const [applications, setApplications] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortColumn, setSortColumn] = useState('date');
    const [sortDirection, setSortDirection] = useState('dsc');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const itemsPerPage = 6;
    const [otherReason, setOtherReason] = useState('');
    const [notification, setNotification] = useState(null);
    const [pickUpAmount, setPickUpAmount] = useState(0);
    const [debitType, setDebitType] = useState(''); // 'wallet' or 'smartbin'
    const noteOptions = ['An Occasion', 'An Emergency', 'Other reasons'];


    const Resident = useResidentStore((state) => state.residentInfo);


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
            const { data } = await api.get(`/WasteMgmt/my-waste-applications?PageNo=${currentPage}&PageSize=${itemsPerPage}`);
            if (data.succeeded) {
                const newData = data.data.data.map((item, index) => ({
                    sn: index + 1 + (currentPage - 1) * itemsPerPage,
                    wasteId: item.wasteID,
                    date: item.requestDate?.slice(0, 10),
                    address: item.address,
                    status: item.statusName,
                    representative: item.pickupBy
                }));;
                setApplications(newData);
                setTotalPages(data.data.totalPages);
                setTotalItems(data.data.totalCount);
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        // Add serial numbers to wastes data
        fetchData()
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
                app.wasteId.toLowerCase().includes(lowerQuery) ||
                app.address.toLowerCase().includes(lowerQuery) ||
                app.representative.toLowerCase().includes(lowerQuery) ||
                app.status.toLowerCase().includes(lowerQuery) ||
                formatDate(app.date).includes(lowerQuery)
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

            if (sortColumn === 'date') {
                // Convert dates to comparable format (YY-MM-DD)
                valA = new Date(`20${valA.split('-').reverse().join('-')}`);
                valB = new Date(`20${valB.split('-').reverse().join('-')}`);
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
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'delivered':
                return 'bg-green-100 text-green-800 border-green-300';
            default:
                return 'bg-zinc-100 text-zinc-800 border-zinc-300';
        }
    };



    // Placeholder Action Methods
    const filterData = () => {
        console.log("Filter action triggered");
        setNotification({ type: 'error', message: 'Coming soon..' });
    };

    const exportData = () => {
        console.log("Export action triggered");
        setNotification({ type: 'error', message: 'Coming soon..' });
    };

    // const handleRowAction = (appId) => {
    //     console.log("Row action triggered for ID:", appId);
    // };


    // Modal states
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);

    // Payment modal data
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
    const paymentOptions = [
        { id: 'card', text: 'Pay with Alat By Wema', icon: AlatIcon },
    ];

    // Pickup modal data
    const [pickupRequestData, setPickupRequestData] = useState({
        date: '',
        time: '',
        phone: '',
        address: '',
        note : ''
    });

    // Subscription modal data


    // Helper functions
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Modal handlers
    const openModal = (modalName) => {
        if (modalName === 'payment') setIsPaymentModalOpen(true);
        else if (modalName === 'pickup') {
            setIsPickupModalOpen(true);
            setPickupRequestData({
                date: '',
                time: '',
                phone: '',
                address: '',
                note : ''
            });
            setOtherReason('');
        };
    };

    const closeModal = (modalName) => {
        if (modalName === 'payment') setIsPaymentModalOpen(false);
        else if (modalName === 'pickup') {
            setIsPickupModalOpen(false);
            // setPickupRequestData({
            //     date: '',
            //     time: '',
            //     phone: '',
            //     address: ''
                    // note : ''
            // });
        };
    };





    const fetchPickUpAmount = async () => {

        try {
            const response = await api.get("/Wallet/fetch-amount?paymentType=waste");

            console.log("Response from fetch-amount:", response);
            const data = response.data.data;
            if (response.data.succeeded) {
                setPickUpAmount(data.amountToDebit);
                setDebitType(data.debitType);
                console.log(debitType, " debit type");
                console.log("Smart bin amount fetched:", data.amountToDebit);
            } else {
                console.error("Failed to fetch smart bin amount:", response.message);
            }
        } catch (error) {
            console.error("Error fetching smart bin amount:", error);

        }
    }

    useEffect(() => {
        fetchPickUpAmount();
    }, []);




    // Action handlers

    const handlePayment = async (response) => {

        let ref, channel;
        let amount = 10

        if (selectedPaymentMethod === 'wallet') {
            ref = response.reference;
            channel = "wallet";

        }



        else if (selectedPaymentMethod === 'card') {
            ref = response.data.reference;
            channel = "card";
        }
        console.log("Payment response:", response);
        if (ref !== '' && amount !== '' && channel !== '') {

            if (!selectedPaymentMethod) {
                setNotification({ type: 'error', message: "Select a payment method" });
                return;
            }
            console.log("Processing Payment with:", selectedPaymentMethod);
            await SubmitPickupRequest({ ref, amount, channel }).finally(() => {
                console.log("submitting pickup request completed");
            });
            closeModal('payment');

        } else {
            console.error("Payment response missing required fields");
            setNotification({ type: 'error', message: "Error submitting" });
            handleBack();
        }
    }


    const handleBack = () => {
        const data = pickupRequestData;
        console.log(data);
        closeModal('payment');
        openModal('pickup');
        setPickupRequestData(data);
    }

    const combineDateAndTime = (date, time) => {
        const [year, month, day] = date.split('-');
        const [hours, minutes] = time.split(':');
        return new Date(year, month - 1, day, hours, minutes);
    };

    const handlePaymentWithWallet = async () => {



        try {
            const response = await api.post("/wallets/charge", {
                userId: useAuthStore.getState().token, // Assuming you have a userId in your auth store
                drAccountNo: Resident.accountNo,
                amount: pickUpAmount,
                narration: "Waste Pickup Payment",
                paymentPurpose: "Waste Pickup Application"
            });
            const data = response.data;

            console.log("Response from debit-wallet:", data);

            if (data.succeeded) {
                console.log("Wallet payment successful:", data.succeeded, "and message:", data.message);

                let successMessage = data.message.split('|');
                let successRef; // Assuming the first part is the reference
                if (successMessage.length > 1) {
                    successRef = successMessage[1];
                }


                await handlePayment({ reference: successRef, channel: "wallet" }).finally(() => {
                    console.log("Payment with wallet completed");
                });// Return the response for further processing
                setNotification({ type: 'success', message: 'Payment successful!' });

            } else {
                console.error("Wallet payment failed:", data.message);
                setNotification({ type: 'error', message: data.message || "Error processing wallet payment" });
            }

        }
        catch (error) {
            console.error("Error processing wallet payment:", error);
            setNotification({ type: 'error', message: "Error processing wallet payment" });
        }


        // Mock response for wallet payment



    }



    const SubmitPickupRequest = async (response) => {
        if (pickupRequestData.date && pickupRequestData.time && pickupRequestData.phone && pickupRequestData.address && pickupRequestData.note) {
            const newDate = combineDateAndTime(pickupRequestData.date, pickupRequestData.time);
            try {
                const { data } = await api.post("/WasteMgmt/new-waste-req", {
                    address: pickupRequestData.address,
                    pickupDate: newDate,
                    phoneNo: pickupRequestData.phone,
                    transRef: response.ref,
                    amountPaid: pickUpAmount,
                    note : otherReason || pickupRequestData.note,
                    paymentChannel: response.channel
                });

                if (data.succeeded) {
                    setNotification({ type: 'success', message: data.message || 'Submitted successfully!' });
                    console.log("Submitting Pickup Request:", pickupRequestData);
                    setOtherReason('');
                    fetchData();
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

    const handlePickupRequest = async () => {
        if (pickupRequestData.date && pickupRequestData.time && pickupRequestData.phone && pickupRequestData.address && pickupRequestData.note) {
            closeModal('pickup');
            setNotification({ type: 'success', message: 'Saved successfully, complete payment!' });
            openModal('payment');
        } else {
            setNotification({ type: 'error', message: "Fill all fields" });
        }
    };



    const handlePickupDataChange = (e) => {
        const { id, value } = e.target;
        setPickupRequestData(prev => ({
            ...prev,
            [id]: value
        }));
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
                                        <h1 className="text-xl md:text-2xl font-semibold text-zinc-800">Waste Collections</h1>
                                        <span className="bg-green-700 text-green-50 text-xs font-semibold px-2.5 py-2 rounded-full">
                                            {applications.length}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => openModal('pickup')}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-green-700 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                        >
                                            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                            </svg>
                                            Schedule Collection
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
                                                <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('wasteId')}>
                                                    <div className="flex items-center justify-between">
                                                        Waste ID <span className={`sort-icon ${sortColumn === 'wasteId' ? 'active' : ''}`}>
                                                            {sortIcon('wasteId')}
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
                                                <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('address')}>
                                                    <div className="flex items-center justify-between">
                                                        Address <span className={`sort-icon ${sortColumn === 'address' ? 'active' : ''}`}>
                                                            {sortIcon('address')}
                                                        </span>
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('representative')}>
                                                    <div className="flex items-center justify-between">
                                                        Representative <span className={`sort-icon ${sortColumn === 'representative' ? 'active' : ''}`}>
                                                            {sortIcon('representative')}
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
                                                {/* <th scope="col" className="px-4 py-3 text-center">Action</th> */}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedApplications.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7" className="text-center py-10 text-zinc-500">No waste collections found.</td>
                                                </tr>
                                            ) : (
                                                sortedApplications.map(app => (
                                                    <tr key={app.wasteId} className="bg-white border-b border-zinc-200 hover:bg-zinc-50 lg:h-20">
                                                        <td className="px-4 py-3 font-medium text-zinc-900">{app.sn}</td>
                                                        <td className="px-4 py-3 font-medium text-zinc-900 whitespace-nowrap">{app.wasteId}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap">{formatDate(app.date)}</td>
                                                        <td className="px-4 py-3">{app.address}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap">{app.representative}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <span className={`px-3 py-1 border rounded-full text-xs font-medium inline-block ${getStatusClass(app.status)}`}>
                                                                {app.status}
                                                            </span>
                                                        </td>
                                                        {/* <td className="px-4 py-3 text-center">
                                                            <button
                                                                onClick={() => handleRowAction(app.wasteId)}
                                                                type="button"
                                                                className="p-1 text-zinc-500 hover:text-zinc-700"
                                                            >
                                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                                                                </svg>
                                                            </button>
                                                        </td> */}
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
            {/* Payment Modal */}
            {isPaymentModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content lg:p-8">
                        <div className="flex justify-between items-center py-6 mx-8 border-b border-zinc-200">
                            <h3 className="text-lg font-semibold text-zinc-800">Select Payment Method</h3>
                            <button
                                onClick={() => closeModal('payment')}
                                aria-label="Close"
                                className="text-zinc-700 hover:text-red-600"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        <div className="py-6 space-y-4">
                            <label className="px-6 py-4 rounded-lg flex items-center gap-4">
                                <WalletIcon />
                                <span className="text-sm font-medium text-zinc-800 flex-grow">
                                    {`Pay from wallet (${pickUpAmount})`}
                                </span>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    id="wallet"
                                    value="wallet"
                                    checked={selectedPaymentMethod === 'wallet'}
                                    onChange={() => setSelectedPaymentMethod('wallet')}
                                    className="custom-radio"
                                />
                            </label>

                            {paymentOptions.map((option) => {
                                const Icon = option.icon;
                                return (
                                    <label
                                        key={option.id}
                                        className="px-6 py-4 rounded-lg flex items-center gap-4"
                                    >
                                        <Icon />
                                        <span className="text-sm font-medium text-zinc-800 flex-grow">
                                            {option.text}
                                        </span>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            id={`payment_${option.id}`}
                                            value={option.id}
                                            checked={selectedPaymentMethod === option.id}
                                            onChange={() => setSelectedPaymentMethod(option.id)}
                                            className="custom-radio"
                                        />
                                    </label>
                                );
                            })}
                        </div>

                        <div className="px-6 py-4 flex flex-col items-center gap-3">
                            {
                                selectedPaymentMethod === 'card' ?
                                    (
                                        <AlatPayButton
                                            //all details provided by the api request in the component
                                            amount={pickUpAmount}
                                            onTransaction={() => { handlePayment }}
                                            buttonText="Pay Now with ALATPay"
                                            buttonClassName="btn btn-primary w-full"
                                        />
                                    )
                                    :
                                    (
                                        <button
                                            onClick={handlePaymentWithWallet}
                                            className="btn btn-primary w-full"
                                        >
                                            Make Payment
                                        </button>

                                    )

                            }
                            <button
                                onClick={handleBack}
                                className="w-full text-center font-medium text-green-700 hover:text-green-900 py-2"
                            >
                                Go back
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pickup Modal */}
            {isPickupModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content lg:py-12 lg:px-8">
                        <div className="flex justify-between items-center pb-6">
                            <div>
                                <h3 className="text-2xl font-semibold text-zinc-800">Request for pickup</h3>
                                <p className="text-zinc-500 mt-1">Request for your waste to be disposed</p>
                            </div>
                            <button
                                onClick={() => closeModal('pickup')}
                                aria-label="Close"
                                className="text-zinc-700 hover:text-red-600 self-start"
                            >
                                <CloseIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <form className="py-6 space-y-5">
                            <div>
                                <label htmlFor="pickupDate" className="block text-sm font-medium text-zinc-700 mb-1">
                                    Select date
                                </label>
                                <input
                                    type="date"
                                    id="date"
                                    value={pickupRequestData.date}
                                    onChange={handlePickupDataChange}
                                    required
                                    placeholder="choose date"
                                    min={getTodayDate()}
                                    className="form-input form-input-date relative pr-8"
                                />
                            </div>
                            <div>
                                <label htmlFor="pickupTime" className="block text-sm font-medium text-zinc-700 mb-1">
                                    Select time
                                </label>
                                <input
                                    type="time"
                                    id="time"
                                    value={pickupRequestData.time}
                                    onChange={handlePickupDataChange}
                                    required
                                    className="form-input form-input-time relative pr-8"
                                />
                            </div>
                            <div>
                                <label htmlFor="pickupPhone" className="block text-sm font-medium text-zinc-700 mb-1">
                                    Phone number
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    value={pickupRequestData.phone}
                                    onChange={handlePickupDataChange}
                                    required
                                    className="form-input"
                                />
                            </div>
                            <div>
                                <label htmlFor="pickupAddress" className="block text-sm font-medium text-zinc-700 mb-1">
                                    Address
                                </label>
                                <textarea
                                    id="address"
                                    value={pickupRequestData.address}
                                    onChange={handlePickupDataChange}
                                    required
                                    rows="3"
                                    className="form-input"
                                    placeholder="Contact address"
                                ></textarea>
                            </div>
                            <div>
                                <label htmlFor="note" className="block text-sm font-medium text-zinc-700 mb-1">
                                    Add Note
                                </label>
                                <select
                                    id="note"
                                    value={pickupRequestData.note}
                                    onChange={handlePickupDataChange}
                                    required
                                    rows="3"
                                    className="form-input"
                                    placeholder="Contact address"
                                > 
                                    <option disabled value="">Select reason for pickup</option>
                                    {noteOptions.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>                                
                            </div>
                            {
                                pickupRequestData.note === "Other reasons" && (
                                    <div>
                                        <label htmlFor="other" className="block text-sm font-medium text-zinc-700 mb-1">
                                            Write other reason
                                        </label>
                                        <input
                                            type="other"
                                            id="other"
                                            value={otherReason}
                                            onChange={(e) => setOtherReason(e.target.value)}
                                            required
                                            className="form-input form-input-time relative pr-8"
                                        />
                                    </div>
                                )
                            }
                        </form>

                        <div className="py-4 flex justify-end">
                            <button
                                type="button"
                                onClick={handlePickupRequest}
                                className="btn btn-primary w-full text-sm rounded-xl"
                            >
                                Make Payment
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
const AlatIcon = () => (
    <span className="font-medium text-zinc-800 flex items-center gap-1">
        <img
            src="https://alat.ng/wp-content/uploads/2021/03/cropped-ALAT_By_Wema_Bank.jpg"
            alt="Alat Logo"
            className="w-10 h-10 mx-2 inline-block rounded-sm"
        />
    </span>
);

const WalletIcon = () => (
    <svg className="w-8 h-8 mx-2 inline-block rounded-sm" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M18.039 13.5515C17.619 13.9615 17.379 14.5515 17.439 15.1815C17.529 16.2615 18.519 17.0515 19.599 17.0515H21.499V18.2415C21.499 20.3115 19.809 22.0015 17.739 22.0015H6.25902C4.18902 22.0015 2.49902 20.3115 2.49902 18.2415V11.5115C2.49902 9.44147 4.18902 7.75146 6.25902 7.75146H17.739C19.809 7.75146 21.499 9.44147 21.499 11.5115V12.9515H19.479C18.919 12.9515 18.409 13.1715 18.039 13.5515Z"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M2.49902 12.4132V7.84328C2.49902 6.65328 3.22902 5.59323 4.33902 5.17323L12.279 2.17323C13.519 1.70323 14.849 2.62326 14.849 3.95326V7.75325"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M22.5588 13.9716V16.0317C22.5588 16.5817 22.1188 17.0316 21.5588 17.0516H19.5988C18.5188 17.0516 17.5288 16.2616 17.4388 15.1816C17.3788 14.5516 17.6188 13.9616 18.0388 13.5516C18.4088 13.1716 18.9188 12.9517 19.4788 12.9517H21.5588C22.1188 12.9717 22.5588 13.4216 22.5588 13.9716Z"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M7 12H14"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const CloseIcon = ({ className = 'w-5 h-5' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
);

export default Wastes;