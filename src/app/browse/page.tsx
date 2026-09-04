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

  // Mobile filter toggle per DESIGN.md Section 3.3
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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

  // EXACT same query/filter logic per Rule 1
  const fetchFilteredNotes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from("notes").select("*").order("created_at", { ascending: false });

      if (searchQuery.trim()) {
        const cleanTerm = searchQuery.trim().replace(/[%_]/g, "");
        query = query.or(`title.ilike.%${cleanTerm}%,subject.ilike.%${cleanTerm}%,description.ilike.%${cleanTerm}%`);
      }

      if (selectedDept !== "All Departments") {
        query = query.eq("department", selectedDept);
      }

      if (selectedSemester !== "All Semesters") {
        query = query.eq("semester", parseInt(selectedSemester, 10));
      }

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

  const activeFiltersCount =
    (selectedDept !== "All Departments" ? 1 : 0) +
    (selectedSemester !== "All Semesters" ? 1 : 0) +
    (selectedSubject !== "All Subjects" ? 1 : 0);

  return (
    <div className="py-4 sm:py-8 space-y-6">
      {/* 3.3 Top Bar: Search input (full-width on mobile) + Mobile Filter Toggle + Upload CTA */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#F4F5F7] tracking-tight">
              Browse Notes
            </h1>
            <p className="text-xs sm:text-sm text-[#9AA1B2] mt-0.5">
              Explore university notes, lecture slides, and past papers.
            </p>
          </div>

          <Link
            href="/upload"
            className="self-start sm:self-auto inline-flex items-center px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-[#7C5CFF] to-[#00E0C6] shadow-md shadow-indigo-950/50 hover:brightness-110 active:scale-[0.97] transition-all"
          >
            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Upload Notes
          </Link>
        </div>

        {/* Search Bar + Mobile Filter Button */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9AA1B2]">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, subject, or description keywords..."
              className="block w-full pl-10 pr-9 py-2.5 sm:py-3 rounded-xl bg-[#151922] border border-[#262B38] text-[#F4F5F7] placeholder-[#9AA1B2] text-xs sm:text-sm focus:border-[#7C5CFF] focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9AA1B2] hover:text-[#F4F5F7]"
                title="Clear search"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filter toggle button on mobile per DESIGN.md Section 3.3 */}
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className={`lg:hidden inline-flex items-center px-3.5 py-2.5 sm:py-3 rounded-xl border text-xs sm:text-sm font-medium transition-colors ${
              mobileFiltersOpen || activeFiltersCount > 0
                ? "bg-[#1D2330] border-[#7C5CFF] text-[#F4F5F7]"
                : "bg-[#151922] border-[#262B38] text-[#9AA1B2] hover:text-[#F4F5F7]"
            }`}
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-[#7C5CFF] text-white font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 3.3 Layout: Left Sidebar (Desktop) + Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Sidebar Filter Panel (Persistent on desktop, collapsible on mobile) */}
        <aside
          className={`w-full lg:w-64 shrink-0 rounded-2xl bg-[#151922] border border-[#262B38] p-5 space-y-5 lg:sticky lg:top-24 shadow-xl ${
            mobileFiltersOpen ? "block" : "hidden lg:block"
          }`}
        >
          <div className="flex items-center justify-between border-b border-[#262B38] pb-3">
            <h2 className="text-sm font-display font-bold text-[#F4F5F7] uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4 text-[#7C5CFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Filter Notes
            </h2>
            {isFiltered && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-[#FF6584] hover:underline font-medium"
              >
                Reset
              </button>
            )}
          </div>

          {/* Department Filter */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#9AA1B2] uppercase tracking-wider">
              Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="block w-full rounded-xl bg-[#151922] border border-[#262B38] px-3 py-2 text-[#F4F5F7] text-xs sm:text-sm focus:border-[#7C5CFF] focus:outline-none transition-colors"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept} className="bg-[#151922] text-[#F4F5F7]">
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#9AA1B2] uppercase tracking-wider">
              Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="block w-full rounded-xl bg-[#151922] border border-[#262B38] px-3 py-2 text-[#F4F5F7] text-xs sm:text-sm focus:border-[#7C5CFF] focus:outline-none transition-colors"
            >
              <option value="All Semesters" className="bg-[#151922] text-[#F4F5F7]">
                All Semesters
              </option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem.toString()} className="bg-[#151922] text-[#F4F5F7]">
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#9AA1B2] uppercase tracking-wider">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="block w-full rounded-xl bg-[#151922] border border-[#262B38] px-3 py-2 text-[#F4F5F7] text-xs sm:text-sm focus:border-[#7C5CFF] focus:outline-none transition-colors"
            >
              <option value="All Subjects" className="bg-[#151922] text-[#F4F5F7]">
                All Subjects
              </option>
              {availableSubjects.map((sub) => (
                <option key={sub} value={sub} className="bg-[#151922] text-[#F4F5F7]">
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Active filter summary pill list inside sidebar */}
          {isFiltered && (
            <div className="pt-2 border-t border-[#262B38] space-y-2">
              <span className="text-[11px] font-medium text-[#9AA1B2]">Active filters applied:</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedDept !== "All Departments" && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-[#1D2330] text-[#7C5CFF] border border-[#262B38]">
                    {selectedDept.split(" (")[0]}
                  </span>
                )}
                {selectedSemester !== "All Semesters" && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-[#1D2330] text-[#00E0C6] border border-[#262B38]">
                    Sem {selectedSemester}
                  </span>
                )}
                {selectedSubject !== "All Subjects" && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-[#1D2330] text-[#FFB547] border border-[#262B38]">
                    {selectedSubject}
                  </span>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* Main Area: Results counter + Notes Grid */}
        <main className="flex-1 w-full space-y-4">
          <div className="flex items-center justify-between text-xs sm:text-sm text-[#9AA1B2]">
            <span>
              {!loading && (
                <>
                  Showing <strong className="text-[#F4F5F7]">{notes.length}</strong> {notes.length === 1 ? "note" : "notes"}
                </>
              )}
            </span>
            {isFiltered && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-[#7C5CFF] hover:underline font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Error State */}
          {error && (
            <div className="rounded-xl bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 p-4 text-xs sm:text-sm text-[#FF6B6B] flex items-start justify-between">
              <p>{error}</p>
              <button
                onClick={fetchFilteredNotes}
                className="px-2.5 py-1 rounded bg-[#FF6B6B]/20 hover:bg-[#FF6B6B]/30 text-xs font-semibold"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading Skeletons */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-[#151922] rounded-2xl border border-[#262B38] p-5 space-y-3 animate-pulse"
                >
                  <div className="flex justify-between">
                    <div className="h-4 w-14 bg-[#1D2330] rounded-full" />
                    <div className="h-4 w-12 bg-[#1D2330] rounded-full" />
                  </div>
                  <div className="h-5 w-3/4 bg-[#1D2330] rounded" />
                  <div className="h-3.5 w-1/2 bg-[#1D2330] rounded" />
                  <div className="h-10 w-full bg-[#1D2330] rounded" />
                  <div className="pt-3 border-t border-[#262B38] flex justify-between">
                    <div className="h-3 w-20 bg-[#1D2330] rounded" />
                    <div className="h-6 w-14 bg-[#1D2330] rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3.3 Empty State: short message + "Clear filters" action */}
          {!loading && !error && notes.length === 0 && (
            <div className="text-center py-16 bg-[#151922] rounded-2xl border border-[#262B38] p-6 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#1D2330] text-[#9AA1B2] flex items-center justify-center mx-auto">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="max-w-sm mx-auto">
                <h3 className="text-base font-display font-bold text-[#F4F5F7]">No notes match your filters</h3>
                <p className="text-xs sm:text-sm text-[#9AA1B2] mt-1">
                  Try loosening your search keywords or resetting the department and semester filters.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap justify-center gap-3">
                {isFiltered && (
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 rounded-lg border border-[#262B38] bg-[#1D2330] hover:bg-[#262B38] text-xs font-semibold text-[#F4F5F7] transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
                <Link
                  href="/upload"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#7C5CFF] to-[#00E0C6] text-white text-xs font-semibold hover:brightness-110 transition-all"
                >
                  Upload This Note
                </Link>
              </div>
            </div>
          )}

          {/* 3.3 Responsive Grid of Note Cards (3 cols desktop, 2 tablet, 1 mobile) */}
          {!loading && !error && notes.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {notes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}