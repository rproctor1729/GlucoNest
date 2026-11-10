'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Copy, Download, Mail, ShieldCheck, Utensils, ChartNoAxesCombined, FileText, Plug, NotebookPen, BookOpen, Compass, MousePointer2, Smartphone, Accessibility, LayoutGrid, MessageSquare } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { FeedbackDraft, formatFeedback } from '@/lib/feedback';
import styles from './FeedbackSection.module.css';

const steps = ['Useful features', 'The experience', 'Your ideas'];
const features = [
  { label: 'Food & portions', detail: 'Indian foods and carbohydrate estimates', icon: Utensils },
  { label: 'Glucose charts', detail: 'Trends and time in range', icon: ChartNoAxesCombined },
  { label: 'Doctor reports', detail: 'A summary for appointments', icon: FileText },
  { label: 'Data connections', detail: 'Nightscout and CSV imports', icon: Plug },
  { label: 'Quick logging', detail: 'Meals, readings, insulin, and activity', icon: NotebookPen },
  { label: 'Practical guides', detail: 'Reading for everyday life with type 1', icon: BookOpen },
];
const improvements = [
  { label: 'Finding my way around', detail: 'Navigation and discovering features', icon: Compass },
  { label: 'Recording a moment', detail: 'The steps needed to add a log', icon: MousePointer2 },
  { label: 'Understanding charts', detail: 'Labels, ranges, and explanations', icon: ChartNoAxesCombined },
  { label: 'Using it on my phone', detail: 'Screen layout and touch controls', icon: Smartphone },
  { label: 'Reading comfortably', detail: 'Text size, contrast, and accessibility', icon: Accessibility },
  { label: 'Finding the right food', detail: 'Search, portions, and food coverage', icon: LayoutGrid },
];

export default function FeedbackSection() {
  const { submitFeedback } = useApp();
  const [step, setStep] = useState(0);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedImprovements, setSelectedImprovements] = useState<string[]>([]);
  const [suggestion, setSuggestion] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [saved, setSaved] = useState<{ draft: FeedbackDraft; at: string } | null>(null);
  const [error, setError] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const panel = useRef<HTMLDivElement>(null);
  const focusStep = useRef(false);
  const feedbackEmail = process.env.NEXT_PUBLIC_FEEDBACK_EMAIL?.trim() || '';

  useEffect(() => {
    if (!focusStep.current) return;
    focusStep.current = false;
    panel.current?.focus({ preventScroll: true });
    panel.current?.scrollIntoView({ block: 'start' });
  }, [step, saved]);

  const moveTo = (next: number) => {
    if (next === step) return;
    focusStep.current = true;
    setStep(next);
    setError('');
  };
  const toggle = (value: string, selected: string[], set: (next: string[]) => void) => {
    set(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
    setError('');
  };
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (step !== 2) { moveTo(step + 1); return; }
    if (!selectedFeatures.length && !selectedImprovements.length && !suggestion.trim()) {
      setError('Choose a feature, flag an improvement, or add a suggestion before saving.');
      return;
    }
    const draft: FeedbackDraft = {
      isAnonymous,
      ...(!isAnonymous ? { nameOrHandle: name.trim() || undefined, emailOrContact: contact.trim() || undefined } : {}),
      challengingPart: [], currentAppsUsed: [],
      dislikedAspects: selectedImprovements,
      indianFoodHelpfulness: 'Not answered', patternExplanationsHelpfulness: 'Not answered',
      featureWouldUseRegularly: selectedFeatures,
      wishSomeoneBuilt: suggestion.trim(), additionalSuggestions: '',
    };
    if (!submitFeedback(draft)) {
      setError('Your answers could not be saved. Browser storage may be unavailable or full. Your answers are still here; try again after freeing space.');
      return;
    }
    focusStep.current = true;
    setSaved({ draft, at: new Date().toISOString() });
    setError('');
  };
  const copy = async () => {
    if (!saved) return;
    try {
      await navigator.clipboard.writeText(formatFeedback(saved.draft, saved.at));
      setCopyStatus('Copied. You can paste your feedback to share it.');
    } catch {
      setCopyStatus('Copy is unavailable in this browser. Download your feedback instead.');
    }
  };
  const download = () => {
    if (!saved) return;
    const fileUrl = URL.createObjectURL(new Blob([formatFeedback(saved.draft, saved.at)], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = `GlucoNest-feedback-${saved.at.slice(0, 10)}.txt`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
  };
  const startAgain = () => {
    setSelectedFeatures([]); setSelectedImprovements([]); setSuggestion('');
    setIsAnonymous(true); setName(''); setContact(''); setCopyStatus(''); setError('');
    focusStep.current = true;
    setStep(0); setSaved(null);
  };

  return <div className={`${styles.workspace} animate-fadeIn`}>
    {saved ? <div ref={panel} tabIndex={-1} className={`${styles.paper} ${styles.success}`}>
      <span className={styles.successIcon}><CheckCircle2 size={30} aria-hidden="true" /></span>
      <h2>Thank you for helping shape GlucoNest.</h2>
      <p>Your feedback is saved in this browser. Copy or download it to share with the maintainer.</p>
      <div className={styles.successActions}>
        <button type="button" className={styles.primary} onClick={() => void copy()}><Copy size={16} aria-hidden="true" /> Copy feedback</button>
        <button type="button" className={styles.secondary} onClick={download}><Download size={16} aria-hidden="true" /> Download text</button>
        {feedbackEmail && <a className={styles.secondary} href={`mailto:${feedbackEmail}?subject=${encodeURIComponent('GlucoNest feedback')}&body=${encodeURIComponent(formatFeedback(saved.draft, saved.at))}`}><Mail size={16} aria-hidden="true" /> Open email draft</a>}
      </div>
      <p role="status" className={styles.copyStatus}>{copyStatus}</p>
      <button type="button" className={styles.textButton} onClick={startAgain}>Write another response <ArrowRight size={15} aria-hidden="true" /></button>
    </div> : <form onSubmit={save} className={styles.paper}>
      <nav aria-label="Feedback steps" className={styles.steps}>
        {steps.map((label, index) => <button key={label} type="button" aria-current={step === index ? 'step' : undefined} onClick={() => moveTo(index)} className={`${styles.step} ${step === index ? styles.activeStep : ''}`}><span>{index + 1}</span><span>{label}</span></button>)}
      </nav>
      <div ref={panel} tabIndex={-1} className={styles.panel}>
        <div className={styles.questionMeta}><span>STEP {step + 1} OF 3</span><span>{step < 2 ? 'Choose any that apply' : 'Optional, in your own words'}</span></div>
        {step < 2 ? <fieldset className={styles.question}>
          <legend>{step === 0 ? 'Which features would you come back for?' : 'Where could GlucoNest feel easier to use?'}</legend>
          <p className={styles.hint}>{step === 0 ? 'Help us understand what deserves the most attention.' : 'Flag anything you noticed. You can skip this if nothing stood out.'}</p>
          <div className={styles.choices}>
            {(step === 0 ? features : improvements).map(({label, detail, icon: Icon}) => {
              const selected = (step === 0 ? selectedFeatures : selectedImprovements).includes(label);
              return <label key={label} className={`${styles.choice} ${selected ? styles.selected : ''}`}>
                <input type="checkbox" aria-label={label} checked={selected} onChange={() => step === 0 ? toggle(label, selectedFeatures, setSelectedFeatures) : toggle(label, selectedImprovements, setSelectedImprovements)} />
                <span className={styles.choiceIcon}><Icon size={20} strokeWidth={1.6} aria-hidden="true" /></span>
                <span className={styles.choiceText}><strong>{label}</strong><span>{detail}</span></span>
                <span className={styles.check} aria-hidden="true">{selected && <Check size={13} />}</span>
              </label>;
            })}
          </div>
        </fieldset> : <div className={styles.ideas}>
          <label className={styles.ideaLabel} htmlFor="feedback-suggestion">What should we improve or add next?</label>
          <p id="suggestion-hint" className={styles.hint}>An idea, a confusing moment, or something that worked well.</p>
          <textarea id="feedback-suggestion" aria-describedby="suggestion-hint" value={suggestion} maxLength={2000} rows={4} placeholder="Tell us what would make GlucoNest better for you…" onChange={(event) => { setSuggestion(event.target.value); setError(''); }} />
          <div className={styles.characterCount}>{suggestion.length} / 2,000</div>
          <label className={styles.identity}><ShieldCheck size={18} aria-hidden="true" /><span>Keep my feedback anonymous</span><input type="checkbox" checked={isAnonymous} onChange={(event) => setIsAnonymous(event.target.checked)} /></label>
          {!isAnonymous && <div className={styles.contactFields}>
            <label htmlFor="feedback-name">Name or handle <span>(optional)</span><input id="feedback-name" type="text" autoComplete="nickname" maxLength={100} value={name} onChange={(event) => setName(event.target.value)} /></label>
            <label htmlFor="feedback-contact">Email or social handle <span>(optional)</span><input id="feedback-contact" type="text" maxLength={200} value={contact} onChange={(event) => setContact(event.target.value)} /></label>
          </div>}
        </div>}
        {error && <p role="alert" className={styles.error}>{error}</p>}
      </div>
      <footer className={styles.formFooter}>
        <p>{step === 2 ? 'Saved in this browser. Copy or download to share.' : 'Every question is optional. Your answers stay as you move between steps.'}</p>
        <div className={styles.actions}>{step > 0 && <button type="button" className={styles.secondary} onClick={() => moveTo(step - 1)}><ArrowLeft size={16} aria-hidden="true" /> Back</button>}<button type="submit" className={styles.primary}>{step === 2 ? <><MessageSquare size={16} aria-hidden="true" /> Save feedback</> : <>Continue <ArrowRight size={16} aria-hidden="true" /></>}</button></div>
      </footer>
    </form>}
  </div>;
}
