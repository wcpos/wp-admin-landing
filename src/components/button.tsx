import { ReactNode } from 'react';

interface ButtonProps {
  href: string;
  children: ReactNode;
  target?: string;
  onClick?: () => void;
}

export const Button = ({ href, children, target, onClick }: ButtonProps) => {
  return (
    <a
      className="wcpos:w-full wcpos:inline-flex wcpos:h-10 wcpos:items-center wcpos:justify-center wcpos:rounded-md wcpos:bg-wp-admin-theme-color-darker-10 wcpos:px-8 wcpos:text-sm wcpos:font-medium wcpos:text-gray-50 wcpos:hover:text-gray-50 wcpos:shadow wcpos:transition-colors wcpos:hover:bg-wp-admin-theme-color-darker-20 wcpos:focus-visible:outline-none wcpos:focus-visible:ring-1 wcpos:focus-visible:ring-gray-950 wcpos:no-underline"
      href={href}
      target={target}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      onClick={onClick}
    >
      {children}
    </a>
  );
};
