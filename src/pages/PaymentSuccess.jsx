import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'failed'
  const [errorMessage, setErrorMessage] = useState('');

  // Extract reference from redirect URL (handles 'reference' or 'tx_reference')
  const reference = searchParams.get('reference') || searchParams.get('tx_reference');
  const code = searchParams.get('code');
  const message = searchParams.get('message');
  const linkingReference = searchParams.get('linkingreference');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        setStatus('failed');
        setErrorMessage('No transaction reference found in redirect.');
        return;
      }

      try {
        const verifyResponse = await api.get(`/payments/verify/${reference}`);
        if (verifyResponse.data?.success || verifyResponse.data?.succeeded) {
          setStatus('success');
        } else {
          setStatus('failed');
          setErrorMessage(verifyResponse.data?.message || 'Transaction verification failed.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('failed');
        setErrorMessage(error.response?.data?.message || 'Error occurred during transaction verification.');
      }
    };

    verifyPayment();
  }, [reference, code, message, linkingReference]);

  const handleReturnToDashboard = () => {
    const userType = localStorage.getItem('userType') || 'resident';
    if (userType === 'resident') {
      window.location.href = '/wallet';
    } else if (userType === 'facilitymgr') {
      window.location.href = '/facility-wallet';
    } else if (userType === 'corporate') {
      window.location.href = '/corporate-wallet';
    } else if (userType === 'agent') {
      window.location.href = '/agent-wallet';
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 transform transition-all duration-300 hover:shadow-2xl">
        <div className="p-8 text-center">
          {status === 'verifying' && (
            <div className="flex flex-col items-center py-10">
              <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-6"></div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Verifying Payment</h2>
              <p className="text-slate-500 text-sm max-w-xs">
                We are validating your transaction reference: <span className="font-mono text-slate-700 font-semibold">{reference || '...'}</span>. Please do not close or refresh this page.
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center py-6">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Top-Up Successful!</h2>
              <p className="text-green-600 font-semibold mb-6">Your wallet has been credited.</p>
              
              <div className="w-full bg-slate-50 rounded-2xl p-5 mb-8 text-left border border-slate-100">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Reference</span>
                  <span className="text-sm font-mono text-slate-800 font-bold">{reference}</span>
                </div>
                {linkingReference && (
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Gateway Ref</span>
                    <span className="text-sm font-mono text-slate-800">{linkingReference}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Status</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold uppercase">Success</span>
                </div>
              </div>

              <button
                onClick={handleReturnToDashboard}
                className="w-full py-4 px-6 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                Go back to Wallet
              </button>
            </div>
          )}

          {status === 'failed' && (
            <div className="flex flex-col items-center py-6">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Payment Verification Failed</h2>
              <p className="text-red-500 text-sm max-w-xs mb-8">{errorMessage || 'Unable to confirm transaction status.'}</p>

              {reference && (
                <div className="w-full bg-slate-50 rounded-2xl p-5 mb-8 text-left border border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Reference</span>
                    <span className="text-sm font-mono text-slate-800 font-bold">{reference}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleReturnToDashboard}
                className="w-full py-4 px-6 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                Return to Wallet
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
