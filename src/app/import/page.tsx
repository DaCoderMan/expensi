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
        </div>
        <div className="lg:col-span-2">
          <Card>
            <ManualEntryForm />
          </Card>
        </div>
      </div>
    </div>
  );
}
