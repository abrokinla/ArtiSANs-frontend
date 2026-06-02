'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f0f23] px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-600 dark:text-red-400 mb-4">500</h1>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Something went wrong</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
