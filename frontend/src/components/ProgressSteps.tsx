'use client';

interface Step {
  label: string;
}

interface Props {
  steps: Step[];
  current: number;
}

export default function ProgressSteps({ steps, current }: Props) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              i <= current
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
            }`}
          >
            {i + 1}
          </div>
          <span
            className={`text-sm hidden sm:inline ${i <= current ? 'text-blue-600 font-medium' : 'text-gray-500 dark:text-gray-400'}`}
          >
            {step.label}
          </span>
          {i < steps.length - 1 && (
            <div className={`w-8 h-0.5 ${i < current ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
          )}
        </div>
      ))}
    </div>
  );
}
