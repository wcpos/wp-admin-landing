import * as React from 'react';

import { createRoot, render } from '@wordpress/element';
import { ErrorBoundary } from 'react-error-boundary';

import Error from './components/error';
import { Hero } from './components/hero';
import { Pro } from './components/pro';

import './index.css';

const App = () => {
	return (
		<div className="wcpos-w-full wcpos-py-4">
			<div className="wcpos-mx-auto wcpos-grid wcpos-gap-8 lg:wcpos-max-w-6xl lg:wcpos-grid-cols-12 lg:wcpos-px-6">
				<div className="wcpos-grid wcpos-gap-4 lg:wcpos-col-span-8 lg:wcpos-gap-2">
					<Hero />
				</div>
				<div className="lg:wcpos-col-span-4">
					<Pro />
				</div>
			</div>
		</div>
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
