import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import api from '../api/axiosConfig';
import useAuthStore from '../store/authStore';

const AlatPayButton = ({

  metadata = null,
  currency = 'NGN',
  amount,
  customerName = 'John Doe',
  email = "manifestomixx@gmail.com",
  redirectUrl = 'https://smartbin-frontend-staging.up.railway.app/payment-success',
  onTransaction,
  onClose,
  onPaymentWindowOpen,
  buttonText = 'Pay ',
  buttonClassName = 'bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const alatpayRef = useRef(null); // Ref to store the Alatpay object
  const alatPopupRef = useRef(null); // NEW: store the popup instance


  const showNotification = (message, type = 'error') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 5000);
  };

  useEffect(() => {
    // Load the ALATPay script dynamically
    const script = document.createElement('script');
    script.src = 'https://web.alatpay.ng/js/alatpay.js';
    script.async = true;
    script.onload = () => {
      setScriptLoaded(true);
      alatpayRef.current = window.Alatpay; // Store the Alatpay object in the ref
    };
    script.onerror = () => showNotification('Failed to load payment gateway', 'error');
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleOnTransaction = async (res) => {
    console.log('ALAT transaction response:', res);

    if (onTransaction) onTransaction(res);
    showNotification('Payment was successful!', 'success');

    try {
      // Transform `res` into the format the backend expects
      const payload = {
        amount: res.amount ?? 0,
        orderId: res.orderId ?? res.reference ?? 'ALAT_ORDER_REF',
        description: res.description ?? 'Wallet funding via AlatPay',
        paymentMethodId: res.paymentMethodId ?? 1,
        sessionId: res.sessionId ?? res.reference ?? 'SESSION-ID',
        isAmountDiscrepant: false,
        amountSent: res.amount ?? 0,

        nipTransaction: {
          id: res?.nipTransaction?.id || '',
          requestdate: res?.nipTransaction?.requestdate || '',
          nibssresponse: res?.nipTransaction?.nibssresponse || '',
          sendstatus: res?.nipTransaction?.sendstatus || '',
          sendresponse: res?.nipTransaction?.sendresponse || '',
          transactionId: res?.transactionId || '',
          transactionStatus: res?.status || 'SUCCESS',
          log: res?.nipTransaction?.log || '',
          createdAt: new Date().toISOString(),
          isCallbackValidated: true,
          originatoraccountnumber: res?.customer?.accountNumber || '',
          originatorname: res?.customer?.name || '',
          bankname: res?.bankName || '',
          bankcode: res?.bankCode || '',
          amount: res.amount ?? 0,
          narration: 'SmartBin Wallet Funding',
          craccountname: 'SmartBin System',
          craccount: res?.virtualAccount?.businessBankAccountNumber || '',
          paymentreference: res.reference || '',
          sessionid: res?.sessionId || '',
        },

        virtualAccount: {
          id: '',
          merchantId: res?.merchantId || '',
          virtualBankCode: '',
          virtualBankAccountNumber: '',
          businessBankAccountNumber: '',
          businessBankCode: '',
          transactionId: res.transactionId || '',
          status: res.status || 'SUCCESS',
          expiredAt: '',
          settlementType: 'WALLET_TOPUP',
          createdAt: new Date().toISOString(),
          businessId: res.businessId || '',
          amount: res.amount || 0,
          currency: res.currency || 'NGN',
          orderId: res.orderId || '',
          description: 'Top-up',
          subBusinessCode: '',
          customer: {},
        },

        customer: {
          id: '',
          transactionId: res.transactionId || '',
          createdAt: new Date().toISOString(),
          email: res.customerEmail || '',
          phone: res.customerPhone || '',
          firstName: res.customerName?.split(' ')[0] || '',
          lastName: res.customerName?.split(' ')[1] || '',
          metadata: JSON.stringify(metadata || {}),
        },

        subBusinessCode: '',
        isCallbackValidated: true,
        id: res.transactionId || '',
        merchantId: res.merchantId || '',
        businessId: res.businessId || '',
        channel: 'ALAT',
        callbackUrl: redirectUrl,
        feeAmount: res.fee || 0,
        businessName: 'SmartBin Wallet',
        currency: res.currency || 'NGN',
        status: res.status || 'SUCCESS',
        statusReason: '',
        settlementType: 'WALLET_TOPUP',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ngnVirtualBankAccountNumber: '',
        ngnVirtualBankCode: '',
        usdVirtualAccountNumber: '',
        usdVirtualBankCode: '',
      };

      const response = await api.post("/payments/notification", payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response?.data?.succeeded) {
        showNotification('Wallet funded successfully!', 'success');

        // Refresh UI (optional)
        // if (typeof fetchBills === 'function') fetchBills();

        //  Close modal (if applicable)
        // if (typeof closeModal === 'function') closeModal('payment');

        // Try closing popup (if Alat supports it)
        if (alatPopupRef.current && typeof alatPopupRef.current.close === 'function') {
          alatPopupRef.current.close();
        } else {
          // Fallback: Redirect current window (if popup is in separate tab)
          window.location.href = redirectUrl;
        }
      } else {
        showNotification('Payment recorded but not verified.', 'error');
      }

      console.log('Backend response:', response.data);
    } catch (error) {
      console.error(' Error sending transaction to backend:', error);
      showNotification('Failed to notify backend about the transaction.', 'error');
    }
  }


  const handlePaymentClick = async () => {
    setIsLoading(true);

    try {
      if (!scriptLoaded || !alatpayRef.current) {
        showNotification('Payment system still loading. Please wait.', 'error');
        return;
      }

      const popup = alatpayRef.current.setup({
        businessId: import.meta.env.VITE_ALATPAY_BUSINESS_ID,
        apiKey: import.meta.env.VITE_ALATPAY_API_KEY,
        reference: `ALAT-${Date.now()}-${useAuthStore.getState().token}`,
        amount,
        currency,
        customerName,
        email,
        redirectUrl,
        metadata,
        onTransaction: (res) => { handleOnTransaction(res) },

        onClose: () => {
          console.log('ALAT payment closed');
          if (onClose) onClose();
          showNotification('Payment window closed.', 'info');
        },
      });

      if (!popup || typeof popup.show !== 'function') {
        throw new Error("Failed to initialize payment window.");
      }

      alatPopupRef.current = popup;
      popup.show();
      if (typeof onPaymentWindowOpen === 'function') {
        onPaymentWindowOpen(); //  parent to close modal
      }
      showNotification('Payment initialized successfully!', 'success');

    } catch (error) {
      console.error('Payment setup failed:', error);
      showNotification('Something went wrong while initializing payment.', 'error');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="relative w-full">
      {notification.show && createPortal(
        <div 
          className={`fixed top-4 right-4 p-4 rounded-md shadow-lg ${notification.type === 'error'
            ? 'bg-red-100 border-l-4 border-red-500 text-red-700'
            : 'bg-green-100 border-l-4 border-green-500 text-green-700'
            }`}
          style={{ zIndex: 999999 }}
        >
          <p>{notification.message}</p>
        </div>,
        document.body
      )}


      <button
        onClick={handlePaymentClick}
        className={`${buttonClassName} ${(isLoading || !scriptLoaded) ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={isLoading || !scriptLoaded}
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

export default AlatPayButton;