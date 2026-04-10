'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, startTransition } from 'react';
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
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} strokeWidth={2} />, roles: ['admin', 'manager', 'staff'] },
  { label: 'Items', href: '/items', icon: <Tags size={18} strokeWidth={2} />, roles: ['admin', 'manager'] },
  { label: 'Inventory', href: '/inventory', icon: <Boxes size={18} strokeWidth={2} />, roles: ['admin', 'manager', 'staff'] },
  { label: 'Orders', href: '/orders', icon: <ClipboardList size={18} strokeWidth={2} />, roles: ['admin', 'manager', 'staff'] },
  { label: 'Shipments', href: '/shipments', icon: <Truck size={18} strokeWidth={2} />, roles: ['admin', 'manager', 'staff'] },
  { label: 'Warehouses', href: '/warehouses', icon: <Warehouse size={18} strokeWidth={2} />, roles: ['admin', 'manager'] },
  { label: 'Users', href: '/users', icon: <Users size={18} strokeWidth={2} />, roles: ['admin'] },
];

function getHeaderSectionTitle(pathname: string): string {
  const match = navItems.find(
    (item) =>
      pathname === item.href ||
      (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`))
  );
  return match?.label ?? 'Dashboard';
}

type CollapsedNavFlyout = { label: string; top: number; left: number };

export function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [collapsedFlyout, setCollapsedFlyout] = useState<CollapsedNavFlyout | null>(null);

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
      startTransition(() => {
        setUserRole(userData.role);
      });
    } catch (error) {
      console.error('Failed to parse user data:', error);
      router.push('/login');
    }
  }, [router]);

  const showCollapsedLabel = (label: string, anchor: HTMLElement) => {
    if (isOpen) return;
    const r = anchor.getBoundingClientRect();
    setCollapsedFlyout({
      label,
      top: r.top + r.height / 2,
      left: r.right + 10,
    });
  };

  const hideCollapsedLabel = () => {
    setCollapsedFlyout(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const filteredNavItems = navItems.filter(item => !item.roles || item.roles.includes(userRole));

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 text-slate-800">
      {!isOpen && collapsedFlyout ? (
        <div
          role="tooltip"
          className="pointer-events-none fixed z-[200] max-w-[min(16rem,calc(100vw-6rem))] -translate-y-1/2 truncate rounded-lg border border-slate-600/80 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-100 shadow-xl"
          style={{ top: collapsedFlyout.top, left: collapsedFlyout.left }}
        >
          {collapsedFlyout.label}
        </div>
      ) : null}

      {/* Sidebar */}
      <aside className={`${isOpen ? 'w-64' : 'w-20'} border-r border-white/60 bg-slate-900/95 text-slate-100 shadow-2xl backdrop-blur transition-all duration-300 flex flex-col`}>
        <div className={`flex items-center border-b border-slate-700/60 p-3 ${isOpen ? 'justify-between' : 'justify-center'}`}>
          {isOpen ? (
            <div className="flex min-w-0 flex-1 items-center gap-2 pr-2">
              <Sparkles size={18} className="shrink-0 text-cyan-300" strokeWidth={2} />
              <h1 className="truncate font-semibold tracking-wide">WMS Console</h1>
            </div>
          ) : null}
          <button
            type="button"
            aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            onClick={() => {
              setCollapsedFlyout(null);
              setIsOpen((open) => !open);
            }}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-200 transition-colors hover:bg-slate-800 [&_svg]:block [&_svg]:size-[18px]"
          >
            {isOpen ? <PanelLeftClose size={18} strokeWidth={2} /> : <PanelLeftOpen size={18} strokeWidth={2} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          {filteredNavItems.map(item => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={!isOpen ? item.label : undefined}
                onMouseEnter={(e) => showCollapsedLabel(item.label, e.currentTarget)}
                onMouseLeave={hideCollapsedLabel}
                onFocus={(e) => showCollapsedLabel(item.label, e.currentTarget)}
                onBlur={hideCollapsedLabel}
                className={`group mb-1 flex items-center rounded-xl py-2.5 text-sm transition-all ${
                  isOpen ? 'gap-3 px-3' : 'justify-center px-0'
                } ${
                  isActive
                    ? 'bg-cyan-500/25 text-cyan-100'
                    : 'text-slate-200 hover:bg-cyan-500/20 hover:text-cyan-200'
                }`}
              >
                <span
                  className={`inline-flex size-9 shrink-0 items-center justify-center rounded-lg [&_svg]:block [&_svg]:size-[18px] [&_svg]:shrink-0 ${
                    isActive
                      ? 'bg-cyan-400/20 text-cyan-100'
                      : 'bg-slate-800/70 text-cyan-200 group-hover:bg-cyan-500/20'
                  }`}
                >
                  {item.icon}
                </span>
                {isOpen ? (
                  <span className="min-w-0 flex-1 truncate font-medium leading-none">
                    {item.label}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-700/60 p-2">
          <button
            type="button"
            aria-label={!isOpen ? 'Logout' : undefined}
            onMouseEnter={(e) => showCollapsedLabel('Logout', e.currentTarget)}
            onMouseLeave={hideCollapsedLabel}
            onFocus={(e) => showCollapsedLabel('Logout', e.currentTarget)}
            onBlur={hideCollapsedLabel}
            onClick={handleLogout}
            className={`flex w-full items-center rounded-xl py-2.5 text-sm text-rose-200 transition-colors hover:bg-rose-500/15 ${
              isOpen ? 'gap-3 px-3' : 'justify-center px-0'
            }`}
          >
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-rose-500/20 [&_svg]:block [&_svg]:size-[18px] [&_svg]:shrink-0">
              <LogOut size={18} strokeWidth={2} />
            </span>
            {isOpen ? <span className="min-w-0 flex-1 truncate text-left font-medium leading-none">Logout</span> : null}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-slate-200/70 bg-white/70 backdrop-blur">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-cyan-700">
                {getHeaderSectionTitle(pathname)}
              </p>
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
