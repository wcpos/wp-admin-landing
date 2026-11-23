// src/variants/plan/index.tsx
import '../../index.css';
import './plan.css';
import { createRoot, render } from '@wordpress/element';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { ErrorBoundary } from 'react-error-boundary';
import { readRuntime } from '../../shared/runtime';
import { Awning } from '../../shared/components/awning';
import { Buy, NS } from './buy';
import { Header, Plans } from './plans';
import { Reviews, Shots } from './showcase';
import en from '../../translations/en/wp-admin-landing-plan.json';

const Page = () => {
  const { t } = useTranslation(NS);
  const proActive = !!readRuntime().getLandingData()?.pro_active;
  return (
    <div className="plan-page">
      <Awning />
      <Header proActive={proActive} />
      <Plans proActive={proActive} />
      <Shots />
      <Reviews />
      {!proActive && (
        <section className="plan-closing" aria-labelledby="plan-closing-h">
          <h2 id="plan-closing-h">{t('closing_heading')}</h2>
          <Buy location="plan_closing" />
        </section>
      )}
    </div>
  );
};

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
