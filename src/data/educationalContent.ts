import { EducationalGuide } from '../types';

export const educationalGuides: EducationalGuide[] = [
  {
    id: 'guide-hypo-protocol',
    title: 'Hypoglycaemia Protocol: The Rule of 15 (Indian Essentials)',
    category: 'Emergency',
    readTime: '2 min read',
    isEmergency: true,
    summary: 'Clear, calm, life-saving steps when blood glucose drops below 70 mg/dL (3.9 mmol/L).',
    checklistItems: [
      'Stop whatever you are doing immediately and sit down in a safe spot.',
      'Take 15 grams of fast-acting glucose (see Indian fast-carb list below).',
      'Start a 15-minute timer without eating more food.',
      'Recheck glucose after 15 min. If still under 70, repeat with another 15g.',
      'Once glucose is steady above 70, eat a complex snack (e.g. 1 chapati or handful of roasted chana) if next meal is >1 hr away.',
    ],
    bodySections: [
      {
        heading: 'Indian Fast-Carb Equivalents (15 Grams Pure Glucose)',
        content:
          'When low, your brain needs instant dextrose that bypasses stomach digestion. Avoid dairy/chocolate (fats delay absorption):\n• 1 Tablespoon Glucon-D powder dissolved in 100ml water (~15g)\n• 1 Small Tetra Pack of Frooti / Real Fruit Juice 125ml (~15-16g)\n• 1/2 Can / Small Bottle of Regular Soda (Limca, Sprite, Thums Up - NOT diet) (~18g)\n• 3 to 4 Restaurant Sugar Sachets dissolved in water (~15g)\n• 4 Chewy Glucose Tablets / Dextrose Lozenges (~16g)',
      },
      {
        heading: 'CRITICAL WARNING: Severe Lows & Loss of Consciousness',
        content:
          'NEVER give liquids, food, or glucose powder orally to a person who is confused, choking, or unconscious. Doing so risks fatal airway aspiration. Companions must place the person on their side in the recovery position, administer prescribed nasal glucagon (Baqsimi) or injectable glucagon, and call for immediate emergency medical assistance.',
      },
      {
        heading: 'Why You Must Wait the Full 15 Minutes',
        content:
          'When you are low, adrenaline triggers intense primal hunger ("hypo hunger") urging you to raid the kitchen. It takes 12 to 15 minutes for swallowed sugar to absorb across the intestinal wall into circulation. Overeating during this window causes severe rebound spikes to 250+ mg/dL. Treat with precision, set the timer, and breathe.',
      },
    ],
  },
  {
    id: 'guide-insulin-storage-climate',
    title: 'Insulin Storage in Indian Climates & Power Cuts',
    category: 'Climate & Storage',
    readTime: '4 min read',
    summary: 'Protecting your insulin potency during 40°C+ summer heat, humidity, and load-shedding power outages.',
    checklistItems: [
      'Store spare unopened vials/pens in the refrigerator door or vegetable crisper (2°C to 8°C).',
      'NEVER store insulin against the back freezer coil where it can accidentally freeze. Frozen insulin permanently loses peptide structure.',
      'Current in-use pen/vial can stay at comfortable room temperature (<28°C) for up to 28 days.',
      'Keep a water-activated Frio cooling wallet or evaporative clay matka for summer power outages.',
      'Keep insulin out of direct sunlight and never leave it inside a parked car in the Indian sun.',
    ],
    bodySections: [
      {
        heading: 'The Earthen Clay Pot (Matka) Hack for Power Cuts',
        content:
          'During long summer electricity cuts where refrigerators warm up, use a traditional unglazed clay pot filled with clean wet sand. Place your insulin in a sealed ziplock bag inside. The natural evaporative cooling maintains a micro-temperature of 20°C–23°C even when outside temperatures exceed 38°C.',
      },
      {
        heading: 'How to Tell if Insulin Has Degraded',
        content:
          'Rapid insulin (Novorapid, Humalog, Apidra) and basal analogues (Lantus, Tresiba) should be crystal clear like water. If insulin looks cloudy, frosted, clumpy, or has brownish discoloration, it has been denatured by heat or freezing and must be discarded.',
      },
    ],
  },
  {
    id: 'guide-sick-day-rules',
    title: 'Sick-Day Guidance: Infections, Fevers & Ketone Management',
    category: 'Daily Life',
    readTime: '4 min read',
    summary: 'When fighting a viral fever, stomach bug, or infection, stress hormones cause glucose to surge.',
    checklistItems: [
      'NEVER stop your basal insulin — even if vomiting or unable to eat solid meals.',
      'Check glucose every 2 to 3 hours.',
      'Check blood or urine ketones if glucose is consistently >240 mg/dL (13.3 mmol/L).',
      'Sip 200ml fluids every hour (Electral / ORS, tender coconut water, or clear broth).',
      'Contact your endocrinologist if vomiting persists >4 hours or moderate/large ketones appear.',
    ],
    bodySections: [
      {
        heading: 'Why You Must Never Stop Basal Insulin',
        content:
          'Even during complete fasting, your cells need basal insulin for basic cellular respiration. Without baseline insulin, the liver breaks down fatty acids into acidic ketones, leading to Diabetic Ketoacidosis (DKA), a life-threatening medical emergency.',
      },
      {
        heading: 'Hydration Strategy with Indian Fluids',
        content:
          'If blood sugar is high (>180 mg/dL), hydrate with carb-free liquids: plain water, salted buttermilk (chaas), or light herbal tea. If blood sugar starts dropping below 140 mg/dL while nauseous, sip diluted tender coconut water or glucose-electrolyte solution to prevent hypoglycemia while keeping ketones at bay.',
      },
    ],
  },
  {
    id: 'guide-tir-explained',
    title: 'Understanding Time-In-Range (TIR) & Modern Metrics',
    category: 'Clinic & Endo',
    readTime: '3 min read',
    summary: 'Why endocrinologists look beyond HbA1c to assess glucose quality of life and reduce glycemic swings.',
    bodySections: [
      {
        heading: 'The International Consensus Targets (70–180 mg/dL)',
        content:
          '• Target Time-In-Range (TIR): >70% of the day (approx. 17 hours)\n• Time-Below-Range (TBR <70): <4% (under 1 hour/day)\n• Urgent Lows (<54 mg/dL): <1% (under 15 minutes/day)\n• Time-Above-Range (>180 mg/dL): <25%\nEvery 5% increase in TIR has documented cardiovascular, kidney, and retinal protective benefits.',
      },
      {
        heading: 'Coefficient of Variation (CV %): The Smoothness Metric',
        content:
          'Two people can have the same 7.0% A1c: one might experience peaceful, flat curves between 90 and 150 mg/dL, while another is riding rollercoasters between 40 and 300 mg/dL. CV measures glucose variability. A CV under 36% indicates safe, stable diabetes control with low risk of unpredictable lows.',
      },
    ],
  },
  {
    id: 'guide-endo-checklist',
    title: 'Endo Appointment Preparation Checklist',
    category: 'Clinic & Endo',
    readTime: '3 min read',
    summary: 'Turn your 15-minute clinical consultation into a collaborative strategy session.',
    checklistItems: [
      'Export and print your GlucoNest 30-day or 90-day Doctor-Ready PDF report.',
      'Pick 2 specific patterns you noticed to discuss (e.g. 3 AM alarms or post-lunch spikes).',
      'Note down current Basal-to-Bolus ratio and daily total units.',
      'Check prescription refills needed for insulin vials, pen needles (4mm/5mm), and CGM sensors.',
      'Annual lab tests: HbA1c, urine microalbumin-to-creatinine ratio (ACR), lipid profile, TSH (thyroid), celiac screening, and dilated retinal eye check.',
      'Check expiration date on emergency glucagon or home ketone strips.',
    ],
    bodySections: [
      {
        heading: 'How to Ask Collaborative Questions',
        content:
          'Instead of asking "Am I doing well, doctor?", ask specific lifestyle questions:\n"I notice on rest days that rice lunch causes a delayed rise 2 hours later. How should I adjust my bolus timing?"\n"I want to start playing badminton in the evenings; how should we adjust my afternoon basal to avoid drops on the court?"',
      },
    ],
  },
  {
    id: 'guide-travel-railways-airports',
    title: 'Traveling in India: Trains, Flights & Airport Security with T1D',
    category: 'Daily Life',
    readTime: '3 min read',
    summary: 'Practical tips for carrying insulin, sensors, and pump supplies across Indian Railways and domestic airports.',
    checklistItems: [
      'Carry your doctor’s T1D medical certificate and original prescription in your hand baggage.',
      'NEVER put insulin in checked aircraft luggage where cargo hold temperatures can freeze it.',
      'Inform CISF airport security that you wear a CGM / insulin pump before stepping through metal detectors.',
      'Carry twice the supplies you think you need (extra sensors, backup glucometer strips, pen needles).',
      'Pack portable fast carbs (Glucon-D, juice boxes) in accessible seat pockets on Indian Railways.',
    ],
    bodySections: [
      {
        heading: 'Airport Security Guidelines for CGMs and Pumps',
        content:
          'Continuous Glucose Monitors (Dexcom, Libre) and insulin pumps should generally not go through full-body X-ray scanners (airport luggage scanner belts). Request a polite physical pat-down and hand-held metal detector wand check. Carry your endocrinologist’s letter stating that the medical device is non-removable.',
      },
    ],
  },
];
