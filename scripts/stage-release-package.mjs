import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_PACKAGE_NAME = '@wcpos/wp-admin-landing';
const SOURCE_ASSET_PATHS = ['js/welcome.js', 'css/welcome.css'];

async function pathExists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function resolveAssetsRoot(buildDir) {
  const directAssetsRoot = buildDir;
  const nestedAssetsRoot = path.join(buildDir, 'assets');

  if (await pathExists(path.join(directAssetsRoot, 'js/welcome.js'))) {
    return directAssetsRoot;
  }

  if (await pathExists(path.join(nestedAssetsRoot, 'js/welcome.js'))) {
    return nestedAssetsRoot;
  }

  throw new Error(`Missing required build output: ${path.join(buildDir, 'js/welcome.js')}`);
}

async function copyAsset(assetsRoot, outputRoot, relativeAssetPath) {
  const source = path.join(assetsRoot, relativeAssetPath);
  const destination = path.join(outputRoot, 'assets', relativeAssetPath);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.copyFile(source, destination);
}

export async function stageReleasePackage({
  buildDir,
  outputDir,
  version,
  packageName = DEFAULT_PACKAGE_NAME,
}) {
  if (!buildDir || !outputDir || !version) {
    throw new Error('buildDir, outputDir, and version are required');
  }

  const assetsRoot = await resolveAssetsRoot(buildDir);

  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });

  for (const relativeAssetPath of SOURCE_ASSET_PATHS) {
    await copyAsset(assetsRoot, outputDir, relativeAssetPath);
  }

  const pkg = {
    name: packageName,
    version,
    files: ['assets'],
    publishConfig: {
      access: 'public',
    },
  };

  await fs.writeFile(path.join(outputDir, 'package.json'), `${JSON.stringify(pkg, null, 2)}\n`);

  return {
    outputDir,
    files: ['package.json', ...SOURCE_ASSET_PATHS.map((file) => `assets/${file}`)],
  };
}

function isCliEntry() {
  const entryPath = process.argv[1];
  return entryPath && fileURLToPath(import.meta.url) === path.resolve(entryPath);
}

if (isCliEntry()) {
  const [buildDir, outputDir, version, packageName = DEFAULT_PACKAGE_NAME] = process.argv.slice(2);
  stageReleasePackage({ buildDir, outputDir, version, packageName }).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
