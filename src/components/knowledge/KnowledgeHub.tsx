'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Activity, ArrowRight, BookOpen, ClipboardList, Dna, Footprints, Heart, Library, Microscope, Search, ShieldPlus, Sprout, Stethoscope, Syringe, Utensils, Users } from 'lucide-react';
import { categories, categoryHref, guideHref, HUB, practicalGuides, pathways, searchTopics, topicById, topicHref, type LibraryItem } from '@/lib/knowledge';
import TopicReader, { EmergencyNotice } from './TopicReader';
import styles from './KnowledgeHub.module.css';

const icons = [Syringe, Activity, Stethoscope, Microscope, Utensils, Footprints, ShieldPlus, Heart, ClipboardList, Users, Dna, Sprout];
function subscribe(listener: () => void) {
  window.addEventListener('hashchange', listener);
  window.addEventListener('popstate', listener);
  return () => { window.removeEventListener('hashchange', listener); window.removeEventListener('popstate', listener); };
}
const readHash = () => window.location.hash;
const hubHash = () => HUB;

function TopicLinks({ items }: { items: LibraryItem[] }) {
  return <ul className={styles.links}>{items.map(item => {
    const guide = 'guide' in item;
    const meta = guide ? 'Practical guide · ' + item.guide.readTime : item.lesson
      ? `${item.difficulty} · ${item.minutes} min read` : 'Official guidance · local review pending';
    return <li key={item.id}><a href={guide ? guideHref(item.id) : topicHref(item.id)} aria-label={item.title}>
      <small>{meta}</small><strong>{item.title}</strong>
      <span>{guide ? item.guide.summary : item.lesson?.summary}</span><ArrowRight size={18} aria-hidden="true" />
    </a></li>;
  })}</ul>;
}

export default function KnowledgeHub() {
  const hash = useSyncExternalStore(subscribe, readHash, hubHash);
  const [, kind, slug, extra] = hash.split('/');
  const topic = kind === 'topic' && !extra ? topicById.get(slug) : undefined;
  const category = kind === 'category' && !extra ? categories.find(item => item.id === slug) : undefined;
  const guide = kind === 'guide' && !extra ? practicalGuides.find(item => item.id === slug) : undefined;
  const allTopics = kind === 'topics' && !slug;
  const current = topic ?? guide;
  const path = kind === 'path' && !extra ? pathways.find(item => item.id === slug) : undefined;
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(12);
  const region = useRef<HTMLDivElement>(null);

  useEffect(() => {
    region.current?.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
    setLimit(12);
  }, [hash]);
  function reset() { setQuery(''); setLimit(12); }
  const listing = Boolean(allTopics || category || query.trim());
  const invalid = Boolean(kind && !current && !category && !path && !allTopics);
  const results = searchTopics(query, category?.id);
  const lookup = (ids: string[]) => ids.map(id => topicById.get(id)!);
  return <div ref={region} className={styles.hub}>
    {kind && <nav className={styles.crumbs} aria-label="Knowledge Hub breadcrumb"><a href={HUB} onClick={reset}><Library size={16} />T1D Knowledge Hub</a>
      {current && <><span>/</span><a onClick={reset} href={categoryHref(current.category.id)}>{current.category.short}</a></>}
      {(current || category || path || allTopics) && <><span>/</span><span aria-current="page">{current?.title ?? category?.short ?? path?.title ?? 'All topics'}</span></>}
    </nav>}
    {invalid ? <section><h1 tabIndex={-1}>Topic unavailable</h1><a href={HUB}>Browse the Knowledge Hub</a></section> :
    topic ? <TopicReader key={topic.id} topic={topic} /> :
    guide ? <article className={styles.article}><header className={styles.readerHead}><p className={styles.meta}>{guide.category.short} · {guide.guide.readTime}</p>
      <h1 tabIndex={-1}>{guide.title}</h1><p className={styles.intro}>{guide.guide.summary}</p></header>
      {guide.guide.illustration && <div className={styles.guideImage}><Image src={guide.guide.illustration.src} alt={guide.guide.illustration.alt}
        fill sizes="(max-width: 768px) 90vw, 720px" /></div>}
      {guide.guide.bodySections.map(section => <section key={section.heading}><h2>{section.heading}</h2><p>{section.content}</p></section>)}
      <section><h2>References</h2><ul className={styles.references}>{guide.guide.references?.map(ref => <li key={ref.url}><a href={ref.url}>{ref.label}</a></li>)}</ul></section>
      <a className={styles.toolLink} href={categoryHref(guide.category.id)} onClick={reset}>More in {guide.category.short}<ArrowRight size={16} /></a>
    </article> :
    path ? <section><h1 tabIndex={-1}>{path.title}</h1><p className={styles.intro}>{path.description}</p><TopicLinks items={lookup(path.ids)} /></section> : <>
      {allTopics ? <header><h1 tabIndex={-1}>All topics</h1></header> : category ? <header><h1 tabIndex={-1}>{category.title}</h1><p className={styles.intro}>{category.description}</p></header> :
        <header className={styles.hero}><div><h1 tabIndex={-1}>Understand T1D. Beyond the Numbers.</h1>
          <p>From your first insulin injection to understanding advanced glucose patterns — explore the science and everyday realities of Type 1 Diabetes.</p></div>
          <div className={styles.heroImage}><Image src="/images/knowledge-hub-photo.jpg" fill sizes="(max-width: 700px) 90vw, (max-width: 1100px) 36vw, 440px" alt="A person reviewing evidence-based diabetes and health guides in a calm, modern setting." priority /></div></header>}
      <p className={styles.disclaimer}>Medical education only. Use your care team’s plan for treatment decisions. GlucoNest does not recommend insulin doses.</p>
      {category?.id === 'emergencies' && <EmergencyNotice />}
      <section className={styles.searchArea} aria-label="Find a lesson">
        <label className={styles.search}><Search size={20} /><input type="search" aria-label="Search a topic" list="knowledge-suggestions"
          placeholder="Search a topic, e.g. low sugar or carbs" value={query} onChange={e => { setQuery(e.target.value); setLimit(12); }} /></label>
        <datalist id="knowledge-suggestions">{query.trim() && results.slice(0, 5).map(item => <option key={item.id} value={item.title} />)}</datalist>
        <div className={styles.filters}>
          <label><span className="sr-only">Category</span><select value={category?.id ?? ''} onChange={e => { window.location.hash = e.target.value ? categoryHref(e.target.value) : HUB + '/topics'; }}>
            <option value="">All categories</option>{categories.map(item => <option key={item.id} value={item.id}>{item.short}</option>)}</select></label>
        </div>
      </section>
      {listing ? <section aria-label="Search results"><div className={styles.sectionHead}><h2><span role="status">{results.length} {results.length === 1 ? 'topic' : 'topics'}</span></h2>
        {(category || query) && <a href={HUB + '/topics'} onClick={reset}>Clear search and category</a>}</div>
        {results.length ? <TopicLinks items={results.slice(0, limit)} /> : <p>No matches. Try “low sugar”, “CGM” or “carbs”, or choose All categories.</p>}
        {limit < results.length && <button className={styles.control} onClick={() => setLimit(limit + 12)}>Show more topics</button>}
      </section> : <>
        <div className={styles.paths}>{pathways.map(item => <a key={item.id} href={HUB + '/path/' + item.id}><BookOpen size={20} /><span>{item.title}<small>{item.ids.length} lessons</small></span><ArrowRight size={18} /></a>)}</div>
        <section><div className={styles.sectionHead}><h2>Browse by subject</h2><a href={HUB + '/topics'}>View all topics</a></div><div className={styles.categories}>{categories.map((item, index) => {
          const Icon = icons[index];
          return <a key={item.id} href={categoryHref(item.id)}><Icon size={23} strokeWidth={1.5} /><span><strong>{item.short}</strong><small>{item.description}</small></span></a>;
        })}</div></section>
      </>}
    </>}
  </div>;
}
