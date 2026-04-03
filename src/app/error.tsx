'use client';

import Link from 'next/link';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const errorMessage = isDevelopment ? error.message : (error.digest || 'An unexpected error occurred');

  return (
    <main className="relative min-h-screen bg-void text-white antialiased flex items-center justify-center px-4">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="bg-grid absolute inset-0" />
        <div className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] bg-lime rounded-full blur-[280px] opacity-[0.06] animate-orb-float" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] bg-yellow-accent rounded-full blur-[220px] opacity-[0.05] animate-orb-float" style={{ animationDirection: 'reverse', animationDuration: '25s' }} />
      </div>

      {/* Error Card */}
      <div className="relative z-10 max-w-md w-full">
        <div className="glass rounded-3xl p-8 border border-white/[0.06] text-center">
          {/* Error Icon */}
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-3xl mb-6 mx-auto">
            ⚠️
          </div>

          {/* Heading */}
          <h1 className="font-display font-bold text-2xl mb-4 text-white">
            Something went wrong
          </h1>

          {/* Error Message */}
          <p className="text-text-secondary text-sm mb-8 leading-relaxed">
            {errorMessage}
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="group relative px-6 py-3 rounded-full bg-lime text-void font-display font-bold hover:shadow-2xl hover:shadow-lime/30 transition-all duration-500 hover:scale-105"
            >
              <span className="relative z-10">Try Again</span>
              <div className="absolute inset-0 rounded-full bg-lime opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
            </button>

            <Link
              href="/"
              className="px-6 py-3 rounded-full border border-white/20 text-white font-display font-bold hover:border-lime hover:text-lime transition-all duration-500 hover:scale-105 text-center"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}