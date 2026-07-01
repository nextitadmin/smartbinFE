import { NavLink } from "react-router-dom";
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';


const Sidebar = ({ addkey }) => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const navItems = [
        { label: 'Dashboard', icon: DashboardIcon, route: { routes: ['/dashboard'], main: '/dashboard' } },
        { label: 'User Management', icon: PersonIcon, route: { routes: ['/user-management'], main: '/user-management' } },
        { label: 'My Facilities', icon: PersonIcon, route: { routes: ['/my-facilities'], main: '/my-facilities' } },
        { label: 'Application Manager', icon: DocumentIcon, route: { routes: ['/appmanager', '/applyforsmartbin'], main: '/applyforsmartbin' } },
        { label: 'Waste Management', icon: WasteIcon, route: { routes: ['/wm', "/wastes"], main: '/wastes' } },
        { label: 'Bills', icon: BillIcon, route: { routes: ['/billconfirm', "/bills"], main: '/bills' } },
        { label: 'Payment', icon: PaymentIcon, route: { routes: ['/payments', '/receipts', '/wallet'], main: '/payments' } },
        { label: 'Report', icon: ReportIcon, route: { routes: ['/reports'], main: '/reports' } },
        { label: 'Service Configuration', icon: SettingsIcon, route: { routes: ['/service', '/notifications-settings', '/helpandsupport', "/client-preferences"], main: '/service' } },
        { label: 'Team Members', icon: TeamIcon, route: { routes: ['/team-members'], main: '/team-members' } },

        { label: 'KYC Application', icon: UserIcon, route: { routes: ['/newkycapplication', '/kycapplication'], main: '/newkycapplication' } },
    ];



    return (
        <>
            {/* Mobile Menu Toggle Button */}
            <button
                className="lg:hidden fixed top-12 -left-2 z-50 bg-green-700 p-2 rounded-full"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Open Sidebar"
            >
                {/* Hamburger Icon */}
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Backdrop Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/10 bg-opacity-40 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 justify-between left-0 z-50 min-h-screen h-full lg:w-72 sm:max-w-1/4 bg-white border-r border-zinc-200  flex flex-col  p-4 transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0 w-72' : '-translate-x-full '
                    } md:static `}
            >

                <div>

                    <div className='flex flex-col items-center max-w-[95%] mx-auto my-4 mb-16' >
                        <img src="/images/sealLogo.svg" alt="Lagos Seal" className="h-16 mb-1 p-2" />
                        <p className='text-xs uppercase text-center justify-center'>
                            Utilities Service Provider Initiative  by THE LAGOS STATE GOVERMENT</p>
                    </div>
                    <nav className="space-y-4 text-sm text-zinc-800 my-4">
                        {navItems.map(({ label, icon: Icon, route }) => (
                            <NavLink to={route.main} key={label + addkey}>
                                <div className={`flex items-center gap-3 px-3 py-4 rounded  cursor-pointer ${route.routes.includes(location.pathname) ? 'bg-green-700 text-white' : 'hover:bg-zinc-100'} `}>
                                    {typeof Icon === 'function' && <Icon className={`w-6 h-6 ${route.routes.includes(location.pathname) ? '' : 'text-green-700'}`} />}
                                    <span>{label}</span>
                                </div>
                            </NavLink>
                        ))}
                    </nav>
                </div>

            </aside>
        </>
    );
};

// SVG Components
const DashboardIcon = (props) => (
    <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M18.3333 9.3234V3.65674C18.3333 2.40674 17.8 1.90674 16.475 1.90674H13.1083C11.7833 1.90674 11.25 2.40674 11.25 3.65674V9.3234C11.25 10.5734 11.7833 11.0734 13.1083 11.0734H16.475C17.8 11.0734 18.3333 10.5734 18.3333 9.3234Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.3333 16.8237V15.3237C18.3333 14.0737 17.8 13.5737 16.475 13.5737H13.1083C11.7833 13.5737 11.25 14.0737 11.25 15.3237V16.8237C11.25 18.0737 11.7833 18.5737 13.1083 18.5737H16.475C17.8 18.5737 18.3333 18.0737 18.3333 16.8237Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.75002 11.1567V16.8234C8.75002 18.0734 8.21669 18.5734 6.89169 18.5734H3.52502C2.20002 18.5734 1.66669 18.0734 1.66669 16.8234V11.1567C1.66669 9.90674 2.20002 9.40674 3.52502 9.40674H6.89169C8.21669 9.40674 8.75002 9.90674 8.75002 11.1567Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.75002 3.65674V5.15674C8.75002 6.40674 8.21669 6.90674 6.89169 6.90674H3.52502C2.20002 6.90674 1.66669 6.40674 1.66669 5.15674V3.65674C1.66669 2.40674 2.20002 1.90674 3.52502 1.90674H6.89169C8.21669 1.90674 8.75002 2.40674 8.75002 3.65674Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>

);

const DocumentIcon = (props) => (
    <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <g fill="currentColor">
            <path d="M16 22.75H8c-3.65 0-5.75-2.1-5.75-5.75v-10C2.25 3.35 4.35 1.25 8 1.25h8c3.65 0 5.75 2.1 5.75 5.75v10c0 3.65-2.1 5.75-5.75 5.75zm-8-20C5.14 2.75 3.75 4.14 3.75 7v10c0 2.86 1.39 4.25 4.25 4.25h8c2.86 0 4.25-1.39 4.25-4.25v-10c0-2.86-1.39-4.25-4.25-4.25z" />
            <path d="M18.5 9.25h-2c-1.52 0-2.75-1.23-2.75-2.75v-2c0-.41.34-.75.75-.75s.75.34.75.75v2c0 .69.56 1.25 1.25 1.25h2c.41 0 .75.34.75.75s-.34.75-.75.75z" />
            <path d="M12 13.75H8c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h4c.41 0 .75.34.75.75s-.34.75-.75.75z" />
            <path d="M16 17.75H8c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h8c.41 0 .75.34.75.75s-.34.75-.75.75z" />
        </g>
    </svg>
);
const WasteIcon = (props) => (
    <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path fill="#044B94" fillOpacity="0.0" d="M3 6h18M5 6v14c0 1.1046.89543 2 2 2h10c1.1046 0 2-.8954 2-2V6M8 6V4c0-1.10457.89543-2 2-2h4c1.1046 0 2 .89543 2 2v2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
);
const BillIcon = (props) => (
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M17.74 22.75H6.26C3.77 22.75 1.75 20.73 1.75 18.24V11.51C1.75 9.02001 3.77 7 6.26 7H17.74C20.23 7 22.25 9.02001 22.25 11.51V12.95C22.25 13.36 21.91 13.7 21.5 13.7H19.48C19.13 13.7 18.81 13.83 18.58 14.07L18.57 14.08C18.29 14.35 18.16 14.72 18.19 15.1C18.25 15.76 18.88 16.29 19.6 16.29H21.5C21.91 16.29 22.25 16.63 22.25 17.04V18.23C22.25 20.73 20.23 22.75 17.74 22.75ZM6.26 8.5C4.6 8.5 3.25 9.85001 3.25 11.51V18.24C3.25 19.9 4.6 21.25 6.26 21.25H17.74C19.4 21.25 20.75 19.9 20.75 18.24V17.8H19.6C18.09 17.8 16.81 16.68 16.69 15.24C16.61 14.42 16.91 13.61 17.51 13.02C18.03 12.49 18.73 12.2 19.48 12.2H20.75V11.51C20.75 9.85001 19.4 8.5 17.74 8.5H6.26Z" fill="currentColor" />
        <path d="M2.5 13.16C2.09 13.16 1.75 12.82 1.75 12.41V7.84006C1.75 6.35006 2.69 5.00001 4.08 4.47001L12.02 1.47001C12.84 1.16001 13.75 1.27005 14.46 1.77005C15.18 2.27005 15.6 3.08005 15.6 3.95005V7.75003C15.6 8.16003 15.26 8.50003 14.85 8.50003C14.44 8.50003 14.1 8.16003 14.1 7.75003V3.95005C14.1 3.57005 13.92 3.22003 13.6 3.00003C13.28 2.78003 12.9 2.73003 12.54 2.87003L4.6 5.87003C3.79 6.18003 3.24 6.97006 3.24 7.84006V12.41C3.25 12.83 2.91 13.16 2.5 13.16Z" fill="currentColor" />
        <path d="M19.5985 17.7992C18.0885 17.7992 16.8085 16.6792 16.6885 15.2392C16.6085 14.4092 16.9085 13.5992 17.5085 13.0092C18.0185 12.4892 18.7185 12.1992 19.4685 12.1992H21.5485C22.5385 12.2292 23.2985 13.0092 23.2985 13.9692V16.0292C23.2985 16.9892 22.5385 17.7692 21.5785 17.7992H19.5985ZM21.5285 13.6992H19.4785C19.1285 13.6992 18.8085 13.8292 18.5785 14.0692C18.2885 14.3492 18.1485 14.7292 18.1885 15.1092C18.2485 15.7692 18.8785 16.2992 19.5985 16.2992H21.5585C21.6885 16.2992 21.8085 16.1792 21.8085 16.0292V13.9692C21.8085 13.8192 21.6885 13.7092 21.5285 13.6992Z" fill="currentColor" />
        <path d="M14 12.75H7C6.59 12.75 6.25 12.41 6.25 12C6.25 11.59 6.59 11.25 7 11.25H14C14.41 11.25 14.75 11.59 14.75 12C14.75 12.41 14.41 12.75 14 12.75Z" fill="currentColor" />
    </svg>
);

const PaymentIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
    </svg>

);


const ReportIcon = (props) => (

    <svg width="18" height="9" viewBox="0 0 18 9" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M17.0917 0.315346C17.0142 0.237239 16.9221 0.175244 16.8205 0.132937C16.719 0.0906297 16.61 0.0688477 16.5 0.0688477C16.39 0.0688477 16.2811 0.0906297 16.1795 0.132937C16.078 0.175244 15.9858 0.237239 15.9084 0.315346L10.6667 5.56535L7.0917 1.98201C7.01423 1.90391 6.92206 1.84191 6.82051 1.7996C6.71896 1.7573 6.61004 1.73551 6.50003 1.73551C6.39002 1.73551 6.2811 1.7573 6.17955 1.7996C6.078 1.84191 5.98583 1.90391 5.90836 1.98201L0.908364 6.98201C0.830257 7.05948 0.768262 7.15165 0.725954 7.2532C0.683647 7.35475 0.661865 7.46367 0.661865 7.57368C0.661865 7.68369 0.683647 7.79261 0.725954 7.89416C0.768262 7.99571 0.830257 8.08788 0.908364 8.16535C0.985833 8.24345 1.078 8.30545 1.17955 8.34776C1.2811 8.39006 1.39002 8.41184 1.50003 8.41184C1.61004 8.41184 1.71896 8.39006 1.82051 8.34776C1.92206 8.30545 2.01423 8.24345 2.0917 8.16535L6.50003 3.74868L10.075 7.33201C10.1525 7.41012 10.2447 7.47211 10.3462 7.51442C10.4478 7.55673 10.5567 7.57851 10.6667 7.57851C10.7767 7.57851 10.8856 7.55673 10.9872 7.51442C11.0887 7.47211 11.1809 7.41012 11.2584 7.33201L17.0917 1.49868C17.1698 1.42121 17.2318 1.32904 17.2741 1.22749C17.3164 1.12594 17.3382 1.01702 17.3382 0.907013C17.3382 0.797003 17.3164 0.688082 17.2741 0.586532C17.2318 0.484983 17.1698 0.392815 17.0917 0.315346Z" fill="currentColor" />
    </svg>
);


const SettingsIcon = (props) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M10.49 2.23006L5.49997 4.11006C4.34997 4.54006 3.40997 5.90006 3.40997 7.12006V14.5501C3.40997 15.7301 4.18997 17.2801 5.13997 17.9901L9.43997 21.2001C10.85 22.2601 13.17 22.2601 14.58 21.2001L18.88 17.9901C19.83 17.2801 20.61 15.7301 20.61 14.5501V7.12006C20.61 5.89006 19.67 4.53006 18.52 4.10006L13.53 2.23006C12.68 1.92006 11.32 1.92006 10.49 2.23006Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
        <path d="M12 12.5C13.1046 12.5 14 11.6046 14 10.5C14 9.39543 13.1046 8.5 12 8.5C10.8954 8.5 10 9.39543 10 10.5C10 11.6046 10.8954 12.5 12 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
        <path d="M12 12.5V15.5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
    </svg>
);

const UserIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
    </svg>

);
const PersonIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>

);

const TeamIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    </svg>

);




export default Sidebar;