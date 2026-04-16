import { execSync } from 'node:child_process';

const bump = process.argv[2] ?? 'patch';
const validBumps = new Set(['patch', 'minor', 'major']);

if (!validBumps.has(bump)) {
  console.error(`Unsupported bump type: ${bump}`);
  process.exit(1);
}

const latestTag = execSync("git tag --list 'v*' --sort=-version:refname", {
  encoding: 'utf8',
})
  .split('\n')
  .map((tag) => tag.trim())
  .find((tag) => /^v\d+\.\d+\.\d+$/.test(tag));

const [, major = '0', minor = '0', patch = '0'] = (latestTag ?? 'v0.0.0').match(
  /^v(\d+)\.(\d+)\.(\d+)$/,
) ?? [];

let nextMajor = Number(major);
let nextMinor = Number(minor);
let nextPatch = Number(patch);

switch (bump) {
  case 'major':
    nextMajor += 1;
    nextMinor = 0;
    nextPatch = 0;
    break;
  case 'minor':
    nextMinor += 1;
    nextPatch = 0;
    break;
  case 'patch':
    nextPatch += 1;
    break;
}

process.stdout.write(`v${nextMajor}.${nextMinor}.${nextPatch}`);
