'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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

        // Fetch basic stats (replace with actual API calls later)
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
      <DashboardLayout>
        <div className="text-center">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon="📋"
            color="bg-blue-100"
          />
          <StatCard
            title="Products"
            value={stats.totalProducts}
            icon="🏷️"
            color="bg-green-100"
          />
          <StatCard
            title="Warehouses"
            value={stats.totalWarehouses}
            icon="🏭"
            color="bg-yellow-100"
          />
          <StatCard
            title="Low Stock Items"
            value={stats.lowStockItems}
            icon="⚠️"
            color="bg-red-100"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionButton label="Create Order" href="/dashboard/orders" icon="📝" />
            <QuickActionButton label="Add Product" href="/dashboard/products" icon="➕" />
            <QuickActionButton label="Check Inventory" href="/dashboard/inventory" icon="📦" />
            <QuickActionButton label="Track Shipment" href="/dashboard/shipments" icon="🚚" />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Activity</h2>
          <div className="text-gray-600 text-center py-8">
            No recent activity
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
}) {
  return (
    <div className={`${color} rounded-lg shadow p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <span className="text-4xl">{icon}</span>
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
  icon: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center justify-center space-x-2 p-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
    >
      <span className="text-2xl">{icon}</span>
      <span className="font-semibold text-gray-700">{label}</span>
    </a>
  );
}
