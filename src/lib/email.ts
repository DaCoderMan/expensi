type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
  from?: string;
};

/**
 * Minimal Resend email helper using the HTTP API.
 * It expects RESEND_API_KEY to be set in the environment.
 */
export async function sendEmail({ to, subject, html, from }: SendEmailOptions): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set; skipping email send');
    return;
  }

  const fromAddress = from || 'Financi AI <no-reply@financiai.dev>';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromAddress,
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('Resend sendEmail failed', res.status, text);
    // Do not throw – email failures should not break app flows
  }
}

export async function sendWelcomeEmail(to: string, name?: string): Promise<void> {
  const safeName = name || 'there';
  const subject = 'Welcome to Financi AI';
  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.5; color: #0f172a;">
      <h1 style="font-size: 24px; margin-bottom: 8px;">Welcome to Financi AI, ${safeName}!</h1>
      <p style="margin: 0 0 12px;">
        Thanks for trying Financi AI. You have a free trial with premium features so you can see how
        AI-powered insights and import help you stay on top of your spending.
      </p>
      <p style="margin: 0 0 12px;">
        You can:
      </p>
      <ul style="margin: 0 0 12px 20px; padding: 0;">
        <li>Import expenses from CSV, Excel, PDF, JSON, and OFX/QFX files</li>
        <li>Use AI to auto-categorize expenses</li>
        <li>See dashboards and AI insights about your spending</li>
      </ul>
      <p style="margin: 0 0 16px;">
        Remember: Financi AI is a personal tool, not professional financial, tax, or legal advice.
      </p>
      <p style="margin: 0; font-size: 12px; color: #64748b;">
        If you did not create an account, you can ignore this email.
      </p>
    </div>
  `;

  await sendEmail({ to, subject, html });
}

