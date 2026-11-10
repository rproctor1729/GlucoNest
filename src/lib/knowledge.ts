import { educationalGuides } from '@/data/educationalContent';
import categories from '@/data/knowledge/categories.json';
import references from '@/data/knowledge/sources.json';
import insulin from '@/data/knowledge/insulin.json';
import patterns from '@/data/knowledge/patterns.json';
import injection from '@/data/knowledge/injection.json';
import technology from '@/data/knowledge/technology.json';
import nutrition from '@/data/knowledge/nutrition.json';
import activity from '@/data/knowledge/activity.json';
import emergencies from '@/data/knowledge/emergencies.json';
import wellbeing from '@/data/knowledge/wellbeing.json';
import prevention from '@/data/knowledge/prevention.json';
import lifeStages from '@/data/knowledge/life-stages.json';
import science from '@/data/knowledge/science.json';
import everyday from '@/data/knowledge/everyday.json';

export { categories };
export type Category = typeof categories[number];
export type Lesson = typeof insulin[number];
type DirectoryEntry = Pick<Lesson, 'id' | 'sourceIds' | 'title'> & { updated?: string; reviewed?: string | null };
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export interface Topic extends DirectoryEntry {
  category: Category;
  difficulty: Difficulty;
  minutes: number;
  lesson?: Lesson;
  updated: string;
  reviewed: string | null;
  tags: string[];
}
export const sources: Record<string, { title: string; org: string; url: string; issued?: string; verified: string }> = references;
const groups: Record<string, (DirectoryEntry | (DirectoryEntry & Lesson))[]> = {
  insulin, patterns, injection, technology, nutrition, activity, emergencies, wellbeing,
  prevention, 'life-stages': lifeStages, science, everyday,
};
const advanced = new Set(['ambulatory-glucose-profile-agp', 'glucose-variability-and-cv', 'somogyi-effect', 'euglycemic-dka']);
const intermediate = new Set(['insulin-to-carbohydrate-ratio-icr', 'insulin-sensitivity-factor-isf', 'insulin-on-board-iob', 'bolus-timing', 'hypoglycemia-unawareness', 'dawn-phenomenon', 'lipohypertrophy', 'pregnancy-planning-and-pregnancy', 'glycemic-index-versus-glycemic-load', 'glucose-management-indicator-gmi', 'automated-insulin-delivery-aid']);
const aliases: Record<string, string[]> = {
  'what-is-a-cgm': ['cgm', 'continuous glucose monitor', 'sensor'],
  'carbohydrate-counting': ['carbs', 'carb counting', 'counting carbs'],
  hypoglycemia: ['low sugar', 'hypo', 'hypoglycaemia', 'low blood sugar'],
  hyperglycemia: ['hyper', 'hyperglycaemia', 'high blood sugar'],
  'insulin-sensitivity-factor-isf': ['correction factor', '1800 rule'],
  'insulin-to-carbohydrate-ratio-icr': ['carb ratio', '500 rule'],
  'diabetic-ketoacidosis-dka': ['DKA', 'acidosis'],
  'lipohypertrophy': ['lumpy sites', 'lumps'],
  'fibre-and-digestion': ['fiber'],
  'kidney-health-and-albuminuria': ['UACR', 'eGFR'],
  'islet-autoantibodies': ['ZnT8', 'GAD65', 'IA-2'],
  'rage-bolusing': ['stacking', 'rage bolus'],
};
export const topics: Topic[] = categories.flatMap(category => groups[category.id].map(entry => {
  const lesson = 'how' in entry ? entry : undefined;
  const wordCount = lesson ? [lesson.summary, lesson.why, lesson.how, lesson.example, lesson.caution,
    ...lesson.takeaways, lesson.question, lesson.answer, ...category.faq.flat()].join(' ').split(/\s+/).length : 0;
  return {
    id: entry.id, title: entry.title, category, sourceIds: entry.sourceIds, lesson,
    updated: entry.updated ?? '2026-11-10', reviewed: entry.reviewed ?? null,
    difficulty: (category.id === 'science' && entry.id !== 'type-1-type-2-and-other-diabetes-types') || advanced.has(entry.id) ? 'Advanced' as const :
      intermediate.has(entry.id) ? 'Intermediate' as const : 'Beginner' as const,
    minutes: Math.max(1, Math.ceil(wordCount / 180)),
    tags: [...category.tags, ...(aliases[entry.id] ?? [])],
  };
}));
export const topicById = new Map(topics.map(topic => [topic.id, topic]));
export const HUB = '#knowledge-hub';
export const topicHref = (id: string) => HUB + '/topic/' + id;
export const categoryHref = (id: string) => HUB + '/category/' + id;
export const pathways = [
  { id: 'start', title: 'New to T1D? Start Here', description: 'Begin with the condition, then connect it to a meal and a glucose reading.',
    ids: ['type-1-type-2-and-other-diabetes-types', 'basal-bolus-insulin-therapy', 'carbohydrate-counting', 'what-is-a-cgm', 'hypoglycemia'] },
  { id: 'advanced', title: 'Explore Advanced Topics', description: 'Move from patterns on a report to feedback systems and research.',
    ids: ['glucose-variability-and-cv', 'ambulatory-glucose-profile-agp', 'insulin-on-board-iob', 'artificial-pancreas-systems', 'stem-cell-derived-islet-research'] },
];
export const practicalGuides = educationalGuides.filter(guide => !guide.isEmergency).map(guide => ({
  guide, category: categories.find(category => category.id === (guide.hubCategory ?? 'everyday'))!,
  id: guide.id, title: guide.title,
}));
export type LibraryItem = Topic | typeof practicalGuides[number];
export const guideHref = (id: string) => HUB + '/guide/' + id;
const libraryItems: LibraryItem[] = [...practicalGuides, ...topics];

function normalize(text: string) {
  return text.normalize('NFKD').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}
// Build the index once. Only public article text is eligible for search.
const index = libraryItems.map(item => {
  const { category } = item;
  let detail: string[];
  let keywords: string[];
  if ('guide' in item) {
    detail = [item.guide.summary, ...item.guide.bodySections.flatMap(section => [section.heading, section.content])];
    keywords = [item.guide.category];
  } else {
    const lesson = item.lesson;
    detail = lesson ? [lesson.summary, lesson.why, lesson.how, lesson.example, lesson.caution,
      ...lesson.takeaways, lesson.question, lesson.answer, ...category.faq.flat()] : [];
    keywords = aliases[item.id] ?? [];
  }
  const title = normalize(item.title);
  const tags = keywords.map(normalize);
  const subject = normalize([category.title, category.short, category.description, ...category.tags].join(' '));
  const body = normalize(detail.join(' '));
  return { item, title, tags, subject, text: [title, ...tags, subject, body].join(' ') };
});
export function searchTopics(query: string, categoryId?: string): LibraryItem[] {
  const phrase = normalize(query);
  const pool = categoryId ? index.filter(entry => entry.item.category.id === categoryId) : index;
  if (!phrase) return pool.map(entry => entry.item);
  const words = phrase.split(' ');
  return pool.filter(entry => words.every(word => entry.text.includes(word))).map(entry => ({
    item: entry.item,
    score: (entry.title === phrase ? 100 : 0) + (entry.tags.includes(phrase) ? 80 : 0) +
      (entry.title.includes(phrase) ? 40 : 0) + words.reduce((score, word) =>
        score + (entry.title.includes(word) ? 8 : entry.tags.some(tag => tag.includes(word)) ? 5 : entry.subject.includes(word) ? 2 : 1), 0),
  })).sort((a, b) => b.score - a.score).map(result => result.item);
}
export function relatedTopics(topic: Topic) {
  const category = topics.filter(other => other.category.id === topic.category.id && other.id !== topic.id);
  return category.sort((a, b) =>
    b.sourceIds.filter(id => topic.sourceIds.includes(id)).length - a.sourceIds.filter(id => topic.sourceIds.includes(id)).length
  ).slice(0, 3);
}
