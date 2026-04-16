# CI-Only Asset Publishing Design

**Date:** 2026-04-16  
**Status:** Proposed / approved in chat  
**Scope:** Replace git-committed CDN assets with CI-built release artifacts while keeping jsDelivr delivery.

---

## 1. Problem statement

The current release flow mixes four different concepts:

1. source code in git
2. generated assets committed back into git by CI
3. GitHub tags used as jsDelivr `/gh/` origins
4. cache-busting query strings that do not actually change the Git ref jsDelivr serves

This created a failure mode where the app on `dev-free.wcpos.com` loaded a floating jsDelivr GitHub alias that resolved to an older tag, even though newer source changes existed locally. Humans should not need to reason about whether the built asset in git is the latest one or whether `@v2` currently resolves to the desired tag.

The new policy is explicit:

- local development never produces or commits release assets
- production assets are built only in GitHub Actions
- built assets are removed from git entirely
- jsDelivr remains the CDN
- releases continue to use a floating major alias (`@2`), but the alias must resolve from CI-published release artifacts rather than git-tagged source trees

---

## 2. Constraints and source-of-truth decision

### 2.1 Why jsDelivr `/gh/` must be replaced

jsDelivr GitHub URLs (`/gh/user/repo@version/file`) serve files from GitHub tags, commits, or branches. If built assets are removed from git, `/gh/` no longer has anything to serve for `assets/js/welcome.js` and `assets/css/welcome.css`.

Therefore the current URL pattern cannot coexist with the new policy.

### 2.2 New source of truth

The CDN source of truth becomes a public npm package published by CI.

The plugin will load:

- `https://cdn.jsdelivr.net/npm/@wcpos/wp-admin-landing@2/assets/js/welcome.js`
- `https://cdn.jsdelivr.net/npm/@wcpos/wp-admin-landing@2/assets/css/welcome.css`

This preserves all desired behavior:

- still uses jsDelivr
- still uses floating major alias `@2`
- does not require built assets in git
- makes CI publication the only path by which a production asset becomes publicly loadable

---

## 3. Release architecture

### 3.1 Local development

Local development remains source-only.

Allowed local commands:

- `npm run dev`
- `npm run typecheck`
- tests/linting/verification commands

Disallowed local workflow assumptions:

- developers should not rely on local release-build commands as the source of deployable production artifacts
- developers should not commit generated `assets/` output
- repo checks should not fail because generated assets are not committed

The repo exposes `npm run build:release` for CI and controlled local verification only, but the output remains disposable and untracked.

### 3.2 CI release pipeline

On push to `main`, GitHub Actions will:

1. install dependencies
2. run quality gates (`typecheck`, plus any existing/future tests)
3. determine whether release-relevant files changed
4. build production assets in a clean runner
5. stage a publishable npm package that contains only the required CDN files and package metadata
6. calculate the next semver tag
7. publish the package to npm with the same version
8. create the matching GitHub tag and release for traceability
9. optionally purge jsDelivr alias URLs so `@2` updates immediately instead of waiting for alias cache expiry

No step will commit generated assets back to `main`.

### 3.3 Release-relevant file set

A release should trigger when any input to the final asset bundle changes, including:

- `src/**`
- `vite.config.ts`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- CSS imported from source tree
- scripts that affect versioning or packaging

Documentation-only and unrelated repo changes should not publish a new npm release.

---

## 4. Package publishing model

### 4.1 Package contents

The published npm tarball should contain only what jsDelivr needs to serve the landing page assets reliably:

- `assets/js/welcome.js`
- `assets/css/welcome.css`
- `package.json`

The verifier (`scripts/verify-release-package.mjs`) enforces this exact list — no source code, docs, legacy assets, CI-only files, or additional metadata like `README.md` / `LICENSE` are accepted.

### 4.2 Versioning

The package version must match the GitHub release tag exactly.

Example:

- npm version: `2.0.3`
- GitHub tag: `v2.0.3`
- jsDelivr floating alias consumed by the plugin: `@2`

This keeps one canonical release number while preserving the convenience of the floating major alias.

### 4.3 Publishing mechanics

Because built assets are generated during CI, the workflow should publish from a temporary staging directory instead of publishing the whole repository root.

That staging directory will be assembled after `npm run build:release` and will contain:

- the built `assets/` tree
- a minimal publish-specific `package.json` with the computed version
- any package metadata needed by npm

This avoids committing built files while also avoiding accidental publication of source-only repo contents.

---

## 5. Repository changes

### 5.1 Remove tracked generated assets

Remove generated release assets from git entirely, including current tracked output under:

- `assets/js/welcome.js`
- `assets/css/welcome.css`

Any obsolete legacy generated assets that only exist for historical release automation should also be evaluated and removed if they are no longer part of the shipped product.

### 5.2 Ignore generated output locally

Ensure generated build output remains ignored in git so local experimental builds never pollute working trees.

If the repo still needs a local `assets/` directory for non-generated checked-in files, only the generated release files should be ignored explicitly. If the entire `assets/` tree is generated, ignore the whole tree.

### 5.3 Remove asset-sync checks

Delete or replace all logic that assumes built files must be committed:

- remove `scripts/check-generated-assets.sh`
- remove `check:assets` from `package.json`
- remove any CI step that commits or pushes generated assets back to the repository
- redefine `npm run ci` to mean source verification only

---

## 6. GitHub Actions changes

### 6.1 Quality workflow behavior

Pull requests should validate source changes without attempting release publication.

Pushes to `main` should validate source changes first, then publish if release-relevant inputs changed.

### 6.2 Release workflow behavior

The release job will replace `release-cdn-tag` with a true CI-only publish pipeline:

- no generated-asset commit-back step
- build once in CI
- compute next version
- publish to npm
- create GitHub release/tag
- surface published URLs in workflow logs/release notes

### 6.3 Secrets and permissions

The workflow will require:

- npm publish credentials (`NPM_TOKEN`)
- GitHub `contents: write` for tag/release creation
- optional jsDelivr purge credentials or approved purge integration if immediate alias refresh is required

### 6.4 Cache refresh

jsDelivr version aliases are cached and may otherwise lag after a new publish. The release workflow should attempt to purge the floating npm alias URLs used by the plugin, specifically:

- `https://cdn.jsdelivr.net/npm/@wcpos/wp-admin-landing@2/assets/js/welcome.js`
- `https://cdn.jsdelivr.net/npm/@wcpos/wp-admin-landing@2/assets/css/welcome.css`

If automated purge is not yet available for this project, the workflow must at minimum log a clear post-release instruction noting that alias refresh can lag and that purge access must be configured. The intended end state is automatic purge.

---

## 7. Consumer-facing URL changes

Any documented or shipped URL that currently points at jsDelivr GitHub endpoints must move to npm endpoints.

Old pattern:

- `https://cdn.jsdelivr.net/gh/wcpos/wp-admin-landing@v2/assets/js/welcome.js`

New pattern:

- `https://cdn.jsdelivr.net/npm/@wcpos/wp-admin-landing@2/assets/js/welcome.js`

Same for CSS.

Any internal documentation that still tells maintainers to reason about `@v2` GitHub tags should be updated to describe npm publication and jsDelivr npm aliases instead.

---

## 8. Failure handling

### 8.1 Build failure

If the production build fails, release publication must stop. No tag or npm version should be created.

### 8.2 npm publish failure

If npm publish fails, GitHub tag/release creation must also stop so version history does not claim a release that jsDelivr cannot serve.

### 8.3 Tag/release failure after npm publish

If npm publish succeeds but GitHub tag/release creation fails, the workflow should fail loudly and operators should repair the GitHub release state using the already-published package version. This is acceptable because npm/jsDelivr is the delivery path and GitHub releases are traceability metadata.

### 8.4 Duplicate version collision

The workflow must detect and avoid attempting to publish an already-existing npm version. If the computed version already exists, the job should fail with a clear message rather than partially succeeding.

---

## 9. Verification strategy

### 9.1 Repository-level verification

Before merge:

- typecheck passes
- workflow syntax validates
- package staging logic produces a tarball/package with only the intended files

### 9.2 Release-level verification

After publish:

- exact npm version URL returns the new `welcome.js`
- floating `@2` URL resolves to the new version
- downloaded CDN asset contains newly added markers from the source change being released
- GitHub release tag matches npm version

### 9.3 Regression check for the original failure

A release verification step should explicitly confirm that the publicly served floating jsDelivr URL contains a known string from the current release (for example a version marker or another deterministic release identifier) so we never again assume the CDN matches source without checking.

---

## 10. Out of scope

This change does not redesign:

- the app’s runtime analytics behavior
- PostHog infra behavior
- translation CDN strategy
- how the plugin decides which major alias (`@2`, `@3`, etc.) to consume

It only changes how release assets are built, published, and served.

---

## 11. Final design decision

Adopt a CI-only asset publication model backed by npm + jsDelivr npm aliases.

That means:

- generated release assets are removed from git
- GitHub Actions is the only producer of deployable assets
- jsDelivr GitHub URLs are replaced by jsDelivr npm URLs
- the plugin continues using a floating major alias
- release tags remain for traceability, but npm publication becomes the true CDN origin

This is the smallest design that satisfies the new policy and eliminates the “which built asset is actually live?” confusion.
