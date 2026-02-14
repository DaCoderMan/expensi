'use client';

import Card from '@/components/ui/Card';
import ManualEntryForm from '@/components/expenses/ManualEntryForm';
import FileUploader from '@/components/expenses/FileUploader';

export default function ImportPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Import Expenses</h1>
        <p className="text-sm text-muted mt-1">Upload CSV, Excel, PDF, JSON, or bank files — or add manually</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <FileUploader />
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
