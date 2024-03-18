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
        If you find WooCommerce POS useful, and can afford it, please consider supporting the project with a Pro license.
      </p >
    </div >
  )
}


