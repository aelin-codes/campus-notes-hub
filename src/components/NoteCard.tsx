import Link from "next/link";
import { Note } from "@/lib/supabase";

interface NoteCardProps {
  note: Note;
}

// Rotate accent colors by department per DESIGN.md Section 1
function getDepartmentAccent(dept: string): { dot: string; text: string } {
  const d = dept.toLowerCase();
  if (d.includes("computer") || d.includes("cse")) {
    return { dot: "bg-[#7C5CFF]", text: "text-[#7C5CFF]" };
  }
  if (d.includes("electronic") || d.includes("ece") || d.includes("information") || d.includes("it")) {
    return { dot: "bg-[#00E0C6]", text: "text-[#00E0C6]" };
  }
  if (d.includes("mechanic") || d.includes("me")) {
    return { dot: "bg-[#FFB547]", text: "text-[#FFB547]" };
  }
  if (d.includes("civil") || d.includes("ce")) {
    return { dot: "bg-[#FF6584]", text: "text-[#FF6584]" };
  }
  return { dot: "bg-[#4D96FF]", text: "text-[#4D96FF]" };
}

export default function NoteCard({ note }: NoteCardProps) {
  const formattedDate = new Date(note.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const isPdf = note.file_type === "pdf";
  const deptAccent = getDepartmentAccent(note.department);

  return (
    <div className="bg-[#151922] rounded-2xl border border-[#262B38] p-5 hover:border-[#7C5CFF] hover:-translate-y-1 transition-all duration-150 ease-out flex flex-col justify-between group shadow-lg shadow-black/20">
      <div className="space-y-3">
        {/* Top row: File-type icon/badge and Semester */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium ${
              isPdf
                ? "bg-[#FF6584]/15 text-[#FF6584] border border-[#FF6584]/30"
                : "bg-[#00E0C6]/15 text-[#00E0C6] border border-[#00E0C6]/30"
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

          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#1D2330] text-[#F4F5F7] border border-[#262B38]">
            Sem {note.semester}
          </span>
        </div>

        {/* Note Title (Inter 600, --text-primary, truncate at 2 lines per DESIGN.md 3.4) */}
        <Link href={`/notes/${note.id}`} className="block">
          <h3 className="font-sans font-semibold text-base sm:text-lg text-[#F4F5F7] group-hover:text-[#00E0C6] transition-colors line-clamp-2 leading-snug">
            {note.title}
          </h3>
        </Link>

        {/* Pill Tags: Subject & Department with desaturated dot variants */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#1D2330] text-[#F4F5F7] border border-[#262B38]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E0C6] mr-1.5" />
            <span className="truncate max-w-[140px]">{note.subject}</span>
          </span>

          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#1D2330] text-[#9AA1B2] border border-[#262B38]">
            <span className={`w-1.5 h-1.5 rounded-full ${deptAccent.dot} mr-1.5`} />
            <span className="truncate max-w-[140px]">{note.department.split(" (")[0]}</span>
          </span>
        </div>

        {/* Description: 1–2 lines, --text-secondary, truncated */}
        {note.description && (
          <p className="text-xs text-[#9AA1B2] line-clamp-2 leading-relaxed pt-1">
            {note.description}
          </p>
        )}
      </div>

      {/* Footer Row: uploader name (small, --text-secondary) + date, right-aligned download icon button */}
      <div className="mt-5 pt-3.5 border-t border-[#262B38] flex items-center justify-between gap-3 text-xs">
        <div className="min-w-0 flex-1">
          <p className="text-[#F4F5F7] font-medium truncate">{note.uploader_name}</p>
          <p className="text-[11px] text-[#9AA1B2] font-mono mt-0.5">{formattedDate}</p>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0">
          <Link
            href={`/notes/${note.id}`}
            className="px-2.5 py-1.5 rounded-lg border border-[#262B38] text-[#9AA1B2] hover:text-[#F4F5F7] hover:bg-[#1D2330] text-xs font-medium transition-colors"
          >
            Details
          </Link>
          <a
            href={note.file_url}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="p-1.5 px-2.5 rounded-lg bg-[#1D2330] hover:bg-[#262B38] text-[#00E0C6] hover:text-white border border-[#262B38] hover:border-[#00E0C6]/50 active:scale-[0.97] transition-all inline-flex items-center gap-1 text-xs font-medium"
            title="Download note file"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Get</span>
          </a>
        </div>
      </div>
    </div>
  );
}