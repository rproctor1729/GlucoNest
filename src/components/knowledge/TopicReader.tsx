'use client';

import { ArrowUpRight } from 'lucide-react';
import { relatedTopics, sources, topicHref, type Topic } from '@/lib/knowledge';
import LearningActivity, { KnowledgeQuiz } from './LearningActivity';
import styles from './KnowledgeHub.module.css';

export function EmergencyNotice() {
  return <aside className={styles.urgent}><strong>When to seek urgent help</strong>
    <p>Vomiting with type 1 diabetes, significant ketones, rapid breathing, altered consciousness or suspected DKA need urgent medical assessment. For severe symptoms, call your local emergency service. Do not stop insulin during illness without professional guidance.</p>
    <a href={sources.emergency.url}>NHS guidance on diabetic ketoacidosis</a></aside>;
}
const tools: Record<string, [string, string]> = {
  nightscout: ['devices','Open Devices & Data Sources'],
  'preparing-for-appointments': ['report','Open Doctor Report'],
  'peer-communities': ['about','Read community stories'],
  'ambulatory-glucose-profile-agp': ['insights','Open My Insights'],
};
export default function TopicReader({ topic }: { topic: Topic }) {
  const lesson = topic.lesson;
  const tool = tools[topic.id];
  return <article className={styles.article}>
    <header className={styles.readerHead}><p className={styles.meta}>{topic.category.short} · {topic.difficulty}{lesson && ` · ${topic.minutes} min read`}</p>
      <h1 tabIndex={-1}>{topic.title}</h1>
      <p className={styles.intro}>{lesson?.summary ?? 'This topic is awaiting clinical review. For current guidance, use the official resources below.'}</p>
      <div className={styles.readerActions}>
        <small>{topic.reviewed ? 'Medically reviewed ' + topic.reviewed : 'Medical review pending'} · Edited <time dateTime={topic.updated}>{topic.updated}</time></small>
      </div>
    </header>
    {lesson ? <>
      <section><h2>Why it matters for T1D</h2><p>{lesson.why}</p></section>
      <section><h2>How it works</h2><p>{lesson.how}</p></section>
      <LearningActivity topic={topic} />
      <div className={styles.example}><h2>Everyday example</h2><small>Hypothetical scenario</small><p>{lesson.example}</p></div>
      <section><h2>What to watch for</h2><p>{lesson.caution}</p></section>
      <section><h2>Key takeaways</h2><ul>{lesson.takeaways.map(point => <li key={point}>{point}</li>)}</ul></section>
      <section><h2>Questions people ask</h2>{[[lesson.question, lesson.answer], ...topic.category.faq].map(([q, a]) =>
        <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</section>
      <KnowledgeQuiz id={topic.id} />
      {tool && <a className={styles.toolLink} href={'#' + tool[0]}>{tool[1]} <ArrowUpRight size={16} /></a>}
    </> : <EmergencyNotice />}
    <section><h2>Trusted references</h2><ul className={styles.references}>{topic.sourceIds.map(id => {
      const source = sources[id];
      return <li key={id}><a href={source.url}>{source.title} <ArrowUpRight size={14} /></a>
        <small>{source.org}{source.issued && ' · ' + source.issued} · Source checked <time dateTime={source.verified}>{source.verified}</time></small></li>;
    })}</ul></section>
    <section><h2>Related topics</h2><ul>{relatedTopics(topic).map(item => <li key={item.id}><a href={topicHref(item.id)}>{item.title}</a></li>)}</ul></section>
    <p className={styles.disclaimer}>Educational reading. Your diabetes team guides individual treatment.</p>
  </article>;
}
