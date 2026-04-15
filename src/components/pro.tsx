import * as React from 'react';
import { trackEvent } from '../lib/analytics';
import { Button } from './button';

export const Pro = () => {
  return (
    <div className="wcpos:bg-gray-50 wcpos:p-6 wcpos:rounded-lg">
      <h2 className="wcpos:text-2xl wcpos:font-semibold wcpos:m-0">Upgrade to Pro</h2>
      <ul className="wcpos:list-disc wcpos:pl-6">
        <li>Use any WooCommerce gateway</li>
        <li>Create multiple POS Stores</li>
        <li>Analytics for POS and Online sales</li>
        <li>Priority Discord support (usually &lt; 1 hour)</li>
      </ul>

      <Button
        href="https://wcpos.com/pro"
        target="_blank"
        onClick={() => trackEvent('upgrade_cta_clicked')}
      >
        Upgrade to Pro
      </Button>
    </div>
  );
};
