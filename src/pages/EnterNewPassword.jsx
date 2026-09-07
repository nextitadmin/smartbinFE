import React, { useState, useEffect } from "react";
import api from "../api/axiosConfig.js";
import useAuthStore from "../store/authStore";
import { useNavigate, useLocation } from "react-router-dom";
import useTokenStore from "../store/tokenStore.js";

export default function ChangePassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [cPassword, setCPassword] = useState("");
  const [notification, setNotification] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const storeUserType = useAuthStore((state) => state.userType);
  const storedUserType = storeUserType || localStorage.getItem("userType");
  const userType = storedUserType ? storedUserType.toLowerCase() : "";

  const clearNotification = () => setNotification(null);

  useEffect(() => {
    if (location.state?.notification) {
      setNotification(location.state.notification);
    }
  }, [location.state]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(clearNotification, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting password change for user type:", userType);
    
    if (!userType) {
      setNotification({ type: "error", message: "User type not found." });
      return;
    }

    if (password !== cPassword) {
      setNotification({ type: "error", message: "Passwords don't match." });
      return;
    }

    const requestMap = {
      resident: "/residents/reset-password",
      corporate: "/corporate/reset-password",
      agent: "/agents/password-reset/complete",
      facilitymgr: "/facility-managers/account/password/complete",
    };

    const passwordFieldMap = {
      resident: "password",
      corporate: "password",
      agent: "password",
      facilitymgr: "newPassword",
    };

    const url = requestMap[userType];
    const passwordField = passwordFieldMap[userType];
    // const token = useTokenStore.getState().bearerToken || localStorage.getItem('bearerToken');
    // const bearerToken = token || localStorage.getItem("bearerToken") || "";
    // console.log("Bearer token:", bearerToken);
    

    if (!url || !passwordField) {
      setNotification({ type: "error", message: data.data?.message || "Missing required data." });
      return;
    }

    const requestBody = {
      [passwordField]: password,
      confirmPassword: cPassword,
    };

    if (!url) {
      setNotification({ type: "error", message: "Invalid user type" });
      return;
    }

      
    try {
      const response = await api.post(url, requestBody);
      console.log("Response from password change:", response);

      const { data } = response;
      console.log("Data from password change response:", data);

      if (data.success) {
        const successMsg = data.data?.message || data.message || "Password changed successfully!";
        setNotification({
          type: "success",
          message: successMsg,
        });

        localStorage.removeItem("userType");
        localStorage.removeItem("bearerToken");

        setTimeout(() => {
          navigate("/", {
            state: {
              notification: {
                type: "success",
                message: successMsg,
              },
            },
          });
        }, 1500);
      } else {
        setNotification({
          type: "error",
          message: data.message || "Error changing password",
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setNotification({
        type: "error",
        message:
          error?.response?.data?.message || "Server error occurred.",
      });
    }
  };
  

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-white">
      {/* Left Panel */}
      <div className="lg:w-7/12 w-full h-full flex flex-col  lg:px-36 px-8 py-12 bg-white">
        <p className="text-zinc-400 text-2xl py-8">Powered by:</p>
        {/* Logos */}
        <div className="flex flex-wrap gap-6 mb-12 items-center justify-start">
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
              Enter new password
            </h2>
            <p className="text-zinc-400 mt-1">Enter your new password</p>
          </div>

          {/* Form */}
          <form className="space-y-6 max-w-xl my-8 " onSubmit={handleSubmit}>
            {/* Password Field */}
            <div className="relative">
              <label htmlFor="password">Password</label>

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-zinc-300 rounded-xl px-4 py-3 pr-10 bg-white focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="Password"
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
            {/* Confirm Password Field */}
            <div className="relative">
              <label htmlFor="cpassword">Confirm Password</label>

              <input
                type={showConfirmPassword ? "text" : "password"}
                name="cpassword"
                value={cPassword}
                onChange={(e) => setCPassword(e.target.value)}
                className="w-full border border-zinc-300 rounded-xl px-4 py-3 pr-10 bg-white focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="Confirm Password"
              />
              <svg
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                    showConfirmPassword
                      ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z"
                      : "M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a10.05 10.05 0 012.184-3.362M9.88 9.88A3 3 0 0014.12 14.12M6.1 6.1l11.8 11.8"
                  }
                />
              </svg>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-green-700 text-white py-3 rounded-xl font-semibold hover:bg-green-800 transition"
            >
              Submit
            </button>
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
          className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg max-w-sm z-50 ${
            notification.type === "success"
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
              className={`ml-4 text-xl font-semibold leading-none ${
                notification.type === "success"
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
