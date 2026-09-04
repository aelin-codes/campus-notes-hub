"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase, Note } from "@/lib/supabase";

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
      <div className="max-w-4xl mx-auto py-8 space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-zinc-200 rounded-lg" />
        <div className="bg-white rounded-3xl border border-zinc-200 p-8 space-y-6">
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-zinc-200 rounded-full" />
            <div className="h-6 w-24 bg-zinc-200 rounded-full" />
          </div>
          <div className="h-9 w-3/4 bg-zinc-200 rounded-lg" />
          <div className="h-5 w-1/3 bg-zinc-100 rounded-lg" />
          <div className="h-24 w-full bg-zinc-50 rounded-xl" />
          <div className="h-12 w-48 bg-zinc-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-zinc-900">Note Not Found</h2>
        <p className="mt-1 text-sm text-zinc-500">
          The study resource you requested could not be located or may have been deleted.
        </p>
        <div className="mt-6">
          <Link
            href="/browse"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            Back to Browse Notes
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(note.created_at).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const isPdf = note.file_type === "pdf";

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 space-y-6">
      {/* Navigation */}
      <div>
        <Link
          href="/browse"
          className="inline-flex items-center text-sm font-semibold text-zinc-600 hover:text-indigo-600 transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Browse Notes
        </Link>
      </div>

      {/* Main Details Card */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 sm:p-10 space-y-8">
        {/* Header Metadata */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              Semester {note.semester}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
              {note.department}
            </span>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                isPdf
                  ? "bg-rose-50 text-rose-700 border border-rose-100"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-100"
              }`}
            >
              {note.file_type.toUpperCase()} File
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight leading-tight">
            {note.title}
          </h1>

          <div className="mt-3 flex items-center text-base font-semibold text-indigo-600">
            <svg className="w-5 h-5 mr-1.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253\" />
            </svg>
            Subject: {note.subject}
          </div>
        </div>

        {/* Info Grid: Uploader & Timestamp */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-zinc-50 border border-zinc-200/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
              {note.uploader_name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-medium">Uploaded By</p>
              <p className="text-sm font-bold text-zinc-800">{note.uploader_name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-zinc-200 text-zinc-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-medium">Date Shared</p>
              <p className="text-sm font-semibold text-zinc-800">{formattedDate}</p>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-2">
            Description & Notes
          </h2>
          <div className="text-zinc-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap bg-white rounded-xl border border-zinc-100 p-4">
            {note.description || "No specific description was provided with this upload."}
          </div>
        </div>

        {/* Download & Actions Bar */}
        <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-zinc-500">Resource File Attached</p>
            <p className="text-sm font-semibold text-zinc-800 flex items-center mt-0.5">
              <svg className="w-4 h-4 mr-1 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              {note.title}.{note.file_type}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href={note.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-zinc-300 text-sm font-semibold text-zinc-700 bg-white hover:bg-zinc-50 hover:border-zinc-400 transition-colors shadow-xs"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open in New Tab
            </a>
            <a
              href={note.file_url}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Note
            </a>
          </div>
        </div>

        {/* In-page Preview */}
        <div className="pt-6 border-t border-zinc-100">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-3">
            Document Preview
          </h2>
          <div className="rounded-2xl border border-zinc-200 overflow-hidden bg-zinc-100">
            {isPdf ? (
              <div className="p-4 sm:p-8 text-center bg-zinc-50">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-zinc-800">PDF Document Ready</p>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  You can read or print this document directly in your browser or download a copy.
                </p>
                <div className="mt-4">
                  <a
                    href={note.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 rounded-xl bg-white border border-zinc-300 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 shadow-xs"
                  >
                    View Document Fullscreen
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-4 flex justify-center bg-zinc-900/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={note.file_url}
                  alt={note.title}
                  className="max-h-[600px] w-auto object-contain rounded-lg shadow-sm"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}