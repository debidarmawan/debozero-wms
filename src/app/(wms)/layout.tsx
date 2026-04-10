'use client';

import type { ReactNode } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';

export default function WmsShellLayout({ children }: { children: ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
