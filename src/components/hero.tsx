import * as React from 'react';

import { Badge } from './badge';

export const Hero = () => {
  return (
    <div className="wcpos-space-y-2 lg:wcpos-space-y-4">
      <Badge>Support the project</Badge>
      <p className="wcpos-text-3xl wcpos-font-bold lg:wcpos-text-4xl">WooCommerce POS needs your help!</p>
      <p className="wcpos-max-w-[900px] wcpos-text-xl wcpos-leading-8">
        WooCommerce POS is the only free and open source Point of Sale plugin for WooCommerce.
        We believe in creating a high quality product that is accessible to everyone.
        However, it requires many thousands of hours for development and support.
        It's a big project and it needs your help to keep it going.
      </p>
      <p className="wcpos-max-w-[900px] wcpos-text-base">There are several ways you can help support the project:</p>
      <ul className="wcpos-max-w-[900px] wcpos-text-base">
        <li>
          <span className="wcpos-text-2xl wcpos-mr-2">🚀</span>
          <strong>Upgrade to Pro:</strong><br />
          <span className='wcpos-text-gray-600'>Unlock advanced features and get premium support by upgrading to the Pro version. This is one of the best ways to support the project and ensure its ongoing development and improvement.</span></li>
        <li>
          <span className="wcpos-text-2xl wcpos-mr-2">💖</span>
          <strong>Donate:</strong><br />
          <span className='wcpos-text-gray-600'>If you love using WooCommerce POS and want to support the project financially, consider making a donation. Every little bit helps us continue development and provide support to users.</span></li>
        <li>
          <span className="wcpos-text-2xl wcpos-mr-2">✍️</span>
          <strong>Leave a review:</strong><br />
          <span className='wcpos-text-gray-600'>Share your experience with WooCommerce POS by leaving a review on WordPress.org. Positive reviews help increase the visibility of the plugin and encourage more users to try it out.</span></li>
        <li>
          <span className="wcpos-text-2xl wcpos-mr-2">👩‍💻</span>
          <strong>Hire me for contract work:</strong><br />
          <span className='wcpos-text-gray-600'>If you have custom requirements or need expert assistance with your WooCommerce store, consider hiring me for contract work. Not only will you get tailored solutions for your needs, but you'll also be supporting the WooCommerce POS project directly.</span></li>
      </ul >
      <p className="wcpos-max-w-[900px] wcpos-text-base">Your support is crucial for the continued development and improvement of WooCommerce POS. Thank you for considering these options to help sustain this project.</p>
    </div >
  )
}


