// Checks the Insulin Explorer data for accuracy rules: every value is sourced,
// missing values stay missing, and nothing is presented as established without a source.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'knowledge', 'insulin-explorer.json'), 'utf8'));
const { sources, insulins } = data;
const FIELDS = ['onset', 'peak', 'duration', 'routes', 'pumpCompatibility', 'storage', 'mixing', 'formulationDifferences'];
const CATEGORIES = ['bolus', 'basal', 'premixed'];
const ACTION_CLASSES = ['ultra-rapid', 'rapid-acting', 'short-acting', 'intermediate-acting', 'long-acting', 'ultra-long-acting', 'premixed', 'co-formulation'];
const MARKET_STATUSES = ['verified-available', 'discontinued', 'being-phased-out', 'availability-unverified'];
const FORBIDDEN_DISPLAY = /^(0|n\/a|na|not applicable|none|-|—|tbd|unknown)$/i;

test('every record has the required shape and a unique id', () => {
  const ids = new Set();
  for (const record of insulins) {
    assert.ok(!ids.has(record.id), `duplicate id ${record.id}`);
    ids.add(record.id);
    assert.ok(CATEGORIES.includes(record.category), `${record.id}: bad category`);
    assert.ok(ACTION_CLASSES.includes(record.actionClass), `${record.id}: bad action class`);
    assert.match(record.concentration, /^U-(40|100|200|300)$/, `${record.id}: bad concentration`);
    assert.ok(record.brands.length > 0, `${record.id}: no brands`);
    assert.ok(record.genericName.trim(), `${record.id}: no generic name`);
  }
});

test('every field with a value has text and a known source; missing values are null, not zero', () => {
  for (const record of insulins) {
    for (const field of FIELDS) {
      const value = record[field];
      assert.ok(value && 'display' in value && 'sourceId' in value, `${record.id}.${field}: wrong shape`);
      if (value.display === null) {
        assert.equal(value.sourceId, null, `${record.id}.${field}: source without a value`);
        continue;
      }
      assert.ok(value.display.trim().length > 0, `${record.id}.${field}: empty text`);
      assert.ok(!FORBIDDEN_DISPLAY.test(value.display.trim()), `${record.id}.${field}: placeholder-like value "${value.display}"`);
      assert.ok(value.sourceId, `${record.id}.${field}: value without a source`);
      assert.ok(sources[value.sourceId], `${record.id}.${field}: unknown source ${value.sourceId}`);
    }
  }
});

test('pending-review records make no clinical claims', () => {
  for (const record of insulins.filter(item => item.reviewStatus === 'pending-review')) {
    for (const field of FIELDS) assert.equal(record[field].display, null, `${record.id}.${field} must be pending`);
    assert.equal(record.safetyNotes.length, 0, `${record.id}: pending record has safety notes`);
    assert.equal(record.lastReviewed, null, `${record.id}: pending record has a review date`);
    assert.equal(record.sources.length, 0, `${record.id}: pending record lists sources`);
  }
});

test('reviewed records cite sources they actually use', () => {
  for (const record of insulins.filter(item => item.reviewStatus !== 'pending-review')) {
    assert.ok(record.lastReviewed, `${record.id}: reviewed record needs a review date`);
    assert.ok(record.sources.length > 0, `${record.id}: reviewed record has no sources`);
    for (const id of record.sources) assert.ok(sources[id], `${record.id}: unknown source ${id}`);
    for (const field of FIELDS) {
      const sourceId = record[field].sourceId;
      if (sourceId) assert.ok(record.sources.includes(sourceId), `${record.id}.${field}: source ${sourceId} not listed on record`);
    }
  }
});

test('sources are https links with real verification dates', () => {
  for (const [id, source] of Object.entries(sources)) {
    assert.match(source.url, /^https:\/\//, `${id}: url must be https`);
    assert.match(source.verified, /^\d{4}-\d{2}-\d{2}$/, `${id}: bad verified date`);
    assert.ok(!Number.isNaN(Date.parse(source.verified)), `${id}: invalid verified date`);
    assert.ok(source.org && source.title, `${id}: missing org or title`);
  }
});

test('market availability uses the allowed states and never claims availability without a source', () => {
  for (const record of insulins) {
    assert.ok(record.marketAvailability.length > 0, `${record.id}: no market entries`);
    for (const market of record.marketAvailability) {
      assert.ok(MARKET_STATUSES.includes(market.status), `${record.id}: bad status ${market.status}`);
      if (market.status === 'verified-available') {
        assert.ok(market.sourceId && market.verifiedOn, `${record.id}: ${market.country} claimed available without source and date`);
      }
    }
  }
});

test('no record is marked available in India without a dated source', () => {
  for (const record of insulins) {
    const india = record.marketAvailability.find(market => market.country === 'India');
    if (india) assert.notEqual(india.status, 'verified-available', `${record.id}: India availability must stay unverified until sourced`);
  }
});

test('explorer text does not contain patient dosing instructions', () => {
  const text = JSON.stringify(insulins);
  assert.doesNotMatch(text, /\b(take|inject|give)\s+\d+(\.\d+)?\s*(units?|u)\b/i);
  assert.doesNotMatch(text, /\byour dose (is|should be)\b/i);
});
