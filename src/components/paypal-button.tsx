import { useState, useEffect, useRef } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useTranslation } from 'react-i18next';
import { trackEvent } from '../lib/analytics';

export const PayPalButton = () => {
  const { t } = useTranslation();
  const [donationAmount, setDonationAmount] = useState('5');
  const [customAmount, setCustomAmount] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const currentDonationAmountRef = useRef(donationAmount);

  useEffect(() => {
    currentDonationAmountRef.current = donationAmount;
  }, [donationAmount]);

  const donationOptions = ['5', '10', '20', '50', 'Other'];

  const handleDonationOptionClick = (amount: string) => {
    if (amount === 'Other') {
      setShowCustomInput(true);
      setCustomAmount('');
    } else {
      setDonationAmount(amount);
      setShowCustomInput(false);
    }
  };

  const handleCreateOrder = (data: any, actions: any) => {
    trackEvent('paypal_donate_clicked', { amount: currentDonationAmountRef.current });
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
    <div className="wcpos:bg-gray-50 wcpos:p-6 wcpos:rounded-lg wcpos:space-y-4">
      <h2 className="wcpos:text-2xl wcpos:font-semibold wcpos:m-0">{t('donate')}</h2>

      <div className="wcpos:flex wcpos:flex-wrap wcpos:gap-1">
        {donationOptions.map((amount, index) => (
          <button
            key={index}
            onClick={() => handleDonationOptionClick(amount)}
            className={`wcpos:py-2 wcpos:px-4 wcpos:rounded-md ${
              (showCustomInput && amount === 'Other' && donationAmount !== 'Other') ||
              (!showCustomInput && donationAmount === amount)
                ? 'wcpos:bg-wp-admin-theme-color-darker-10 wcpos:text-white'
                : 'wcpos:bg-gray-200'
            } wcpos:hover:bg-wp-admin-theme-color-darker-20 wcpos:hover:text-white wcpos:focus:outline-none wcpos:focus:ring-2 wcpos:focus:ring-blue-500 wcpos:focus:ring-offset-2`}
          >
            {amount === 'Other' ? t('other') : `$${amount}`}
          </button>
        ))}
      </div>

      {showCustomInput && (
        <input
          type="number"
          value={customAmount || donationAmount}
          onChange={(e) => {
            setDonationAmount(e.target.value);
            setCustomAmount(e.target.value);
          }}
          placeholder={t('enter_donation_amount')}
          className="wcpos:w-full wcpos:py-2 wcpos:px-4 wcpos:border wcpos:border-gray-300 wcpos:rounded-md wcpos:focus:outline-none wcpos:focus:ring-2 wcpos:focus:ring-wp-admin-theme-color-darker-10 wcpos:focus:ring-opacity-50"
        />
      )}

      <PayPalScriptProvider options={{ clientId: 'AVpvTxbmTiVoiv2_XiHWYsme_DG4aUBJoFScTC0cRlorALCQHnw03_IztWZYSNiIaPRz8wkoSF6xIQC4', components: 'buttons', currency: 'USD' }}>
        <PayPalButtons
          fundingSource="paypal"
          style={{ layout: 'vertical', label: 'donate' }}
          disabled={false}
          createOrder={handleCreateOrder}
          onApprove={(data, actions) => {
            return actions!.order!.capture().then(() => {
              alert(t('donation_successful'));
            });
          }}
        />
      </PayPalScriptProvider>
    </div>
  );
};
