# Product blueprint

## The call

**Build it, but not as "a better MAX Peptide AI".** Build the GLP-1 companion that protects muscle, fixes sleep and teaches as you go. Peptide stacks are a supported secondary segment, not the headline.

Why: the GLP-1 market is 100x the grey-market peptide niche, it is legally clean (licensed medicines), it has a B2B channel (UK private pharmacies and clinics need adherence and reporting), and the incumbents are all trackers, not coaches. Confidence: 75%.

What not to build: a "protocol recommender" for unlicensed compounds, sourcing links, a general-purpose AI chat as the hero feature, weekly subscriptions.

## Working name

**Keel** (keeps you steady; the thing under the boat that stops you capsizing). Alternatives: Lean, Steady, Tether. Pick one that has a .app or .co.uk and no App Store collision. Do not use "peptide" or "GLP-1" in the brand; keep those in the store listing keywords.

## Positioning

> Lose the fat. Keep the muscle. Sleep like it matters.
> The GLP-1 and peptide companion that teaches you as you go.

## Who it is for

1. **Primary:** UK adults on Mounjaro or Wegovy (private pharmacy or NHS), weeks 0 to 52, anxious about side effects and muscle loss, logging on their phone at night. Metric. Wants a calm app, not a gamer dashboard.
2. **Secondary:** experienced "stack" users running multiple compounds who want reconstitution maths, site rotation and bloodwork on one timeline.
3. **B2B:** UK GLP-1 prescribers and clinics who want a white-label patient companion with adherence data and PDF reports.

## Pillars and features

### 1. Today (the home)
- Shot card: next dose, countdown, site-rotation body map (front and back), one-tap log, "estimated drug level" curve (Shotsy-style, half-life based).
- Three rings: Protein, Water, Steps. Protein is the biggest ring on purpose.
- Sleep last night: one line with a trend arrow, tap for the Sleep pillar.
- One "Moment" card: the day's micro-lesson, chosen by what just happened (see 03).
- Quick log: weight, mood, energy, side effects (chips: nausea, constipation, fatigue, sulphur burps, dizziness, cycle change, chills), notes.

### 2. Protocol
- Medications and compounds: name, dose, route, frequency, titration ladder with dates, pen or vial, storage reminders, refill and expiry alerts.
- Reconstitution and units calculator that shows its working (mg per vial, bac water ml, concentration, units on a U-100 syringe) and lets the user verify each step. Verifiable arithmetic is the MHRA line we stay behind.
- Titration timeline with side-effect overlay: "Nausea spiked 48h after each step-up".
- Missed-dose logic per medicine (Mounjaro: within 4 days take it; otherwise skip) shown as manufacturer guidance with source, never as advice.

### 3. Nutrition
- Protein-first: daily target from lean mass or body weight (1.2 to 1.6 g/kg, user picks band with prescriber), big number, remaining, "one scoop closes it".
- Meal capture: photo (LLM vision) with generous free quota, barcode (Open Food Facts), text, favourites. Log in under 10 seconds or people quit by week two.
- Fibre and hydration as constipation prevention, tied to the side-effect diary.
- GLP-1 eating playbook: small portions, protein first, slow, avoid greasy and high-sugar on shot day. Surfaced as Moments, not a wall of text.

### 4. Sleep and recovery
- Sources: Apple Health, Health Connect, Oura and Whoop cloud APIs (HRV does not reach Apple Health from those vendors; go direct).
- Night arc: bedtime, wake, stages, HRV, resting HR, respiratory rate.
- Correlations the user actually cares about: sleep vs shot day, sleep vs protein, sleep vs weight trend, sleep vs cravings, sleep vs nausea.
- Wind-down: a night mode (warm palette, low contrast, no red badges after 21:00), bedtime consistency score, sleep-apnoea screening prompt if resting HR and snoring flags line up (educational, points to GP).
- Recovery readiness: simple green/amber/red from HRV baseline and sleep, with a training suggestion (lift, walk, rest).

### 5. Muscle
- Resistance-training minimum: 2 sessions a week, logged in one tap (done, duration, "felt").
- Body composition: weight trend (7-day EMA, not daily noise), waist, photos with side-by-side, optional smart-scale and DEXA entries.
- "Fat vs lean" estimate from weight trend and protein and training adherence, clearly labelled as an estimate.

### 6. Bloodwork
- Manual entry and PDF or photo import (LLM extraction) for UK panels: HbA1c, lipids, LFTs, thyroid, B12, ferritin, vitamin D, testosterone, IGF-1, CRP.
- Plotted on the same timeline as titration and weight.
- Plain-English explainer per marker with reference ranges and "ask your GP about" prompts. No diagnosis.

### 7. Learn
- Guide library (searchable) plus the Moments engine. See 03-design-and-education.md.

### 8. Export and share
- Doctor PDF: doses, side effects, weight, bloods, sleep summary, one page.
- CSV and JSON export, delete-all in two taps.

### 9. Insights (the "AI" done properly)
- Weekly summary generated by an LLM from structured data, cached, one call per user per week (cost control). Plain English, three findings, one action.
- No open chat in v1. Add a scoped "ask about my data" later once retention proves the base.

## Monetisation

| Tier | Price | What |
|---|---|---|
| Free | £0 | One medication, shot log, site rotation, protein ring, weight, side-effect diary, 5 photo meal logs/day, 10 Moments |
| Pro | £4.99/mo or £34.99/yr | Unlimited meds and stacks, sleep and wearables, correlations, bloodwork import, full Learn, weekly insights, PDF export |
| Lifetime | £79 | Pro forever. Launch-only, first 1,000 |
| Clinic | £2 to £4 per active patient per month | White-label, adherence dashboard, branded PDF, SSO |

No weekly subs. Annual default. Trial 7 days with a reminder on day 5.

## Why this wins on economics
- Clinic tier is the leverage. One mid-size UK online pharmacy with 20k active GLP-1 patients at £2 is £40k MRR. Consumer subs fund the product; clinics fund the company.
- LLM costs stay under 5p per Pro user per month because insights are batched weekly and meal photos use a small vision model with caching.
- Content is a moat and an SEO engine. Every guide ships on the web as well as in-app.

## Tech stack (decided 13 Sept 2026: reuse the Tranmere Tracker stack)

- **App:** Next.js 14 App Router + TypeScript + Tailwind, PWA, wrapped as a thin Capacitor WebView for App Store and Play. Web pushes ship with `git push`; native rebuilds only for plugin or permission changes. Codemagic pipeline copied from tranmere-tracker.
- **Backend:** Supabase project `tracked` (eu-west-2): auth (magic link), Postgres with RLS on every table, storage later for photos and PDFs.
- **Meal scanner:** ported from Tranmere Tracker. Claude Haiku 4.5 with a cached system prompt reads the photo and returns protein-first macros. Open Food Facts for search and barcodes.
- **Health data:** manual sleep logging now. HealthKit and Health Connect via Capacitor community plugins in weeks 7 to 8; Oura and Whoop cloud APIs after (they do not pass HRV to Apple Health).
- **Subscriptions:** RevenueCat via Capacitor plugin, or Stripe on web first.
- **LLM:** Claude Haiku 4.5 for photos and lab extraction, Sonnet 5 for weekly insights, batched and cached.
- **Content:** Moments and guides as typed TypeScript in `lib/`, rendered in-app; the same objects feed a marketing site later.
- **Analytics and crash:** PostHog, Sentry.

Why not Expo: the scanner, barcode, Supabase SSR pattern and store pipeline already exist and are proven in production. Rebuilding them in React Native buys nothing in year one.

## Regulatory and store guardrails (non-negotiable)

1. **We track and educate. We never recommend a dose, a compound, or a titration step.** Manufacturer guidance is quoted with source. Calculators show verifiable working. This keeps us out of MHRA software-as-a-medical-device territory. Get a one-hour opinion from a regulatory consultant before launch; budget £500 to £1,000.
2. **Unlicensed compounds** (retatrutide, BPC-157, etc.) can be logged by name. Education for them is harm-reduction only: sterility, storage, signs of a bad batch, "no licensed supply exists in the UK". No efficacy claims, no protocols, no sourcing.
3. **App Store and Play:** no links to vendors, no "buy" language, clear medical disclaimer at onboarding, age gate 18+.
4. **Privacy:** UK GDPR. Health data is special category. Local-first, encrypted at rest, explicit consent for sync and wearables, DPIA written before launch.
5. **Language:** "companion", "tracker", "learn". Never "treatment", "therapy", "protocol optimiser".

## KPIs (first 90 days after launch)

- D7 retention over 40%, D30 over 25% (trackers die at week two; Moments are the fix).
- Protein target hit rate over 60% of logged days for Pro users.
- Free to Pro conversion over 6% at day 14.
- Meal log median time under 12 seconds.
- One signed clinic pilot.

## 12-week build plan

| Weeks | Ship |
|---|---|
| 1 to 2 | Expo scaffold, design tokens, SQLite schema, onboarding, Today, shot log with site map, weight, side-effect chips |
| 3 to 4 | Protocol: meds, titration ladder, reminders, calculator with working, missed-dose guidance |
| 5 to 6 | Nutrition: protein ring, photo and barcode logging, water, fibre. Moments engine v1 with 30 lessons |
| 7 to 8 | Sleep: HealthKit and Health Connect, night arc, night mode, first three correlations. Muscle: training log, weight EMA, photos |
| 9 | Bloodwork entry and PDF import, timeline overlay |
| 10 | RevenueCat, paywall, PDF export, weekly LLM insight |
| 11 | Beta: 50 UK users from GLP-1 communities. Fix the top ten complaints |
| 12 | Store listings, marketing site from MDX content, launch. Start clinic outreach in week 8, not week 12 |

## Risks

- **Crowded category.** Mitigation: the wedge (muscle, sleep, education) and UK-first are visible in the first screenshot, not buried.
- **Wearable API churn.** Mitigation: HealthKit and Health Connect first, vendor APIs second.
- **Regulatory drift** (MHRA tightening on GLP-1 marketing). Mitigation: guardrails above, no vendor ties, be the app clinics are comfortable recommending.
- **Solo-dev scope.** Mitigation: the 12-week plan cuts insights chat, community, and challenges. Add after retention proves out.

## Later (v2 candidates, only if retention holds)
- Scoped "ask about my data" chat.
- Maintenance and tapering mode (the coming-off journey is unserved).
- Cycle tracking overlay for women (under-reported side effect).
- Coach and clinician portal.
- Community "non-scale victories" feed, opt-in.
