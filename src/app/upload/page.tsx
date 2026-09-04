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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const finalDept = department === "Other" ? customDept.trim() : department;

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
    if (!file) {
      setErrorMessage("Please attach a note file (PDF or image).");
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
    <div className="max-w-3xl mx-auto py-2 sm:py-6 md:py-8">
      <div className="mb-5 sm:mb-8">
        <Link
          href="/browse"
          className="inline-flex items-center text-xs sm:text-sm font-medium text-zinc-500 hover:text-indigo-600 mb-2 sm:mb-3"
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Browse
        </Link>
        <h1 className="text-xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
          Upload Study Material
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-zinc-600">
          Share notes, exam solutions, or lecture slides with peers across campus.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-5 sm:mb-6 rounded-xl bg-red-50 border border-red-200 p-3.5 sm:p-4 text-xs sm:text-sm text-red-800 flex items-start">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mr-2.5 sm:mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-semibold">Upload Error</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-5 sm:mb-6 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 sm:p-4 text-xs sm:text-sm text-emerald-800 flex items-start">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mr-2.5 sm:mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-semibold">Success!</p>
            <p className="mt-0.5">{successMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl sm:rounded-3xl border border-zinc-200 shadow-xs p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-xs sm:text-sm font-semibold text-zinc-800">
            Note Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Data Structures & Algorithms - Module 3 Notes"
            className="mt-1.5 sm:mt-2 block w-full rounded-xl border border-zinc-300 px-3.5 py-2 sm:px-4 sm:py-2.5 text-zinc-900 placeholder-zinc-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-xs sm:text-sm transition-all"
          />
        </div>

        {/* Dept & Semester */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-6">
          <div>
            <label htmlFor="department" className="block text-xs sm:text-sm font-semibold text-zinc-800">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="mt-1.5 sm:mt-2 block w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 sm:py-2.5 text-zinc-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-xs sm:text-sm transition-all"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
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
                className="mt-2 block w-full rounded-xl border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-xs sm:text-sm"
              />
            )}
          </div>

          <div>
            <label htmlFor="semester" className="block text-xs sm:text-sm font-semibold text-zinc-800">
              Semester <span className="text-red-500">*</span>
            </label>
            <select
              id="semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="mt-1.5 sm:mt-2 block w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 sm:py-2.5 text-zinc-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-xs sm:text-sm transition-all"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Subject & Uploader */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-6">
          <div>
            <label htmlFor="subject" className="block text-xs sm:text-sm font-semibold text-zinc-800">
              Subject Name <span className="text-red-500">*</span>
            </label>
            <input
              id="subject"
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Operating Systems, Calculus"
              className="mt-1.5 sm:mt-2 block w-full rounded-xl border border-zinc-300 px-3.5 py-2 sm:px-4 sm:py-2.5 text-zinc-900 placeholder-zinc-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-xs sm:text-sm transition-all"
            />
          </div>

          <div>
            <label htmlFor="uploader" className="block text-xs sm:text-sm font-semibold text-zinc-800">
              Uploader Name <span className="text-red-500">*</span>
            </label>
            <input
              id="uploader"
              type="text"
              required
              value={uploaderName}
              onChange={(e) => setUploaderName(e.target.value)}
              placeholder="e.g. Rahul Sharma (S4 CSE)"
              className="mt-1.5 sm:mt-2 block w-full rounded-xl border border-zinc-300 px-3.5 py-2 sm:px-4 sm:py-2.5 text-zinc-900 placeholder-zinc-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-xs sm:text-sm transition-all"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-xs sm:text-sm font-semibold text-zinc-800">
            Description <span className="text-zinc-400 font-normal">(Optional)</span>
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide any additional context, syllabus modules covered, professor name, or exam year..."
            className="mt-1.5 sm:mt-2 block w-full rounded-xl border border-zinc-300 px-3.5 py-2 sm:px-4 sm:py-2.5 text-zinc-900 placeholder-zinc-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-xs sm:text-sm transition-all"
          />
        </div>

        {/* File Attachment */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-zinc-800 mb-1.5">
            Attach Note File <span className="text-red-500">*</span>
            <span className="text-[11px] sm:text-xs text-zinc-500 font-normal ml-2">(PDF or Image: PNG, JPG, WEBP)</span>
          </label>
          <div className="flex justify-center px-4 py-5 sm:px-6 sm:py-7 border-2 border-dashed border-zinc-300 rounded-2xl hover:border-indigo-500 transition-colors bg-zinc-50/60">
            <div className="space-y-2 text-center">
              <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="flex text-xs sm:text-sm text-zinc-600 justify-center items-center">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer font-semibold text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                >
                  <span>Select a file from device</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              {file ? (
                <div className="mt-2 inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium max-w-full truncate">
                  <svg className="w-3.5 h-3.5 mr-1.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="truncate">{file.name}</span> ({(file.size / 1024).toFixed(1)} KB)
                </div>
              ) : (
                <p className="text-[11px] sm:text-xs text-zinc-500">PDF, PNG, JPG, or WEBP up to 50MB</p>
              )}
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 sm:px-6 sm:py-3 border border-transparent text-xs sm:text-sm font-semibold rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
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