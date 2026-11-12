import type { StoreCategory, StoreProduct } from '@/types/store';

// Static sample catalogue. No prices, ratings, stock levels or reviews are included on purpose.
// Replace "searchTerm" with a verified manufacturer or retailer page (buyUrl) when one is checked.
export const STORE_DISCLAIMER =
  'Products are displayed for informational purposes only. GlucoNest does not sell these products or provide medical endorsements. Always verify compatibility and manufacturer instructions.';

export const storeCategories: StoreCategory[] = [
  { id: 'insulin-storage', label: 'Insulin Storage & Travel', description: 'Keep insulin supplies cool and organised on the move.' },
  { id: 'glucose-monitoring', label: 'Glucose Monitoring', description: 'Meters, strips, lancets and sensor accessories.' },
  { id: 'insulin-delivery', label: 'Insulin Delivery', description: 'Pens, pen cases, needles and pump accessories.' },
  { id: 'everyday-essentials', label: 'Everyday Essentials', description: 'Identification, sharps disposal and emergency kits.' },
  { id: 'lifestyle', label: 'Lifestyle Accessories', description: 'Active, travel and skin-friendly everyday gear.' },
];

export const storeProducts: StoreProduct[] = [
  {
    id: 'frio-cooling-wallet', name: 'FRIO Insulin Cooling Wallet', brand: 'FRIO', category: 'insulin-storage', featured: true,
    description: 'A reusable cooling wallet designed to help keep compatible insulin supplies cool during travel, subject to manufacturer guidance.',
    keyFeatures: ['Reusable evaporative cooling wallet', 'Pouch format for pens and vials', 'Works without batteries or ice'],
    useCases: ['Travel in warm weather', 'Long days out, school or work', 'Keeping a spare pen cool'],
    limitations: ['Cooling depends on water, air movement and climate', 'Check the manufacturer guidance for storage temperatures', 'Not a substitute for a refrigerator for long-term storage'],
    searchTerm: 'FRIO insulin cooling wallet',
  },
  {
    id: 'insulin-travel-case', name: 'Insulin Travel Case', brand: 'Various brands', category: 'insulin-storage',
    description: 'A protective case that keeps insulin pens, meter and supplies organised and safe while travelling.',
    keyFeatures: ['Compartments for pens, meter and strips', 'Padded or hard-shell options', 'Easy-clean lining'],
    useCases: ['Flights and road trips', 'Keeping supplies together in a bag'],
    limitations: ['Does not cool supplies unless paired with a cooling product', 'Check that it fits your pen and meter'],
    searchTerm: 'insulin travel case diabetes',
  },
  {
    id: 'insulated-storage-pouch', name: 'Insulated Storage Pouch', brand: 'Various brands', category: 'insulin-storage',
    description: 'An insulated pouch that helps protect insulin from heat and knocks during short trips.',
    keyFeatures: ['Insulated lining', 'Zipped closure', 'Lightweight'],
    useCases: ['Short commutes', 'Carrying supplies to school or the gym'],
    limitations: ['Insulation only slows temperature change', 'Use manufacturer guidance for maximum temperatures'],
    searchTerm: 'insulated insulin pouch',
  },
  {
    id: 'insulin-organizer', name: 'Insulin Organizer', brand: 'Various brands', category: 'insulin-storage',
    description: 'A compact organiser that keeps pens, needles and spare supplies in one place at home or on the move.',
    keyFeatures: ['Dividers for each supply', 'Fits in a handbag or backpack', 'Clear labelling options'],
    useCases: ['Keeping a home supply tidy', 'Packing a daily kit'],
    limitations: ['Organisation only; it does not control temperature'],
    searchTerm: 'insulin organizer case',
  },
  {
    id: 'glucometer', name: 'Glucometer (Blood Glucose Meter)', brand: 'Various brands', category: 'glucose-monitoring', featured: true,
    description: 'A handheld meter that measures blood glucose from a small fingerstick sample.',
    keyFeatures: ['Fingerstick blood glucose reading', 'Memory for recent results', 'Compatible test strips are model-specific'],
    useCases: ['Checking when a CGM is not in use', 'Confirming a sensor reading'],
    limitations: ['Only use strips made for your meter model', 'Check the meter against your care team’s guidance'],
    searchTerm: 'blood glucose meter',
  },
  {
    id: 'test-strips', name: 'Test Strips', brand: 'Various brands', category: 'glucose-monitoring',
    description: 'Single-use strips that work with a specific glucometer to measure a blood glucose sample.',
    keyFeatures: ['Single use', 'Sold for specific meter models', 'Stored in a sealed container'],
    useCases: ['Routine fingerstick checks', 'Checking a reading that does not match symptoms'],
    limitations: ['Strips are only compatible with the meter model they are made for', 'Check expiry dates and storage conditions'],
    searchTerm: 'blood glucose test strips',
  },
  {
    id: 'lancets', name: 'Lancets', brand: 'Various brands', category: 'glucose-monitoring',
    description: 'Single-use lancing devices or needles that give a small fingerstick sample.',
    keyFeatures: ['Single use', 'Fine needle options', 'Fits standard lancing devices'],
    useCases: ['Fingerstick checks', 'Use with a lancing device'],
    limitations: ['Check compatibility with your lancing device', 'Dispose of used lancets safely'],
    searchTerm: 'diabetes lancets',
  },
  {
    id: 'cgm-protection-patch', name: 'CGM Protection Patch', brand: 'Various brands', category: 'glucose-monitoring',
    description: 'An adhesive cover that helps keep a CGM sensor or transmitter in place and protected during activity.',
    keyFeatures: ['Breathable adhesive', 'Clear cover for checking the sensor', 'Designed for specific sensor models'],
    useCases: ['Sports and swimming', 'Sleeping on the sensor side'],
    limitations: ['Check sensor compatibility before use', 'Follow your CGM manufacturer’s instructions'],
    searchTerm: 'CGM sensor protection patch',
  },
  {
    id: 'cgm-accessories', name: 'CGM Accessories', brand: 'Various brands', category: 'glucose-monitoring',
    description: 'Accessories for continuous glucose monitors, such as adhesives, cases and mounting tools.',
    keyFeatures: ['Model-specific fittings', 'Adhesive and overlay options', 'Protective cases'],
    useCases: ['Improving sensor wear time', 'Protecting a receiver or phone case'],
    limitations: ['Check compatibility with your CGM model', 'Follow the device manufacturer’s guidance'],
    searchTerm: 'CGM sensor accessories',
  },
  {
    id: 'insulin-pen', name: 'Insulin Pen', brand: 'Various brands', category: 'insulin-delivery', featured: true,
    description: 'A pre-filled or cartridge-based pen device for delivering insulin doses.',
    keyFeatures: ['Dial-up dosing', 'Compatible with specific cartridges or pre-filled pens', 'Clear dose window'],
    useCases: ['Multiple daily injections', 'Dosing away from home'],
    limitations: ['Only use cartridges and needles approved for your pen', 'Dose decisions must follow your care team’s plan'],
    searchTerm: 'insulin pen diabetes',
  },
  {
    id: 'reusable-pen-case', name: 'Reusable Pen Case', brand: 'Various brands', category: 'insulin-delivery',
    description: 'A protective case for an insulin pen, designed to be reused and kept clean.',
    keyFeatures: ['Protects the pen body', 'Clip or pocket options', 'Washable exterior'],
    useCases: ['Keeping a pen safe in a bag', 'Carrying spare needles'],
    limitations: ['Check that it fits your pen model', 'Clean according to the manufacturer'],
    searchTerm: 'insulin pen case',
  },
  {
    id: 'pen-needles', name: 'Pen Needles', brand: 'Various brands', category: 'insulin-delivery',
    description: 'Single-use needles that attach to an insulin pen for each injection.',
    keyFeatures: ['Single use', 'Short and standard lengths', 'Fits standard pen threads'],
    useCases: ['Every injection', 'Choosing a length suited to your body type'],
    limitations: ['Never reuse needles', 'Ask your care team which length suits you'],
    searchTerm: 'insulin pen needles',
  },
  {
    id: 'pump-accessories', name: 'Insulin Pump Accessories', brand: 'Various brands', category: 'insulin-delivery',
    description: 'Accessories for insulin pumps, such as infusion sets, reservoirs, cases and adhesives.',
    keyFeatures: ['Model-specific infusion sets', 'Pump cases and clips', 'Adhesive patches'],
    useCases: ['Replacing infusion sets on schedule', 'Protecting a pump during activity'],
    limitations: ['Check compatibility with your pump model', 'Follow your pump manufacturer’s instructions'],
    searchTerm: 'insulin pump accessories',
  },
  {
    id: 'medical-id-bracelet', name: 'Medical ID Bracelet', brand: 'Various brands', category: 'everyday-essentials', featured: true,
    description: 'A wearable identification bracelet or tag that tells responders you have diabetes.',
    keyFeatures: ['Engraved or printed details', 'Metal or silicone options', 'Comfortable everyday wear'],
    useCases: ['Emergencies when you cannot speak', 'Travel and school'],
    limitations: ['Keep the details current', 'It does not replace a hypo plan or emergency contact card'],
    searchTerm: 'diabetes medical ID bracelet',
  },
  {
    id: 'sharps-container', name: 'Sharps Container', brand: 'Various brands', category: 'everyday-essentials',
    description: 'A puncture-resistant container for safely disposing of used needles, lancets and sensor applicators.',
    keyFeatures: ['Puncture-resistant body', 'Sealable lid', 'Several sizes'],
    useCases: ['Home disposal', 'Travel disposal kits'],
    limitations: ['Follow local rules for sharps disposal', 'Never overfill the container'],
    searchTerm: 'sharps container home',
  },
  {
    id: 'diabetes-travel-kit', name: 'Diabetes Travel Kit', brand: 'Various brands', category: 'everyday-essentials',
    description: 'A kit that brings glucose tablets, meter, supplies and storage together for a trip.',
    keyFeatures: ['Organised compartments', 'Space for a spare device', 'Portable case'],
    useCases: ['Trips, flights and sports days'],
    limitations: ['Check your own supply list with your care team', 'Pack medicines in their original labelled packaging'],
    searchTerm: 'diabetes travel kit',
  },
  {
    id: 'emergency-supply-organizer', name: 'Emergency Supply Organizer', brand: 'Various brands', category: 'everyday-essentials',
    description: 'A pouch for keeping fast-acting glucose and spare supplies together, ready for a low.',
    keyFeatures: ['Quick-access pocket', 'Zip closure', 'Space for glucose sources'],
    useCases: ['Kit for school bags and cars', 'Keeping a hypo kit ready'],
    limitations: ['Check expiry dates regularly', 'Follow your hypo plan from your care team'],
    searchTerm: 'diabetes emergency kit pouch',
  },
  {
    id: 'sports-accessories', name: 'Sports Accessories', brand: 'Various brands', category: 'lifestyle',
    description: 'Armbands, belts and pouches designed to keep devices and supplies secure during exercise.',
    keyFeatures: ['Sweat-resistant materials', 'Secure fastening', 'Pockets for devices'],
    useCases: ['Running, cycling and gym sessions', 'Team sports'],
    limitations: ['Check device fit and sensor compatibility', 'Exercise can change glucose; follow your care team’s guidance'],
    searchTerm: 'diabetes sports armband',
  },
  {
    id: 'cgm-armband', name: 'CGM Armband', brand: 'Various brands', category: 'lifestyle',
    description: 'A band that holds a CGM receiver or phone close to the body during activity.',
    keyFeatures: ['Adjustable fit', 'Pocket for a receiver', 'Light and breathable'],
    useCases: ['Workouts', 'Sleeping and everyday wear'],
    limitations: ['Check the device fits the band', 'Keep the sensor visible to the reader as the device manufacturer advises'],
    searchTerm: 'CGM armband',
  },
  {
    id: 'skin-friendly-adhesive', name: 'Skin-Friendly Adhesive Patches', brand: 'Various brands', category: 'lifestyle',
    description: 'Adhesive patches designed to be gentler on skin, for securing sensors and pump sites.',
    keyFeatures: ['Gentle adhesive', 'Breathable backing', 'Sensor or site overlay options'],
    useCases: ['Sensor wear in hot or humid weather', 'Sensitive skin'],
    limitations: ['Check compatibility with your device', 'Stop using a patch and speak to your care team if skin reacts'],
    searchTerm: 'skin friendly adhesive patches diabetes',
  },
  {
    id: 'diabetes-travel-bag', name: 'Diabetes-Friendly Travel Bag', brand: 'Various brands', category: 'lifestyle',
    description: 'A travel bag with dedicated pockets for diabetes supplies, including space for a cooling pouch.',
    keyFeatures: ['Pockets for supplies', 'Insulated section', 'Shoulder or cross-body strap'],
    useCases: ['Day trips', 'Flights and long journeys'],
    limitations: ['Insulation slows temperature change; it does not cool supplies', 'Check the manufacturer’s temperature guidance'],
    searchTerm: 'diabetes travel bag insulated',
  },
];

export function categoryLabel(id: StoreCategory['id']): string {
  return storeCategories.find(category => category.id === id)?.label ?? id;
}
