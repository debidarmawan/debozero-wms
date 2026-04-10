'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ClipboardList,
  Tags,
  Warehouse,
  AlertTriangle,
  PlusCircle,
  PackageSearch,
  Truck,
  ArrowRight,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalWarehouses: 0,
    lowStockItems: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        setStats({
          totalOrders: 0,
          totalProducts: 0,
          totalWarehouses: 0,
          lowStockItems: 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/70 p-10 text-center text-slate-600 shadow-sm">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-7 text-white shadow-xl">
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="mt-2 text-cyan-50">
          Track order flow, stock health, and warehouse activity in one place.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={<ClipboardList size={20} />}
          accent="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Items"
          value={stats.totalProducts}
          icon={<Tags size={20} />}
          accent="from-emerald-500 to-green-500"
        />
        <StatCard
          title="Warehouses"
          value={stats.totalWarehouses}
          icon={<Warehouse size={20} />}
          accent="from-amber-500 to-orange-500"
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockItems}
          icon={<AlertTriangle size={20} />}
          accent="from-rose-500 to-red-500"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-slate-800">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <QuickActionButton label="Create Order" href="/orders" icon={<PlusCircle size={18} />} />
          <QuickActionButton label="Add Item" href="/items" icon={<Tags size={18} />} />
          <QuickActionButton label="Check Inventory" href="/inventory" icon={<PackageSearch size={18} />} />
          <QuickActionButton label="Track Shipment" href="/shipments" icon={<Truck size={18} />} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-slate-800">Recent Activity</h2>
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-8 text-center text-slate-500">
          No recent activity
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  accent,
}: {
  title: string;
  value: number;
  icon: ReactNode;
  accent: string;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white/85 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-1 text-3xl font-bold text-slate-800">{value}</p>
        </div>
        <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow ${accent}`}>
          {icon}
        </span>
      </div>
    </div>
  );
}

function QuickActionButton({
  label,
  href,
  icon,
}: {
  label: string;
  href: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 transition-all hover:border-cyan-200 hover:bg-cyan-50/40"
    >
      <span className="inline-flex items-center gap-2">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 group-hover:bg-cyan-100 group-hover:text-cyan-700">
          {icon}
        </span>
        <span className="font-medium">{label}</span>
      </span>
      <ArrowRight size={16} className="text-slate-400 group-hover:text-cyan-600" />
    </Link>
  );
}
