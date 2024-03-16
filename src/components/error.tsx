import * as React from 'react';

import { get } from 'lodash';
import { FallbackProps } from 'react-error-boundary';

import Notice from './notice';

const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
	const message = get(error, 'message', 'Unknown error');

	return (
		<div className="wcpos-p-4">
			<Notice status="error" onRemove={resetErrorBoundary}>
				<p>
					Something went wrong: <code>{message}</code>
				</p>
			</Notice>
		</div>
	);
};

export default ErrorFallback;
