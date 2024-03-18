import * as React from 'react';

export const Badge = ({ children }) => {
  return (
    <div className="wcpos-inline-block wcpos-rounded-lg wcpos-bg-gray-300 wcpos-px-3 wcpos-py-1 wcpos-text-sm">
      {children}
    </div>
  )
}
