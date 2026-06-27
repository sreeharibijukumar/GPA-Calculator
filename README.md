# 🎓 Premium SGPA & CGPA Calculator

A sleek, professional, and secure full-stack GPA Calculator built with **FastAPI, React, and PostgreSQL**. Designed with a high-end, minimalist dashboard aesthetic inspired by modern tools like Linear and Vercel.

This platform offers zero-cost scaling by utilizing optimized cloud free-tiers and high-performance data structures, allowing anyone to calculate their grades freely while offering authenticated users a permanent dashboard to track their academic progress.

---

## ✨ Features

### 🔓 Guest Mode (No Account Required)

- **Zero Database Overhead:** Calculation happens entirely within the React local state—no database hits, keeping infrastructure costs at absolute zero.
- **Multi-Semester Sessions:** Add multiple semesters sequentially, input individual SGPAs manually into the CGPA module, and view cumulative progress. Data wipes cleanly the moment the browser tab is closed.

### 🔐 Authenticated Mode (Sign In with Google)

- **One-Click Secure Login:** Seamless Google OAuth 2.0 integration—no password storage overhead or security liabilities on our end.
- **Microscopic DB Footprint:** Individual course structures are stored as dynamic **PostgreSQL JSONB arrays** inside a single row, optimizing storage and avoiding heavy multi-table lookups.
- **Persistent Academic Timeline:** Save, reload, and retroactively edit any semester's breakdown from anywhere.

### 📐 Grading & Engine Accuracy

- **Pre-configured Regulations:** Full out-of-the-box support for **JNTUA (Anantapuram)** grading scales alongside a **Custom Scale** engine for universal compatibility.
- **Precise Weighting:** Supports floating-point credit structures ($0.0 \text{ to } 5.0$) to perfectly factor in mini-projects, labs, and comprehensive seminars.
- Handles unique academic cases explicitly (e.g., `F`/`Absent` penalizes cumulative weight, while `Complete`/`Audit` passes successfully skip credit calculation overhead).

---

## 🛠️ Tech Stack & Architecture

Frontend: React, Vite, Axios
Backend: Python, FastAPI, SQLAlchemy, psycopg2
Database: PostgreSQL
Security: SQLAlchemy ORM & OAuth2

---

## 🎨 Design System

The layout features a premium dashboard aesthetic configured natively using native style sheets and standard web components.

- **Typography & Tokens:** Sans-serif tracking, variable transitions, and custom border/overlay properties embedded in `index.css`.
- **Core Palette Design (Dark-mode first):**
- `var(--emerald-400)` / `var(--emerald-500)` — High-impact success markers for top performance tiers (`S` or `A` grade points) and circular progress rings.
- `var(--indigo-400)` / `var(--indigo-glow)` — Dedicated accent indicators for active menus, average marks, and primary Google Auth buttons.
- `var(--bg-input)` / `var(--border-subtle)` — Clean slate backgrounds to house dynamic form inputs smoothly.

---

## 📁 Repository Structure

```text
gpa-calculator/
├── backend/
│   ├── .env.example            ← copy to .env and fill in values
│   ├── requirements.txt        ← pip dependencies
│   ├── main.py                 ← FastAPI app factory + entrypoint
│   └── app/
│       ├── __init__.py
│       ├── database.py         ← engine, sessions, health check
│       ├── models.py           ← ORM models + Pydantic schemas + calc logic
│       └── routes/
│           ├── __init__.py
│           ├── auth.py         ← Google OAuth + JWT issue/validate
│           └── semesters.py    ← full CRUD for semester data
└── frontend/
    ├── .env.example            ← copy to .env.local and fill in values
    ├── package.json
    ├── vite.config.js
    ├── index.html              ← loads Google Identity Services script
    └── src/
        ├── main.jsx            ← React DOM entry point
        ├── App.jsx             ← Router + providers + route definitions
        ├── index.css           ← all CSS design tokens + global styles
        ├── context/
        │   └── AuthContext.jsx ← Google OAuth lifecycle + token management
        ├── utils/
        │   ├── api.js          ← Axios instance + typed API surface
        │   └── grading.js      ← JNTUA grade constants + SGPA/CGPA logic
        ├── components/
        │   ├── ui.jsx          ← primitive UI components (Button, Card, etc.)
        │   ├── Navbar.jsx      ← sticky top navigation bar
        │   ├── SubjectRow.jsx  ← single subject input row in the form
        │   ├── SemesterForm.jsx← main semester entry + live-calc form
        │   └── ProtectedRoute.jsx ← auth guard for dashboard routes
        └── pages/
            ├── LandingPage.jsx ← guest calculator + marketing hero
            └── Dashboard.jsx   ← authenticated semester management

```
