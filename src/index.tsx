import { createRoot, render } from '@wordpress/element';
import { ErrorBoundary } from 'react-error-boundary';

import Error from './components/error';
import { Hero } from './components/hero';
import { Pro } from './components/pro';
import { PayPalButton } from './components/paypal-button';
import { Review } from './components/review';
import { HireMe } from './components/hire-me';
import { initAnalytics } from './lib/analytics';
import { initI18n } from './lib/i18n';
import { reportProfile } from './lib/profile-report';

import './index.css';

// Initialize analytics (always runs GA + PostHog; profile enrichment only with consent)
initAnalytics();
initI18n();
// Report store profile to updates-server (fire-and-forget)
reportProfile();

const App = () => {
	return (
		<div className="wcpos:w-full wcpos:py-4">
			<div className="wcpos:mx-auto wcpos:grid wcpos:gap-8 wcpos:lg:max-w-6xl wcpos:lg:grid-cols-12 wcpos:lg:px-6">
				<div className="wcpos:grid wcpos:gap-4 wcpos:lg:col-span-8 wcpos:lg:gap-2">
					<Hero />
				</div>
				<div className="wcpos:lg:col-span-4">
					<div className="wcpos:grid wcpos:gap-4">
						<Pro />
						<PayPalButton />
						<Review />
						<HireMe />
					</div>
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

if (el) {
	if (createRoot) {
		createRoot(el).render(<Root />);
	} else {
		render(<Root />, el);
	}
}
