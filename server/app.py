#!/usr/bin/env python3
"""LMS Portal — Flask + SQLite backend."""
import json
import os
import secrets
import sqlite3
import time
from datetime import datetime
from functools import wraps
from hashlib import pbkdf2_hmac
from pathlib import Path

import jwt
from flask import Flask, jsonify, request, send_from_directory

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = Path(__file__).resolve().parent / "lms.db"
JWT_SECRET = os.environ.get("JWT_SECRET", "lms-portal-secret-change-in-production")
PORT = int(os.environ.get("PORT", 3000))

app = Flask(__name__, static_folder=str(ROOT), static_url_path="")


def hash_password(pw: str) -> str:
    salt = secrets.token_hex(16)
    h = pbkdf2_hmac("sha256", pw.encode(), salt.encode(), 100000).hex()
    return f"{salt}${h}"


def check_password(pw: str, stored: str) -> bool:
    salt, h = stored.split("$", 1)
    return pbkdf2_hmac("sha256", pw.encode(), salt.encode(), 100000).hex() == h


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.executescript("""
    CREATE TABLE IF NOT EXISTS departments (id TEXT PRIMARY KEY, name TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL, role TEXT NOT NULL, department_id TEXT,
      status TEXT DEFAULT 'active', created_by TEXT, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS user_subjects (user_id TEXT NOT NULL, subject_id TEXT NOT NULL, PRIMARY KEY (user_id, subject_id));
    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, code TEXT NOT NULL, credits INTEGER DEFAULT 3,
      department_id TEXT, status TEXT DEFAULT 'active', proposed_by TEXT, note TEXT);
    CREATE TABLE IF NOT EXISTS subject_proposals (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, code TEXT NOT NULL, credits INTEGER DEFAULT 3,
      department_id TEXT, proposed_by TEXT, status TEXT DEFAULT 'pending_training', note TEXT);
    CREATE TABLE IF NOT EXISTS class_proposals (
      id TEXT PRIMARY KEY, subject_id TEXT, count INTEGER NOT NULL, proposed_by TEXT,
      status TEXT DEFAULT 'pending_training', note TEXT);
    CREATE TABLE IF NOT EXISTS classes (
      id TEXT PRIMARY KEY, subject_id TEXT, name TEXT NOT NULL, capacity INTEGER DEFAULT 30,
      schedule TEXT, room TEXT, manager_id TEXT, status TEXT DEFAULT 'open');
    CREATE TABLE IF NOT EXISTS class_lecturers (class_id TEXT NOT NULL, lecturer_id TEXT NOT NULL, PRIMARY KEY (class_id, lecturer_id));
    CREATE TABLE IF NOT EXISTS class_students (class_id TEXT NOT NULL, student_id TEXT NOT NULL, registered_at TEXT DEFAULT (datetime('now')), PRIMARY KEY (class_id, student_id));
    CREATE TABLE IF NOT EXISTS lessons (id TEXT PRIMARY KEY, class_id TEXT, title TEXT NOT NULL, date TEXT, content TEXT, created_by TEXT);
    CREATE TABLE IF NOT EXISTS tests (id TEXT PRIMARY KEY, class_id TEXT, title TEXT NOT NULL, duration INTEGER DEFAULT 30, questions_json TEXT NOT NULL, created_by TEXT, status TEXT DEFAULT 'published');
    CREATE TABLE IF NOT EXISTS test_results (id TEXT PRIMARY KEY, test_id TEXT, student_id TEXT, score INTEGER, total INTEGER, answers_json TEXT, submitted_at TEXT DEFAULT (datetime('now')), UNIQUE(test_id, student_id));
    CREATE TABLE IF NOT EXISTS grades (id TEXT PRIMARY KEY, student_id TEXT, subject_id TEXT, class_id TEXT, midterm REAL DEFAULT 0, final REAL DEFAULT 0, average REAL DEFAULT 0, status TEXT DEFAULT 'fail', UNIQUE(student_id, class_id));
    CREATE TABLE IF NOT EXISTS notifications (id TEXT PRIMARY KEY, user_id TEXT, text TEXT NOT NULL, read INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')));
    """)
    if conn.execute("SELECT COUNT(*) FROM users").fetchone()[0] == 0:
        seed(conn)
        print("Database seeded. Default password: 123456")
    conn.commit()
    conn.close()


def uid(prefix="x"):
    return prefix + str(int(time.time() * 1000)) + secrets.token_hex(2)


def seed(conn):
    hp = hash_password("123456")
    for did, name in [("d1", "Công nghệ thông tin"), ("d2", "Kinh tế"), ("d3", "Ngoại ngữ")]:
        conn.execute("INSERT INTO departments VALUES (?,?)", (did, name))
    users = [
        ("u1", "Phạm Nhật Duy", "admin@school.edu", "admin", None, None),
        ("u2", "Nguyễn Thị Hương", "hr@school.edu", "hr", None, "u1"),
        ("u3", "Trần Văn Hiệu", "hieutruong@school.edu", "principal", None, "u1"),
        ("u4", "Lê Minh Đào tạo", "daotao@school.edu", "training", None, "u2"),
        ("u5", "Phạm Quốc Hùng", "cntt@school.edu", "hod", "d1", "u2"),
        ("u6", "Nguyễn Minh Anh", "gv.java@school.edu", "lecturer", "d1", "u2"),
        ("u7", "Trần Bảo Nam", "sv.nam@school.edu", "student", None, "u2"),
        ("u8", "Phạm Anh Thư", "sv.thu@school.edu", "student", None, "u2"),
        ("u9", "Đỗ Khánh Linh", "gv.csharp@school.edu", "lecturer", "d1", "u2"),
    ]
    for u in users:
        conn.execute(
            "INSERT INTO users (id,name,email,password_hash,role,department_id,created_by) VALUES (?,?,?,?,?,?,?)",
            (u[0], u[1], u[2], hp, u[3], u[4], u[5]),
        )
    for pair in [("u6", "sub1"), ("u6", "sub2"), ("u9", "sub2")]:
        conn.execute("INSERT INTO user_subjects VALUES (?,?)", pair)
    conn.execute("INSERT INTO subjects VALUES ('sub1','Lập trình Java','JAVA101',3,'d1','active',NULL,NULL)")
    conn.execute("INSERT INTO subjects VALUES ('sub2','Lập trình C#','CSHARP101',3,'d1','active',NULL,NULL)")
    conn.execute("INSERT INTO subjects VALUES ('sub3','Blockchain cơ bản','BCT201',2,'d1','pending_principal','u4','Môn mới')")
    conn.execute("INSERT INTO subject_proposals VALUES ('sp1','Machine Learning','ML301',3,'d1','u5','pending_training','TBM đề xuất')")
    conn.execute("INSERT INTO class_proposals VALUES ('cp1','sub1',2,'u5','approved','HK2')")
    conn.execute("INSERT INTO class_proposals VALUES ('cp2','sub2',1,'u5','pending_training','Mở lớp C#')")
    for c in [("c1", "sub1", "JAVA101-A", 30, "T2,4 · 7:30–9:30", "A101", "u5", "open"), ("c2", "sub1", "JAVA101-B", 30, "T3,5 · 13:30–15:30", "A102", "u5", "open"), ("c3", "sub2", "CSHARP101-A", 25, "T2,5 · 9:45–11:45", "B201", "u5", "open")]:
        conn.execute("INSERT INTO classes (id,subject_id,name,capacity,schedule,room,manager_id,status) VALUES (?,?,?,?,?,?,?,?)", c)
    for pair in [("c1", "u6"), ("c2", "u6"), ("c3", "u9")]:
        conn.execute("INSERT INTO class_lecturers VALUES (?,?)", pair)
    conn.execute("INSERT INTO class_students VALUES ('c1','u7',datetime('now'))")
    conn.execute("INSERT INTO lessons VALUES ('les1','c1','Giới thiệu Java & JVM','2026-06-10','Tổng quan Java','u6')")
    conn.execute("INSERT INTO lessons VALUES ('les2','c1','Biến & kiểu dữ liệu','2026-06-12','Khai báo biến','u6')")
    qs = json.dumps([
        {"q": "Java là ngôn ngữ lập trình gì?", "options": ["Biên dịch", "Thông dịch", "Hỗn hợp", "Assembly"], "answer": 2},
        {"q": "Từ khóa hằng số trong Java?", "options": ["const", "final", "static", "define"], "answer": 1},
        {"q": "Kiểu nào lưu số thực?", "options": ["int", "char", "double", "boolean"], "answer": 2},
    ])
    conn.execute("INSERT INTO tests VALUES ('tst1','c1','Kiểm tra giữa kỳ Java',30,?,'u6','published')", (qs,))
    conn.execute("INSERT INTO test_results VALUES ('tr1','tst1','u7',2,3,NULL,datetime('now'))")
    conn.execute("INSERT INTO grades VALUES ('gr1','u7','sub1','c1',7,8,7.5,'pass')")
    for nid, uid_, text in [("n1", "u8", "Lớp JAVA101-B còn 30 chỗ!"), ("n2", "u8", "CSHARP101-A mở đăng ký"), ("n3", "u5", "Đề xuất lớp C# chờ duyệt"), ("n4", "u3", "Blockchain chờ HT duyệt")]:
        conn.execute("INSERT INTO notifications (id,user_id,text) VALUES (?,?,?)", (nid, uid_, text))


def pass_fail(avg):
    return "pass" if avg >= 5 else "fail"


def fmt_when(created_at):
    try:
        dt = datetime.fromisoformat(created_at.replace("Z", ""))
        diff = (datetime.now() - dt).total_seconds()
        if diff < 3600:
            return f"{max(1, int(diff / 60))} phút trước"
        if diff < 86400:
            return f"{int(diff / 3600)} giờ trước"
        return "Hôm qua"
    except Exception:
        return created_at or ""


def build_store():
    conn = get_db()
    departments = [dict(r) for r in conn.execute("SELECT id, name FROM departments")]
    users = []
    for r in conn.execute("SELECT id, name, email, role, department_id, status, created_by FROM users"):
        u = dict(r)
        u["departmentId"] = u.pop("department_id")
        u["createdBy"] = u.pop("created_by")
        u["subjectIds"] = [x["subject_id"] for x in conn.execute("SELECT subject_id FROM user_subjects WHERE user_id=?", (u["id"],))]
        u["classIds"] = [x["class_id"] for x in conn.execute("SELECT class_id FROM class_students WHERE student_id=?", (u["id"],))]
        users.append(u)
    subjects = []
    for r in conn.execute("SELECT id, name, code, credits, department_id, status, proposed_by, note FROM subjects"):
        s = dict(r)
        s["departmentId"] = s.pop("department_id")
        s["proposedBy"] = s.pop("proposed_by")
        subjects.append(s)
    subject_proposals = []
    for r in conn.execute("SELECT * FROM subject_proposals"):
        p = dict(r)
        p["departmentId"] = p.pop("department_id")
        p["proposedBy"] = p.pop("proposed_by")
        subject_proposals.append(p)
    class_proposals = []
    for r in conn.execute("SELECT id, subject_id, count, proposed_by, status, note FROM class_proposals"):
        p = dict(r)
        p["subjectId"] = p.pop("subject_id")
        p["proposedBy"] = p.pop("proposed_by")
        class_proposals.append(p)
    classes = []
    for r in conn.execute("SELECT id, subject_id, name, capacity, schedule, room, manager_id, status FROM classes"):
        c = dict(r)
        c["subjectId"] = c.pop("subject_id")
        c["managerId"] = c.pop("manager_id")
        c["studentIds"] = [x["student_id"] for x in conn.execute("SELECT student_id FROM class_students WHERE class_id=?", (c["id"],))]
        c["lecturerIds"] = [x["lecturer_id"] for x in conn.execute("SELECT lecturer_id FROM class_lecturers WHERE class_id=?", (c["id"],))]
        classes.append(c)
    lessons = []
    for r in conn.execute("SELECT id, class_id, title, date, content, created_by FROM lessons"):
        l = dict(r)
        l["classId"] = l.pop("class_id")
        l["createdBy"] = l.pop("created_by")
        lessons.append(l)
    tests = []
    for r in conn.execute("SELECT id, class_id, title, duration, questions_json, created_by, status FROM tests"):
        t = dict(r)
        t["classId"] = t.pop("class_id")
        t["createdBy"] = t.pop("created_by")
        t["questions"] = json.loads(t.pop("questions_json"))
        tests.append(t)
    test_results = []
    for r in conn.execute("SELECT test_id, student_id, score, total, submitted_at FROM test_results"):
        tr = dict(r)
        tr["testId"] = tr.pop("test_id")
        tr["studentId"] = tr.pop("student_id")
        tr["submittedAt"] = tr.pop("submitted_at")
        test_results.append(tr)
    grades = []
    for r in conn.execute("SELECT student_id, subject_id, class_id, midterm, final, average, status FROM grades"):
        g = dict(r)
        g["studentId"] = g.pop("student_id")
        g["subjectId"] = g.pop("subject_id")
        g["classId"] = g.pop("class_id")
        grades.append(g)
    notifications = []
    for r in conn.execute("SELECT id, user_id, text, read, created_at FROM notifications ORDER BY created_at DESC"):
        n = dict(r)
        n["userId"] = n.pop("user_id")
        n["read"] = bool(n["read"])
        n["when"] = fmt_when(n.pop("created_at"))
        notifications.append(n)
    conn.close()
    return {"departments": departments, "users": users, "subjects": subjects, "subjectProposals": subject_proposals,
            "classProposals": class_proposals, "classes": classes, "lessons": lessons, "tests": tests,
            "testResults": test_results, "grades": grades, "notifications": notifications}


def notify(conn, user_id, text):
    conn.execute("INSERT INTO notifications (id, user_id, text) VALUES (?,?,?)", (uid("n"), user_id, text))


def auth_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        header = request.headers.get("Authorization", "")
        if not header.startswith("Bearer "):
            return jsonify({"error": "Chưa đăng nhập"}), 401
        try:
            payload = jwt.decode(header[7:], JWT_SECRET, algorithms=["HS256"])
            request.user = payload
        except jwt.PyJWTError:
            return jsonify({"error": "Phiên hết hạn"}), 401
        return f(*args, **kwargs)
    return wrapper


def can_create(creator_role, target_role):
    if creator_role == "admin":
        return target_role in ("principal", "hr")
    if creator_role == "hr":
        return target_role in ("training", "hod", "lecturer", "student")
    return False


@app.post("/api/auth/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    conn = get_db()
    row = conn.execute("SELECT * FROM users WHERE email=? AND status='active'", (email,)).fetchone()
    conn.close()
    if not row or not check_password(password, row["password_hash"]):
        return jsonify({"error": "Email hoặc mật khẩu không đúng"}), 401
    token = jwt.encode({"id": row["id"], "role": row["role"], "email": row["email"]}, JWT_SECRET, algorithm="HS256")
    return jsonify({"token": token, "user": {"id": row["id"], "name": row["name"], "email": row["email"], "role": row["role"], "departmentId": row["department_id"]}})


@app.get("/api/auth/me")
@auth_required
def me():
    conn = get_db()
    row = conn.execute("SELECT id, name, email, role, department_id FROM users WHERE id=?", (request.user["id"],)).fetchone()
    conn.close()
    if not row:
        return jsonify({"error": "Không tìm thấy"}), 404
    return jsonify({"id": row["id"], "name": row["name"], "email": row["email"], "role": row["role"], "departmentId": row["department_id"]})


@app.get("/api/store")
@auth_required
def store():
    return jsonify(build_store())


@app.post("/api/users")
@auth_required
def create_user():
    data = request.get_json(silent=True) or {}
    role = data.get("role")
    if not can_create(request.user["role"], role):
        return jsonify({"error": "Không có quyền tạo vai trò này"}), 403
    email = (data.get("email") or "").strip().lower()
    name = (data.get("name") or "Người dùng mới").strip()
    dept = data.get("departmentId") if role in ("hod", "lecturer") else None
    conn = get_db()
    if conn.execute("SELECT 1 FROM users WHERE email=?", (email,)).fetchone():
        conn.close()
        return jsonify({"error": "Email đã tồn tại"}), 409
    uid_ = uid("u")
    conn.execute("INSERT INTO users (id,name,email,password_hash,role,department_id,created_by) VALUES (?,?,?,?,?,?,?)",
                 (uid_, name, email, hash_password(data.get("password") or "123456"), role, dept, request.user["id"]))
    conn.commit()
    conn.close()
    return jsonify({"ok": True, "id": uid_, "store": build_store()})


@app.post("/api/subjects/propose")
@auth_required
def propose_subject():
    if request.user["role"] != "training":
        return jsonify({"error": "Chỉ Phòng đào tạo"}), 403
    data = request.get_json(silent=True) or {}
    sid = uid("sub")
    conn = get_db()
    conn.execute(
        "INSERT INTO subjects (id,name,code,credits,department_id,status,proposed_by) VALUES (?,?,?,?,?,'pending_principal',?)",
        (sid, data.get("name"), data.get("code"), data.get("credits") or 3, data.get("departmentId"), request.user["id"]),
    )
    for r in conn.execute("SELECT id FROM users WHERE role='principal'"):
        notify(conn, r["id"], f"Môn {data.get('name')} chờ Hiệu trưởng duyệt")
    conn.commit()
    conn.close()
    return jsonify({"ok": True, "store": build_store()})


@app.post("/api/subjects/<sid>/approve")
@auth_required
def approve_subject(sid):
    if request.user["role"] != "principal":
        return jsonify({"error": "Chỉ Hiệu trưởng"}), 403
    conn = get_db()
    sub = conn.execute("SELECT name FROM subjects WHERE id=?", (sid,)).fetchone()
    conn.execute("UPDATE subjects SET status='active' WHERE id=?", (sid,))
    if sub:
        for r in conn.execute("SELECT id FROM users WHERE role='training'"):
            notify(conn, r["id"], f"Môn {sub['name']} đã được duyệt")
    conn.commit()
    conn.close()
    return jsonify({"ok": True, "store": build_store()})


@app.post("/api/subject-proposals")
@auth_required
def hod_propose_subject():
    if request.user["role"] != "hod":
        return jsonify({"error": "Chỉ Trưởng BM"}), 403
    data = request.get_json(silent=True) or {}
    conn = get_db()
    user = conn.execute("SELECT department_id FROM users WHERE id=?", (request.user["id"],)).fetchone()
    conn.execute(
        "INSERT INTO subject_proposals (id,name,code,credits,department_id,proposed_by,status) VALUES (?,?,?,3,?,?,'pending_training')",
        (uid("sp"), data.get("name"), data.get("code"), user["department_id"], request.user["id"]),
    )
    for r in conn.execute("SELECT id FROM users WHERE role='training'"):
        notify(conn, r["id"], f"Trưởng BM đề xuất môn {data.get('name')}")
    conn.commit()
    conn.close()
    return jsonify({"ok": True, "store": build_store()})


@app.post("/api/subject-proposals/<pid>/forward")
@auth_required
def forward_proposal(pid):
    if request.user["role"] != "training":
        return jsonify({"error": "Chỉ Phòng đào tạo"}), 403
    conn = get_db()
    p = conn.execute("SELECT * FROM subject_proposals WHERE id=?", (pid,)).fetchone()
    if not p:
        conn.close()
        return jsonify({"error": "Không tìm thấy"}), 404
    conn.execute(
        "INSERT INTO subjects (id,name,code,credits,department_id,status,proposed_by) VALUES (?,?,?,?,?,'pending_principal',?)",
        (uid("sub"), p["name"], p["code"], p["credits"], p["department_id"], request.user["id"]),
    )
    conn.execute("UPDATE subject_proposals SET status='forwarded' WHERE id=?", (pid,))
    for r in conn.execute("SELECT id FROM users WHERE role='principal'"):
        notify(conn, r["id"], f"Môn {p['name']} (từ TBM) chờ duyệt")
    conn.commit()
    conn.close()
    return jsonify({"ok": True, "store": build_store()})


@app.post("/api/class-proposals")
@auth_required
def propose_class():
    if request.user["role"] != "hod":
        return jsonify({"error": "Chỉ Trưởng BM"}), 403
    data = request.get_json(silent=True) or {}
    conn = get_db()
    sub = conn.execute("SELECT name FROM subjects WHERE id=? AND status='active'", (data.get("subjectId"),)).fetchone()
    if not sub:
        conn.close()
        return jsonify({"error": "Môn không hợp lệ"}), 400
    conn.execute("INSERT INTO class_proposals (id,subject_id,count,proposed_by,status) VALUES (?,?,?,?,'pending_training')",
                 (uid("cp"), data.get("subjectId"), data.get("count") or 1, request.user["id"]))
    for r in conn.execute("SELECT id FROM users WHERE role='training'"):
        notify(conn, r["id"], f"Đề xuất {data.get('count')} lớp {sub['name']}")
    conn.commit()
    conn.close()
    return jsonify({"ok": True, "store": build_store()})


@app.post("/api/class-proposals/<pid>/approve")
@auth_required
def approve_class_proposal(pid):
    if request.user["role"] != "training":
        return jsonify({"error": "Chỉ Phòng đào tạo"}), 403
    conn = get_db()
    p = conn.execute("SELECT * FROM class_proposals WHERE id=? AND status='pending_training'", (pid,)).fetchone()
    if not p:
        conn.close()
        return jsonify({"error": "Đề xuất không hợp lệ"}), 400
    sub = conn.execute("SELECT code, name FROM subjects WHERE id=?", (p["subject_id"],)).fetchone()
    existing = conn.execute("SELECT COUNT(*) as c FROM classes WHERE subject_id=?", (p["subject_id"],)).fetchone()["c"]
    for i in range(p["count"]):
        letter = chr(65 + existing + i)
        cid = uid("c")
        conn.execute("INSERT INTO classes (id,subject_id,name,capacity,schedule,room,manager_id,status) VALUES (?,?,?,30,'TBD','TBD',?,'open')",
                     (cid, p["subject_id"], f"{sub['code']}-{letter}", p["proposed_by"]))
    conn.execute("UPDATE class_proposals SET status='approved' WHERE id=?", (pid,))
    notify(conn, p["proposed_by"], f"Đã tạo {p['count']} lớp {sub['name']}")
    for r in conn.execute("SELECT id FROM users WHERE role='student'"):
        notify(conn, r["id"], f"Lớp {sub['name']} mở đăng ký!")
    conn.commit()
    conn.close()
    return jsonify({"ok": True, "store": build_store()})


@app.post("/api/classes/<cid>/register")
@auth_required
def register_class(cid):
    if request.user["role"] != "student":
        return jsonify({"error": "Chỉ sinh viên"}), 403
    conn = get_db()
    cls = conn.execute("SELECT * FROM classes WHERE id=? AND status='open'", (cid,)).fetchone()
    if not cls:
        conn.close()
        return jsonify({"error": "Lớp không tồn tại"}), 404
    enrolled = conn.execute("SELECT COUNT(*) as c FROM class_students WHERE class_id=?", (cid,)).fetchone()["c"]
    if enrolled >= cls["capacity"]:
        conn.close()
        return jsonify({"error": "Lớp đã hết chỗ"}), 409
    if conn.execute("SELECT 1 FROM class_students WHERE class_id=? AND student_id=?", (cid, request.user["id"])).fetchone():
        conn.close()
        return jsonify({"error": "Đã đăng ký lớp này"}), 409
    conn.execute("INSERT INTO class_students (class_id, student_id) VALUES (?,?)", (cid, request.user["id"]))
    if not conn.execute("SELECT 1 FROM grades WHERE student_id=? AND class_id=?", (request.user["id"], cid)).fetchone():
        conn.execute("INSERT INTO grades (id,student_id,subject_id,class_id,midterm,final,average,status) VALUES (?,?,?,?,0,0,0,'fail')",
                     (uid("gr"), request.user["id"], cls["subject_id"], cid))
    conn.commit()
    conn.close()
    return jsonify({"ok": True, "store": build_store()})


@app.post("/api/lecturers/<lid>/subjects/<sid>/toggle")
@auth_required
def toggle_lecturer(lid, sid):
    if request.user["role"] != "hod":
        return jsonify({"error": "Chỉ Trưởng BM"}), 403
    conn = get_db()
    if conn.execute("SELECT 1 FROM user_subjects WHERE user_id=? AND subject_id=?", (lid, sid)).fetchone():
        conn.execute("DELETE FROM user_subjects WHERE user_id=? AND subject_id=?", (lid, sid))
    else:
        conn.execute("INSERT INTO user_subjects VALUES (?,?)", (lid, sid))
        for c in conn.execute("SELECT id FROM classes WHERE subject_id=? AND manager_id=?", (sid, request.user["id"])):
            if not conn.execute("SELECT 1 FROM class_lecturers WHERE class_id=? AND lecturer_id=?", (c["id"], lid)).fetchone():
                conn.execute("INSERT INTO class_lecturers VALUES (?,?)", (c["id"], lid))
    conn.commit()
    conn.close()
    return jsonify({"ok": True, "store": build_store()})


@app.post("/api/lessons")
@auth_required
def add_lesson():
    if request.user["role"] != "lecturer":
        return jsonify({"error": "Chỉ giảng viên"}), 403
    data = request.get_json(silent=True) or {}
    conn = get_db()
    if not conn.execute("SELECT 1 FROM class_lecturers WHERE class_id=? AND lecturer_id=?", (data.get("classId"), request.user["id"])).fetchone():
        conn.close()
        return jsonify({"error": "Không dạy lớp này"}), 403
    conn.execute("INSERT INTO lessons (id,class_id,title,date,content,created_by) VALUES (?,?,?,date('now'),?,?)",
                 (uid("les"), data.get("classId"), data.get("title"), data.get("content") or "", request.user["id"]))
    conn.commit()
    conn.close()
    return jsonify({"ok": True, "store": build_store()})


@app.post("/api/tests")
@auth_required
def add_test():
    if request.user["role"] != "lecturer":
        return jsonify({"error": "Chỉ giảng viên"}), 403
    data = request.get_json(silent=True) or {}
    conn = get_db()
    cid = data.get("classId")
    if not conn.execute("SELECT 1 FROM class_lecturers WHERE class_id=? AND lecturer_id=?", (cid, request.user["id"])).fetchone():
        conn.close()
        return jsonify({"error": "Không dạy lớp này"}), 403
    qs = json.dumps([
        {"q": "Câu hỏi mẫu 1?", "options": ["A", "B", "C", "D"], "answer": 0},
        {"q": "Câu hỏi mẫu 2?", "options": ["A", "B", "C", "D"], "answer": 1},
        {"q": "Câu hỏi mẫu 3?", "options": ["A", "B", "C", "D"], "answer": 2},
    ])
    tid = uid("tst")
    conn.execute("INSERT INTO tests (id,class_id,title,duration,questions_json,created_by,status) VALUES (?,?,?,?,?,?,'published')",
                 (tid, cid, data.get("title"), data.get("duration") or 30, qs, request.user["id"]))
    for s in conn.execute("SELECT student_id FROM class_students WHERE class_id=?", (cid,)):
        notify(conn, s["student_id"], f"Bài kiểm tra mới: {data.get('title')}")
    conn.commit()
    conn.close()
    return jsonify({"ok": True, "store": build_store()})


@app.post("/api/tests/<tid>/submit")
@auth_required
def submit_test(tid):
    if request.user["role"] != "student":
        return jsonify({"error": "Chỉ sinh viên"}), 403
    data = request.get_json(silent=True) or {}
    answers = data.get("answers") or []
    conn = get_db()
    test = conn.execute("SELECT * FROM tests WHERE id=?", (tid,)).fetchone()
    if not test:
        conn.close()
        return jsonify({"error": "Không tìm thấy bài"}), 404
    if not conn.execute("SELECT 1 FROM class_students WHERE class_id=? AND student_id=?", (test["class_id"], request.user["id"])).fetchone():
        conn.close()
        return jsonify({"error": "Không thuộc lớp"}), 403
    if conn.execute("SELECT 1 FROM test_results WHERE test_id=? AND student_id=?", (tid, request.user["id"])).fetchone():
        conn.close()
        return jsonify({"error": "Đã nộp bài"}), 409
    questions = json.loads(test["questions_json"])
    score = sum(1 for i, q in enumerate(questions) if i < len(answers) and answers[i] == q["answer"])
    total = len(questions)
    avg = round(score / total * 10, 1) if total else 0
    conn.execute("INSERT INTO test_results (id,test_id,student_id,score,total,answers_json) VALUES (?,?,?,?,?,?)",
                 (uid("tr"), tid, request.user["id"], score, total, json.dumps(answers)))
    grade = conn.execute("SELECT * FROM grades WHERE student_id=? AND class_id=?", (request.user["id"], test["class_id"])).fetchone()
    if grade:
        average = round((avg + (grade["final"] or 0)) / 2, 1)
        conn.execute("UPDATE grades SET midterm=?, average=?, status=? WHERE student_id=? AND class_id=?",
                     (avg, average, pass_fail(average), request.user["id"], test["class_id"]))
    else:
        cls = conn.execute("SELECT subject_id FROM classes WHERE id=?", (test["class_id"],)).fetchone()
        conn.execute("INSERT INTO grades (id,student_id,subject_id,class_id,midterm,final,average,status) VALUES (?,?,?,?,?,0,?,?)",
                     (uid("gr"), request.user["id"], cls["subject_id"], test["class_id"], avg, avg, pass_fail(avg)))
    conn.commit()
    conn.close()
    return jsonify({"ok": True, "score": score, "total": total, "avg": avg, "store": build_store()})


@app.get("/")
def index():
    return send_from_directory(ROOT, "times-edu-platform.html")


@app.get("/<path:path>")
def static_files(path):
    if path.startswith("api/"):
        return jsonify({"error": "Not found"}), 404
    fp = ROOT / path
    if fp.is_file():
        return send_from_directory(ROOT, path)
    return send_from_directory(ROOT, "times-edu-platform.html")


if __name__ == "__main__":
    init_db()
    print(f"LMS Portal: http://localhost:{PORT}")
    print("Default password: 123456")
    app.run(host="0.0.0.0", port=PORT, debug=False)
