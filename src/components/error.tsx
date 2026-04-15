import { Trans } from 'react-i18next';
import { FallbackProps } from 'react-error-boundary';

import Notice from './notice';

const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  const message = error?.message ?? 'Unknown error';

  return (
    <div className="wcpos:p-4">
      <Notice status="error" onRemove={resetErrorBoundary}>
        <p>
          <Trans i18nKey="error_something_wrong" values={{ message }}>
            Something went wrong: <code>{message}</code>
          </Trans>
        </p>
      </Notice>
    </div>
  );
};

export default ErrorFallback;
