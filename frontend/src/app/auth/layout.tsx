import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In / Register',
  description: 'Create an account or sign in to ArtiSANs NG — connect with trusted local artisans.',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
