const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'lms.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      department_id TEXT REFERENCES departments(id),
      status TEXT DEFAULT 'active',
      created_by TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS user_subjects (
      user_id TEXT NOT NULL REFERENCES users(id),
      subject_id TEXT NOT NULL,
      PRIMARY KEY (user_id, subject_id)
    );
    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      credits INTEGER DEFAULT 3,
      department_id TEXT REFERENCES departments(id),
      status TEXT DEFAULT 'active',
      proposed_by TEXT,
      note TEXT
    );
    CREATE TABLE IF NOT EXISTS subject_proposals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      credits INTEGER DEFAULT 3,
      department_id TEXT,
      proposed_by TEXT,
      status TEXT DEFAULT 'pending_training',
      note TEXT
    );
    CREATE TABLE IF NOT EXISTS class_proposals (
      id TEXT PRIMARY KEY,
      subject_id TEXT REFERENCES subjects(id),
      count INTEGER NOT NULL,
      proposed_by TEXT,
      status TEXT DEFAULT 'pending_training',
      note TEXT
    );
    CREATE TABLE IF NOT EXISTS classes (
      id TEXT PRIMARY KEY,
      subject_id TEXT REFERENCES subjects(id),
      name TEXT NOT NULL,
      capacity INTEGER DEFAULT 30,
      schedule TEXT,
      room TEXT,
      manager_id TEXT,
      status TEXT DEFAULT 'open'
    );
    CREATE TABLE IF NOT EXISTS class_lecturers (
      class_id TEXT NOT NULL REFERENCES classes(id),
      lecturer_id TEXT NOT NULL REFERENCES users(id),
      PRIMARY KEY (class_id, lecturer_id)
    );
    CREATE TABLE IF NOT EXISTS class_students (
      class_id TEXT NOT NULL REFERENCES classes(id),
      student_id TEXT NOT NULL REFERENCES users(id),
      registered_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (class_id, student_id)
    );
    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY,
      class_id TEXT REFERENCES classes(id),
      title TEXT NOT NULL,
      date TEXT,
      content TEXT,
      created_by TEXT
    );
    CREATE TABLE IF NOT EXISTS tests (
      id TEXT PRIMARY KEY,
      class_id TEXT REFERENCES classes(id),
      title TEXT NOT NULL,
      duration INTEGER DEFAULT 30,
      questions_json TEXT NOT NULL,
      created_by TEXT,
      status TEXT DEFAULT 'published'
    );
    CREATE TABLE IF NOT EXISTS test_results (
      id TEXT PRIMARY KEY,
      test_id TEXT REFERENCES tests(id),
      student_id TEXT REFERENCES users(id),
      score INTEGER,
      total INTEGER,
      answers_json TEXT,
      submitted_at TEXT DEFAULT (datetime('now')),
      UNIQUE(test_id, student_id)
    );
    CREATE TABLE IF NOT EXISTS grades (
      id TEXT PRIMARY KEY,
      student_id TEXT REFERENCES users(id),
      subject_id TEXT,
      class_id TEXT REFERENCES classes(id),
      midterm REAL DEFAULT 0,
      final REAL DEFAULT 0,
      average REAL DEFAULT 0,
      status TEXT DEFAULT 'fail',
      UNIQUE(student_id, class_id)
    );
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      text TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  const count = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  if (count > 0) return;

  const hash = bcrypt.hashSync('123456', 10);
  const ins = {
    dept: db.prepare('INSERT INTO departments (id, name) VALUES (?, ?)'),
    user: db.prepare(`INSERT INTO users (id, name, email, password_hash, role, department_id, status, created_by)
      VALUES (?, ?, ?, ?, ?, ?, 'active', ?)`),
    usub: db.prepare('INSERT INTO user_subjects (user_id, subject_id) VALUES (?, ?)'),
    sub: db.prepare(`INSERT INTO subjects (id, name, code, credits, department_id, status, proposed_by, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`),
    sp: db.prepare(`INSERT INTO subject_proposals (id, name, code, credits, department_id, proposed_by, status, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`),
    cp: db.prepare('INSERT INTO class_proposals (id, subject_id, count, proposed_by, status, note) VALUES (?, ?, ?, ?, ?, ?)'),
    cls: db.prepare(`INSERT INTO classes (id, subject_id, name, capacity, schedule, room, manager_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`),
    clec: db.prepare('INSERT INTO class_lecturers (class_id, lecturer_id) VALUES (?, ?)'),
    cstu: db.prepare('INSERT INTO class_students (class_id, student_id) VALUES (?, ?)'),
    les: db.prepare('INSERT INTO lessons (id, class_id, title, date, content, created_by) VALUES (?, ?, ?, ?, ?, ?)'),
    tst: db.prepare('INSERT INTO tests (id, class_id, title, duration, questions_json, created_by, status) VALUES (?, ?, ?, ?, ?, ?, ?)'),
    tr: db.prepare('INSERT INTO test_results (id, test_id, student_id, score, total, submitted_at) VALUES (?, ?, ?, ?, ?, ?)'),
    gr: db.prepare('INSERT INTO grades (id, student_id, subject_id, class_id, midterm, final, average, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'),
    notif: db.prepare('INSERT INTO notifications (id, user_id, text, read) VALUES (?, ?, ?, 0)'),
  };

  const seed = db.transaction(() => {
    [['d1', 'Công nghệ thông tin'], ['d2', 'Kinh tế'], ['d3', 'Ngoại ngữ']].forEach(([id, name]) => ins.dept.run(id, name));

    const users = [
      ['u1', 'Phạm Nhật Duy', 'admin@school.edu', 'admin', null, null],
      ['u2', 'Nguyễn Thị Hương', 'hr@school.edu', 'hr', null, 'u1'],
      ['u3', 'Trần Văn Hiệu', 'hieutruong@school.edu', 'principal', null, 'u1'],
      ['u4', 'Lê Minh Đào tạo', 'daotao@school.edu', 'training', null, 'u2'],
      ['u5', 'Phạm Quốc Hùng', 'cntt@school.edu', 'hod', 'd1', 'u2'],
      ['u6', 'Nguyễn Minh Anh', 'gv.java@school.edu', 'lecturer', 'd1', 'u2'],
      ['u7', 'Trần Bảo Nam', 'sv.nam@school.edu', 'student', null, 'u2'],
      ['u8', 'Phạm Anh Thư', 'sv.thu@school.edu', 'student', null, 'u2'],
      ['u9', 'Đỗ Khánh Linh', 'gv.csharp@school.edu', 'lecturer', 'd1', 'u2'],
    ];
    users.forEach(([id, name, email, role, dept, by]) => ins.user.run(id, name, email, hash, role, dept, by));

    ins.usub.run('u6', 'sub1');
    ins.usub.run('u6', 'sub2');
    ins.usub.run('u9', 'sub2');

    ins.sub.run('sub1', 'Lập trình Java', 'JAVA101', 3, 'd1', 'active', null, null);
    ins.sub.run('sub2', 'Lập trình C#', 'CSHARP101', 3, 'd1', 'active', null, null);
    ins.sub.run('sub3', 'Blockchain cơ bản', 'BCT201', 2, 'd1', 'pending_principal', 'u4', 'Môn mới đề xuất từ Phòng đào tạo');

    ins.sp.run('sp1', 'Machine Learning', 'ML301', 3, 'd1', 'u5', 'pending_training', 'Trưởng BM CNTT đề xuất môn mới');
    ins.cp.run('cp1', 'sub1', 2, 'u5', 'approved', 'HK2 2026');
    ins.cp.run('cp2', 'sub2', 1, 'u5', 'pending_training', 'Mở thêm lớp C#');

    ins.cls.run('c1', 'sub1', 'JAVA101-A', 30, 'T2,4 · 7:30–9:30', 'A101', 'u5', 'open');
    ins.cls.run('c2', 'sub1', 'JAVA101-B', 30, 'T3,5 · 13:30–15:30', 'A102', 'u5', 'open');
    ins.cls.run('c3', 'sub2', 'CSHARP101-A', 25, 'T2,5 · 9:45–11:45', 'B201', 'u5', 'open');

    [['c1', 'u6'], ['c2', 'u6'], ['c3', 'u9']].forEach(([c, l]) => ins.clec.run(c, l));
    ins.cstu.run('c1', 'u7');

    ins.les.run('les1', 'c1', 'Giới thiệu Java & JVM', '2026-06-10', 'Tổng quan ngôn ngữ Java, cài đặt JDK, Hello World.', 'u6');
    ins.les.run('les2', 'c1', 'Biến, kiểu dữ liệu & toán tử', '2026-06-12', 'Khai báo biến, kiểu nguyên thủy, ép kiểu.', 'u6');

    const questions = JSON.stringify([
      { q: 'Java là ngôn ngữ lập trình gì?', options: ['Biên dịch', 'Thông dịch', 'Hỗn hợp', 'Assembly'], answer: 2 },
      { q: 'Từ khóa khai báo hằng số trong Java?', options: ['const', 'final', 'static', 'define'], answer: 1 },
      { q: 'Kiểu dữ liệu nguyên thủy nào lưu số thực?', options: ['int', 'char', 'double', 'boolean'], answer: 2 },
    ]);
    ins.tst.run('tst1', 'c1', 'Kiểm tra giữa kỳ Java', 30, questions, 'u6', 'published');
    ins.tr.run('tr1', 'tst1', 'u7', 2, 3, '2026-06-14');
    ins.gr.run('gr1', 'u7', 'sub1', 'c1', 7, 8, 7.5, 'pass');

    ins.notif.run('n1', 'u8', 'Lớp JAVA101-B còn 30 chỗ — đăng ký ngay!');
    ins.notif.run('n2', 'u8', 'Lớp CSHARP101-A mở đăng ký HK2.');
    ins.notif.run('n3', 'u5', 'Đề xuất 1 lớp C# chờ Phòng đào tạo duyệt.');
    ins.notif.run('n4', 'u3', 'Môn Blockchain cơ bản chờ Hiệu trưởng phê duyệt.');
  });
  seed();
  console.log('Database seeded with demo data. Default password: 123456');
}

function uid(prefix) {
  return prefix + Date.now() + Math.random().toString(36).slice(2, 6);
}

function passFail(avg) {
  return avg >= 5 ? 'pass' : 'fail';
}

function buildStore() {
  const departments = db.prepare('SELECT id, name FROM departments').all();
  const users = db.prepare('SELECT id, name, email, role, department_id as departmentId, status, created_by as createdBy FROM users').all();
  const userSubjects = db.prepare('SELECT user_id, subject_id FROM user_subjects').all();
  const subjectMap = {};
  userSubjects.forEach((r) => {
    if (!subjectMap[r.user_id]) subjectMap[r.user_id] = [];
    subjectMap[r.user_id].push(r.subject_id);
  });
  users.forEach((u) => {
    u.subjectIds = subjectMap[u.id] || [];
    const classes = db.prepare('SELECT class_id FROM class_students WHERE student_id = ?').all(u.id);
    u.classIds = classes.map((c) => c.class_id);
  });

  const subjects = db.prepare(`SELECT id, name, code, credits, department_id as departmentId, status, proposed_by as proposedBy, note FROM subjects`).all();
  const subjectProposals = db.prepare(`SELECT id, name, code, credits, department_id as departmentId, proposed_by as proposedBy, status, note FROM subject_proposals`).all();
  const classProposals = db.prepare(`SELECT id, subject_id as subjectId, count, proposed_by as proposedBy, status, note FROM class_proposals`).all();

  const classes = db.prepare(`SELECT id, subject_id as subjectId, name, capacity, schedule, room, manager_id as managerId, status FROM classes`).all();
  classes.forEach((c) => {
    c.studentIds = db.prepare('SELECT student_id FROM class_students WHERE class_id = ?').all(c.id).map((r) => r.student_id);
    c.lecturerIds = db.prepare('SELECT lecturer_id FROM class_lecturers WHERE class_id = ?').all(c.id).map((r) => r.lecturer_id);
  });

  const lessons = db.prepare('SELECT id, class_id as classId, title, date, content, created_by as createdBy FROM lessons').all();
  const tests = db.prepare('SELECT id, class_id as classId, title, duration, questions_json, created_by as createdBy, status FROM tests').all();
  tests.forEach((t) => {
    t.questions = JSON.parse(t.questions_json);
    delete t.questions_json;
  });

  const testResults = db.prepare('SELECT test_id as testId, student_id as studentId, score, total, submitted_at as submittedAt FROM test_results').all();
  const grades = db.prepare('SELECT student_id as studentId, subject_id as subjectId, class_id as classId, midterm, final, average, status FROM grades').all();

  const notifications = db.prepare(`SELECT id, user_id as userId, text, read, created_at as createdAt FROM notifications ORDER BY created_at DESC`).all();
  notifications.forEach((n) => {
    n.read = !!n.read;
    const diff = Date.now() - new Date(n.createdAt).getTime();
    if (diff < 3600000) n.when = Math.max(1, Math.round(diff / 60000)) + ' phút trước';
    else if (diff < 86400000) n.when = Math.round(diff / 3600000) + ' giờ trước';
    else n.when = 'Hôm qua';
  });

  return { departments, users, subjects, subjectProposals, classProposals, classes, lessons, tests, testResults, grades, notifications };
}

module.exports = { db, initDb, buildStore, uid, passFail };
