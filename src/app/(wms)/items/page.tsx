import { DashboardPageHeader } from '@/components/DashboardPageHeader';
import { Tags } from 'lucide-react';

export default function ItemsPage() {
  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Items"
        description="Manage item catalog and attributes."
        icon={Tags}
        iconClassName="bg-emerald-100 text-emerald-700"
      />
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center text-slate-500">
        Item CRUD and search will appear here.
      </div>
    </div>
  );
}
