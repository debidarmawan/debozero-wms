import { DashboardPageHeader } from '@/components/DashboardPageHeader';
import { ClipboardList } from 'lucide-react';

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Orders"
        description="Inbound and outbound orders and line items."
        icon={ClipboardList}
        iconClassName="bg-blue-100 text-blue-700"
      />
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center text-slate-500">
        Order management UI will appear here.
      </div>
    </div>
  );
}
