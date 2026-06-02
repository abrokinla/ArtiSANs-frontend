import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the ArtiSANs NG team. Send us a message and we will get back to you.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
