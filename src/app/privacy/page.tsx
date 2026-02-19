import Card from '@/components/ui/Card';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy - Financi AI',
  description: 'Privacy Policy for Financi AI, a personal expense tracking tool.',
};

export default function PrivacyPage() {
  return (
    <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted">Last updated: {new Date().toLocaleDateString('en-US')}</p>
      </div>

      <Card className="prose prose-sm dark:prose-invert max-w-none">
        <h2>1. Data We Collect</h2>
        <p>
          When you use Financi AI, we collect:
        </p>
        <ul>
          <li><strong>Account data:</strong> Name, email, profile image (from Google or GitHub sign-in)</li>
          <li><strong>Expense data:</strong> Descriptions, amounts, dates, categories, and notes you enter or import</li>
          <li><strong>Subscription data:</strong> PayPal subscription ID, payer ID, and billing period (when you upgrade to PRO)</li>
        </ul>

        <h2>2. How We Use Your Data</h2>
        <p>
          We use your data to provide the Service, including expense tracking, AI categorization, spending insights,
          subscription management, and support. We do not sell your personal data.
        </p>

        <h2>3. Storage</h2>
        <p>
          Your data is stored in MongoDB. Session information is stored in encrypted cookies (via NextAuth). We take
          reasonable measures to protect your data in transit and at rest.
        </p>

        <h2>4. Sharing</h2>
        <p>
          We share data with third parties only as necessary:
        </p>
        <ul>
          <li><strong>OAuth providers (Google, GitHub):</strong> For sign-in</li>
          <li><strong>PayPal:</strong> For subscription payments and webhooks</li>
          <li><strong>AI services (e.g., OpenAI):</strong> For categorization and recommendations, when enabled</li>
        </ul>

        <h2>5. Cookies</h2>
        <p>
          We use cookies for authentication and session management. You can disable cookies in your browser, but
          this may limit your ability to use the Service.
        </p>

        <h2>6. Retention</h2>
        <p>
          We retain your data while your account is active. If you delete your account or request deletion, we will
          delete your data within a reasonable period, except where required by law.
        </p>

        <h2>7. Your Rights</h2>
        <p>
          Depending on your jurisdiction, you may have the right to access, correct, delete, or export your data.
          Contact us to exercise these rights.
        </p>

        <h2>8. Contact</h2>
        <p>
          For privacy-related questions, please contact us at{' '}
          <a href="https://www.workitu.com" target="_blank" rel="noopener noreferrer" className="underline">
            workitu.com
          </a>
          .
        </p>
      </Card>

      <p className="text-center text-sm text-muted">
        <Link href="/" className="underline hover:no-underline">Back to Financi AI</Link>
      </p>
    </div>
  );
}
