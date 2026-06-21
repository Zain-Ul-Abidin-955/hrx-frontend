"use client";

import { useEffect } from "react";
import Link from "next/link";

const isDev = process.env.NODE_ENV === "development";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Always log to browser console so it shows up in DevTools
    console.error("[Error Boundary]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
        500
      </h1>
      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
        Something went wrong!
      </h2>

      {isDev ? (
        // ── Dev: show full error details to help with debugging ──────────────
        <div className="w-full max-w-2xl mb-8 space-y-3">
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
            <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">
              {error.name}: {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-red-500 dark:text-red-500 mb-2">
                Digest: <code>{error.digest}</code>
              </p>
            )}
            {error.stack && (
              <pre className="text-xs text-red-600 dark:text-red-400 overflow-x-auto whitespace-pre-wrap break-all">
                {error.stack}
              </pre>
            )}
          </div>
          <p className="text-xs text-center text-gray-400 dark:text-gray-500">
            This detailed error is only shown in development.
          </p>
        </div>
      ) : (
        // ── Production: friendly message only ───────────────────────────────
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
          An unexpected error occurred. Please try again.
        </p>
      )}

      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-primaryColor text-white rounded-lg hover:bg-secondaryColor transition-colors font-medium"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
