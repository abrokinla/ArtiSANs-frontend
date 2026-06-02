import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for ArtiSANs NG. Learn how we collect, use, and protect your personal data in compliance with NDPR.',
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
