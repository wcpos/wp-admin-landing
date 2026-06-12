# Landing Page Experiments — Variants, Delivery, i18n, and the PostHog Program

**Phase:** 2–3 of the landing page initiative (conversion redesign + A/B testing; phase 1 plumbing shipped 2026-04)
**Status:** Indie variant locked (as round-1 control treatments). Free-plus locked (picks resolved 2026-06-12, §2.2). Personalised variant shelved (backlog).
**Primary goal:** Increase free→Pro conversion, measured honestly, iterated through PostHog experiments.
**Companion doc:** [Experiment backlog appendix](2026-06-12-landing-experiments-backlog.md) — the full 25-experiment registry with arm copy.

> **Scope note — this is a program charter, not one implementation plan.** It decomposes into four plans: (1) **this repo** — bootstrap, variants, i18n, analytics, CI; (2) **wcpos/woocommerce-pos** — §7a; (3) **wcpos.com + attribution** — §7b; (4) **demo.wcpos.com** — §7c. PostHog console setup (§6.5) rides along with plan 1.

---

## 1. Context and constraints

- The wp-admin landing page (`admin.php?page=woocommerce-pos` welcome screen) is the primary free→Pro funnel. Plugin 1.9.0+ loads `welcome.js` from the jsdelivr CDN (`wp-admin-landing@v2`); older plugins load the legacy `landing.js` (untouched by this work).
- The audience is a **fixed pool of ~6,000 active installs**, not unbounded web traffic. Pro purchases are single digits per week. This dominates all experiment design: purchases are never a significance metric; experiments run mostly sequentially; engage-rate per unique site is the decision metric.
- Brand voice is a hard constraint (see `wcpos-brand/brand/voice-and-tone.md` and the Crawford brief in `wcpos-brand/templates/landing-page/design-brief.md`): no fake urgency, no unverifiable claims, no emoji in product copy, result-led headlines, WP-admin-native visual language, system fonts, red `#CD2C24` CTA accent, red/cream awning stripe as brand signature.

### Verified facts (single source of truth for copy)

| Fact | Value |
|---|---|
| Urban Locavore (Paul's Perth store) | opened Dec 2011, closed Apr 2014 |
| First WordPress.org release | **11 May 2014** → 12 years of releases (2026) |
| Active installs | 6,000+ |
| Pro pricing | $129/year or $399 lifetime, per site |
| Income mix | ~50/50 annual/lifetime — preserved by the §6.1 SKU-mix rule |
| Fair-licence policy | lapsed licence → Pro keeps working; updates/support stop |
| Live Pro demo | demo.wcpos.com/pos (demo / demo) |
| Roadmap board | github.com/orgs/wcpos/projects/4/views/1 |
| Roadmap voting | **does not exist** — Pro users tell Paul on Discord; never render vote tallies/ballots |

**Year figures are computed, never hard-coded.** Constants `SHOP_OPENED = 2011-12`, `FIRST_RELEASE = 2014-05-11` live in `src/shared/constants.ts`. Computed figures interpolate **as numerals** via i18next/ICU placeholders — source string `{{releaseYears}} years of releases` renders "12 years of releases"; translators may reposition but not remove placeholders. The constants lint (§9) fails any `en` source string containing a literal year-count as digit **or word**. (Consequence: the letter renders "12 years" / "15 years ago" as numerals, not "Twelve"/"fifteen" — flagged to Paul as a one-word visual change from the approved mockup.)

Note: `wcpos-brand` docs say "since 2012" in several places and should be corrected to the public record (separate task, that repo).

---

## 2. The variants (round 1: two arms)

### 2.1 `indie` — "The Letter" (LOCKED as round-1 control treatments)

"Locked" means **locked-as-control**: these treatments ship as the defaults and serve as the control arms of the child experiments listed in §6; a challenger win updates the default in a spec revision.

Layout: WP-admin-native card, awning stripe top. Two-column grid (letter 1.25fr / sidebar 0.85fr), full-width reviews strip below.

**Letter (paper texture, awning header):**
- Floated polaroid-framed photo of Paul at Urban Locavore. Caption: *"Urban Locavore, Perth — the store that started it all"*. Asset: `assets/img/paul-urban-locavore.jpg` + WebP, lazy-loaded. **Owner: Paul; deadline: translation freeze (month 0). Contingency if unavailable:** drop the polaroid and the sentence "That's me on the right, {{yearsAgo}} years ago." becomes "I opened Urban Locavore in 2011…" (pre-approved fallback).
- Eyebrow: `JUNE 2026 · TO THE SHOPKEEPER RUNNING THE FREE REGISTER` (month computed).
- Opening: *"Hi — I'm Paul. I built the register you're using."*
- Para 1: *"That's me on the right, {{yearsAgo}} years ago. I opened Urban Locavore in 2011 with hundreds of products already in WooCommerce and no way to sell them at the counter — so I built a register myself. When the shop closed in 2014, I put it on WordPress.org for anyone who needed it. **POS plugins for WordPress have come and gone since then. This one hasn't.** {{releaseYears}} years of releases, one developer, still shipping — and the free version is still the real thing: sell, print, stay in sync. It stays free."* (Offline claims are deliberately avoided page-wide while the offline checkout flow is still being completed — Paul, 2026-06-12.)
- Para 2: *"**Pro is why it's still here.** It adds extra tools for managing your store — card readers, refunds at the till, end-of-day reports, multi-store — and it funds every release, free ones included. No investors, no acquisition exit waiting. Shopkeepers fund it directly."*
- Para 3: *"And Pro users have a direct line: tell me what your shop needs, and it shapes what I build next."*
- Signature block (avatar, name, "developer & former shopkeeper · github.com/kilbot").
- P.S.: *"Pro is **$129/yr or $399 once**. If a licence lapses, Pro keeps working; you just stop getting updates."* — every price string on the page, including this P.S., is keyed to the `exp-202608-all-price-visibility` flag (§6.2 #3) so the annual-only arm shows no lifetime price anywhere.
- No demo link (the demo-link arm stays in the backlog as a future challenger).

**Sidebar — "What I'm building" (dark card):**
- Subtitle is a single link to the kanban board: `github.com/orgs/wcpos/projects/4/views/1`. **Items are plain text — no per-item issue links**, only the one board link.
- Items pulled **at build time from the GitHub Projects API** (`scripts/fetch-roadmap.mjs`), rendered as DONE/NEXT tag rows. Current snapshot: DONE — Refunds at the register, Receipt template gallery, Thermal receipt settings; NEXT — Prevent overselling at the register, Native Bluetooth card readers, Split payments, Cash float & shift management.
- Honesty callout: *"**Pro users shape the priorities.** There's no ticket queue — you tell me what your shop needs on Discord, and it shapes this list."* ("shape", not "set" — no voting mechanism exists; same rule as the free-plus rewording below.)
- CTA row: red **Get Pro** + "$129/yr · $399 lifetime" (control arm of exp-202608).
- Below the card: proof chip — **6,000+** "stores run WooCommerce POS / on WordPress.org since May 2014".

**Reviews strip (full width, white):**
- Three real WordPress.org reviews, **quoted verbatim — reviewers' exact words including typos and emoji; cuts marked with […]; translations labelled as translations; never reworded or condensed**. Each links to its thread, with real gravatars fetched at build time (`scripts/fetch-wporg-reviews.mjs`):
  - adeline (ceramicist, Annecy, France) — translated from French, marked *"translated from French"* (shown in original French for `fr` locale) — [thread](https://wordpress.org/support/topic/plus-dun-an-dutilisation-je-recommande/)
  - nckllnpssy — [thread](https://wordpress.org/support/topic/the-best-woo-pos-plugin-available-and-its-free/)
  - rodriguekgl — [thread](https://wordpress.org/support/topic/great-pos-for-your-woocommerce-store/)
- Leave-a-review strip: *"Running your shop on the free register? A review helps other store owners find it. → Leave a review on WordPress.org"* (event: `review_cta_clicked`).

**Deliberate removal:** the legacy page's PayPal donate button and hire-me card are dropped from both new variants — they dilute the single Pro CTA. "Donate clicks" is therefore **not** a guardrail (corrected from an earlier draft); the legacy page keeps its donate path until v2 fully replaces it, and the removal is called out here as an intentional change.

### 2.2 `free-plus` — "Free today. Pro when you're ready." (LOCKED — picks resolved 2026-06-12)

Layout: awning stripe → hero (copy left, **real Pro screenshot right**) → comparison table → roadmap card + reviews → review-ask strip. Kicker: "You're on the free plugin — it stays free". Red Get Pro CTA + both prices (control arm of exp-202608, same page-wide price keying as §2.1).

**Hero image (resolved 2026-06-12):** real screenshot of the Pro **Reports page** (end-of-day report: sales chart, order list, totals by cashier — a Pro-only surface, deliberately *not* the free register the reader already uses daily). Source: Paul, 2048×1536 (2× of the ~512px display slot), internally consistent demo data (net + tax = total verified). Asset: `assets/img/reports-hero.png` + WebP derivative, lazy-loaded with `srcset` (1024w/2048w). Caption: *"End-of-day reports — totals by cashier, payment method, and store (Pro)"*.

**Resolved picks (Paul, 2026-06-12):**

| Decision | Pick |
|---|---|
| Headline | *"Free today."* / *"Pro when you're ready."* (red second line) — Paul's pick from an 18-candidate set, 2026-06-12. Runner-up *"Your shop is growing. / Your register can too."* plus the till/store and result-stack candidates move to the headline-test backlog |
| Demo treatment | **No demo link at all.** Both demo arms (text link, cream button) move to the challenger backlog. Consequence: no round-1 page has a demo surface — see §6.1 metric note |
| Fair-licence placement | Directly under CTA: *"If you stop paying, Pro keeps working. Updates and support stop."* |
| Comparison format | Check/cross table (7 result-led rows); workaround-copy cells remain the strongest tier-2 challenger |
| Disqualifier | Off (copy retained in translation JSON for the future test) |

Shared elements **identical to indie**: the "What I'm building" roadmap card (§2.1 — board-link only), the three-review strip with gravatars, and the leave-a-review ask (`review_cta_clicked`). "6,000+ stores · WordPress.org" header on the reviews strip.

### 2.3 `personalised` — SHELVED

The profile-driven gaps page is not in round 1. All personalised experiments stay in the backlog, gated on consent-rate data, the consent-endpoint plugin work, and a parent winner. Shelving it simplifies the parent test to **one 2-way flag for all traffic**.

---

## 3. Delivery architecture

### 3.1 Variant delivery (unchanged plugin enqueue)

1. Plugin enqueues `welcome.js` (stable bootstrap) from jsdelivr — no PHP enqueue change. **Size honesty:** the bootstrap bundles posthog-js (~50–60KB gz alone), so it is **~60–80KB gz, not ~5KB**; its job is to resolve fast, not to be tiny. The p90 `time_to_render_ms` guardrail (§6.1) carries the full bootstrap→variant-render latency budget.
2. Bootstrap reads `window.wcpos.landing` (locale, plugin_version, pro_active, anon_id [new], optional consented profile), inits PostHog, resolves the `landing-variant` flag (multivariate: `indie` | `free-plus`) **strictly before any `identify()` call** (§5.1).
3. **Runtime contract, not chunk dedup.** The build is IIFE-format; Rollup cannot code-split IIFE builds, so separate entries cannot share modules. Instead: the bootstrap IIFE **owns** posthog-js, i18next, analytics, and landing-data, and exposes them as `window.wcpos.landingRuntime = { posthog, i18n, trackEvent, getLandingData, constants }`. Variant bundles are **UI-only IIFEs** (React stays external to `wp.element`) that consume that runtime — shared-lib dedup is by contract. The `extractCss` Vite plugin must be reworked to emit per-entry CSS (`assets/css/variants/{name}.css`) instead of the single hardcoded `css/welcome.css`.
4. Bootstrap injects the matching variant chunk + CSS from the CDN (`assets/js/variants/{name}.js`). **Assignment cache:** localStorage, keyed `{anon_id, flag_key, analytics_schema_version}`, 7-day TTL → instant repeat renders, sticky assignment, no flicker. Only **flag-resolved** assignments are written to the cache (never fallback renders). Even on cache-served renders the bootstrap still calls `posthog.getFeatureFlag('landing-variant')` (synchronous from PostHog's own persistence after first load) so `$feature_flag_called` fires and the SRM canary stays valid — the custom cache only short-circuits the variant→chunk mapping, not exposure accounting. Never switch a rendered variant mid-session; a kill-switch that resolves against a cache-rendered page takes effect next load.
5. Resilience: the bootstrap ships a compiled-in variant→chunk map and a minimum `asset_version`. The flag payload may override chunk URLs, but any payload with `asset_version` below the compiled-in minimum is rejected and the hardcoded map is used (prevents a stale/rolled-back payload pinning new bootstraps to old chunks). `ops-landing-kill-switch` flag forces the fallback variant. `landing_error {stage, message, variant}` instruments every failure path.
6. `pro_active: true` → CTA suppressed, no experiment exposure, excluded from all denominators.

### 3.2 Repo layout

```
src/
  bootstrap/        index.tsx · variant-loader.ts · skeleton.tsx · runtime.ts
  variants/
    indie/          index.tsx · components/
    free-plus/      index.tsx · components/
  shared/           analytics.ts · i18n.ts · landing-data.ts · profile-report.ts
                    constants.ts (SHOP_OPENED, FIRST_RELEASE, prices)
                    components/ (reviews, roadmap-card, proof-chip, awning)
                    wporg-reviews.json · roadmap.json   (build-time generated)
scripts/
  fetch-wporg-reviews.mjs   (reviews + gravatars from the three pinned threads)
  fetch-roadmap.mjs         (DONE/NEXT items from GitHub Projects API, project 4)
assets/img/paul-urban-locavore.jpg|webp
```

(Today `analytics.ts` lives at `src/lib/analytics.ts`; the §5.1 identity fix lands **as part of this restructure**, in one change, so the A/A exercises the final layout.)

Build outputs: `assets/js/welcome.js` (bootstrap), `assets/js/variants/*.js`, `assets/css/variants/*.css`. CI adds a banned-word lint over all arm copy (Simply/Just, emoji, urgency/scarcity words, unverifiable quantifiers), the constants lint (§1), and removes the legacy "Unlock advanced features…" string.

---

## 4. Locale and translation

**Serving the correct language requires no server.** Two independent client-side axes: variant ← PostHog flag; language ← `window.wcpos.landing.locale` (already injected by PHP from `get_user_locale()`); i18next fetches that locale's JSON at runtime.

**Locales (12):** English (source) + fr, de, es, it, nl, pt-BR, ja, zh-CN, ko, ar, hi-IN — the set the docs/Aide translation pipeline already covers.

**Namespaces:** one per variant — `wp-admin-landing-indie.json`, `wp-admin-landing-free-plus.json` + `wp-admin-landing-shared.json` (reviews strip, roadmap card, CTA atoms). Killing a variant stops its translation work. Source files live in this repo (`src/translations/en/`) and are mirrored to `wcpos/translations`; runtime loads via the existing chained backend (localStorage 7-day cache → jsdelivr `wcpos/translations@main`), bundled English as final fallback.

> **Amendment (Paul, 2026-06-13):** translations are self-contained in this repo — locale files live at src/translations/<wp_locale>/ and are served from the same @v2 jsdelivr tag as the bundles. The wcpos/translations mirroring described above is retired (no landing strings leave this repo); translator context lives at src/translations/CONTEXT.md.

**Idiom rules:** "ring up a sale", "till", and similar are locale-adapted, not machine-translated literally. The adeline review renders in original French for `fr`.

**Gates and analysis:** parent test does not start until both variants pass translation review in all 12 locales (a translation lag reading as a variant effect is a named anti-pattern). `locale` is a super property; English cohort is a pre-registered analysis segment. RTL (`ar`) gets a layout QA pass.

---

## 5. Analytics infrastructure (blockers before any experiment)

### 5.1 Identity fix (replaces `persistence:'memory'`)

- Plugin PHP: `wcpos_anon_id` via `wp_generate_uuid4()` into `wp_options` (random UUID, never a URL hash), injected as `window.wcpos.landing.anon_id`, data-contract `schema_version` bump, deleted on uninstall, `wp wcpos anon-id rotate|delete` WP-CLI, readme/privacy disclosure.
- `src/shared/analytics.ts`: `persistence:'localStorage'`; `person_profiles:'always'`; `before_send` strips `$current_url/$host/$pathname/$referrer`. `bootstrap.distinctID = anon_id` is passed **only when no persisted distinct_id exists** (avoids resetting an identified session every load).
- **Flag-before-identify rule (assignment integrity):** `landing-variant` is resolved while distinct_id = anon_id, **before** any `identify(site_uuid)`; the resolved value is registered as a super property and is **never re-read post-identify within a session** (identify triggers `reloadFeatureFlags()`, and anon_id vs site_uuid hash to different buckets — re-reading would re-randomize consented sites). Where the PostHog version supports it, enable flag experience-continuity on `landing-variant` as a second lock. **A/A pass criterion: flag value identical pre/post identify.**
- `posthog.identify(site_uuid)` remains a post-init call for consented profiles, performing a real merge.
- **Google Analytics is removed from the landing page entirely — it never loads for any tier, anonymous or consented.** (Unconditional anonymous pageview was a wp.org guideline-7 risk; PostHog covers everything GA provided.)
- Super properties on every load: `landing_variant, plugin_version, pro_active, locale, has_profile, has_anon_id, analytics_schema_version, visit_count, first_seen_at` (the last two maintained in localStorage beside the assignment cache, incremented once per session — they feed the novelty check and the future returning-visitor test). Pre-fix data is fenced by `analytics_schema_version`, never by date filters.
- PostHog project hygiene: discard client IP, disable GeoIP on the anon tier.

### 5.2 Event taxonomy

| Event | Properties / purpose |
|---|---|
| `landing_variant_rendered` | `{variant, render_source: flag\|cache\|fallback, time_to_render_ms, asset_version}` — **canonical exposure = render_source IN (flag, cache)**; fallback renders fire the event but are never exposures |
| `upgrade_cta_clicked` | `{cta_location: hero\|roadmap_card\|comparison_table\|pricing\|footer, href}` |
| `demo_opened` | demo link/button clicks |
| `pricing_viewed` | IntersectionObserver ≥50% for 1s |
| `section_visible` | `{section_id, order_index}` |
| `review_cta_clicked` | leave-a-review strip |
| `roadmap_widget_engaged` | board-link clicks |
| `landing_error` | `{stage, message, variant}` |
| `page_engagement` | sendBeacon on pagehide |
| `consent_prompt_shown / granted / declined / revoked` | consent funnel (revoke path: stop identify, data-deletion policy documented in plugin privacy page) |
| `pro_activated_observed` | fired **at most once per browser** on a `pro_active` false→true flip; deduplicated per site in analysis (first occurrence per person). The authoritative once-per-site signal is the server-side licence-activation join (§5.3c) |

Outbound links to wcpos.com/demo carry `ref=wp-admin`, UTM, `lv={variant}`, `aid={distinct_id}`, `pv={plugin_version}` — opaque IDs only. `aid` may be anon_id or site_uuid depending on consent state; the reconciler joins on **either** (the activation join carries both).

### 5.3 Cross-domain purchase attribution

Checkout happens on wcpos.com; the plugin only sees `pro_active` later. Strategy: (a) `aid` param + **server-set** 90-day `wcpos_attr` cookie on wcpos.com (not `document.cookie` — Safari ITP); (b) Woo order-meta copy at checkout; (c) licence-activation join (activation carries `wcpos_anon_id` + `site_uuid`); (d) the reconciler (§7b) emitting `pro_purchase_attributed` (once per order_id), `pro_purchase_refunded`, `pro_purchase_unattributed`. Purchases are refund-netted and reported as a beta-binomial posterior — directional, never "significant". demo.wcpos.com joins the same PostHog project (§7c); **`demo_sale_completed` attribution is best-effort until per-session sandboxing ships** — `demo session started {aid}` is the reliable signal. wcpos.com pageview + UTM capture ships in month 0 so arrival baselines exist before tier-2 needs them.

---

## 6. The experiment program

### 6.1 Principles

- **Decision metric:** cumulative engage rate per unique site (Action "Landing Engaged" = `upgrade_cta_clicked` OR `demo_opened`), first-exposure cohorts (canonical exposure only; sites whose *first* render was a fallback are excluded as a contamination segment), `pro_active=false` on step 1.
- **Metric note (updated with the §2.2 picks):** neither round-1 page has a demo surface, so `demo_opened` cannot fire and the composite degenerates to a clean CTA-vs-CTA comparison for the parent — the earlier asymmetry caveat is moot. `demo_opened` stays in the Action definition for future demo-arm challengers; if a later experiment introduces a demo surface on one arm only, the CTA-only secondary lens becomes mandatory again.
- **Purchases:** guardrail/directional only, at every tier.
- **Concurrency:** at MID traffic, parent + at most one orthogonal child, where *orthogonal* requires the treated surface to **exist identically in every parent arm**. At LOW, parent only. Off-landing-surface tests (consent prompt) are exempt.
- **Peeking policy:** kill-only looks at day 14/28 (SRM p<.001, one-arm `landing_error` spike, primary < −30% at p<.01); otherwise one decision at the pre-registered horizon. Minimum 4 whole weeks. Novelty check at decision (>50% lift decay first-ever vs previously-exposed → extend 2 weeks once).
- **Horizons are accrual-defined, not calendar-defined:** the unit target (e.g. ~1,200 first-exposed sites/arm for +50% relative on ~6% baseline) comes from the month-0 accrual **curve** — a fixed pool saturates, so late weeks add few new units. Calendar entries in §6.4 are estimates, "subject to accrual".
- **Guardrails:** dual SRM canary (`$feature_flag_called` vs `landing_variant_rendered`, valid because §3.1.4 fires both on cache hits), fallback-render rate, `landing_error`, p90 `time_to_render_ms`, review sentiment / Aide tickets, deactivation proxy (28-day zero-pageview cohort), and the **SKU-mix rule**: kill a pricing arm if lifetime share of attributed purchases leaves the **40–60% band** over the full window with **≥20 attributed purchases in that arm**; below 20, extend rather than decide. (This paragraph is Paul's written mix rule; §6.3's wcpos.com test references it.)
- Brand violations are kill conditions, not tradeoffs. Seasonality: no horizon reads spanning Black Friday/holiday peak.

### 6.2 Tier 1 (launch order)

| # | Flag | Test | Notes |
|---|---|---|---|
| 0 | `landing-variant` (A/A config) | **A/A identity-stack validation** — both multivariate values point at identical render output, so the production flag, payload override, and fallback map are what get validated; includes a forced kill-switch drill | Gate is **count-based, not calendar-based**: pre-computed exposure N for SRM power + minimum observed consent transitions (flag value identical pre/post identify), with `has_anon_id` coverage recorded. ~2 weeks expected at MID |
| 1 | `landing-variant` | **indie vs free-plus** (50/50, all traffic) | THE experiment. Horizon: accrued-unit target per §6.1 (estimate 10–14 weeks at MID; 6 months at LOW at +75–100% MDE floor). Winner ships 100%. Draw → ship cheaper-to-maintain arm, record the bound |
| 2 | `exp-202607-all-consent-ask` | consent prompt rewrite (plugin surface, exempt) | itemized honest disclosure vs current; metric: grant rate; copy must not promise a personalised page (none exists in round 1) |
| 3 | `exp-202608-all-price-visibility` | **control: "$129/yr · $399 lifetime" (the locked §2 treatment) vs challenger: "$129/yr" only** | The one MID-concurrent child. The flag keys **every price string on the page** (CTA rows, indie P.S., footers) so the challenger arm shows no lifetime price anywhere. Uniform across parent arms; staggered ≥1 week after parent; SKU-mix rule armed. A challenger win updates the locked default in a spec revision |
| 4 | `exp-202609-all-demo-autologin` | typed demo/demo vs signed auto-login deep link | **Double-gated:** no round-1 page has a demo surface (§2.2 picks), so this runs only after (a) the parent decides AND (b) a demo-link challenger from the backlog wins on the winner page. Conditional-on-click analysis; requires the §7c endpoint |

### 6.3 Tier 2/3 (post-winner, summarised)

Winner-scoped children run sequentially from the pre-registered queue: CTA sub-line (fair-licence vs roadmap line) → CTA verb (decided on UTM-tagged wcpos.com arrivals, English cohort) → page length (full vs above-fold minimal) → winner's headline test → demo prominence / letter length (winner-dependent) → comparison format (if free-plus won). HIGH-traffic-gated: returning-visitor treatment (its `visit_count` instrumentation ships day 1 per §5.1), CTA repetition, disqualifier, wild challengers, email capture. The wcpos.com/pro pricing-anchor test runs on its own surface, all traffic pooled, revenue/SKU-mix read, governed by the §6.1 mix rule. Ballot-style experiments stay **gated until real roadmap voting exists**. Full registry with hypotheses, arms, and copy: [backlog appendix](2026-06-12-landing-experiments-backlog.md).

### 6.4 Sequencing (first 6 months, MID scenario, subject to accrual)

- **Month 0 — foundation sprint:** identity fix + §3.2 restructure; GA removal; reconciler + `wcpos_attr` cookie + wcpos.com UTM capture; demo instrumentation; event taxonomy incl. **baseline instrumentation** — ship the §5.2 events on the **current** welcome page so week-0 baselines use the experiment's own definitions; fairness items (fair-licence line present in both variants per their chosen placement, CTA suppression for `pro_active`); photo asset delivered; free-plus picks resolved (deadline week 2); translation source freeze → pipeline run → review; baselines measured **after** instrumentation + fairness items are live; MDEs pre-registered from the measured accrual curve; Paul's mix rule committed (done — §6.1).
- **Month 1:** A/A runs to its count gate; consent-ask launches (exempt surface). Adoption tracking toward the ≥60% `has_anon_id` gate.
- **Month 2:** parent launches (post-A/A, post-adoption-gate, post-translation-gate). Price-visibility staggers in ≥1 week later.
- **Months 3–4:** accrual; consent-ask and price-visibility conclude at their horizons.
- **Month 5:** parent decision at its accrued-unit target; collapse to winner; archive loser; demo-autologin launches winner-scoped if applicable.
- **Month 6:** first winner-scoped child (CTA sub-line); wcpos.com pricing-anchor test on its own surface; 6-month write-up (confidence bounds, refund-netted purchase posterior by variant, novelty analysis, next-ladder pre-registration).
- Adoption gate: parent launches only when ≥60% of landing traffic carries `has_anon_id`; pre-gate traffic is segmented forever (fast-updater bias).

### 6.5 PostHog console setup (ph.wcpos.com)

1. Verify server version/features: multivariate flags, flag payloads, automatic `$feature_flag_called`, person-property string operators, HogQL, Experiments product, flag experience-continuity (record fallbacks if absent — plain flags + custom insights suffice).
2. Flags: `landing-variant` (2-way + A/A config first), `ops-landing-kill-switch`, then `exp-*` children per registry.
3. Action: "Landing Engaged" = `upgrade_cta_clicked` OR `demo_opened`.
4. Funnels: Primary (`landing_variant_rendered` [canonical exposure] → Landing Engaged → `pro_purchase_attributed`), CTA-only secondary, Micro (section depth), Demo Path, Delivery Health, Consent.
5. Dashboards: Core (dual SRM canary, engage by variant, CTA-only diagnostic), Guardrails & Health (fallback rate, errors, p90 render, deactivation proxy, SKU mix), Attribution Health (coverage ≥80% monthly), Locale & Population.
6. Weekly 10-minute ritual: SRM + guardrail scan. Decisions only at pre-registered horizons.

---

## 7. Cross-repo work

### 7a. wcpos/woocommerce-pos (plugin)

- `wcpos_anon_id` generation/injection/uninstall/WP-CLI (§5.1) + privacy/readme disclosure.
- Consent prompt copy delivered flag-drivably (for exp-202607) via the landing data contract or a filter.
- Licence activation request carries `wcpos_anon_id` + `site_uuid` (reconciler join).
- Data-contract `schema_version` bump documented in both repos.

### 7b. wcpos.com

- Month 0: PostHog pageview + UTM/`aid` capture on wcpos.com (arrival baselines); server-set 90-day `wcpos_attr` cookie; Woo checkout copies `aid`/UTM into order meta.
- **The reconciler lives here** (the only system that sees orders, refunds, and licence activations): a scheduled job joining order meta + licence-activation ids + the cookie value, writing to PostHog via the capture API, idempotent per `order_id`, emitting the §5.3 events; `rekeyed_site` flagging for ids without exposure history.
- Later (tier 2): the pricing-anchor test surface.

### 7c. demo.wcpos.com

- Same PostHog project; accepts `aid` as distinct_id; `demo session started` / `demo_sale_completed` server-side (sale attribution best-effort until per-session sandboxing).
- Tier-1 #4's signed, expiring, rate-limited auto-login endpoint (post-parent; build when scheduled, not in month 0).

## 8. Error handling

- Bootstrap/flag failures → fallback variant renders (free-plus, the reference arm), `landing_variant_rendered {render_source:'fallback'}` fires (never counts as exposure), `landing_error` fires. **Fallback renders are never written to the assignment cache** — the bootstrap re-attempts flag resolution next load. A site may see free-plus (fallback) once and indie (assigned) next visit; acceptable because first-render-fallback sites are excluded from first-exposure cohorts (§6.1) and the fallback rate is a dashboard guardrail.
- Flag timeout (500ms) → cached assignment if present (still calling `getFeatureFlag` for exposure accounting per §3.1.4), else fallback path above.
- Build-time fetchers fail **closed**: build uses the last committed JSON snapshot; CI warns, doesn't block; stale-snapshot age lint (>90 days fails).
- Translation fetch failure → bundled English (existing chained-backend behaviour).

## 9. Testing

- Unit: bootstrap variant resolution (flag present/absent/timeout/kill-switch/cached/fallback-not-cached), flag-before-identify ordering, landing-data validation, event payloads, constants-derived copy (no literal year counts, digit or word).
- Integration: the A/A run is the identity-stack integration test (§6.2 #0), including the kill-switch drill and the pre/post-identify flag assertion.
- Visual: per-variant, per-locale screenshot pass before parent launch (RTL included).
- CI gates: banned-word lint, constants lint, stale-snapshot lint, translation-completeness per namespace.

## 10. Open questions

1. **Traffic tier unknown** — month-0 baselines decide every MDE and the calendar; nothing pre-registers before they exist.
2. Demo auto-login endpoint ops posture (signed tokens, rate limits, per-session sandbox) — gates tier-1 #4 (now post-parent, so not urgent).
3. Consent-endpoint timing in the plugin — gates only the personalised variant's future return.
4. ~~Free-plus picks~~ — **resolved 2026-06-12** (§2.2).
5. `wcpos-brand` "since 2012" corrections — owner/timing TBD (separate repo, cosmetic).

## 11. Out of scope (this spec)

- Personalised variant build (shelved; backlog retained).
- Real roadmap voting (future; unlocks ballot experiments).
- wcpos.com/pro page changes beyond §7b attribution capture.
- Legacy `landing.js` page (untouched, keeps its donate path).
