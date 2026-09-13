# Tracked — GLP-1 and peptide companion

## What this is
Next.js app (PWA, wrapped in Capacitor for the stores) for people on Mounjaro, Wegovy or similar. Tracks shots, protein, sleep, side effects and weight; teaches with event-triggered 60-second "Moments"; never recommends a dose. Product docs in `docs/`.

## Stack
- Next.js 14 App Router, TypeScript strict, Tailwind 3 with CSS-variable tokens (`app/globals.css`)
- Supabase (project `tracked`, eu-west-2) via `@supabase/ssr`; every table is per-user with RLS
- Claude API via `@anthropic-ai/sdk` for the meal photo scanner (`app/api/ai/meal-photo`), Haiku with prompt caching
- Open Food Facts for search and barcodes (`lib/openFoodFacts.ts`)
- Jest + Testing Library; `html5-qrcode` for barcodes; Capacitor thin-WebView shell (same pattern as Tranmere Tracker)

## Commands
```bash
npm run dev         # local dev
npm run typecheck   # tsc --noEmit
npm run lint        # next lint
npm test            # jest
npm run build
```

## Layout
```
app/(app)/        tabbed screens: today, protocol, food, sleep, learn; plus body, bloods, report, settings
app/welcome       onboarding (medicine, dose, shot day, weight, protein band, 18+ gate)
app/login         magic-link auth; app/auth/callback exchanges the code
app/api/          ai/meal-photo, ai/bloodwork, ai/weekly-insight, food/search, export, account/delete
components/       ui (Card, Ring, TabBar, NightMode), today, protocol, nutrition, sleep, learn
lib/protocol/     medications presets, drug-level estimate, calculator, site rotation, schedule
lib/moments/      Moment types, launch content, trigger engine (pure, tested)
lib/learn/        guide library
lib/sleep/        correlations, plan (bedtime, consistency, readiness)
lib/bloodwork/    UK marker ranges and explainers
lib/insights/     weekly summary prompt builder
lib/export/       csv
lib/units.ts      metric/imperial display and parsing
lib/theme/        night mode window
supabase/migrations/
__tests__/lib/
```

## Rules
- We track and educate. Never add code or copy that recommends a dose, a titration step, or a compound. Manufacturer guidance is quoted with its source. Calculators show verifiable working.
- Unlicensed compounds can be logged. Content for them is harm reduction only. No vendor links anywhere.
- Use `@supabase/ssr` clients from `lib/supabase/`; server components read, client components write, then `router.refresh()`.
- `.maybeSingle()` for lookups that may return nothing. `.single()` only when the row must exist.
- Pure logic goes in `lib/` with a test in `__tests__/lib/`. Components stay thin.
- Colours come from the tokens in `app/globals.css` (day, dark, night). Never hard-code a hex in a component. Night mode must never show pure red.
- Copy: UK English, calm, direct, reading age 12. Every Moment and guide lists sources and an "ask your prescriber" prompt.
- Claude API calls: cheapest model that does the job, cache the system prompt, cap `max_tokens`.
- Metric first. Imperial is a display toggle, never the stored unit.

## Environment
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY   # server only, not used yet
ANTHROPIC_API_KEY           # server only
```

## Native builds
Capacitor config in `capacitor.config.ts` points at the deployed site. Web changes ship with `git push` and need no native rebuild. Generate `android/` and `ios/` with `npx cap add` when the store build is set up; copy the Codemagic workflow from tranmere-tracker.
