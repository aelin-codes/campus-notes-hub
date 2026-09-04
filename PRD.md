# Product Requirements Document: Campus Notes Hub

**Version:** 1.0 (MVP scope)
**Status:** Draft for 1-hour build sprint
**Author:** [Your Name]

---

## 1. Problem Statement

Students accumulate notes, past papers, and study material scattered across WhatsApp groups, Google Drive links, and personal folders, with no central, searchable place to find resources by semester/department/subject. Campus Notes Hub is a lightweight web platform to centralize and make this material discoverable.

---

## 2. Goals

- Let any student upload a note/resource file with basic metadata.
- Let any student browse and search that material by semester, department, and subject.
- Ship a working, deployed product within a hard 1-hour time box — **not** a full-featured platform.

### Non-goals (explicitly out of scope for v1)
- User accounts, authentication, or per-user ownership of uploads
- Ratings, bookmarking, or reporting system
- Admin moderation dashboard
- Anything requiring row-level security or role-based access

These are listed under Bonus Features (Section 6) as backlog items, not v1 commitments. [Likely] Attempting them inside the same 1-hour window as the core build is what most commonly causes teams to ship neither cleanly.

---

## 3. Users

**Primary user:** A student looking for notes on a specific subject/semester before an exam or assignment.
**Secondary user:** A student who has notes and wants to share them with juniors/peers.

No distinction is made between these two in v1 — every visitor can both upload and browse. There is no login, so "uploader" is a free-text name field, not an authenticated identity. [Certain] This is a deliberate trust trade-off: v1 has no way to prevent spam or verify uploader identity. State this openly in the demo rather than let it surface as a surprise question.

---

## 4. Core Features (MVP — must ship)

| # | Feature | Description |
|---|---------|-------------|
| 1 | Home page | Landing page with entry points to browse/upload, and a snapshot of recent uploads |
| 2 | Organize by semester/department/subject | Notes tagged with these three fields at upload time; browsable via a structured list/grid |
| 3 | Upload notes | Form: title, department, semester, subject, uploader name, description, file (PDF/image) |
| 4 | View available notes | List/grid view showing all notes with title, subject, uploader, upload date |
| 5 | Download notes | Direct download link served from storage |
| 6 | Search | Free-text search across title/subject/description |
| 7 | Filters | Dropdown filters for semester, department, subject, combinable with search |
| 8 | Note detail fields | Title, subject, department, semester, uploader, description, upload date, file link |
| 9 | Responsive UI | Usable on mobile and desktop breakpoints |
| 10 | Backend/database | Persistent storage for note metadata + files, survives page refresh/deploy |

### Acceptance criteria for MVP
- A user can upload a PDF with metadata and see it appear in the note list without a page reload issue.
- A user can search "data structures" and get relevant results even without an exact title match.
- A user can filter by semester = "3" and department = "CSE" simultaneously.
- Clicking a note opens/downloads the actual uploaded file, not a broken link.
- The site renders usably on a ~375px-wide mobile viewport.

---

## 5. Recommended Tech Stack

[Likely] Optimized for fastest time-to-working-deploy within a single hour, not for long-term scalability.

- **Frontend:** Next.js (React) — file-based routing, fast to scaffold, deploys natively to Vercel
- **Styling:** Tailwind CSS — avoids hand-rolling responsive CSS under time pressure
- **Backend/DB:** Supabase (Postgres + Storage bucket) — gives you a DB table and file storage with minimal setup, no custom backend server needed
- **Hosting:** Vercel (frontend) + Supabase (data/files) — both have zero-config deploys from a GitHub repo

**Why not a custom Express/Node backend:** an extra service to write, host, and connect adds setup and deployment risk with no functional benefit at this stage, since Supabase's client SDK can be called directly from Next.js. [Guessing, based on typical hackathon time constraints] Adding a bespoke backend layer is the most common reason similar 1-hour builds run over time.

---

## 6. Bonus Features (backlog — only after MVP acceptance criteria are met)

| Feature | Why it's deferred |
|---|---|
| User login/signup | Requires auth flow + protected routes; non-trivial in remaining time |
| PDF/image preview | Nice-to-have; can be added if time remains (e.g. `<iframe>` for PDFs, `<img>` for images) |
| Bookmark/favourite | Needs persistent per-user state, which needs auth |
| Rating system | Needs abuse-resistant write logic, secondary priority |
| Report notes | Needs moderation view, which needs admin auth |
| Admin dashboard | Needs role-based access control on top of auth |

**Recommended order if time remains, cheapest to most expensive:**
1. PDF/image preview (no auth dependency)
2. Everything else — blocked on adding auth first

---

## 7. Data Model (Supabase / Postgres)

**Table: `notes`**

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, PK | default `gen_random_uuid()` |
| `title` | text | required |
| `description` | text | optional |
| `department` | text | required, e.g. "CSE" |
| `semester` | int | required, 1–8 |
| `subject` | text | required |
| `uploader_name` | text | required, free text (no auth) |
| `file_url` | text | public URL from Supabase Storage |
| `file_type` | text | "pdf" / "image" |
| `created_at` | timestamptz | default `now()` |

**Storage bucket:** `notes-files` (public read access for v1, given no auth)

No other tables needed for MVP. Bonus features would each need their own table (`users`, `bookmarks`, `ratings`, `reports`) — not created in v1.

---

## 8. User Flows

**Upload flow:**
Home → "Upload Notes" → fill form (title, dept, semester, subject, uploader, description, file) → submit → file goes to Supabase Storage, metadata row inserted into `notes` → redirect to browse page, new note visible.

**Browse/search flow:**
Home → "Browse Notes" → list of all notes (paginated or simple scroll) → apply search text and/or semester/department/subject filters → list updates → click a note → detail view → download button hits `file_url`.

---

## 9. Non-Functional Requirements

- **Responsiveness:** Tailwind breakpoints (`sm`, `md`, `lg`) covering mobile and desktop.
- **Performance:** Not a concern at MVP scale (expected low note count); no pagination optimization needed initially.
- **Security:** [Certain] v1 has no auth, so file uploads are unrestricted and spoofable. Acceptable for a 1-hour demo; **not** acceptable for real deployment without adding auth, file-type validation, and size limits.

---

## 10. Deliverables Checklist (per original brief)

- [ ] Working deployed website (Vercel)
- [ ] GitHub repository with code
- [ ] README (project overview + local setup steps)
- [ ] `CODE_EXPLANATION.md` — walkthrough of architecture/code for presentation
- [ ] Short demo script/talking points

---

## 11. Realistic Time Allocation (60 minutes)

[Guessing — depends heavily on your familiarity with the stack]

| Time | Task |
|---|---|
| 0–10 min | Scaffold Next.js + Tailwind, set up Supabase project, create `notes` table + storage bucket |
| 10–25 min | Build upload form + Supabase insert/upload logic |
| 25–40 min | Build browse/list page + note detail view |
| 40–50 min | Add search + filters |
| 50–55 min | Responsive pass, fix obvious breakpoints |
| 55–60 min | Deploy to Vercel, push to GitHub, write README |

Note there is **no slot allocated for bonus features** — that's intentional, not an oversight. If core functionality slips past minute 50, cut search/filters down to filters-only before cutting upload or browse, since those two are the features a reviewer will test first.
