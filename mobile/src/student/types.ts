/** Domain models. Treat anything coming from the network as untrusted and parse defensively. */

export type Curriculum = 'IGCSE' | 'A Level' | 'IB DP' | 'AP';

export interface Topic {
  id: string;
  name: string;
  /** 0..100 */
  mastery: number;
}

export interface Subject {
  code: string;
  name: string;
  curriculum: Curriculum;
  /** 0..100 */
  mastery: number;
  topics: Topic[];
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface PlanItem {
  id: string;
  label: string;
  meta: string;
  done: boolean;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface WeakArea {
  subjectName: string;
  topicId: string;
  topicName: string;
  /** 0..100 */
  mastery: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface StudentProfile {
  name: string;
  curriculum: Curriculum;
  grade: string;
  streakDays: number;
  /** ISO date of the next exam, used for the countdown. */
  examDateISO: string;
}

/** Structured revision-note content for a topic detail screen. */
export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface FormulaRow {
  eq: string;
  note: string;
}

export interface NoteSection {
  heading: string;
  paragraphs: string[];
  formula?: { label: string; rows: FormulaRow[] };
  callout?: { kind: 'tip' | 'warn'; title: string; body: string };
}

export interface WorkedStep {
  label: string;
  text: string;
}

export interface WorkedExample {
  id: string;
  question: string;
  steps: WorkedStep[];
  answer: string;
}

export interface TopicContent {
  id: string;
  curriculum: Curriculum;
  subjectName: string;
  subjectCode: string;
  title: string;
  subtitle: string;
  examChips: string[];
  /** 0..100 */
  mastery: number;
  overview: string;
  objectives: string[];
  terms: GlossaryTerm[];
  notes: NoteSection[];
  examples: WorkedExample[];
  flashcards: Flashcard[];
}
