const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { db, initDb, buildStore, uid, passFail } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'lms-portal-secret-change-in-production';
const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, '..');

initDb();

const app = express();
app.use(cors());
app.use(express.json());

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Chưa đăng nhập' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Phiên đăng nhập hết hạn' });
  }
}

function getUser(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

function canCreate(creatorRole, targetRole) {
  if (creatorRole === 'admin') return ['principal', 'hr'].includes(targetRole);
  if (creatorRole === 'hr') return ['training', 'hod', 'lecturer', 'student'].includes(targetRole);
  return false;
}

function notify(userId, text) {
  db.prepare('INSERT INTO notifications (id, user_id, text) VALUES (?, ?, ?)').run(uid('n'), userId, text);
}

function notifyStudents(text) {
  db.prepare('SELECT id FROM users WHERE role = ?').all('student').forEach((s) => notify(s.id, text));
}

/* ===================== AUTH ===================== */
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Nhập email và mật khẩu' });
  const user = db.prepare('SELECT * FROM users WHERE email = ? AND status = ?').get(email.trim().toLowerCase(), 'active');
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
  }
  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  const safe = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    departmentId: user.department_id,
  };
  res.json({ token, user: safe });
});

app.get('/api/auth/me', auth, (req, res) => {
  const user = getUser(req.user.id);
  if (!user) return res.status(404).json({ error: 'Không tìm thấy tài khoản' });
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    departmentId: user.department_id,
  });
});

/* ===================== STORE ===================== */
app.get('/api/store', auth, (req, res) => {
  res.json(buildStore());
});

/* ===================== USERS ===================== */
app.post('/api/users', auth, (req, res) => {
  const creator = getUser(req.user.id);
  const { name, email, role, departmentId, password } = req.body || {};
  if (!canCreate(creator.role, role)) {
    return res.status(403).json({ error: 'Bạn không có quyền tạo vai trò này' });
  }
  if (!name || !email || !role) return res.status(400).json({ error: 'Thiếu thông tin' });
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email.trim().toLowerCase());
  if (exists) return res.status(409).json({ error: 'Email đã tồn tại' });
  const id = uid('u');
  const hash = bcrypt.hashSync(password || '123456', 10);
  const dept = ['hod', 'lecturer'].includes(role) ? departmentId : null;
  db.prepare(`INSERT INTO users (id, name, email, password_hash, role, department_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(id, name.trim(), email.trim().toLowerCase(), hash, role, dept, creator.id);
  res.json({ ok: true, id, store: buildStore() });
});

/* ===================== SUBJECTS ===================== */
app.post('/api/subjects/propose', auth, (req, res) => {
  if (req.user.role !== 'training') return res.status(403).json({ error: 'Chỉ Phòng đào tạo được đề xuất môn' });
  const { name, code, credits, departmentId } = req.body || {};
  const id = uid('sub');
  db.prepare(`INSERT INTO subjects (id, name, code, credits, department_id, status, proposed_by) VALUES (?, ?, ?, ?, ?, 'pending_principal', ?)`)
    .run(id, name, code, credits || 3, departmentId, req.user.id);
  db.prepare('SELECT id FROM users WHERE role = ?').all('principal').forEach((p) => notify(p.id, `Môn ${name} chờ Hiệu trưởng phê duyệt.`));
  res.json({ ok: true, store: buildStore() });
});

app.post('/api/subjects/:id/approve', auth, (req, res) => {
  if (req.user.role !== 'principal') return res.status(403).json({ error: 'Chỉ Hiệu trưởng được duyệt môn' });
  const sub = db.prepare('SELECT * FROM subjects WHERE id = ?').get(req.params.id);
  if (!sub) return res.status(404).json({ error: 'Không tìm thấy môn' });
  db.prepare("UPDATE subjects SET status = 'active' WHERE id = ?").run(req.params.id);
  db.prepare('SELECT id FROM users WHERE role = ?').all('training').forEach((u) => notify(u.id, `Môn ${sub.name} đã được Hiệu trưởng phê duyệt.`));
  res.json({ ok: true, store: buildStore() });
});

/* ===================== SUBJECT PROPOSALS (HOD) ===================== */
app.post('/api/subject-proposals', auth, (req, res) => {
  if (req.user.role !== 'hod') return res.status(403).json({ error: 'Chỉ Trưởng bộ môn được đề xuất' });
  const user = getUser(req.user.id);
  const { name, code } = req.body || {};
  const id = uid('sp');
  db.prepare(`INSERT INTO subject_proposals (id, name, code, credits, department_id, proposed_by, status) VALUES (?, ?, ?, 3, ?, ?, 'pending_training')`)
    .run(id, name, code || 'NEW', user.department_id, req.user.id);
  db.prepare('SELECT id FROM users WHERE role = ?').all('training').forEach((u) => notify(u.id, `Trưởng BM đề xuất môn ${name}.`));
  res.json({ ok: true, store: buildStore() });
});

app.post('/api/subject-proposals/:id/forward', auth, (req, res) => {
  if (req.user.role !== 'training') return res.status(403).json({ error: 'Chỉ Phòng đào tạo được chuyển tiếp' });
  const p = db.prepare('SELECT * FROM subject_proposals WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Không tìm thấy đề xuất' });
  const id = uid('sub');
  db.prepare(`INSERT INTO subjects (id, name, code, credits, department_id, status, proposed_by) VALUES (?, ?, ?, ?, ?, 'pending_principal', ?)`)
    .run(id, p.name, p.code, p.credits, p.department_id, req.user.id);
  db.prepare("UPDATE subject_proposals SET status = 'forwarded' WHERE id = ?").run(req.params.id);
  db.prepare('SELECT id FROM users WHERE role = ?').all('principal').forEach((u) => notify(u.id, `Môn ${p.name} (từ Trưởng BM) chờ phê duyệt.`));
  res.json({ ok: true, store: buildStore() });
});

/* ===================== CLASS PROPOSALS ===================== */
app.post('/api/class-proposals', auth, (req, res) => {
  if (req.user.role !== 'hod') return res.status(403).json({ error: 'Chỉ Trưởng bộ môn được đề xuất lớp' });
  const { subjectId, count } = req.body || {};
  const sub = db.prepare('SELECT name FROM subjects WHERE id = ? AND status = ?').get(subjectId, 'active');
  if (!sub) return res.status(400).json({ error: 'Môn học không hợp lệ' });
  const id = uid('cp');
  db.prepare('INSERT INTO class_proposals (id, subject_id, count, proposed_by, status) VALUES (?, ?, ?, ?, ?)')
    .run(id, subjectId, count || 1, req.user.id, 'pending_training');
  db.prepare('SELECT id FROM users WHERE role = ?').all('training').forEach((u) => notify(u.id, `Đề xuất ${count} lớp ${sub.name}.`));
  res.json({ ok: true, store: buildStore() });
});

app.post('/api/class-proposals/:id/approve', auth, (req, res) => {
  if (req.user.role !== 'training') return res.status(403).json({ error: 'Chỉ Phòng đào tạo được duyệt lớp' });
  const p = db.prepare('SELECT * FROM class_proposals WHERE id = ?').get(req.params.id);
  if (!p || p.status !== 'pending_training') return res.status(400).json({ error: 'Đề xuất không hợp lệ' });
  const sub = db.prepare('SELECT * FROM subjects WHERE id = ?').get(p.subject_id);
  const hod = getUser(p.proposed_by);
  for (let i = 1; i <= p.count; i++) {
    const cid = uid('c');
    const suffix = String.fromCharCode(64 + i);
    const existing = db.prepare('SELECT COUNT(*) as c FROM classes WHERE subject_id = ?').get(p.subject_id).c;
    const letter = String.fromCharCode(65 + existing + i - 1);
    db.prepare(`INSERT INTO classes (id, subject_id, name, capacity, schedule, room, manager_id, status) VALUES (?, ?, ?, 30, 'TBD', 'TBD', ?, 'open')`)
      .run(cid, p.subject_id, `${sub.code}-${letter}`, hod.id);
  }
  db.prepare("UPDATE class_proposals SET status = 'approved' WHERE id = ?").run(req.params.id);
  notify(p.proposed_by, `Đã tạo ${p.count} lớp ${sub.name}.`);
  notifyStudents(`Lớp ${sub.name} mở đăng ký!`);
  res.json({ ok: true, store: buildStore() });
});

/* ===================== CLASS REGISTRATION ===================== */
app.post('/api/classes/:id/register', auth, (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Chỉ sinh viên được đăng ký lớp' });
  const cls = db.prepare('SELECT * FROM classes WHERE id = ? AND status = ?').get(req.params.id, 'open');
  if (!cls) return res.status(404).json({ error: 'Lớp không tồn tại' });
  const enrolled = db.prepare('SELECT COUNT(*) as c FROM class_students WHERE class_id = ?').get(cls.id).c;
  if (enrolled >= cls.capacity) return res.status(409).json({ error: 'Lớp đã hết chỗ' });
  const exists = db.prepare('SELECT 1 FROM class_students WHERE class_id = ? AND student_id = ?').get(cls.id, req.user.id);
  if (exists) return res.status(409).json({ error: 'Bạn đã đăng ký lớp này' });
  db.prepare('INSERT INTO class_students (class_id, student_id) VALUES (?, ?)').run(cls.id, req.user.id);
  const sub = db.prepare('SELECT name FROM subjects WHERE id = ?').get(cls.subject_id);
  const gradeExists = db.prepare('SELECT 1 FROM grades WHERE student_id = ? AND class_id = ?').get(req.user.id, cls.id);
  if (!gradeExists) {
    db.prepare('INSERT INTO grades (id, student_id, subject_id, class_id, midterm, final, average, status) VALUES (?, ?, ?, ?, 0, 0, 0, ?)')
      .run(uid('gr'), req.user.id, cls.subject_id, cls.id, 'fail');
  }
  res.json({ ok: true, store: buildStore() });
});

/* ===================== LECTURER ASSIGNMENT ===================== */
app.post('/api/lecturers/:lecturerId/subjects/:subjectId/toggle', auth, (req, res) => {
  if (req.user.role !== 'hod') return res.status(403).json({ error: 'Chỉ Trưởng bộ môn được phân công' });
  const { lecturerId, subjectId } = req.params;
  const exists = db.prepare('SELECT 1 FROM user_subjects WHERE user_id = ? AND subject_id = ?').get(lecturerId, subjectId);
  if (exists) {
    db.prepare('DELETE FROM user_subjects WHERE user_id = ? AND subject_id = ?').run(lecturerId, subjectId);
  } else {
    db.prepare('INSERT INTO user_subjects (user_id, subject_id) VALUES (?, ?)').run(lecturerId, subjectId);
    db.prepare('SELECT id FROM classes WHERE subject_id = ? AND manager_id = ?').all(subjectId, req.user.id)
      .forEach((c) => {
        const has = db.prepare('SELECT 1 FROM class_lecturers WHERE class_id = ? AND lecturer_id = ?').get(c.id, lecturerId);
        if (!has) db.prepare('INSERT INTO class_lecturers (class_id, lecturer_id) VALUES (?, ?)').run(c.id, lecturerId);
      });
  }
  res.json({ ok: true, store: buildStore() });
});

/* ===================== LESSONS & TESTS ===================== */
app.post('/api/lessons', auth, (req, res) => {
  if (req.user.role !== 'lecturer') return res.status(403).json({ error: 'Chỉ giảng viên được tạo bài giảng' });
  const { classId, title, content } = req.body || {};
  const allowed = db.prepare('SELECT 1 FROM class_lecturers WHERE class_id = ? AND lecturer_id = ?').get(classId, req.user.id);
  if (!allowed) return res.status(403).json({ error: 'Bạn không dạy lớp này' });
  const id = uid('les');
  db.prepare('INSERT INTO lessons (id, class_id, title, date, content, created_by) VALUES (?, ?, ?, date("now"), ?, ?)')
    .run(id, classId, title, content || '', req.user.id);
  res.json({ ok: true, store: buildStore() });
});

app.post('/api/tests', auth, (req, res) => {
  if (req.user.role !== 'lecturer') return res.status(403).json({ error: 'Chỉ giảng viên được tạo bài kiểm tra' });
  const { classId, title, duration } = req.body || {};
  const allowed = db.prepare('SELECT 1 FROM class_lecturers WHERE class_id = ? AND lecturer_id = ?').get(classId, req.user.id);
  if (!allowed) return res.status(403).json({ error: 'Bạn không dạy lớp này' });
  const questions = JSON.stringify([
    { q: 'Câu hỏi mẫu 1?', options: ['A', 'B', 'C', 'D'], answer: 0 },
    { q: 'Câu hỏi mẫu 2?', options: ['A', 'B', 'C', 'D'], answer: 1 },
    { q: 'Câu hỏi mẫu 3?', options: ['A', 'B', 'C', 'D'], answer: 2 },
  ]);
  const id = uid('tst');
  db.prepare('INSERT INTO tests (id, class_id, title, duration, questions_json, created_by, status) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, classId, title, duration || 30, questions, req.user.id, 'published');
  const students = db.prepare('SELECT student_id FROM class_students WHERE class_id = ?').all(classId);
  students.forEach((s) => notify(s.student_id, `Bài kiểm tra mới: ${title}`));
  res.json({ ok: true, store: buildStore() });
});

app.post('/api/tests/:id/submit', auth, (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Chỉ sinh viên được nộp bài' });
  const test = db.prepare('SELECT * FROM tests WHERE id = ?').get(req.params.id);
  if (!test) return res.status(404).json({ error: 'Không tìm thấy bài kiểm tra' });
  const enrolled = db.prepare('SELECT 1 FROM class_students WHERE class_id = ? AND student_id = ?').get(test.class_id, req.user.id);
  if (!enrolled) return res.status(403).json({ error: 'Bạn không thuộc lớp này' });
  const done = db.prepare('SELECT 1 FROM test_results WHERE test_id = ? AND student_id = ?').get(test.id, req.user.id);
  if (done) return res.status(409).json({ error: 'Bạn đã nộp bài này' });
  const questions = JSON.parse(test.questions_json);
  const { answers } = req.body || {};
  let score = 0;
  questions.forEach((q, i) => { if (answers[i] === q.answer) score++; });
  const total = questions.length;
  const avg = Math.round((score / total) * 10 * 10) / 10;
  db.prepare('INSERT INTO test_results (id, test_id, student_id, score, total, answers_json) VALUES (?, ?, ?, ?, ?, ?)')
    .run(uid('tr'), test.id, req.user.id, score, total, JSON.stringify(answers));
  const grade = db.prepare('SELECT * FROM grades WHERE student_id = ? AND class_id = ?').get(req.user.id, test.class_id);
  if (grade) {
    const average = Math.round(((avg + (grade.final || 0)) / 2) * 10) / 10;
    db.prepare('UPDATE grades SET midterm = ?, average = ?, status = ? WHERE student_id = ? AND class_id = ?')
      .run(avg, average, passFail(average), req.user.id, test.class_id);
  } else {
    const cls = db.prepare('SELECT subject_id FROM classes WHERE id = ?').get(test.class_id);
    db.prepare('INSERT INTO grades (id, student_id, subject_id, class_id, midterm, final, average, status) VALUES (?, ?, ?, ?, ?, 0, ?, ?)')
      .run(uid('gr'), req.user.id, cls.subject_id, test.class_id, avg, avg, passFail(avg));
  }
  res.json({ ok: true, score, total, avg, store: buildStore() });
});

/* ===================== NOTIFICATIONS ===================== */
app.post('/api/notifications/:id/read', auth, (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ ok: true, store: buildStore() });
});

/* ===================== STATIC ===================== */
app.use(express.static(ROOT));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(ROOT, 'times-edu-platform.html'));
});

app.listen(PORT, () => {
  console.log(`LMS Portal running at http://localhost:${PORT}`);
  console.log('Default password for all accounts: 123456');
  console.log('Accounts: admin@school.edu, hr@school.edu, sv.nam@school.edu, ...');
});
