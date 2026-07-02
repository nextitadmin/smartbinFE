import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/CorporateTopBar';
import ServiceConfigNav from '../components/ServiceConfigNav';
import useAuthStore from '../store/authStore';

// --- Default Data Layer ---
// const defaultNotificationSettings = {
//     receiveMethod: {
//         sms: true,
//         email: true,
//         inApp: true,
//     },
//     applicationUpdates: true,
//     smartBinUpdates: true,
//     lowWalletBalance: true,
// };



// --- Inline SVG Loader ---
const InlineLoader = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

// --- Reusable Toggle Switch Component ---
const ToggleSwitch = ({ id, label, description, enabled, onChange }) => {
    return (
        <div className="flex items-center justify-between py-4 ">
            {/* Text content on the left */}
            <div className="flex flex-col mr-4">
                <label htmlFor={id} className="text-sm font-medium text-zinc-800 cursor-pointer">
                    {label}
                </label>
                <p className="text-xs text-zinc-500">{description}</p>
            </div>

            {/* Toggle switch on the right */}
            <button
                type="button" // Important: Prevent form submission
                id={id}
                onClick={() => onChange(!enabled)} // Call onChange with the new value
                className={`${enabled ? 'bg-green-700' : 'bg-zinc-300'
                    } relative inline-flex items-center lg:h-6 h-5 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-700`}
                role="switch"
                aria-checked={enabled}
            >
                <span
                    className={`${enabled ? 'lg:translate-x-6 translate-x-4' : 'translate-x-1'
                        } inline-block lg:size-4 size-3 transform bg-white rounded-full transition-transform duration-200 ease-in-out`}
                />
            </button>
        </div>
    );
};


function NotificationsPage() {
    // --- State Management ---
    const [settings, setSettings] = useState({
        receiveMethod: {
            sms: true,
            email: true,
            inApp: true,
        },
        applicationUpdates: true,
        smartBinUpdates: true,
        lowWalletBalance: true,
    });
    const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: string } | null
    const [isLoading, setIsLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const { data } = await api.get(`/notifications/settings`)
            if (data.success) {
                setSettings({
                    receiveMethod: {
                        sms: data.data.data.sms,
                        email: data.data.data.email,
                        inApp: data.data.data.inApp,
                    },
                    applicationUpdates: data.data.data.appUpdates,
                    smartBinUpdates: data.data.data.smartBinUpdates,
                    lowWalletBalance: data.data.data.lowWalletBalance,
                });
               
            }
        } catch (error) {
            console.log("error", error);
        } finally {
            setIsLoading(false);
        }
    }
    useEffect(() => {
        fetchSettings();
    }, [])
    // --- Update Handlers ---
    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setSettings(prevSettings => ({
            ...prevSettings,
            receiveMethod: {
                ...prevSettings.receiveMethod,
                [name]: checked,
            },
        }));
        clearNotification();
    };

    const handleToggleChange = (name, value) => {
        setSettings(prevSettings => ({
            ...prevSettings,
            [name]: value,
        }));
        clearNotification();
    };

    const clearNotification = () => {
        setNotification(null);
    };

    // --- Form Submission ---
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission if wrapped in a form tag
        setIsLoading(true);
        clearNotification();
        // Prepare data to send to the API
        const dataToSend = {
            sms: settings.receiveMethod.sms,
            email: settings.receiveMethod.email,
            inApp: settings.receiveMethod.inApp,
            applicationUpdates: settings.applicationUpdates,
            smartBinUpdates: settings.smartBinUpdates,
            lowWalletBalance: settings.lowWalletBalance
        };
        console.log('Sending notification settings to API:', JSON.parse(JSON.stringify(dataToSend)));

        try {
            // --- Replace with actual API call using axios ---
            // Use PUT or POST depending on your API design for updates
            const { data } = await api.put("/notifications/settings", dataToSend); // Or axios.post
            console.log('API Response:', data);

            // Assuming API returns { success: true, message: '...' } on success
            if (data.success) {
                setNotification({ type: 'success', message: data.message || 'Notification settings updated successfully!' });
                fetchSettings();
            }

            // Optionally update default settings state if needed after successful save
            // defaultNotificationSettings = { ...settings }; // Be careful with mutating defaults directly

        } catch (error) {
            console.error("Update failed:", error);
            setNotification({ type: 'error', message: "Error updating" });
        } finally {
            setIsLoading(false);
        }
    };

    // --- Auto-dismiss notification ---
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                clearNotification();
            }, 5000); // Hide after 5 seconds
            return () => clearTimeout(timer); // Cleanup timer on component unmount or notification change
        }
    }, [notification]);



    return (



        <div>
            <div className="flex sans h-screen max-w-screen">

                <Sidebar addkey="1" />
                <div className=" bg-zinc-100 min-h-screen   flex flex-col flex-1 overflow-y-auto  ">

                    <Topbar />

                    <div className="bg-zinc-100 font-sans">
                        <main className="p-4 md:px-4">
                            <div className="p-5 md:p-8 rounded-lg w-full  mx-auto">
                                {/* Header */}
                                <div className="flex flex-wrap justify-between items-center gap-4 mb-2">
                                    <div className="flex flex-col  gap-2">
                                        <h1 className="text-xl md:text-2xl font-semibold text-zinc-800">Service Configuration</h1>
                                        <span className='text-zinc-400 font-light'>Manage your preferences for our smart Bin Services </span>

                                    </div>
                                </div>

                                <ServiceConfigNav />



                                <div className="bg-white p-6 md:p-8 lg:p-10  mx-auto my-10 rounded-lg shadow-md font-sans">
                                    {/* Header */}
                                    {
                                        isLoading ? (
                                            <>
                                                <p>Loading...</p>
                                            </>
                                        ) :
                                            (
                                                <>

                                                    <div className='mb-12 border-b border-zinc-300'>
                                                        <h1 className="text-2xl text-zinc-800">Notifications</h1>
                                                        <p className="text-sm text-zinc-500 mb-6">Configure your notification settings</p>
                                                    </div>


                                                    {/* Notification Method Checkboxes */}
                                                    <div className="my-4">
                                                        <label className="block text-sm font-medium text-zinc-700 mb-3">
                                                            How do you want to receive notifications?
                                                        </label>
                                                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
                                                            {/* SMS Checkbox */}
                                                            <div className="flex items-center mb-2 sm:mb-0">
                                                                <input
                                                                    id="sms"
                                                                    name="sms"
                                                                    type="checkbox"
                                                                    checked={settings?.receiveMethod?.sms}
                                                                    onChange={handleCheckboxChange}
                                                                    className="h-4 w-4 text-green-700 border-zinc-300 rounded focus:ring-green-700 cursor-pointer accent-green-700"
                                                                />
                                                                <label htmlFor="sms" className="ml-2 block text-sm text-zinc-900 cursor-pointer">
                                                                    SMS
                                                                </label>
                                                            </div>
                                                            {/* Email Checkbox */}
                                                            <div className="flex items-center mb-2 sm:mb-0">
                                                                <input
                                                                    id="email"
                                                                    name="email"
                                                                    type="checkbox"
                                                                    checked={settings?.receiveMethod?.email}
                                                                    onChange={handleCheckboxChange}
                                                                    className="h-4 w-4 text-green-700 border-zinc-300 rounded focus:ring-green-700 cursor-pointer accent-green-700"
                                                                />
                                                                <label htmlFor="email" className="ml-2 block text-sm text-zinc-900 cursor-pointer">
                                                                    Email
                                                                </label>
                                                            </div>
                                                            {/* In-app Checkbox */}
                                                            <div className="flex items-center">
                                                                <input
                                                                    id="inApp"
                                                                    name="inApp"
                                                                    type="checkbox"
                                                                    checked={settings?.receiveMethod?.inApp}
                                                                    onChange={handleCheckboxChange}
                                                                    className="h-4 w-4 text-green-700 border-zinc-300 rounded focus:ring-green-700 cursor-pointer accent-green-700"
                                                                />
                                                                <label htmlFor="inApp" className="ml-2 block text-sm text-zinc-900 cursor-pointer">
                                                                    In-app Notifications
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>

                                            )
                                    }

                                    {/* Toggle Switches Section */}
                                    <div className="mb-8">
                                        <ToggleSwitch
                                            id="applicationUpdates"
                                            label="Application Updates"
                                            description="You will receive alerts via email when there are updates on any application."
                                            enabled={settings.applicationUpdates}
                                            onChange={(value) => handleToggleChange('applicationUpdates', value)}
                                        />
                                        <ToggleSwitch
                                            id="smartBinUpdates"
                                            label="SmartBin Updates"
                                            description="We will send you up to date notifications regarding our product enhancements"
                                            enabled={settings.smartBinUpdates}
                                            onChange={(value) => handleToggleChange('smartBinUpdates', value)}
                                        />
                                        <ToggleSwitch
                                            id="lowWalletBalance"
                                            label="Low Wallet Balance"
                                            description="You will receive alerts from us whenever your wallet balance is running low"
                                            enabled={settings.lowWalletBalance}
                                            onChange={(value) => handleToggleChange('lowWalletBalance', value)}
                                        />
                                    </div>

                                    {/* Save Button */}
                                    <div className="mt-8 flex justify-start">
                                        <button
                                            type="button" // Use button type if not inside a <form> that needs submitting natively
                                            onClick={handleSubmit} // Trigger submit logic on click
                                            disabled={isLoading}
                                            className={`inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${isLoading
                                                ? 'bg-green-400 cursor-not-allowed'
                                                : 'bg-green-700 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-700'
                                                } transition-colors duration-150 ease-in-out`}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <InlineLoader />
                                                    Saving...
                                                </>
                                            ) : (
                                                'Save Changes'
                                            )}
                                        </button>
                                    </div>

                                    {/* Notification Pop-up */}
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
                            </div>

                        </main>
                    </div>
                </div>
            </div >
        </div >
    );
}

export default NotificationsPage;

