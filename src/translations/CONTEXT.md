# Translator context — wp-admin-landing namespaces

This document gives translators the context they need to localise the WooCommerce
POS landing-page strings well. The landing page is the primary free→Pro conversion
funnel, so tone and idiom matter as much as literal accuracy.

Translations for this project are **self-contained in this repo** (`wcpos/wp-admin-landing`).
Locale files live at `src/translations/<wp_locale>/<namespace>.json`, beside the English
source at `src/translations/en/`, and are served from the same `@v2` jsdelivr release tag
as the JS bundles. Landing strings are **not** mirrored to `wcpos/translations`.

## Namespaces

One namespace per landing-page variant, plus a shared namespace:

- `wp-admin-landing-shared` — strings common to all variants (reviews strip, roadmap
  card, CTA atoms).
- `wp-admin-landing-indie` — the "indie" variant.
- `wp-admin-landing-free-plus` — the "free-plus" variant.

## Target locales (11)

Locale directories use **WP locale codes**:

`fr_FR`, `de_DE`, `es_ES`, `it_IT`, `nl_NL`, `pt_BR`, `ja`, `zh_CN`, `ko_KR`, `ar`, `hi_IN`

(English is the bundled source and the final fallback; missing locale files 404 and the
chained backend falls back to bundled English — expected until translations are generated.)

## Idiom rules

These are point-of-sale / retail terms. **Locale-adapt the idiom; never translate it
literally.** Use the natural equivalent a shopkeeper in the target language would say.

- **"till"** = the cash register / point of sale. Never farm tillage or soil cultivation.
- **"ring up a sale"** = process a sale at the register. Never any phone-call sense of "ring".
- **"cash up"** = the end-of-day register reconciliation (counting the drawer). Not a
  literal "cash" action.

## Tone

- **indie variant** — a shopkeeper-to-shopkeeper letter from Paul: warm, plain, first
  person. It should read like a person who runs a shop talking to another shop owner.
- **free-plus variant** — a plain product page. Clear and factual, no hard sell.

## Brand and formatting rules

- **No urgency language.** No "act now", "limited time", countdowns, or scarcity framing.
- **No emoji.**
- **Preserve `{placeholder}` interpolations.** They may be repositioned within the
  sentence to suit grammar, but must never be removed, renamed, or translated.
- **Prices stay in USD, exactly as written.** Do not convert currencies or localise prices.
- **Proper nouns are not translated:** WooCommerce POS, WordPress.org, Discord,
  Urban Locavore, Perth.
- **Never translate review quotes.** Reviews are not part of these namespaces. adeline's
  review renders in its original French for `fr` locales via code — leave review content
  to the application, not the translation files.

## Launch gate

The parent experiment cannot launch until **both variants pass translation review in all
shipped locales** (spec §4; Paul may stage the launch gate on the highest-traffic locales first).

## Locale-specific notes

- **ro_RO:** `{yearsAgo} ani` / `{releaseYears} ani` deliberately omit the linking particle "de" — Romanian requires bare `ani` for 2–19 and `de ani` for ≥20; runtime values stay under 20 until ~2034. Revisit with ICU plurals before then.
- **th:** fixed dates in UI chips use Buddhist Era years; years inside the brand story (2011/2014) stay CE.
- **RTL (ar, he_IL):** placeholders are LTR tokens inside RTL text; no direction-control characters in the JSON — layout handles RTL. Both need the §4 RTL layout QA pass.
