// src/variants/indie/index.tsx
import '../../index.css';
import { createRoot, render } from '@wordpress/element';
import { I18nextProvider } from 'react-i18next';
import { ErrorBoundary } from 'react-error-boundary';
import { readRuntime } from '../../shared/runtime';
import { Awning } from '../../shared/components/awning';
import { ProofChip } from '../../shared/components/proof-chip';
import { ReviewsStrip } from '../../shared/components/reviews-strip';
import { RoadmapCard } from '../../shared/components/roadmap-card';
import { Letter } from './letter';
import en from '../../translations/en/wp-admin-landing-indie.json';

const NS = 'wp-admin-landing-indie';

const Page = () => (
  <div className="wcpos:overflow-hidden wcpos:rounded-lg wcpos:bg-white">
    <Awning />
    <div className="wcpos:bg-gradient-to-b wcpos:from-[#fdfdfc] wcpos:to-[#f6f5f2] wcpos:p-8 lg:wcpos:p-12">
      <div className="wcpos:grid wcpos:items-start wcpos:gap-10 lg:wcpos:grid-cols-[1.25fr_.85fr]">
        <Letter />
        <div className="wcpos:flex wcpos:flex-col wcpos:gap-5">
          <RoadmapCard />
          <ProofChip />
        </div>
      </div>
    </div>
    <ReviewsStrip />
  </div>
);

async function mount(): Promise<void> {
  const rt = readRuntime();
  // §3.1.3 amendment: inline to avoid pulling i18next backends into the variant chunk
  rt.i18next.addResourceBundle('en_US', NS, en as Record<string, string>, true, false);
  await rt.i18next.loadNamespaces(NS);
  const el = document.getElementById('woocommerce-pos-upgrade');
  if (!el) return;
  const tree = (
    <ErrorBoundary fallbackRender={() => null} onError={(e) => rt.trackEvent('landing_error', { stage: 'render', message: e.message, variant: rt.variant })}>
      <I18nextProvider i18n={rt.i18next}>
        <Page />
      </I18nextProvider>
    </ErrorBoundary>
  );
  if (createRoot) createRoot(el).render(tree); else render(tree, el);
  rt.signalRendered();
}

void mount();
