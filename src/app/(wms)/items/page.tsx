'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardPageHeader } from '@/components/DashboardPageHeader';
import {
  Tags,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Package,
  ExternalLink,
  Plus,
} from 'lucide-react';
import type { ApiResponse } from '@/types';

type ItemRow = {
  id: string;
  code: string;
  name: string;
  status: boolean;
  item_type_id: string | null;
  control_stock: boolean;
  safety_stock: number;
  minimum_order_quantity: number;
  lead_time_in_days: number;
  warehouse_id: string | null;
  created_at: string;
  updated_at: string;
};

type ListPayload = {
  data: ItemRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export default function ItemsPage() {
  const router = useRouter();
  const [items, setItems] = useState<ItemRow[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [searchInput, setSearchInput] = useState('');
  const [searchApplied, setSearchApplied] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(
    async (page: number, limit: number, search: string) => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });
        if (search.trim()) {
          params.set('search', search.trim());
        }

        const res = await fetch(`/api/items?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json: ApiResponse<ListPayload> = await res.json();

        if (res.status === 401) {
          router.push('/login');
          return;
        }

        if (!json.success || !json.data) {
          setError(json.error || json.message || 'Failed to load items');
          setItems([]);
          return;
        }

        setItems(json.data.data);
        setPagination(json.data.pagination);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load items');
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    fetchItems(pagination.page, pagination.limit, searchApplied);
  }, [fetchItems, pagination.page, pagination.limit, searchApplied]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((p) => ({ ...p, page: 1 }));
    setSearchApplied(searchInput);
  };

  const goPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    setPagination((p) => ({ ...p, page }));
  };

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Items"
        description="Daftar master item di sistem."
        icon={Tags}
        iconClassName="bg-emerald-100 text-emerald-700"
      />

      <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <form onSubmit={handleSearch} className="flex w-full max-w-xl gap-2">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                strokeWidth={2}
              />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cari kode atau nama…"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              Cari
            </button>
          </form>
          <div className="flex items-center gap-3">
            <p className="text-sm text-slate-500">
              Total:{' '}
              <span className="font-semibold text-slate-700">{pagination.total}</span>{' '}
              item
            </p>
            <Link
              href="/items/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-700"
            >
              <Plus className="size-4" strokeWidth={2} />
              Tambah item
            </Link>
          </div>
        </div>

        {error ? (
          <div className="p-6 text-center text-sm text-rose-600">{error}</div>
        ) : loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
            <Loader2 className="size-5 animate-spin" />
            Memuat data…
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-500">
            <Package className="size-10 text-slate-300" strokeWidth={1.5} />
            <p className="text-sm">Belum ada item atau tidak ada hasil pencarian.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 text-center">Aksi</th>
				  <th className="px-4 py-3">Kode</th>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Kontrol stok</th>
                  <th className="px-4 py-3 text-right">Safety stock</th>
                  <th className="px-4 py-3 text-right">MOQ</th>
                  <th className="px-4 py-3 text-right">Lead time</th>
                  <th className="px-4 py-3">Diperbarui</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((row) => (
                  <tr
                    key={row.id}
                    className="transition-colors hover:bg-cyan-50/40"
                  >
                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/items/${row.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-cyan-700 transition-colors hover:border-cyan-200 hover:bg-cyan-50/60"
                      >
                        Detail
                        <ExternalLink className="size-3.5" strokeWidth={2} />
                      </Link>
                    </td>
					<td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-medium text-slate-800">
                      {row.code}
                    </td>
                    <td className="max-w-[220px] px-4 py-3">
                      <span className="line-clamp-2 text-slate-800">{row.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          row.status
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {row.status ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {row.control_stock ? 'Ya' : 'Tidak'}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                      {row.safety_stock}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                      {row.minimum_order_quantity}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                      {row.lead_time_in_days} hari
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                      {formatDate(row.updated_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && pagination.totalPages > 1 ? (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row">
            <p className="text-xs text-slate-500">
              Halaman {pagination.page} dari {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goPage(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="size-4" />
                Sebelumnya
              </button>
              <button
                type="button"
                onClick={() => goPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Berikutnya
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('id-ID', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return '—';
  }
}
