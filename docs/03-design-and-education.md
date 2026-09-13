# Design system and education engine

## Design principles

1. **Calm, not cockpit.** MAX and Regimen look like trading terminals. We look like a well-made bedside lamp. Fewer numbers, bigger type, more whitespace.
2. **One primary action per screen.** Log the shot. Close the protein ring. Read the Moment.
3. **Night-aware.** The app knows the time. After 21:00 it shifts to a warm, low-contrast palette and stops shouting.
4. **Teach in the flow, never in a wall.** Education arrives as a card, sixty seconds long, exactly when it is relevant.
5. **Metric first, imperial as a toggle.**

## Colour tokens

| Token | Day (light) | Day (dark) | Night mode |
|---|---|---|---|
| bg | #F7F6F2 (warm off-white) | #0E1116 | #14110E (warm charcoal) |
| surface | #FFFFFF | #171B22 | #1C1814 |
| text | #14171C | #EEF0F3 | #D9CFC0 (warm, low glare) |
| muted | #6B7280 | #98A1AD | #8A7F70 |
| primary (Keel teal) | #1F8A8A | #3FB6B6 | #C48A3F (amber, replaces teal at night) |
| protein | #E0873A | #F0A15A | #C48A3F |
| water | #3D8BE0 | #63A6F2 | #7E6E58 |
| sleep | #6F5BD9 | #9B8AF0 | #A08BC7 |
| good | #2E9E63 | #49C583 | #7C9E6B |
| warn | #D9932E | #F2B04F | #C48A3F |
| bad | #D64545 | #EF6B6B | #B26A5A (never pure red at night) |

Type: Inter or the platform default. Display numbers in a tabular figure weight 600. Body 16px minimum. Line height 1.5.

Shape: 20px radius cards, 12px on chips. Shadows minimal; use a one-pixel border in dark modes.

Motion: 200ms ease-out. Rings animate once on load. No confetti. Haptic on shot logged only.

## Screen map

```
Tab bar: Today · Protocol · Food · Sleep · Learn   (five, not seven; "Body" and "Bloods" live inside Today and Protocol)
```

### Today
- Header: greeting, date, small avatar. Night mode: "Good evening" and moon glyph.
- Shot card (full width): medicine, dose, "Due Thursday, 3 days", body map thumbnail with the next recommended site highlighted, primary button "Log shot". After logging: green tick, estimated level curve expands for a second, then collapses.
- Rings row: Protein (large, centre), Water and Steps (smaller, sides). Tap protein ring to open Food with the "add" sheet already open.
- Sleep line: "7h 12m · HRV 48 · a bit under your baseline" with a tiny sparkline. Tap to Sleep.
- Moment card: title, one-line hook, "60 sec" label, illustrated glyph, "Read" button. Dismissible, comes back tomorrow with a different one.
- Quick log strip: Weight · Mood · Energy · Side effect · Note. Each opens a bottom sheet.

### Protocol
- Stack list with cards: medicine, dose, frequency, titration step "Week 5 of 12 at 5 mg".
- Titration ladder: vertical steps with dates. Side-effect dots overlay each step.
- Calculator: three inputs (vial mg, water ml, dose mg), then a step-by-step working panel the user can expand. Output in mg, ml and units. "Check this with your prescriber" footer.
- Site map: front and back body, 8 zones, last-used dates, next suggestion by rotation rule.

### Food
- Top: protein big number with remaining; kcal and fibre small beneath. Water tap counter.
- Add sheet: camera (default), barcode, search, favourites, "same as yesterday".
- Meals grouped. Each row: photo thumbnail, name, protein bold, kcal muted.
- Shot-day banner: "Shot day. Small portions, protein first, easy on fat." (a Moment, one line).

### Sleep
- Night arc: a 180° arc from bedtime to wake, stage bands coloured in sleep purples, the arc becomes amber in night mode.
- Under it: four stats (duration, HRV, resting HR, consistency), each with a baseline delta.
- Correlation cards, one at a time, swipeable: "On shot nights you sleep 38 min less. Consider an earlier dose time. Read why."
- Tonight panel (appears after 20:00): suggested bedtime from wake goal, wind-down checklist (screens off, no big meal, water not too late), "Set night mode".
- 7 / 30 / 90 day toggle at the bottom, same pattern as weight.

### Learn
- Search bar. Then "Your Moments" (read and unread), then Guides by shelf: Starting out · Injections · Side effects · Food and protein · Muscle · Sleep · Bloodwork · Plateaus and maintenance · Coming off · Peptides (harm reduction).
- Each guide: reading time, sources at the bottom, "Ask your prescriber" box, related Moments.

## Night mode rules
- Auto from 21:00 to 06:00 (user can change). Also triggered by the Sleep tab's "wind down".
- Palette swaps to the Night column. Primary teal becomes amber.
- Notifications are silenced except shot reminders.
- Badges and red states drop to warm neutrals.
- Brightness hint: suggest the system's night shift once, never nag.

## Education engine ("Moments")

A Moment is a 60 to 90 second lesson card, triggered by an event, with an optional one-question check and a "done" state.

### Data model
```
Moment {
  id, title, hook, body_mdx, read_seconds,
  trigger: { event, conditions },   // see below
  priority: 1..5,
  cooldown_days,
  sources[], prescriber_prompt?,
  check?: { question, options[], correct, explain }
  tags[]
}
```

### Trigger events
| Event | Example Moment |
|---|---|
| onboarding_complete | How GLP-1 medicines actually work (in one minute) |
| first_shot_logged | Site rotation: why and how |
| first_vial_added | Reconstitution: the maths, and how to check it |
| titration_step_up | The 72 hours after a step-up: what to expect |
| side_effect_logged: nausea | The nausea playbook (portion, fat, ginger, timing) |
| side_effect_logged: constipation | Fibre, water, movement, when to see a GP |
| side_effect_logged: fatigue | Protein, sleep and the fatigue loop |
| protein_under_target_3_days | Why protein is the muscle insurance policy |
| no_training_14_days | Two sessions a week is enough. Here is the minimum |
| weight_plateau_21_days | Plateaus are normal. What to check first |
| sleep_under_6h_3_nights | Short sleep raises ghrelin. Fix bedtime, not breakfast |
| hrv_below_baseline_5_days | Recovery is low. Lift lighter, walk more |
| missed_dose | Manufacturer guidance for a missed dose, with source |
| bloodwork_added | Reading your lipid panel |
| week_12_reached | Maintenance thinking starts now |
| unlicensed_compound_added | No licensed supply exists. Storage, sterility, red flags |
| night_mode_first | Why we dim the app at night |

Rules: max one Moment per day on the home screen, more available in Learn. Priority breaks ties. Cooldown prevents nagging. Reading a Moment marks it done and unlocks the related guide.

### Content style
- One idea per card. Plain English. Reading age 12.
- Always: what is happening, why, what to do, when to escalate to a prescriber or GP.
- Sources listed (NICE, MHRA, manufacturer SmPC, peer-reviewed). No forum lore presented as fact.
- Tone: calm, direct, no cheerleading.

### Launch content (30 Moments, 12 guides)
Guides: Starting Mounjaro or Wegovy in the UK · Injection technique and site rotation · The side-effect playbook · Protein on GLP-1 · Keeping muscle while losing weight · Sleep and weight loss · Hydration and fibre · Reading your bloodwork · Plateaus · Maintenance and coming off · Peptides: a harm-reduction guide · Talking to your prescriber.

Each guide also publishes to the marketing site. That is the SEO engine and the top of the funnel.
