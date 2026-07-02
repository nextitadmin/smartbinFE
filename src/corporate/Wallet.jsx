import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/CorporateTopBar";
import useCorporateStore from "../store/useCorporateStore";
import useAuthStore from "../store/authStore";
import api from "../api/axiosConfig";
import AlatPayButton from "../components/AlatPayButton";

import PaymentNav from "../components/PaymentNav";

const PaymentReceipts = () => {
  // --- State ---

  const [payments, setPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState("sn");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [notification, setNotification] = useState(null);
  const [totalPages, setTotalPages] = useState("");
  const itemsPerPage = 10;
  const [topUpAmount, setTopUpAmount] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [walletBalance, setWalletBalance] = useState("");
  const [showBalance, setShowBalance] = useState(true);
  const [transactionReference, setTransactionReference] = useState(null);

  const fetchData = async () => {
    try {
      const endpoint = `/corporate/payments?AccountNo=${useCorporateStore.getState().corporateInfo.accountNo}&page=${currentPage}&limit=${itemsPerPage}`;
      // console.log("Calling API endpoint:", endpoint);
      
      const { data } = await api.get(endpoint);
      if (data.succeeded || data.success) {
        // Use the correct array and filter for wallet and alatPay
        const transactions = data.data?.transactions || data.transactions || [];
        const filtered = transactions.filter(
          (item) =>
            item.paymentMethod &&
            (item.paymentMethod.toLowerCase() === "wallet" ||
              item.paymentMethod.toLowerCase() === "alatpay" ||
              item.paymentMethod.toLowerCase() === "alat pay" ||
              item.paymentMethod.toLowerCase() === "alat by wema")
        );
        
        const newData = filtered.map((item, index) => {
          // Try to infer AlatPay if possible
          let paymentMethod = item.paymentMethod;
          if (
            paymentMethod.toLowerCase() === "wallet" &&
            (
              (item.service && item.service.toLowerCase().includes("alat")) ||
              (item.meta?.description && item.meta.description.toLowerCase().includes("alat")) ||
              (item.transactionReference && item.transactionReference.toLowerCase().includes("alat"))
            )
          ) {
            paymentMethod = "alatPay";
          }
          return {
            sn: index + 1 + (currentPage - 1) * itemsPerPage,
            id: item._id,
            transactionRef: item.transactionReference,
            date: item.createdAt?.slice(0, 10),
            service: item.service || item.description,
            status: item.status,
            amount: item.amount,
            paymentMethod,
          };
        });
        setPayments(newData);
        setTotalPages(data.data?.paging?.pages || data.paging?.pages || 1);
      }
      // console.log("Wallet transactions data:", data);
      // console.log("Pagination data:", {
      //   currentPage,
      //   totalPages: data.data?.paging?.pages || data.paging?.pages,
      //   totalItems: data.data?.paging?.total || data.paging?.total,
      //   itemsPerPage
      // });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // Add serial numbers to wastes data
    fetchData();
  }, [currentPage]);

  const fetchBalance = async () => {
    try {
      const { data } = await api.get("/corporate/wallets");

      const balance = data?.data?.balance ?? 0;
      setWalletBalance(formatCurrency(balance));
      
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

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

  const formatDate = (dateString) => {
    if (!dateString) return "";
    // Assuming format is DD-MM-YY
    const [day, month, year] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  // --- Computed Properties ---
  const filteredPayments = useMemo(() => {
    if (!searchQuery) {
      return payments;
    }
    const lowerQuery = searchQuery.toLowerCase();
    return payments.filter((payment) => {
      return (
        payment.transactionRef.toLowerCase().includes(lowerQuery) ||
        payment.service.toLowerCase().includes(lowerQuery) ||
        payment.paymentMethod.toLowerCase().includes(lowerQuery) ||
        payment.status.toLowerCase().includes(lowerQuery) ||
        formatDate(payment.date).includes(lowerQuery) ||
        payment.amount.toString().includes(lowerQuery)
      );
    });
  }, [payments, searchQuery]);

  const sortedPayments = useMemo(() => {
    return [...filteredPayments].sort((a, b) => {
      let valA = a[sortColumn];
      let valB = b[sortColumn];

      if (sortColumn === "amount") {
        // Numeric comparison for amounts
        valA = Number(valA);
        valB = Number(valB);
      } else if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (sortColumn === "date") {
        // Convert dates to comparable format (assuming DD-MM-YY format)
        const [dayA, monthA, yearA] = valA.split("-").map(Number);
        const [dayB, monthB, yearB] = valB.split("-").map(Number);
        const dateA = new Date(2000 + yearA, monthA - 1, dayA);
        const dateB = new Date(2000 + yearB, monthB - 1, dayB);
        valA = dateA.getTime();
        valB = dateB.getTime();
      }

      let comparison = 0;
      if (valA > valB) {
        comparison = 1;
      } else if (valA < valB) {
        comparison = -1;
      }

      return sortDirection === "dsc" ? comparison * -1 : comparison;
    });
  }, [filteredPayments, sortColumn, sortDirection]);

  // --- Methods ---
  const sortBy = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "dsc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const sortIcon = (columnKey) => {
    if (sortColumn !== columnKey) return "↕";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase() ?? "1") {
      case "successful":
        return "bg-green-100 text-green-800 border-green-300";
      case "failed":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-zinc-100 text-zinc-800 border-zinc-300";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Placeholder Action Methods
  const filterData = () => {
    console.log("Filter action triggered");
    setNotification({ type: "error", message: "Coming soon..." });
  };

  const exportData = () => {
    console.log("Export action triggered");
    setNotification({ type: "error", message: "Coming soon..." });
  };

  const closeAllModals = () => {
    setShowSuccessModal(false);
    setShowTopUpModal(false);
    document.body.style.overflow = ""; // Ensure scroll is restored
  };

  const openModal = (modalName) => {
    closeAllModals(); // Close others before opening a new one
    if (modalName === "success") setShowSuccessModal(true);
    if (modalName === "topup") setShowTopUpModal(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = (modalName) => {
    if (modalName === "success") {
      setShowSuccessModal(false);
      setTopUpAmount("");
      fetchBalance();
    }
    if (modalName === "topup") setShowTopUpModal(false);

    // Restore background scroll only if no modals are open
    if (!showSuccessModal && !showTopUpModal) {
      document.body.style.overflow = "";
    }
  };

  const handleTopUpClose = () => {
    closeModal("topup");
    setTopUpAmount("");
  };

  const downloadReceipt = () => {
    console.log("Download Receipt clicked");
    setNotification({ type: "error", message: "Coming soon..." });
    closeModal("success");
  };

  // const submitTopUpAfterPayment = async () => {
  //   const userId = useAuthStore((state) => state.user?.id);

  //   if (!topUpAmount || topUpAmount < 100 || topUpAmount > 1000000) {
  //     setNotification({ type: "error", message: "Enter a valid amount" });
  //     return;
  //   }

  //   try {

  //     const { data } = await api.post("/corporate/wallets/topup", {
  //       userId: userId,
  //       walletAcctNo: "",
  //       amount: topUpAmount,
  //       channel: "ALATPay",
  //       narration: "",
  //     });

  //     console.log("TopUp Response:", data);

  //     if (data.succeeded || data.success) {
  //       const reference = data?.reference || data?.data?.transactionReference;
  //       console.log("Reference:", data?.reference ?? data?.data?.transactionReference);
  //     if (reference) {
  //       await verifyAlatPayTransaction(reference);
  //     } else {
  //       console.warn("No reference returned from top-up response");
  //     }

  //     setNotification({
  //       type: "success",
  //       message: data.message || "Top-up successful!",
  //     });

  //     fetchBalance();         // Refresh balance
  //     closeModal("topup");    // Close top-up modal
  //     openModal("success");
  //     } else {
  //       setNotification({
  //         type: "error",
  //         message: data.message || "Error during TopUp!",
  //       });
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     setNotification({ type: "error", message: "TopUp failed!" });
  //   }
  // };

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

  const handleTopUpChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setTopUpAmount(value === "" ? "" : Number(value));
    }
  };

  return (
    <div>
      <div className="flex sans h-screen max-w-screen">
        <Sidebar addkey="1" />
        <div className=" bg-zinc-100 min-h-screen   flex flex-col flex-1 overflow-y-auto  ">
          <Topbar />
          <div className="bg-zinc-100 font-sans">
            <main className="p-4 ">
              <div className="p-5 md:p-8 rounded-lg w-full  mx-auto">
                {/* Header */}
                <div className="flex flex-wrap justify-between items-center gap-4 mb-2">
                  <div className="flex flex-col  gap-2">
                    <h1 className="text-xl md:text-2xl font-semibold text-zinc-800">
                      Payment
                    </h1>
                    <span className="text-zinc-500">
                      {" "}
                      Track your waste disposal
                    </span>
                  </div>
                </div>

                <PaymentNav />

                <div className="w-full sm:w-1/2 lg:w-5/12  mb-6">
                  <div className="flex bg-card  bg-cover rounded-2xl min-h-[230px] w-full">
                    <div className="flex p-6 rounded-2xl min-h-[230px] w-full bg-[linear-gradient(288.72deg,rgba(0,120,54,0.75)_0%,#007836_98.68%)]">
                      <div className="w-full">
                        <p className="text-white text-xs font-light ">
                          Available Balance
                        </p>
                        <div className="flex items-center ">
                          <h2 className="text-white text-3xl font-sans mt-1 mr-20">
                            {" "}
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

                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                  <div className="flex flex-col">
                    <h1 className="text-lg font-semibold text-zinc-800">
                      Transactions
                    </h1>
                    <span className="text-zinc-400">
                      View all transactions in your wallet here
                    </span>
                  </div>
                </div>

                {/* Search and Actions */}
                <div className="flex lg:flex-row flex-col justify-between gap-4 mb-6">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 text-green-700 flex items-center pl-3">
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
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        ></path>
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search payments..."
                      className="w-full lg:w-[24rem] pl-10 pr-4 py-2 border border-zinc-300 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <button
                      onClick={filterData}
                      type="button"
                      className="px-4 lg:mx-4 py-2 border border-zinc-300 text-sm font-medium rounded-xl text-zinc-700 bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Filter
                    </button>
                    <button
                      onClick={exportData}
                      type="button"
                      className="px-4 py-2 mx-4 border border-zinc-300 lg:mx-0 text-sm font-medium rounded-xl text-zinc-700 bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Export
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="table-container border border-zinc-200 rounded-2xl">
                  <table className="w-full min-w-[768px] text-sm text-left text-zinc-600">
                    <thead className="font-light text-zinc-700 uppercase bg-white">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-3 text-center"
                          onClick={() => sortBy("sn")}
                        >
                          S/N
                        </th>

                        <th
                          scope="col"
                          className="px-4 py-3"
                          role="button"
                          onClick={() => sortBy("transactionRef")}
                        >
                          <div className="flex items-center justify-between">
                            Transaction Ref{" "}
                            <span
                              className={`sort-icon ${
                                sortColumn === "transactionRef" ? "active" : ""
                              }`}
                            >
                              {sortIcon("transactionRef")}
                            </span>
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3"
                          role="button"
                          onClick={() => sortBy("service")}
                        >
                          <div className="flex items-center justify-between">
                            Service{" "}
                            <span
                              className={`sort-icon ${
                                sortColumn === "service" ? "active" : ""
                              }`}
                            >
                              {sortIcon("service")}
                            </span>
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3"
                          role="button"
                          onClick={() => sortBy("amount")}
                        >
                          <div className="flex items-center justify-between">
                            Amount{" "}
                            <span
                              className={`sort-icon ${
                                sortColumn === "amount" ? "active" : ""
                              }`}
                            >
                              {sortIcon("amount")}
                            </span>
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3"
                          role="button"
                          onClick={() => sortBy("date")}
                        >
                          <div className="flex items-center justify-between">
                            Date{" "}
                            <span
                              className={`sort-icon ${
                                sortColumn === "date" ? "active" : ""
                              }`}
                            >
                              {sortIcon("date")}
                            </span>
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3"
                          role="button"
                          onClick={() => sortBy("paymentMethod")}
                        >
                          <div className="flex items-center justify-between">
                            Payment Method{" "}
                            <span
                              className={`sort-icon ${
                                sortColumn === "paymentMethod" ? "active" : ""
                              }`}
                            >
                              {sortIcon("paymentMethod")}
                            </span>
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3"
                          role="button"
                          onClick={() => sortBy("status")}
                        >
                          <div className="flex items-center justify-between">
                            Status{" "}
                            <span
                              className={`sort-icon ${
                                sortColumn === "status" ? "active" : ""
                              }`}
                            >
                              {sortIcon("status")}
                            </span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedPayments.length === 0 ? (
                        <tr>
                          <td
                            colSpan="7"
                            className="text-center py-10 text-zinc-500"
                          >
                            No payments found.
                          </td>
                        </tr>
                      ) : (
                        sortedPayments.map((payment, index) => (
                          <tr
                            key={payment.transactionRef}
                            className="bg-white border-b border-zinc-200 hover:bg-zinc-50 lg:h-20"
                          >
                            <td className="px-4 py-3 text-center">
                              <span className="text-sm font-medium text-zinc-900">
                                {payment.sn}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-medium text-zinc-900 whitespace-nowrap">
                              {payment.transactionRef}
                            </td>
                            <td className="px-4 py-3">{payment.service}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {formatCurrency(payment.amount)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {formatDate(payment.date)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {payment.paymentMethod}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span
                                className={`px-3 py-1 border rounded-full text-xs font-medium inline-block ${getStatusClass(
                                  payment.status
                                )}`}
                              >
                                {payment.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
                  <span className="text-sm text-zinc-700">
                    Page <span className="font-semibold">{currentPage}</span> of{" "}
                    <span className="font-semibold">{totalPages}</span>
                    <span className="mx-2">|</span>
                    Total{" "}
                    <span className="font-semibold">
                      {payments.length}
                    </span>{" "}
                    items
                  </span>
                  <div
                    className="inline-flex rounded-md shadow-sm -space-x-px"
                    role="group"
                  >
                    <button
                      onClick={() => changePage(currentPage - 1)}
                      disabled={currentPage === 1}
                      type="button"
                      className="px-3 mr-4 py-2 text-sm font-medium text-zinc-500 bg-white border border-zinc-300 hover:bg-zinc-100 focus:z-10 focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => changePage(currentPage + 1)}
                      disabled={currentPage === totalPages || totalPages === 0}
                      type="button"
                      className="px-3 py-2 text-sm font-medium text-zinc-50 bg-green-700 border border-zinc-300 hover:bg-green-600 focus:z-10 focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
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
                Your wallet has been successfully funded
              </p>

              <div className="w-full space-y-3 bg-[#F7F9FA] rounded-xl p-4 mb-8 text-left">
                <div className="flex justify-between items-center py-2">
                  <span className="text-zinc-500">Amount</span>
                  <span className="font-medium text-zinc-800">{`₦ ${topUpAmount}`}</span>
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
                    <img
                      src="/images/alat-logo.png"
                      alt="Alat Logo"
                      className="w-10 h-10 mx-2 inline-block rounded-sm"
                    />{" "}
                    Alat By Wema
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
};

export default PaymentReceipts;
