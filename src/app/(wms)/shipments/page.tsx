import { DashboardPageHeader } from '@/components/DashboardPageHeader';
import { Truck } from 'lucide-react';

export default function ShipmentsPage() {
  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Shipments"
        description="Tracking numbers, carriers, and delivery status."
        icon={Truck}
        iconClassName="bg-amber-100 text-amber-700"
      />
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center text-slate-500">
        Shipment tracking will appear here.
      </div>
    </div>
  );
}
