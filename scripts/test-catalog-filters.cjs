const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

// Same TypeScript loader as the other scripts/test-*.cjs files.
require.extensions['.ts'] = (module, filename) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    fileName: filename, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  });
  module._compile(outputText, filename);
};
const load = file => require(path.join(process.cwd(), file));
const { filterProducts, filterDoctors, validateExperienceDraft, EXPERIENCE_LIMITS } = load('src/utils/catalogFilters.ts');
const { storeProducts, storeCategories, categoryLabel } = load('src/data/store/productsData.ts');
const { doctorProfiles, doctorSpecialties } = load('src/data/doctors/doctorsData.ts');

test('store catalogue has the five categories and every product maps to one', () => {
  assert.equal(storeCategories.length, 5);
  const ids = new Set(storeCategories.map(c => c.id));
  for (const product of storeProducts) assert.ok(ids.has(product.category), product.id);
  assert.equal(new Set(storeProducts.map(p => p.id)).size, storeProducts.length, 'product ids are unique');
});

test('store data contains no prices, ratings or stock claims', () => {
  const text = JSON.stringify(storeProducts);
  assert.doesNotMatch(text, /₹|\$|\brating\b|\bstars?\b|\bin stock\b|\bprice\b/i);
});

test('product search matches name, brand, category label and description; ignores case and extra spaces', () => {
  assert.ok(filterProducts(storeProducts, categoryLabel, { query: '  frio  ', category: 'all' }).some(p => p.brand === 'FRIO'));
  assert.ok(filterProducts(storeProducts, categoryLabel, { query: 'CGM', category: 'all' }).length >= 3);
  assert.equal(filterProducts(storeProducts, categoryLabel, { query: 'zzz-no-match', category: 'all' }).length, 0);
});

test('product category filter restricts results and combines with search', () => {
  const onlyDelivery = filterProducts(storeProducts, categoryLabel, { query: '', category: 'insulin-delivery' });
  assert.ok(onlyDelivery.length > 0 && onlyDelivery.every(p => p.category === 'insulin-delivery'));
  const none = filterProducts(storeProducts, categoryLabel, { query: 'frio', category: 'lifestyle' });
  assert.equal(none.length, 0);
});

test('doctor data is entirely demo and never claims real endorsement or rankings', () => {
  for (const doctor of doctorProfiles) {
    assert.equal(doctor.isDemo, true, doctor.id);
    assert.equal(doctor.experienceIsSample, true, doctor.id);
    assert.ok(doctor.communityExperience.startsWith('SAMPLE TEXT (fictional)'), doctor.id);
    assert.equal(doctor.clinicWebsite, undefined, 'no unverified clinic websites');
  }
  assert.doesNotMatch(JSON.stringify(doctorProfiles), /best|top doctor|rating|★|⭐/i);
});

test('doctor filters combine name search, city and specialty', () => {
  const all = filterDoctors(doctorProfiles, { query: '', city: 'all', specialty: 'all' });
  assert.equal(all.length, doctorProfiles.length);
  const endo = filterDoctors(doctorProfiles, { query: '', city: 'all', specialty: 'Endocrinologist' });
  assert.ok(endo.length >= 2 && endo.every(d => d.specialty === 'Endocrinologist'));
  const cityOnly = filterDoctors(doctorProfiles, { query: 'demo', city: 'Example City A, Demo State', specialty: 'all' });
  assert.ok(cityOnly.every(d => d.city === 'Example City A'));
  assert.equal(filterDoctors(doctorProfiles, { query: 'nobody', city: 'all', specialty: 'all' }).length, 0);
});

test('the seven specialty categories from the brief are present', () => {
  assert.deepEqual(doctorSpecialties, ['Endocrinologist', 'Diabetologist', 'Pediatric Endocrinologist', 'Diabetes Educator', 'Dietitian', 'Ophthalmologist', 'Other specialist']);
});

const goodDraft = {
  doctorName: 'Dr. Example Name', specialty: 'Endocrinologist', city: 'Example City', hospitalOrClinic: '',
  experience: 'The visit focused on reviewing my readings together and agreeing on a follow-up plan.', anonymous: true, consent: true,
};

test('experience validation accepts a complete, consented draft', () => {
  const result = validateExperienceDraft(goodDraft, doctorSpecialties);
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
});

test('experience validation requires consent and a known specialty', () => {
  const noConsent = validateExperienceDraft({ ...goodDraft, consent: false }, doctorSpecialties);
  assert.equal(noConsent.valid, false);
  assert.ok(noConsent.errors.consent);
  const badSpecialty = validateExperienceDraft({ ...goodDraft, specialty: '' }, doctorSpecialties);
  assert.ok(badSpecialty.errors.specialty);
});

test('experience validation enforces length limits', () => {
  const short = validateExperienceDraft({ ...goodDraft, experience: 'too short' }, doctorSpecialties);
  assert.ok(short.errors.experience);
  const long = validateExperienceDraft({ ...goodDraft, experience: 'x'.repeat(EXPERIENCE_LIMITS.experienceMax + 1) }, doctorSpecialties);
  assert.ok(long.errors.experience);
  const name = validateExperienceDraft({ ...goodDraft, doctorName: 'A' }, doctorSpecialties);
  assert.ok(name.errors.doctorName);
});

test('experience validation blocks email addresses and phone numbers', () => {
  const email = validateExperienceDraft({ ...goodDraft, experience: 'Contact me at someone@example.com about the visit and plan.' }, doctorSpecialties);
  assert.ok(email.errors.experience);
  const phone = validateExperienceDraft({ ...goodDraft, experience: 'My number is +91 98765 43210 and I want to talk about the plan.' }, doctorSpecialties);
  assert.ok(phone.errors.experience);
});

test('buy links are https and fall back to a neutral shopping search', () => {
  const { buyLinkFor } = load('src/utils/catalogFilters.ts');
  for (const product of storeProducts) {
    const href = buyLinkFor(product);
    assert.ok(href.startsWith('https://'), product.id);
  }
  assert.match(buyLinkFor({ searchTerm: 'insulin pen', buyUrl: undefined }), /^https:\/\/www\.google\.com\/search\?tbm=shop&q=insulin%20pen$/);
  assert.equal(buyLinkFor({ searchTerm: 'x', buyUrl: 'https://example.org/verified' }), 'https://example.org/verified');
});
