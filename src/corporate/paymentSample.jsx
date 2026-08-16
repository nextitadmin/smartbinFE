import React from 'react';
import AlatPayButton from '../components/AlatPayButton';

const PaymentPage = () => {
    const handleTransaction = (response) => {
        console.log('Transaction completed:', response);
        // You can add your own success handling here
    };

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Complete Payment</h2>
            <AlatPayButton
                //all details provided by the api request in the component
                amount={5000}
                onTransaction={handleTransaction}
                buttonText="Pay Now "
                buttonClassName="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg"
            />
        </div>
    );
};

export default PaymentPage;