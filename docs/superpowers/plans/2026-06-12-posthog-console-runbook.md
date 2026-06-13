# PostHog Console Runbook — WCPOS Landing Experiments (ph.wcpos.com)

**For:** Paul, clicking through the self-hosted PostHog console by hand (no API access).
**Scope:** Expands design spec §6.5 into precise click-by-click steps. Companion to `2026-06-12-landing-experiments-design.md` and `2026-06-12-landing-experiments-backlog.md`.
**Authority:** Where this runbook and the shipped code disagree, the **code wins** — every flag key, variant value, payload field, and kill-switch value below is verified against `src/bootstrap/variant-loader.ts`, `src/bootstrap/variant-decision.mjs`, `src/shared/analytics.ts`, and `src/shared/constants.ts` as shipped.

UI labels follow the current self-hosted PostHog UI. Be version-tolerant: where this says "Feature flags → New feature flag", accept a near-synonym ("Create feature flag") if the exact label differs.

### Verified-from-code constants (do not retype from memory)

| Thing | Value | Source |
|---|---|---|
| Variant flag key | `landing-variant` | `variant-loader.ts` `FLAG_KEY` |
| Valid variant values | `indie`, `free-plus` (exact strings) | `VALID_VARIANTS` |
| Fallback / reference variant | `free-plus` | `FALLBACK_VARIANT` |
| Kill-switch flag key | `ops-landing-kill-switch` | `KILL_SWITCH_KEY` |
| Kill-switch "on" values accepted | boolean `true` **or** string `'on'` | `resolveFlag` (`killValue === true || killValue === 'on'`) |
| Compiled-in min `asset_version` | `1` | `constants.ts` `ASSET_VERSION` |
| Payload schema | `{ "asset_version": <number ≥1>, "variants": { "<variant>": { "js": "<url>", "css": "<url>" } } }` | `resolveAssets` |
| CDN base | `https://cdn.jsdelivr.net/gh/wcpos/wp-admin-landing@v2/assets` | `CDN_BASE` |
| free-plus chunk JS | `https://cdn.jsdelivr.net/gh/wcpos/wp-admin-landing@v2/assets/js/variants/free-plus.js` | `VARIANT_ASSETS` |
| free-plus chunk CSS | `https://cdn.jsdelivr.net/gh/wcpos/wp-admin-landing@v2/assets/css/variants/free-plus.css` | `VARIANT_ASSETS` |
| indie chunk JS | `https://cdn.jsdelivr.net/gh/wcpos/wp-admin-landing@v2/assets/js/variants/indie.js` | `VARIANT_ASSETS` |
| indie chunk CSS | `https://cdn.jsdelivr.net/gh/wcpos/wp-admin-landing@v2/assets/css/variants/indie.css` | `VARIANT_ASSETS` |
| PostHog project key | `phc_BhTJzZ7fXMqcD4MiaUJQsQqPkEpu94yoSAthXFBWemvd` | `analytics.ts` |
| Flag-resolve timeout | 500 ms | `resolveFlag` default |
| `analytics_schema_version` | `2` | `constants.ts` (fences pre-fix data) |

Canonical exposure (used everywhere below): **`landing_variant_rendered` where `render_source IN ('flag','cache')`**. `fallback` renders fire the event but are never exposures.

---

## Step 0 — Server capability verification (§6.5.1)

Do this first. The whole program assumes a feature set; if any item is absent, record the fallback and proceed with the degraded path. Nothing here changes data — it is read-only inspection plus one throwaway test flag.

| # | Capability | How to check in the console | Pass = | If ABSENT — fallback |
|---|---|---|---|---|
| 0.1 | **Server version** | Bottom-left menu → **Settings** (or the help/about panel) → note the version string. | Recorded. | n/a — just record it; later rows tell you what the version must support. |
| 0.2 | **Multivariate flags** | Feature flags → New feature flag → look for a **"Multiple variants with rollout percentages"** option (vs boolean only). | Option present. | No multivariate → cannot serve `indie`/`free-plus` from one flag. Fallback: two boolean flags + client mapping is **not** how the code reads it (code reads one multivariate key), so this is a **blocker** — stop and upgrade PostHog. |
| 0.3 | **Flag payloads** | In the same New-feature-flag form, each variant should expose a **"Payload"** field (JSON). | Payload field present per variant. | No payloads → the recommended A/A mechanism (payload chunk-pin, below) is unavailable. Fallback: A/A via a temporary build that points both chunk files at identical bytes, OR ship the A/A as "free-plus at 100% under the real flag" and validate SRM on assignment only. Record which. |
| 0.4 | **Automatic `$feature_flag_called` capture** | Activity/Events explorer → filter event = `$feature_flag_called` after loading any page that resolves a flag. | Event appears automatically (no manual capture). | If not auto-captured, the dual-SRM canary's assignment arm is unavailable. Fallback: rely on `landing_variant_rendered` SRM only; note the canary is single-armed. |
| 0.5 | **Person-property string operators** (`contains` / `icontains` / regex) | Cohorts or Insights → add a person/property filter on `locale` → confirm `contains` is offered. | `contains` available (needed for the English cohort = `locale` contains `en`). | No `contains` → enumerate locales explicitly (`en_US`, `en_GB`, …) in an OR group; record the enumerated list. |
| 0.6 | **HogQL** | Insights → New insight → look for an **SQL**/HogQL insight type. | HogQL editor present. | No HogQL → build the weekly chi-square by hand from two number-tiles (counts per variant) into a spreadsheet; record this. |
| 0.7 | **Experiments product** | Left nav → **Experiments**. | Section present. | Absent → run everything as **plain flags + custom insights/funnels** (this runbook's default — we do **not** use the Experiments product for assignment, because the code resolves the raw flag itself). Absence is acceptable; record it. |
| 0.8 | **Flag experience-continuity** (persist a flag value across identify) | On a flag's edit page, look for **"Persist flag across authentication steps"** (or "experience continuity"). | Toggle present. | Absent → the flag-before-identify rule in `analytics.ts` is the **primary** lock and is sufficient on its own (flag is read while distinct_id = anon_id, never re-read post-identify). Continuity is only a *second* belt. Record absent; no behavioural change. |

**Record-fallbacks table — fill in during Step 0:**

| Capability | Present? (Y/N) | Version / notes | Fallback in effect |
|---|---|---|---|
| Multivariate flags | | | |
| Flag payloads | | | |
| Auto `$feature_flag_called` | | | |
| Person-property string operators | | | |
| HogQL | | | |
| Experiments product | | | |
| Flag experience-continuity | | | |

---

## 1. Project hygiene (§5.1)

Server-side belt to match the client-side `before_send` URL stripping in `analytics.ts`. Anonymous tier carries no precise geo/IP.

1. **Settings → Project → "Discard client IP data"** (a.k.a. *Anonymize IPs*): **enable**. Why: anon tier must not retain caller IP; client already strips `$current_url`/`$host`/`$pathname`/`$referrer`/`$referring_domain`, this closes the IP side.
2. **Settings → Project → GeoIP**: **disable GeoIP enrichment**. Why: `$geoip_*` properties are derived from IP; with anon traffic they are unwanted PII and would defeat the IP discard. (If the toggle is global-only and you later need coarse country, prefer the consented `wc_country` person-property from `identifyConsented()` instead — never GeoIP.)
3. Confirm **session recording is off** at project level too (client sets `disable_session_recording: true`; belt-and-braces).

---

## 2. Feature flags

> **Launch posture for the whole section: flags are CREATED but the experiment is NOT launched.** Set the release conditions described, then leave each experiment flag **disabled** (preferred) — see §2.5 for exactly why disabled is safe and 0% is not.

### 2.1 `landing-variant` — the variant flag (created in A/A configuration first)

This is the single multivariate flag the bootstrap actually reads (`FLAG_KEY = 'landing-variant'`). It serves the parent test later; for now it is created in **A/A configuration** per design §6.2 #0.

**Create it:**

1. Feature flags → **New feature flag**.
2. **Key:** `landing-variant` (exact).
3. **Flag type / served value:** choose **multiple variants** (multivariate).
4. **Variants** (keys must be byte-exact — the code does `VALID_VARIANTS.includes(flagValue)`):

   | Variant key | Rollout % |
   |---|---|
   | `indie` | 50 |
   | `free-plus` | 50 |

   No control/test/extra keys. Any value not in {`indie`,`free-plus`} makes the bootstrap fall through to cache→fallback, which silently de-powers the test.
5. **Release conditions:** one condition group, **rollout 100% of users** matching the group, where the group is *"person property `pro_active` is not `true`"* if you choose to gate server-side. Note the client already excludes `pro_active:true` from exposure and denominators (`analytics.ts` registers `pro_active`; `decideVariant` forces fallback when `proActive`), so server-side gating here is optional defence-in-depth, not required. Keep it simple: 100% of all users, rely on the client exclusion. Document whichever you pick.
6. **Leave the flag DISABLED for now** (§2.5).

#### 2.1.1 The A/A mechanism — RECOMMENDED: payload chunk-pin (read this; the decision is made here)

**Problem.** Design §6.2 #0 calls for "`landing-variant` (A/A config) — both multivariate values point at identical render output." But our two real variants render *different* pages, and the backlog lists a separate `exp-202606-all-aa` flag. These cannot both be taken literally:

- The shipped bootstrap reads **only** `landing-variant`. A separate `exp-202606-all-aa` flag would **not** affect rendering at all — nothing in the code resolves it. So a standalone A/A flag would validate nothing about the real delivery path.
- Setting `landing-variant` to 100% `free-plus` would give identical output but **kills the 50/50 assignment mechanics** we need to validate (SRM, stickiness, dedup, the consent-transition merge all need two buckets actually being assigned).

**Recommended A/A mechanism (what to do):** keep `landing-variant` at a real **50/50 `indie`/`free-plus`** split so assignment, `$feature_flag_called`, the cache round-trip, and the pre/post-identify lock all run **for real** — then use the **flag payload** to pin *both* variant values' chunk URLs to the **free-plus** chunk, so the rendered output is byte-identical regardless of which bucket a site lands in. This exercises the production flag, the payload-override path (`resolveAssets`), and the fallback map — exactly the three things §6.2 #0 says must be validated — while serving one page to everyone.

Rationale, point by point:
- `resolveAssets(variant, payload, …)` looks up `payload.variants[variant].{js,css}`. If we set **both** `indie` and `free-plus` entries to the free-plus chunk, every assigned site loads the free-plus bundle — identical render, zero visual A/A confound.
- It requires `asset_version` (a number) **≥ `ASSET_VERSION` = 1**, else the payload is rejected and the hardcoded per-variant map is used (which *would* render two different pages). So the payload must carry `"asset_version": 1`.
- Assignment still happens against the real 50/50 split; `$feature_flag_called` fires with the real `indie`/`free-plus` value; SRM is computed on the genuine buckets. The render is identical; the *assignment* is not — which is the whole point of an A/A.
- This reconciles the spec and the backlog: the operationally correct artifact is **`landing-variant` with an A/A payload**, not a standalone `exp-202606-all-aa` flag. If you still want the `exp-202606-all-aa` key to exist for bookkeeping/registry parity, create it as a disabled boolean placeholder and note in its description "tracking only — does not drive rendering; the real A/A is the landing-variant payload pin." Do not rely on it for any read.

**The exact payload to enter.** In the `landing-variant` flag, set **the same payload on BOTH variants** (PostHog payloads are per-variant; enter this identical JSON under `indie` and under `free-plus` so the pin holds no matter which bucket resolves):

```json
{
  "asset_version": 1,
  "variants": {
    "indie": {
      "js": "https://cdn.jsdelivr.net/gh/wcpos/wp-admin-landing@v2/assets/js/variants/free-plus.js",
      "css": "https://cdn.jsdelivr.net/gh/wcpos/wp-admin-landing@v2/assets/css/variants/free-plus.css"
    },
    "free-plus": {
      "js": "https://cdn.jsdelivr.net/gh/wcpos/wp-admin-landing@v2/assets/js/variants/free-plus.js",
      "css": "https://cdn.jsdelivr.net/gh/wcpos/wp-admin-landing@v2/assets/css/variants/free-plus.css"
    }
  }
}
```

Both `indie` and `free-plus` map to the **free-plus** chunk → identical render. `asset_version: 1` clears the compiled-in minimum so the override is accepted. (`free-plus` is also the `FALLBACK_VARIANT`, so fallback renders during the A/A are visually identical to assigned renders too — clean.)

> **Note on `getFeatureFlagPayload`:** the bootstrap calls `ph.getFeatureFlagPayload(FLAG_KEY)` once and passes that single object into `resolveAssets`, which then indexes `payload.variants[<the assigned variant>]`. So the payload object must contain **both** variant entries (as above), regardless of which variant the site was assigned. Entering the same full object on each variant slot guarantees that whichever payload PostHog returns for the resolved variant, both entries are present.

#### 2.1.2 The kill-switch drill (part of the A/A — design §6.2 #0)

While the A/A is live, prove the kill-switch path:
1. Turn on `ops-landing-kill-switch` (§2.2) for a test condition matching only your own site/anon_id.
2. Reload the landing page; confirm it renders `free-plus` (fallback) and `landing_variant_rendered.render_source = 'fallback'` fires, and that this render is **not** written to the assignment cache (the code only caches `flag`-source decisions).
3. Confirm a previously cache-rendered page only flips to fallback **on next load** (no mid-session switch).
4. Turn the kill-switch back off; record the drill outcome in the A/A gate notes.

#### 2.1.3 Removing the A/A payload at real-launch time (the drill to undo)

When the A/A passes its count gate AND the adoption/translation gates clear (§6.4) AND Paul decides to launch the parent:
1. Edit `landing-variant` → **clear the payload on both `indie` and `free-plus`** (leave payload empty). With no payload, `resolveAssets` returns the hardcoded map → `indie` serves the indie chunk, `free-plus` serves the free-plus chunk → the real two-arm test.
2. Keep the 50/50 split unchanged (so no one re-buckets).
3. **Invalidate stale cache:** the assignment cache is keyed on `analytics_schema_version` (= 2). If launching the *real* split must not inherit A/A-era cached assignments, bump `ANALYTICS_SCHEMA_VERSION` in `constants.ts` in the launch build — this fences the cache cleanly (the code compares `cached.schemaVersion === schemaVersion`). Decide and record: A/A and parent share schema v2 (cache carries over — acceptable since the bucket key is the same anon_id and the split is unchanged) **or** bump to fence. Default recommendation: **do not bump** — same flag, same split, identical buckets; carrying the cache avoids a fleet-wide re-render flicker and the A/A already proved stickiness.
4. Enable the flag if it was left disabled; this is the parent launch — only after the gates.

### 2.2 `ops-landing-kill-switch` — kill switch

1. Feature flags → New feature flag.
2. **Key:** `ops-landing-kill-switch` (exact).
3. **Type:** **boolean**. The code accepts the served value being boolean `true` **or** the string `'on'` — a plain boolean flag served to matched users returns `true`, which the code honours. (If your UI serves a multivariate string, the literal `'on'` value also works; boolean is simpler — use boolean.)
4. **Release condition:** start with **0 matched users** / no condition — it must affect nobody until invoked.
5. **Leave ENABLED** (an always-available switch) **but with an empty/zero release condition**, so flipping it on later is one edit to the condition, not an enable+condition round-trip. Why kill-switches differ from experiment flags: you want the kill switch instantly armable, so it stays enabled-but-targeting-nobody; experiment flags stay disabled (§2.5).
6. When you ever need it: edit the condition to "100% of users" (or a targeted group) — every load resolves `killSwitch = true` → forced `free-plus` fallback next load.

### 2.3 `exp-*` child flags — DO NOT CREATE YET

Per §6.4 the children (`exp-202607-all-consent-ask`, `exp-202608-all-price-visibility`, `exp-202609-all-demo-autologin`, …) launch in months 1–5+, each at its own time. Create them only when their entry is scheduled, from the backlog registry. Creating them early risks accidental exposure and clutters the dashboards. (Note: `exp-202607-all-consent-ask` and `exp-202609-all-demo-autologin` are not even read by this repo's bootstrap — they live on the plugin / demo surfaces.)

### 2.4 Flag summary

| Flag key | Type | Now | Release condition now | Drives rendering in this repo? |
|---|---|---|---|---|
| `landing-variant` | multivariate `indie`/`free-plus` 50/50 | **disabled**, A/A payload set | 100% (client excludes pro_active) | **Yes** — the only flag the bootstrap resolves for variant |
| `ops-landing-kill-switch` | boolean | **enabled, targets nobody** | none / 0% | **Yes** — forces fallback |
| `exp-202606-all-aa` (optional) | boolean placeholder | disabled, bookkeeping only | none | No (the real A/A is the landing-variant payload) |
| `exp-*` children | per registry | **not created yet** | — | mostly No (plugin/demo surfaces) |

### 2.5 Why DISABLED, not 0% — the bootstrap's fallback behaviour

This is the load-bearing operational point. When `landing-variant` is **absent or disabled**, `ph.getFeatureFlag('landing-variant')` returns `undefined`. In `decideVariant`, `flagValue` is falsy → it skips the flag branch → tries the cache → else returns **`free-plus` fallback** with `render_source: 'fallback'`, which is **never an exposure and never cached**. That is exactly the pre-launch state we want: every site sees the reference page, nobody is enrolled, no exposures accrue.

A **0% rollout** is subtly worse: depending on PostHog version a 0%-rollout multivariate flag can still *evaluate* and emit `$feature_flag_called` for users who match the release condition (returning `false`/no-variant), polluting the assignment-side canary and baseline before launch. **Disabled is unambiguous: the flag does not evaluate, no `$feature_flag_called`, clean baselines.** So: experiment flags stay **disabled** until launch; the kill switch stays **enabled but targeting nobody** (it must be instantly armable). Launching = enable + confirm 50/50 + clear A/A payload (§2.1.3).

---

## 3. Action — "Landing Engaged" (§6.5.3)

1. **Data management → Actions → New action** (or Activity → Actions).
2. **Name:** `Landing Engaged`.
3. Add **two event matchers, OR-combined** (an Action is an OR over its matchers):
   - Event `upgrade_cta_clicked`
   - Event `demo_opened`
4. No property filters on the action itself (cohort/funnel filters carry `pro_active=false` and first-exposure logic).
5. Save. This Action is the engage step in every funnel below.

> Round-1 reality (§6.1): no round-1 page renders a demo surface, so `demo_opened` cannot fire yet — the Action degenerates to a clean CTA-vs-CTA signal. Keep `demo_opened` in the definition for future demo-arm challengers; do not remove it.

---

## 4. Funnels (§6.5.4)

Create each under **Insights → New insight → Funnel**. Unless stated, set: **conversion window** generous (e.g. 14 days), **unique persons**, **first-exposure** ordering, and a global filter **`pro_active` = false** (super property present on every event). All funnels break down by `landing_variant` (super property) where a per-variant read is wanted.

| Funnel | Steps (in order) | Step filters / notes |
|---|---|---|
| **Primary** | 1. `landing_variant_rendered` → 2. Action `Landing Engaged` → 3. `pro_purchase_attributed` | Step 1 filter: **`render_source` in (`flag`,`cache`)** (canonical exposure — excludes fallback). Step 1 filter: `pro_active` = false. Break down by `landing_variant`. Step 3 is emitted by the reconciler (§7b), once per `order_id`; expect tiny counts — directional only. |
| **CTA-only (secondary)** | 1. `landing_variant_rendered` [render_source in flag,cache] → 2. `upgrade_cta_clicked` → 3. `pro_purchase_attributed` | The diagnostic lens; becomes mandatory again if any future arm adds a demo surface to one arm only (§6.1). |
| **Micro (section depth)** | 1. `landing_variant_rendered` [flag,cache] → 2. `section_visible` | **PLACEHOLDER — `section_visible` not yet shipped** (taxonomy §5.2 lists it; not emitted in round 1). Build the funnel now with the event name so it auto-populates when the event ships; until then it reads zero past step 1. Break down by `section_id`/`order_index` once live. |
| **Demo Path** | 1. `landing_variant_rendered` [flag,cache] → 2. `demo_opened` → 3. (demo-side) `demo session started` | **PLACEHOLDER — `demo_opened` not yet shipped** (no round-1 demo surface, §2.2). Create and park; activates with the first demo-arm challenger + the §7c demo instrumentation. |
| **Delivery Health** | 1. `landing_variant_rendered` (ALL render_source) → breakdown by `render_source` | Not a conversion funnel — use a breakdown/trend. Shows flag vs cache vs fallback mix; feeds the fallback-rate guardrail (§5). |
| **Consent** | 1. `consent_prompt_shown` → 2. `consent_granted` (with `consent_declined` / `consent_revoked` as parallel reads) | Plugin-surface events (§5.2); used by the consent-ask child (`exp-202607`). Grant rate per unique site shown. |

---

## 5. Dashboards (§6.5.5)

Create four dashboards. Each insight below is a separate tile; set the global date range per dashboard to a rolling window (e.g. last 8 weeks) and pin the variant breakdown.

### 5.1 Core

- **Dual SRM canary — two insights (this is the heart of the canary):**
  1. **Assignment-side SRM:** trend/table of **unique persons by `landing_variant`** computed from **`$feature_flag_called`** (filter `$feature_flag` = `landing-variant`). Valid because the bootstrap fires `getFeatureFlag` even on cache hits (§3.1.4), so this counts every assigned site.
  2. **Delivery-side SRM:** trend/table of **unique persons by `variant`** computed from **`landing_variant_rendered`** with `render_source` in (`flag`,`cache`).
  Why two: diffing them localizes a failure — assignment-side skew means a bucketing/flag fault; a skew that appears only delivery-side means a chunk-delivery/latency fault (the heavier bundle losing renders). They should agree within noise.
  - **Weekly chi-square:** a HogQL insight (or spreadsheet from the two tiles if no HogQL, per Step 0.6) computing a chi-square of observed per-variant uniques vs the expected 50/50, **per ISO week**. Kill-only threshold: **SRM p < .001** on either arm (design §6.1 peeking policy).
- **Engage rate by variant:** the Primary funnel's step-1→step-2 conversion, broken down by `landing_variant`, unique persons, first-exposure, `pro_active`=false. The decision metric's live view (no decisions off it except at horizons).
- **CTA-only diagnostic:** the CTA-only secondary funnel, same breakdown.

### 5.2 Guardrails & Health

- **Fallback-render rate:** share of `landing_variant_rendered` with `render_source = 'fallback'` over all renders (trend). Rising fallback = delivery problem and a contamination source (first-fallback sites are excluded from cohorts, §6.1).
- **`landing_error` rate by variant + by `stage`:** trend of `landing_error` broken down by `stage`/`variant`. **One-arm spike = kill within hours** (§6.1).
- **p90 `time_to_render_ms`:** numeric insight, 90th percentile of `landing_variant_rendered.time_to_render_ms`, broken down by variant. Carries the full bootstrap→render latency budget (§3.1.1); +50% on one arm = review trigger.
- **Deactivation proxy:** 28-day zero-pageview cohort by variant (sites with an exposure but no `$pageview` in 28 days). Build as a cohort + count; directional guardrail.
- **SKU mix:** lifetime-vs-annual share of `pro_purchase_attributed` (property from the reconciler), per pricing arm. Guardrail rule (§6.1): kill a pricing arm if lifetime share leaves the **40–60% band** over the full window **with ≥20 attributed purchases in that arm**; **below 20 attributed purchases, extend — do not decide.** Relevant once `exp-202608` runs; build the tile now so it accrues.

### 5.3 Attribution Health

- **Attribution coverage:** monthly, `pro_purchase_attributed` count ÷ total observed Pro activations (`pro_activated_observed`, deduped per site, or the reconciler's order total). **Target ≥ 80% monthly** (§6.5.5). Below 80% means the cross-domain join is leaking — investigate the reconciler/cookie/`aid` pass-through before trusting any purchase read.
- **Unattributed / refunded:** trends of `pro_purchase_unattributed` and `pro_purchase_refunded` (purchases are refund-netted; posterior is directional only).

### 5.4 Locale & Population

- **`has_anon_id` adoption:** share of landing traffic (unique persons on `$pageview` or `landing_variant_rendered`) with super-property `has_anon_id = true`, weekly trend. **This drives the adoption gate — the parent launches only when ≥60% carries `has_anon_id`** (§6.4). Pre-gate traffic is segmented forever (fast-updater bias).
- **Locale distribution:** uniques by `locale` super property; flag the English cohort (`locale` contains `en`) as the pre-registered segment (§4). Enumerate locales explicitly if Step 0.5 found no `contains` operator.
- **`has_profile` / consented share:** uniques by `has_profile`; tracks the consented stratum's size.
- **`render_source` population mix** and **`visit_count` distribution:** observational, feeds novelty checks and the future returning-visitor test.

---

## 6. Weekly 10-minute ritual + the hard rule

Every week (calendar-fixed, ~10 min):
1. **Core → Dual SRM canary:** eyeball both insights; run/refresh the weekly chi-square. Any arm **p < .001** → investigate immediately (kill-only trigger).
2. **Guardrails & Health:** scan fallback rate, `landing_error` (one-arm spike?), p90 render (+50% one arm?), deactivation proxy, SKU mix (only acts at ≥20 purchases/arm).
3. **Attribution Health:** once monthly, confirm coverage ≥ 80%.
4. **Locale & Population:** track `has_anon_id` toward 60% (pre-launch) and watch for locale skew.

**The hard rule (design §6.1 peeking policy):**
- **Decisions are made only at the pre-registered horizon.** No shipping/stopping a variant on a mid-run reading.
- **The only early looks are kill-only, at day 14 and day 28:** SRM **p < .001**, a one-arm `landing_error` spike, or primary metric worse than **−30% at p < .01**. Nothing else is an early exit.
- Minimum **4 whole weeks**. Horizons are **accrual-defined**, not calendar-defined (§6.1) — the calendar dates in §6.4 are estimates "subject to accrual".
- Novelty check **at the decision look** (>50% lift decay first-ever vs previously-exposed → extend two weeks once).
- **Brand violations are kill conditions, not tradeoffs.** No horizon reads span Black Friday / holiday peak.

---

## 7. What Paul must NOT do yet (gates — design §6.4)

Until **all** of these clear, do **not** launch the parent experiment and do **not** change `landing-variant` rollout percentages or clear the A/A payload:

1. **Month-0 baselines measured** — the §5.2 events are instrumented on the *current* welcome page and week-0 baselines (pageview:unique ratio, cumulative-unique curve, cumulative engage, consented share) exist. MDEs are pre-registered **from the measured accrual curve**, not guessed. Traffic tier (LOW/MID/HIGH) is unknown until then and decides the entire calendar (§10 open question 1).
2. **A/A gate passed** — the count-based A/A (SRM clean on both arms, stickiness >95%, exactly-once dedup, consent-transition merge verified on the pinned posthog-js version, **flag value identical pre/post identify**) has passed. Failure = invalidate, fix, restart. This is a **hard gate** (§6.2 #0, §9, backlog `exp-202606-all-aa`).
3. **Translation gate passed** — both variants reviewed in all 12 locales; a translation lag reading as a variant effect is a named anti-pattern (§4). RTL (`ar`) QA done.
4. **Adoption gate passed** — **≥60% of landing traffic carries `has_anon_id`** (§6.4 / §5.4). Pre-gate traffic is segmented forever.

Also forbidden before the relevant gate/stagger:
- **No child flag launches** before the parent is live (and price-visibility staggers **≥1 week after** the parent; it is the *one* MID-concurrent child, and only if traffic is MID — at LOW, zero children).
- **Never change split percentages mid-run** — cumulative hash ranges re-bucket boundary users and break the read (§6.1, backlog guardrails).
- **No `exp-202609-all-demo-autologin`** until the parent decides **and** a demo-link challenger wins on the winner page (double-gated, §6.2 #4).

When the four gates clear and Paul decides to launch: clear the A/A payload on both variants (§2.1.3), keep 50/50, enable the flag. That is the parent launch.
