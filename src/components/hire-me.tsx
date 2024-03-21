import * as React from 'react';

import { Button } from './button';

export const HireMe = () => {
  return (
    <div className="wcpos-bg-gray-50 wcpos-p-6 wcpos-rounded-lg">
      {/* <Badge>How you can help</Badge> */}

      <h2 className="wcpos-text-2xl wcpos-font-semibold wcpos-m-0">Hire me!</h2>

      <p>I am available for Contract Work:</p>

      <ul className="wcpos-list-disc wcpos-pl-6">
        <li>Advanced knowledge in WordPress & WooCommerce (over 10 years experience)</li>
        <li>Proficient in React and React Native for modern web applications</li>
        <li>Expertise in custom plugin and block development (eg: Gutenberg)</li>
      </ul>

      Email <a href="mailto:paul@wcpos.com">paul@wcpos.com</a> with your project.
    </div>
  )
}
