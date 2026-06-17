/* LMS API Client — đăng nhập thật, dữ liệu lưu SQLite */
const TOKEN_KEY = 'lms_token';
const AUTH = { token: null, user: null };
let STORE = null;

async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (AUTH.token) headers.Authorization = 'Bearer ' + AUTH.token;
  const res = await fetch('/api' + path, { ...opts, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Lỗi máy chủ');
  return data;
}

function applyStoreHelpers() {
  if (!STORE) return;
  STORE.user = (id) => STORE.users.find((u) => u.id === id);
  STORE.dept = (id) => STORE.departments.find((d) => d.id === id);
  STORE.subject = (id) => STORE.subjects.find((s) => s.id === id);
  STORE.cls = (id) => STORE.classes.find((c) => c.id === id);
  STORE.usersByRole = (r) => STORE.users.filter((u) => u.role === r);
  STORE.myNotifs = (uid) => STORE.notifications.filter((n) => n.userId === uid);
  STORE.classSlots = (c) => c.capacity - c.studentIds.length;
  STORE.passFail = (avg) => (avg >= 5 ? 'pass' : 'fail');
  STORE.passFailLabel = (s) =>
    s === 'pass'
      ? '<span class="pass-fail pass">Đạt</span>'
      : '<span class="pass-fail fail">Không đạt</span>';
}

async function loadStore() {
  const data = await api('/store');
  STORE = data;
  applyStoreHelpers();
  return STORE;
}

function me() {
  return AUTH.user;
}

function defaultView(role) {
  const nav = NAV_BY_ROLE[role]?.nav || [];
  const first = nav.find((n) => n.k);
  return first ? first.k : 'a_dash';
}

async function trySession() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return false;
  AUTH.token = token;
  try {
    AUTH.user = await api('/auth/me');
    await loadStore();
    return true;
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    AUTH.token = null;
    AUTH.user = null;
    return false;
  }
}

async function doLogin(email, password) {
  const data = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  AUTH.token = data.token;
  AUTH.user = data.user;
  localStorage.setItem(TOKEN_KEY, data.token);
  await loadStore();
  const full = STORE.users.find((u) => u.id === data.user.id);
  if (full) AUTH.user = { id: full.id, name: full.name, email: full.email, role: full.role, departmentId: full.departmentId, classIds: full.classIds };
  CURRENT.role = AUTH.user.role;
  CURRENT.view = defaultView(AUTH.user.role);
}

function doLogout() {
  AUTH.token = null;
  AUTH.user = null;
  STORE = null;
  localStorage.removeItem(TOKEN_KEY);
  $('#app').classList.remove('on');
  $('#gate').style.display = 'flex';
  closeRail();
}

async function apiAction(path, body, successTitle, successMsg) {
  try {
    const data = await api(path, { method: 'POST', body: JSON.stringify(body || {}) });
    if (data.store) {
      STORE = data.store;
      applyStoreHelpers();
    } else await loadStore();
    closeModal();
    render();
    buildShell();
    if (successTitle) toast(successTitle, successMsg);
    return data;
  } catch (e) {
    toast('Lỗi', e.message);
    throw e;
  }
}

async function doCreateAccount(allowed) {
  const role = $('#naRole').value;
  if (!allowed.includes(role)) {
    toast('Không được phép', 'Vai trò này không thuộc quyền tạo của bạn.');
    return;
  }
  await apiAction(
    '/users',
    {
      name: $('#naName').value.trim() || 'Người dùng mới',
      email: $('#naEmail').value.trim(),
      role,
      departmentId: ['hod', 'lecturer'].includes(role) ? $('#naDept').value : null,
    },
    'Đã tạo tài khoản',
    ($('#naName').value.trim() || 'Người dùng mới') + ' · ' + ROLE_LABELS[role] + ' (mật khẩu mặc định: 123456)'
  );
}

async function approveSubject(id) {
  const s = STORE.subject(id);
  await apiAction('/subjects/' + id + '/approve', {}, 'Đã phê duyệt', s.name + ' đã vào chương trình đào tạo.');
}

async function doProposeSubject() {
  const name = $('#psName').value.trim() || 'Môn mới';
  await apiAction(
    '/subjects/propose',
    { name, code: $('#psCode').value || 'NEW101', credits: +$('#psCr').value || 3, departmentId: $('#psDept').value },
    'Đã gửi đề xuất',
    name + ' → chờ Hiệu trưởng duyệt.'
  );
}

async function forwardSubjectProposal(id) {
  const p = STORE.subjectProposals.find((x) => x.id === id);
  await apiAction('/subject-proposals/' + id + '/forward', {}, 'Đã chuyển', 'Gửi Hiệu trưởng phê duyệt môn ' + p.name);
}

async function approveClassProposal(id) {
  const p = STORE.classProposals.find((x) => x.id === id);
  const sub = STORE.subject(p.subjectId);
  await apiAction('/class-proposals/' + id + '/approve', {}, 'Đã tạo lớp', p.count + ' lớp ' + sub.name);
}

async function doProposeClass() {
  const subjectId = $('#hcpSub').value;
  const count = +$('#hcpCnt').value || 1;
  await apiAction('/class-proposals', { subjectId, count }, 'Đã gửi đề xuất', count + ' lớp → chờ Phòng đào tạo duyệt.');
}

async function doHodProposeSubject() {
  const name = $('#hspName').value.trim() || 'Môn mới';
  await apiAction('/subject-proposals', { name, code: $('#hspCode').value || 'NEW' }, 'Đã gửi', 'Đề xuất môn ' + name + ' → Phòng đào tạo.');
}

async function toggleLecturerSubject(lid, sid) {
  const l = STORE.user(lid);
  await apiAction('/lecturers/' + lid + '/subjects/' + sid + '/toggle', {}, 'Đã cập nhật', l.name + ' — môn ' + STORE.subject(sid).name);
}

async function registerClass(cid) {
  try {
    const c = STORE.cls(cid);
    await apiAction('/classes/' + cid + '/register', {}, 'Đăng ký thành công', 'Bạn đã được thêm vào lớp ' + c.name + '.');
    const u = STORE.users.find((x) => x.id === AUTH.user.id);
    if (u) AUTH.user = { ...AUTH.user, classIds: u.classIds };
  } catch (e) {
    /* toast in apiAction */
  }
}

async function doAddLesson() {
  await apiAction(
    '/lessons',
    { classId: $('#alCls').value, title: $('#alTitle').value || 'Bài giảng mới', content: $('#alContent').value || '' },
    'Đã thêm bài giảng',
    'Sinh viên có thể xem trong lớp.'
  );
}

async function doAddTest() {
  await apiAction(
    '/tests',
    { classId: $('#atCls').value, title: $('#atTitle').value || 'Bài kiểm tra', duration: +$('#atDur').value || 30 },
    'Đã tạo bài kiểm tra',
    'Sinh viên có thể làm bài (chế độ khóa màn hình).'
  );
}

async function finishExam() {
  const testId = EXAM.testId;
  const answers = [...EXAM.answers];
  cleanupExam();
  try {
    const data = await api('/tests/' + testId + '/submit', {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
    if (data.store) {
      STORE = data.store;
      applyStoreHelpers();
      const u = STORE.users.find((x) => x.id === AUTH.user.id);
      if (u) AUTH.user = { ...AUTH.user, classIds: u.classIds };
    }
    openModal(
      `<div class="modal-head"><h3>Kết quả bài kiểm tra</h3></div>
      <div class="modal-body" style="text-align:center"><div class="serif" style="font-size:48px;font-weight:700;color:var(--accent)">${data.score}/${data.total}</div>
      <p class="muted" style="margin:12px 0 20px">Điểm: ${data.avg}/10</p>
      <button class="btn btn-pri btn-block" onclick="closeModal();go('st_grades')">Đóng</button></div>`
    );
    render();
    buildShell();
  } catch (e) {
    toast('Lỗi nộp bài', e.message);
  }
}
