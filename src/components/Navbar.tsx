import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-zinc-200 bg-white sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200 group-hover:bg-indigo-700 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-zinc-900 block leading-none">
                Campus Notes Hub
              </span>
              <span className="text-xs font-medium text-zinc-500">Centralized Study Resource</span>
            </div>
          </Link>

          <nav className="flex items-center space-x-2 sm:space-x-4">
            <Link
              href="/browse"
              className="px-3 py-2 text-sm font-semibold text-zinc-700 hover:text-indigo-600 rounded-lg hover:bg-zinc-100 transition-colors"
            >
              Browse Notes
            </Link>
            <Link
              href="/upload"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Notes
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}