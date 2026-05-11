// stores/useAgentStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from "../api/axiosConfig";

const useAgentStore = create(
  persist(
    (set) => ({
      agentInfo: {
        payerID: '',
        firstName: '',
        lastName: '',
        emailAddress: '',
        phoneNo: '',
        address: null,
        passport: '',
        accountNo: '',
        userType: '',
        buildingType: '',
        landMark: '',
        lga: '',
        nextPickupDate: ''
      },

      setAgentInfo: (info) => set({ agentInfo: info }),

      updateAgentInfo: (key, value) =>
        set((state) => ({
          agentInfo: {
            ...state.agentInfo,
            [key]: value,
          },
        })),

      clearAgentInfo: () =>
        set({
          agentInfo: {
            payerID: '',
            firstName: '',
            lastName: '',
            emailAddress: '',
            phoneNo: '',
            address: null,
            passport: '',
            accountNo: '',
            userType: '',
            buildingType: '',
            landMark: '',
            lga: '',
            nextPickupDate: ''
          },
        }),
        fetchAgentInfo: async () => {
        try {
          const response = await api.get("/agents/profile");

          if (response.data.success) {
            const data = response.data.data;

            // Map ALL API response fields to match corporateInfo structure
            const mappedInfo = {
              payerID: data.payerId || "",
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              emailAddress: data.email || "",
              phoneNo: data.phoneNumber || "", // Now included in response
              address: data.address || null,
              passport: data.profilePicture?.trim() || "", // trim whitespace
              accountNo: data.accountNumber || "",
              userType: "Corporate",
              businessName : data.businessName || "", 
              lawmaCustomerType: data.lawmaCustomerType || "",
              buildingType: data.buildingType || "",
              landMark: data.landmark || "",
              lga: data.localGovermentArea || "", // Note: API has typo "localGovermentArea"
              nextPickupDate: data.nextPickupDate || "",
            };

            set({ corporateInfo: mappedInfo });
          }
        } catch (error) {
          console.error("Error fetching corporate info:", error);
        }
      },
    }),
    {
      name: 'agent-storage', // unique key in localStorage
    }
  )
);

export default useAgentStore;
