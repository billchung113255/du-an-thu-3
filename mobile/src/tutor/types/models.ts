/** Strongly typed domain models for the Times Edu tutor app. */

export type Curriculum = 'IGCSE' | 'A Level' | 'IB' | 'AP';
export type LessonMode = 'Online' | 'Tại nhà';
export type LessonStatus = 'upcoming' | 'done';
export type PaymentStatus = 'paid' | 'pending';

export interface Tutor {
  id: string;
  name: string;
  initials: string;
  subjects: string[];
}

export interface Student {
  id: string;
  name: string;
  initials: string;
  curriculum: Curriculum;
  subject: string;
  year: string;
  board: string;
  progress: number; // 0-100
  sessionsCompleted: number;
  attendance: number; // 0-100
  avgScore: number; // 0-100
  nextSessionLabel?: string;
}

export interface Lesson {
  id: string;
  studentId: string;
  studentName: string;
  curriculum: Curriculum;
  subject: string;
  topic?: string;
  mode: LessonMode;
  timeLabel: string; // e.g. '16:00'
  durationMins: number;
  dayLabel: string; // e.g. 'Hôm nay · Thứ 7, 14/06'
  status: LessonStatus;
}

export type ResourceType =
  | 'Đề thi'
  | 'Mark scheme'
  | 'Revision notes'
  | 'Worksheet'
  | 'Bài luyện'
  | 'Câu hỏi chủ đề';

export interface ResourceItem {
  id: string;
  title: string;
  type: ResourceType;
  curriculum: Curriculum;
  meta: string; // e.g. 'CIE 0625 · Jan 2024'
}

export interface TopicProgress {
  name: string;
  pct: number; // 0-100
}

export interface SessionRecord {
  id: string;
  topic: string;
  dateLabel: string;
  durationMins: number;
  mode: LessonMode;
  note?: string;
  pending?: boolean;
}

export interface Assessment {
  id: string;
  title: string;
  dateLabel: string;
  detail: string;
  score?: number; // 0-100, undefined when pending
  pending?: boolean;
}

export interface AssignedMaterial {
  id: string;
  title: string;
  meta: string;
  seen: boolean;
}

export interface TutorNote {
  id: string;
  dateLabel: string;
  text: string;
}

export interface Payment {
  id: string;
  title: string;
  dateLabel: string;
  amount: number; // VND
  status: PaymentStatus;
}

/** Aggregate payloads returned by the API layer. */
export interface DashboardData {
  tutor: Tutor;
  greeting: string;
  stats: { students: number; hoursThisMonth: number; lessonsThisWeek: number; earningsThisMonth: number };
  nextLesson: Lesson;
  todayLessons: Lesson[];
  todos: { id: string; title: string; meta: string; curriculum: Curriculum; tone: 'warn' | 'ib' }[];
}

export interface EarningsData {
  monthLabel: string;
  total: number;
  paid: number;
  pending: number;
  sessions: number;
  monthlySeries: { label: string; amount: number }[];
  payments: Payment[];
}

export interface StudentDetail {
  student: Student;
  target: string;
  predicted: string;
  examLabel: string;
  topics: TopicProgress[];
  sessions: SessionRecord[];
  assessments: Assessment[];
  materials: AssignedMaterial[];
  notes: TutorNote[];
  nextSession: { dateLabel: string; detail: string };
}

export interface LogSessionInput {
  topic: string;
  durationMins: number;
  mode: LessonMode;
  note?: string;
}
