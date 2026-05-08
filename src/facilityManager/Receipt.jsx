import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import api from '../api/axiosConfig';
import useFacilityMgrStore from '../store/useFacilityMgrStore';

// Helper function to convert number to words (Nigerian Naira)
const numberToWordsNaira = (num) => {
    if (num === null || num === undefined) return '';
    if (num === 0) return 'Zero Naira Only';

    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const thousands = ['', 'Thousand', 'Million', 'Billion'];

    let word = '';

    const toWords = (n) => {
        if (n === 0) return '';
        if (n < 10) return ones[n] + ' ';
        if (n < 20) return teens[n - 10] + ' ';
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '') + ' ';
        if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + toWords(n % 100, '') : '') + ' ';
        return '';
    };

    let i = 0;
    let number = num;
    while (number > 0) {
        if (number % 1000 !== 0) {
            word = toWords(number % 1000, '') + thousands[i] + (i > 0 ? ' ' : '') + word;
        }
        number = Math.floor(number / 1000);
        i++;
    }

    return word.trim() + ' Naira Only';
};

// Default data for the receipt, embedded directly for standalone use



const ReceiptPage = () => {
    let navigate = useNavigate()
    const [receiptData, setReceiptData] = useState({});

    const fetchData = async () => {
        const currentId = localStorage.getItem('receiptId');
        try {
            const { data } = await api.get(`/api/v1/facility-manager/payment/receipt/${currentId}`);
            if (data.succeeded) {
                const date = new Date(data.data.transDate);
                const newData = {
                    recipientName: data.data.payerName,
                    transactionId: currentId,
                    paymentId: useFacilityMgrStore.getState().facilityMgrInfo.payerID,
                    transactionRef: data.data.transRef,
                    phoneNumber: data.data.phoneNo,
                    transactionDate: `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`,
                    paymentItems: [
                        { description: data.data.description, amount: data.data.amount },
                    ],
                    currencySymbol: "₦",
                }
                setReceiptData(newData);
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const receiptRef = useRef(null);


    const amountInWords = numberToWordsNaira(receiptData.paymentItems?.[0]?.amount);


    const handleDownloadPdf = () => {
        const input = receiptRef.current;
        if (!input) {
            console.error("Receipt element not found");
            return;
        }

        html2canvas(input, {
            scale: 2,
            useCORS: true,
            logging: true,
        })
            .then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                const marginMm = 10;
                const pdfPageWidthMm = pdf.internal.pageSize.getWidth();
                const pdfPageHeightMm = pdf.internal.pageSize.getHeight();
                const effectiveWidthMm = pdfPageWidthMm - (2 * marginMm);
                const effectiveHeightMm = pdfPageHeightMm - (2 * marginMm);
                const canvasWidthPx = canvas.width;
                const canvasHeightPx = canvas.height;
                const aspectRatio = canvasHeightPx / canvasWidthPx;

                let imageDisplayWidthMm = effectiveWidthMm;
                let imageDisplayHeightMm = imageDisplayWidthMm * aspectRatio;

                if (imageDisplayHeightMm > effectiveHeightMm) {
                    imageDisplayHeightMm = effectiveHeightMm;
                    imageDisplayWidthMm = imageDisplayHeightMm / aspectRatio;
                }

                const xOffsetMm = marginMm + (effectiveWidthMm - imageDisplayWidthMm) / 2;
                const yOffsetMm = marginMm + (effectiveHeightMm - imageDisplayHeightMm) / 2;

                pdf.addImage(imgData, 'PNG', xOffsetMm, yOffsetMm, imageDisplayWidthMm, imageDisplayHeightMm);
                pdf.save(`receipt-${receiptData.transactionId || 'download'}.pdf`);
            })
            .catch(err => {
                console.error("Error generating PDF:", err);
                alert("An error occurred while generating the PDF. Please check the console for details.");
            });
    };
    const goBack = () => {
        navigate("/receipts")

    }

    return (
        <div>

            <div className='flex justify-between w-full px-20'>


                <button
                    onClick={goBack}
                    className="mt-8  hover:bg-[#f4f4f4] text-[#555] font-semibold transition duration-150 ease-in-out flex p-4 focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:ring-opacity-50"

                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>

                    <span>  Back</span>
                </button>

                {/* Download Button */}
                <button
                    onClick={handleDownloadPdf}
                    className="mt-8 bg-[#15803d] hover:bg-[#16a34a] text-[#ffffff] font-semibold   rounded-lg shadow-md transition duration-150 ease-in-out flex p-4 focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:ring-opacity-50"
                >
                    <span className='px-2'> Download</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>

                </button>
            </div>

            <div className=" p-4 sm:p-8 flex flex-col items-center min-h-screen font-sans">
                <div ref={receiptRef} className="w-full max-w-2xl bg-[#ffffff]  rounded-lg p-8 ">
                    {/* Header Section */}
                    <div className="flex flex-col items-center mb-6 text-center bg-[#F2F5F9] py-6 rounded-2xl -mx-2">
                        <img src="/images/sealLogo.svg" alt="Lagos Seal" className="h-18 mb-1 p-2" />

                        <p className="text-xs font-semibold text-[#52525b] uppercase tracking-wider">
                            UTILITIES SERVICE PROVIDER INITIATIVE BY THE
                        </p>
                        <p className="text-sm font-bold text-[#3f3f46] uppercase tracking-wide">

                            LAGOS STATE GOVERNMENT
                        </p>
                    </div>

                    {/* Payment Receipt Title */}
                    <h1 className="text-xl sm:text-2xl my-12 text-center text-[#1e293b] mb-6 sm:mb-8">
                        <span className='px-2'>PAYMENT</span> RECEIPT
                    </h1>

                    {/* Details Section */}
                    <div className="flex flex-wrap justify-between mb-6 sm:mb-8 text-xs sm:text-sm text-[#3f3f46]">
                        <div className="w-full sm:w-1/2 mb-2 sm:mb-0 pr-0 sm:pr-2">
                            <p className='font-bold py-2'><span className="font-medium">Received From :</span> {receiptData.recipientName}</p>
                            <p className='font-bold py-2'><span className="font-medium">Payment ID :</span> {receiptData.paymentId}</p>
                            <p className='font-bold py-2'><span className="font-medium">Phone number :</span> {receiptData.phoneNumber}</p>
                        </div>
                        <div className="w-full sm:w-1/2 text-left sm:text-right pl-0 sm:pl-2">
                            <p className='font-bold py-2'><span className="font-medium">Transaction ID :</span> {receiptData.transactionId}</p>
                            <p className='font-bold py-2'><span className="font-medium">Transaction ref :</span> {receiptData.transactionRef}</p>
                            <p className='font-bold py-2'><span className="font-medium">Transaction Date :</span> {receiptData.transactionDate}</p>
                        </div>
                    </div>

                    {/* Payment Description Header */}
                    <div className="flex justify-between bg-[#15803d] text-[#ffffff] py-4 px-6 items-center mb-2">
                        <h2 className="text-xl  font-semibold">Payment Description</h2>
                        <h2 className="text-xl  font-semibold">Amount</h2>
                    </div>

                    {/* Payment Items */}
                    <div className="border-t border-[#D7DAE0] rounded-b-md">
                        {receiptData.paymentItems?.map((item, index) => (
                            <div
                                key={index}
                                className={`flex justify-between p-6 text-xs sm:text-sm text-[#3f3f46] ${index < receiptData.paymentItems.length - 1 ? 'border-b border-[#e4e4e7]' : ''
                                    }`}
                            >
                                <span className='text-xl'>{item.description}</span>
                                <span className="font-semibold">
                                    {receiptData.currencySymbol}
                                    {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        ))}
                        {/* Total Amount */}
                        {/* {receiptData.paymentItems.length > 1 && (
                            <div className="flex justify-between p-3 text-xs sm:text-sm text-[#18181b] font-bold border-t border-[#D7DAE0]">
                                <span>Total Amount</span>
                                <span>
                                    {receiptData.currencySymbol}
                                    {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        )} */}
                    </div>

                    {/* Amount in Words */}
                    <div className="mt-6 sm:mt-8 sm:mb-8 text-xs sm:text-sm pt-20 pb-4 border-b border-[#D7DAE0] text-[#3f3f46]">
                        <p className='font-bold'><span className="font-medium">Amount in Words : </span>{amountInWords}</p>
                    </div>

                    {/* Footer Section */}
                    <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left text-xs text-[#71717a] pt-6 mt-16 border-t border-[#D7DAE0]">
                        <p className="mb-2 sm:mb-0">USPI by Lagos State Government

                        </p>
                        <div className="flex flex-col sm:flex-row items-center">
                            <p className="mb-1 sm:mb-0 sm:mr-4 border-r border-[#d4d4d4] px-2">+91 00000 00000</p>
                            <p> hello@lagosuspi.com</p>
                        </div>
                    </div>
                </div>


            </div>

        </div>

    );
};

export default ReceiptPage;