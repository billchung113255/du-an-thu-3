import type {
  DashboardData,
  EarningsData,
  Lesson,
  LogSessionInput,
  ResourceItem,
  SessionRecord,
  Student,
  StudentDetail,
  Tutor,
} from '../types/models';

/**
 * ============================================================================
 *  API BOUNDARY
 * ----------------------------------------------------------------------------
 *  Every screen talks to `tutorApi` only. Replace each method body with a real
 *  fetch/axios call to the Times Edu backend. The returned shapes are the
 *  contract the UI depends on — keep them stable or update ../types/models.ts.
 *
 *  Example:
 *    async getStudents() {
 *      const res = await fetch(`${BASE_URL}/tutor/students`, authHeaders());
 *      if (!res.ok) throw new ApiError(res.status);
 *      return (await res.json()) as Student[];
 *    }
 * ============================================================================
 */

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const TUTOR: Tutor = { id: 't1', name: 'Nguyễn Minh Anh', initials: 'MA', subjects: ['Toán', 'Vật lý'] };

const STUDENTS: Student[] = [
  { id: 's1', name: 'Trần Gia Bảo', initials: 'GB', curriculum: 'IGCSE', subject: 'Toán', year: 'Year 11', board: 'Edexcel', progress: 72, sessionsCompleted: 24, attendance: 96, avgScore: 78, nextSessionLabel: 'Hôm nay 16:00' },
  { id: 's2', name: 'Phạm Anh Thư', initials: 'AT', curriculum: 'A Level', subject: 'Vật lý', year: 'Year 13', board: 'CIE 9702', progress: 85, sessionsCompleted: 31, attendance: 97, avgScore: 82, nextSessionLabel: 'CN 15:00' },
  { id: 's3', name: 'Lê Khánh Vy', initials: 'KV', curriculum: 'IB', subject: 'Maths AA', year: 'DP1', board: 'IBO', progress: 48, sessionsCompleted: 12, attendance: 92, avgScore: 74, nextSessionLabel: 'Thứ 2 17:00' },
  { id: 's4', name: 'Đỗ Minh Quân', initials: 'MQ', curriculum: 'AP', subject: 'Calculus BC', year: 'Grade 12', board: 'College Board', progress: 63, sessionsCompleted: 18, attendance: 90, avgScore: 80, nextSessionLabel: 'CN 19:30' },
  { id: 's5', name: 'Vũ Hà My', initials: 'HM', curriculum: 'IGCSE', subject: 'Vật lý', year: 'Year 10', board: 'Edexcel', progress: 35, sessionsCompleted: 9, attendance: 94, avgScore: 70, nextSessionLabel: 'Hôm nay 18:00' },
  { id: 's6', name: 'Hoàng Đức', initials: 'HĐ', curriculum: 'A Level', subject: 'Toán', year: 'Year 12', board: 'CIE', progress: 58, sessionsCompleted: 21, attendance: 95, avgScore: 76, nextSessionLabel: 'Thứ 3 18:00' },
];

const LESSONS: Lesson[] = [
  { id: 'l1', studentId: 's1', studentName: 'Trần Gia Bảo', curriculum: 'IGCSE', subject: 'Toán · Đại số', mode: 'Online', timeLabel: '16:00', durationMins: 60, dayLabel: 'Hôm nay · Thứ 7, 14/06', status: 'upcoming' },
  { id: 'l2', studentId: 's5', studentName: 'Vũ Hà My', curriculum: 'IGCSE', subject: 'Vật lý · Sóng', mode: 'Tại nhà', timeLabel: '18:00', durationMins: 90, dayLabel: 'Hôm nay · Thứ 7, 14/06', status: 'upcoming' },
  { id: 'l3', studentId: 's2', studentName: 'Phạm Anh Thư', curriculum: 'A Level', subject: 'Vật lý · Cơ học', mode: 'Online', timeLabel: '15:00', durationMins: 90, dayLabel: 'Chủ nhật · 15/06', status: 'upcoming' },
  { id: 'l4', studentId: 's4', studentName: 'Đỗ Minh Quân', curriculum: 'AP', subject: 'Calculus BC · Chuỗi', mode: 'Online', timeLabel: '19:30', durationMins: 60, dayLabel: 'Chủ nhật · 15/06', status: 'upcoming' },
  { id: 'l5', studentId: 's3', studentName: 'Lê Khánh Vy', curriculum: 'IB', subject: 'Maths AA · Giải tích', mode: 'Tại nhà', timeLabel: '17:00', durationMins: 90, dayLabel: 'Thứ 2 · 16/06', status: 'upcoming' },
];

const RESOURCES: ResourceItem[] = [
  { id: 'r1', title: 'Edexcel IGCSE Maths — Paper 2H', type: 'Đề thi', curriculum: 'IGCSE', meta: 'Edexcel · Jan 2024' },
  { id: 'r2', title: 'Mark Scheme — IGCSE Maths 2H', type: 'Mark scheme', curriculum: 'IGCSE', meta: 'Edexcel · Jan 2024' },
  { id: 'r3', title: 'A Level Physics — Cơ học (Revision)', type: 'Revision notes', curriculum: 'A Level', meta: 'CIE 9702' },
  { id: 'r4', title: 'IB Maths AA — Giải tích (Worksheet)', type: 'Worksheet', curriculum: 'IB', meta: 'HL · DP1' },
  { id: 'r5', title: 'AP Calculus BC — Practice Set: Chuỗi', type: 'Bài luyện', curriculum: 'AP', meta: 'College Board' },
  { id: 'r6', title: 'CIE IGCSE Physics — Topic: Sóng', type: 'Câu hỏi chủ đề', curriculum: 'IGCSE', meta: 'CIE 0625' },
];

const STUDENT_DETAIL: Record<string, StudentDetail> = {
  s2: {
    student: STUDENTS[1],
    target: 'A*',
    predicted: 'A',
    examLabel: 'Tháng 6 · 2026',
    topics: [
      { name: 'Cơ học', pct: 100 },
      { name: 'Dao động & Sóng', pct: 95 },
      { name: 'Điện học', pct: 88 },
      { name: 'Điện từ', pct: 70 },
      { name: 'Vật lý hạt nhân', pct: 55 },
      { name: 'Nhiệt & Khí lý tưởng', pct: 40 },
    ],
    sessions: [
      { id: 'se1', topic: 'Cơ học · Động lực học', dateLabel: '13/06', durationMins: 90, mode: 'Online', note: 'Nắm tốt định luật bảo toàn động lượng; cần luyện thêm bài va chạm 2 chiều.' },
      { id: 'se2', topic: 'Dao động & Sóng · Giao thoa', dateLabel: '10/06', durationMins: 90, mode: 'Online', note: 'Hiểu rõ điều kiện giao thoa, nhiễu xạ qua khe đơn.' },
      { id: 'se3', topic: 'Điện học · Mạch & nội trở', dateLabel: '06/06', durationMins: 90, mode: 'Tại nhà', note: 'Thành thạo định luật Kirchhoff; lưu ý dấu trong mạch nhiều nguồn.' },
      { id: 'se4', topic: 'Chữa mock test tổng hợp', dateLabel: '03/06', durationMins: 120, mode: 'Online', note: 'Mock đạt 78%, mất điểm chủ yếu phần đọc & vẽ đồ thị.' },
      { id: 'se5', topic: 'Điện từ · Cảm ứng điện từ', dateLabel: '30/05', durationMins: 90, mode: 'Online', note: 'Định luật Faraday & Lenz ổn; cần thêm bài tập suất điện động.' },
    ],
    assessments: [
      { id: 'a1', title: 'Đề Cơ học · Paper 4 (luyện)', dateLabel: 'Nộp 12/06', detail: 'Chờ chấm', pending: true },
      { id: 'a2', title: 'Mock test tổng hợp', dateLabel: '03/06', detail: '9702 toàn phần', score: 78 },
      { id: 'a3', title: 'Past Paper 9702/42', dateLabel: '28/05', detail: 'M/J 2023', score: 84 },
      { id: 'a4', title: 'Topic test · Sóng', dateLabel: '20/05', detail: '20 câu', score: 90 },
      { id: 'a5', title: 'Past Paper 9702/41', dateLabel: '12/05', detail: 'O/N 2022', score: 75 },
    ],
    materials: [
      { id: 'm1', title: 'A Level Physics — Cơ học (Revision)', meta: 'Revision notes · CIE 9702', seen: true },
      { id: 'm2', title: 'Past Paper 9702/42 + Mark Scheme', meta: 'Đề thi · M/J 2023', seen: true },
      { id: 'm3', title: 'Worksheet — Cảm ứng điện từ', meta: 'Bài tập · 18 câu', seen: false },
      { id: 'm4', title: 'Topic Questions — Vật lý hạt nhân', meta: 'Câu hỏi chủ đề · CIE 9702', seen: false },
    ],
    notes: [
      { id: 'n1', dateLabel: '13/06/2026', text: 'Em tiến bộ rõ ở phần Cơ học. Ưu tiên Điện từ và Hạt nhân trong 3 tuần tới trước kỳ thi.' },
      { id: 'n2', dateLabel: '06/06/2026', text: 'Phụ huynh muốn tăng lên 2 buổi/tuần trong giai đoạn nước rút.' },
      { id: 'n3', dateLabel: '30/05/2026', text: 'Cần củng cố kỹ năng đọc đồ thị và trình bày bài tự luận có lập luận.' },
    ],
    nextSession: { dateLabel: 'Chủ nhật, 15/06 · 15:00', detail: 'Cơ học · Ôn đề Paper 4 · Online · 90 phút' },
  },
};

/** Build a minimal detail object for students without curated data. */
function fallbackDetail(student: Student): StudentDetail {
  return {
    student,
    target: 'A',
    predicted: 'B+',
    examLabel: 'Theo lịch chương trình',
    topics: [{ name: 'Đang cập nhật lộ trình', pct: student.progress }],
    sessions: [],
    assessments: [],
    materials: [],
    notes: [],
    nextSession: { dateLabel: student.nextSessionLabel ?? 'Chưa lên lịch', detail: `${student.subject} · ${student.board}` },
  };
}

let sessionSeq = 100;

export const tutorApi = {
  async login(email: string, password: string): Promise<{ token: string; tutor: Tutor }> {
    await delay(700);
    if (!email.trim() || password.length < 6) {
      throw new Error('Thông tin đăng nhập không hợp lệ.');
    }
    // TODO(api): POST /auth/tutor/login → { token }
    return { token: 'mock-jwt-token', tutor: TUTOR };
  },

  async getDashboard(): Promise<DashboardData> {
    await delay(500);
    return {
      tutor: TUTOR,
      greeting: 'Chào buổi chiều, Minh Anh',
      stats: { students: 6, hoursThisMonth: 42, lessonsThisWeek: 5, earningsThisMonth: 18_500_000 },
      nextLesson: LESSONS[0],
      todayLessons: LESSONS.filter((l) => l.dayLabel.startsWith('Hôm nay')),
      todos: [
        { id: 'td1', title: 'Chấm bài: Phạm Anh Thư', meta: 'Đề Cơ học · nộp 2 ngày trước', curriculum: 'A Level', tone: 'warn' },
        { id: 'td2', title: 'Phản hồi tiến độ: Lê Khánh Vy', meta: 'Đến hạn báo cáo tuần', curriculum: 'IB', tone: 'ib' },
      ],
    };
  },

  async getLessons(): Promise<Lesson[]> {
    await delay(450);
    return LESSONS;
  },

  async getStudents(): Promise<Student[]> {
    await delay(450);
    return STUDENTS;
  },

  async getResources(): Promise<ResourceItem[]> {
    await delay(450);
    return RESOURCES;
  },

  async getEarnings(): Promise<EarningsData> {
    await delay(500);
    return {
      monthLabel: 'Tháng 6 · 2026',
      total: 18_500_000,
      paid: 12_300_000,
      pending: 6_200_000,
      sessions: 28,
      monthlySeries: [
        { label: 'T1', amount: 9_600_000 },
        { label: 'T2', amount: 11_300_000 },
        { label: 'T3', amount: 8_900_000 },
        { label: 'T4', amount: 13_700_000 },
        { label: 'T5', amount: 12_600_000 },
        { label: 'T6', amount: 18_500_000 },
      ],
      payments: [
        { id: 'p1', title: 'Buổi dạy · Phạm Anh Thư (4 buổi)', dateLabel: '10/06/2026 · Chuyển khoản', amount: 2_400_000, status: 'paid' },
        { id: 'p2', title: 'Buổi dạy · Trần Gia Bảo (5 buổi)', dateLabel: '08/06/2026 · Chuyển khoản', amount: 2_750_000, status: 'paid' },
        { id: 'p3', title: 'Buổi dạy · Đỗ Minh Quân (3 buổi)', dateLabel: '05/06/2026 · Chuyển khoản', amount: 2_100_000, status: 'paid' },
        { id: 'p4', title: 'Buổi dạy · Lê Khánh Vy (4 buổi)', dateLabel: 'Chờ xác nhận từ phụ huynh', amount: 3_200_000, status: 'pending' },
      ],
    };
  },

  async getStudentDetail(studentId: string): Promise<StudentDetail> {
    await delay(500);
    const curated = STUDENT_DETAIL[studentId];
    if (curated) return curated;
    const student = STUDENTS.find((s) => s.id === studentId);
    if (!student) throw new Error('Không tìm thấy học viên.');
    return fallbackDetail(student);
  },

  async logSession(studentId: string, input: LogSessionInput): Promise<SessionRecord> {
    await delay(400);
    // TODO(api): POST /tutor/students/:id/sessions
    return {
      id: `local-${sessionSeq++}`,
      topic: input.topic,
      dateLabel: 'Hôm nay',
      durationMins: input.durationMins,
      mode: input.mode,
      note: input.note,
    };
  },
};

/** Format a VND amount with Vietnamese thousands separators (cross-platform safe). */
export function formatVND(amount: number): string {
  const sign = amount < 0 ? '-' : '';
  const digits = Math.abs(Math.round(amount)).toString();
  const withDots = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sign}${withDots} ₫`;
}

/** Compact VND, e.g. 18_500_000 → '18,5tr'. */
export function formatVNDShort(amount: number): string {
  if (amount >= 1_000_000) {
    const m = amount / 1_000_000;
    return `${m.toFixed(m % 1 === 0 ? 0 : 1).replace('.', ',')}tr`;
  }
  if (amount >= 1_000) return `${Math.round(amount / 1_000)}k`;
  return String(amount);
}
