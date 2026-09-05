"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect") || "/browse";
  // Prevent Open Redirect (CWE-601): strictly ensure relative local path
  const redirectTo =
    rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") && !rawRedirect.includes("\\")
      ? rawRedirect
      : "/browse";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        // Set session token in cookie for server-side auth checks with Secure flag on HTTPS
        const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
        document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=604800; SameSite=Lax${isSecure ? "; Secure" : ""}`;
      }

      router.push(redirectTo);
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Failed to log in.";
      setErrorMessage(msg);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12">
      {/* Back Link */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-xs sm:text-sm font-medium text-zinc-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
      </div>

      {/* Card Container */}
      <div className="bg-[#151922] rounded-2xl border border-[#262B38] p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C5CFF] to-[#00E0C6] p-0.5 mx-auto">
            <div className="w-full h-full bg-[#0B0E14] rounded-[10px] flex items-center justify-center text-[#00E0C6]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight">
            Log In
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Sign in to upload notes and manage your course materials.
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="rounded-xl bg-red-950/40 border border-red-500/30 p-4 text-xs sm:text-sm text-red-200 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold text-red-300">Authentication Error</p>
              <p className="mt-0.5 text-red-200/90">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-zinc-200 mb-1.5">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              className="w-full rounded-xl border border-[#262B38] bg-[#0B0E14] px-4 py-2.5 text-zinc-100 placeholder-zinc-500 focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF] focus:outline-none text-sm transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-zinc-200 mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-[#262B38] bg-[#0B0E14] px-4 py-2.5 text-zinc-100 placeholder-zinc-500 focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF] focus:outline-none text-sm transition-colors"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-[#7C5CFF] to-[#00E0C6] hover:opacity-95 active:scale-[0.97] transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#7C5CFF]/20 cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2.5 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Logging in...
                </>
              ) : (
                "Log In"
              )}
            </button>
          </div>
        </form>

        {/* Signup Redirect Link */}
        <div className="pt-2 border-t border-[#262B38] text-center text-xs sm:text-sm text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link
            href={`/signup${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
            className="text-[#00E0C6] hover:underline font-semibold"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto py-12 text-center text-zinc-400">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
