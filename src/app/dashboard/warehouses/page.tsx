import { DashboardPageHeader } from '@/app/dashboard/_components/DashboardPageHeader';
import { Warehouse } from 'lucide-react';

export default function DashboardWarehousesPage() {
  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Warehouses"
        description="Locations, capacity, and assigned users."
        icon={Warehouse}
        iconClassName="bg-orange-100 text-orange-700"
      />
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center text-slate-500">
        Warehouse directory will appear here.
      </div>
    </div>
  );
}
