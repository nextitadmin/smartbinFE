import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig.js";
import axios from "axios";
import useAuthStore from "../store/authStore";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState("");

  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);

  const [notification, setNotification] = useState(null);

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

  //    const getClientIP = async () => {

  //       try {
  //           const res = await axios.get("https://api.ipify.org?format=json");
  //           return res.data.ip;
  //       } catch (err) {
  //           console.error("Failed to get IP address", err);
  //           return null;
  //       }
  //   };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !userType) {
      setNotification({
        type: "error",
        message: "Please enter your email and select a user type.",
      });
      return;
    }

    // Store userType in localStorage
    localStorage.setItem("userType", userType);

    const requestMap = {
      resident: {
        method: "post",
        url: "/residents/request-password-reset",
        data: { email },
      },
      corporate: {
        method: "post",
        url: "/corporate/request-password-reset",
        data: { email },
      },
      agent: {
        method: "post",
        url: "/agents/password-reset/request",
        data: { email },
      },
      facilitymgr: {
        method: "post",
        url: "/facility-managers/account/password/request",
        data: { email },
      },
    };

    const config = requestMap[userType];

    if (!config) {
      setNotification({
        type: "error",
        message: "Invalid user type selected.",
      });
      return;
    }

    try {
      const response = await api.request(config);
      const { data } = response;

      console.log("API Response:", data);

      const token = data?.message?.split("|")[1];

      const isSuccess =
        (response.status === 200 || response.status === 201) &&
        (data?.succeeded === true || data?.success === true || !!token);

      if (isSuccess) {
        setNotification({
          type: "success",
          message: data?.message || "Reset request successful.",
        });

        if (token) {
          setToken(token);
        }
        localStorage.setItem("email", email);
        navigate("/passwordotp");
      } else {
        setNotification({
          type: "error",
          message:
            data?.message ||
            "Password reset request failed. Please try again later.",
        });
      }
    } catch (error) {
      console.error("Password reset error:", error);
      setNotification({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
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
            <h2 className="lg:text-5xl text-3xl text-zinc-900 font-semibold">
              Forgot Password
            </h2>
            <p className="text-zinc-400 lg:text-2xl text-lg my-4">
              No problem. We can help you recover it
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6 max-w-xl my-8 " onSubmit={handleSubmit}>
            {/* User Type Radio Buttons */}
            <div className="lg:mb-8 mb-12">
              <div className="flex lg:gap-12  flex-wrap gap-4 ">
                {[
                  { value: "resident", label: "A resident" },
                  { value: "corporate", label: "Corporate body" },
                  { value: "agent", label: "An agent" },
                  { value: "facilitymgr", label: "Facility Manager" },
                ].map((type) => {
                  const isSelected = userType === type.value;
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
                        onChange={(e) => setUserType(e.target.value)}
                        className="hidden"
                        aria-labelledby={`${type.value}-label-userType`}
                      />
                      {/* Text label for the option */}
                      <span
                        // id={`${type.value}-label-userType`}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-green-700 text-white py-3 rounded-xl font-semibold hover:bg-green-800 transition"
            >
              Submit
            </button>

            {/* Forgot password */}
            <NavLink to="/" className="text-green-700  block">
              <div className="text-sm text-green-700  cursor-pointer hover:underline">
                I remember my Password
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
            “Experience the power of smart waste management. Sign up now and
            discover a cleaner, greener world”
          </p>
        </div>
      </div>
      {notification && (
        <div
          // Using fixed positioning to overlay on the page
          className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg max-w-sm z-50 ${notification.type === "success"
              ? "bg-green-100 border border-green-400 text-green-800"
              : "bg-red-100 border border-red-400 text-red-800"
            }`}
          // ARIA roles for accessibility
          role={notification.type === "error" ? "alert" : "status"}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{notification.message}</p>
            {/* Close button for the notification */}
            <button
              onClick={clearNotification}
              className={`ml-4 text-xl font-semibold leading-none ${notification.type === "success"
                  ? "text-green-800 hover:text-green-900"
                  : "text-red-800 hover:text-red-900"
                } focus:outline-none`}
              aria-label="Close notification"
            >
              &times; {/* Unicode multiplication sign for 'x' */}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
