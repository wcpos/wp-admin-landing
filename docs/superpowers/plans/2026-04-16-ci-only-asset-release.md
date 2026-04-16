# CI-Only Asset Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make GitHub Actions the only producer of shipped `welcome.js` / `welcome.css`, publish them through npm for jsDelivr consumption, and stop committing generated welcome assets back into git.

**Architecture:** Move CDN delivery from jsDelivr GitHub refs to jsDelivr npm refs. Keep source-only development in git, add tested release helper scripts for publish decisions and staging, and rework the release workflow so CI builds, publishes, tags, and verifies without committing generated output.

**Tech Stack:** GitHub Actions, Node 20, Vite, npm publish, jsDelivr, node:test

---

## File map

- **Modify:** `package.json` — remove committed-asset checks, add tested release/staging scripts
- **Modify:** `.github/workflows/ci.yml` — replace commit-back release flow with npm publish + release verification
- **Modify:** `.gitignore` — ensure generated welcome outputs are ignored locally
- **Modify:** `scripts/next-release-tag.mjs` — optionally extend/reuse for version calculation
- **Create:** `scripts/release-should-publish.mjs` — determine if changed files require a release
- **Create:** `scripts/stage-release-package.mjs` — assemble minimal npm package with built assets
- **Create:** `scripts/verify-release-package.mjs` — assert staged package contents are exactly what CDN should serve
- **Create:** `scripts/verify-jsdelivr-alias.mjs` — verify exact version and `@2` jsDelivr URLs after publish
- **Create:** `tests/scripts/*.test.mjs` — regression tests for release helper behavior
- **Delete:** `scripts/check-generated-assets.sh`
- **Delete:** `assets/js/welcome.js`
- **Delete:** `assets/css/welcome.css`
- **Modify:** docs/specs that still describe `/gh/` welcome asset delivery

---

### Task 1: Add failing tests for release helpers

**Files:**
- Create: `tests/scripts/release-should-publish.test.mjs`
- Create: `tests/scripts/stage-release-package.test.mjs`
- Create: `tests/scripts/verify-release-package.test.mjs`

- [ ] **Step 1: Write failing tests for publish-decision logic**
- [ ] **Step 2: Run `node --test tests/scripts/release-should-publish.test.mjs` and confirm failure**
- [ ] **Step 3: Write failing tests for staged npm package contents**
- [ ] **Step 4: Run `node --test tests/scripts/stage-release-package.test.mjs tests/scripts/verify-release-package.test.mjs` and confirm failure**

### Task 2: Implement tested release helper scripts

**Files:**
- Create: `scripts/release-should-publish.mjs`
- Create: `scripts/stage-release-package.mjs`
- Create: `scripts/verify-release-package.mjs`
- Create: `scripts/verify-jsdelivr-alias.mjs`
- Modify: `scripts/next-release-tag.mjs`

- [ ] **Step 1: Implement minimal publish-decision script to detect release-relevant paths**
- [ ] **Step 2: Run the publish-decision tests until green**
- [ ] **Step 3: Implement staging script that copies only `assets/js/welcome.js`, `assets/css/welcome.css`, and package metadata into a temp publish directory**
- [ ] **Step 4: Implement package verification script that fails on extra or missing files**
- [ ] **Step 5: Implement jsDelivr verification script that checks exact and floating npm URLs after release**
- [ ] **Step 6: Run `node --test tests/scripts/*.test.mjs` until green**

### Task 3: Rework package scripts and workflow

**Files:**
- Modify: `package.json`
- Modify: `.github/workflows/ci.yml`
- Delete: `scripts/check-generated-assets.sh`

- [ ] **Step 1: Remove `check:assets` and redefine local `ci` as source verification only**
- [ ] **Step 2: Add CI/release scripts for build, stage, verify, and post-publish verification**
- [ ] **Step 3: Update workflow to stop committing generated assets back to `main`**
- [ ] **Step 4: Update workflow to build, stage, verify, publish to npm, create GitHub release, and verify jsDelivr npm URLs**
- [ ] **Step 5: Run local verification commands that exercise the helper scripts and YAML-adjacent logic**

### Task 4: Remove tracked welcome build outputs and update docs

**Files:**
- Delete: `assets/js/welcome.js`
- Delete: `assets/css/welcome.css`
- Modify: `.gitignore`
- Modify: `docs/superpowers/specs/2026-04-15-phase1-plumbing-design.md`
- Modify: other repo docs that still describe `/gh/` welcome assets

- [ ] **Step 1: Delete tracked welcome build outputs from git**
- [ ] **Step 2: Ignore regenerated welcome outputs locally**
- [ ] **Step 3: Update docs from jsDelivr `/gh/` welcome URLs to jsDelivr `/npm/` welcome URLs**
- [ ] **Step 4: Run repo-wide grep to confirm no stale `/gh/` welcome URLs remain**

### Task 5: Final verification

**Files:**
- Verify only

- [ ] **Step 1: Run `npm run typecheck`**
- [ ] **Step 2: Run `node --test tests/scripts/*.test.mjs`**
- [ ] **Step 3: Run a local dry-run build + stage flow to confirm the publish directory contains only the expected files**
- [ ] **Step 4: Inspect `git diff --stat` to confirm generated welcome assets are removed and workflow logic changed as intended**

