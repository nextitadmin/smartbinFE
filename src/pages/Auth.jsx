import React, { useState, useEffect } from "react";
import api from "../api/axiosConfig.js";
import { NavLink, useNavigate } from "react-router-dom";
import useRouteStore from "../store/routeStore.js";
//please work
export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [notification, setNotification] = useState(null);
    const [startLogin, setStartLogin] = useState(false);
    const navigate = useNavigate();

    const routesState = useRouteStore((state) => state);

    const [form, setForm] = useState({
        email: "",
        password: "",
        userType: "resident",
    });

    useEffect(() => {
        localStorage.setItem("userType", form.userType)
        console.log("userType", form.userType)

        routesState.userType = localStorage.getItem('userType')
        routesState.setRoutes();


    }, [form.userType])

    localStorage.setItem("userType", form.userType);



    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });

        localStorage.setItem("userType", e.target.value);
        routesState.userType = localStorage.getItem('userType');
        routesState.setRoutes();



    };

    const clearNotification = () => {
        setNotification(null);
    };

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                clearNotification();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStartLogin(true);

        const loginEndpoints = {
            agent: "/agents/login",
            resident: "/residents/login",
            corporate: "/corporate/login",
            facilitymgr: "/facility-managers/login",
        };
        // const url = form.userType === 'agent' ? '/agents/login' : 'resident' ? '/residents/login' : 'facilitymgr'? '/facility-managers/login' : '';
        const url = loginEndpoints[form.userType];

        if (!url) {
            setNotification({ type: "error", message: "Invalid user type" });
            return;
        }
        try {
            const response = await api.post(url, { ...form });
            const data = response.data;
            if (data.success) {
                setStartLogin(false);
                setNotification({ type: "success", message: "Logged in." });
                navigate("/confirm");
            } else {
                setStartLogin(false);
                setNotification({
                    type: "error",
                    message: data.message || "Wrong email or password",
                });
            }
        } catch (error) {
            setStartLogin(false);
             setNotification({
                    type: "error",
                    message: error.response.data.message || "Wrong email or password",
                });
            console.error("Error during login", error);
        }
    };

    return (
        <div className="flex min-h-screen flex-col md:flex-row bg-white">
            {/* Left Panel */}
            <div className="lg:w-7/12 w-full h-full flex flex-col  lg:px-36 px-8 py-12 bg-white">
                <p className="text-zinc-400 text-2xl py-8">Powered by:</p>
                {/* Logos */}
                <div className="flex flex-wrap gap-6 mb-8 items-center justify-start">
                    <img
                        src="/images/lagosmewr.png"
                        alt="Lagos"
                        className="h-12 object-contain"
                    />
                    <img
                        src="/images/lawma-logo.png"
                        alt="LAWMA"
                        className="h-12 object-contain"
                    />
                    <img
                        src="/images/wema-logo.png"
                        alt="Wema Bank"
                        className="h-12 object-contain"
                    />
                </div>

                <div className="lg:my-20 my-12">
                    {/* Welcome Text */}
                    <div className="lg:mb-20">
                        <h2 className="text-5xl text-zinc-900 font-semibold">
                            Welcome back
                        </h2>
                        <p className="text-zinc-400 mt-1">Login to your account</p>
                    </div>

                    {/* Form */}
                    <form className="space-y-6 max-w-xl my-8 " onSubmit={handleSubmit}>
                        {/* User Type Radio Buttons */}
                        <div className="lg:mb-8 mb-12">
                            <label className="block font-medium text-zinc-700 mb-4">
                                Login As
                            </label>
                            <div className="flex lg:gap-12  flex-wrap gap-4 ">
                                {[
                                    { value: "resident", label: "A resident" },
                                    { value: "corporate", label: "Corporate body" },
                                    { value: "agent", label: "An agent" },
                                    { value: "facilitymgr", label: "Facility Manager" },



                                ].map((type) => {
                                    const isSelected = form.userType === type.value;
                                    return (
                                        <label
                                            key={type.value}
                                            className="flex items-center space-x-2 cursor-pointer group "
                                        >
                                            {/* Custom styled radio button circle */}
                                            <div
                                                className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-150 ease-in-out
                            ${isSelected
                                                        ? "border-green-700 bg-green-700" // Selected state
                                                        : "border-zinc-400 group-hover:border-green-700" // Default and hover states
                                                    }`}
                                            >
                                                {/* Inner dot for selected state */}
                                                {isSelected && (
                                                    <div className="w-5 h-5 rounded-full bg-green-700 border-white border-4"></div>
                                                )}
                                            </div>
                                            {/* Hidden actual radio input */}
                                            <input
                                                type="radio"
                                                name="userType"
                                                value={type.value}
                                                checked={isSelected}
                                                onChange={handleChange}
                                                className="hidden"
                                                aria-labelledby={`${type.value}-label-userType`}
                                            />
                                            {/* Text label for the option */}
                                            <span
                                                id={`${type.value}-label-userType`}
                                                className={` 
                            ${isSelected
                                                        ? "text-green-700 font-medium" // Selected text style
                                                        : "text-zinc-700 group-hover:text-green-700" // Default and hover text style
                                                    }`}
                                            >
                                                {type.label}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="relative">
                            <label htmlFor="email">Email Address</label>
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full border border-zinc-300 rounded-xl px-4 bg-white py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-green-600"
                                placeholder="example@email.com"
                            />
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 text-lg mt-3 w-5 h-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 12l2 2l4-4"
                                />
                                <circle cx="12" cy="12" r="10" />
                            </svg>
                        </div>

                        {/* Password Field */}
                        <div className="relative">
                            <label htmlFor="password">Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full border border-zinc-300 rounded-xl px-4 py-3 pr-10 bg-white focus:outline-none focus:ring-2 focus:ring-green-600"
                                placeholder="Password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                            />
                            <svg
                                onClick={() => setShowPassword(!showPassword)}
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5 text-zinc-500 absolute right-4 top-1/2 mt-3  -translate-y-1/2 cursor-pointer"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d={
                                        showPassword
                                            ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z"
                                            : "M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a10.05 10.05 0 012.184-3.362M9.88 9.88A3 3 0 0014.12 14.12M6.1 6.1l11.8 11.8"
                                    }
                                />
                            </svg>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={startLogin}
                            className={`w-full py-4 my-4 rounded-xl font-semibold transition text-white ${startLogin
                                ? "bg-green-700/50 cursor-not-allowed"
                                : "bg-green-700 hover:bg-green-800 "
                                }`}
                        >
                            {startLogin ? "Logging in..." : "Login"}
                        </button>

                        {/* Forgot password */}
                        <NavLink to="/resetpassword">
                            <div className="text-sm text-green-700  cursor-pointer hover:underline">
                                Forgot Password?
                            </div>
                        </NavLink>

                        {/* Signup */}
                        <NavLink to="/signup">
                            <div className="text-sm text-green-700  cursor-pointer hover:underline">
                                Don't have an account? Sign up
                            </div>
                        </NavLink>
                    </form>
                </div>
            </div>

            {/* Right Panel */}
            <div className="hidden md:flex w-5/12 items-center justify-center bg-[url(/images/smilebin.jpg)] relative overflow-hidden bg-cover bg-no-repeat bg-center">
                <div className="absolute top-0 my-14   ">
                    <div className=" z-20 flex flex-row items-center gap-4">
                        <img
                            src="/images/sealLogo.svg"
                            alt="Lagos Seal"
                            className="h-20 mb-1 p-2"
                        />
                        <p className="text-white font-medium text-sm uppercase tracking-wide">
                            Utilities Service Provider Initiative by
                            <br />
                            The Lagos State Government
                        </p>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white px-6 py-4 text-center z-20">
                    <p className="text-lg">
                        "Experience the power of smart waste management. Sign up now and
                        discover a cleaner, greener world"
                    </p>
                </div>
            </div>

            {/* Notification */}
            {notification && (
                <div
                    className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg max-w-sm z-50 ${notification.type === "success"
                        ? "bg-green-100 border border-green-400 text-green-800"
                        : "bg-red-100 border border-red-400 text-red-800"
                        }`}
                    role={notification.type === "error" ? "alert" : "status"}
                >
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{notification.message}</p>
                        <button
                            onClick={clearNotification}
                            className={`ml-4 text-xl font-semibold leading-none ${notification.type === "success"
                                ? "text-green-800 hover:text-green-900"
                                : "text-red-800 hover:text-red-900"
                                } focus:outline-none`}
                            aria-label="Close notification"
                        >
                            &times;
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
