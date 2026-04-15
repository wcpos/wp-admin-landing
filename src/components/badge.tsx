import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
}

export const Badge = ({ children }: BadgeProps) => {
  return (
    <div className="wcpos:inline-block wcpos:rounded-lg wcpos:bg-gray-300 wcpos:px-3 wcpos:py-1 wcpos:text-sm">
      {children}
    </div>
  );
};
