
import { NavLink } from "react-router-dom";
import React from 'react';
import { useLocation } from 'react-router-dom';

const ServiceConfigNav = () => {

    const location = useLocation();







    return (
        <>
            {/* Mobile Menu Toggle Button */}


            {/* Backdrop Overlay */}



            {/* Sidebar */}
            <div className="flex flex-row gap-4 my-2  w-full py-4 border-zinc-200 ">
                <NavLink
                    to="/service">
                    <p className={`items-left text-sm lg:text-md justify-start p-2 ${location.pathname === '/service' ? 'text-green-700 border-b-2  border-green-700' : 'text-zinc-700'}`}>
                        Profile
                    </p>
                </NavLink>
                <NavLink
                    to="/notifications-settings">
                    <p className={`items-left text-sm lg:text-md  justify-start p-2 ${location.pathname === '/notifications-settings' ? 'text-green-700 border-b-2  border-green-700' : 'text-zinc-700'}`}>
                        Notifications
                    </p>
                </NavLink>
                <NavLink
                    to="/helpandsupport">
                    <p className={`items-left text-sm lg:text-md  justify-start p-2  ${location.pathname === '/helpandsupport' ? 'text-green-700 border-b-2  border-green-700' : 'text-zinc-700'}`}>
                        Help & Support
                    </p>
                </NavLink>

                <NavLink
                    to="/subscription">
                    <p className={`items-left text-sm lg:text-md  justify-start p-2  ${location.pathname === '/client-preferences' ? 'text-green-700 border-b-2  border-green-700' : 'text-zinc-700'}`}>
                        Subscription
                    </p>
                </NavLink>
            </div>

        </>
    );
};

// SVG Components



export default ServiceConfigNav;