import { DashboardPageHeader } from '@/components/DashboardPageHeader';
import { Users } from 'lucide-react';

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Users"
        description="Staff accounts and role access."
        icon={Users}
        iconClassName="bg-slate-200 text-slate-800"
      />
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center text-slate-500">
        User administration will appear here.
      </div>
    </div>
  );
}
