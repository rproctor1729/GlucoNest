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
    "id": "guide-insulin-storage-climate",
    "hubCategory": "injection",
    "illustration": {"src": "/images/guides/storage.png", "alt": "Insulin pen and insulated pouch on a shaded tabletop"},
    "title": "Keep insulin cool, wherever life goes.",
    "category": "Climate & Storage",
    "readTime": "3 min read",
    "summary": "Understand storage labels, summer heat, and the difference between keeping insulin cool and letting it freeze.",
    "bodySections": [
      {
        "heading": "The product label is your starting point",
        "content": "Storage limits and in-use lifetimes vary by insulin product and device. Follow the instructions for your exact pen or vial, including when it was first opened. Your pharmacist can help explain the label."
      },
      {
        "heading": "Heat and freezing are different risks",
        "content": "Keep insulin away from direct sunlight and extreme heat. Never use insulin that has frozen. An insulated pouch can help during a journey, but insulin should not touch ice or a frozen pack directly."
      },
      {
        "heading": "Planning for a power cut",
        "content": "Think ahead about access to cooling and replacement supplies. A household cooling method cannot guarantee a particular temperature. If storage conditions are uncertain, ask your pharmacist or diabetes care team about the specific product."
      }
    ],
    "references": [
      {
        "label": "FDA · Insulin storage guidance",
        "url": "https://www.fda.gov/drugs/emergency-preparedness-drugs/information-regarding-insulin-storage-and-switching-between-products-emergency"
      }
    ]
  },
  {
    "id": "guide-sick-day-rules",
    "hubCategory": "everyday",
    "illustration": {"src": "/images/guides/sick-days.png", "alt": "Water, a warm mug and a thermometer beside a bed"},
    "title": "Know your sick-day plan.",
    "category": "Daily Life",
    "readTime": "3 min read",
    "summary": "Why illness can change glucose, what a personal sick-day plan covers, and when to contact your care team.",
    "bodySections": [
      {
        "heading": "Illness can change your usual pattern",
        "content": "Infection and other illnesses can affect glucose even when you are eating less. Hormones released while fighting illness may raise blood glucose, so your usual daily pattern may look different."
      },
      {
        "heading": "A plan made for you",
        "content": "Your diabetes team can give you written guidance for monitoring glucose and ketones, taking insulin, drinking fluids, and getting help. Keep that plan accessible. This article does not provide insulin adjustments or replace your individual instructions."
      },
      {
        "heading": "Know how to get help",
        "content": "Discuss warning signs with your team before you become ill. Trouble breathing, inability to keep fluids down, or concerning ketones need prompt medical assessment. Use emergency care for severe symptoms rather than waiting for an app or reminder."
      }
    ],
    "references": [
      {
        "label": "CDC · Managing sick days",
        "url": "https://www.cdc.gov/diabetes/living-with/managing-sick-days.html"
      }
    ]
  },
  {
    "id": "guide-tir-explained",
    "hubCategory": "technology",
    "title": "See beyond a single glucose number.",
    "category": "Clinic & Endo",
    "readTime": "3 min read",
    "summary": "Get familiar with time in range, glucose variation, and why the amount of available data matters.",
    "bodySections": [
      {
        "heading": "A reading is one moment",
        "content": "A glucose reading describes a particular moment. A series of readings can reveal changes over time, including patterns around meals, activity, sleep, or illness. Context helps you and your care team interpret those changes."
      },
      {
        "heading": "What time in range describes",
        "content": "Time in range estimates how much of the measured time glucose falls within a chosen band. Time below and above that band provide additional context. Your care team should set an appropriate target for your circumstances."
      },
      {
        "heading": "Coverage matters",
        "content": "Gaps and sparse readings limit what a summary can show. GlucoNest requires enough usable time coverage before displaying time-based percentages. Sample data illustrates the interface; it is not an assessment of your personal glucose."
      }
    ],
    "references": [
      {
        "label": "NIDDK · Continuous glucose monitoring",
        "url": "https://www.niddk.nih.gov/health-information/diabetes/overview/managing-diabetes/continuous-glucose-monitoring"
      }
    ]
  },
  {
    "id": "guide-endo-checklist",
    "hubCategory": "prevention",
    "illustration": {"src": "/images/guides/appointment.png", "alt": "A notebook, pen and glucose meter for an appointment"},
    "title": "Make your next appointment count.",
    "category": "Clinic & Endo",
    "readTime": "2 min read",
    "summary": "Bring the story behind your readings into the conversation, from everyday routines to the questions that matter to you.",
    "bodySections": [
      {
        "heading": "Bring the context behind your numbers",
        "content": "A reading summary is easier to discuss when it includes the circumstances around it. Meal timing, activity, sleep, symptoms, and changes to your routine can all be useful conversation starters."
      },
      {
        "heading": "Start with what matters to you",
        "content": "Think about a few specific concerns before the visit. You might want to discuss overnight alerts, a new exercise routine, travel, or the practical effort of daily management. Concrete examples help your care team understand your priorities."
      },
      {
        "heading": "Leave with a shared understanding",
        "content": "Ask for clarification when instructions are unclear, including whom to contact between visits. Discuss treatment changes with your clinician. GlucoNest can prepare a summary from your available personal readings, but it does not recommend doses."
      }
    ],
    "references": [
      {
        "label": "NIDDK · Managing diabetes",
        "url": "https://www.niddk.nih.gov/health-information/diabetes/overview/managing-diabetes"
      }
    ]
  },
  {
    "id": "guide-travel-railways-airports",
    "hubCategory": "everyday",
    "illustration": {"src": "/images/guides/travel.png", "alt": "An Indian passenger train and a travel bag"},
    "title": "Take your routine on the road.",
    "category": "Daily Life",
    "readTime": "3 min read",
    "summary": "A little preparation for train journeys, flights, changing schedules, and keeping supplies close at hand.",
    "bodySections": [
      {
        "heading": "Make room for changes to routine",
        "content": "Delayed meals, new foods, more walking, and time-zone changes can affect glucose. Discuss medication timing and travel concerns with your diabetes care team before a longer journey."
      },
      {
        "heading": "Keep essentials accessible",
        "content": "Carry monitoring equipment, medicines, and fast-acting carbohydrate where you can reach them. Extra supplies can help with delays or lost luggage. Protect medicines from extreme temperatures using their specific storage instructions."
      },
      {
        "heading": "Check the rules for your own device",
        "content": "Airport screening instructions differ by CGM and pump model. Read the manufacturer’s current guidance and check with your airline or security authority before travelling. Do not assume that every device has the same scanner restrictions."
      }
    ],
    "references": [
      {
        "label": "CDC · Travelling with diabetes",
        "url": "https://www.cdc.gov/diabetes/about/tips-for-traveling-with-diabetes.html"
      }
    ]
  }
];
