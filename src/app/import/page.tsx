'use client';

import { useSubscription } from '@/hooks/useSubscription';
import Card from '@/components/ui/Card';
import ManualEntryForm from '@/components/expenses/ManualEntryForm';
import FileUploader from '@/components/expenses/FileUploader';
import UpgradePrompt from '@/components/ui/UpgradePrompt';

export default function ImportPage() {
  const { isFree } = useSubscription();

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Import Expenses</h1>
        <p className="text-sm text-muted mt-1">
          {isFree
            ? 'Add expenses manually — upgrade to PRO for file import'
            : 'Upload CSV, Excel, PDF, JSON, or bank files — or add manually'}
        </p>
        {!isFree && (
          <p className="text-xs text-muted mt-2 italic">
            AI categorization is automated and not a substitute for professional verification.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <Card>
            {isFree ? (
              <UpgradePrompt
                feature="File Import"
                description="Import expenses from CSV, Excel, PDF, JSON, and OFX/QFX bank files with automatic AI categorization."
              />
            ) : (
              <FileUploader />
            )}
          </Card>

          {!isFree && (
            <Card className="mt-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">Supported Formats</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { format: 'CSV', ext: '.csv', hint: 'Columns: date, description, amount, category (optional)' },
                  { format: 'Excel', ext: '.xlsx / .xls', hint: 'Same column layout as CSV; first row should be headers' },
                  { format: 'PDF', ext: '.pdf', hint: 'Bank statements or receipts — AI extracts transactions' },
                  { format: 'JSON', ext: '.json', hint: 'Array of objects with date, description, and amount fields' },
                  { format: 'OFX / QFX', ext: '.ofx / .qfx', hint: 'Open Financial Exchange files from your bank' },
                ].map((f) => (
                  <div key={f.format} className="px-3 py-2.5 rounded-lg bg-muted/20 border border-border/50">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-primary">{f.format}</span>
                      <span className="text-[10px] text-muted">{f.ext}</span>
                    </div>
                    <p className="text-xs text-muted leading-relaxed">{f.hint}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
        <div id="quick-add" className="lg:col-span-2 scroll-mt-8">
          <Card>
            <ManualEntryForm />
          </Card>
        </div>
      </div>
    </div>
  );
}
