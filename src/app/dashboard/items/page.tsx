import { DashboardLayout } from "@/components/DashboardLayout";
import { Tags } from "lucide-react";

export default function DashboardItemsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Tags size={18} />
            </span>
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">Items</h1>
              <p className="text-sm text-slate-500">Manage item catalog and attributes.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
