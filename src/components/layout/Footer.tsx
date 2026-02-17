import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border/50 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
        <p className="text-xs text-muted">
          Expensi is a tool, not a professional device. Not financial, tax, or legal advice.
        </p>
        <p className="text-sm">
          <Link href="/terms" className="underline hover:no-underline mr-3">Terms</Link>
          <Link href="/privacy" className="underline hover:no-underline mr-3">Privacy</Link>
          Built by{' '}
          <a
            href="https://www.workitu.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold hover:underline transition-colors"
            style={{ color: '#D4A537' }}
          >
            Workitu Tech
          </a>
        </p>
      </div>
    </footer>
  );
}
