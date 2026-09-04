"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const DEPARTMENTS = [
  "Computer Science & Engineering (CSE)",
  "Electronics & Communication (ECE)",
  "Mechanical Engineering (ME)",
  "Civil Engineering (CE)",
  "Electrical & Electronics (EEE)",
  "Information Technology (IT)",
  "Applied Sciences & Humanities",
  "Other",
];

export default function UploadPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [customDept, setCustomDept] = useState("");
  const [semester, setSemester] = useState("1");
  const [subject, setSubject] = useState("");
  const [uploaderName, setUploaderName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const processFile = (selected: File) => {
    const ext = selected.name.split(".").pop()?.toLowerCase();
    const isPdf = ext === "pdf" || selected.type.includes("pdf");
    const isImg =
      ["png", "jpg", "jpeg", "webp"].includes(ext || "") ||
      selected.type.startsWith("image/");

    if (!isPdf && !isImg) {
      setErrorMessage("Invalid file type. Please upload a PDF or image (PNG, JPG, WEBP).");
      setFile(null);
      return;
    }

    setErrorMessage(null);
    setFile(selected);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const finalDept = department === "Other" ? customDept.trim() : department;

    if (!file) {
      setErrorMessage("Please attach a note file (PDF or image).");
      return;
    }
    if (!title.trim()) {
      setErrorMessage("Please enter a note title.");
      return;
    }
    if (!finalDept) {
      setErrorMessage("Please specify the department.");
      return;
    }
    if (!subject.trim()) {
      setErrorMessage("Please enter the subject name.");
      return;
    }
    if (!uploaderName.trim()) {
      setErrorMessage("Please enter your name or alias.");
      return;
    }

    setIsSubmitting(true);

    try {
      const ext = file.name.split(".").pop()?.toLowerCase();
      const isPdf = ext === "pdf" || file.type.includes("pdf");
      const fileType: "pdf" | "image" = isPdf ? "pdf" : "image";

      const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storageFilePath = `${Date.now()}_${cleanFileName}`;

      const { error: storageError } = await supabase.storage
        .from("notes-files")
        .upload(storageFilePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (storageError) {
        throw new Error(`Storage upload failed: ${storageError.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from("notes-files")
        .getPublicUrl(storageFilePath);

      const fileUrl = publicUrlData.publicUrl;

      const { error: dbError } = await supabase
        .from("notes")
        .insert([
          {
            title: title.trim(),
            description: description.trim() ? description.trim() : null,
            department: finalDept,
            semester: parseInt(semester, 10),
            subject: subject.trim(),
            uploader_name: uploaderName.trim(),
            file_url: fileUrl,
            file_type: fileType,
          },
        ])
        .select()
        .single();

      if (dbError) {
        throw new Error(`Database insert failed: ${dbError.message}`);
      }

      setSuccessMessage("Note uploaded successfully! Redirecting to browse page...");
      setTimeout(() => {
        router.push("/browse");
      }, 1200);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Link
          href="/browse"
          className="inline-flex items-center text-xs sm:text-sm font-medium text-zinc-400 hover:text-white transition-colors mb-3"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Browse
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-display">
          Upload Study Material
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-zinc-400">
          Share your notes, exam solutions, or lecture slides with peers across campus.
        </p>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="mb-6 rounded-xl bg-red-950/40 border border-red-500/30 p-4 text-xs sm:text-sm text-red-200 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-semibold text-red-300">Upload Error</p>
            <p className="mt-0.5 text-red-200/90">{errorMessage}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 rounded-xl bg-emerald-950/40 border border-emerald-500/30 p-4 text-xs sm:text-sm text-emerald-200 flex items-start gap-3">
          <svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-semibold text-emerald-300">Upload Complete</p>
            <p className="mt-0.5 text-emerald-200/90">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Single-Column Form with generous spacing per DESIGN.md 3.5 */}
      <form onSubmit={handleSubmit} className="bg-[#151922] rounded-2xl border border-[#262B38] p-5 sm:p-8 space-y-6">
        {/* 1. Drag & Drop File Zone at TOP */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-zinc-200 mb-2">
            Attach Note File <span className="text-red-400">*</span>
            <span className="text-xs text-zinc-400 font-normal ml-2">(PDF, PNG, JPG, WEBP up to 50MB)</span>
          </label>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all ${
              isDragging
                ? "border-[#7C5CFF] bg-[#7C5CFF]/10 ring-2 ring-[#7C5CFF]/30"
                : "border-[#262B38] bg-[#0B0E14]/60 hover:border-[#7C5CFF]/60 hover:bg-[#151922]"
            }`}
          >
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
              className="sr-only"
              onChange={handleFileChange}
            />

            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 rounded-xl bg-[#7C5CFF]/10 text-[#7C5CFF] border border-[#7C5CFF]/20 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>

              {file ? (
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#1E2330] border border-[#262B38] text-xs sm:text-sm text-zinc-200 max-w-full">
                    <svg className="w-4 h-4 text-[#00E0C6] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="truncate font-medium">{file.name}</span>
                    <span className="text-zinc-500 font-mono text-xs">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <div>
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer text-xs text-[#7C5CFF] hover:text-[#00E0C6] underline transition-colors"
                    >
                      Choose a different file
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-zinc-200">
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer text-[#7C5CFF] hover:text-[#00E0C6] underline transition-colors"
                    >
                      Browse your device
                    </label>{" "}
                    or drag and drop here
                  </p>
                  <p className="text-xs text-zinc-500">Supports PDF documents and high-resolution images</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. Title */}
        <div>
          <label htmlFor="title" className="block text-xs sm:text-sm font-semibold text-zinc-200 mb-1.5">
            Note Title <span className="text-red-400">*</span>
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Data Structures & Algorithms - Module 3 Notes"
            className="w-full rounded-xl border border-[#262B38] bg-[#0B0E14] px-4 py-2.5 text-zinc-100 placeholder-zinc-500 focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF] focus:outline-none text-sm transition-colors"
          />
        </div>

        {/* 3. Department (select) */}
        <div>
          <label htmlFor="department" className="block text-xs sm:text-sm font-semibold text-zinc-200 mb-1.5">
            Department <span className="text-red-400">*</span>
          </label>
          <select
            id="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full rounded-xl border border-[#262B38] bg-[#0B0E14] px-3.5 py-2.5 text-zinc-100 focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF] focus:outline-none text-sm transition-colors cursor-pointer"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept} className="bg-[#151922] text-zinc-100">
                {dept}
              </option>
            ))}
          </select>
          {department === "Other" && (
            <input
              type="text"
              required
              value={customDept}
              onChange={(e) => setCustomDept(e.target.value)}
              placeholder="Enter department name"
              className="mt-2.5 w-full rounded-xl border border-[#262B38] bg-[#0B0E14] px-4 py-2 text-zinc-100 placeholder-zinc-500 focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF] focus:outline-none text-sm transition-colors"
            />
          )}
        </div>

        {/* 4. Semester (select) */}
        <div>
          <label htmlFor="semester" className="block text-xs sm:text-sm font-semibold text-zinc-200 mb-1.5">
            Semester <span className="text-red-400">*</span>
          </label>
          <select
            id="semester"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="w-full rounded-xl border border-[#262B38] bg-[#0B0E14] px-3.5 py-2.5 text-zinc-100 focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF] focus:outline-none text-sm transition-colors cursor-pointer"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={sem} className="bg-[#151922] text-zinc-100">
                Semester {sem}
              </option>
            ))}
          </select>
        </div>

        {/* 5. Subject (text) */}
        <div>
          <label htmlFor="subject" className="block text-xs sm:text-sm font-semibold text-zinc-200 mb-1.5">
            Subject Name <span className="text-red-400">*</span>
          </label>
          <input
            id="subject"
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Operating Systems, Engineering Mathematics"
            className="w-full rounded-xl border border-[#262B38] bg-[#0B0E14] px-4 py-2.5 text-zinc-100 placeholder-zinc-500 focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF] focus:outline-none text-sm transition-colors"
          />
        </div>

        {/* 6. Uploader Name (text) */}
        <div>
          <label htmlFor="uploader" className="block text-xs sm:text-sm font-semibold text-zinc-200 mb-1.5">
            Uploader Name <span className="text-red-400">*</span>
          </label>
          <input
            id="uploader"
            type="text"
            required
            value={uploaderName}
            onChange={(e) => setUploaderName(e.target.value)}
            placeholder="e.g. Rahul Sharma (S4 CSE)"
            className="w-full rounded-xl border border-[#262B38] bg-[#0B0E14] px-4 py-2.5 text-zinc-100 placeholder-zinc-500 focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF] focus:outline-none text-sm transition-colors"
          />
        </div>

        {/* 7. Description (textarea) */}
        <div>
          <label htmlFor="description" className="block text-xs sm:text-sm font-semibold text-zinc-200 mb-1.5">
            Description <span className="text-zinc-500 font-normal">(Optional)</span>
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide context, syllabus units covered, professor name, or exam year..."
            className="w-full rounded-xl border border-[#262B38] bg-[#0B0E14] px-4 py-2.5 text-zinc-100 placeholder-zinc-500 focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF] focus:outline-none text-sm transition-colors resize-y"
          />
        </div>

        {/* Submit button per DESIGN.md 3.5 */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-[#7C5CFF] to-[#00E0C6] hover:opacity-95 active:scale-[0.97] transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#7C5CFF]/20 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2.5 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Uploading Note...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload & Share Note
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}