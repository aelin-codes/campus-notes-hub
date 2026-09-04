"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase, Note } from "@/lib/supabase";

const DEPT_COLORS: Record<string, string> = {
  CSE: "#7C5CFF",
  ECE: "#00E0C6",
  ME: "#FF6B4A",
  CE: "#FFB547",
  EEE: "#4ECDC4",
  IT: "#9B51E0",
};

const getDeptColor = (dept: string) => {
  for (const [key, color] of Object.entries(DEPT_COLORS)) {
    if (dept.toUpperCase().includes(key)) return color;
  }
  return "#94A3B8";
};

export default function NoteDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchNote = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchErr } = await supabase
          .from("notes")
          .select("*")
          .eq("id", id)
          .single();

        if (fetchErr) {
          throw fetchErr;
        }
        setNote(data);
      } catch (err: unknown) {
        console.error(err);
        const msg = err instanceof Error ? err.message : "Note not found";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-4 sm:py-8 space-y-6 animate-pulse">
        <div className="h-5 w-28 bg-[#1E2330] rounded-lg" />
        <div className="bg-[#151922] rounded-2xl border border-[#262B38] p-5 sm:p-8 space-y-5">
          <div className="flex gap-2">
            <div className="h-5 w-16 bg-[#1E2330] rounded-full" />
            <div className="h-5 w-24 bg-[#1E2330] rounded-full" />
          </div>
          <div className="h-8 w-3/4 bg-[#1E2330] rounded-lg" />
          <div className="h-4 w-1/3 bg-[#1E2330] rounded-lg" />
          <div className="h-24 w-full bg-[#0B0E14] rounded-xl border border-[#262B38]" />
          <div className="h-10 w-44 bg-[#1E2330] rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="max-w-xl mx-auto py-12 sm:py-16 text-center px-4">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-white">Note Not Found</h2>
        <p className="mt-1 text-xs sm:text-sm text-zinc-400">
          The study resource you requested could not be located or may have been deleted.
        </p>
        <div className="mt-5">
          <Link
            href="/browse"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-[#7C5CFF] text-white text-xs sm:text-sm font-semibold hover:bg-[#6c4fe0] transition-colors"
          >
            Back to Browse Notes
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(note.created_at).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const isPdf = note.file_type === "pdf";
  const deptColor = getDeptColor(note.department);

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 space-y-4 sm:space-y-6">
      {/* Navigation */}
      <div>
        <Link
          href="/browse"
          className="inline-flex items-center text-xs sm:text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Browse Notes
        </Link>
      </div>

      {/* Main Details Card */}
      <div className="bg-[#151922] rounded-2xl border border-[#262B38] p-5 sm:p-8 md:p-10 space-y-6 sm:space-y-8">
        {/* Header Metadata */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3.5">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#1E2330] text-zinc-300 border border-[#262B38]">
              Semester {note.semester}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#1E2330] text-zinc-200 border border-[#262B38]">
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: deptColor }}
              />
              {note.department}
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                isPdf
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  : "bg-teal-500/10 text-teal-300 border-teal-500/20"
              }`}
            >
              {note.file_type.toUpperCase()} File
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight font-space-grotesk">
            {note.title}
          </h1>

          <div className="mt-2.5 flex items-center text-sm sm:text-base font-semibold text-[#7C5CFF]">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Subject: {note.subject}
          </div>
        </div>

        {/* Primary Action Above The Fold per DESIGN.md 3.6 */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#0B0E14]/80 border border-[#262B38] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-zinc-400">Attached Resource</p>
            <p className="text-sm font-semibold text-white flex items-center mt-0.5 truncate">
              <svg className="w-4 h-4 mr-1.5 text-zinc-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <span className="truncate">{note.title}.{note.file_type}</span>
            </p>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0">
            <a
              href={note.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-[#262B38] bg-[#1E2330]/70 text-xs sm:text-sm font-semibold text-zinc-200 hover:text-white hover:border-zinc-500 active:scale-[0.97] transition-all"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open
            </a>
            <a
              href={note.file_url}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#7C5CFF] to-[#00E0C6] hover:opacity-95 shadow-lg shadow-[#7C5CFF]/20 active:scale-[0.97] transition-all duration-100"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Note
            </a>
          </div>
        </div>

        {/* Info Grid: Uploader & Timestamp */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl bg-[#0B0E14]/50 border border-[#262B38]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/20 flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">
              {note.uploader_name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-zinc-400 font-medium">Uploaded By</p>
              <p className="text-sm font-bold text-zinc-200 truncate">{note.uploader_name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#1E2330] text-zinc-400 border border-[#262B38] flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-zinc-400 font-medium">Date Shared</p>
              <p className="text-sm font-semibold text-zinc-200">{formattedDate}</p>
            </div>
          </div>
        </div>

        {/* Description Section with generous line-height per DESIGN.md 3.6 */}
        <div>
          <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
            Description & Notes
          </h2>
          <div className="text-zinc-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap bg-[#0B0E14]/40 rounded-xl border border-[#262B38] p-4 sm:p-5">
            {note.description || "No specific description was provided with this upload."}
          </div>
        </div>

        {/* In-browser Document Preview */}
        <div className="pt-4 border-t border-[#262B38]">
          <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3">
            Document Preview
          </h2>
          <div className="rounded-xl border border-[#262B38] overflow-hidden bg-[#0B0E14]">
            {isPdf ? (
              <div className="p-4 sm:p-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">PDF Document Ready</p>
                  <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                    View or download this document directly to access full course materials.
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  <a
                    href={note.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 rounded-xl bg-[#1E2330] border border-[#262B38] text-xs font-semibold text-zinc-200 hover:text-white hover:border-zinc-500 transition-colors"
                  >
                    View Document Fullscreen
                  </a>
                </div>

                {/* Embedded PDF iframe */}
                <div className="mt-4 pt-4 border-t border-[#262B38]">
                  <iframe
                    src={note.file_url}
                    title={note.title}
                    className="w-full h-[500px] sm:h-[650px] rounded-lg border border-[#262B38] bg-[#0B0E14]"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 sm:p-6 flex justify-center bg-[#0B0E14]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={note.file_url}
                  alt={note.title}
                  className="max-h-[500px] sm:max-h-[700px] w-auto object-contain rounded-lg border border-[#262B38]"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}