// stores/useFacilityMgrStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../api/axiosConfig"; // Uncomment if you need to fetch data from API

const useFacilityMgrStore = create(
  persist(
    (set) => ({
      facilityMgrInfo: {
        payerID: "",
        firstName: "",
        lastName: "",
        fullName: "",
        emailAddress: "",
        phoneNo: "",
        address: null,
        passport: "",
        profilePicture: "",
        accountNo: "",
        userType: "",
        buildingType: "",
        landMark: "",
        lga: "",
        nextPickupDate: "",
      },

      setFacilityMgrInfo: (info) => set({ facilityMgrInfo: info }),

      updateFacilityMgrInfo: (key, value) =>
        set((state) => ({
          facilityMgrInfo: {
            ...state.facilityMgrInfo,
            [key]: value,
          },
        })),

      clearFacilityMgrInfo: () =>
        set({
          facilityMgrInfo: {
            payerID: "",
            firstName: "",
            lastName: "",
            fullName: "",
            emailAddress: "",
            phoneNo: "",
            address: null,
            passport: "",
            profilePicture: "",
            accountNo: "",
            userType: "",
            buildingType: "",
            landMark: "",
            lga: "",
            nextPickupDate: "",
          },
        }),

      fetchFacilityManagerInfo: async () => {
        try {
          const response = await api.get("/facility-managers/profile");
          console.log("Raw profile response:", response.data);

          if (response.data.success && response.data.data) {
            const data = response.data.data;

            // Log the individual fields to inspect structure
            console.log("Parsed data:", data);

            const mappedInfo = {
              payerID: data.payerId || "",
              firstName: data.fullName?.split(" ")[0] || "",
              lastName: data.fullName?.split(" ")[1] || "",
              fullName: data.fullName || "",
              emailAddress: data.email || "",
              phoneNo: data.phoneNumber || "",
              address: data.address || null,
              passport: data.profilePicture?.trim() || "",
              profilePicture: data.profilePicture?.trim() || "",
              accountNo: data.accountNumber || "",
              userType: "facilitymgr",
              buildingType: data.buildingType || "",
              landMark: data.landmark || "",
              lga: data.localGovermentArea || "",
              nextPickupDate: data.nextPickupDate || "",
            };

            console.log("Mapped info:", mappedInfo);
            set({ facilityMgrInfo: mappedInfo });
          } else {
            console.warn("API returned success = false or no data.");
          }
        } catch (error) {
          console.error("Error fetching Facility Manager info:", error);
        }
      },


    }),
    {
      name: "facilitymgr-storage", // unique key in localStorage
    }
  )
);

export default useFacilityMgrStore;
