import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Terms and conditions for using ArtiSANs NG — the Nigeria-first platform connecting clients with verified local artisans.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0f0f23] py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/auth" className="text-blue-600 dark:text-blue-400 hover:underline mb-6 inline-block">
          ← Back
        </Link>

        <h1 className="text-3xl font-bold mb-2 dark:text-gray-200">Terms &amp; Conditions</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last updated: June 1, 2026</p>

        <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow-md dark:shadow-gray-900/60 p-8 space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3 dark:text-gray-200">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the ArtiSANs platform (the &ldquo;Service&rdquo;), you agree to be bound by these
              Terms &amp; Conditions. If you do not agree, do not use the Service. We may update these terms at any
              time; continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 dark:text-gray-200">2. Eligibility</h2>
            <p>
              You must be at least 18 years old and capable of forming a legally binding contract. By registering,
              you represent that the information you provide is accurate and complete. Accounts registered with
              false information may be terminated.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 dark:text-gray-200">3. Account Registration &amp; Security</h2>
            <p>
              You are responsible for maintaining the confidentiality of your login credentials. You must notify us
              immediately of any unauthorized use of your account. We are not liable for any loss or damage arising
              from your failure to safeguard your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 dark:text-gray-200">4. Services Description</h2>
            <p>
              ArtiSANs connects clients seeking services with artisans offering those services. We act solely as an
              intermediary and marketplace. We are not a party to any agreement between a client and an artisan,
              and we do not employ, recommend, or endorse any artisan. All work arrangements are directly between
              the client and the artisan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 dark:text-gray-200">5. User Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Use the Service for any unlawful purpose or in violation of any applicable law.</li>
              <li>Harass, abuse, or threaten other users.</li>
              <li>Submit false or misleading information, including fake profiles or job listings.</li>
              <li>Attempt to circumvent our fee structure, escrow system, or payment processes.</li>
              <li>Engage in fraudulent activity, including chargebacks or payment reversals after receiving services.</li>
              <li>Use automated scripts, bots, or scrapers without our express written permission.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 dark:text-gray-200">6. Fees &amp; Commissions</h2>
            <p>By using the Service, you agree to the following fees:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>
                <strong>Service Commission:</strong> A 10% commission is deducted from the final job amount upon
                successful completion and release of funds. This commission is credited to the platform.
              </li>
              <li>
                <strong>Cancellation Fee:</strong> If a job is cancelled after escrow is funded, a 10%
                cancellation fee (based on the budget) is deducted. The remaining balance is refunded to the
                client&rsquo;s wallet.
              </li>
              <li>
                <strong>Withdrawal Fee:</strong> A flat fee of ₦50 is charged for each wallet withdrawal to
                cover Paystack transfer costs.
              </li>
              <li>
                <strong>Subscription Fees:</strong> Pro (₦5,000/mo) and Premium (₦15,000/mo) subscription tiers
                are available. Fees are non-refundable and billed monthly.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 dark:text-gray-200">7. Wallet &amp; Escrow</h2>
            <p>
              All payments are processed through our wallet and escrow system. When a client creates a job, the
              full budget amount is deducted from their wallet and held in escrow. Funds are released to the
              artisan only when the client confirms completion. This ensures that both parties are protected.
            </p>
            <p className="mt-2">
              Wallet deposits are processed through Paystack. Deposits are credited only after successful
              payment verification. You may withdraw your wallet balance to your linked bank account, subject to
              the ₦50 withdrawal fee and any applicable Paystack transfer limits.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 dark:text-gray-200">8. Dispute Resolution</h2>
            <p>
              If a dispute arises between a client and an artisan, either party may initiate a dispute through
              the platform. The platform&rsquo;s admin team will review the dispute and may take one of the
              following actions:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Release payment to the artisan (resolved for artisan).</li>
              <li>Refund payment to the client (resolved for client).</li>
              <li>Split the payment 50/50 (partial resolution).</li>
            </ul>
            <p className="mt-2">
              The admin&rsquo;s decision is final and binding. By using the Service, you agree to submit to this
              dispute resolution process and waive your right to pursue claims outside the platform, except where
              prohibited by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 dark:text-gray-200">9. Deposit Issues</h2>
            <p>
              If a Paystack deposit fails or is not credited after successful payment, you may report the issue
              through the wallet page. Our admin team will investigate and, upon verification with Paystack,
              manually credit your wallet. You must provide the transaction reference from Paystack.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 dark:text-gray-200">10. Intellectual Property</h2>
            <p>
              The Service, including its design, logo, text, graphics, and software, is owned by ArtiSANs and is
              protected by applicable intellectual property laws. You may not reproduce, distribute, or create
              derivative works without our express written permission. Content you post (e.g., portfolio images,
              job descriptions) remains your property, but you grant us a license to display it on the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 dark:text-gray-200">11. Limitation of Liability</h2>
            <p>
              ArtiSANs is provided &ldquo;as is&rdquo; without warranties of any kind, express or implied. We do
              not guarantee the quality, safety, or legality of any services offered by artisans. We are not
              liable for any direct, indirect, incidental, or consequential damages arising from your use of the
              Service, including but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Dissatisfaction with work performed by an artisan.</li>
              <li>Failure of an artisan to complete work as agreed.</li>
              <li>Any financial loss, data loss, or damage to property.</li>
              <li>Interruption or unavailability of the Service.</li>
            </ul>
            <p className="mt-2">
              Our total liability to you for any claim arising from the Service shall not exceed the total fees
              you have paid to us in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 dark:text-gray-200">12. Disclaimer of Warranties</h2>
            <p>
              The Service is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. We make no
              representations or warranties of any kind, whether express, implied, statutory, or otherwise,
              including but not limited to warranties of merchantability, fitness for a particular purpose, or
              non-infringement. We do not warrant that the Service will be uninterrupted, secure, or error-free.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 dark:text-gray-200">13. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless ArtiSANs, its affiliates, officers, directors,
              employees, and agents from any and all claims, liabilities, damages, losses, costs, or expenses
              (including reasonable legal fees) arising out of or related to:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Your use of the Service.</li>
              <li>Your violation of these Terms &amp; Conditions.</li>
              <li>Your violation of any third-party rights, including intellectual property rights.</li>
              <li>Any dispute between you and another user of the Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 dark:text-gray-200">14. Termination</h2>
            <p>
              We may suspend or terminate your account at any time, with or without cause, and without prior
              notice. Upon termination, your right to use the Service immediately ceases. Any funds held in your
              wallet will be returned to you, subject to any outstanding fees or disputes. You may also delete
              your account at any time through the profile settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 dark:text-gray-200">15. Privacy</h2>
            <p>
              Your privacy is important to us. We collect and process personal information (including your name,
              email, phone number, and bank details) in accordance with our Privacy Policy. By using the Service,
              you consent to such collection and processing. We use Paystack for payment processing; your payment
              information is handled by Paystack under their own privacy policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 dark:text-gray-200">16. Governing Law</h2>
            <p>
              These Terms &amp; Conditions shall be governed by and construed in accordance with the laws of the
              Federal Republic of Nigeria. Any disputes arising under these terms shall be subject to the
              exclusive jurisdiction of the courts in Lagos, Nigeria.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 dark:text-gray-200">17. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms &amp; Conditions at any time. Changes will be effective
              immediately upon posting to the platform. We will notify you of material changes via email or
              through the Service. Your continued use of the Service after any changes constitutes acceptance of
              the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 dark:text-gray-200">18. Contact Information</h2>
            <p>
              If you have any questions about these Terms &amp; Conditions, please contact us at:
            </p>
            <p className="mt-2">
              Email: support@artisans.ng<br />
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
