import * as React from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export const PayPalButton = () => {
  const [donationAmount, setDonationAmount] = React.useState('5'); // Default donation amount
  const [customAmount, setCustomAmount] = React.useState(''); // State for custom donation amount
  const [showCustomInput, setShowCustomInput] = React.useState(false); // State to control the visibility of the custom amount input
  // Add a ref to keep track of the current donation amount
  const currentDonationAmountRef = React.useRef(donationAmount);

  // Update the ref whenever donationAmount changes
  React.useEffect(() => {
    currentDonationAmountRef.current = donationAmount;
  }, [donationAmount]);

  // Predefined donation amounts
  const donationOptions = ['5', '10', '20', '50', 'Other'];

  // Function to handle donation option clicks
  const handleDonationOptionClick = (amount) => {
    if (amount === 'Other') {
      setShowCustomInput(true);
      setCustomAmount(''); // Reset custom amount
    } else {
      setDonationAmount(amount);
      setShowCustomInput(false);
    }
  };

  const handleCreateOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: currentDonationAmountRef.current,
          },
        },
      ],
    });
  };

  return (
    <div className="wcpos-bg-gray-50 wcpos-p-6 wcpos-rounded-lg wcpos-space-y-4">
      <h2 className="wcpos-text-2xl wcpos-font-semibold wcpos-m-0">Donate</h2>

      {/* Donation options */}
      <div className="wcpos-flex wcpos-flex-wrap wcpos-gap-1">
        {donationOptions.map((amount, index) => (
          <button
            key={index}
            onClick={() => handleDonationOptionClick(amount)}
            className={`wcpos-py-2 wcpos-px-4 wcpos-rounded-md ${(showCustomInput && amount === 'Other' && donationAmount !== 'Other') ||
              (!showCustomInput && donationAmount === amount) ?
              'wcpos-bg-wp-admin-theme-color-darker-10 wcpos-text-white' :
              'wcpos-bg-gray-200'} hover:wcpos-bg-wp-admin-theme-color-darker-20 hover:wcpos-text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            {amount === 'Other' ? 'Other' : `$${amount}`}
          </button>
        ))}
      </div>

      {/* Custom donation amount input */}
      {showCustomInput && (
        <input
          type="number"
          value={customAmount || donationAmount}
          onChange={(e) => {
            setDonationAmount(e.target.value);
            setCustomAmount(e.target.value);
          }}
          placeholder="Enter donation amount"
          className="wcpos-w-full wcpos-py-2 wcpos-px-4 wcpos-border wcpos-border-gray-300 wcpos-rounded-md focus:wcpos-outline-none focus:wcpos-ring-2 focus:wcpos-ring-wp-admin-theme-color-darker-10 wcpos-ring-blue-500 focus:wcpos-ring-opacity-50"
        />
      )}

      <PayPalScriptProvider options={{ "client-id": "AVpvTxbmTiVoiv2_XiHWYsme_DG4aUBJoFScTC0cRlorALCQHnw03_IztWZYSNiIaPRz8wkoSF6xIQC4", components: "buttons", currency: "USD" }}>
        <PayPalButtons
          fundingSource="paypal"
          style={{ "layout": "vertical", "label": "donate" }}
          disabled={false}
          createOrder={handleCreateOrder}
          onApprove={(data, actions) => {
            // Capture the funds from the transaction
            return actions.order.capture().then((details) => {
              alert('Donation successful! Thank you for your generosity.');
              // Handle post-donation logic here
            });
          }}
        />
      </PayPalScriptProvider>
    </div>
  );
};
