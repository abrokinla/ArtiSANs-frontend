import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Find Artisans',
  description: 'Search for verified local artisans in Nigeria. Hire trusted professionals for your projects.',
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
