export default function Loading() {
  return (
    <div className="flex items-center justify-center py-20" aria-label="Loading">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
