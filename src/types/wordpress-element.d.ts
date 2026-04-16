declare module '@wordpress/element' {
  import type { ReactNode } from 'react';
  import type { Root } from 'react-dom/client';

  export const createRoot: ((container: Element | DocumentFragment) => Root) | undefined;
  export function render(node: ReactNode, container: Element | DocumentFragment): void;
}
