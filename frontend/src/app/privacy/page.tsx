import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0f0f23] py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline mb-6 inline-block">
          ← Back to Home
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last updated: 2 June 2026</p>

        <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow-md dark:shadow-gray-900/60 p-8 space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3 dark:text-gray-200">1. Introduction</h2>
            <p>ArtiSANs NG (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to protecting your privacy. This policy explains how we collect, use, disclose, and safeguard your personal data when you use our platform, in compliance with the Nigeria Data Protection Regulation (NDPR).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 dark:text-gray-200">2. Data We Collect</h2>
            <p>We collect the following categories of personal data:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Account Data:</strong> username, email address, password (hashed), phone number</li>
              <li><strong>Profile Data:</strong> first and last name, location (state/LGA), profile picture, bio</li>
              <li><strong>Verification Data:</strong> NIN and BVN numbers (encrypted at rest)</li>
              <li><strong>Financial Data:</strong> bank name, account number, account name, wallet balance, transaction history</li>
              <li><strong>Usage Data:</strong> jobs posted, bids placed, messages, reviews, and platform activity logs</li>
              <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 dark:text-gray-200">3. How We Use Your Data</h2>
            <p>We use your personal data to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Create and manage your account</li>
              <li>Facilitate job postings, bidding, and payment transactions</li>
              <li>Verify artisan identities through NIN/BVN checks</li>
              <li>Process wallet deposits, payouts, and withdrawals</li>
              <li>Communicate with you about platform updates, job matches, and support inquiries</li>
              <li>Detect and prevent fraud, abuse, and security incidents</li>
              <li>Comply with legal and regulatory obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 dark:text-gray-200">4. Data Sharing</h2>
            <p>We do not sell your personal data. We may share data with:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Paystack</strong> — for payment processing (deposits and transfers)</li>
              <li><strong>Cloudinary</strong> — for image and file hosting</li>
              <li><strong>Resend</strong> — for transactional email delivery</li>
              <li><strong>Other users</strong> — as necessary for the platform to function (e.g., artisans see client location; clients see artisan profiles)</li>
              <li><strong>Law enforcement</strong> — when required by applicable law or court order</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 dark:text-gray-200">5. Data Retention</h2>
            <p>We retain your personal data for as long as your account is active. Upon account deletion, we anonymise your personal data within 30 days. Anonymised records may be retained for legitimate business purposes (fraud prevention, analytics).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 dark:text-gray-200">6. Your Rights (NDPR)</h2>
            <p>Under the Nigeria Data Protection Regulation, you have the right to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Access your personal data held by us</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data (subject to legal retention requirements)</li>
              <li>Withdraw consent where processing is based on consent</li>
              <li>Lodge a complaint with the Nigeria Data Protection Commission (NDPC)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 dark:text-gray-200">7. Data Security</h2>
            <p>We implement appropriate technical and organisational measures to protect your data, including encryption at rest for sensitive fields (NIN/BVN), HTTPS in transit, and database access controls. However, no method of transmission over the Internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 dark:text-gray-200">8. Contact</h2>
            <p>For privacy-related inquiries, please contact us at <a href="mailto:support@artisans.ng" className="text-blue-600 dark:text-blue-400">support@artisans.ng</a>.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
