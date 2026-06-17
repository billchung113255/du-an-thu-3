# LMS Portal — Hệ thống quản lý học tập

Website LMS chạy thật: **đăng nhập + phân quyền + SQLite** (dữ liệu không mất khi tải lại trang).

---

## Chạy hệ thống

```bash
cd "TE Portal Basic"
python3 -m pip install -r requirements.txt
python3 server/app.py
```

Mở trình duyệt: **http://localhost:3000**

---

## Tài khoản demo

Mật khẩu chung: **`123456`**

| Email | Vai trò |
|-------|---------|
| `admin@school.edu` | Admin |
| `hr@school.edu` | HR |
| `hieutruong@school.edu` | Hiệu trưởng |
| `daotao@school.edu` | Phòng đào tạo |
| `cntt@school.edu` | Trưởng bộ môn |
| `gv.java@school.edu` | Giảng viên |
| `sv.nam@school.edu` | Sinh viên (đã có lớp Java) |
| `sv.thu@school.edu` | Sinh viên (chưa đăng ký lớp) |

---

## 7 vai trò & quy trình

| Vai trò | Quyền |
|---------|-------|
| **Admin** | Tạo tài khoản Hiệu trưởng & HR |
| **HR** | Tạo Phòng ĐT, Trưởng BM, GV, SV |
| **Hiệu trưởng** | Duyệt môn học mới |
| **Phòng đào tạo** | Đề xuất môn, duyệt đề xuất lớp, tạo lớp |
| **Trưởng bộ môn** | Đề xuất lớp/môn, phân công GV |
| **Giảng viên** | Bài giảng & kiểm tra |
| **Sinh viên** | Đăng ký lớp (cạnh tranh chỗ), làm bài khóa màn hình, xem điểm Đạt/Không đạt |

---

## Kiến trúc

```
Browser (times-edu-platform.html + lms-api-client.js)
        ↓ REST API + JWT
Python / Flask (server/app.py)
        ↓
SQLite (server/lms.db)
```

- Phân quyền kiểm tra **trên server** (không chỉ giao diện)
- Dữ liệu lưu `server/lms.db` — xóa file này để reset về dữ liệu mẫu

---

## Thử nhanh

1. Đăng nhập **Phòng đào tạo** → đề xuất môn → **Hiệu trưởng** duyệt
2. **Trưởng bộ môn** → đề xuất số lớp → **Phòng đào tạo** duyệt & tạo lớp
3. **Sinh viên (sv.thu)** → Đăng ký lớp
4. **Giảng viên** → tạo bài kiểm tra → **Sinh viên** làm bài → **Bảng điểm**

---

## GitHub

Đẩy toàn bộ project lên GitHub (trừ `node_modules/` và `server/lms.db` đã có trong `.gitignore`).

---

## Yêu cầu bài và ánh xạ chức năng (mapping)

Tài liệu này mô tả cách repository hiện tại đã triển khai các yêu cầu bài: vai trò, quy trình và các chức năng chính.

- **Vai trò**: Admin, HR, Hiệu trưởng (principal), Phòng đào tạo (training), Trưởng bộ môn (hod), Giảng viên (lecturer), Sinh viên (student).
        - Định nghĩa và dữ liệu vai trò nằm trong `server/app.py` (bảng `users`).

- **Xác thực / Phiên**: endpoint `POST /api/auth/login` trả `token` (JWT). Endpoint `GET /api/auth/me` trả thông tin user.

- **Lưu trữ chung (STORE)**: `GET /api/store` trả toàn bộ dữ liệu mẫu (subjects, classes, users, tests, grades, notifications).

- **Quy trình đề xuất & duyệt môn**:
        - Trưởng bộ môn (`hod`) có thể gửi đề xuất môn: `POST /api/subject-proposals`.
        - Phòng đào tạo (`training`) có thể chuyển đề xuất lên Hiệu trưởng: `POST /api/subject-proposals/<id>/forward`.
        - Phòng đào tạo cũng có thể tự đề xuất môn trực tiếp: `POST /api/subjects/propose` (trạng thái chờ Hiệu trưởng).
        - Hiệu trưởng duyệt môn: `POST /api/subjects/<id>/approve`.

- **Đề xuất & tạo lớp**:
        - Trưởng bộ môn đề xuất số lượng lớp cho một môn: `POST /api/class-proposals`.
        - Phòng đào tạo duyệt và tạo lớp thực tế: `POST /api/class-proposals/<id>/approve` (tạo `classes`).
        - Sinh viên đăng ký lớp: `POST /api/classes/<id>/register`.

- **Giảng dạy & kiểm tra**:
        - Giảng viên thêm bài giảng: `POST /api/lessons`.
        - Giảng viên tạo bài kiểm tra: `POST /api/tests` (gửi thông báo cho sinh viên lớp).
        - Sinh viên nộp bài kiểm tra: `POST /api/tests/<id>/submit` → lưu `test_results`, cập nhật `grades` (midterm/final/average, pass/fail).

- **Phân quyền tạo tài khoản**:
        - `admin` có thể tạo `principal` và `hr` (API: `POST /api/users`).
        - `hr` có thể tạo `training`, `hod`, `lecturer`, `student`.

- **Thông báo**: hệ thống ghi `notifications` (bảng `notifications`) khi có sự kiện (môn chờ duyệt, lớp mở đăng ký, bài kiểm tra mới, ...). API trả trong `GET /api/store`.

---

Nếu bạn muốn, tôi có thể:
- cập nhật README với sơ đồ quy trình chi tiết hơn;
- viết script nhỏ để seed thêm dữ liệu cụ thể cho bài tập;
- đóng gói hướng dẫn deploy (Docker / Gunicorn + Nginx).
