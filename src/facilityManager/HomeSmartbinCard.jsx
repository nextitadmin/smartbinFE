import React, { useState, useEffect, useMemo, useRef, } from 'react';
import Sidebar from '../components/FacilityMgrSideBar';
import Topbar from '../components/FacilityMgrTopBar';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import AlatPayButton from '../components/AlatPayButton';
import useAuthStore from '../store/authStore';
import useFacilityMgrStore from '../store/useFacilityMgrStore';

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

const CUSTOMER_TYPES = ['Resident', 'Corporate'];

const SmartBinTableCard = () => {
    // --- State ---
    const [applications, setApplications] = useState([]);

    const [searchQuery, setSearchQuery] = useState('');
    const [sortColumn, setSortColumn] = useState('date');
    const [sortDirection, setSortDirection] = useState('dsc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [modal, setModal] = useState(false);
    const [rowActionModal, setRowActionModal] = useState(false);
    const [viewApplicationModal, setViewApplicationModal] = useState(false);
    const [totalItems, setTotalItems] = useState(6);
    const [totalPages, setTotalPages] = useState(0);
    const [appDetails, setAppDetail] = useState({});
    const navigate = useNavigate();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: string } | null
    const FacilityMgr = useFacilityMgrStore.getState().facilityMgrInfo;
    const [isCustomerOpen, setIsCustomerOpen] = useState(false);
    const [isCustomerListOpen, setIsCustomerListOpen] = useState(false);
    const [customerNameList, setCustomerNameList] = useState([]);

    const [smartBinAmount, setSmartbinAmount] = useState(0);// Amount for the smart bin application
    const [debitType, setDebitType] = useState(""); // Default debit type
    const [currentDataId, setCurrentDataId] = useState("");

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
            const { data } = await api.get(`/Facility-managers/smart-bin/applications?PageNo=${currentPage}&PageSize=${itemsPerPage}`);
            if (data.succeeded) {
                const newData = data.data.data.map((item, index) => ({
                    id: item.id,
                    sn: index + 1 + (currentPage - 1) * itemsPerPage,
                    orderId: item.orderID,
                    date: item.requestDate?.slice(0, 10),
                    address: item.residentDetails,
                    status: item.statusName,
                    deliveredDate: item.deliveredDate,
                    deliveredBy: item.deliveredBy,
                    approvedDate: item.approvedDate,
                    customerName: item.residentFullName,
                    customerType: item.customerType,
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
        fetchData();
    }, [currentPage]);

    useEffect(() => {
        const details = applications.find((item) => item.id === currentDataId);
        setAppDetail(details);
    }, [currentDataId, applications])

    // --- Computed Properties ---
    const filteredApplications = useMemo(() => {
        if (!searchQuery) {
            return applications;
        }
        const lowerQuery = searchQuery.toLowerCase();
        return applications.filter(app => {
            return (
                app.orderId.toLowerCase().includes(lowerQuery) ||
                app.address.toLowerCase().includes(lowerQuery) ||
                app.status.toLowerCase().includes(lowerQuery) ||
                (app.date).includes(lowerQuery)
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
                valA = new Date(valA);
                valB = new Date(valB);
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
            case 'pending':
                return 'bg-zinc-100 text-zinc-800 border-zinc-300';
            case 'approved':
                return 'bg-sky-100 text-sky-800 border-sky-300';
            case 'delivered':
                return 'bg-green-100 text-green-800 border-green-300';
            default:
                return 'bg-zinc-100 text-zinc-800 border-zinc-300';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const parts = dateString.slice(0, 10).split('-');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0].slice(-2)}`;
        }
        return dateString;
    };



    const handleRowAction = (appId) => {
        setCurrentDataId(appId);
        console.log("Row action triggered for ID:", appId);
        setRowActionModal(true);
    };

    const handleTrack = () => {
        localStorage.setItem("appId", currentDataId);
        navigate("/appmanager")
    }
    const modalRef = useRef();

    const handleBackgroundClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            setRowActionModal(false);
        }
    };
    // --- Form Data State ---
    const [formData, setFormData] = useState({
        streetName: '',
        closestLandmark: '',
        customerName: {
            text: '',
            value: '',
        },
        customerType: '',
        email: '',
        phoneNo: '',
        payerId: '',
        buildingType: '',
        houseNo: '',
        flatNo: '',
        lga: '',
        lawmaCustomerType: 'Existing',


    });

    const fetchCustomerDetails = async () => {
        try {
            const { data } = await api.get(`/FacilityMgr/fetch-customer-address?customerType=${formData.customerType}&customerId=${formData.customerName.value}`);
            if (data.succeded) {
                setFormData({
                    ...formData,
                    streetName: data.data.address,
                    closestLandmark: data.data.closestLandMark,
                    email: data.data.emailAddress,
                    phoneNo: data.data.phoneNo,
                    payerId: data.data.payerId,
                    buildingType: data.data.buildingType,
                    houseNo: data.data.houseNo,
                    flatNo: data.data.flatNo,
                    lga: data.data.lga,
                    lawmaCustomerType: data.data.lawmaCustomerType
                });
            }
        } catch (error) {
            console.log("Error fetching customer details", error)
        }
    }

    // );
    const [isDisabled, setIsDisabled] = useState(true);
    const [selfRequest, setSelfRequest] = useState(true);
    // --- Options for Select Dropdowns ---

    useEffect(() => {
        if (selfRequest) {
            fetchCustomerDetails();
        }
    }, [formData.customerName.value, formData.customerType])

    const [options, setOptions] = useState({
        buildingTypes: ['Duplex', 'Bungalow', 'Block of Flats', 'Terrace', 'Detached', 'Semi-Detached', 'Other'],
        lgas: [],
        lawmaCustomerTypes: ['New', 'Existing']
    });

    // --- Handle Input Changes ---
    const setNewCustomerType = (type) => {
        setFormData({ ...formData, customerType: type })
    };

    const setNewCustomerName = (type) => {
        setFormData({ ...formData, customerName: type })
    };


    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const fetchCustomerNameList = async () => {
        const isResident = formData.customerType === 'Resident';
        const isCorporate = formData.customerType === 'Corporate';
        try {
            const { data } = await api.get(`/Facility-managers/fetch-customer-name?resident=${isResident}&corporate=${isCorporate}`);
            if (data.succeded) {
                setCustomerNameList(data.data);
            }
        } catch (error) {
            console.log("Error fetching customer name list", error);
        }
    }

    useEffect(() => {
        fetchCustomerNameList();
    }, [formData.customerType])
    const fetchLga = async () => {
        try {
            const { data } = await api.get("/utility/get-lgas");
            if (data.succeeded) {
                setOptions((prev) => ({
                    ...prev,
                    lgas: data.data.map((item) => item.text)
                }));
            }
        } catch (error) {
            console.log("Error fetching lga", error);
        }
    }


    useEffect(() => {
        fetchLga();
        setFormData({
            customerName: {
                text: '',
                value: '',
            },
            customerType: '',
            email: FacilityMgr.emailAddress,
            phoneNo: FacilityMgr.phoneNo,
            payerId: FacilityMgr.payerID,
            buildingType: '',
            houseNo: '',
            flatNo: '',
            lga: '',
            closestLandmark: '',
            streetName: '', // For the main street address
            lawmaCustomerType: 'Existing',


        })
    }, [])


    // --- Form Methods ---


    const cancelForm = () => {
        setFormData({
            customerName: {
                text: '',
                value: '',
            },
            customerType: '',
            email: FacilityMgr.emailAddress,
            phoneNo: FacilityMgr.phoneNo,
            payerId: FacilityMgr.payerID,
            buildingType: '',
            houseNo: '',
            flatNo: '',
            lga: '',
            streetName: '', // For the main street address
            closestLandmark: '',
            lawmaCustomerType: 'Existing',

        });
        setIsDisabled(true);
        setSelfRequest(true);
        console.log("Form Cancelled");
    };

    const closeForm = () => {
        setModal(false);
        setFormData({
            customerName: {
                text: '',
                value: '',
            },
            customerType: '',
            email: FacilityMgr.emailAddress,
            phoneNo: FacilityMgr.phoneNo,
            payerId: FacilityMgr.payerID,
            buildingType: '',
            houseNo: '',
            flatNo: '',
            streetName: '',
            lga: '',
            lawmaCustomerType: 'Existing',
            locateMe: false,
            locationLatitude: "37.7749",
            locationLongitude: "-122.4194",
        });
        setIsDisabled(true);
        setSelfRequest(true);
        console.log("Form Closed");

    };

    const changeDetails = (e) => {
        e.preventDefault();
        setIsDisabled(!isDisabled);
        setSelfRequest(!selfRequest);
        console.log("Change details clicked");
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
    )
    // Modal states


    // Payment modal data
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
    const paymentOptions = [
        { id: 'card', text: 'Pay with Alat By Wema', icon: AlatIcon },
    ];

    // Pickup modal data


    // Subscription modal data


    // Helper functions


    // Modal handlers
    const openModal = (modalName) => {
        if (modalName === 'payment') setIsPaymentModalOpen(true);
    };

    const closeModal = (modalName) => {
        if (modalName === 'payment') setIsPaymentModalOpen(false);
        closeForm();
    };


    const submitApplication = (e) => {
        e.preventDefault();
        console.log("Form Submitted:", formData);
        setModal(false);
        // setNotification({ type: 'success', message:'Submitted successfully!' });
        openModal('payment');
    };

    const handleBack = () => {
        const retain = isDisabled;
        closeModal('payment');
        if (!retain) {
            setIsDisabled(false);
            setSelfRequest(false);
        }
        setFormData(formData);
        setModal(true);
    }


    // fetch the smart bin amount from the API
    const fetchSmartBinAmount = async () => {

        try {
            const response = await api.get("/wallets");

            console.log("Response from fetch-amount:", response);
            const data = response.data?.data;
            if (response.data?.success && data) {
                setSmartbinAmount(data.balance ?? data.amountToDebit);
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
        fetchSmartBinAmount();

    }, []);


    const handlePayment = async (response) => {
        closeModal('payment');
        let ref, channel;
        let amount = smartBinAmount

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
            try {
                const { data } = await api.post("/FacilityMgr/agent-new-bin-application", {
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
                    closeModal('payment');
                }
                else {
                    console.error("Error submitting application:", data.message);
                    setNotification({ type: 'error', message: data.message || "Error submitting" });
                    handleBack();
                }
            } catch (error) {
                setNotification({ type: 'error', message: "Error submitting" });
                console.log(error);
            }
        } else {
            console.error("Payment response missing required fields");
            setNotification({ type: 'error', message: "Error submitting" });
            handleBack();
        }
    }

    const handlePaymentWithWallet = async () => {



        try {
            const response = await api.post("/wallets/charge", {
                userId: useAuthStore.getState().token, // Assuming you have a userId in your auth store
                drAccountNo: FacilityMgr.accountNo,
                amount: smartBinAmount,
                narration: "Smart Bin Application Payment",
                paymentPurpose: "Smart Bin Application"
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




    return (


        <div className="flex sans  max-w-screen">


            <div className=" bg-zinc-100   flex flex-col flex-1 overflow-y-auto  ">


                <div className="bg-zinc-100 font-sans">


                    <div className='flex justify-between items-center p-2'>


                        <h1 className='text-xl font-semibold'>Smart Bin Applications</h1>,
                        <p className='text-zinc-600 '>See all</p>
                    </div>






                    {/* Table */}
                    <div className="table-container border border-zinc-200 rounded-2xl my-8">
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
                                    <th scope="col" className="px-4 py-3 " role="button" onClick={() => sortBy('customerName')}>
                                        <div className="flex items-center justify-between">
                                            Name <span className={`sort-icon ${sortColumn === 'customerName' ? 'active' : ''}`}>
                                                {sortIcon('customerName')}
                                            </span>
                                        </div>
                                    </th>
                                    <th scope="col" className="px-4 py-3 " role="button" onClick={() => sortBy('customerType')}>
                                        <div className="flex items-center justify-between">
                                            CUSTOMER TYPE<span className={`sort-icon ${sortColumn === 'customerType' ? 'active' : ''}`}>
                                                {sortIcon('customerType')}
                                            </span>
                                        </div>
                                    </th>
                                    <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('orderId')}>
                                        <div className="flex items-center justify-between">
                                            Order ID <span className={`sort-icon ${sortColumn === 'orderId' ? 'active' : ''}`}>
                                                {sortIcon('orderId')}
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
                                    <th scope="col" className="px-4 py-3" role="button" onClick={() => sortBy('status')}>
                                        <div className="flex items-center justify-between">
                                            Status <span className={`sort-icon ${sortColumn === 'status' ? 'active' : ''}`}>
                                                {sortIcon('status')}
                                            </span>
                                        </div>
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {totalItems === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-10 text-zinc-500">No applications found.</td>
                                    </tr>
                                ) : (
                                    sortedApplications.map(app => (
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
                                                <button
                                                    onClick={() => handleRowAction(app.id)}
                                                    type="button"
                                                    className="p-1 text-zinc-500 hover:text-zinc-700"
                                                >
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>



                </div>

                {rowActionModal && (
                    <div
                        onClick={handleBackgroundClick}
                        className="fixed inset-0 bg-black/40  z-50 font-sans flex lg:justify-end justify-center items-center lg:items-center min-h-screen overflow-y-auto p-4"
                    >
                        <div
                            ref={modalRef}
                            onClick={(e) => e.stopPropagation()}
                            className=" max-w-4xl p-4 lg:mr-14 bg-white flex rounded-xl shadow-xl flex-col"
                        >

                            <p onClick={() => setViewApplicationModal(true)} className='p-2 cursor-pointer'>View</p>
                            <p className='p-2 cursor-pointer' onClick={() => handleTrack()}>Track application</p>

                        </div>
                    </div>
                )}

                {viewApplicationModal && (
                    <div
                        className="fixed inset-0 bg-black/20 z-50 font-sans flex lg:justify-end justify-center items-center lg:items-center min-h-screen overflow-y-auto"
                    >

                        <aside
                            className={`fixed top-0 right-0 z-50 lg:h-screen h-full lg:w-[550px] w-full bg-white flex flex-col transform transition-transform delay-200 ease-in-out duration-1000 ${viewApplicationModal ? 'translate-x-0' : 'translate-x-full'
                                }`}
                        >
                            <div className="p-6 border-b border-zinc-200 ">
                                {/* Top Title Row */}
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-semibold text-zinc-800">Application details</h2>
                                    <button
                                        onClick={() => { setViewApplicationModal(false), setRowActionModal(false) }}
                                        className="text-zinc-500 hover:text-black text-2xl"
                                    >
                                        &times;
                                    </button>
                                </div>
                            </div>

                            {/* Details Section */}
                            <div className="p-6 flex flex-col gap-6">
                                {/* OrderID */}
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">OrderID</span>
                                    <span className="font-semibold text-zinc-800">{appDetails.orderId}</span>
                                </div>

                                {/* Date */}
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Date</span>
                                    <span className="font-semibold text-zinc-800">{formatDate(appDetails.date)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Name</span>
                                    <span className="font-semibold text-zinc-800">{appDetails.customerName}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Customer Type</span>
                                    <span className="font-semibold text-zinc-800">{appDetails.customerType}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Phone Number</span>
                                    <span className="font-semibold text-zinc-800">{appDetails.phoneNo}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Email Address</span>
                                    <span className="font-semibold text-zinc-800">{appDetails.emailAddress}</span>
                                </div>

                                {/* Address */}
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Address</span>
                                    <span className="font-semibold text-zinc-800 text-right">
                                        {appDetails.address}
                                    </span>
                                </div>

                                {/* Status */}
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-500">Status</span>
                                    <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-300 rounded-full text-sm">
                                        {appDetails.status}
                                    </span>
                                </div>

                                {/* Delivered on */}
                                {
                                    appDetails.status == 'APPROVED' &&
                                    (
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">Approval Date:</span>
                                            <span className="font-semibold text-zinc-800">{appDetails?.approvedDate}</span>
                                        </div>
                                    )
                                }
                                {
                                    appDetails.status == 'DELIVERED' &&
                                    (
                                        <>
                                            <div className="flex justify-between">
                                                <span className="text-zinc-500">Delivered on:</span>
                                                <span className="font-semibold text-zinc-800">{appDetails?.deliveredDate}</span>
                                            </div>

                                            {/* Delivered by */}
                                            <div className="flex justify-between">
                                                <span className="text-zinc-500">Delivered by</span>
                                                <span className="font-semibold text-zinc-800">{appDetails?.deliveredBy}</span>
                                            </div>
                                        </>
                                    )
                                }
                            </div>
                        </aside>

                    </div>
                )}
                {modal &&
                    (
                        <div className="fixed inset-0  bg-zinc-950/70 bg-opacity-50 backdrop-blur-lg  z-50 font-sans flex lg:items-center justify-center min-h-screen overflow-y-auto p-4">
                            <main className="w-full max-w-7xl bg-white">
                                <div className="shadow-lg">
                                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-200 p-6 bg-zinc-100/20">
                                        <h2 className="text-xl sm:text-2xl font-semibold text-zinc-800">Apply for Smart Bin</h2>
                                        <button onClick={closeForm} aria-label="Close" className="text-red-600 hover:text-zinc-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                                                stroke="currentColor" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <form onSubmit={submitApplication} className="p-6 bg-white">
                                        <div className="grid grid-cols-1 md:grid-cols-6 gap-x-5 gap-y-6">


                                            <div className="md:col-span-3 relative">
                                                <label htmlFor="customerType" className="block text-sm font-medium text-zinc-700 mb-1"> Tenant Name</label>
                                                <button
                                                    type="button"
                                                    className={`w-full lg:p-3 p-2 pr-8 border border-zinc-300 rounded-2xl appearance-none focus:ring focus:outline-none focus:ring-green-700 focus:border-green-700 bg-white text-left flex justify-between items-center ${!formData.customerType ? 'text-zinc-400' : 'text-zinc-900'}`}
                                                    onClick={() => setIsCustomerOpen(!isCustomerOpen)}
                                                    aria-haspopup="listbox"
                                                    aria-expanded={isCustomerOpen}
                                                >
                                                    {formData.customerType !== '' ? formData.customerType : "Select customer type"}
                                                    <ChevronDownIcon className={`h-4 w-4 text-zinc-400 transform ${isCustomerOpen ? 'rotate-180' : ''}`} />
                                                </button>

                                                {isCustomerOpen && (
                                                    <ul
                                                        className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none"
                                                        role="listbox"
                                                        tabIndex={-1}
                                                    >
                                                        {CUSTOMER_TYPES.map((type, index) => (
                                                            <li
                                                                key={`${type}-${index}`}
                                                                className="text-zinc-900 cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-zinc-50"
                                                                role="option"
                                                                onClick={() => {
                                                                    setNewCustomerType(type);
                                                                    setIsCustomerOpen(false);
                                                                }}
                                                            >
                                                                <span className="block truncate">{type}</span>
                                                                {formData.customerType === type && (
                                                                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-green-600">
                                                                        <CheckIcon className="h-5 w-5" />
                                                                    </span>
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                            <div className="md:col-span-3 relative">
                                                <label htmlFor="customerType" className="block text-sm font-medium text-zinc-700 mb-1">Bin type</label>
                                                <button
                                                    type="button"
                                                    className={`w-full lg:p-3 p-2 pr-8 border border-zinc-300 rounded-2xl appearance-none focus:ring focus:outline-none focus:ring-green-700 focus:border-green-700 bg-white text-left flex justify-between items-center ${!formData.customerType ? 'text-zinc-400' : 'text-zinc-900'}`}
                                                    onClick={() => setIsCustomerOpen(!isCustomerOpen)}
                                                    aria-haspopup="listbox"
                                                    aria-expanded={isCustomerOpen}
                                                >
                                                    {formData.customerType !== '' ? formData.customerType : "Select customer type"}
                                                    <ChevronDownIcon className={`h-4 w-4 text-zinc-400 transform ${isCustomerOpen ? 'rotate-180' : ''}`} />
                                                </button>

                                                {isCustomerOpen && (
                                                    <ul
                                                        className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none"
                                                        role="listbox"
                                                        tabIndex={-1}
                                                    >
                                                        {CUSTOMER_TYPES.map((type, index) => (
                                                            <li
                                                                key={`${type}-${index}`}
                                                                className="text-zinc-900 cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-zinc-50"
                                                                role="option"
                                                                onClick={() => {
                                                                    setNewCustomerType(type);
                                                                    setIsCustomerOpen(false);
                                                                }}
                                                            >
                                                                <span className="block truncate">{type}</span>
                                                                {formData.customerType === type && (
                                                                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-green-600">
                                                                        <CheckIcon className="h-5 w-5" />
                                                                    </span>
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>





                                            <div className="md:col-span-2">
                                                <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1">Email address</label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    disabled={isDisabled}
                                                    style={{ backgroundColor: isDisabled ? '#f4f4f5' : 'white' }}
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="form-input w-full border border-zinc-300 p-4 rounded-xl"
                                                    autoComplete="email"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label htmlFor="phoneNo" className="block text-sm font-medium text-zinc-700 mb-1">Telephone</label>
                                                <input
                                                    type="tel"
                                                    id="phoneNo"
                                                    disabled={isDisabled}
                                                    style={{ backgroundColor: isDisabled ? '#f4f4f5' : 'white' }}
                                                    name="phoneNo"
                                                    value={formData.phoneNo}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="form-input w-full border border-zinc-300 p-4 rounded-xl"
                                                    autoComplete="tel"
                                                // placeholder="+234XXXXXXXXXX"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label htmlFor="payerId" className="block text-sm font-medium text-zinc-700 mb-1">Payer ID</label>
                                                <input
                                                    type="text"
                                                    id="payerId"
                                                    disabled={isDisabled}
                                                    style={{ backgroundColor: isDisabled ? '#f4f4f5' : 'white' }}
                                                    name="payerId"
                                                    value={formData.payerId}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="form-input w-full border border-zinc-300 p-4 rounded-xl"
                                                />
                                            </div>



                                            <div className="md:col-span-2">
                                                <label htmlFor="lawmaCustomerType" className="block text-sm font-medium text-zinc-700 mb-1">LAWMA Customer type</label>
                                                <select
                                                    id="lawmaCustomerType"
                                                    disabled={isDisabled}
                                                    style={{ backgroundColor: isDisabled ? '#f4f4f5' : 'white' }}
                                                    name="lawmaCustomerType"
                                                    value={formData.lawmaCustomerType}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="form-select w-full border border-zinc-300 p-3 rounded-xl"
                                                >
                                                    <option disabled value="">Select Customer Type</option>
                                                    {options.lawmaCustomerTypes.map(option => (
                                                        <option key={option} value={option}>{option}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="md:col-span-6 mt-1 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <input type='checkbox' href="#" onChange={changeDetails} id="not" name="not"
                                                        value={selfRequest}
                                                        checked={isDisabled}
                                                        className='accent-green-700 focus:ring-green-500 h-4 w-4 border-zinc-300 rounded'
                                                    />


                                                    <label htmlFor="not"
                                                        className="text-sm font-medium text-green-700 hover:text-green-600 hover:underline">
                                                        Use customer Address</label>
                                                </div>

                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-6 gap-x-5 gap-y-6 mt-12">

                                            <div className="md:col-span-2">
                                                <label htmlFor="houseNo" className="block text-sm font-medium text-zinc-700 mb-1">Building name</label>
                                                <input
                                                    type="text"
                                                    id="houseNo"
                                                    disabled={isDisabled}
                                                    style={{ backgroundColor: isDisabled ? '#f4f4f5' : 'white' }}
                                                    name="houseNo"
                                                    value={formData.houseNo}
                                                    onChange={handleInputChange}
                                                    placeholder="House Number"

                                                    required
                                                    className="form-input w-full border border-zinc-300 p-4 rounded-xl"

                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label htmlFor="buildingType" className="block text-sm font-medium text-zinc-700 mb-1">Building Type</label>
                                                <select
                                                    id="buildingType"
                                                    name="buildingType"
                                                    disabled={isDisabled}
                                                    style={{ backgroundColor: isDisabled ? '#f4f4f5' : 'white' }}
                                                    value={formData.buildingType}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="form-select w-full border border-zinc-300 p-3 rounded-xl"
                                                >
                                                    <option disabled value=""> Building Type</option>
                                                    {options.buildingTypes.map(option => (
                                                        <option key={option} value={option}>{option}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="md:col-span-2">
                                                <label htmlFor="houseNo" className="block text-sm font-medium text-zinc-700 mb-1">House number</label>
                                                <input
                                                    type="text"
                                                    id="houseNo"
                                                    disabled={isDisabled}
                                                    style={{ backgroundColor: isDisabled ? '#f4f4f5' : 'white' }}
                                                    name="houseNo"
                                                    value={formData.houseNo}
                                                    onChange={handleInputChange}
                                                    placeholder="House Number"

                                                    required
                                                    className="form-input w-full border border-zinc-300 p-4 rounded-xl"

                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label htmlFor="houseNo" className="block text-sm font-medium text-zinc-700 mb-1">Flat number</label>
                                                <input
                                                    type="text"
                                                    id="houseNo"
                                                    disabled={isDisabled}
                                                    style={{ backgroundColor: isDisabled ? '#f4f4f5' : 'white' }}
                                                    name="houseNo"
                                                    value={formData.houseNo}
                                                    onChange={handleInputChange}
                                                    placeholder="House Number"

                                                    required
                                                    className="form-input w-full border border-zinc-300 p-4 rounded-xl"

                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label htmlFor="lga" className="block text-sm font-medium text-zinc-700 mb-1">Local Government</label>
                                                <select
                                                    id="lga"
                                                    name="lga"
                                                    disabled={isDisabled}
                                                    style={{ backgroundColor: isDisabled ? '#f4f4f5' : 'white' }}
                                                    value={formData.lga}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="form-select w-full border border-zinc-300 p-3 rounded-xl"
                                                >
                                                    <option disabled value="">Select Local Government</option>
                                                    {options.lgas.map(option => (
                                                        <option key={option} value={option}>{option}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Closest Landmark Input */}
                                            <div className="md:col-span-2">
                                                <label htmlFor="closestLandmark" className="block text-sm font-medium text-zinc-700 mb-1">Closest Landmark</label>
                                                <input
                                                    type="text"
                                                    disabled={isDisabled}
                                                    style={{ backgroundColor: isDisabled ? '#f4f4f5' : 'white' }}
                                                    id="closestLandmark"
                                                    name='closestLandmark'
                                                    onChange={handleInputChange}
                                                    value={formData.closestLandmark}
                                                    placeholder="Street name"
                                                    className="w-full p-4 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-150 ease-in-out text-sm placeholder-zinc-400"
                                                />
                                            </div>

                                            {/* Address Textarea */}
                                            <div className="md:col-span-6">
                                                <label htmlFor="streetName" className="block text-sm font-medium text-zinc-700 mb-1">Full Address <span className="text-red-500">*</span></label>
                                                <input
                                                    id="streetName"
                                                    value={formData.streetName}
                                                    disabled={isDisabled}
                                                    style={{ backgroundColor: isDisabled ? '#f4f4f5' : 'white' }}
                                                    name='streetName'
                                                    onChange={handleInputChange}
                                                    required
                                                    rows="3"
                                                    placeholder="Enter your Address"
                                                    className="w-full p-4 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-150 ease-in-out text-sm placeholder-zinc-400"
                                                />
                                            </div>



                                        </div>
                                        <div className="flex justify-end gap-3 pt-8 mt-12 mb-4">
                                            <button
                                                type="button"
                                                onClick={cancelForm}
                                                className="px-5 py-2 bg-white border border-green-700 rounded-md shadow-sm text-sm font-medium text-green-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-6 py-2 bg-green-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </main>
                        </div>
                    )}

            </div>
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
                                    Pay from wallet (₦{smartBinAmount})
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
                                            amount={smartBinAmount}
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
                                onClick={() => handleBack()}
                                className="w-full text-center font-medium text-green-700 hover:text-green-900 py-2"
                            >
                                Go back
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

            {isPaymentModalOpen && notification && modal && (
                <div className="fixed inset-0 bg-black/40 z-50 font-sans flex lg:justify-end justify-center items-center lg:items-center min-h-screen overflow-y-auto p-4">
                    <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-z inc-800 mb-4">Payment Successful forced to update final code</h2>
                        <p className="text-zinc-600 mb-6">Your application has been successfully submitted and payment has been processed.</p>

                    </div>

                </div>
            )}

        </div>

    );

};




export default SmartBinTableCard;
