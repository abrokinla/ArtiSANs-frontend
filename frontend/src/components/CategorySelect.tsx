'use client';

import { useMemo } from 'react';

export const CATEGORY_GROUP_LABELS: Record<string, string> = {
  construction: 'Construction & Trades',
  cleaning: 'Cleaning & Sanitation',
  personal_care: 'Personal Care & Beauty',
  home_services: 'Home Services',
  tech: 'Tech & Electronics',
  other: 'Other',
};

const CATEGORY_GROUP_ORDER = ['construction', 'cleaning', 'personal_care', 'home_services', 'tech', 'other'];

export function groupCategories(categories: any[]) {
  if (!Array.isArray(categories)) return [];
  const groups: Record<string, any[]> = {};
  for (const cat of categories) {
    const g = cat.group || 'other';
    if (!groups[g]) groups[g] = [];
    groups[g].push(cat);
  }
  return CATEGORY_GROUP_ORDER
    .filter(g => groups[g])
    .map(g => ({
      key: g,
      label: CATEGORY_GROUP_LABELS[g] || g,
      categories: groups[g],
    }));
}

interface CategorySelectProps {
  categories: any[];
  value: number[];
  onChange: (ids: number[]) => void;
  max?: number;
  disabled?: boolean;
}

export default function CategorySelect({ categories, value, onChange, max = 3, disabled = false }: CategorySelectProps) {
  const grouped = useMemo(() => groupCategories(categories), [categories]);

  const toggleCategory = (id: number) => {
    if (disabled) return;
    if (value.includes(id)) {
      onChange(value.filter(v => v !== id));
    } else {
      if (value.length >= max) return;
      onChange([...value, id]);
    }
  };

  return (
    <div className="space-y-4">
      {grouped.map((group) => (
        <div key={group.key}>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
            {group.label}
          </h4>
          <div className="flex flex-wrap gap-2">
            {group.categories.map((cat) => {
              const selected = value.includes(cat.id);
              const atMax = value.length >= max && !selected;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  disabled={disabled || (atMax && !selected)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    selected
                      ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500'
                      : atMax
                      ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600 dark:border-gray-700'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600 dark:bg-[#1a1a2e] dark:text-gray-300 dark:border-gray-600 dark:hover:border-blue-500'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {value.length}/{max} categories selected
      </p>
    </div>
  );
}
