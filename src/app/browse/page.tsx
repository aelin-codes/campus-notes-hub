"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import Link from "next/link";
import { supabase, Note } from "@/lib/supabase";
import NoteCard from "@/components/NoteCard";

const DEPARTMENTS = [
  "All Departments",
  "Computer Science & Engineering (CSE)",
  "Electronics & Communication (ECE)",
  "Mechanical Engineering (ME)",
  "Civil Engineering (CE)",
  "Electrical & Electronics (EEE)",
  "Information Technology (IT)",
  "Applied Sciences & Humanities",
];

export default function BrowsePage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [selectedSemester, setSelectedSemester] = useState("All Semesters");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");

  const [, startTransition] = useTransition();

  // Load unique subjects for subject filter
  const fetchAvailableSubjects = useCallback(async () => {
    try {
      const { data } = await supabase.from("notes").select("subject");
      if (data) {
        const unique = Array.from(new Set(data.map((n) => n.subject).filter(Boolean))).sort();
        setAvailableSubjects(unique);
      }
    } catch (err) {
      console.error("Failed to load subjects:", err);
    }
  }, []);

  const fetchFilteredNotes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from("notes").select("*").order("created_at", { ascending: false });

      // 1. Free-text search across title, subject, and description
      if (searchQuery.trim()) {
        const cleanTerm = searchQuery.trim().replace(/[%_]/g, "");
        query = query.or(`title.ilike.%${cleanTerm}%,subject.ilike.%${cleanTerm}%,description.ilike.%${cleanTerm}%`);
      }

      // 2. Department filter
      if (selectedDept !== "All Departments") {
        query = query.eq("department", selectedDept);
      }

      // 3. Semester filter
      if (selectedSemester !== "All Semesters") {
        query = query.eq("semester", parseInt(selectedSemester, 10));
      }

      // 4. Subject filter
      if (selectedSubject !== "All Subjects") {
        query = query.eq("subject", selectedSubject);
      }

      const { data, error: queryErr } = await query;

      if (queryErr) {
        throw queryErr;
      }

      setNotes(data || []);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Failed to filter notes";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedDept, selectedSemester, selectedSubject]);

  useEffect(() => {
    fetchAvailableSubjects();
  }, [fetchAvailableSubjects]);

  useEffect(() => {
    // Debounce search/filter query
    const handler = setTimeout(() => {
      startTransition(() => {
        fetchFilteredNotes();
      });
    }, 250);

    return () => clearTimeout(handler);
  }, [fetchFilteredNotes]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedDept("All Departments");
    setSelectedSemester("All Semesters");
    setSelectedSubject("All Subjects");
  };

  const isFiltered =
    searchQuery.trim() !== "" ||
    selectedDept !== "All Departments" ||
    selectedSemester !== "All Semesters" ||
    selectedSubject !== "All Subjects";

  return (
    <div className="py-4 sm:py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              Browse Notes
            </h1>
            {!loading && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {notes.length} {notes.length === 1 ? "note found" : "notes found"}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-zinc-600">
            Search lecture notes, previous year question papers, and syllabus guides.
          </p>
        </div>

        <Link
          href="/upload"
          className="self-start sm:self-auto inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-semibold rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Upload Notes
        </Link>
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-4 sm:p-6 space-y-4">
        {/* Free-text Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, subject, or description keywords (e.g. data structures, algorithms, thermodynamics)..."
            className="block w-full pl-11 pr-10 py-3 rounded-2xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 placeholder-zinc-400 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600"
              title="Clear search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Department Filter */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
              Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="block w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
              Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="block w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
            >
              <option value="All Semesters">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem.toString()}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="block w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
            >
              <option value="All Subjects">All Subjects</option>
              {availableSubjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Chips & Clear Action */}
        {isFiltered && (
          <div className="pt-3 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5 text-zinc-600">
              <span className="font-medium text-zinc-400">Active filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium">
                  &ldquo;{searchQuery}&rdquo;
                </span>
              )}
              {selectedDept !== "All Departments" && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 font-medium">
                  Dept: {selectedDept.split(" ")[0]}
                </span>
              )}
              {selectedSemester !== "All Semesters" && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 font-medium">
                  Sem {selectedSemester}
                </span>
              )}
              {selectedSubject !== "All Subjects" && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 font-medium">
                  {selectedSubject}
                </span>
              )}
            </div>

            <button
              onClick={handleResetFilters}
              className="inline-flex items-center text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
            >
              <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-5 text-sm text-red-800 flex items-start justify-between">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold">Query Error</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchFilteredNotes}
            className="ml-4 px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 text-xs font-semibold transition-colors shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4 animate-pulse"
            >
              <div className="flex justify-between">
                <div className="h-5 w-16 bg-zinc-200 rounded-full" />
                <div className="h-5 w-12 bg-zinc-200 rounded-full" />
              </div>
              <div className="h-6 w-3/4 bg-zinc-200 rounded-md" />
              <div className="h-4 w-1/2 bg-zinc-100 rounded-md" />
              <div className="h-12 w-full bg-zinc-50 rounded-md" />
              <div className="pt-4 border-t border-zinc-100 flex justify-between">
                <div className="h-4 w-24 bg-zinc-200 rounded-md" />
                <div className="h-7 w-20 bg-zinc-200 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && notes.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-zinc-200 px-6">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-zinc-100 text-zinc-500 flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-zinc-900">No matching notes found</h3>
          <p className="mt-1 text-sm text-zinc-500 max-w-sm mx-auto">
            {isFiltered
              ? "Try adjusting your search keywords or loosening the filter criteria."
              : "No notes have been uploaded yet."}
          </p>
          <div className="mt-6 flex justify-center space-x-3">
            {isFiltered && (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-50 text-sm font-semibold transition-colors"
              >
                Reset Filters
              </button>
            )}
            <Link
              href="/upload"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
            >
              Upload This Note
            </Link>
          </div>
        </div>
      )}

      {/* Grid of Notes */}
      {!loading && !error && notes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}