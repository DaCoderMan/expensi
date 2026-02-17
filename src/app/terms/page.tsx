import Card from '@/components/ui/Card';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service - Expensi',
  description: 'Terms of Service for Expensi, a personal expense tracking tool.',
};

export default function TermsPage() {
  return (
    <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
        <p className="text-sm text-muted">Last updated: {new Date().toLocaleDateString('en-US')}</p>
      </div>

      <Card className="prose prose-sm dark:prose-invert max-w-none">
        <h2>1. Service Description</h2>
        <p>
          Expensi (&quot;Service&quot;) is a personal expense tracking tool that helps you record, categorize, and analyze
          your spending. It provides AI-powered categorization, import from files (CSV, Excel, PDF, etc.), and
          spending insights. The Service is provided by Workitu Tech (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;).
        </p>

        <h2>2. Important Disclaimer – Tool Only, Not Professional Advice</h2>
        <p className="font-medium text-amber-700 dark:text-amber-400">
          Expensi is a personal expense tracking tool. It is not a professional accounting, tax, or financial planning
          service. It is not a professional device. Do not rely on it for tax, legal, or investment decisions.
        </p>
        <p>
          The Service and any AI-generated content (including categorizations, recommendations, and insights) are for
          informational purposes only. They do not constitute financial, tax, legal, or investment advice. You should
          consult a qualified professional for any such matters.
        </p>

        <h2>3. User Obligations</h2>
        <p>
          You agree to use the Service only for lawful purposes and in accordance with these Terms. You are responsible
          for the accuracy of data you enter and for keeping your account credentials secure. You must not share your
          account or use the Service to violate any law or third-party rights.
        </p>

        <h2>4. Subscription, Cancellation, and Refunds</h2>
        <p>
          The Service offers a free tier with limited features and a paid PRO subscription. PRO subscriptions are
          billed monthly via PayPal. You may cancel at any time through the app or your PayPal account. Cancellation
          takes effect at the end of the current billing period. We do not offer refunds for partial periods.
        </p>

        <h2>5. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, we disclaim all warranties (express or implied) and are not liable
          for any indirect, incidental, special, consequential, or punitive damages arising from your use of the
          Service. Our total liability shall not exceed the amount you paid us in the twelve (12) months preceding the
          claim.
        </p>

        <h2>6. Indemnification</h2>
        <p>
          You agree to indemnify and hold harmless Workitu Tech and its officers, directors, employees, and agents from
          any claims, damages, losses, or expenses arising from your use of the Service or violation of these Terms.
        </p>

        <h2>7. Governing Law</h2>
        <p>
          These Terms are governed by the laws of the United States, without regard to conflict of law principles.
          Any disputes shall be resolved in the courts of competent jurisdiction.
        </p>

        <h2>8. Contact</h2>
        <p>
          For questions about these Terms, please contact us at{' '}
          <a href="https://www.workitu.com" target="_blank" rel="noopener noreferrer" className="underline">
            workitu.com
          </a>
          .
        </p>
      </Card>

      <p className="text-center text-sm text-muted">
        <Link href="/" className="underline hover:no-underline">Back to Expensi</Link>
      </p>
    </div>
  );
}
