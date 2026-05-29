import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'

export const metadata: Metadata = {
  title: 'ArtiSANs NG - Connect with Trusted Local Artisans',
  description: 'Nigeria-first platform connecting clients with verified local artisans',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/logo.png" type="image/png" sizes="1408x768" />
        {/* DM Sans - Airbnb Cereal VF substitute */}
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans">
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main>{children}</main>
            <footer className="bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 py-12 mt-16 transition-colors">
              <div className="container mx-auto px-4 text-center">
                <p className="text-secondary dark:text-gray-400 text-sm">&copy; 2026 ArtiSANs NG. All rights reserved.</p>
              </div>
            </footer>
          </AuthProvider>
        </ThemeProvider>
        {/* Inline script to prevent FOUC */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var theme = localStorage.getItem('artisans-theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            })();
          `
        }} />
      </body>
    </html>
  )
}
