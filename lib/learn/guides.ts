export type Guide = {
  id: string
  title: string
  shelf: 'Starting out' | 'Injections' | 'Side effects' | 'Food and protein' | 'Muscle' | 'Sleep' | 'Bloodwork' | 'Plateaus and maintenance' | 'Peptides' | 'Talking to your prescriber'
  readMinutes: number
  summary: string
  sections: { heading: string; paragraphs: string[] }[]
  prescriberPrompt: string
  sources: string[]
}

export const GUIDES: Guide[] = [
  {
    id: 'starting-glp1-uk',
    title: 'Starting Mounjaro or Wegovy in the UK',
    shelf: 'Starting out',
    readMinutes: 4,
    summary: 'What to expect in the first month, how titration works, and what the NHS and private pathways look like.',
    sections: [
      { heading: 'The first four weeks', paragraphs: [
        'Both medicines start at a low dose (2.5 mg Mounjaro, 0.25 mg Wegovy) that is not meant to cause much weight loss. It is there to let your gut adapt. Expect appetite to drop within days and side effects to show up around day 2 to 3 after each shot.',
        'Weigh yourself no more than a few times a week and look at the trend line, not the daily number. The app smooths it for you.',
      ]},
      { heading: 'How titration works', paragraphs: [
        'The dose steps up roughly every four weeks along the manufacturer ladder, as long as side effects are manageable. Staying longer on a step is normal and your prescriber decides. Never step up on your own.',
        'Mounjaro: 2.5, 5, 7.5, 10, 12.5, 15 mg. Wegovy: 0.25, 0.5, 1, 1.7, 2.4 mg.',
      ]},
      { heading: 'NHS or private', paragraphs: [
        'NHS access is being phased in from 2025 and is limited by BMI and health conditions. Most UK users are on a private pharmacy prescription. Either way, a prescriber should be reviewing you at each step-up. This app can export a one-page PDF of your doses, side effects and weight for that conversation.',
      ]},
    ],
    prescriberPrompt: 'Ask what the plan is if side effects at a new dose last more than a week.',
    sources: ['NICE TA875 (semaglutide)', 'NICE TA1026 (tirzepatide)', 'Mounjaro and Wegovy SmPCs'],
  },
  {
    id: 'injection-technique',
    title: 'Injection technique and site rotation',
    shelf: 'Injections',
    readMinutes: 3,
    summary: 'Pen or vial, the steps are the same: clean, pinch, inject, hold, rotate.',
    sections: [
      { heading: 'The steps', paragraphs: [
        'Wash hands. Pick a site the app has not suggested recently. Clean with an alcohol wipe and let it dry. Pinch a fold of skin if you are lean, insert at 90 degrees, inject slowly, hold for the count the pen instructions give (usually 5 to 10 seconds), withdraw. Do not rub.',
      ]},
      { heading: 'Sites', paragraphs: [
        'Abdomen (5 cm clear of the navel), front of thighs, back of upper arms. Six zones, rotate every shot, and move 2 to 3 cm within a zone. The app tracks which you used last.',
      ]},
      { heading: 'Storage', paragraphs: [
        'Unopened pens live in the fridge (2 to 8 °C). In use, Mounjaro KwikPens can stay at room temperature for up to 30 days; check your product leaflet. Never freeze. Keep away from direct sunlight.',
      ]},
      { heading: 'Missed doses', paragraphs: [
        'Each medicine has its own manufacturer rule. The app shows the right one on your shot card if a dose is late. When in doubt, ask your prescriber rather than doubling up.',
      ]},
    ],
    prescriberPrompt: 'If you have any bruising, lumps or persistent redness at a site, show your prescriber.',
    sources: ['Mounjaro patient leaflet', 'Wegovy patient leaflet', 'FIT UK injection technique'],
  },
  {
    id: 'side-effect-playbook',
    title: 'The side-effect playbook',
    shelf: 'Side effects',
    readMinutes: 5,
    summary: 'Nausea, constipation, fatigue, sulphur burps and the rest: what helps, what to log, and when to call.',
    sections: [
      { heading: 'Nausea', paragraphs: ['Smaller portions, protein first, low fat, slow eating, ginger, do not lie down after meals. Log each episode with severity so your prescriber can see the pattern against titration.'] },
      { heading: 'Constipation', paragraphs: ['Fibre 25 to 30 g, water 2 litres or more, a walk after meals. Macrogol is the usual first suggestion from prescribers.'] },
      { heading: 'Diarrhoea', paragraphs: ['Usually early and short-lived. Fluids and salt. If it lasts more than 48 hours, call.'] },
      { heading: 'Sulphur burps', paragraphs: ['Caused by slowed digestion. Smaller meals, less fat, fewer fizzy drinks. Simethicone helps some people.'] },
      { heading: 'Fatigue and dizziness', paragraphs: ['Usually under-eating, dehydration or short sleep. Check all three before assuming the medicine.'] },
      { heading: 'Call your prescriber or 111 now', paragraphs: ['Severe or persistent stomach pain (possible pancreatitis), vomiting you cannot control, signs of dehydration, yellowing skin or eyes, a lump in the neck, or an allergic reaction.'] },
    ],
    prescriberPrompt: 'Bring your side-effect log to every review. Pattern beats memory.',
    sources: ['Mounjaro SmPC 4.8', 'Wegovy SmPC 4.8', 'Wharton et al. 2022'],
  },
  {
    id: 'protein-on-glp1',
    title: 'Protein on GLP-1',
    shelf: 'Food and protein',
    readMinutes: 4,
    summary: 'Why protein is the number one nutrition priority on these medicines and how to hit it with a small appetite.',
    sections: [
      { heading: 'The target', paragraphs: ['1.2 to 1.6 g per kg of body weight per day. At 90 kg that is 108 to 144 g. Set your band in the Food tab with your prescriber.'] },
      { heading: 'Spread it', paragraphs: ['25 to 40 g per meal, three or four times a day, beats one big hit. Your muscles can only use so much at once.'] },
      { heading: 'Cheap, easy, UK', paragraphs: ['Eggs, Greek yoghurt, cottage cheese, skyr, chicken thighs, tinned fish, lentils, tofu, whey or pea protein. Supermarket high-protein ranges are fine. Read the label: 20 g per serving is the bar.'] },
      { heading: 'When you cannot face food', paragraphs: ['A shake counts. Milk-based drinks count. Soup with lentils counts. On shot day, liquid protein is often easier.'] },
    ],
    prescriberPrompt: 'If you have kidney disease, ask before raising protein above 1.2 g/kg.',
    sources: ['ESPEN protein guidance', 'Phillips et al. 2012'],
  },
  {
    id: 'keeping-muscle',
    title: 'Keeping muscle while losing weight',
    shelf: 'Muscle',
    readMinutes: 4,
    summary: 'Two sessions a week, protein at target, and a way to see whether it is working.',
    sections: [
      { heading: 'Why', paragraphs: ['Trials show lean mass can be up to 40% of weight lost on semaglutide or tirzepatide when nothing else changes. Muscle is what keeps your metabolism up and stops regain later.'] },
      { heading: 'The minimum programme', paragraphs: ['Two sessions of 20 to 30 minutes. Push, pull, legs, carry. Bodyweight or dumbbells. The last two reps of each set should be hard. Add reps or weight when it stops being hard.'] },
      { heading: 'Measuring', paragraphs: ['Scale weight cannot tell you. Use waist, photos every four weeks, strength in your lifts, and a DEXA or smart-scale body-fat reading if you have access. Log waist alongside weight in the app.'] },
    ],
    prescriberPrompt: 'Ask whether a referral to a physiotherapist or exercise programme is available.',
    sources: ['UK CMO physical activity guidelines 2019', 'Wilding et al. 2021', 'Jastreboff et al. 2022'],
  },
  {
    id: 'sleep-and-weight-loss',
    title: 'Sleep and weight loss',
    shelf: 'Sleep',
    readMinutes: 4,
    summary: 'Sleep sets your hunger hormones, your cravings and your recovery. Here is how to protect it on GLP-1.',
    sections: [
      { heading: 'What short sleep does', paragraphs: ['Under 6 hours raises ghrelin, lowers leptin, and in trials cut fat loss and increased muscle loss on the same calories. Sleep is a fat-loss lever, not a luxury.'] },
      { heading: 'GLP-1 specifics', paragraphs: ['Some people sleep worse the night after their injection, some sleep better as reflux and snoring ease with weight loss. Log a bedtime and wake time for two weeks and look at the correlation card in the Sleep tab.'] },
      { heading: 'The routine', paragraphs: ['Same wake time daily. No large meal or alcohol within 3 hours of bed. Screens down 30 minutes before. Bedroom cool and dark. Night mode in this app helps with the last one.'] },
      { heading: 'Snoring and apnoea', paragraphs: ['Loud snoring, waking gasping, or daytime sleepiness despite enough hours are signs of sleep apnoea, which is common with excess weight and improves as it comes off. Tell your GP.'] },
    ],
    prescriberPrompt: 'Mention loud snoring or waking unrefreshed at your next review.',
    sources: ['Nedeltcheva et al. 2010', 'Spiegel et al. 2004', 'NHS sleep apnoea guidance'],
  },
  {
    id: 'plateaus',
    title: 'Plateaus',
    shelf: 'Plateaus and maintenance',
    readMinutes: 3,
    summary: 'A flat three weeks is normal. What to check, and what not to do.',
    sections: [
      { heading: 'Check', paragraphs: ['Logging drift, protein slip, sleep under 6 hours, water down, activity down. Fix one at a time.'] },
      { heading: 'Measure differently', paragraphs: ['Waist and clothes often keep moving when the scale does not.'] },
      { heading: 'Do not', paragraphs: ['Slash calories or skip meals. That costs muscle and usually backfires. Talk to your prescriber about the next titration step if you have been on the current dose for four or more weeks.'] },
    ],
    prescriberPrompt: 'Ask whether a step-up is appropriate, and what to expect from it.',
    sources: ['STEP 1 and SURMOUNT-1 trajectories'],
  },
  {
    id: 'maintenance',
    title: 'Maintenance and coming off',
    shelf: 'Plateaus and maintenance',
    readMinutes: 4,
    summary: 'What happens when the medicine stops, and the four habits that predict who keeps the weight off.',
    sections: [
      { heading: 'What the data says', paragraphs: ['In trial extensions, people who stopped semaglutide regained about two-thirds of lost weight within a year. Those who kept it off had kept the habits.'] },
      { heading: 'The four habits', paragraphs: ['Protein at target most days. Two resistance sessions a week. Seven hours of sleep. A way of eating you would keep without the medicine.'] },
      { heading: 'Tapering', paragraphs: ['Some prescribers taper the dose down over months rather than stopping. Discuss it. This app keeps tracking either way.'] },
    ],
    prescriberPrompt: 'Ask what the long-term plan is: continued treatment, taper, or stop, and how weight will be monitored after.',
    sources: ['Wilding et al. 2022 (STEP 1 extension)', 'Aronne et al. 2024 (SURMOUNT-4)'],
  },
  {
    id: 'peptides-harm-reduction',
    title: 'Peptides: a harm-reduction guide',
    shelf: 'Peptides',
    readMinutes: 4,
    summary: 'Unlicensed compounds carry real risks. If you use them anyway, this is how to reduce harm. It is not an endorsement.',
    sections: [
      { heading: 'Legal status', paragraphs: ['Retatrutide, BPC-157 and similar are not licensed medicines in the UK. Selling them for human use is illegal. The MHRA has raided and closed illicit manufacturers. There is no quality control on what you buy.'] },
      { heading: 'Reducing harm', paragraphs: ['Fresh sterile needle every draw. Reconstitute with bacteriostatic water and refrigerate. Use within 28 days. Inspect for cloudiness or particles. Never share. Use the calculator and check the working yourself.'] },
      { heading: 'Red flags', paragraphs: ['Fever, spreading redness, racing heart, fainting, uncontrolled vomiting. Go to A&E or call 111.'] },
      { heading: 'What this app will not do', paragraphs: ['Suggest a dose, a cycle or a schedule for an unlicensed compound, or link to any vendor.'] },
    ],
    prescriberPrompt: 'Tell your GP what you are taking. They cannot help with what they do not know about.',
    sources: ['MHRA enforcement, October 2025', 'MHRA unlicensed medicines guidance'],
  },
  {
    id: 'hydration-and-fibre',
    title: 'Hydration and fibre',
    shelf: 'Food and protein',
    readMinutes: 3,
    summary: 'Two litres and 25 grams. The pair that prevents most constipation, headaches and fatigue on GLP-1.',
    sections: [
      { heading: 'Why it matters more now', paragraphs: ['You are eating less, so less water and fibre arrive with food. Slower digestion means what you do eat needs both to keep moving.'] },
      { heading: 'Water', paragraphs: ['Aim for 2 litres, more on hot days or after training. Sip through the day; big glasses on a full stomach worsen nausea. Tea and milk count. A pinch of salt or an electrolyte sachet helps if you feel light-headed.'] },
      { heading: 'Fibre', paragraphs: ['25 to 30 g a day. Oats, beans, lentils, berries, wholegrain bread, vegetables with skins. Add gradually over two weeks, and add water with it or it backfires. A daily psyllium or chia spoonful is an easy top-up.'] },
    ],
    prescriberPrompt: 'If constipation persists past a week of doing both, ask about macrogol.',
    sources: ['NHS Eatwell Guide', 'British Dietetic Association fibre fact sheet'],
  },
  {
    id: 'reading-your-bloodwork',
    title: 'Reading your bloodwork',
    shelf: 'Bloodwork',
    readMinutes: 5,
    summary: 'What each marker on a typical UK panel means, what GLP-1 tends to do to it, and which questions to bring to your GP.',
    sections: [
      { heading: 'What to test and when', paragraphs: ['A sensible baseline before starting: HbA1c, lipids, liver function, kidney function, thyroid, B12, ferritin and vitamin D. Repeat at three to six months. Private pharmacies vary; your GP can do most of these.'] },
      { heading: 'Metabolic and lipids', paragraphs: ['HbA1c and triglycerides usually fall. LDL and total cholesterol often improve with weight loss. HDL rises with exercise. A raised ALT often means fatty liver and improves as weight comes off.'] },
      { heading: 'Energy markers', paragraphs: ['Low ferritin, B12 or vitamin D are common causes of fatigue that get blamed on the medicine. Reduced food intake makes them more likely. Worth checking before assuming.'] },
      { heading: 'How the app shows it', paragraphs: ['Each result is placed against a typical UK adult range with a one-line explanation. Your lab\'s printed range wins. Results outside range get an "ask your GP" prompt, never a diagnosis.'] },
    ],
    prescriberPrompt: 'Ask which markers they want repeated and when.',
    sources: ['NICE NG28 (type 2 diabetes monitoring)', 'NHS lab reference ranges', 'British Society of Gastroenterology guidance on abnormal liver tests'],
  },
  {
    id: 'talking-to-your-prescriber',
    title: 'Talking to your prescriber',
    shelf: 'Talking to your prescriber',
    readMinutes: 3,
    summary: 'Reviews are short. Arrive with the numbers and three questions and you get more out of them.',
    sections: [
      { heading: 'Bring the summary', paragraphs: ['Settings, then "Report for your prescriber", then Save as PDF. One page: doses, side effects, weight trend, protein, sleep, latest bloods.'] },
      { heading: 'Three questions that always earn their place', paragraphs: ['Is my side-effect pattern normal for this dose? Should I stay on this step longer? What are we watching in the next set of bloods?'] },
      { heading: 'Be straight about the hard bits', paragraphs: ['Missed doses, alcohol, an unlicensed compound you are also using. Prescribers can only help with what they know, and none of it is new to them.'] },
    ],
    prescriberPrompt: 'Ask how to reach them between reviews if something changes.',
    sources: ['NHS "It\'s OK to ask" campaign', 'GMC guidance on shared decision making'],
  },
]

export function guideById(id: string): Guide | undefined {
  return GUIDES.find(g => g.id === id)
}

export const SHELVES = Array.from(new Set(GUIDES.map(g => g.shelf)))
