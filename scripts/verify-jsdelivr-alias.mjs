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
  const bodies = {};

  for (const [label, url] of Object.entries(urls)) {
    const response = await fetchImpl(url, { redirect: 'follow' });
    if (!response.ok) {
      throw new Error(`jsDelivr verification failed for ${label}: ${response.status} ${url}`);
    }
    bodies[label] = await response.text();
  }

  // Status codes alone can't catch the original failure mode where `@2`
  // silently served an older package version. Per the release design spec
  // (§9.3), confirm the floating alias resolves to the exact-version body.
  if (bodies.aliasJs !== bodies.exactJs) {
    throw new Error(
      `jsDelivr alias JS does not match published version ${version} (${urls.aliasJs} vs ${urls.exactJs})`,
    );
  }
  if (bodies.aliasCss !== bodies.exactCss) {
    throw new Error(
      `jsDelivr alias CSS does not match published version ${version} (${urls.aliasCss} vs ${urls.exactCss})`,
    );
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
