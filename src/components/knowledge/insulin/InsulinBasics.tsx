import styles from './InsulinExplorer.module.css';

// General education only. No patient-specific doses or dose calculations appear here.
const ITEMS: [string, string][] = [
  ['What is insulin?', 'Insulin is a hormone that helps move glucose from the blood into the body’s cells. In type 1 diabetes the body makes little or no insulin, so it has to be given by injection or an insulin pump.'],
  ['What is basal insulin?', 'Basal (background) insulin works steadily between meals and overnight. Your care team sets the basal plan for you.'],
  ['What is bolus insulin?', 'Bolus (mealtime) insulin is taken around meals, or to correct a high glucose reading. Its effect is shorter than basal insulin’s.'],
  ['What is a basal-bolus regimen?', 'A basal-bolus regimen combines background insulin with mealtime insulin. The exact plan is set by your diabetes care team and is not provided by this explorer.'],
  ['What is the difference between rapid and regular insulin?', 'Rapid-acting insulins are designed to start and finish sooner than regular human insulin. Timing relative to meals differs between them, so follow the product label and your care team’s advice.'],
  ['What do onset, peak and duration mean?', 'Onset is how long before a product starts to lower glucose. Peak is when its effect is strongest. Duration is how long the effect lasts. These values vary between people, doses and injection sites. Product labels report them as study ranges.'],
  ['What are U-40, U-100, U-200 and U-300?', 'These describe how many units of insulin are in each millilitre: U-100 is 100 units per mL, U-200 is 200 units per mL and U-300 is 300 units per mL. U-40 is 40 units per mL and is an older concentration that no product in this explorer uses. Products with different concentrations are not interchangeable without guidance from your care team.'],
  ['What is the difference between insulin pens, vials and pumps?', 'A pen is a prefilled device for injections. A vial is a bottle that is drawn into a syringe. A pump delivers insulin continuously through a tube and infusion set. Each label says which devices a product is approved for.'],
  ['What is insulin stacking?', 'Stacking means giving correction insulin before an earlier dose has finished working. It can lead to low glucose. Discuss correction plans with your care team.'],
  ['Why do injection sites matter?', 'Rotating sites helps insulin absorb in a steady way. Repeated injections in the same spot can cause lumps (lipohypertrophy) that change how insulin is absorbed. Check the label for approved sites.'],
  ['How should insulin be stored?', 'Unopened insulin is usually kept refrigerated until its expiry date. Opened products usually have a limit at room temperature. Heat and freezing can damage insulin. The label gives product-specific storage rules.'],
  ['What is the difference between biosimilar and reference insulin?', 'A biosimilar is a product shown to be highly similar to a reference biologic. Device, concentration and formulation differences can still matter, so check the product’s own label.'],
  ['Why should insulin formulations not be switched without medical guidance?', 'Switching the product, type or concentration can change how insulin acts and can lead to dosing errors. Changes should only be made with your qualified healthcare professional.'],
];

export default function InsulinBasics() {
  return (
    <section className={styles.section} aria-labelledby="basics-heading">
      <h2 id="basics-heading">Insulin basics</h2>
      <p className={styles.notice}>
        Draft explanations. These are pending clinical review by qualified diabetes clinicians before publication.
        They are general education and do not give doses.
      </p>
      <div className={styles.accordion}>
        {ITEMS.map(([question, answer]) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
