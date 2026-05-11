import React, { useState, useEffect } from "react";

import api from "../api/axiosConfig";
import Sidebar from "../components/FacilityMgrSideBar";
import Topbar from "../components/FacilityMgrTopBar";
import ServiceConfigNav from "../components/FacilityMgrServiceConfigNav";
import useFacilityMgrStore from "../store/useFacilityMgrStore";
import useAuthStore from "../store/authStore";
import { useNavigate } from "react-router-dom";
// --- Default Data Layer ---
const defaultProfileData = {
  payerId: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  profileImageUrl: "", // Placeholder image URL (updated color for variety)
};

const defaultPasswordData = {
  currentPassword: "",
  newPassword: "",
};

// --- API Endpoint (Placeholder) ---
// Replace with your actual API endpoint

// --- Inline SVG Loader ---
const InlineLoader = () => (
  <svg
    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

function ProfilePage() {
  // --- State Management ---
  const [profileData, setProfileData] = useState(defaultProfileData);
  const [passwordData, setPasswordData] = useState(defaultPasswordData);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: string } | null
  const FacilityMgr = useFacilityMgrStore.getState().facilityMgrInfo;
  const navigate = useNavigate();
  const setDashboard = useFacilityMgrStore((state) => state.setfacilityMgrInfo);
  // --- Update Handlers ---

  useEffect(() => {
    if (FacilityMgr) {
      const names = FacilityMgr.fullName ? FacilityMgr.fullName.split(" ") : [];

      setProfileData({
        payerId: FacilityMgr.payerId || "",
        firstName: names[0] || "",
        lastName: names.slice(1).join(" ") || "",
        email: FacilityMgr.email || "",
        phone: FacilityMgr.phoneNumber || "",
        profileImageUrl: FacilityMgr.profilePicture || "/images/emptyimage.png",
      });
    }
  }, [FacilityMgr]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    clearNotification();
  };

  const handlePasswordChange = (e) => {
    // const { name, value } = e.target;
    // setPasswordData(prevData => ({
    //     ...prevData,
    //     [name]: value,
    // }));
    navigate("/resetpassword");
    clearNotification();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData((prevData) => ({
          ...prevData,
          profileImageUrl: reader.result,
        }));
      };
      reader.readAsDataURL(file);
      console.log("Selected image:", file.name);
      // TODO: Add actual image upload logic here (e.g., prepare FormData for API)
      clearNotification();
    }
  };

  const handleDeleteImage = () => {
    setProfileData((prevData) => ({
      ...prevData,
      profileImageUrl: "/images/emptyimage.png",
    }));
    // TODO: Add API call to delete image on the server if needed
    console.log("Image deleted (client-side)");
    clearNotification();
  };

  const clearNotification = () => {
    setNotification(null);
  };

  // --- Form Submission ---

  const fetchResident = async () => {
    try {
      const { data } = await api.get("/facility-managers/profile");

      if (data.success) {
        setDashboard(data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  clearNotification();

  const dataToSend = {
    firstName: profileData.firstName,
    lastName: profileData.lastName,
    email: profileData.email,
    phoneNumber: profileData.phone,
  };

  try {
    const { data } = await api.put(
      '/facility-managers/account/profile',
      dataToSend
    );

    if (data.success) {
      setNotification({
        type: 'success',
        message: data.message || 'Profile updated successfully!',
      });

      fetchResident();
    } else {
      setNotification({
        type: 'error',
        message: data.message || 'Error updating profile',
      });
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to update profile. Please try again.';

    setNotification({ type: 'error', message: errorMessage });
  } finally {
    setIsLoading(false);
  }
};

  // --- Auto-dismiss notification ---
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        clearNotification();
      }, 5000);
      return () => clearTimeout(timer);
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
                    <h1 className="text-xl md:text-2xl font-semibold text-zinc-800">
                      Service Configuration
                    </h1>
                    <span className="text-zinc-400 font-light">
                      Manage your preferences for our smart Bin Services{" "}
                    </span>
                  </div>
                </div>

                <ServiceConfigNav />

                <div className="bg-white p-6 md:p-8 lg:p-10  mx-auto my-6 rounded-lg  font-sans">
                  {/* Header */}
                  <div className="border-b border-zinc-200 pb-4 mb-4">
                    <h1 className="text-2xl  text-zinc-800">Profile</h1>
                    <p className="text-sm text-zinc-400 ">Edit your profile</p>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="flex flex-col md:flex-row md:gap-10 p-8">
                      {/* Left Column - Image */}
                      <div className="flex flex-col items-center  mb-8 md:mb-0 md:w-1/4">
                        <div className="relative mb-3">
                          {profileData.profileImageUrl !== "" ? (
                            <img
                              src={profileData.profileImageUrl}
                              alt="Profile image"
                              className="w-28 h-28 rounded-full object-cover border border-zinc-300"
                            />
                          ) : (
                            <div className="flex justify-center items-center w-28 h-28 rounded-full object-cover border border-amber-400 bg-amber-100 text-zinc-700">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="size-14"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                          <label
                            htmlFor="profileImageInput"
                            className="absolute bottom-0 right-0 bg-zinc-700 text-white p-1.5 rounded-full cursor-pointer hover:bg-zinc-600 transition-colors text-xs flex items-center justify-center size-8"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="size-5"
                            >
                              <path d="M12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9Z" />
                              <path
                                fillRule="evenodd"
                                d="M9.344 3.071a49.52 49.52 0 0 1 5.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 0 1-3 3h-15a3 3 0 0 1-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 0 0 1.11-.71l.822-1.315a2.942 2.942 0 0 1 2.332-1.39ZM6.75 12.75a5.25 5.25 0 1 1 10.5 0 5.25 5.25 0 0 1-10.5 0Zm12-1.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </label>
                          <input
                            id="profileImageInput"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                        </div>

                        {profileData.profileImageUrl !== "" && (
                          <button
                            type="button"
                            onClick={handleDeleteImage}
                            className="text-sm text-red-600 hover:text-red-800 hover:underline"
                          >
                            Delete image
                          </button>
                        )}
                      </div>

                      {/* Right Column - Form Fields */}
                      <div className="flex-1 md:w-3/4">
                        {/* Payer ID */}
                        <div className="mb-5">
                          <label
                            htmlFor="payerId"
                            className="block text-sm font-medium text-zinc-700 mb-1"
                          >
                            Payer ID
                          </label>
                          <input
                            type="text"
                            id="payerId"
                            name="payerId"
                            value={profileData.payerId}
                            readOnly
                            className="w-full p-4 border border-zinc-300 rounded-md  bg-zinc-100 cursor-not-allowed focus:outline-none"
                          />
                        </div>

                        {/* First Name & Last Name */}
                        <div className="flex flex-col sm:flex-row sm:gap-4 mb-5">
                          <div className="flex-1 mb-5 sm:mb-0">
                            <label
                              htmlFor="firstName"
                              className="block text-sm font-medium text-zinc-700 mb-1"
                            >
                              First name
                            </label>
                            <input
                              type="text"
                              id="firstName"
                              name="firstName"
                              value={profileData.firstName}
                              onChange={handleProfileChange}
                              required
                              className="w-full p-4 border border-zinc-300 rounded-md  focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          <div className="flex-1">
                            <label
                              htmlFor="lastName"
                              className="block text-sm font-medium text-zinc-700 mb-1"
                            >
                              Last Name
                            </label>
                            <input
                              type="text"
                              id="lastName"
                              name="lastName"
                              value={profileData.lastName}
                              onChange={handleProfileChange}
                              required
                              className="w-full p-4 border border-zinc-300 rounded-md  focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                        </div>

                        {/* Email & Phone */}
                        <div className="flex flex-col sm:flex-row sm:gap-4 mb-8">
                          <div className="flex-1 mb-5 sm:mb-0">
                            <label
                              htmlFor="email"
                              className="block text-sm font-medium text-zinc-700 mb-1"
                            >
                              Email address
                            </label>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              readOnly
                              value={profileData.email}
                              required
                              className="w-full p-4 border border-zinc-300   bg-zinc-100 rounded-md cursor-not-allowed focus:outline-none"
                            />
                          </div>
                          <div className="flex-1">
                            <label
                              htmlFor="phone"
                              className="block text-sm font-medium text-zinc-700 mb-1"
                            >
                              Phone no
                            </label>
                            <input
                              type="tel"
                              id="phone"
                              name="phone"
                              value={profileData.phone}
                              onChange={handleProfileChange}
                              className="w-full p-4 border border-zinc-300 rounded-md  focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                        </div>

                        {/* Change Password Section */}
                        {!isChangingPassword && (
                          <div className="mb-5">
                            <button
                              type="button"
                              onClick={handlePasswordChange}
                              className="flex items-center text-sm font-medium text-green-700 hover:text-green-800 focus:outline-none"
                            >
                              {/* Replaced Lock Icon */}
                              <span
                                className="mr-2 text-base"
                                role="img"
                                aria-label="lock"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  className="size-4"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </span>{" "}
                              Change password
                            </button>
                          </div>
                        )}
                        {/* {isChangingPassword &&
                                                    (<div className="mb-5">
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsChangingPassword(!isChangingPassword)}
                                                            className="flex items-center text-sm font-medium text-green-700 hover:text-green-800 focus:outline-none"
                                                        > */}
                        {/* Replaced Lock Icon */}
                        {/* <span className="mr-2 text-base" role="img" aria-label="lock">


                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                                                                    <path d="M18 1.5c2.9 0 5.25 2.35 5.25 5.25v3.75a.75.75 0 0 1-1.5 0V6.75a3.75 3.75 0 1 0-7.5 0v3a3 3 0 0 1 3 3v6.75a3 3 0 0 1-3 3H3.75a3 3 0 0 1-3-3v-6.75a3 3 0 0 1 3-3h9v-3c0-2.9 2.35-5.25 5.25-5.25Z" />
                                                                </svg>

                                                            </span> Change password
                                                        </button>
                                                    </div>)
                                                } */}

                        {/* {isChangingPassword && (
                                                    <div className="  mb-6"> */}
                        {/* Current Password */}
                        {/* <div className="mb-5 relative">
                                                            <label htmlFor="currentPassword" className="block text-sm font-medium text-zinc-700 mb-1">Current Password</label>
                                                            <input
                                                                type={showCurrentPassword ? "text" : "password"}
                                                                id="currentPassword"
                                                                name="currentPassword"
                                                                placeholder="Password"
                                                                value={passwordData.currentPassword}
                                                                onChange={handlePasswordChange}
                                                                required={isChangingPassword}
                                                                className="w-full p-4 border border-zinc-300 rounded-md  focus:ring-indigo-500 focus:border-indigo-500 pr-16" // Increased padding for text button
                                                            />

                                                            {/* Replaced Eye Icons */}
                        {/* <svg

                                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}

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
                                                                    d={showCurrentPassword
                                                                        ? 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z'
                                                                        : 'M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a10.05 10.05 0 012.184-3.362M9.88 9.88A3 3 0 0014.12 14.12M6.1 6.1l11.8 11.8'}
                                                                />
                                                            // </svg> */}
                        {/* 
                                                        </div>

                                                        New Password
                                                        <div className="mb-5 relative">
                                                            <label htmlFor="newPassword" className="block text-sm font-medium text-zinc-700 mb-1">New Password</label>
                                                            <input
                                                                type={showCurrentPassword ? "text" : "password"}
                                                                id="newPassword"
                                                                name="newPassword"
                                                                placeholder="Confirm Password"
                                                                value={passwordData.newPassword}
                                                                onChange={handlePasswordChange}
                                                                required={isChangingPassword}
                                                                className="w-full p-4 border border-zinc-300 rounded-md  focus:ring-indigo-500 focus:border-indigo-500 pr-16" // Increased padding for text button
                                                            />

                                                            <svg
                                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}




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
                                                                    d={showCurrentPassword
                                                                        ? 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z'
                                                                        : 'M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a10.05 10.05 0 012.184-3.362M9.88 9.88A3 3 0 0014.12 14.12M6.1 6.1l11.8 11.8'}
                                                                />
                                                            </svg>
                                                        </div>

                                                        Reset Password Link
                                                        <p className="text-sm text-zinc-600">
                                                            Can't remember current password?{' '}
                                                            <a href="#reset-password" className="font-medium text-green-700 hover:text-green-800 hover:underline">
                                                                Reset password
                                                            </a>
                                                            {/* Add routing/modal logic for password reset */}
                        {/* </p>
                                                    </div> */}
                        {/* // )} */}

                        {/* Save Button */}
                        <div className="mt-8 flex justify-start">
                          <button
                            type="submit"
                            disabled={isLoading}
                            className={`inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md  text-white ${
                              isLoading
                                ? "bg-green-400 cursor-not-allowed"
                                : "bg-green-700 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            } transition-colors duration-150 ease-in-out`}
                          >
                            {isLoading ? (
                              <>
                                {/* Replaced Loader Icon */}
                                <InlineLoader />
                                Saving...
                              </>
                            ) : (
                              "Save Changes"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>

                  {/* Notification Pop-up */}
                  {notification && (
                    <div
                      className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg max-w-sm z-50 ${
                        notification.type === "success"
                          ? "bg-green-100 border border-green-400 text-green-800"
                          : "bg-red-100 border border-red-400 text-red-800"
                      }`}
                      role={notification.type === "error" ? "alert" : "status"}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          {notification.message}
                        </p>
                        <button
                          onClick={clearNotification}
                          className={`ml-4 text-xl font-semibold leading-none ${notification.type === "success" ? "text-green-800 hover:text-green-900" : "text-red-800 hover:text-red-900"} focus:outline-none`}
                          aria-label="Close notification"
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
