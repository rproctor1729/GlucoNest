const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

function load(relativePath) {
  const source = fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const module = { exports: {} };
  new Function('exports', 'require', 'module', code)(module.exports, require, module);
  return module.exports;
}
const { formatFeedback } = load('src/lib/feedback.ts');
const { isCommunityFeedback, createLocalDataBackup, parseLocalDataBackup } = load('src/lib/localData.ts');
const draft = {
  isAnonymous: true,
  challengingPart: [], currentAppsUsed: [], dislikedAspects: ['Reading comfortably'],
  indianFoodHelpfulness: 'Not answered', patternExplanationsHelpfulness: 'Not answered',
  featureWouldUseRegularly: ['Food & portions'],
  wishSomeoneBuilt: 'Larger chart labels', additionalSuggestions: '',
};
const at = '2026-11-08T12:00:00.000Z';

test('anonymous feedback exports exclude contact details even if provided', () => {
  const text = formatFeedback({ ...draft, nameOrHandle: 'Private name', emailOrContact: 'private@example.com' }, at);
  assert.match(text, /Name: Anonymous/);
  assert.doesNotMatch(text, /Private name|private@example.com/);
  assert.match(text, /Food & portions/);
  assert.match(text, /Reading comfortably/);
  assert.match(text, /Larger chart labels/);
  assert.match(text, /2026-11-08T12:00:00.000Z/);
});

test('identified feedback exports preserve optional contact and unanswered questions', () => {
  const text = formatFeedback({ ...draft, isAnonymous: false, nameOrHandle: 'Test name', emailOrContact: '@test', featureWouldUseRegularly: [], wishSomeoneBuilt: '' }, at);
  assert.match(text, /Name: Test name/);
  assert.match(text, /Contact: @test/);
  assert.match(text, /Features I would use:\nNot answered/);
  assert.match(text, /My suggestion:\nNot answered/);
});

test('restructured feedback round-trips through backups and legacy ratings stay valid', () => {
  const feedback = { ...draft, id: 'feedback-test', submittedAt: at };
  assert.equal(isCommunityFeedback(feedback), true);
  assert.equal(isCommunityFeedback({ ...feedback, indianFoodHelpfulness: 'Extremely helpful', patternExplanationsHelpfulness: 'Sometimes' }), true);
  assert.equal(isCommunityFeedback({ ...feedback, indianFoodHelpfulness: 'unexpected' }), false);
  const backup = createLocalDataBackup({ manualReadings: [], meals: [], insulinLogs: [], activityLogs: [], feedbackList: [feedback] });
  assert.deepEqual(parseLocalDataBackup(backup).data.feedbackList, [feedback]);
});
