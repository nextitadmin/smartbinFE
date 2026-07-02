import Sidebar from "../components/Sidebar";
import Topbar from "../components/CorporateTopBar";
import BinDisposalLineChart from "../components/BinDisposalLineChart";
import { useEffect, useState } from "react";
import useAuthStore from "../store/authStore";
import api from "../api/axiosConfig";
import useCorporateStore from "../store/useCorporateStore";
import AlatPayButton from "../components/AlatPayButton";
import AddBranchModal from "../components/AddBranch"

const AlatIcon = () => (
  <span className="font-medium text-zinc-800 flex items-center gap-1">
    <img
      src="/images/alat-logo.png"
      alt="Alat Logo"
      className="w-10 h-10 mx-2 inline-block rounded-sm"
    />
  </span>
);

const WalletIcon = () => (
  <svg
    className="w-8 h-8 mx-2 inline-block rounded-sm"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18.039 13.5515C17.619 13.9615 17.379 14.5515 17.439 15.1815C17.529 16.2615 18.519 17.0515 19.599 17.0515H21.499V18.2415C21.499 20.3115 19.809 22.0015 17.739 22.0015H6.25902C4.18902 22.0015 2.49902 20.3115 2.49902 18.2415V11.5115C2.49902 9.44147 4.18902 7.75146 6.25902 7.75146H17.739C19.809 7.75146 21.499 9.44147 21.499 11.5115V12.9515H19.479C18.919 12.9515 18.409 13.1715 18.039 13.5515Z"
      stroke="black"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.49902 12.4132V7.84328C2.49902 6.65328 3.22902 5.59323 4.33902 5.17323L12.279 2.17323C13.519 1.70323 14.849 2.62326 14.849 3.95326V7.75325"
      stroke="black"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22.5588 13.9716V16.0317C22.5588 16.5817 22.1188 17.0316 21.5588 17.0516H19.5988C18.5188 17.0516 17.5288 16.2616 17.4388 15.1816C17.3788 14.5516 17.6188 13.9616 18.0388 13.5516C18.4088 13.1716 18.9188 12.9517 19.4788 12.9517H21.5588C22.1188 12.9717 22.5588 13.4216 22.5588 13.9716Z"
      stroke="black"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7 12H14"
      stroke="black"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CloseIcon = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M6 18L18 6M6 6l12 12"
    ></path>
  </svg>
);

const Dashboard = () => {
  // Modal State
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [isInsufficientBalance, setIsInsufficientBalance] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successModalType, setSuccessModalType] = useState('topup'); // 'topup' or 'subscription'
  const corporate = useCorporateStore.getState().corporateInfo;
  // Top Up Form State
  const [topUpAmount, setTopUpAmount] = useState("");
  const [chartDetails, setChartDetails] = useState([]);
  const [dashboardDetails, setDashboardDetails] = useState({});
  // Payment modal data
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");
  const paymentOptions = [
    { id: "card", text: "Pay with Alat By Wema", icon: AlatIcon },
  ];
  const [notification, setNotification] = useState(null);
  const [walletBalance, setWalletBalance] = useState("");
  const [showBalance, setShowBalance] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleFormSuccess = (message) => {
    setSuccessMessage(message);
    // Hide the success message after 5 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 5000);
  };

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

  const fetchCorporate = async () => {
    try {
      // Updated API endpoint
      const { data } = await api.get("/corporates/dashboard");
      console.log("API call succeeded", data); // <-- Add this line
      if (data.success) {
        setDashboardDetails({
          outstandingBill: `₦${(
            data.totalOutstandingBill ?? 0
          ).toLocaleString()}`,
          smartbinStatus: data.latestSmartbinStatus ?? "none",
          binApplications: data.smartbinApplicationsCount ?? 0,
          walletBalance: `₦${(data.walletBalance ?? 0).toLocaleString()}`,
          estimatedSubscriptionFee: `₦${(
            data.estimatedAnnualSubscription ?? 0
          ).toLocaleString()}`,
          nextPickupDate:
            typeof data.nextPickUpDate === "string"
              ? data.nextPickUpDate
              : "N/A",
        });
        // Chart data is not in the new response, so leaving chartDetails as empty array
        // setChartDetails(data.data.disposalChart);
      } else {
        setNotification({
          type: "error",
          message: data.message || "Failed to fetch dashboard data",
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setNotification({
        type: "error",
        message: "Error fetching dashboard data",
      });
    }
  };

  useEffect(() => {
    fetchCorporate();
  }, []);

  const fetchBalance = async () => {
    try {
      const { data } = await api.get("/corporate/wallets");

      const balance = data?.data?.balance ?? 0;

      setWalletBalance(formatCurrency(balance));
      // const { data } = await api.get("/Corporate/corporate-dashboard");
      // if (data.succeeded) {
      //     setWalletBalance(data.data.acctNSubs.walletBalance);
      // }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // const verifyAlatPayTransaction = async (reference) => {
  //   try {
  //     const { data } = await api.get(`/corporate/wallets/mock-verify?reference=${reference}`);
  //     console.log("Callback Verification Response:", data);
  //     // Optional: handle anything based on response
  //   } catch (error) {
  //     console.error("Verification failed:", error);
  //     setNotification({
  //       type: "error",
  //       message: "Payment verification failed.",
  //     });
  //   }
  // };

  const verifyAlatPayTransaction = async (reference) => {
    try {
      const { data } = await api.get(
        `/wallets/mock-verify?reference=${reference}`
      );
      console.log("Callback Verification Response:", data);

      if (data?.success || data?.succeeded) {
        setNotification({
          type: "success",
          message: "Payment verified successfully!",
        });
      } else {
        setNotification({
          type: "error",
          message: data?.message || "Verification failed.",
        });
      }

      return data; //  return it if needed
    } catch (error) {
      console.error("Verification failed:", error);
      setNotification({
        type: "error",
        message: "Payment verification failed.",
      });
      return null; //  indicate failure
    }
  };

  // Function to handle AlatPay payment for subscription (similar to Smart Bin pattern)
  const submitSubscriptionAlatPay = async (amount) => {
    const userId = useAuthStore.getState().user?.id;

    if (!amount || amount < 100) {
      setNotification({ type: "error", message: "Enter a valid amount" });
      return;
    }

    // Convert from kobo to naira for wallet charge endpoint
    const amountInNaira = amount / 100;

    try {
      console.log(" Submitting Subscription AlatPay payment with amount (kobo):", amount);
      console.log(" Amount in naira:", amountInNaira);
      
      // Call backend to initiate AlatPay payment for subscription
      const { data } = await api.post("/corporate/wallets/charge", {
        userId,
        amount: amountInNaira, // Send amount in naira
        channel: "ALATPay",
        narration: "Subscription Payment",
        paymentPurpose: "Subscription Application"
      });

      console.log(" Subscription AlatPay Response:", data);

      if (data.succeeded || data.success) {
        // Get reference from backend response
        const reference =
          data?.reference ||
          data?.data?.transactionReference ||
          data?.data?.reference;

        if (reference) {
          console.log(" Backend provided reference:", reference);
          console.log(" Calling verifyAlatPayTransaction with:", reference);
          const verifyResult = await verifyAlatPayTransaction(reference);
          
          if (verifyResult?.success || verifyResult?.succeeded) {
            console.log(" AlatPay verification successful, proceeding with subscription");
            // Proceed with subscription payment
            await handlePayment({ 
              reference: reference, 
              channel: "alatPay",
              data: { reference: reference }
            });
          } else {
            console.error(" AlatPay verification failed");
            setNotification({ type: "error", message: "AlatPay verification failed" });
          }
        } else {
          console.warn(" No reference returned from backend response");
          setNotification({ type: "error", message: "No payment reference received" });
        }
      } else {
        setNotification({
          type: "error",
          message: data.message || "Error during AlatPay payment!",
        });
      }
    } catch (error) {
      console.error(" Error in submitSubscriptionAlatPay:", error);
      setNotification({ type: "error", message: "AlatPay payment failed!" });
    }
  };

  const handlePaymentWithWallet = async () => {
    const selectedPlan = subscriptionPlans.find(
      (item) => item.id === selectedSubscriptionPlan
    );
    
    // Debug logging
    console.log("=== WALLET PAYMENT DEBUG ===");
    console.log("Selected Plan:", selectedPlan);
    console.log("Selected Subscription Plan ID:", selectedSubscriptionPlan);
    console.log("Corporate:", corporate);
    console.log("Corporate.accountNo:", corporate?.accountNo);
    console.log("User Token:", useAuthStore.getState().token);
    
    if (!selectedPlan) {
      setNotification({ type: 'error', message: 'Please select a valid subscription plan.' });
      return;
    }

    // Use original price in kobo for API call
    const amount = selectedPlan.originalPrice;

    if (!amount || amount <= 0) {
      setNotification({ type: 'error', message: 'Invalid subscription amount.' });
      return;
    }

    // Convert from kobo to naira for wallet charge endpoint
    const amountInNaira = amount / 100;

    // Get current wallet balance for comparison
    try {
      const balanceResponse = await api.get("/corporate/wallets");
      const walletBalance = balanceResponse?.data?.data?.balance ?? 0;
      
      console.log("Amount to charge (in kobo):", amount);
      console.log("Amount to charge (in naira):", amountInNaira);
      console.log("Wallet balance (from API):", walletBalance);
      console.log("Is balance sufficient?", walletBalance >= amountInNaira);
      
      if (walletBalance < amountInNaira) {
        console.log("Insufficient balance detected - showing error modal");
        setIsInsufficientBalance(true);
        openModal("error");
        return;
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }

    console.log("Amount to charge (in naira):", amountInNaira);

    try {
      const requestData = {
        userId: useAuthStore.getState().token,
        drAccountNo: corporate.accountNo,
        amount: amountInNaira, // Send amount in naira
        narration: "Subscription Payment",
        paymentPurpose: "Subscription Application",
      };
      
      console.log("Request data to /corporate/wallets/charge:", requestData);
      
      const response = await api.post("/corporate/wallets/charge", requestData);
      const data = response.data;
      console.log("Response from debit-wallet:", data);
      
      if (data.succeeded || data.success) {
        console.log("Wallet payment successful:", data.success, "and message:", data.message);
        
        // Extract reference from response message or use a default
        let successRef = data.reference || data.data?.reference;
        console.log("Initial reference extraction:", successRef);
        
        // If no reference in response, try to extract from message
        if (!successRef && data.message) {
          let successMessage = data.message.split('|');
          console.log("Message split result:", successMessage);
          if (successMessage.length > 1) {
            successRef = successMessage[1];
            console.log("Reference extracted from message:", successRef);
          }
        }
        
        // If still no reference, create a timestamp-based one
        if (!successRef) {
          successRef = `WALLET_${Date.now()}`;
          console.log("Generated fallback reference:", successRef);
        }
        
        console.log("Final reference to send to handlePayment:", successRef);
        
        // Call handlePayment with wallet response
        await handlePayment({
          reference: successRef,
          channel: "wallet",
        }).finally(() => {
          console.log("Payment with wallet completed");
        });
        
        // Show success modal instead of notification
        setSuccessModalType('subscription');
        openModal("success");
        // Refresh wallet balance after successful payment
        fetchBalance();
      } else {
        console.error("Wallet payment failed:", data.message);
        
        // Check if the error is due to insufficient funds
        const errorMessage = data.message?.toLowerCase() || '';
        if (errorMessage.includes('insufficient') || errorMessage.includes('balance') || errorMessage.includes('fund')) {
          console.log("Insufficient funds detected, showing error modal");
          setIsInsufficientBalance(true);
          openModal("error");
        } else {
          setNotification({
            type: "error",
            message: data.message || "Error processing wallet payment",
          });
        }
      }
    } catch (error) {
      console.error("Error processing wallet payment:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Check if the error is due to insufficient funds
      const errorMessage = error.response?.data?.message?.toLowerCase() || error.message?.toLowerCase() || '';
      if (errorMessage.includes('insufficient') || errorMessage.includes('balance') || errorMessage.includes('fund')) {
        console.log("Insufficient funds detected in error response, showing error modal");
        setIsInsufficientBalance(true);
        openModal("error");
      } else {
        setNotification({
          type: "error",
          message: "Error processing wallet payment",
        });
      }
    }
  };

  // Action handlers
  const handlePayment = async (response) => {
    console.log("=== HANDLE PAYMENT DEBUG ===");
    console.log("Response received:", response);
    
    let ref, channel;
    
    if (response.channel === 'wallet') {
      ref = response.reference;
      channel = "wallet";
    } else if (response.channel === 'alatPay') {
      ref = response.reference;
      channel = "alatPay";
    } else if (selectedPaymentMethod === "card") {
      ref = response.data.reference;
      channel = "card";
    }
    
    // console.log("Extracted ref:", ref);
    // console.log("Extracted channel:", channel);
    // console.log("Selected payment method:", selectedPaymentMethod);
    
    if (!selectedPaymentMethod) {
      setNotification({ type: "error", message: "Select a payment method" });
      return;
    }
    
    const selectedPlan = subscriptionPlans.find(
      (item) => item.id === selectedSubscriptionPlan
    );
    
    console.log("Selected plan for subscription:", selectedPlan);
    
    if (!selectedPlan) {
      setNotification({ type: "error", message: "Please select a subscription plan" });
      return;
    }
    
    if (!ref) {
      setNotification({ type: "error", message: "Payment reference is missing" });
      return;
    }
    
    const finalPaymentMethod = channel || selectedPaymentMethod;
    const dataToSend = {
      plan: selectedPlan.id,
      transactionReference: ref,
    };
    
    // console.log("Sending subscription update with data:", dataToSend);
    // console.log("Plan ID being sent:", selectedPlan.id);
    // console.log("Transaction reference being sent:", ref);
    // console.log("Is plan ID a valid MongoDB ObjectId format?", /^[0-9a-fA-F]{24}$/.test(selectedPlan.id));
    // console.log("Payment method used:", finalPaymentMethod);
    // console.log("Selected plan details:", selectedPlan);
    
    try {
      const { data } = await api.post("/subscription/subscribe", dataToSend);
      console.log("Subscription update response:", data);
      
      if (data.succeeded || data.success) {
        setNotification({
          type: "success",
          message: data.message || "Subscription updated successfully!",
        });
        setIsSubscriptionModalOpen(false);
        closeModal("payment");
        // Show success modal for subscription payment
        setSuccessModalType('subscription');
        openModal("success");
      } else {
        setNotification({
          type: "error",
          message: data.message || "Subscription update failed!",
        });
        handleSubscriptionBack();
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      setNotification({
        type: "error",
        message: "Error processing subscription update!",
      });
      handleSubscriptionBack();
    }
  };

  const handleSubscription = () => {
    if (!selectedSubscriptionPlan) {
      setNotification({ type: "error", message: "Select a subscription plan" });
      return;
    }
    setIsPaymentModalOpen(true); // Open payment modal
    setIsSubscriptionModalOpen(false); // Close subscription modal
    // Here you can handle the subscription logic, e.g., API call
    // For now, just log the selected plan
    console.log("Processing Subscription for:", selectedSubscriptionPlan);
    closeModal("subscription");
  };

  // Subscription modal data
  const [selectedSubscriptionPlan, setSelectedSubscriptionPlan] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [branches, setBranches] = useState([]);
 
  const fetchSubscriptions = async () => {
      try {
          const { data } = await api.get('/subscription/plans');
          console.log("Raw subscription plans from backend:", data);
          if (data.success) {
              const newPlans = data.data.map((item) => {
                  console.log("Processing subscription plan item:", item);
                  // Convert from kobo to naira (divide by 100)
                  const priceInNaira = item.price / 100;
                  const pricePerMonthInNaira = (priceInNaira / (item.interval == "year" ? 12 : item.duration));
                  
                  const mappedPlan = {
                      id: item._id,
                      duration: `${item.name}`,
                      price: `₦${priceInNaira.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                      pricePerMonth: `₦${pricePerMonthInNaira.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} per month`,
                      // Store original price in kobo for payment processing
                      originalPrice: item.price
                  };
                  console.log("Mapped subscription plan:", mappedPlan);
                  return mappedPlan;
              });
              console.log("Final subscription plans array:", newPlans);
              setSubscriptionPlans(newPlans);
          }
      } catch (error) {
          console.error("Error fetching subscription plans:", error);
          setNotification({ type: 'error', message: 'Error fetching subscription!' });
      }
  };

  const fetchBranches = async () => {
      try {
          const { data } = await api.get('/corporate/fetch-branches');
          if (data.success) {
              const newBranches = data.data.data.map((item) => ({
                  id: item._id,
                  name : `${item.branchName} branch`,
                  address : item.branchAddress,
              }));
              setBranches(newBranches);
          }
      } catch (error) {
          console.error("Error fetching branches:", error);
          setNotification({ type: 'error', message: 'Error fetching branches!' });
      }
  };
  useEffect(() => {
      fetchSubscriptions();
      fetchBranches();
  }, []);

  const handleSubscriptionBack = () => {
    setIsPaymentModalOpen(false); // Open payment modal
    setIsSubscriptionModalOpen(true);
  };
  const handleBranchBack = () => {
    setIsSubscriptionModalOpen(false);
    setIsBranchModalOpen(true);
  };

  const handleBranchSelection = () => {
    setIsSubscriptionModalOpen(true);
     setIsBranchModalOpen(false);
  }

  const closeBranch = () => {
    setIsBranchModalOpen(false);
    setSelectedBranch('');
  }

  // Methods
  const openModal = (modalName) => {
    closeAllModals(); // Close others before opening a new one
    if (modalName === "success") setShowSuccessModal(true);
    if (modalName === "topup") setShowTopUpModal(true);
    if (modalName === "error") setShowErrorModal(true);
    // Prevent background scroll when modal is open
    document.body.style.overflow = "hidden";
  };

  const closeModal = (modalName) => {
    if (modalName === "success") {
      setShowSuccessModal(false);
      setTopUpAmount("");
      setSuccessModalType('topup'); // Reset to default
      fetchCorporate();
    }
    if (modalName === "topup") setShowTopUpModal(false);
    if (modalName === "error") {
      setShowErrorModal(false);
      setIsInsufficientBalance(false); // Reset insufficient balance state
    }
    // Restore background scroll only if no modals are open
    if (!showSuccessModal && !showTopUpModal && !showErrorModal) {
      document.body.style.overflow = "";
    }
    if (modalName === "payment") setIsPaymentModalOpen(false);
    else if (modalName === "subscription") setIsSubscriptionModalOpen(false);
  };

  const handleTopUpClose = () => {
    closeModal("topup");
    setTopUpAmount("");
  };

  const closeAllModals = () => {
    setShowSuccessModal(false);
    setShowTopUpModal(false);
    setShowErrorModal(false);
    document.body.style.overflow = ""; // Ensure scroll is restored
  };

  // PAYEMENT SUBMIT AFTER TOPUP
  const submitTopUpAfterPayment = async () => {
    const userId = useAuthStore.getState().user?.id;

    if (!topUpAmount || topUpAmount < 100 || topUpAmount > 1000000) {
      setNotification({ type: "error", message: "Enter a valid amount" });
      return;
    }

    try {
      const { data } = await api.post("/corporate/wallets/topup", {
        userId,
        walletAcctNo: "",
        amount: topUpAmount,
        channel: "ALATPay",
        narration: "",
      });

      console.log("TopUp Response:", data);

      if (data.succeeded || data.success) {
        // Get reference from response
        const reference =
          data?.reference ||
          data?.data?.transactionReference ||
          data?.data?.reference;

        if (reference) {
          console.log("Calling verifyAlatPayTransaction with:", reference);
          await verifyAlatPayTransaction(reference);
        } else {
          console.warn("No reference returned from top-up response");
        }

        setNotification({
          type: "success",
          message: data.message || "Top-up successful!",
        });

        fetchBalance(); // Refresh balance
        closeModal("topup"); // Close top-up modal
        openModal("success"); // Show success modal
      } else {
        setNotification({
          type: "error",
          message: data.message || "Error during TopUp!",
        });
      }
    } catch (error) {
      console.error(error);
      setNotification({ type: "error", message: "TopUp failed!" });
    }
  };

  const handleTopUpSubmit = async (e) => {
    e.preventDefault();
    await submitTopUpAfterPayment(); // Reuse core logic
  };

  const downloadReceipt = () => {
    console.log("Download Receipt clicked");
    setNotification({ type: "error", message: "Coming soon..." });
    closeModal("success");
  };

  const backToDashboard = () => {
    console.log("Back To Dashboard clicked");
    closeModal("error");
  };

  const closeSubscription = () => {
    closeModal("payment");
    closeModal("subscription");
    setSelectedSubscriptionPlan("");
  };

  const handleTopUpChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setTopUpAmount(value === "" ? "" : Number(value));
    }
  };

  return (
    <div>
      <div className="flex sans max-w-screen h-screen">
        <Sidebar addkey="1" />
        <div className=" bg-zinc-100 min-h-screen flex flex-col flex-1 overflow-y-auto  ">
          <Topbar />
          <main className="p-8 space-y-6">
            <div className="flex items-center justify-between mb-6">

              <span>{`Hello, ${corporate.firstName}`}</span>
              <button
                onClick={handleOpenModal}
                className="px-2 py-3  text-green-700 font-bold rounded-lg border border-transparent hover:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200"
              >
                <span className="inline-flex space-x-2 items-center flex-row">   <span>Add New Branch </span><img src="./images/plus-square.svg" alt="" /></span>
              </button>

              <AddBranchModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSuccess={handleFormSuccess}
              />


            </div>
            <div className="flex flex-wrap -mx-3">
              {/* Outstanding Bill Card */}
              <div className="w-full sm:w-1/2 lg:w-1/3 px-3 mb-6">
                <div className="flex bg-white p-6 rounded-2xl  min-h-[230px]  w-full">
                  <div className=" items-start justify-between w-full">
                    <div className="mb-12">
                      <div className="bg-green-700 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                        {/* SVG */}
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M5.60817 16.4165C6.2915 15.6832 7.33317 15.7415 7.93317 16.5415L8.77484 17.6665C9.44984 18.5582 10.5415 18.5582 11.2165 17.6665L12.0582 16.5415C12.6582 15.7415 13.6998 15.6832 14.3832 16.4165C15.8665 17.9998 17.0748 17.4748 17.0748 15.2582V5.8665C17.0832 2.50817 16.2998 1.6665 13.1498 1.6665H6.84984C3.69984 1.6665 2.9165 2.50817 2.9165 5.8665V15.2498C2.9165 17.4748 4.13317 17.9915 5.60817 16.4165Z"
                            fill="white"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M6.74656 9.16667H6.75405H6.74656Z"
                            fill="white"
                          />
                          <path
                            d="M6.74656 9.16667H6.75405"
                            stroke="#007836"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M9.08203 9.1665H13.6654"
                            stroke="#007836"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M6.74656 5.83317H6.75405H6.74656Z"
                            fill="white"
                          />
                          <path
                            d="M6.74656 5.83317H6.75405"
                            stroke="#007836"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M9.08203 5.8335H13.6654"
                            stroke="#007836"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex flex-row justify-between items-center w-full mb-4">
                      <div>
                        <p className="text-zinc-700 font-light">
                          Total Outstanding Bill
                        </p>
                        <h2 className="text-green-700 text-3xl mt-1">
                          {dashboardDetails.outstandingBill}
                        </h2>
                      </div>
                      <a href="#" className="text-zinc-800 underline text-sm">
                        See all
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              {/* Smart Bin Applications Card */}
              <div className="w-full sm:w-1/2 lg:w-1/3 px-3 mb-6">
                <div className="flex bg-white p-6 rounded-2xl  min-h-[230px]  w-full">
                  <div>
                    <div className="mb-12">
                      <div className="bg-green-700 text-white p-3 rounded-full w-12 h-12 flex items-center justify-center">
                        {/* SVG */}
                        <svg
                          fill="none"
                          height="24"
                          viewBox="0 0 24 24"
                          width="24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g fill="#fff">
                            <path d="m16 22.75h-8c-3.65 0-5.75-2.1-5.75-5.75v-10c0-3.65 2.1-5.75 5.75-5.75h8c3.65 0 5.75 2.1 5.75 5.75v10c0 3.65-2.1 5.75-5.75 5.75zm-8-20c-2.86 0-4.25 1.39-4.25 4.25v10c0 2.86 1.39 4.25 4.25 4.25h8c2.86 0 4.25-1.39 4.25-4.25v-10c0-2.86-1.39-4.25-4.25-4.25z" />
                            <path d="m18.5 9.25h-2c-1.52 0-2.75-1.23-2.75-2.75v-2c0-.41.34-.75.75-.75s.75.34.75.75v2c0 .69.56 1.25 1.25 1.25h2c.41 0 .75.34.75.75s-.34.75-.75.75z" />
                            <path d="m12 13.75h-4c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h4c.41 0 .75.34.75.75s-.34.75-.75.75z" />
                            <path d="m16 17.75h-8c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h8c.41 0 .75.34.75.75s-.34.75-.75.75z" />
                          </g>
                        </svg>
                      </div>
                    </div>
                    <p className="text-zinc-700 font-light">
                      Smart Bin Applications
                    </p>
                    <h2 className="text-green-700 text-3xl  mt-1 mb-4">
                      {dashboardDetails.binApplications}
                    </h2>
                  </div>
                </div>
              </div>
              {/* Available Balance Card */}
              <div className="w-full sm:w-1/2 lg:w-1/3 px-3 mb-6">
                <div className="flex bg-card  bg-cover rounded-2xl min-h-[230px] w-full">
                  <div className="flex p-6 rounded-2xl min-h-[230px] w-full bg-[linear-gradient(288.72deg,rgba(0,120,54,0.75)_0%,#007836_98.68%)]">
                    <div className="w-full">
                      <p className="text-white text-xs font-light ">
                        Available Balance
                      </p>
                      <div className="flex items-center ">
                        <h2 className="text-white text-3xl font-sans mt-1 mr-20">

                          {showBalance ? `${walletBalance || "₦ 0.00"}` : "₦ ****"}
         
         </h2>
                        <button
                          onClick={() => setShowBalance(!showBalance)}
                          className="ml-2 focus:outline-none"
                        >
                          {showBalance ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="text-white"
                              width="24"
                              height="24"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z"
                                strokeWidth="2"
                              />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="text-white"
                              width="24"
                              height="24"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                d="M17.94 17.94A10.948 10.948 0 0112 19c-5 0-9.27-3-11-7 1.06-2.45 2.92-4.49 5.23-5.82M1 1l22 22"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                      <div className="mt-14  mb-2">
                        <button
                          className="bg-white text-green-700 py-4 px-4 rounded-xl flex items-center "
                          onClick={() => openModal("topup")}
                        >
                          Top up wallet
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 ml-2"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Next Waste Pickup Date Card */}
              <div className="w-full sm:w-1/2 lg:w-1/3 px-3 mb-6">
                <div className="flex bg-white p-6 rounded-2xl  min-h-[230px]  w-full">
                  <div>
                    <div className="mb-12">
                      <div className="bg-green-700 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                        {/* SVG */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-white"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            x="3"
                            y="4"
                            width="18"
                            height="18"
                            rx="2"
                            ry="2"
                          />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-zinc-700 font-light">
                      Next Waste Pickup Date
                    </p>
                    <h2 className="text-zinc-600 text-2xl mt-1">
                      {/* Simplified display for N/A or date */}
                      {dashboardDetails.nextPickupDate === "N/A"
                        ? "N/A"
                        : "Check Schedule"}
                    </h2>
                  </div>
                </div>
              </div>
              {/* Smart Bin Status Card */}
              <div className="w-full sm:w-1/2 lg:w-1/3 px-3 mb-6">
                <div className=" bg-white p-6 rounded-2xl  min-h-[230px]  w-full">
                  <div>
                    <div className="flex  items-center justify-between mb-8 w-full">
                      <h3 className="text-xl text-zinc-800">
                        Smart Bin Status
                      </h3>
                      <button className="text-sky-700 bg-sky-100 px-2 py-1 rounded-lg text-sm">
                        Inventory
                      </button>
                    </div>
                    <div className="mb-5">
                      <p className="text-zinc-400 font-light mb-2">
                        Your smart Bin has been allocated in inventory
                      </p>
                      <p className="text-zinc-900 text-sm mb-4">
                        23rd July 2023 4:19PM
                      </p>
                    </div>
                    <a
                      href="#"
                      className="text-green-700 py-2 font-medium underline"
                    >
                      Track Application
                    </a>
                  </div>
                </div>
              </div>
              {/* Subscription Fee Card */}
              <div className="w-full sm:w-1/2 lg:w-1/3 px-3 mb-6">
                <div className="flex bg-white p-6 rounded-2xl  min-h-[230px]  w-full">
                  <div className="w-full">
                    <p className="text-zinc-600 font-light mb-2">
                      Estimated annual Subscription fee
                    </p>
                    <h2 className="text-zinc-600 text-3xl mb-10">
                      {dashboardDetails.estimatedSubscriptionFee}
                    </h2>
                    <button
                      className="bg-green-700 text-white p-4 rounded-xl w-2/3"
                      onClick={() => setIsBranchModalOpen(true)}
                    >
                      Edit Subscription
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <section className="bg-white p-6 rounded-3xl flex flex-col items-center justify-center">
              {/* Chart data not available in new API response */}
              <BinDisposalLineChart data={chartDetails} />
            </section>
          </main>
        </div>
      </div>

      {isBranchModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content px-8 py-12">
            <div className="flex justify-between items-center pb-6">
              <div>
                <h3 className="text-2xl font-semibold text-zinc-800">
                  Select branch
                </h3>
                <p className="text-zinc-500 mt-1">
                  Select branch to subscribe for scheduled waste collection
                </p>
              </div>
              <button
                onClick={closeBranch}
                aria-label="Close"
                className="text-zinc-700 hover:text-red-600 self-start"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="space-y-3">
              {branches.map((branch) => (
                <label
                  key={branch.id}
                  className={`bg-[#f7f6ff] p-4 rounded-xl flex items-center gap-4 ${
                    selectedBranch === branch.id ? "border-2 border-green-700" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="subscriptionPlan"
                    id={`branch_${branch.id}`}
                    value={branch.id}
                    checked={selectedBranch === branch.id}
                    onChange={() => setSelectedBranch(branch.id)}
                    className="custom-radio"
                  />
                  {/* Fix: Use flex-col for column layout */}
                  <div className="flex-grow flex flex-col items-start gap-2">
                    <span className="font-bold text-xl text-zinc-900">
                      {branch.name}
                    </span>
                    <span className="font-light text-zinc-900">
                      {branch.address}
                    </span>
                  </div>
                </label>
              ))}
            </div>
            <div className="my-6 flex justify-end">
              <button
                onClick={handleBranchSelection}
                className="btn btn-primary w-full"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Subscription Modal */}
      {isSubscriptionModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content px-8 py-12">
            <div className="flex justify-between items-center pb-6">
              <div>
                <h3 className="text-2xl font-semibold text-zinc-800">
                  Subscribe now
                </h3>
                <p className="text-zinc-500 mt-1">
                  Subscribe for scheduled waste collection
                </p>
              </div>
              <button
                onClick={closeSubscription}
                aria-label="Close"
                className="text-zinc-700 hover:text-red-600 self-start"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="space-y-3">
              {subscriptionPlans.map((plan) => (
                <label
                  key={plan.id}
                  className={`bg-[#f7f6ff] p-4 rounded-xl flex items-center gap-4 ${selectedSubscriptionPlan === plan.id
                    ? "border-2 border-green-700"
                    : ""
                    }`}
                >
                  <input
                    type="radio"
                    name="subscriptionPlan"
                    id={`plan_${plan.id}`}
                    value={plan.id}
                    checked={selectedSubscriptionPlan === plan.id}
                    onChange={() => setSelectedSubscriptionPlan(plan.id)}
                    className="custom-radio"
                  />
                  <div className="flex-grow flex justify-between items-center">
                    <span className="font-light text-zinc-900">
                      {plan.duration}
                    </span>
                    <div className="text-right">
                      <span className="text-xl text-zinc-900">
                        {plan.price}
                      </span>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {plan.pricePerMonth}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <div className="my-6 flex flex-col justify-end">
              <button
                onClick={() => handleSubscription()}
                className="btn btn-primary w-full"
              >
                Make Payment
              </button>
              <button
                onClick={handleBranchBack}
                className="w-full text-center font-medium text-green-700 hover:text-green-900 py-2"
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content lg:p-8">
            <div className="flex justify-between items-center py-6 mx-8 border-b border-zinc-200">
              <h3 className="text-lg font-semibold text-zinc-800">
                Select Payment Method
              </h3>
              <button
                onClick={closeSubscription}
                aria-label="Close"
                className="text-zinc-700 hover:text-red-600"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="py-6 space-y-4">
              <label className="px-6 py-4 rounded-lg flex items-center gap-4">
                <WalletIcon />
                <span className="text-sm font-medium text-zinc-800 flex-grow">
                  {`Pay from wallet (${subscriptionPlans
                    .find((item) => item.id === selectedSubscriptionPlan)
                    ?.price || "₦0.00"})`}
                </span>
                <input
                  type="radio"
                  name="paymentMethod"
                  id="wallet"
                  value="wallet"
                  checked={selectedPaymentMethod === "wallet"}
                  onChange={() => setSelectedPaymentMethod("wallet")}
                  className="custom-radio"
                />
              </label>
              {paymentOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <label
                    key={option.id}
                    className="px-6 py-4 rounded-lg flex items-center gap-4"
                  >
                    <Icon />
                    <span className="text-sm font-medium text-zinc-800 flex-grow">
                      {option.text}
                    </span>
                    <input
                      type="radio"
                      name="paymentMethod"
                      id={`payment_${option.id}`}
                      value={option.id}
                      checked={selectedPaymentMethod === option.id}
                      onChange={() => setSelectedPaymentMethod(option.id)}
                      className="custom-radio"
                    />
                  </label>
                );
              })}
            </div>
            <div className="px-6 py-4 flex flex-col items-center gap-3">
              {selectedPaymentMethod === "card" ? (
                <AlatPayButton
                  metadata={{
                    accountNo:
                      useCorporateStore.getState().corporateInfo.accountNo,
                  }}
                  customerName={
                    useCorporateStore.getState().corporateInfo.companyName ||
                    "Corporate User"
                  }
                  email={
                    useAuthStore.getState().email || "manifestomixx@gmail.com"
                  }
                  redirectUrl="https://smartbin-frontend-staging.up.railway.app/payment-success"
                  amount={
                    subscriptionPlans.find((item) => item.id === selectedSubscriptionPlan)?.originalPrice || 0
                  }
                  onTransaction={(response) => {
                    console.log(" AlatPay onTransaction called with response:", response);
                    // Call the new function that handles backend integration
                    const amount = subscriptionPlans.find((item) => item.id === selectedSubscriptionPlan)?.originalPrice || 0;
                    submitSubscriptionAlatPay(amount);
                  }}
                  onClose={() => {
                    console.log(" AlatPay window closed");
                  }}
                  onPaymentWindowOpen={() => {
                    console.log(" AlatPay payment window opened");
                  }}
                  buttonText="Pay Now with ALATPay"
                  buttonClassName="btn btn-primary w-full"
                />
              ) : (
                <button
                  onClick={handlePaymentWithWallet}
                  className="btn btn-primary w-full"
                >
                  Make Payment
                </button>
              )}
              <button
                onClick={handleSubscriptionBack}
                className="w-full text-center font-medium text-green-700 hover:text-green-900 py-2"
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Success Modal */}
      {showSuccessModal && (
        <div
          onClick={() => closeModal("success")}
          className="fixed inset-0 bg-black/10 bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity duration-300"
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl relative p-6 py-12 md:p-8">
            <button
              onClick={() => closeModal("success")}
              className="absolute top-8 right-8 text-zinc-700 hover:text-red-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
            <div className="flex flex-col items-center text-center mt-6">
              <div className="bg-green-100 p-3 rounded-full mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="41"
                  height="40"
                  viewBox="0 0 41 40"
                  fill="none"
                >
                  <path
                    d="M20.5002 3.3335C11.3168 3.3335 3.8335 10.8168 3.8335 20.0002C3.8335 29.1835 11.3168 36.6668 20.5002 36.6668C29.6835 36.6668 37.1668 29.1835 37.1668 20.0002C37.1668 10.8168 29.6835 3.3335 20.5002 3.3335ZM28.4668 16.1668L19.0168 25.6168C18.7835 25.8502 18.4668 25.9835 18.1335 25.9835C17.8002 25.9835 17.4835 25.8502 17.2502 25.6168L12.5335 20.9002C12.0502 20.4168 12.0502 19.6168 12.5335 19.1335C13.0168 18.6502 13.8168 18.6502 14.3002 19.1335L18.1335 22.9668L26.7002 14.4002C27.1835 13.9168 27.9835 13.9168 28.4668 14.4002C28.9502 14.8835 28.9502 15.6668 28.4668 16.1668Z"
                    fill="#23A26D"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-zinc-800 mb-2">
                Payment Successful!
              </h2>
              <p className="text-zinc-500 mb-6">
                {successModalType === 'subscription' 
                  ? "Your subscription payment has been processed successfully"
                  : "Your wallet has been successfully funded"
                }
              </p>
              <div className="w-full space-y-3 bg-[#F7F9FA] rounded-xl p-4 mb-8 text-left">
                <div className="flex justify-between items-center py-2">
                  <span className="text-zinc-500">Amount</span>
                  <span className="font-medium text-zinc-800">
                    {successModalType === 'subscription' 
                      ? subscriptionPlans.find((item) => item.id === selectedSubscriptionPlan)?.price || "₦0.00"
                      : `₦${topUpAmount}`
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-zinc-500">Payment Status</span>
                  <span className="bg-green-100 text-green-700 px-2 py-1.5 rounded-full text-xs font-medium">
                    Success
                  </span>
                </div>
                <div className="my-12">
                  <div className="my-6 w-full h-[1px] bg-zinc-300"></div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-zinc-500">Ref Number</span>
                  <span className="font-medium text-zinc-800">
                    000085752257
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-zinc-500">Payment Method</span>
                  <span className="font-medium text-zinc-800 flex items-center gap-1">
                    {successModalType === 'subscription' ? (
                      <>
                        <WalletIcon />
                        Wallet Payment
                      </>
                    ) : (
                      <>
                        <img
                          src="/images/alat-logo.png"
                          alt="Alat Logo"
                          className="w-10 h-10 mx-2 inline-block rounded-sm"
                        />
                        Alat By Wema
                      </>
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-zinc-500">Payment Time</span>
                  <span className="font-medium text-zinc-800">
                    {`${new Date().toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })}. ${new Date().toLocaleTimeString("en-US", {
                      hour12: false,
                    })}`}
                  </span>
                </div>
              </div>
              <button
                onClick={downloadReceipt}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 mb-8 border border-green-700 font-medium rounded-md text-green-700 bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  ></path>
                </svg>
                Download Receipt
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Top Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 bg-black/10 bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity duration-300">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl relative p-6 md:p-10">
            <button
              onClick={handleTopUpClose}
              className="absolute top-10 right-8 text-zinc-700 hover:text-red-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
            <div className="space-y-5">
              <div className="pb-8">
                <h2 className="text-2xl font-semibold text-zinc-800">
                  Top up wallet
                </h2>
                <p className="text-zinc-500">Add funds to your wallet</p>
              </div>
              <form onSubmit={handleTopUpSubmit}>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="topup-amount"
                      className="block font-medium text-zinc-700 mb-1"
                    >
                      Amount to Top up
                    </label>
                    <div className="relative mt-1 rounded-md shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-zinc-500 sm:">₦</span>
                      </div>
                      <input
                        type="number"
                        id="topup-amount"
                        value={topUpAmount}
                        onChange={handleTopUpChange}
                        required
                        min="100"
                        max="1000000"
                        step="1"
                        placeholder="20000"
                        className="w-full pl-7 pr-4 py-2 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-green-700 mt-1">
                      <span>Min: ₦100</span>
                      <span>Max: ₦1,000,000</span>
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium text-zinc-700 mb-1">
                      Choose Payment method
                    </label>
                    <div className="mt-1 mb-4 flex items-center gap-2 p-3 border border-zinc-300 rounded-xl bg-zinc-50">
                      <img
                        src="/images/alat-logo.png"
                        alt="Alat Logo"
                        className="w-8 h-8 rounded-sm"
                      />{" "}
                      <span className="font-medium text-zinc-800">
                        Alat By Wema
                      </span>
                    </div>
                  </div>
                  {/* <AlatPayButton
                                            //all details provided by the api request in the component
                                            amount={parseInt(topUpAmount)}
                                            onTransaction={() => { handleTopUpSubmit() }}
                                            buttonText="Confirm Top Up"
                                            buttonClassName="w-full inline-flex justify-center items-center px-4 py-4 border border-transparent font-medium rounded-xl shadow-sm text-white bg-green-700 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                        /> */}

                  <AlatPayButton
                    amount={Number(topUpAmount)}
                    metadata={{
                      accountNo:
                        useCorporateStore.getState().corporateInfo.accountNo,
                    }}
                    customerName={
                      useCorporateStore.getState().corporateInfo.companyName ||
                      "Corporate User"
                    }
                    email={
                      useAuthStore.getState().email || "manifestomixx@gmail.com"
                    }
                    redirectUrl="https://smartbin-frontend-staging.up.railway.app/payment-success"
                    onTransaction={(reference) => {
                      if (!reference) {
                        setNotification({
                          type: "error",
                          message: "Missing transaction reference from AlatPay",
                        });
                        return;
                      }
                      submitTopUpAfterPayment(reference); // ✅ Pass ref from AlatPay
                    }}
                    onClose={() => {
                      console.log("AlatPay closed");
                    }}
                    onPaymentWindowOpen={() => {
                      closeModal("topup"); // Close top-up modal when AlatPay opens
                    }}
                    buttonText="Confirm Top Up"
                    buttonClassName="w-full inline-flex justify-center items-center px-4 py-4 border border-transparent font-medium rounded-xl shadow-sm text-white bg-green-700 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/10 bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity duration-300">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl relative p-6 md:p-8">
            <button
              onClick={() => closeModal("error")}
              className="absolute top-8 right-8 text-zinc-700 hover:text-red-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
            <div className="flex flex-col items-center text-center pt-12 pb-6">
              <div className="bg-red-50 p-3 rounded-full mb-4">
                <svg
                  className="h-12 w-12"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21.6709 18.585H11.6709"
                    stroke="#D70606"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3.3291 18.5853V10.8854C3.3291 7.48535 6.07911 4.73535 9.47911 4.73535H18.8458C22.2458 4.73535 24.9958 6.85201 24.9958 10.252"
                    stroke="#D70606"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M29.1291 20.3314C28.2957 21.1314 27.8958 22.3647 28.2291 23.6313C28.6458 25.1813 30.1791 26.1647 31.7791 26.1647H33.3291V28.5814C33.3291 32.2647 30.3458 35.248 26.6624 35.248H9.99577C6.31243 35.248 3.3291 32.2647 3.3291 28.5814V16.9147C3.3291 13.2314 6.31243 10.248 9.99577 10.248H26.6624C30.3291 10.248 33.3291 13.248 33.3291 16.9147V19.3313H31.5291C30.5957 19.3313 29.7457 19.698 29.1291 20.3314Z"
                    stroke="#D70606"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M36.6647 21.0321V24.4654C36.6647 25.3987 35.898 26.1654 34.948 26.1654H31.7314C29.9314 26.1654 28.2814 24.8488 28.1314 23.0488C28.0314 21.9988 28.4314 21.0154 29.1314 20.3321C29.748 19.6988 30.598 19.332 31.5314 19.332H34.948C35.898 19.332 36.6647 20.0987 36.6647 21.0321Z"
                    stroke="#D70606"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-zinc-800 mb-2">
                Insufficient balance
              </h2>
              <p className="text-zinc-900 font-light mb-8 w-3/4">
                {isInsufficientBalance 
                  ? "Your wallet has insufficient balance to complete the subscription payment. Please top up your wallet and try again."
                  : "Your wallet could not be funded due to insufficient balance. Please try again"
                }
              </p>
              <button
                onClick={isInsufficientBalance ? () => {
                  closeModal("error");
                  openModal("topup");
                } : backToDashboard}
                className="w-full inline-flex justify-center items-center p-4 border border-transparent font-medium rounded-xl shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                {isInsufficientBalance ? "Top Up Wallet" : "Back To Dashboard"}
              </button>
            </div>
          </div>
        </div>
      )}
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

      {/* Success Message Toast */}
      {successMessage && (
        <div className="fixed top-5 right-5 bg-blue-500 text-white py-2 px-4 rounded-lg shadow-lg animate-fade-in-down">
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
