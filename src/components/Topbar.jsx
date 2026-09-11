import React, { useState, useEffect, useRef } from 'react';

import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useTokenStore from "../store/tokenStore";
import useResidentStore from '../store/useResidentStore';
import api from '../api/axiosConfig';

const Topbar = () => {




    const logout = useAuthStore((state) => state.logout);
    const clearToken = useTokenStore((state) => state.clearBearerToken);
    const clearResident = useResidentStore((state) => state.clearResidentInfo);
    const Resident = useResidentStore.getState().residentInfo;
    const navigate = useNavigate();

    const { fetchResidentInfo } = useResidentStore();

    useEffect(() => {
        // Fetch resident info when component mounts
        fetchResidentInfo();
    }, []);

    const handleLogout = () => {
        logout();
        clearToken();
        clearResident();
        navigate("/")
    }

    const [viewNotificationModal, setViewNotificationModal] = useState(false);
    const [viewProfileModal, setViewProfileModal] = useState(false);
    const [refreshNotifications, setRefreshNotifications] = useState(false);

    const tabs = ['All', 'Unread', 'Read'];


    const [notifications, setNotifications] = useState([])
    //     {
    //         "title": "Application Update",
    //         "message": "Your Smart Bin has been activated. Track Application to see more details",
    //         "time": "22 mins ago",
    //         "read": false
    //     },
    //     {
    //         "title": "Wallet has been topped up",
    //         "message": "You have successfully toped up your wallet.",
    //         "time": "22 mins ago",
    //         "read": true
    //     },
    //     {
    //         "title": "Pickup is tomorrow",
    //         "message": "Your waste disposal is tomorrow. make sure you get your waste ready.",
    //         "time": "22 mins ago",
    //         "read": false
    //     },
    //     {
    //         "title": "Payment is due",
    //         "message": "Your payment for waste disposal for March is due. Kindly make payment soon",
    //         "time": "22 mins ago",
    //         "read": false
    //     }
    // ])

    const formatTime = (receivedDate) => {
        if (!receivedDate) return '';
        const date = new Date(receivedDate);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / 60000);
        if (isNaN(diffInMinutes) || diffInMinutes < 0) return 'Just now';
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
        else if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
        else return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }

    const [activeTab, setActiveTab] = useState('All')

    useEffect(() => {
        const fetchNotifications = async () => {

            try {
                const response = await api.get("/notifications");
                const resData = response.data;
                const succeeded = resData?.success || resData?.succeeded;

                if (succeeded) {
                    const rawList = Array.isArray(resData.data)
                        ? resData.data
                        : (Array.isArray(resData.data?.data) ? resData.data.data : (Array.isArray(resData.data?.items) ? resData.data.items : []));

                    const formattedNotifications = rawList.map(notification => ({
                        id: notification._id || notification.id || notification.msgId,
                        title: notification.title || notification.notificationTitle || "Notification",
                        message: notification.text || notification.message || notification.notificationMessage || "",
                        time: formatTime(notification.createdAt || notification.receivedDate || notification.updatedAt),
                        read: Boolean(notification.isRead ?? notification.read ?? false)
                    }));

                    setNotifications(formattedNotifications);

                }
            } catch (error) {
                console.log("Error fetching notifications:", error);
            }
        }

        fetchNotifications();

    }, [refreshNotifications]); // Empty dependency array, runs once on mount



    const filteredNotifications = notifications.filter((n) =>
        activeTab === 'All' ? true : activeTab === 'Unread' ? !n.read : n.read
    );

    const handleRead = async (id) => {
        const item = notifications.find(n => n.id === id);
        if (item && item.read) return;

        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        try {
            const response = await api.patch(`/notifications/${id}`, { isRead: true });

            if (response.status === 200 || response.data?.success || response.data?.succeeded) {
                setRefreshNotifications(prev => !prev);
            }
        } catch (error) {
            console.error("Error marking message as read:", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
        if (unreadIds.length === 0) return;

        setNotifications(prev => prev.map(n => ({ ...n, read: true })));

        let readAllSuccess = false;
        try {
            const response = await api.patch('/notifications/read-all', { isRead: true });
            if (response.data?.success || response.data?.succeeded) {
                readAllSuccess = true;
                setRefreshNotifications(prev => !prev);
            }
        } catch (err) {
            console.warn("PATCH /notifications/read-all failed, falling back to individual updates:", err);
        }

        if (!readAllSuccess) {
            try {
                await Promise.allSettled(
                    unreadIds.map(id => api.patch(`/notifications/${id}`, { isRead: true }))
                );
                setRefreshNotifications(prev => !prev);
            } catch (error) {
                console.error("Error marking notifications as read individually:", error);
            }
        }
    };

    const handleNotificationClick = () => {
        // Handle notification click logic here
        console.log('Notification clicked set all notifications from the api to read');
        setViewNotificationModal(true);
    }

    const modalRef = useRef();

    useEffect(() => {
        function handleClickOutside(event) {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setViewProfileModal(false);
            }
        }

        if (viewProfileModal) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [viewProfileModal]);






    return (
        <div className="w-full bg-white p-4 flex items-center justify-between">
            <div className="flex items-center ">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mx-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>

                <p className="lg:text-sm text-[0.6rem]  text-zinc-500">{Resident?.address || "Complete your kyc registration"}</p>

            </div>
            <div className="flex items-center gap-4">
                <div className="relative inline-block  " onClick={() => { handleNotificationClick() }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 z-0 text-green-600">
                        <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0 1 13.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 0 1-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 1 1-7.48 0 24.585 24.585 0 0 1-4.831-1.244.75.75 0 0 1-.298-1.205A8.217 8.217 0 0 0 5.25 9.75V9Zm4.502 8.9a2.25 2.25 0 1 0 4.496 0 25.057 25.057 0 0 1-4.496 0Z" clipRule="evenodd" />
                    </svg>



                    <span className="w-4 h-4 bg-red-600 border border-white absolute -top-1 left-2 px-[0.26rem] py-[0.07rem] rounded-full text-white text-[0.5rem]">{notifications.reduce((count, item) => {
                        return item.read === false ? count + 1 : count;
                    }, 0)}</span>
                </div>




                <div className="flex items-center gap-2 lg:pr-4"

                    onClick={() => setViewProfileModal(true)}
                >
                    <img src={Resident.passport ? Resident.passport : "/images/emptyimage.png"} className="size-8 rounded-full" />
                    <div className="text-sm flex flex-col items-end">
                        <p className="font-semibold">
                            {`${Resident.firstName} ${Resident.lastName} `}
                        </p>
                        <p className="text-xs text-zinc-900 flex items-center gap-1">
                            <span className="w-3 h-3 bg-green-600 border border-white rounded-full"></span>
                            {Resident.userType}
                        </p>

                    </div>
                    <button className={viewProfileModal ? "transform rotate-180" : ''}
                    >

                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" fill="none">
                            <path
                                d="M11 1.5L6 6.5L1 1.5"
                                stroke="#333333"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>


                    </button>
                </div>
            </div>
            {viewNotificationModal && (
                <div
                    className="fixed inset-0 bg-black/20 z-50 font-sans flex lg:justify-end justify-center items-center lg:items-center min-h-screen overflow-y-auto"
                    onClick={() => setViewNotificationModal(false)}
                >
                    <aside
                        onClick={(e) => e.stopPropagation()}
                        className={`fixed top-0 right-0 z-70 lg:h-screen h-full lg:w-[550px] w-full bg-white flex flex-col transform transition-transform ease-in-out duration-500 ${viewNotificationModal ? 'translate-x-0' : 'translate-x-full'
                            }`}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-zinc-200">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-lg font-semibold text-zinc-800">Notifications</h2>
                                    {notifications.some(n => !n.read) && (
                                        <button
                                            onClick={handleMarkAllAsRead}
                                            className="text-xs text-green-700 hover:text-green-800 font-medium underline cursor-pointer"
                                        >
                                            Mark all as read
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={() => setViewNotificationModal(false)}
                                    className="text-zinc-500 hover:text-black text-2xl"
                                >
                                    &times;
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex mt-4 space-x-6 text-sm font-medium">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab}
                                        className={`pb-2 transition-all duration-300 border-b-2 ${activeTab === tab
                                            ? 'border-green-600 text-black font-semibold'
                                            : 'border-transparent text-zinc-500 hover:text-zinc-700'
                                            }`}
                                        onClick={() => setActiveTab(tab)}
                                    >
                                        {tab}
                                        {tab === 'Unread' && notifications.some(n => !n.read) && (
                                            <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-red-600 text-white rounded-full">
                                                {notifications.filter(n => !n.read).length}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="p-6 space-y-4 overflow-y-auto flex-1">
                            {filteredNotifications.length === 0 ? (
                                <div className="text-center py-16 text-zinc-400 text-sm">
                                    No {activeTab === 'All' ? '' : activeTab.toLowerCase()} notifications
                                </div>
                            ) : (
                                filteredNotifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleRead(notification.id)}
                                        className={`p-4 rounded-xl transition-all cursor-pointer border ${notification.read ? 'bg-white border-zinc-200 hover:bg-zinc-50' : 'bg-green-50/50 border-green-200 hover:bg-green-50'}`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-semibold text-sm text-zinc-900 flex items-center gap-2">
                                                {!notification.read && (
                                                    <span className="w-2 h-2 bg-green-600 rounded-full flex-shrink-0"></span>
                                                )}
                                                {notification.title}
                                            </h3>
                                            <span className="text-xs text-zinc-400">{notification.time}</span>
                                        </div>
                                        <p className="text-sm text-zinc-600 pl-4">{notification.message}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </aside>
                </div>
            )}

            {viewProfileModal && (
                <div className="fixed inset-0 backdrop-blur-[2px] z-20 bg-black/10 font-sans flex justify-end  " >
                    <div className="  mt-20 lg:mr-8 mr-4 flex flex-col " ref={modalRef}>
                        <div className="p-2 flex flex-col gap-2 bg-white rounded-2xl ">
                            {/* <button
                                onClick={() => setViewProfileModal(false)}

                                className="flex rounded-full bg-red-100 hover:bg-red-200 p-1 text-red-600 items-center justify-center"
                            >
                                <svg
                                    className="size-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    ></path>
                                </svg>
                            </button> */}


                            <button
                                onClick={() => {
                                    setViewProfileModal(false);
                                    navigate("/service");
                                }}
                                className='flex items-center gap-2  text-zinc-700 font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out hover:bg-zinc-100 cursor-pointer'
                            >
                                View Profile
                            </button>
                            <button
                                onClick={() => handleLogout()}
                                className='flex items-center gap-2  text-red-600 font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out'

                            >
                                <span>
                                    Sign Out
                                </span>

                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
                                    <path
                                        d="M10 2.5H12.6667C13.0203 2.5 13.3594 2.64048 13.6095 2.89052C13.8595 3.14057 14 3.47971 14 3.83333V13.1667C14 13.5203 13.8595 13.8594 13.6095 14.1095C13.3594 14.3595 13.0203 14.5 12.6667 14.5H10"
                                        stroke="#D70606"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M6.6665 11.8332L9.99984 8.49984L6.6665 5.1665"
                                        stroke="#D70606"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M10 8.5H2"
                                        stroke="#D70606"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>

                            </button>




                        </div>
                    </div>
                </div>

            )}

        </div>
    );
};



export default Topbar;