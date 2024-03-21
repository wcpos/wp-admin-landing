import * as React from 'react';

export const Button = ({ href, children, target }) => {
  return (
    <a
      className="wcpos-w-full wcpos-inline-flex wcpos-h-10 wcpos-items-center wcpos-justify-center wcpos-rounded-md wcpos-bg-wp-admin-theme-color-darker-10 wcpos-px-8 wcpos-text-sm wcpos-font-medium wcpos-text-gray-50 hover:wcpos-text-gray-50 shadow wcpos-transition-colors hover:wcpos-bg-wp-admin-theme-color-darker-20 focus-visible:wcpos-outline-none focus-visible:wcpos-ring-1 focus-visible:wcpos-ring-gray-950 wcpos-no-underline"
      href={href}
      target={target}
      rel={target = '_blank' && 'noopener noreferrer'}
    >
      {children}
    </a>
  )
}
