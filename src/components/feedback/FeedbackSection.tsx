'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { CommunityFeedback } from '@/types';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  Copy,
  Mail,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Download,
  AlertCircle,
  HelpCircle,
  Info,
  Check,
} from 'lucide-react';

export default function FeedbackSection() {
  const { submitFeedback, feedbackList } = useApp();

  const [isAnonymous, setIsAnonymous] = useState(true);
  const [nameOrHandle, setNameOrHandle] = useState('');
  const [emailOrContact, setEmailOrContact] = useState('');

  // 1. Challenging part
  const [challengingPart, setChallengingPart] = useState<string[]>([]);
  const [challengingPartOther, setChallengingPartOther] = useState('');

  // 2. Apps used
  const [currentAppsUsed, setCurrentAppsUsed] = useState<string[]>([]);
  const [currentAppsOther, setCurrentAppsOther] = useState('');

  // 3. Disliked aspects
  const [dislikedAspects, setDislikedAspects] = useState<string[]>([]);
  const [dislikedAspectsOther, setDislikedAspectsOther] = useState('');

  // 4. Indian food helpfulness
  const [indianFoodHelpfulness, setIndianFoodHelpfulness] = useState<
    CommunityFeedback['indianFoodHelpfulness']
  >('Extremely helpful');

  // 5. Pattern explanations
  const [patternExplanationsHelpfulness, setPatternExplanationsHelpfulness] = useState<
    CommunityFeedback['patternExplanationsHelpfulness']
  >('Yes - helps me understand the why');

  // 6. Features that would make you use regularly
  const [featureWouldUseRegularly, setFeatureWouldUseRegularly] = useState<string[]>([]);
  const [featureOther, setFeatureOther] = useState('');

  // 7. Wish someone built
  const [wishSomeoneBuilt, setWishSomeoneBuilt] = useState('');

  // 8. Additional suggestions
  const [additionalSuggestions, setAdditionalSuggestions] = useState('');

  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const toggleCheckbox = (list: string[], setList: (val: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submissionData = {
      isAnonymous,
      nameOrHandle: isAnonymous ? undefined : nameOrHandle,
      emailOrContact: isAnonymous ? undefined : emailOrContact,
      challengingPart,
      challengingPartOther: challengingPartOther || undefined,
      currentAppsUsed,
      currentAppsOther: currentAppsOther || undefined,
      dislikedAspects,
      dislikedAspectsOther: dislikedAspectsOther || undefined,
      indianFoodHelpfulness,
      patternExplanationsHelpfulness,
      featureWouldUseRegularly,
      featureOther: featureOther || undefined,
      wishSomeoneBuilt,
      additionalSuggestions,
    };

    submitFeedback(submissionData);
    setSubmittedSuccess(true);
  };

  const buildFormattedText = () => {
    return `GlucoNest v0.1 Community Feedback
Submitted: ${new Date().toLocaleString()}
Anonymous: ${isAnonymous ? 'Yes' : `No (${nameOrHandle || 'Name not provided'})`}

1. Most challenging part:
${challengingPart.join(', ')} ${challengingPartOther ? `(Other: ${challengingPartOther})` : ''}

2. Current tools used:
${currentAppsUsed.join(', ')} ${currentAppsOther ? `(Other: ${currentAppsOther})` : ''}

3. Disliked aspects of existing apps:
${dislikedAspects.join(', ')} ${dislikedAspectsOther ? `(Other: ${dislikedAspectsOther})` : ''}

4. Indian Food Library usefulness:
${indianFoodHelpfulness}

5. Pattern explanations usefulness:
${patternExplanationsHelpfulness}

6. High-priority desired features:
${featureWouldUseRegularly.join(', ')} ${featureOther ? `(Other: ${featureOther})` : ''}

7. Wish someone built for T1D:
${wishSomeoneBuilt || 'None'}

8. Additional thoughts:
${additionalSuggestions || 'None'}`;
  };

  const handleCopyToClipboard = () => {
    const text = buildFormattedText();
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  const handleDownloadJson = () => {
    const text = buildFormattedText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gluconest-feedback-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Set NEXT_PUBLIC_FEEDBACK_EMAIL at build time to enable the email button.
  // When it is unset, the email button is hidden and users copy or download their text instead.
  const FEEDBACK_EMAIL = process.env.NEXT_PUBLIC_FEEDBACK_EMAIL ?? '';
  const mailtoLink = FEEDBACK_EMAIL
    ? `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(
        'GlucoNest Community Feedback'
      )}&body=${encodeURIComponent(buildFormattedText())}`
    : '';

  return (
    <div className="space-y-8 animate-fadeIn max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-nest-100 dark:bg-nest-950 text-nest-700 dark:text-nest-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-nest-500" />
          <span>Community Co-Creation</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Help Shape GlucoNest
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          This preview was built to start a conversation with fellow Type-1 warriors. Tell us what you actually need, what bugs you about existing apps, and what would make your everyday routine lighter.
        </p>
      </div>

      {/* Honest Prototype Notice */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#131b24] border border-slate-200 dark:border-slate-800 text-xs space-y-2 text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
          <Info className="w-4 h-4 text-nest-500 shrink-0" />
          <span>How Your Feedback is Handled in this Preview:</span>
        </div>
        <p className="leading-relaxed">
          Because this prototype runs without a central cloud database, clicking <strong>Submit</strong> stores your responses only in your browser. Nothing is sent to the maintainer automatically. To share your answers, copy or download the text and send it yourself. Please don&apos;t include identifying health details in free-text answers.
        </p>
      </div>

      {submittedSuccess ? (
        <div className="bg-white dark:bg-[#131b24] p-8 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 shadow-subtle text-center space-y-5 animate-fadeIn">
          <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Thank You for Your Voice!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Your feedback is saved only in this browser. To send it to the maintainer, copy or download your answers below{FEEDBACK_EMAIL ? ', or use the email button' : ''}.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleCopyToClipboard}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nest-500"
            >
              <Copy className="w-4 h-4" />
              <span>{copiedSuccess ? 'Copied to Clipboard!' : 'Copy Formatted Text'}</span>
            </button>

            {FEEDBACK_EMAIL && (
              <a
                href={mailtoLink}
                className="px-4 py-2 rounded-xl bg-nest-600 hover:bg-nest-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
              >
                <Mail className="w-4 h-4" />
                <span>Send via Email Client</span>
              </a>
            )}

            <button
              type="button"
              onClick={handleDownloadJson}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download (.txt)</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setSubmittedSuccess(false)}
              className="text-xs font-semibold text-nest-600 dark:text-nest-400 hover:underline"
            >
              ← Edit or Submit Another Response
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleFormSubmit} className="space-y-6 text-xs">
          {/* Privacy & Identity Option */}
          <div className="bg-white dark:bg-[#131b24] p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-subtle space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Identity & Privacy Preference</span>
            </h3>

            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="radio"
                  name="identity"
                  checked={isAnonymous}
                  onChange={() => setIsAnonymous(true)}
                  className="accent-nest-600"
                />
                <span>Submit Anonymously</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="radio"
                  name="identity"
                  checked={!isAnonymous}
                  onChange={() => setIsAnonymous(false)}
                  className="accent-nest-600"
                />
                <span>Include my name / handle</span>
              </label>
            </div>

            {!isAnonymous && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Your Name or Community Handle
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Arjun, Mumbai T1D"
                    value={nameOrHandle}
                    onChange={(e) => setNameOrHandle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Email or Social Contact (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="For follow-up previews"
                    value={emailOrContact}
                    onChange={(e) => setEmailOrContact(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Question 1: Most challenging part */}
          <div className="bg-white dark:bg-[#131b24] p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-subtle space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              1. What is the most challenging part of living with T1D for you?
            </h3>
            <p className="text-[11px] text-slate-400">Select all that resonate:</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {[
                'Guessing carbohydrates in Indian meals (Rotis, Biryani, Curries)',
                'Frequent 3 AM alarms & sleep disruption',
                'Fear of hypoglycemia during work or social events',
                'Diabetes burnout & decision fatigue (180 decisions/day)',
                'High cost of imported CGM sensors & insulin supplies',
                'Explaining T1D to relatives, coworkers, and friends',
              ].map((opt) => {
                const isSelected = challengingPart.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleCheckbox(challengingPart, setChallengingPart, opt)}
                    className={`p-3 rounded-xl border text-left transition-all text-xs flex items-center justify-between ${
                      isSelected
                        ? 'border-nest-500 bg-nest-50/50 dark:bg-nest-950/40 text-nest-900 dark:text-nest-200 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{opt}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-nest-600 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              placeholder="Other challenge (optional)..."
              value={challengingPartOther}
              onChange={(e) => setChallengingPartOther(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs mt-2"
            />
          </div>

          {/* Question 2: Which apps or tools do you currently use? */}
          <div className="bg-white dark:bg-[#131b24] p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-subtle space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              2. Which diabetes applications or tools do you currently use?
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {[
                'FreeStyle LibreLink',
                'Dexcom G6/G7 app',
                'xDrip+ / Juggluco',
                'Nightscout',
                'MyFitnessPal',
                'Sugarmate',
                'Pen & Paper Diary',
                'None (CGM only)',
              ].map((tool) => {
                const isSelected = currentAppsUsed.includes(tool);
                return (
                  <button
                    key={tool}
                    type="button"
                    onClick={() => toggleCheckbox(currentAppsUsed, setCurrentAppsUsed, tool)}
                    className={`p-2.5 rounded-xl border text-center transition-all text-xs ${
                      isSelected
                        ? 'border-nest-500 bg-nest-50 dark:bg-nest-950/40 text-nest-900 dark:text-nest-200 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {tool}
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              placeholder="Other app or pump app (optional)..."
              value={currentAppsOther}
              onChange={(e) => setCurrentAppsOther(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs mt-1"
            />
          </div>

          {/* Question 3: What do you dislike about existing diabetes applications? */}
          <div className="bg-white dark:bg-[#131b24] p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-subtle space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              3. What do you dislike most about existing diabetes applications?
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {[
                'Ugly clinical UI that feels like medical software from 1999',
                'Food databases only have Western foods (bagels, waffles, pretzels)',
                'Shaming notifications ("You spiked", alarming red warnings)',
                'Too many mandatory taps just to record one meal or walk',
                'Expensive monthly paywalls for basic charts',
                'Fears about personal health data being sold to insurance companies',
              ].map((dislike) => {
                const isSelected = dislikedAspects.includes(dislike);
                return (
                  <button
                    key={dislike}
                    type="button"
                    onClick={() => toggleCheckbox(dislikedAspects, setDislikedAspects, dislike)}
                    className={`p-3 rounded-xl border text-left transition-all text-xs flex items-center justify-between ${
                      isSelected
                        ? 'border-nest-500 bg-nest-50/50 dark:bg-nest-950/40 text-nest-900 dark:text-nest-200 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{dislike}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-nest-600 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              placeholder="Other grievance with existing apps..."
              value={dislikedAspectsOther}
              onChange={(e) => setDislikedAspectsOther(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs mt-2"
            />
          </div>

          {/* Question 4 & 5: Likert Questions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#131b24] p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-subtle space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                4. Would an Indian food & carbohydrate library help you?
              </h3>
              <div className="space-y-1.5">
                {[
                  'Extremely helpful',
                  'Somewhat helpful',
                  'Not sure',
                  'I already know my counts',
                ].map((ans) => (
                  <label
                    key={ans}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="q4"
                      checked={indianFoodHelpfulness === ans}
                      onChange={() => setIndianFoodHelpfulness(ans as any)}
                      className="accent-nest-600"
                    />
                    <span>{ans}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-[#131b24] p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-subtle space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                5. Would glucose pattern explanations be useful?
              </h3>
              <div className="space-y-1.5">
                {[
                  'Yes - helps me understand the why',
                  'Sometimes',
                  'No - just numbers please',
                ].map((ans) => (
                  <label
                    key={ans}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="q5"
                      checked={patternExplanationsHelpfulness === ans}
                      onChange={() => setPatternExplanationsHelpfulness(ans as any)}
                      className="accent-nest-600"
                    />
                    <span>{ans}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Question 6: What feature would make you use GlucoNest regularly? */}
          <div className="bg-white dark:bg-[#131b24] p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-subtle space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              6. What feature would make you use GlucoNest regularly?
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {[
                'Instant Indian meal carb plate calculator',
                'One-tap doctor-ready AGP PDF export for visits',
                'WhatsApp caregiver low-glucose alert helper',
                'Quiet supply expiry reminders (pens, sensor days)',
                'Local offline-first capability without logging in',
                'Community stories & peer support forum',
              ].map((feat) => {
                const isSelected = featureWouldUseRegularly.includes(feat);
                return (
                  <button
                    key={feat}
                    type="button"
                    onClick={() => toggleCheckbox(featureWouldUseRegularly, setFeatureWouldUseRegularly, feat)}
                    className={`p-3 rounded-xl border text-left transition-all text-xs flex items-center justify-between ${
                      isSelected
                        ? 'border-nest-500 bg-nest-50/50 dark:bg-nest-950/40 text-nest-900 dark:text-nest-200 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{feat}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-nest-600 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question 7: Wish someone had built */}
          <div className="bg-white dark:bg-[#131b24] p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-subtle space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              7. What is one thing you wish someone had built for the Indian T1D community?
            </h3>
            <textarea
              rows={3}
              placeholder="e.g. A trusted crowd-sourced directory of T1D-friendly endocrinologists who actually listen, or a simple guide for college hostels..."
              value={wishSomeoneBuilt}
              onChange={(e) => setWishSomeoneBuilt(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
            />
          </div>

          {/* Question 8: Additional Suggestions */}
          <div className="bg-white dark:bg-[#131b24] p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-subtle space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              8. Any additional feedback or thoughts on this prototype?
            </h3>
            <textarea
              rows={3}
              placeholder="What did you like about this preview? What felt missing or confusing?"
              value={additionalSuggestions}
              onChange={(e) => setAdditionalSuggestions(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-slate-400">
              Zero accounts required · Responses saved safely in browser storage
            </p>
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-nest-600 hover:bg-nest-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Community Feedback</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
