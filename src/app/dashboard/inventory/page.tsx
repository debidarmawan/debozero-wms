import { DashboardPageHeader } from '@/app/dashboard/_components/DashboardPageHeader';
import { Boxes } from 'lucide-react';

export default function DashboardInventoryPage() {
  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Inventory"
        description="Stock levels per warehouse and low-stock alerts."
        icon={Boxes}
        iconClassName="bg-violet-100 text-violet-700"
      />
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center text-slate-500">
        Inventory list and filters will appear here.
      </div>
    </div>
  );
}
