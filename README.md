# Campus Notes Hub 🎓

> A lightweight, centralized web platform for university students to share, discover, and download lecture notes, previous year question papers, and study resources organized by department, semester, and subject.

---

## 🚀 Live Demo & Repository
- **Live Deployment:** [Campus Notes Hub on Vercel](https://campus-notes-hub-three.vercel.app) *(or your deployed Vercel link)*
- **GitHub Repository:** [Campus Notes Hub Repository](https://github.com/your-username/campus-notes-hub)

---

## 📌 Problem Statement
Students frequently accumulate notes, exam solutions, and lecture materials scattered across WhatsApp groups, Google Drive links, and personal folders, with no central or searchable directory. **Campus Notes Hub** centralizes and indexes these resources with instant search, multi-faceted filtering, and direct downloads.

---

## 🛠 Tech Stack (Strictly Implemented per PRD)
- **Frontend Framework:** [Next.js](https://nextjs.org/) (React 19, App Router, TypeScript)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Responsive mobile-first styling)
- **Database & File Storage:** [Supabase](https://supabase.com/)
  - **PostgreSQL Database:** `notes` table for structured metadata
  - **Storage Bucket:** `notes-files` public bucket for PDF & image files
- **Hosting & Deployment:** [Vercel](https://vercel.com/) (Edge-ready Next.js hosting)

---

## ✨ Features (MVP Scope)
1. **Landing Page (`/`):**
   - Clean hero banner with quick entry points to browse and upload.
   - Snapshot of latest uploaded notes.
2. **Upload Flow (`/upload`):**
   - Form fields: Title, Department, Semester (1–8), Subject, Uploader Name, Description (optional), File attachment.
   - Supported file formats: `.pdf`, `.png`, `.jpg`, `.jpeg`, `.webp`.
   - Direct file upload to Supabase Storage with automatic public URL generation and database row insertion.
3. **Browse & Search (`/browse`):**
   - Full list and card grid view.
   - Real-time free-text search across Title, Subject, and Description.
   - Combinable dropdown filters for Department, Semester, and Subject.
   - Active filter indicator chips and one-click "Clear All Filters" reset.
4. **Note Detail View (`/notes/[id]`):**
   - Dedicated page per note with full metadata, uploader attribution, and formatted timestamp.
   - In-page document preview (embedded PDF reader / image viewer).
   - Direct download and "Open in New Tab" actions.
5. **Mobile Responsive UI:**
   - Explicit Tailwind CSS breakpoints optimized from ~375px (mobile viewports) to high-resolution desktop screens.

---

## 🗄️ Database Schema & Storage

### Table: `notes`
```sql
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  department text not null,
  semester int not null check (semester between 1 and 8),
  subject text not null,
  uploader_name text not null,
  file_url text not null,
  file_type text not null check (file_type in ('pdf', 'image')),
  created_at timestamptz not null default now()
);

-- Public access policies (v1 MVP scope)
alter table public.notes enable row level security;

create policy "Public notes are viewable by everyone"
on public.notes for select to anon, authenticated using (true);

create policy "Anyone can insert notes"
on public.notes for insert to anon, authenticated with check (true);
```

### Storage Bucket: `notes-files`
- Public read access for direct document downloads.
- Public upload enabled for student resource sharing.

---

## 💻 Local Setup & Development

### 1. Prerequisites
- Node.js (v18 or later, v20+ recommended)
- npm or pnpm or yarn
- Supabase project credentials

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/campus-notes-hub.git
cd campus-notes-hub
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run the Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for Production
```bash
npm run build
npm run start
```

---

## 📄 Documentation
For an in-depth architectural breakdown and presentation guide, refer to [`CODE_EXPLANATION.md`](./CODE_EXPLANATION.md).