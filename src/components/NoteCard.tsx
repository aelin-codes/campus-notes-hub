import Link from "next/link";
import { Note } from "@/lib/supabase";

interface NoteCardProps {
  note: Note;
}

export default function NoteCard({ note }: NoteCardProps) {
  const formattedDate = new Date(note.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const isPdf = note.file_type === "pdf";

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            Sem {note.semester}
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isPdf
                ? "bg-rose-50 text-rose-700 border border-rose-100"
                : "bg-emerald-50 text-emerald-700 border border-emerald-100"
            }`}
          >
            {isPdf ? (
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
            {note.file_type.toUpperCase()}
          </span>
        </div>

        {/* Title */}
        <Link href={`/notes/${note.id}`} className="block">
          <h3 className="text-lg font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
            {note.title}
          </h3>
        </Link>

        {/* Subject & Dept */}
        <p className="mt-1 text-sm font-semibold text-indigo-600">
          {note.subject}
        </p>
        <p className="text-xs text-zinc-500 mt-0.5 truncate">
          {note.department}
        </p>

        {/* Description snippet */}
        {note.description && (
          <p className="mt-3 text-xs text-zinc-600 line-clamp-2 leading-relaxed">
            {note.description}
          </p>
        )}
      </div>

      {/* Footer Info & Action */}
      <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-zinc-400">By </span>
          <span className="font-semibold text-zinc-700">{note.uploader_name}</span>
          <p className="text-[11px] text-zinc-400 mt-0.5">{formattedDate}</p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Link
            href={`/notes/${note.id}`}
            className="px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-medium transition-colors"
          >
            Details
          </Link>
          <a
            href={note.file_url}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium inline-flex items-center transition-colors"
          >
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </a>
        </div>
      </div>
    </div>
  );
}