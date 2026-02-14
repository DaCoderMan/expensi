export default function Footer() {
  return (
    <footer className="border-t border-border/50 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm">
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
