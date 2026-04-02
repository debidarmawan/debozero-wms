'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊', roles: ['admin', 'manager', 'staff'] },
  { label: 'Inventory', href: '/dashboard/inventory', icon: '📦', roles: ['admin', 'manager', 'staff'] },
  { label: 'Orders', href: '/dashboard/orders', icon: '📋', roles: ['admin', 'manager', 'staff'] },
  { label: 'Shipments', href: '/dashboard/shipments', icon: '🚚', roles: ['admin', 'manager', 'staff'] },
  { label: 'Products', href: '/dashboard/products', icon: '🏷️', roles: ['admin', 'manager'] },
  { label: 'Warehouses', href: '/dashboard/warehouses', icon: '🏭', roles: ['admin', 'manager'] },
  { label: 'Users', href: '/dashboard/users', icon: '👥', roles: ['admin'] },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Get user info from localStorage
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setUserRole(userData.role);
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const filteredNavItems = navItems.filter(item => !item.roles || item.roles.includes(userRole));

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`${isOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex items-center justify-between">
          <h1 className={`font-bold text-xl transition-all ${isOpen ? 'opacity-100' : 'opacity-0'}`}>WMS</h1>
          <button onClick={() => setIsOpen(!isOpen)} className="p-1 hover:bg-gray-800 rounded">
            ☰
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {filteredNavItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-4 py-3 hover:bg-gray-800 transition-colors text-sm"
            >
              <span className="text-xl">{item.icon}</span>
              <span className={`ml-3 transition-all ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-gray-800 p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 hover:bg-gray-800 rounded transition-colors text-sm"
          >
            <span className="text-xl">🚪</span>
            <span className={`ml-3 transition-all ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow">
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-800">Warehouse Management System</h2>
            <div className="text-sm text-gray-600">
              Role: <span className="font-semibold">{userRole}</span>
            </div>
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
