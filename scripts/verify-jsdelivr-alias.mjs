import { fileURLToPath } from 'node:url';
import path from 'node:path';

export function buildJsDelivrUrls({ packageName = '@wcpos/wp-admin-landing', majorAlias = '2', version }) {
  if (!version) {
    throw new Error('version is required');
  }

  const base = `https://cdn.jsdelivr.net/npm/${packageName}`;

  return {
    exactJs: `${base}@${version}/assets/js/welcome.js`,
    exactCss: `${base}@${version}/assets/css/welcome.css`,
    aliasJs: `${base}@${majorAlias}/assets/js/welcome.js`,
    aliasCss: `${base}@${majorAlias}/assets/css/welcome.css`,
  };
}

export async function verifyJsDelivrAlias({ fetchImpl = fetch, packageName, majorAlias = '2', version }) {
  const urls = buildJsDelivrUrls({ packageName, majorAlias, version });

  for (const [label, url] of Object.entries(urls)) {
    const response = await fetchImpl(url, { redirect: 'follow' });
    if (!response.ok) {
      throw new Error(`jsDelivr verification failed for ${label}: ${response.status} ${url}`);
    }
  }

  return urls;
}

function isCliEntry() {
  const entryPath = process.argv[1];
  return entryPath && fileURLToPath(import.meta.url) === path.resolve(entryPath);
}

if (isCliEntry()) {
  const [version, majorAlias = '2', packageName = '@wcpos/wp-admin-landing'] = process.argv.slice(2);
  verifyJsDelivrAlias({ version, majorAlias, packageName }).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
