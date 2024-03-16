import * as React from 'react';

import { createRoot, render } from '@wordpress/element';
import { ErrorBoundary } from 'react-error-boundary';

import Error from './components/error';

import './index.css';

const App = () => {
	return (
		<h1>Hello World!</h1>
	);
};

const Root = () => {
	return (
		<ErrorBoundary FallbackComponent={Error}>
			<App />
		</ErrorBoundary>
	);
};

const el = document.getElementById('woocommerce-pos-upgrade');

if (createRoot) {
	createRoot(el).render(<Root />);
} else {
	render(<Root />, el);
}
