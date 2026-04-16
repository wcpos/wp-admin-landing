declare module '@wordpress/element' {
  import type { ReactNode } from 'react';
  import type { Root } from 'react-dom/client';

  export function createRoot(container: Element | DocumentFragment): Root;
  export function render(node: ReactNode, container: Element | DocumentFragment): void;
}
