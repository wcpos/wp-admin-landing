// src/variants/jobs/index.tsx
import '../../index.css';
import './jobs.css';
import { createRoot, render } from '@wordpress/element';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { ErrorBoundary } from 'react-error-boundary';
import { readRuntime } from '../../shared/runtime';
import { Awning } from '../../shared/components/awning';
import { Buy, Enough, NS, Review } from './side';
import { Questions } from './rows';
import en from '../../translations/en/wp-admin-landing-jobs.json';

const Page = () => {
  const { t } = useTranslation(NS);
  const { INSTALL_COUNT, FIRST_RELEASE } = readRuntime().constants;
  const proActive = !!readRuntime().getLandingData()?.pro_active;
  const p = proActive ? '_pro' : '';
  return (
    <div className="jobs-page">
      <Awning />
      <div className="jobs-body">
        <header className="jobs-head">
          <p className="jobs-myplan">
            <b>{t(proActive ? 'marker_pro' : 'marker_free')}</b>
            <span>{t('proof', { installs: INSTALL_COUNT, year: FIRST_RELEASE.getUTCFullYear() })}</span>
          </p>
          <h1>{t(`headline${p}`)}</h1>
          <p className="jobs-sub"><b>{t(`sub_lead${p}`)}</b> {t('sub_body')}</p>
        </header>
        <Questions proActive={proActive} />
        <div className="jobs-side">
          <Buy location="jobs_card" proActive={proActive} />
          <Enough proActive={proActive} />
          <Review />
        </div>
        {!proActive && <Buy location="jobs_closing" />}
      </div>
    </div>
  );
};

/** The error state: what failed, what to do, and the technical message. */
const Failed = ({ message }: { message: string }) => {
  const t = (key: string) => readRuntime().i18next.t(key, { ns: NS });
  return (
    <div className="jobs-page">
      <Awning />
      <div className="jobs-err" role="alert">
        <p className="jobs-err-title">{t('error_title')}</p>
        <p className="jobs-err-next">{t('error_next')}</p>
        <p className="jobs-err-msg">{t('error_details')}<br />{message}</p>
      </div>
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
    <ErrorBoundary
      fallbackRender={({ error }) => <Failed message={error instanceof Error ? error.message : String(error)} />}
      onError={(e) => rt.trackEvent('landing_error', { stage: 'render', message: e.message, variant: rt.variant })}
    >
      <I18nextProvider i18n={rt.i18next}>
        <Page />
      </I18nextProvider>
    </ErrorBoundary>
  );
  if (createRoot) createRoot(el).render(tree); else render(tree, el);
  rt.signalRendered();
}

void mount();
