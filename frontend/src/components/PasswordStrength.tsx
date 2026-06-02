'use client';

interface Props {
  password: string;
}

function getStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (password.length >= 12 && /[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score === 2) return { score, label: 'Fair', color: 'bg-orange-500' };
  if (score === 3) return { score, label: 'Good', color: 'bg-yellow-500' };
  return { score, label: 'Strong', color: 'bg-green-500' };
}

export default function PasswordStrength({ password }: Props) {
  const { score, label, color } = getStrength(password);

  if (!password) return null;

  return (
    <div className="mt-1 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i <= score ? color : 'bg-gray-200 dark:bg-gray-600'}`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500 dark:text-gray-400">{label}</span>
        <div className="space-x-2 text-gray-400 dark:text-gray-500">
          <span className={password.length >= 8 ? 'text-green-500' : ''}>8+ chars</span>
          <span className={/[A-Z]/.test(password) ? 'text-green-500' : ''}>A-Z</span>
          <span className={/[0-9]/.test(password) ? 'text-green-500' : ''}>0-9</span>
        </div>
      </div>
    </div>
  );
}
