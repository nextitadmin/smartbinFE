import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import useAuthStore from '../store/authStore';

const Pay4ItButton = ({
  amount,
  email,
  customerName = 'John Doe',
  description = 'Smart Bin Wallet Top-up',
  currency = 'NGN',
  userType = 'resident', // 'resident', 'corporate', 'facilityManager', or 'agent'
  customEndpoint = '',
  customPayload = {},
  onSuccess,
  onClose,
  onPaymentWindowOpen,
  buttonText = 'Confirm Top Up',
  buttonClassName = 'w-full inline-flex justify-center items-center px-4 py-4 border border-transparent font-medium rounded-xl shadow-sm text-white bg-green-700 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const showNotification = (message, type = 'error') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 5000);
  };

  // Extracts a clean, displayable error message from a backend response.
  // Handles both string messages and array-of-strings messages (e.g. class-validator style errors),
  // and only falls back to a generic message when the backend gives nothing usable.
  const extractErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
    const responseMessage = error?.response?.data?.message;

    if (Array.isArray(responseMessage)) {
      return responseMessage.join(', ');
    }
    if (typeof responseMessage === 'string' && responseMessage.trim()) {
      return responseMessage;
    }
    if (typeof error?.message === 'string' && error.message.trim()) {
      return error.message;
    }
    return fallback;
  };



  const fetchTransactionReference = async () => {
    let endpoint = customEndpoint;
    if (!endpoint) {
      endpoint = '/wallets/topup'; // Default fallback
    }

    const userId = useAuthStore.getState().user?.id || useAuthStore.getState().token;

    try {
      const clientRef = 'SBTP-' + Math.random().toString(36).substring(2, 10).toUpperCase() + Math.random().toString(36).substring(2, 10).toUpperCase();

      let payload = {
        userId,
        walletAcctNo: '',
        amount: Number(amount),
        reference: clientRef,
        channel: 'ALATPay',
        narration: description,
        ...customPayload,
      };

      if (endpoint.endsWith('/wallets/topup')) {
        payload = {
          amount: Number(amount),
          reference: clientRef,
        };
      } else if (endpoint.endsWith('/wallets/charge')) {
        payload = {
          amount: Number(amount),
          reference: 'SB-CHARG-' + Date.now() + Math.random().toString(36).substring(2, 10).toUpperCase(),
        };
      }

      const response = await api.post(endpoint, payload);

      const responseData = response.data;
      if (responseData?.succeeded || responseData?.success) {
        // Return reference and callbackUrl from response
        const reference =
          responseData?.reference ||
          responseData?.data?.transactionReference ||
          responseData?.data?.reference;

        const callbackUrl = responseData?.data?.callback?.paymentCallbackUrl || null;

        if (reference) {
          return { reference, callbackUrl };
        }
      }
      throw new Error(extractErrorMessage({ response }, 'Failed to initialize transaction reference from backend.'));
    } catch (error) {
      console.error('Error fetching transaction reference:', error);
      throw new Error(extractErrorMessage(error, 'Failed to initialize transaction reference from backend.'));
    }
  };

  const verifyPaymentOnBackend = async (pay4itResponse, reference) => {
    try {
      const verifyResponse = await api.get(`/payments/verify/${reference}`);
      return verifyResponse.data?.success || verifyResponse.data?.succeeded;
    } catch (error) {
      console.error('Error verifying transaction on backend:', error);
      return false;
    }
  };

  const handlePaymentClick = async (e) => {
    if (e) e.preventDefault();

    if (!amount || amount < 1) {
      showNotification('Enter a valid amount', 'error');
      return;
    }

    setIsLoading(true);

    try {
      if (!window.Pay4it) {
        showNotification('Payment system is loading. Please wait.', 'error');
        setIsLoading(false);
        return;
      }

      // Step A: Fetch transaction reference from BE based on user type
      const { reference: transactionRef, callbackUrl } = await fetchTransactionReference();

      if (typeof onPaymentWindowOpen === 'function') {
        onPaymentWindowOpen(); // Close top-up modal or prepare UI if needed
      }

      // Step B: Setup & trigger Pay4it inline checkout popup
      window.Pay4it(
        {
          tranref: transactionRef,
          currency: currency,
          description: description,
          country: 'NG',
          amount: parseFloat(amount).toFixed(2),
          full_name: customerName,
          email: email,
          public_key: import.meta.env.VITE_PAY4IT_PUBLIC_KEY || 'SBTESTPUBK_SW86IO9PMLCYGUR2QJ5EDOEF2AIHQ8OO',
          callbackurl: '',
          setAmountByCustomer: false,
        },
        async function callback(response, closeCheckout) {
          setIsLoading(false);
          const isVerified = await verifyPaymentOnBackend(response, transactionRef, callbackUrl);

          if (isVerified) {
            showNotification('Payment verified successfully!', 'success');
            if (onSuccess) onSuccess({ ...response, reference: transactionRef });
          } else {
            showNotification('Payment processed but verification pending.', 'info');
          }

          if (typeof closeCheckout === 'function') {
            closeCheckout();
          }
        },
        function close(closedState) {
          setIsLoading(false);
          console.log('Pay4It payment window closed:', closedState);
          if (onClose) onClose();
          showNotification('Payment window closed.', 'info');
        }
      );

      showNotification('Payment initialized successfully!', 'success');
    } catch (error) {
      console.error('Payment initialization failed:', error);
      showNotification(error.message || 'Something went wrong while initializing payment.', 'error');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full">
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${notification.type === 'error'
          ? 'bg-red-100 border-l-4 border-red-500 text-red-700'
          : notification.type === 'success'
            ? 'bg-green-100 border-l-4 border-green-500 text-green-700'
            : 'bg-blue-100 border-l-4 border-blue-500 text-blue-700'
          }`}>
          <p>{notification.message}</p>
        </div>
      )}

      <button
        onClick={handlePaymentClick}
        className={`${buttonClassName} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          buttonText
        )}
      </button>
    </div>
  );
};

export default Pay4ItButton;
