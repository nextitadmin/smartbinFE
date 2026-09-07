import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axiosConfig.js";
import useAuthStore from "../store/authStore";
import useTokenStore from "../store/tokenStore";

const EmailVerification = () => {
  const [code, setCode] = useState(["", "", "", "", ""]);
  const [time, setTime] = useState(60);
  const inputs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [notification, setNotification] = useState(null);
  const setToken = useAuthStore((state) => state.setToken);
  const setBearerToken = useTokenStore((state) => state.setBearerToken);

  const storeUserType = useAuthStore((state) => state.userType);
  const storedUserType = storeUserType || localStorage.getItem("userType");
  const storedEmail = localStorage.getItem("email");
  const userType = storedUserType ? storedUserType.toLowerCase() : "";

  const clearNotification = () => {
    setNotification(null);
  };


  useEffect(() => {
    if (location.state?.notification) {
      setNotification(location.state.notification);
    }
  }, [location.state]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        clearNotification();
      }, 5000); // Hide after 5 seconds
      return () => clearTimeout(timer); // Cleanup timer on component unmount or notification change
    }
  }, [notification]);

  const handleChange = (e, index) => {
    const val = e.target.value.replace(/\D/, ""); // Only digits
    const newCode = [...code];
    newCode[index] = val;
    setCode(newCode);

    if (val && index < code.length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (code[index]) {
        const newCode = [...code];
        newCode[index] = "";
        setCode(newCode);
      } else if (index > 0) {
        inputs.current[index - 1]?.focus();
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime == 0) {
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async () => {
    if (!userType) {
      setNotification({ type: "error", message: "User type not found." });
      return;
    }

    if (!code.every((digit) => digit !== "")) {
      setNotification({ type: "error", message: "Please enter all 5 digits." });
      return;
    }

    const joinedCode = code.join("");

    const requestMap = {
      resident: {
        method: "post",
        url: "/residents/verify-password-reset",
        data: { code: joinedCode },
      },
      corporate: {
        method: "post",
        url: "/corporate/verify-password-reset",
        data: { code: joinedCode },
      },
      agent: {
        method: "post",
        url: "/agents/password-reset/verify",
        data: { code: joinedCode },
      },
      facilitymgr: {
        method: "post",
        url: "/facility-managers/account/password/verify",
        data: { code: joinedCode },
      },
    };

    const config = requestMap[userType?.toLowerCase()];
    if (!config) {
      setNotification({ type: "error", message: "Invalid user type" });
      return;
    }

    try {
      const response = await api.request(config);
      const data = response.data;


      if (data.success) {
        setBearerToken(data.data.token);

        const verifyMsg = data.message || "Submitted successfully!";
        setNotification({
          type: "success",
          message: verifyMsg,
        });

        setTimeout(() => {
          navigate("/enternewpassword", {
            state: {
              notification: {
                type: "success",
                message: verifyMsg,
              },
            },
          });
        }, 1200);
      } else {
        setNotification({
          type: "error",
          message: data.message || "Wrong OTP or timed out!",
        });
      }
    } catch (error) {
      console.error("Error during verification", error);
      setNotification({ type: "error", message: "Error validating OTP" });
    }
  };

  // Resending OTP
  const handleResend = async () => {
    if (!userType) {
      setNotification({ type: "error", message: "User type not found." });
      return;
    }

    const resendMap = {
      resident: "/residents/request-password-reset",
      corporate: "/corporate/resend-otp",
      agent: "/agents/password-reset/request",
      facilitymgr: "/facility-managers/account/password/verify",
    };

    const url = resendMap[userType];

    if (!url) {
      setNotification({
        type: "error",
        message: "Invalid user type for resend.",
      });
      return;
    }

    if (!storedEmail) {
      setNotification({ type: "error", message: "Email not found." });
      return;

    }

    try {
      await api.post(url, { email: storedEmail }); // Send request to resend
      setNotification({
        type: "success",
        message: "OTP has been resent to your email.",
      });
      setTime(60); // Restart countdown
    } catch (err) {
      console.error("Resend failed:", err);
      setNotification({ type: "error", message: "Failed to resend OTP." });
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
          <div className=" flex flex-col  bg-white px-4">
            <div className="max-w-md w-full ">
              <h2 className="text-3xl font-bold mb-1">Confirm It’s you</h2>
              <p className="text-zinc-500 mb-8">
                Enter the 5 digit code that was sent to your email address
              </p>

              <label className="block text-left font-medium mb-2 text-black text-lg">
                Enter Code
              </label>
              <div className="flex gap-3 mb-6">
                {code.map((digit, idx) => (
                  <input
                    key={idx}
                    inputMode="numeric"
                    type="text"
                    maxLength="1"
                    className="w-14 h-16 text-center border border-zinc-300 rounded-lg text-2xl outline-none focus:ring-2 focus:ring-green-600"
                    value={digit}
                    onChange={(e) => handleChange(e, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    ref={(el) => (inputs.current[idx] = el)}
                  />
                ))}
              </div>

              <button
                className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-lg text-lg mb-6"
                onClick={handleSubmit}
              >
                Continue
              </button>

              <div className="flex justify-between text-sm text-zinc-700">
                <p>
                  Didn’t get code?{" "}
                  <button
                    className={`font-medium ${time === 0
                        ? "text-green-700 hover:underline"
                        : "text-zinc-400 cursor-not-allowed"
                      }`}
                    onClick={time === 0 ? handleResend : undefined}
                    disabled={time !== 0}
                  >
                    Resend
                  </button>
                </p>
                <p className="text-red-500 font-medium">{`${time}secs`}</p>
              </div>
            </div>
          </div>
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
};

export default EmailVerification;
