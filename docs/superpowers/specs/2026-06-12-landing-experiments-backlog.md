# Landing Page Experiments — Backlog Appendix

**Companion to:** [2026-06-12-landing-experiments-design.md](2026-06-12-landing-experiments-design.md)
**Source:** adversarial experiment-factory run (21 agents: 4 generators × 2 critics × refiners + methodology chain + synthesis), 2026-06-12.

> **Post-review adjustments that supersede entries below** (the design spec is authoritative where they conflict):
> 1. Personalised variant SHELVED — all `personalised`/consented-3-way entries are gated on its return; the parent is a single 2-way flag.
> 2. No roadmap voting exists — all ballot/vote-tally arms are gated until real voting ships; 'Get Pro — and a vote' copy is retired.
> 3. `exp-202609-all-demo-autologin` re-tiered to post-parent winner-scoped (demo surface absent in indie violates orthogonality).
> 4. Indie locked WITH both prices and NO demo link; those arms are control/challenger as marked in the spec.
> 5. SKU-mix rule: lifetime share must stay in the 40-60% band (>=20 attributed purchases/arm) — armed on every pricing test.

## Tier 1

### Parent landing-variant test: indie vs free-plus vs personalised (program centerpiece — item #1)

- **Flag:** `landing-variant-consented (multivariate: indie 33 / free-plus 33 / personalised 34) + landing-variant-anon (multivariate: indie 50 / free-plus 50) — selected client-side by locally-known has_profile; replaces the legacy single landing-variant flag (safe: all pre-fix assignments were re-randomizing garbage under persistence:'memory'; invalidate the old localStorage variant cache at the analytics_schema_version bump)`
- **Category:** parent / whole-page strategy
- **Tier:** Tier 1
- **Hypothesis:** The three locked whole-page strategies (personal letter + ballot, comparison-table value pitch, consented-data personalisation) are the largest plausible effects available to a capped ~6,000-install population; one will beat the others on cumulative engage rate per site, and every child experiment should run on that winner rather than splitting the finite cohort three ways.
- **Arms:**
  1. indie — 'The Letter + Ballot' (in both flags)
  2. free-plus — 'Free is the till. Pro runs the store.' (in both flags; designated REFERENCE arm for all comparisons)
  3. personalised — 'Your store's gaps, printed' (consented flag ONLY; anonymous traffic runs the 2-way and is never exposed to the generic fallback)
- **Primary metric:** Cumulative engage rate per unique site over the window: Action 'Landing Engaged' (upgrade_cta_clicked OR demo_opened), unique persons, first-exposure cohort, per-step pro_active=false filter on step 1 only. The anon 2-way is THE decision read (one comparison vs free-plus, alpha .05); the consented 3-way runs two pre-registered comparisons vs free-plus at alpha .025 each and is directional-only at every tier (MDE floor +90-150% on a ~350-750/arm stratum).
- **Guardrails:** Dual SRM canary: weekly chi-square on $feature_flag_called AND landing_variant_rendered, diffed to localize assignment vs chunk-delivery failures (personalised is the heaviest bundle — a render/latency skew against it is the most likely silent bias) · landing_error one-arm spike = kill within hours; p90 time_to_render_ms +50% on one arm = review trigger · Non-inferiority review triggers (point estimates, not CI-excludes-zero): donate clicks -50%, purchase posterior -30%, demo_opened -30%, Aide ticket or wp.org review anomaly, deactivation proxy (28-day zero-pageview cohort) by variant · Page freeze: no nested changes during the read; the judgment parity bundle (fair-licence line under CTA on all variants, one verifiable review on personalised, proof chip, CTA suppression for pro_active:true) ships BEFORE launch so the arms are honest comparisons · Never change split percentages mid-run (cumulative hash ranges re-bucket boundary users)
- **Targeting:** All landing traffic with has_anon_id:true (adoption gate: launch only when >=60% of traffic carries the new plugin's anon_id; segment by has_anon_id forever), pro_active:false only, all locales (English cohort pre-registered via contains-'en' operator); anon stratum -> 2-way, consented stratum -> 3-way.
- **Duration:** Kill-only looks at day 14/28 (SRM p<.001, one-arm error spike, or primary worse than -30% at p<.01 are the only early exits); single ship decision at the pre-registered horizon: ~10-14 weeks at MID (+50% relative MDE on ~6% cumulative engage), full 6 months at LOW (+75-100% floor), ~10-12 weeks at HIGH (+30-40%). Minimum 4 whole weeks.
- **Effort:** small
- **Notes:** Merges v3-parent-variant-clean-read + cross-parent-variant under the methodology's two-flag design. Decision: 100% winner at LOW/MID; 80/20 with runner-up holdout at HIGH (holdout is GUARDRAIL/DRIFT MONITORING ONLY — the 'accruing toward purchase significance' framing is withdrawn; 70k/arm never arrives in a 6k universe, which also kills the v1 global-holdout experiment). Draw = ship the cheaper-to-maintain/brand-default arm and record the ruled-out bound. Purchase reported as beta-binomial posterior, never significant. Novelty check at the decision look: first-ever-exposed vs previously-exposed lift; >50% decay = extend 2 weeks once.

### A/A identity-stack validation (hard gate — mechanics only)

- **Flag:** `exp-202606-all-aa`
- **Category:** infrastructure validation
- **Tier:** Tier 1
- **Hypothesis:** After the identity fix (localStorage persistence, bootstrapped server anon_id, person_profiles:'always', cached flags), a no-op 50/50 flag will show no sample-ratio mismatch on either exposure event, sticky assignment across repeat pageviews, exactly-once deduped exposures per person, and a verified consent-transition merge — proving the stack works before any real test spends a day of scarce traffic. Explicitly NOT a CTR-equivalence check (at LOW, ~90-175 uniques/arm/week detects nothing about rates).
- **Arms:**
  1. A1 — current page, unchanged
  2. A2 — byte-identical no-op under the second flag value
- **Primary metric:** SRM chi-square vs 50/50 on unique persons, computed on BOTH $feature_flag_called (assignment-time) and landing_variant_rendered (delivery-time), diffed to localize any failure layer.
- **Guardrails:** Assignment stickiness >95% same-variant on return visits (non-incognito) · Exposure dedup: exactly one counted exposure per person per flag · Consent-transition path: bootstrap-as-anon_id then identify(site_uuid) must emit a real $identify with $anon_distinct_id on the PINNED posthog-js version (bootstrap.distinctID precedence has varied across versions) · before_send stripping verified: no $current_url/$host/$pathname/$referrer on anon events · $pageview and upgrade_cta_clicked volumes vs pre-fix baseline (migration must not lose tracking)
- **Targeting:** All landing traffic, both parent strata, all locales; runs while anon_id fleet adoption accrues toward the 60% gate.
- **Duration:** 2 weeks, whole weeks. HARD GATE: the parent test and everything else launches only after it passes; failure = invalidate, fix, restart.
- **Effort:** trivial
- **Notes:** Merges v1-aa-validation with the methodology's A/A spec. Also the rehearsal for the dual-SRM dashboard, the cache/bootstrap round-trip (render_source mix), and the analytics_schema_version fence. Pre-fix data is excluded structurally via schema version, never by date filters.

### Consent-ask rewrite: specific benefit + itemized disclosure vs current ask

- **Flag:** `exp-202607-all-consent-ask`
- **Category:** consent & measurement substrate (plugin surface)
- **Tier:** Tier 1
- **Hypothesis:** Rewriting the profile-data consent prompt to name exactly what is read (order_count, pos_user_count, active_gateways, wc_country, days_since_install, product_count), what the visitor gets (a page about THEIR store instead of a generic pitch), and where it goes (the plugin's own self-hosted analytics, never sold or shared) will lift consent grant rate 20-30%+ relative — and every grant grows the only identity-stable, personalised-eligible, purchase-attributable cohort, making this plausibly higher-ROI than any on-page test and the only test honestly powerable at LOW.
- **Arms:**
  1. A (control) — current consent prompt, unchanged
  2. B — plain-language rewrite: concrete benefit line + itemized field list + hard privacy promise + equally prominent one-click decline; no pre-checked boxes, no guilt framing, no nagging
- **Primary metric:** Consent grant rate per unique site shown the prompt (baseline plausibly 10-30% -> ~1.5-3k sites/arm for a 20% relative lift — weeks at LOW, days-to-weeks at MID).
- **Guardrails:** Decline path friction unchanged and audited in both arms (dark-pattern variants are auto-killed) · Consent revocation rate over 30 days · Plugin deactivation/uninstall rate must not rise · Privacy-related Aide ticket volume · Every claim in the copy must be literally true about what is read and where it goes — any overclaim is an automatic kill
- **Targeting:** All sites shown the prompt (pre-consent by definition), ALL parent variants (the prompt is plugin-level, orthogonal to the landing-variant flags), all locales with professional translation, pro_active excluded.
- **Duration:** ~4-8 weeks at LOW, ~2-4 weeks at MID (4-week minimum runtime applies).
- **Effort:** small
- **Notes:** MERGED from v1-consent-ask + v2-consent-ask + cross-consent-ask (three near-identical proposals). Runs concurrent with the parent — different surface, different metric, no shared element. Pre-registered caveat: a winning ask grows the consented share mid-parent, shifting population between the two parent strata; acceptable because strata are analyzed separately and within-stratum randomization is untouched. Lives partly in the plugin repo — coordinate with the versioning strategy. The personalised-only payload-preview follow-up (v3-consent-ask-disclosure) is tier 3.

### Price visibility at the CTA: '$129/year' alone vs '$129/year · $399 lifetime' (the one MID-concurrent child)

- **Flag:** `exp-202608-all-price-visibility`
- **Category:** pricing & offer
- **Tier:** Tier 1
- **Hypothesis:** Surfacing both real prices at the CTA converts the page's anti-subscription posture (fair-licence note, no time-bombs) into a purchasable choice; hiding the lifetime option until wcpos.com is arguably the less honest state, and a buy-it-once option is one of the few changes plausibly large enough to clear the fixed-cohort MDE floor. Info-completeness, not anchoring trickery.
- **Arms:**
  1. A (control) — CTA microcopy '$129/year' only
  2. B — '$129/year · $399 lifetime' (plain; no 'from', which falsely implies tiers; no urgency, no strikethroughs; wording verified verbatim against actual licence terms)
- **Primary metric:** Cumulative engage rate per unique first-exposed site (high-frequency metric, as the MID concurrency rule requires); annual-vs-lifetime click split and reconciler SKU mix as directional secondaries logged from day one.
- **Guardrails:** Must ship uniformly across ALL parent arms in identical form with randomization independent of parent assignment, or not at all (preserves the parent contrast as a balanced factorial) · Paul's WRITTEN decision rule on the acceptable annual:lifetime mix band signed BEFORE launch — mix monitored quarterly via the reconciler, directional only, never claimed significant at single-digit weekly purchases · demo_opened non-regression · Element lock: occupies the CTA/pricing microcopy surface — cta-subline and cta-copy queue strictly behind it
- **Targeting:** All three parent variants uniformly, both strata, all locales (price line translated; USD display — localized approximate pricing is backlog), pro_active excluded.
- **Duration:** ~10-12 weeks at MID at a pre-registered +50% relative MDE (the +20-30% numbers in the category lists are NOT attainable at MID under the fixed-cohort model); ~6-8 weeks at HIGH. At LOW: do not run — zero children — decide by judgment.
- **Effort:** trivial
- **Notes:** MERGED from v1-pricing-both + v3-lifetime-price-visibility + cross-pricing-display (which had absorbed cross-lifetime-anchor). Launch staggered >=3-7 days after the parent. Sub-threshold result = keep-by-judgment, not endless extension. Pre-registered HIGH-only follow-up if B wins: equal-weight vs annual-primary-with-lifetime-footnote arrangement (the absorbed cross-pricing-display question). The SKU-mix half of the question is answered properly by the wcpos.com anchor test (tier 2) on observed purchases.

### Demo credential friction: typed demo/demo login vs signed auto-authenticated deep link

- **Flag:** `exp-202609-all-demo-autologin`
- **Category:** demo funnel
- **Tier:** Tier 1
- **Hypothesis:** A signed auto-login URL landing the visitor directly in a live Pro register session will roughly double demo-session-started per demo click versus the typed-credentials hint, because credential entry is a classic 30-50% drop-off at the page's strongest honest proof asset; conditional-on-click analysis needs only ~100-200 clickers per arm, making this the cheapest downstream-funnel win in the program.
- **Arms:**
  1. A (control) — demo link to demo.wcpos.com/pos with 'login demo / demo' hint
  2. B — same link copy, target carries a signed, expiring, rate-limited auto-login token landing authenticated in the register (sandboxed)
- **Primary metric:** Demo session started (demo-side event, register loaded) per demo link click — conditional-on-click; demo_sale_completed depth and return-to-landing engage as secondaries.
- **Guardrails:** Demo server abuse/load monitoring on the signed-URL endpoint · Landing upgrade_cta_clicked rate unaffected · aid pass-through join verified before launch (demo-side distinct_id = passed aid)
- **Targeting:** All parent variants that render a demo link (free-plus text link; personalised per-gap demo links from the judgment bundle; indie joins only if the side-door test later ships a link), both strata, all locales, pro_active excluded.
- **Duration:** ~3-6 weeks at MID (~10 demo clicks/day pooled); not viable at LOW (~100+ days — skip).
- **Effort:** medium
- **Notes:** MERGED from v1-demo-autologin + cross-demo-autologin. Stays tier 1 because it has ZERO interaction-contamination risk (visually invisible, different funnel step from the pricing microcopy) — but at MID it launches only AFTER price-visibility concludes, honoring the parent-plus-one-child rule; at HIGH it runs as the second concurrent child, staggered >=3 days. Prerequisites: demo.wcpos.com PostHog instrumentation + signed-URL endpoint (week-0 build). Pre-registered follow-up if B wins: guided first action (deep link into a mid-sale/refund state) — a separate test, never bundled.

## Tier 2

### CTA sub-line: fair-licence (incumbent) vs roadmap-vote — which honest line earns the single slot

- **Flag:** `exp-202612-all-cta-subline`
- **Category:** CTA copy (winner-scoped)
- **Tier:** Tier 2
- **Hypothesis:** The fair-licence line ('If your licence lapses, Pro keeps working — you stop getting updates and support.') ships by judgment under the CTA on all variants BEFORE the parent read (parity fix + both critics' ruling that it is a judgment-ship wearing a safety holdout); the test then decides whether the roadmap-vote line ('Pro includes a roadmap vote — Pro users vote on what gets built next.') beats it for the one permitted sub-line slot, converting the purchase into a stake in a one-developer project.
- **Arms:**
  1. A (incumbent) — fair-licence sub-line as judgment-shipped
  2. B — vote sub-line ('vote on', never 'choose' — Paul decides and builds); the idiom line 'No lock-outs, no feature time-bombs.' appears in English or with translator sign-off only
  3. C (HIGH traffic only) — no sub-line, to price the slot itself
- **Primary metric:** Cumulative engage rate per unique first-exposed site; UTM-tagged wcpos.com arrivals as quality secondary.
- **Guardrails:** Hard cap: at most ONE sub-line under the CTA in any arm, ever (brand ruling) · Arrivals must not fall while clicks rise · demo_opened non-regression · If indie won the parent, pre-register that the vote arm is expected muted (the ballot already carries the vote)
- **Targeting:** Parent winner at 100% (scope 'all' post-collapse), all locales with English-primary analysis, pro_active excluded. Sequential CTA-element slot: runs after price-visibility has vacated the CTA surface.
- **Duration:** ~10-12 weeks at MID (+50% MDE), ~3-4 weeks at HIGH; first child in the post-parent queue (cheapest build, no brand-damaging losing arm).
- **Effort:** trivial
- **Notes:** MERGED: cross-cta-subline + v2-fair-licence-under-cta + v3's fair-licence judgment-ship, absorbing the killed cross-vote-perk-cta. Re-specced control: because fair-licence ships pre-parent as a parity fix, the live question is fair-licence vs vote, not none vs something.

### CTA verb: 'Get Pro' vs 'See Pro pricing' — decided on arrivals, not clicks

- **Flag:** `exp-202703-all-cta-copy`
- **Category:** CTA copy (winner-scoped)
- **Tier:** Tier 2
- **Hypothesis:** The lower-commitment 'See Pro pricing' will increase completed wcpos.com/pro arrivals per exposed admin because it promises information instead of a transaction and the click genuinely lands on pricing — the low-commitment framing is also the honest one. CTR is explicitly NOT the decision metric: B near-mechanically inflates clicks.
- **Arms:**
  1. A (control) — 'Get Pro'
  2. B — 'See Pro pricing' (whatever sub-line won exp-202612 appears identically in both arms; if indie won, vote-suffix placement held constant so only the verb varies)
- **Primary metric:** UTM-tagged wcpos.com/pro arrivals per unique exposed admin, 7-day first-exposure window (per-arm utm_content); CTR demoted to diagnostic — B cannot ship on a CTR win alone (pre-registered).
- **Guardrails:** Click-to-arrival completion rate per arm (click-inflation detector) · demo_opened non-regression · No 'Unlock' language near the button — the legacy 'Unlock advanced features…' string in src/translations/en/wp-admin-landing.json is cleaned up independent of the test (kill-on-sight rule)
- **Targeting:** Parent winner only; English-locale primary analysis (verb connotations don't survive translation), non-English secondary; pro_active excluded; strictly sequential with all other CTA-element tests.
- **Duration:** ~12-14 weeks at MID, ~4 weeks at HIGH; second child in the CTA queue.
- **Effort:** trivial
- **Notes:** From cross-cta-copy with both critics' fixes already applied (arm C dropped, arrivals primary). The methodology-ladder 'Get Pro — and a vote' vs 'Get Pro — $129/yr' label idea is dropped as duplicative: the sub-line test covers vote framing and price-visibility covers price-at-CTA.

### Page length: full page vs above-the-fold minimal (flagship big swing, exclusive window)

- **Flag:** `exp-202704-all-page-length`
- **Category:** page architecture (winner-scoped)
- **Tier:** Tier 2
- **Hypothesis:** An admin mid-task gives this page seconds, not minutes: one screen of signal (headline device, three result bullets, both real prices, fair-licence line, red CTA, demo link) will beat four screens of persuasion on attributed wcpos.com arrivals per exposed admin. The only whole-page big swing in the child set — highest information per exposure.
- **Arms:**
  1. A (control) — the winning parent variant's full page, as shipped
  2. B (minimal) — ONE minimal layout built for the winner only: its own headline device; exactly three result bullets ('Take card payments with integrated terminals' / 'Refund a customer on the spot' / 'End-of-day reports by cashier, store and payment method'); '$129 / year · $399 lifetime'; red #CD2C24 Get Pro; the fair-licence line (survives minimalism — non-negotiable); 'Ring up a sale on the live demo' link; nothing below the fold
- **Primary metric:** UTM-tagged wcpos.com/pro arrivals per unique exposed admin, 7-day first-exposure window; pre-registered returning-visitor (2nd-3rd exposure) segment because the long page's value may be on revisit.
- **Guardrails:** Attributed arrivals/purchases must not fall while CTR rises (purchase = directional monitor, never a gate — stated in the pre-registration) · demo_opened non-regression · EXCLUSIVE WINDOW: arm B removes the surfaces other tests target (table, reviews, roadmap strip) — nothing runs concurrently
- **Targeting:** Parent winner only, after the CTA-element queue clears; all locales pooled (layout contrast); pro_active excluded.
- **Duration:** ~12 weeks at MID at +50-75% MDE under the fixed-cohort model (the original '6 weeks at MID' used the broken linear-traffic math); ~6-8 weeks at HIGH.
- **Effort:** medium
- **Notes:** From cross-page-length with both critics' fixes. Also carries the design-language read that replaced the killed awning-motif test. Third child in the queue and the one genuinely worth an exclusive window.

### Free-plus headline: parallel metaphor vs result-stack

- **Flag:** `exp-2027xx-freeplus-headline (CONDITIONAL: runs only if free-plus wins the parent)`
- **Category:** hero/headline (winner-conditional)
- **Tier:** Tier 2
- **Hypothesis:** Replacing 'Free is the till. Pro runs the store.' with a concrete result-stack ('Tap the card at the till. Refund on the spot. One report at close.' — final line red) lifts engage per first-exposed unique by 40-50%+ (honestly pre-registered; a 20% true effect is undetectable and a null reads directional only).
- **Arms:**
  1. A (control) — two-tone parallel metaphor, every other element frozen
  2. B — three-line result-stack ('Take cards.' removed — Free stores already take cards on their own terminals; 'Cash up' removed as untranslatable idiom)
- **Primary metric:** Cumulative engage rate per unique FIRST-exposure visitor (returning admins create severe novelty bias); all-exposure vs first-exposure comparison as novelty check.
- **Guardrails:** Proof chip ('6,000+ stores · built since 2012') judgment-shipped and frozen BEFORE launch — no hero-surface concurrency ever · pro_active excluded; both arms fully translated (never English-gated — discarding 40% of a capped sample is the worse trade) · Support channels and reviews stay clean
- **Targeting:** Free-plus as parent winner at 100%; all locales; first-exposure cohort primary.
- **Duration:** ~8-12 weeks at MID at 40-50% MDE with kill-only early looks.
- **Effort:** trivial
- **Notes:** From v2-headline-result-stack (HONESTY arm backlogged, COMPETITIVE arm dead). Runs ALONE on the hero. Only one of the three conditional headline tests (9a/9b/9c) will ever run — the other two are archived unbuilt.

### Indie letter length: full ~150-word letter vs 3-sentence note

- **Flag:** `exp-2027xx-indie-letter-length (CONDITIONAL: runs only if indie wins the parent)`
- **Category:** hero/headline (winner-conditional)
- **Tier:** Tier 2
- **Hypothesis:** Working store owners scan: cutting the letter to a 3-sentence note ('I built this POS for my own food shop in Perth in 2012… Pro funds the work — and Pro users vote on what I build next. — Paul') pulls the ballot CTA above the fold and lifts CTA rate 50%+ among first-exposed users — the core information-density question of the variant.
- **Arms:**
  1. A (control) — full letter on paper texture, ballot right; all year counts computed from a founding-date constant, never hard-coded
  2. B — 3-sentence note, same texture, ballot unchanged; idioms locale-adapted, not literally translated
- **Primary metric:** upgrade_cta_clicked per unique first-exposed user (never per pageview); section_visible(ballot) and demo_opened secondary.
- **Guardrails:** demo_opened and engage composite must not drop · Locale as pre-registered covariate only — no subgroup decisions at MID · Pre-register the wild-challenger selection rule NOW (note wins -> shipping receipt; letter wins -> owners report) before this concludes
- **Targeting:** Indie as parent winner at 100%; all consent states; all locales.
- **Duration:** Honest window: ~17 weeks at MID for +30% — pre-register +50% instead for ~8-10 weeks, or accept the long window as the committed flagship; at LOW judgment-ship the short note.
- **Effort:** small
- **Notes:** From v1-letter-length (already cut to 2 arms; the expandable-letter arm is HIGH-era backlog). Result selects the tier-3 wild challenger's build. If indie wins, the demo side-door test runs FIRST (faster) before this occupies the hero.

### Personalised headline: order-count flattery vs computed daily pain (eligibility-gated)

- **Flag:** `exp-2027xx-personalised-headline-pain (CONDITIONAL: runs only if personalised wins the consented stratum)`
- **Category:** hero/headline (winner-conditional, consented-only)
- **Tier:** Tier 2
- **Hypothesis:** For consented stores whose active_gateways shows no integrated terminal, 'About 9 sales a day. Every card payment typed into the terminal by hand.' (with printed arithmetic: '1,240 orders over 138 days — your numbers, rough math') beats lifetime-total flattery, because a specific checkable daily pain is harder to dismiss — and every printed number is restricted to claims the profile verifiably supports.
- **Arms:**
  1. A (control) — 'You've rung up 1,240 sales on WooCommerce POS.' + gaps subline (order_count semantics verified POS-only before launch, or reworded)
  2. B — computed-pain headline; the card claim is about WORKFLOW (no terminal connected, from active_gateways) — never a card-sale count, which the profile cannot support
- **Primary metric:** upgrade_cta_clicked per first-exposed unique site (server anon_id is per-site, so flag hashing is already site-keyed — resolving v3's site_uuid randomization requirement via the identity fix).
- **Guardrails:** Data integrity: headline, receipt, and footnote arithmetic use identical per-site numbers — an auditing owner must find zero inconsistencies · Cold-start exclusion: <~30 orders or <14 days since install routed to the cold-start fallback, never randomized · Nothing else runs concurrently on the personalised surface · pro_active excluded
- **Targeting:** Personalised, consented sites only, eligible stratum only (no integrated terminal), randomized within eligibility — no intent-to-treat fallback rendering; all locales served, English segment primary.
- **Duration:** One fixed quarter at HIGH (the eligible stratum is ~400-500 sites/arm — MDE is roughly 2x); sub-threshold pre-declared as 'no large effect, decide by judgment'.
- **Effort:** medium
- **Notes:** From v3-headline-number-framing (arm B already dropped; '9 CARD sales' fabrication removed program-wide). Holds the consented-track slot; starts only after the parent settles on or formally commits to personalised.

### Indie demo escape hatch: no demo link vs text link under the CTA

- **Flag:** `exp-2027xx-indie-demo-link (CONDITIONAL: runs only if indie wins the parent — and runs FIRST among indie children)`
- **Category:** demo funnel (winner-conditional)
- **Tier:** Tier 2
- **Hypothesis:** Adding 'Or ring up a sale on the live demo first' (locale-adapted, never literally translated) beneath the CTA lifts the engaged-session rate, because skeptics who won't pay on a letter's word will accept a lower-commitment proof step — and the demo, full Pro, is built to win them.
- **Arms:**
  1. A (control) — no demo link on the indie page
  2. B — text link under the CTA: 'Or ring up a sale on the live demo first' with credentials per the demo-autologin winner (auto-login link if B won there, demo/demo hint otherwise)
- **Primary metric:** Engaged-session rate per unique first-exposed user (CTA click OR demo_opened), with the decomposition (CTA-only / demo-only / both) always reported alongside.
- **Guardrails:** Pre-registered maximum relative CTA-alone drop (e.g. -10%) — the cannibalization guard is underpowered in-test (~21k/arm to detect -20%), so commit to post-ship monitoring · Decision rule pre-registered: ship on composite win UNLESS CTA-alone breaches the threshold
- **Targeting:** Indie as parent winner; all consent states and locales.
- **Duration:** ~4-6 weeks at MID — the fastest real test available; deliberately banked before the slower letter-length flagship.
- **Effort:** trivial
- **Notes:** From v1-demo-side-door (secondary-button arm already cut). If indie loses the parent, this dies unbuilt and the demo-prominence test (next item) covers the demo question on the actual winner.

### Demo prominence: buried text link vs cream secondary button

- **Flag:** `exp-2027xx-all-demo-button (CONDITIONAL: runs only if free-plus or personalised wins the parent)`
- **Category:** demo funnel (winner-conditional)
- **Tier:** Tier 2
- **Hypothesis:** Promoting the demo from body-text link to an outlined cream #F5E5C0 secondary button beside the red Get Pro ('Try the live demo' + 'Full Pro. No signup.') will at least double demo_opened, because a button is a visible affordance and skeptical owners who won't click a buy button will click a try button — the best-powered landing test in the program (~1.5k/arm for a 100% lift on a ~1.5% baseline).
- **Arms:**
  1. A (control) — text link under the CTA block
  2. B — outlined cream secondary button beside the red CTA (red stays reserved for Get Pro); credentials microcopy only if auto-login hasn't shipped
- **Primary metric:** demo_opened per unique exposed visitor (where the detectable effect lives — not combined engage); demo-side session depth via aid pass-through secondary.
- **Guardrails:** upgrade_cta_clicked non-inferiority: must not drop more than 15% relative (pre-registered cannibalization bound — if demo clicks merely replace CTA clicks, control wins) · Never concurrent with hero-imagery changes or CTA-cluster tests (it changes the CTA cluster's visual hierarchy)
- **Targeting:** Parent winner (free-plus or personalised) at 100%; all locales; pro_active excluded.
- **Duration:** ~4-8 weeks at MID — genuinely feasible; one of the few honestly-powered MID tests.
- **Effort:** small
- **Notes:** MERGED from v2-demo-secondary-button + cross-demo-treatment (same test, two write-ups; copy-contrast arm dead per the stricter statistician cut). Pre-registered follow-up if B wins: demo-first hero decided on demo_sale_completed (the methodology-ladder item, folded here rather than holding its own slot).

### Personalised anon on-ramp: consent-first ask page vs free-plus clone (GO/NO-GO)

- **Flag:** `exp-2027xx-personalised-anon-onramp (CONDITIONAL: runs only if personalised wins the consented 3-way — REQUIRED before any anon rollout)`
- **Category:** consent & measurement substrate (winner-conditional)
- **Tier:** Tier 2
- **Hypothesis:** Offering non-consented admins an informed in-page opt-in ('Use my store's numbers' — cream button, exact fields named, destination named, full-disclosure link; page re-renders personalised on grant) converts a meaningful share to consented — the only on-page metric with a base rate (~10-25%) high enough to power a real experiment — and every grant permanently grows the identified population; the clone arm tests whether anon traffic should skip personalised scaffolding entirely.
- **Arms:**
  1. B — consent-first informed-ask page (informed-consent standard is non-negotiable; generic gap cards below for non-granters)
  2. C — full free-plus clone for anon traffic assigned to personalised
- **Primary metric:** consent_granted per persistent anonymous distinct_id in arm B vs a pre-registered GO/NO-GO threshold (the powerable decision); cross-arm engage is directional only.
- **Guardrails:** upgrade_cta_clicked must not collapse in arm B · Arm C exposures tagged and excluded from any lingering parent analysis · Version-gated to plugin releases with the consent endpoint + profile regeneration — older installs excluded, never shown a broken ask · Consent copy translated and reviewed (legal-adjacent surface)
- **Targeting:** Anonymous traffic only, persistent distinct_id unit; personalised page frozen for the duration (arm B's post-consent destination must not be a moving target).
- **Duration:** ~4-8 weeks at MID (high base-rate metric).
- **Effort:** large
- **Notes:** MERGED from v3-anon-fallback + methodology ladder item 7 ('degrades gracefully' is currently an untested assumption — this must run BEFORE personalised ever serves anon traffic at 100%). Under the two-flag architecture anon traffic sees indie/free-plus during the parent, so this only exists post-parent. Interim default if plumbing lags: clearly-labeled 'NOT YOUR DATA' example-store fallback at 100% by judgment. Tier-3 payload-preview test follows only if B wins.

### Pricing anchor on wcpos.com/pro: current vs lifetime-first vs per-day math (observed purchases)

- **Flag:** `exp-2027xx-all-pricing-wcpos (runs OUTSIDE the landing flags, on wcpos.com/pro)`
- **Category:** pricing & offer (off-landing surface)
- **Tier:** Tier 2
- **Hypothesis:** On the one page where every purchase and SKU choice is directly observable, leading with '$399 once — yours for good' vs '$129/yr' vs a subordinate per-day line measurably shifts purchase mix and revenue per visitor — the question anchoring theory actually predicts (WHICH purchase, not click propensity), which is why the landing-page version was killed.
- **Arms:**
  1. A (control) — current presentation ($129/yr primary, $399 lifetime secondary, per-site noted)
  2. B — lifetime-first ('yours for good' verified against actual licence terms; no urgency, no strikethroughs)
  3. C — per-day math: '$129/year, per site' primary + 'That works out to about 35 cents a day.' (annual always typographically primary; lifestyle comparisons banned outright)
- **Primary metric:** Revenue per visitor and SKU mix (yearly vs lifetime) on wcpos.com/pro — every data point a real observed purchase; checkout starts secondary.
- **Guardrails:** Pre-registered revenue floor: lifetime-first must not cannibalize recurring revenue below the agreed band — revenue per visitor decides, never conversion count · Refund/chargeback rate by arm (netted via the reconciler) · Both prices real and currently sold — no fake anchoring
- **Targeting:** wcpos.com/pro visitors from ALL sources (pooled, not a third of a capped wp-admin audience); requires PostHog on wcpos.com from Experiment Zero; UTM segmentation separates landing-sourced traffic.
- **Duration:** Directional 1-2 quarter read pre-registered as such — single-digit weekly purchases make this a revenue/SKU-mix monitor, not a significance machine.
- **Effort:** medium
- **Notes:** Kept from v2-pricing-anchor-wcpos. Sequenced AFTER the landing price-visibility test concludes so its SKU-mix guardrail read isn't muddied; thereafter stratify by landing arm history. Independent of landing traffic, so LOW-viable.

## Tier 3

### Comparison format: check/cross table vs ONE narrative-honesty challenger

- **Flag:** `exp-2027xx-freeplus-format (CONDITIONAL: free-plus winner, HIGH traffic)`
- **Category:** page architecture (winner-conditional)
- **Tier:** Tier 3
- **Hypothesis:** Replacing check/cross marks with the single best narrative format (workaround-copy cells naming the real Free workflow, or a day-timeline) lifts engage 40%+ by making the daily time cost concrete without disparaging the product the visitor already runs.
- **Arms:**
  1. A (control) — existing result-led table, row order frozen from the gap-correlation analysis
  2. B — ONE challenger pre-selected by 5-second comprehension tests in the qualitative program (workaround-copy is the statistician's pick; day-timeline's 17:30 cell uses the corrected honest copy)
- **Primary metric:** Cumulative engage per unique first-exposure visitor, 40-50% MDE, sequential monitoring.
- **Guardrails:** Tone: the Free column must never read as disparaging — support-channel complaints are a kill trigger · All feature/support claims re-verified verbatim against current docs at launch · Timestamps and headers localized; 14+ strings per locale budgeted
- **Targeting:** Free-plus winner only; strictly after the headline test concludes; receipt artifact reserved for personalised (cross-variant entanglement rule).
- **Duration:** ~10-12 weeks at HIGH; not run below HIGH — if control wins or no slot opens, workaround-copy is an adopt-or-drop brand judgment call.
- **Effort:** medium
- **Notes:** From v2-comparison-format (already a merge of two generated tests). Row-order and row-count questions are answered by the gap-correlation analysis and expander instrumentation, not tests.

### Ballot prominence: sidebar card vs full-width hero ballot

- **Flag:** `exp-2027xx-indie-ballot-position (CONDITIONAL: indie winner, HIGH traffic)`
- **Category:** ballot element (winner-conditional)
- **Tier:** Tier 3
- **Hypothesis:** The ballot carries both the CTA and the participatory mechanic; full-width hero placement (letter below) beats a skippable right-hand widget — versus the opposing theory that the ask lands before trust is built.
- **Arms:**
  1. A (control) — letter-length WINNER's layout (re-specced against that result before launch), ballot right
  2. B — ballot-first hero with one-line lede ('Pro users vote on what gets built next. Here's the current ballot.'), letter below in a 65ch column
- **Primary metric:** upgrade_cta_clicked per unique first-exposed user; click-through-from-ballot-seen separates 'more saw it' from 'it persuaded better'.
- **Guardrails:** Pre-registered week-over-week treatment-decay check — highest novelty risk in the set; no calls on week-1 data · Engage composite non-regression · Live-tally policy: real counts or no numbers — never seeded
- **Targeting:** Indie winner only; requires the ballot component, section_visible event, and a real tally endpoint (none exist in the repo today); never concurrent with any other ballot or CTA test.
- **Duration:** ~8-10 weeks at HIGH; ~17 weeks at MID — HIGH-gated.
- **Effort:** medium
- **Notes:** From v1-ballot-position (2 arms). First in the ballot sequence; ballot-cream follows it.

### Ballot theme: dark card vs cream paper ballot

- **Flag:** `exp-2027xx-indie-ballot-cream (CONDITIONAL: indie winner, HIGH traffic, after ballot-position settles)`
- **Category:** ballot element (winner-conditional)
- **Tier:** Tier 3
- **Hypothesis:** The dark inset reads as an ad unit inside light wp-admin (banner blindness); a cream #F5E5C0 paper ballot ('OFFICIAL BALLOT — WOOCOMMERCE POS ROADMAP', perforated edge) extends the letter's physical-artifact metaphor and lifts CTA rate — the statistician's 'best-constructed test in the set' (CTA lives inside the changed element).
- **Arms:**
  1. A (control) — dark ballot card, positioned per the ballot-position winner
  2. B — cream paper ballot; checkbox glyphs rendered as clearly pre-printed decoration (launch condition: no dead interactive-looking elements)
- **Primary metric:** upgrade_cta_clicked per unique first-exposed user; clicks per ballot-seen as persuasion isolate.
- **Guardrails:** Misclick/dead-click rate on ballot decoration (frustration violates respect and contaminates the test) · Engage composite non-regression
- **Targeting:** Indie winner only; all locales ('OFFICIAL BALLOT' header translated); never concurrent with other ballot tests.
- **Duration:** ~4-6 weeks at HIGH; ~4 months at MID — HIGH-gated.
- **Effort:** small
- **Notes:** From v1-ballot-cream. The selectable-ballot test (v1-ballot-select) is DROPPED from the program — its preferred path per v1's own critics is shipping the selectable ballot as an instrumented feature (ballot_row_selected demand telemetry, honesty-gated on real vote pass-through), not an A/B.

### WILD challenger slot: shipping-receipt changelog OR annual owners letter (one build only)

- **Flag:** `exp-2027xx-indie-wild-challenger (CONDITIONAL: indie winner, HIGH traffic, final sequential challenger)`
- **Category:** page architecture (winner-conditional, big swing)
- **Tier:** Tier 3
- **Hypothesis:** Replacing the optimized letter+ballot base with a whole-page verifiable-facts artifact converts the longevity/no-investors claims from assertion into scannable evidence, lifting CTA rate 30%+ — build selected by the rule pre-registered before letter-length concluded (short note wins -> shipping receipt; full letter wins -> owners report), carrying the letter-length WINNER's copy so page structure is the only manipulated factor.
- **Arms:**
  1. A (control) — the optimized indie base (letter-length winner merged with ballot-position winner)
  2. B — the ONE selected challenger: shipping receipt (thermal changelog timeline, one verifiable line per year, dates computed from constants, ballot epics as receipt lines, CTA + both prices at the foot) OR owners report (wp-admin-native masthead, WHAT SHIPPED verbatim changelog items with versions, WHAT'S ON THE BALLOT real epics, THE ASK with fair-licence P.S.)
- **Primary metric:** upgrade_cta_clicked per unique first-exposed user, powered at +30% MDE only — never pretend +20% is reachable.
- **Guardrails:** EARLY-KILL GATE (receipt build): <40% of exposed users reaching the receipt footer in 2 weeks stops the test · Staleness audit: every date/count computed from constants or pulled live — a stale figure on a longevity page is self-refuting · Week-over-week decay check (maximum novelty effect on returning admins)
- **Targeting:** Indie winner only; all locales (changelog lines verbatim-verifiable in every locale).
- **Duration:** ~8-10 weeks at HIGH; ~17 weeks at MID — schedule only at HIGH.
- **Effort:** large
- **Notes:** From v1-wild-challenger (two wilds already collapsed into one pre-registered slot). The receipt artifact is also personalised's signature move — acceptable since users see one variant, but flagged for the design owner.

### Proof artifact: thermal receipt vs end-of-day Z-report table

- **Flag:** `exp-2027xx-personalised-artifact-format (CONDITIONAL: personalised winner, consented track, HIGH traffic)`
- **Category:** personalisation (winner-conditional)
- **Tier:** Tier 3
- **Hypothesis:** Store owners read register close-out reports daily: a Z-report-styled 'End of day — Free vs Pro' table makes the delta instantly legible and reframes Pro as 'the register that closes itself out', beating the charming-but-decorative receipt.
- **Arms:**
  1. A (control) — corrected cream receipt: supportable claims only (workflow card claim from active_gateways, capability statements where the profile lacks the signal), pricing block '$129/YEAR ($129 ÷ 365 = $0.35 A DAY)' with printed arithmetic
  2. B — monospace Z-report table (card payments / refund request / closing rows), identical settled pricing block so FORMAT is the only manipulated factor
- **Primary metric:** upgrade_cta_clicked per first-exposed unique site; section_visible:artifact secondary.
- **Guardrails:** Artifact arithmetic identical to headline and footnote numbers — zero inconsistencies for auditing owners · No fabricated per-store facts (no refund counts, no card/cash split — the profile doesn't have them) · English segment pre-registered (monospace layouts carry translation risk)
- **Targeting:** Personalised winner, consented sites only, same eligibility hygiene as headline-pain; runs strictly AFTER headline-pain reads out (same surface, same thin segment).
- **Duration:** One fixed quarter at HIGH; realistically the consented track's second and possibly final test of the year — may end as a directional read, pre-declared.
- **Effort:** medium
- **Notes:** From v3-artifact-receipt-vs-cards-vs-eod (postbox-cards arm already dead).

### Consent-ask depth: field-list summary vs inspectable real-payload preview

- **Flag:** `exp-2027xx-personalised-consent-disclosure (CONDITIONAL: personalised winner AND anon-onramp resolved in arm B's favor)`
- **Category:** consent & measurement substrate (winner-conditional)
- **Tier:** Tier 3
- **Hypothesis:** wp-admin users are privacy-literate: an expandable 'See exactly what's sent' preview of the literal JSON payload for THEIR site beats a summary field list on consent grants, because inspectability beats reassurance — and consent rate is a metric this page can actually power.
- **Arms:**
  1. B1 (control) — the winning informed-summary ask from the anon-onramp test
  2. B2 — identical + inline expansion showing the actual payload, generated from the same code path that transmits it; expansion fires consent_preview_expanded
- **Primary metric:** consent_granted per persistent anonymous distinct_id; consent_preview_expanded as audit-behavior telemetry.
- **Guardrails:** Both arms meet the informed-consent standard — vague-vs-informed is NEVER tested (honesty is not A/B-tested on this brand) · Payload preview must be literally true · upgrade_cta_clicked non-regression
- **Targeting:** Anonymous traffic on consent-endpoint plugin versions seeing the consent-first on-ramp; consent copy fully translated, no English gating (legal-adjacent surface).
- **Duration:** ~4-8 weeks at MID (high base-rate metric) — the rare tier-3 entry that is MID-viable, but it cannot exist until its two conditions resolve.
- **Effort:** small
- **Notes:** From v3-consent-ask-disclosure. The deeper consent-placement question (onboarding vs settings vs this page) is plugin-side and handed to the program owner as a recommendation.

### Honest disqualifier: 'Who shouldn't buy Pro' section

- **Flag:** `exp-2027xx-freeplus-disqualifier (CONDITIONAL: free-plus winner, HIGH traffic; below HIGH, judged by the qualitative program instead)`
- **Category:** social proof / honesty (winner-conditional)
- **Tier:** Tier 3
- **Hypothesis:** 'If you only take cash and rarely do refunds at the till, Free is probably all you need. Pro is for stores where cards, refunds, and end-of-day reports are daily work.' — disqualification is costly signaling of honesty (the most Paul-sounding thing the page could say), lifting engage among the qualified majority while filtering regret-prone purchases the metrics can't see.
- **Arms:**
  1. A (control) — no disqualifier
  2. B — short disqualifier section after the comparison area (passes banned-word lint; explicitly states who should NOT buy)
- **Primary metric:** Combined engage per unique exposed visitor at 40%+ MDE.
- **Guardrails:** Review sentiment and support channels — the real long-horizon readout · Asymmetric decision rule pre-registered: flat engage + clean guardrails defaults to SHIP on brand-principle grounds (mirroring the fair-licence logic)
- **Targeting:** Free-plus winner only; all locales, fully translated; pro_active excluded.
- **Duration:** ~10-12 weeks at HIGH; skipped below HIGH in favor of qualitative judgment with real store owners.
- **Effort:** small
- **Notes:** From v2-honest-disqualifier. Its true payoff (trust, fewer regretted purchases) is mostly unmeasurable in-test — pre-registered honestly.

### Returning-visitor treatment: full re-pitch every visit vs quiet state with real news and an honored dismiss (merged lifecycle test)

- **Flag:** `exp-2027xx-all-returning-visitor (winner-scoped, HIGH traffic; instrumentation ships in Phase 0 regardless)`
- **Category:** lifecycle / returning visitors
- **Tier:** Tier 3
- **Hypothesis:** The page's real audience is the same admins seeing it dozens of times; from the 3rd tracked exposure, a condensed quiet state — plus a 'Since you last looked: v1.9.2 shipped — [real changelog line]. The ballot moved.' strip rendered ONLY when something genuinely shipped, plus a 'Hide this page' link that is actually honored — preserves long-run engagement and trust better than compounding banner blindness; pitch FREQUENCY is a bigger lever than copy for a captive returning audience and nothing else measures fatigue.
- **Arms:**
  1. A (control) — identical full page every visit
  2. B — from 3rd+ exposure (localStorage visit counter): condensed recap, small persistent Get Pro, freshness strip gated strictly on real releases/ballot movement (never manufactured), durable dismiss re-accessible from the plugin menu; first and second exposures untouched
- **Primary metric:** Engage per unique 3rd+-visit admin over a long pre-registered horizon; the CTR-decay-by-exposure-count curve in both arms is itself a deliverable.
- **Guardrails:** First/second-exposure experience identical in both arms (no contamination of other tests' first-exposure cohorts) · Deactivation proxy (28-day zero-pageview cohort) as primary guardrail · Dismissal genuinely durable — no dark-pattern resurrection · Condensed state never hides the fair-licence line or pricing
- **Targeting:** Parent winner; visitors with >=3 prior pageviews per persistent distinct_id (requires the identity fix); all locales; pro_active excluded.
- **Duration:** HIGH-only as a powered test (the heavy-returner cohort is a thin slice of a capped population); long horizon.
- **Effort:** medium
- **Notes:** MERGED from v1-fresh-strip + v2-returning-visitor-fatigue + v3-repeat-exposure-respect + cross-returning-strip + methodology ladder item 6 — four lists independently demanded this; one slot. The visit counter and first-exposure cohorting ship in week 0 for free observational decay data across all experiments. If the qualitative poll shows annoyance first, ship the dismiss affordance by judgment — respect is not contingent on significance.

### CTA repetition: single block vs compact inline rows after major sections (pinned bars permanently dead)

- **Flag:** `exp-2027xx-all-cta-repeat (winner-scoped, HIGH traffic)`
- **Category:** CTA placement (winner-scoped)
- **Tier:** Tier 3
- **Hypothesis:** A compact one-line CTA row ('Pro is $129/yr, per site — [Get Pro]') repeated after the comparison section and the roadmap strip lifts measured CTA rate 30-40% mechanically — with the pre-registered caveat that click inflation without downstream arrival signal is diagnostic of where decisions happen, not proof of added persuasion.
- **Arms:**
  1. A (control) — single CTA + pricing block in current position
  2. B — main block unchanged + identical compact rows after the two anchor sections, every click position-tagged
- **Primary metric:** upgrade_cta_clicked per unique exposed visitor; click distribution by position and UTM arrivals-per-click as the quality readouts.
- **Guardrails:** Directional UTM-joined arrivals must not be worse than control · Qualitative channels stay clean — a click-inflation win ships only if they do (pre-registered) · Repeated rows never render for pro_active:true
- **Targeting:** Parent winner, after the comparison/format surface is stable; all locales.
- **Duration:** ~8-10 weeks at HIGH.
- **Effort:** small
- **Notes:** From v2-cta-repetition. DEDUPE RULING: cross-sticky-cta is KILLED program-wide by the stricter free-plus ruling — a pinned upsell bar inside wp-admin is the most resented pattern in the WordPress ecosystem and its reputational cost among 6,000 existing users is unmeasurable; inline repetition keeps the only slot for this question.

### Owned-channel email capture: placement of 'Get the release notes / see what Pro users voted for' signup

- **Flag:** `exp-2027xx-all-email-capture (winner-scoped, MID/HIGH)`
- **Category:** owned channel / mid-funnel conversion
- **Tier:** Tier 3
- **Hypothesis:** A consented email signup is a high-frequency TRUE conversion (10-50x purchase frequency) that partially routes around the cross-domain gap and builds the only owned channel this program has; placement near the roadmap strip ('see what Pro users voted for') will out-convert a footer placement because it attaches to the page's participatory mechanic.
- **Arms:**
  1. A — signup row attached to the roadmap/ballot element
  2. B — signup row in the footer
- **Primary metric:** email_signup per unique exposed visitor (event already specced in the taxonomy with source property).
- **Guardrails:** Honest copy, no incentive tricks, single field, banned-word lint · Must never visually compete with the CTA cluster (placement constraint, audited) · upgrade_cta_clicked non-regression
- **Targeting:** Parent winner; all locales; pro_active excluded.
- **Duration:** ~6-10 weeks at MID (signup base rate should comfortably exceed CTA rate once placed); faster at HIGH.
- **Effort:** small
- **Notes:** From methodology ladder item 5 — the only roster entry no category list spec'd, included because the methodology identifies intermediate true conversions as the program's best power lever after demo_sale_completed. Build the double-opt-in plumbing before the test.

## Program summary (as synthesized)

This program consolidates four refined experiment lists (indie, free-plus, personalised, cross-cutting) into one 25-experiment roadmap governed by the final methodology. The centerpiece and tier-1 item #1 is the parent landing-variant test — indie vs free-plus vs personalised — run on the methodology's two-flag architecture (landing-variant-consented 3-way for profiled sites, landing-variant-anon 2-way indie/free-plus for anonymous traffic, selected client-side by locally-known has_profile so anon users never see personalised's fallback). It is the only well-powered experiment available against a fixed ~6,000-install population, and everything else is sequenced around protecting its clean read. Nothing launches before the blocking infrastructure: the identity fix (server-generated wcpos_anon_id, localStorage persistence, always-bootstrap-as-anon_id so identify() performs a real merge — replacing the verified persistence:'memory' at src/lib/analytics.ts:26), GA removal from the anon tier, the cross-domain purchase reconciler (licence-activation join + server-set 90-day wcpos_attr cookie + refund netting), the event taxonomy, and a 2-week mechanics-only A/A that is a hard gate.

Deduplication collapsed heavy overlap: four consent-ask proposals became one tier-1 plugin-surface test (plus a personalised-only payload-preview follow-up in tier 3); three lifetime-pricing proposals became one uniform cross-variant price-visibility test (the single child permitted concurrent with the parent at MID), with the wcpos.com anchor test kept separately because it reads observed purchases; two demo-autologin proposals merged into one conditional-on-click test; and four returning-visitor proposals (fresh-strip, fatigue, repeat-respect, returning-strip) merged into one tier-3 lifecycle test whose visit-counter instrumentation ships now. Stricter rulings won every conflict: cross-sticky-cta is killed by free-plus's anti-pinned-bar ruling (inline CTA repetition keeps the slot); the v1 global holdout is withdrawn per the methodology's fixed-cohort math (purchase significance never arrives — the 80/20 runner-up holdout at HIGH is monitoring only); ballot-select, letter-l10n, hero-screenshot, and the roadmap-parity strip move to the judgment-ship bundle. Tier 1 is concurrency-clean: the A/A precedes the parent; consent-ask lives on a different surface with a different metric; price-visibility applies uniformly and orthogonally across all parent arms; demo-autologin is visually invisible and analyzed conditional-on-click — and at MID the calendar still staggers it behind price-visibility to honor the parent-plus-one rule.

Honest limits are built in rather than discovered later: purchase is never a decision metric at any tier (beta-binomial posterior, directional only, netted of refunds); all rates are cumulative per unique site on first-exposure cohorts; MID supports roughly +50% relative MDEs over 10-14 weeks and LOW supports only the parent over a full 6 months at a +75-100% floor; the consented 3-way is directional-only at every tier and accumulates all program. Tiers 2-3 are mostly winner-conditional (three headline tests are written but only the parent winner's runs), so the effective program is ~16-18 executions — deliberately, because the fixed cohort funds roughly one CTA-area test per quarter at MID. Brand constraints are kill conditions, not tradeoffs: voice violations die regardless of metrics, every arm passes a banned-word lint, all per-store claims must be verifiably true, and 'annoying but converting' is a kill.

## Sequencing calendar (as synthesized; spec §6.4 supersedes)

MONTH 0 — JUNE 2026 (identical at LOW and MID): Foundation sprint, no experiments. Ship the identity fix (localStorage persistence, bootstrap-as-anon_id, person_profiles:'always', before_send stripping), remove GA from the anon tier, publish privacy/readme disclosure + uninstall/WP-CLI affordances, release the plugin update carrying wcpos_anon_id and the rewritten-consent-ask flag plumbing. Build reconciler + server-set wcpos_attr cookie + refund hook; instrument demo.wcpos.com + start the signed auto-login endpoint; create both parent flags, ops-landing-kill-switch, hardcoded asset map; bump analytics_schema_version. Verify ph.wcpos.com server version (payloads, $feature_flag_called, string operators, Experiments availability) and record fallbacks. Measure week-0 baselines (pageview:unique ratio, cumulative-unique curves, cumulative engage, consented share). Ship the judgment parity bundle and freeze pages. Launch the qualitative poll + long-tenure outreach and the gap-correlation analysis. || MONTH 1 — JULY 2026 (identical at LOW and MID): A/A mechanics validation runs 2 weeks (hard gate: dual SRM, stickiness, dedup, consent-transition merge on the pinned posthog-js version). Consent-ask test (exp-202607-all-consent-ask) launches mid-month on the new release surface — viable at both tiers. Track the adoption gate (>=60% has_anon_id) on the Locale & Population dashboard; lock baselines and pre-register parent MDEs (+50% at MID, +75-100% at LOW) and the stop rule. || MONTH 2 — AUGUST 2026: Adoption gate passes (if fleet adoption lags, the parent slips and everything shifts right — pre-accepted). PARENT LAUNCHES: anon 2-way (indie vs free-plus) + consented 3-way (directional). MID: price-visibility child (exp-202608) launches staggered >=1 week later — the ONE permitted concurrent child. LOW: ZERO children; the lifetime-price question is parked for a judgment decision. Day-14/28 kill-only looks both tiers. || MONTH 3 — SEPTEMBER 2026: Parent accrues. MID: consent-ask concludes (~6 weeks) — ship the winner fleet-wide; price-visibility continues; demo auto-login endpoint finished and held. LOW: consent-ask concludes around week 8; first qualitative synthesis (target 30+ poll responses) and gap-correlation report delivered (feeds table row order and personalised gap ranking). Monthly attribution-coverage review begins. || MONTH 4 — OCTOBER 2026: MID: price-visibility hits its ~10-12-week horizon — single ship decision (sub-threshold = keep by judgment); demo auto-login (exp-202609) launches as the next single child (~4-6 weeks, conditional-on-click). LOW: parent only; weekly 10-minute SRM + guardrail check; purchase posterior updated, never adjudicated. || MONTH 5 — NOVEMBER 2026: MID: parent reaches its ~12-14-week horizon — DECISION GATE: pick the winner (free-plus is the reference arm; draw = cheaper-to-maintain/brand-default plus recorded bound); collapse to 100% winner; archive losers; consented 3-way keeps accruing directionally all program; demo auto-login concludes and its winner ships everywhere a demo link exists. LOW: parent continues — the honest plan is the full 6 months at the +75-100% MDE floor; resist peeking. || MONTH 6 — DECEMBER 2026: MID: first winner-scoped child launches — cta-subline (exp-202612, fair-licence vs vote), UNLESS indie won, in which case the fast indie demo side-door runs first; wcpos.com pricing-anchor test launches on its own surface now that price-visibility has concluded; 6-month write-up with confidence bounds, net attributed revenue by variant, novelty analysis, and the next 6-month ladder (cta-copy -> page-length exclusive window -> winner headline test -> demo-button/anon-onramp conditionals). LOW: parent decision at end of month (or one pre-registered 4-week extension if trending); below MID, tier 2 stays deferred — the program runs on judgment-ships, the qualitative program, consent-rate tests, and the wcpos.com surface until traffic proves otherwise. || HIGH-TRAFFIC NOTE: if week-0 measurement reveals HIGH (~2,000/day), the parent concludes ~10-12 weeks at +30-40% MDE, price-visibility and demo-autologin run as the two staggered orthogonal concurrent children, the winner ships at 80/20 with the runner-up holdout as monitoring only, and the tier-2 queue starts in month 4 instead of month 6.

## Open questions raised by the factory

- What is the actual traffic tier? The entire calendar branches on week-0 measurement (pageview:unique ratio, cumulative-unique curves, consented share) — if LOW is the reality, the program is the parent test plus consent-ask plus judgment-ships and qualitative work for six months, and everyone should agree to that now.
- Does the ph.wcpos.com build support flag payloads, automatic $feature_flag_called capture, and contains/regex cohort operators — and does bootstrap.distinctID take precedence over an already-persisted distinct_id on the pinned posthog-js version (the consent-transition merge must be verified during the A/A)?
- Will Paul sign the written annual-vs-lifetime decision rule (acceptable mix band, measurement window, revenue floor) before any pricing test launches — and does he even want to steer mix toward lifetime?
- How fast does the plugin fleet actually update — and what is the fallback plan if has_anon_id adoption stalls below the 60% gate for months (launch on localStorage-only randomization with permanent segmentation, or keep waiting)?
- Does order_count in ConsentProfile mean POS-only orders or all WooCommerce orders, and is days_since_install reliable — both must be verified before any personalised per-store arithmetic is printed.
- Should the parent test conclude before ANY landing child runs (the conservative option), or is the pre-registered orthogonal-uniform exemption for price-visibility acceptable — this needs an explicit signed decision, not an implicit one.
- When can the plugin-side consent endpoint + profile regeneration ship, since it gates the personalised anon on-ramp test and the payload-preview follow-up?
- What is the draw policy for the parent — who adjudicates 'cheaper to maintain / closer to brand default' among three pages Paul built, and is free-plus as the designated reference arm accepted?
- Is the demo server's abuse posture (seeded sessions, signed auto-login tokens, rate limits) acceptable to operate, and can demo data be sandboxed per-session?
- Are the LIA, ePrivacy disclosure (localStorage writes + wcpos.com attribution cookie), and wp.org guideline-7 review signed off by whoever owns plugin-directory risk before the anon_id release ships?
- Should indie get a demo link by judgment for parity before the parent read (helping the parent comparison's fairness) — or is preserving the conditional side-door test worth indie running demo-less through the parent window? Current ruling: preserve the test; revisit if the parity concern strengthens.
- Is the end-to-end roadmap-vote pass-through (selection carried through wcpos.com checkout and provably applied) feasible — it gates the judgment-ship of the selectable ballot as an instrumented feature and any future 'SHIPPED BY VOTE' labeling.
