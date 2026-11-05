'use client';

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-start justify-center gap-4 bg-slate-50 px-6 text-slate-900">
        <h1 className="text-xl font-bold">GlucoNest couldn&apos;t start</h1>
        <p className="text-sm">Your locally saved records have not been intentionally changed.</p>
        <button onClick={reset} className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white">
          Try again
        </button>
      </body>
    </html>
  );
}
