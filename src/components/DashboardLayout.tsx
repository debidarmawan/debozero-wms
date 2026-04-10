'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Boxes,
  ClipboardList,
  Truck,
  Tags,
  Warehouse,
  Users,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} />, roles: ['admin', 'manager', 'staff'] },
  { label: 'Inventory', href: '/dashboard/inventory', icon: <Boxes size={18} />, roles: ['admin', 'manager', 'staff'] },
  { label: 'Orders', href: '/dashboard/orders', icon: <ClipboardList size={18} />, roles: ['admin', 'manager', 'staff'] },
  { label: 'Shipments', href: '/dashboard/shipments', icon: <Truck size={18} />, roles: ['admin', 'manager', 'staff'] },
  { label: 'Items', href: '/dashboard/items', icon: <Tags size={18} />, roles: ['admin', 'manager'] },
  { label: 'Warehouses', href: '/dashboard/warehouses', icon: <Warehouse size={18} />, roles: ['admin', 'manager'] },
  { label: 'Users', href: '/dashboard/users', icon: <Users size={18} />, roles: ['admin'] },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Get user info from localStorage on mount only
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!token || !user) {
      router.push('/login');
      return;
    }
    
    try {
      const userData = JSON.parse(user);
      setUserRole(userData.role);
    } catch (error) {
      console.error('Failed to parse user data:', error);
      router.push('/login');
    }
  }, []); // Empty dependency array - run only once on mount

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const filteredNavItems = navItems.filter(item => !item.roles || item.roles.includes(userRole));

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 text-slate-800">
      {/* Sidebar */}
      <aside className={`${isOpen ? 'w-64' : 'w-20'} border-r border-white/60 bg-slate-900/95 text-slate-100 shadow-2xl backdrop-blur transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-slate-700/60">
          {isOpen && (
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-cyan-300" />
              <h1 className="font-semibold tracking-wide">WMS Console</h1>
            </div>
          )}
          <button onClick={() => setIsOpen(!isOpen)} className={`rounded-lg p-2 hover:bg-slate-800 transition-colors ${!isOpen && 'mx-auto'}`}>
            {isOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          {filteredNavItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="group mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-200 transition-all hover:bg-cyan-500/20 hover:text-cyan-200"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/70 text-cyan-200 group-hover:bg-cyan-500/20">
                {item.icon}
              </span>
              <span className={`transition-all ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-slate-700/60 p-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-rose-200 transition-colors hover:bg-rose-500/15"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/20">
              <LogOut size={18} />
            </span>
            <span className={`transition-all ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-slate-200/70 bg-white/70 backdrop-blur">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-800">Warehouse Management System</h2>
              <div className="text-sm text-slate-500">
                Role: <span className="font-semibold capitalize text-cyan-700">{userRole}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 shadow-sm transition-colors hover:bg-rose-50"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
