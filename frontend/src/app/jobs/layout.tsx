import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Find Jobs',
  description: 'Browse available jobs posted by clients near you. Apply and start working with ArtiSANs NG.',
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
