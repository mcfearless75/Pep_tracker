# Tracked

Lose the fat. Keep the muscle. Sleep like it matters. The GLP-1 and peptide companion that teaches you as you go.

## Run it
```bash
cp .env.example .env.local   # add ANTHROPIC_API_KEY for the meal scanner
npm install
npm run dev
```
Sign in with a magic link (Supabase auth), complete onboarding, and you land on Today.

## What works now
- Onboarding: medicine, dose, shot day, weight, protein band, 18+ gate and disclaimer
- Today: shot card with site rotation and missed-dose guidance, protein / water / lifts rings, sleep line, today's Moment, quick log for weight, side effects, training and water
- Protocol: stack, estimated drug level, manufacturer ladder, titration history, recent shots, vial calculator with working shown
- Food: Claude meal photo scanner, Open Food Facts search and barcode scan, water, protein-first day view
- Sleep: manual night log, night arc, HRV and duration vs baseline, consistency score, readiness, Tonight panel, shot-night and protein correlations
- Body: smoothed weight trend chart, waist, lifts per week, metric or imperial
- Bloodwork: manual entry or photo/PDF import (Claude), UK reference ranges with plain-English explainers
- Weekly insight: three findings and one action from your last seven days (Claude, cached per week)
- Learn: 16 Moments with checks, 12 guides, search
- Report for your prescriber (print to PDF), JSON and CSV export, delete-all
- Night mode: warm palette after 21:00, no red

## Not built yet (need accounts or native builds)
Wearable sync (HealthKit, Health Connect, Oura, Whoop), push reminders, subscriptions, native `android/` and `ios/` folders, progress photos.

## Docs
- [Competitive teardown](docs/01-competitive-teardown.md)
- [Product blueprint](docs/02-product-blueprint.md)
- [Design system and education engine](docs/03-design-and-education.md)

## Checks
```bash
npm run typecheck && npm run lint && npm test
```
