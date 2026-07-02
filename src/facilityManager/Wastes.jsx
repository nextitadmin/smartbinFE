import React, { useState, useEffect, useMemo, useRef } from 'react';
import Sidebar from '../components/FacilityMgrSideBar';
import Topbar from '../components/FacilityMgrTopBar';
import api from '../api/axiosConfig';
import AlatPayButton from '../components/AlatPayButton';
import useAuthStore from '../store/authStore';
import useFacilityMgrStore from '../store/useFacilityMgrStore';

const ChevronDownIcon = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);

const ChevronUpDownIcon = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
    </svg>
);

const CheckIcon = ({ className = "h-5 w-5" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={className}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
        />
    </svg>
);

const CUSTOMER_TYPES = ['Resident', 'Corporate'];

const CustomDatePicker = ({ value, onChange, minDate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const daysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const firstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleDayClick = (day) => {
        const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        const yyyy = selected.getFullYear();
        const mm = String(selected.getMonth() + 1).padStart(2, '0');
        const dd = String(selected.getDate()).padStart(2, '0');
        const formatted = `${yyyy}-${mm}-${dd}`;
        onChange(formatted);
        setIsOpen(false);
    };

    const formatDateString = (dateStr) => {
        if (!dateStr) return 'Select date';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const totalDays = daysInMonth(viewDate);
    const startOffset = firstDayOfMonth(viewDate);
    const grid = [];

    for (let i = 0; i < startOffset; i++) {
        grid.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }

    const minD = minDate ? new Date(minDate) : null;
    if (minD) minD.setHours(0, 0, 0, 0);

    for (let day = 1; day <= totalDays; day++) {
        const current = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        current.setHours(0, 0, 0, 0);

        const isDisabled = minD && current < minD;
        const isSelected = value && new Date(value).toDateString() === current.toDateString();
        const isToday = new Date().toDateString() === current.toDateString();

        grid.push(
            <button
                key={`day-${day}`}
                type="button"
                disabled={isDisabled}
                onClick={() => handleDayClick(day)}
                className={`w-8 h-8 rounded-full text-xs font-medium flex items-center justify-center transition-all ${
                    isSelected
                        ? 'bg-green-700 text-white'
                        : isToday
                        ? 'border border-green-700 text-green-700 font-semibold'
                        : isDisabled
                        ? 'text-zinc-300 cursor-not-allowed'
                        : 'text-zinc-700 hover:bg-zinc-100'
                }`}
            >
                {day}
            </button>
        );
    }

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full border border-zinc-300 p-4 rounded-xl text-left text-sm text-zinc-800 bg-white flex justify-between items-center focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none"
            >
                <span>{value ? formatDateString(value) : "Select date"}</span>
                <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-2 p-4 bg-white border border-zinc-200 rounded-2xl shadow-xl w-72">
                    <div className="flex justify-between items-center mb-4">
                        <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-600 font-bold">
                            &larr;
                        </button>
                        <span className="font-semibold text-sm text-zinc-800">
                            {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                        </span>
                        <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-600 font-bold">
                            &rarr;
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2 text-center text-zinc-500 text-xs font-semibold">
                        <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center">
                        {grid}
                    </div>
                </div>
            )}
        </div>
    );
};

const SmartBinApplication = () => {
    // --- State ---
    const [applications, setApplications] = useState([
        {
            "sn": 1,
            "wasteId": "#999935",
            "subsTransferId": null,
            "phoneNo": "07015607352",
            "address": "Ibeju Royalty",
            "payerID": null,
            "createdBy": null,
            "date": "2025-05-16T00:00:00",
            "weight": 0,
            "pickupBy": "",
            "customerName": "John Boyega",
            "pickupDate": null,
            "paymentType": "Wema",
            "paymentTransRef": null,
            "amountPaid": 0,
            "status": "PENDING",
            "loggerName": null,
            "id": "08dd8cd8-67f3-49fc-80f0-4525254151a1",
            "isDeleted": false
        },
        {
            "sn": 2,
            "wasteId": "#316596",
            "subsTransferId": null,
            "phoneNo": "07015607398",
            "address": "sdfghjk",
            "payerID": null,
            "createdBy": null,
            "date": "2025-05-14T00:00:00",
            "weight": 0,
            "pickupBy": "",
            "customerName": "John Boyega",
            "pickupDate": null,
            "paymentType": "Wema",
            "paymentTransRef": null,
            "amountPaid": 0,
            "status": "PENDING",
            "loggerName": null,
            "id": "08dd8b52-77a6-4b33-80e2-93195fd275c4",
            "isDeleted": false
        },
        {
            "sn": 3,
            "wasteId": "#168473",
            "subsTransferId": null,
            "phoneNo": "07015607398",
            "address": "Ibeju lekki",
            "payerID": null,
            "createdBy": null,
            "date": "2025-05-14T00:00:00",
            "weight": 0,
            "pickupBy": "",
            "customerName": "John Boyega",
            "pickupDate": null,
            "paymentType": "Wema",
            "paymentTransRef": null,
            "amountPaid": 0,
            "status": "PENDING",
            "loggerName": null,
            "id": "08dd8c9a-aac5-4120-850d-a0f754ef5e58",
            "isDeleted": false
        },
        {
            "sn": 4,
            "wasteId": "#374937",
            "subsTransferId": null,
            "phoneNo": "07015607398",
            "address": "sdfghjk",
            "payerID": null,
            "createdBy": null,
            "date": "2025-05-10T00:00:00",
            "weight": 0,
            "pickupBy": "",
            "customerName": "John Boyega",
            "pickupDate": null,
            "paymentType": "Wema",
            "paymentTransRef": null,
            "amountPaid": 0,
            "status": "PENDING",
            "loggerName": null,
            "id": "08dd8a83-f4f3-467a-8b1d-d8dcc4bef37b",
            "isDeleted": false
        },
        {
            "sn": 5,
            "wasteId": "#064665",
            "subsTransferId": null,
            "phoneNo": "07034563743",
            "address": "string",
            "payerID": null,
            "createdBy": null,
            "date": "2025-05-07T11:51:54.218",
            "weight": 0,
            "pickupBy": "",
            "customerName": "John Boyega",
            "pickupDate": null,
            "paymentType": "Wema",
            "paymentTransRef": null,
            "amountPaid": 0,
            "status": "PENDING",
            "loggerName": null,
            "id": "08dd8a41-8c28-475c-8e93-c81c61f23797",
            "isDeleted": false
        },
        {
            "sn": 6,
            "wasteId": "#408805",
            "subsTransferId": null,
            "phoneNo": "07015607352",
            "address": "Lagos",
            "payerID": null,
            "createdBy": null,
            "date": "2025-05-07T00:00:00",
            "weight": 0,
            "pickupBy": "",
            "customerName": "John Boyega",
            "pickupDate": null,
            "paymentType": "Wema",
            "paymentTransRef": null,
            "amountPaid": 0,
            "status": "PENDING",
            "loggerName": null,
            "id": "08dd8a4f-2587-46f0-8428-3ab6ac322b33",
            "isDeleted": false
        }
    ]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortColumn, setSortColumn] = useState('date');
    const [sortDirection, setSortDirection] = useState('dsc');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const itemsPerPage = 6;
    const [notification, setNotification] = useState(null);
    const [isCustomerOpen, setIsCustomerOpen] = useState(false);
    const [isCustomerListOpen, setIsCustomerListOpen] = useState(false);
    const [customerNameList, setCustomerNameList] = useState(['John Babatunde', 'Alima Philips']);
    const FacilityMgr = useFacilityMgrStore.getState().facilityMgrInfo;
    const [pickUpAmount, setPickUpAmount] = useState(0);
    const [debitType, setDebitType] = useState('');



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

    const fetchCustomerNameList = async () => {
        try {
            const { data } = await api.get("/facility-managers/user/tenants");
            if (data.success && Array.isArray(data.data)) {
                const names = data.data.map(tenant => tenant.fullName);
                setCustomerNameList(names);
            }
        } catch (error) {
            console.error("Error fetching tenants for pickup:", error);
        }
    };

    useEffect(() => {
        fetchCustomerNameList();
    }, []);

    const fetchPickUpAmount = async () => {

        try {
            const response = await api.get("/wallets");

            console.log("Response from fetch-amount:", response);
            const data = response.data?.data;
            if (response.data?.success && data) {
                setPickUpAmount(data.balance ?? data.amountToDebit);
                setDebitType(data.debitType || data.status || 'standard');
                console.log(data.status || data.debitType, " debit type");
                console.log("Smart bin amount fetched:", data.balance ?? data.amountToDebit);
            } else {
                console.error("Failed to fetch smart bin amount:", response.data?.message || 'Unknown error');
            }
        } catch (error) {
            console.error("Error fetching smart bin amount:", error);

        }
    }

    useEffect(() => {
        fetchPickUpAmount();
    }, []);

    // const fetchData = async () => {
    //     try {
    //         const { data } = await api.get(`/WasteMgmt/my-waste-applications?PageNo=${currentPage}&PageSize=${itemsPerPage}`);
    //         if (data.succeeded) {
    //             const newData = data.data.data.map((item, index) => ({
    //                 sn: index + 1 + (currentPage - 1) * itemsPerPage,
    //                 wasteId: item.wasteID,
    //                 date: item.requestDate?.slice(0, 10),
    //                 address: item.address,
    //                 status: item.status,
    //                 representative: item.pickupBy
    //    customerName : item.customerName
    //             }));;
    //             setApplications(newData);
    //             setTotalPages(data.data.totalPages);
    //             setTotalItems(data.data.totalCount);
    //         }
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    // useEffect(() => {
    //     fetchData()
    // }, [currentPage]);


    const formatDate = (dateString) => {
        if (!dateString) return '';
        const parts = dateString.slice(0, 10).split('-');
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
                app.customerName.toLowerCase().includes(lowerQuery) ||
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
        customerName: "",
        customerType: "Resident",
        note: ""
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
                customerName: "",
                customerType: "Resident",
                note: ""
            });
        };
    };

    const closeModal = (modalName) => {
        if (modalName === 'payment') setIsPaymentModalOpen(false);
        else if (modalName === 'pickup') {
            setIsPickupModalOpen(false);
            // setPickupRequestData({
            //      date: '',
            // time: '',
            // phone: '',
            // address: '',
            // customerName : "",
            // customerType : ""
            // });
        };
    };

    const handlePaymentWithWallet = async () => {



        try {
            const response = await api.post("/Wallet/debit-wallet", {
                userId: useAuthStore.getState().token, // Assuming you have a userId in your auth store
                drAccountNo: FacilityMgr.accountNo,
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



    const SubmitPickupRequest = async (response) => {
        if (pickupRequestData.date && pickupRequestData.time && pickupRequestData.phone && pickupRequestData.address && pickupRequestData.customerName) {
            const newDate = combineDateAndTime(pickupRequestData.date, pickupRequestData.time);
            try {
                const { data } = await api.post("/WasteMgmt/new-waste-req", {
                    representative: pickupRequestData.phone,
                    customerName: pickupRequestData.customerName,
                    customerType: pickupRequestData.customerType || 'Resident',
                    address: pickupRequestData.address,
                    pickupDate: newDate,
                    phoneNo: pickupRequestData.phone,
                    transRef: response.ref,
                    amountPaid: pickUpAmount,
                    PaymentChannel: response.channel,
                    note: pickupRequestData.note || ''
                });

                if (data.succeeded || data.success) {
                    setNotification({ type: 'success', message: data.message || 'Submitted successfully!' });
                    console.log("Submitting Pickup Request:", pickupRequestData);
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
        if (pickupRequestData.date && pickupRequestData.time && pickupRequestData.phone && pickupRequestData.address && pickupRequestData.customerName) {
            closeModal('pickup');
            openModal('payment');
        } else {
            setNotification({ type: 'error', message: "Fill all fields" });
        }
    };

    const setNewCustomerType = (type) => {
        setPickupRequestData({ ...pickupRequestData, customerType: type })
    };

    const setNewCustomerName = (type) => {
        setPickupRequestData({ ...pickupRequestData, customerName: type })
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
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h1 className="text-xl md:text-2xl font-semibold text-zinc-800">Waste Management</h1>
                                            <span className="bg-green-700 text-green-50 text-xs font-semibold px-2.5 py-2 rounded-full">
                                                {applications.length}
                                            </span>
                                        </div>
                                        <p className="text-zinc-500 mt-1 text-sm">Track your waste disposal.</p>
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
                                            Request Pickup
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
                                        <thead className="font-light text-zinc-700 bg-white">
                                            <tr>
                                                <th scope="col" className="px-4 py-3 w-24" role="button" onClick={() => sortBy('sn')}>
                                                    <div className="flex items-center justify-between">
                                                        s/n <span className={`sort-icon ${sortColumn === 'sn' ? 'active' : ''}`}>
                                                            {sortIcon('sn')}
                                                        </span>
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('wasteId')}>
                                                    <div className="flex items-center justify-between">
                                                        waste id <span className={`sort-icon ${sortColumn === 'wasteId' ? 'active' : ''}`}>
                                                            {sortIcon('wasteId')}
                                                        </span>
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('customerName')}>
                                                    <div className="flex items-center justify-between">
                                                        customer name <span className={`sort-icon ${sortColumn === 'customerName' ? 'active' : ''}`}>
                                                            {sortIcon('customerName')}
                                                        </span>
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('date')}>
                                                    <div className="flex items-center justify-between">
                                                        date <span className={`sort-icon ${sortColumn === 'date' ? 'active' : ''}`}>
                                                            {sortIcon('date')}
                                                        </span>
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('address')}>
                                                    <div className="flex items-center justify-between">
                                                        address <span className={`sort-icon ${sortColumn === 'address' ? 'active' : ''}`}>
                                                            {sortIcon('address')}
                                                        </span>
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('representative')}>
                                                    <div className="flex items-center justify-between">
                                                        representative <span className={`sort-icon ${sortColumn === 'representative' ? 'active' : ''}`}>
                                                            {sortIcon('representative')}
                                                        </span>
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('status')}>
                                                    <div className="flex items-center justify-between">
                                                        status <span className={`sort-icon ${sortColumn === 'status' ? 'active' : ''}`}>
                                                            {sortIcon('status')}
                                                        </span>
                                                    </div>
                                                </th>
                                                {/* <th scope="col" className="px-4 py-3 text-center">action</th> */}
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
                                                        <td className="px-4 py-3 font-medium text-zinc-900 whitespace-nowrap">{app.customerName}</td>
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
                                            amount={100}
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
                <div className="fixed inset-0 bg-zinc-950/70 bg-opacity-50 backdrop-blur-sm z-50 font-sans flex items-center justify-center p-4">
                    <main className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="flex justify-between items-center pb-4 border-b border-zinc-200 p-6 bg-zinc-100/20">
                            <div>
                                <h3 className="text-xl sm:text-2xl font-semibold text-zinc-800">Request for pickup</h3>
                                <p className="text-zinc-500 mt-1 text-sm">Request for your waste to be disposed</p>
                            </div>
                            <button
                                onClick={() => closeModal('pickup')}
                                aria-label="Close"
                                className="text-red-600 hover:text-zinc-600 self-start"
                            >
                                <CloseIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Scrollable Form Body */}
                        <form className="flex-1 overflow-y-auto p-6 bg-white space-y-5">
                            <div>
                                <label htmlFor="customerName" className="block text-sm font-medium text-zinc-700 mb-1">Customer Name</label>
                                <select
                                    id="customerName"
                                    value={pickupRequestData.customerName}
                                    onChange={(e) => setPickupRequestData(prev => ({ ...prev, customerName: e.target.value }))}
                                    required
                                    className="w-full border border-zinc-300 p-4 rounded-xl bg-white outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-sm"
                                >
                                    <option disabled value="">Select customer name</option>
                                    {customerNameList.map((name) => (
                                        <option key={name} value={name}>
                                            {name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">
                                    Select Date
                                </label>
                                <CustomDatePicker
                                    value={pickupRequestData.date}
                                    onChange={(dateVal) => setPickupRequestData(prev => ({ ...prev, date: dateVal }))}
                                    minDate={getTodayDate()}
                                />
                            </div>

                            <div>
                                <label htmlFor="time" className="block text-sm font-medium text-zinc-700 mb-1">
                                    Select Time
                                </label>
                                <input
                                    type="time"
                                    id="time"
                                    value={pickupRequestData.time}
                                    onChange={handlePickupDataChange}
                                    required
                                    className="w-full border border-zinc-300 p-4 rounded-xl bg-white outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-zinc-700 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    value={pickupRequestData.phone}
                                    onChange={handlePickupDataChange}
                                    required
                                    className="w-full border border-zinc-300 p-4 rounded-xl bg-white outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-zinc-700 mb-1">
                                    Address
                                </label>
                                <textarea
                                    id="address"
                                    value={pickupRequestData.address}
                                    onChange={handlePickupDataChange}
                                    required
                                    rows="3"
                                    className="w-full border border-zinc-300 p-4 rounded-xl bg-white outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-sm"
                                    placeholder="Contact address"
                                ></textarea>
                            </div>

                            <div>
                                <label htmlFor="note" className="block text-sm font-medium text-zinc-700 mb-1">
                                    Add Note
                                </label>
                                <textarea
                                    id="note"
                                    value={pickupRequestData.note || ''}
                                    onChange={handlePickupDataChange}
                                    rows="3"
                                    className="w-full border border-zinc-300 p-4 rounded-xl bg-white outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-sm"
                                    placeholder="Add any extra notes here..."
                                ></textarea>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="button"
                                    onClick={handlePickupRequest}
                                    className="btn btn-primary w-full text-sm rounded-xl"
                                >
                                    Make Payment
                                </button>
                            </div>
                        </form>
                    </main>
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
            src="/images/alat-logo.png"
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

export default SmartBinApplication;