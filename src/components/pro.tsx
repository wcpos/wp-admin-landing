import * as React from 'react';

import { Badge } from './badge';

export const Pro = () => {
  return (
    <div className="wcpos-grid wcpos-gap-4">
      <div className="wcpos-bg-gray-50 wcpos-p-6 wcpos-rounded-lg">
        {/* <Badge>How you can help</Badge> */}

        <h2 className="wcpos-text-2xl wcpos-font-semibold wcpos-m-0">Upgrade to Pro</h2>
        <p className="wcpos-text-gray-500">
          <ul className="wcpos-list-disc wcpos-pl-6">
            <li>Use any WooCommerce gateway</li>
            <li>Create multiple POS Stores</li>
            <li>Analytics for POS and Online sales</li>
            <li>Priority Discord support within 1 hour</li>
          </ul>
        </p>

        <a
          className="wcpos-w-full wcpos-inline-flex wcpos-h-10 wcpos-items-center wcpos-justify-center wcpos-rounded-md wcpos-bg-wp-admin-theme-color-darker-10 wcpos-px-8 wcpos-text-sm wcpos-font-medium wcpos-text-gray-50 hover:wcpos-text-gray-50 shadow wcpos-transition-colors hover:wcpos-bg-wp-admin-theme-color-darker-20 focus-visible:wcpos-outline-none focus-visible:wcpos-ring-1 focus-visible:wcpos-ring-gray-950 wcpos-no-underline"
          href="https://wcpos.com/pro"
        >
          Upgrade to Pro
        </a>
      </div>
    </div>
  )
}
