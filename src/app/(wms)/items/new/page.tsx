'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardPageHeader } from '@/components/DashboardPageHeader';
import type { ApiResponse } from '@/types';
import { ArrowLeft, Loader2, Package, Save } from 'lucide-react';

type WarehouseBrief = {
  id: string;
  name: string;
  city: string;
};

type ItemCreatePayload = {
  code: string;
  name: string;
  status: boolean;
  item_type_id: string | null;
  control_stock: boolean;
  safety_stock: number;
  minimum_order_quantity: number;
  lead_time_in_days: number;
  warehouse_id: string | null;
  specification: string | null;
  remark: string | null;
};

type ItemCreated = {
  id: string;
};

type FormState = {
  code: string;
  name: string;
  status: boolean;
  item_type_id: string;
  control_stock: boolean;
  safety_stock: number;
  minimum_order_quantity: number;
  lead_time_in_days: number;
  warehouse_id: string;
  specification: string;
  remark: string;
};

const initialForm: FormState = {
  code: '',
  name: '',
  status: true,
  item_type_id: '',
  control_stock: true,
  safety_stock: 0,
  minimum_order_quantity: 1,
  lead_time_in_days: 0,
  warehouse_id: '',
  specification: '',
  remark: '',
};

export default function NewItemPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [warehouses, setWarehouses] = useState<WarehouseBrief[]>([]);
  const [loadingWarehouses, setLoadingWarehouses] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return { Authorization: `Bearer ${token}` } as Record<string, string>;
  }, []);

  const loadWarehouses = useCallback(async () => {
    const headers = authHeaders();
    if (!headers) {
      router.push('/login');
      return;
    }

    setLoadingWarehouses(true);
    try {
      const res = await fetch('/api/warehouses?page=1&limit=100', { headers });
      if (res.status === 401) {
        router.push('/login');
        return;
      }

      const json: ApiResponse<{
        data: WarehouseBrief[];
        pagination: { total: number };
      }> = await res.json();

      if (json.success && json.data?.data) {
        setWarehouses(json.data.data);
      }
    } catch {
      /* daftar gudang opsional */
    } finally {
      setLoadingWarehouses(false);
    }
  }, [authHeaders, router]);

  useEffect(() => {
    loadWarehouses();
  }, [loadWarehouses]);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const buildPayload = (): ItemCreatePayload => {
    return {
      code: form.code.trim(),
      name: form.name.trim(),
      status: form.status,
      item_type_id: form.item_type_id.trim() ? form.item_type_id.trim() : null,
      control_stock: form.control_stock,
      safety_stock: form.safety_stock,
      minimum_order_quantity: form.minimum_order_quantity,
      lead_time_in_days: form.lead_time_in_days,
      warehouse_id: form.warehouse_id ? form.warehouse_id : null,
      specification: form.specification.trim() ? form.specification.trim() : null,
      remark: form.remark.trim() ? form.remark.trim() : null,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const headers = authHeaders();
    if (!headers) {
      router.push('/login');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      const json: ApiResponse<ItemCreated> = await res.json();

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      if (!json.success || !json.data?.id) {
        setError(json.error || json.message || 'Gagal membuat item');
        return;
      }

      router.push(`/items/${json.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat item');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/items"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-cyan-700"
        >
          <ArrowLeft className="size-4" strokeWidth={2} />
          Kembali ke daftar item
        </Link>
      </div>

      <DashboardPageHeader
        title="Tambah item"
        description="Isi data master item baru agar siap digunakan di proses operasional."
        icon={Package}
        iconClassName="bg-emerald-100 text-emerald-700"
      />

      <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
        <div className="border-b border-slate-100 p-4">
          <h2 className="text-sm font-semibold text-slate-800">Form item baru</h2>
        </div>

        {error ? (
          <div className="border-b border-rose-100 bg-rose-50/80 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Kode (SKU)">
              <input
                required
                value={form.code}
                onChange={(e) => updateField('code', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </Field>
            <Field label="Status">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.status}
                  onChange={(e) => updateField('status', e.target.checked)}
                  className="size-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500/30"
                />
                Aktif
              </label>
            </Field>

            <Field label="Nama" className="sm:col-span-2">
              <input
                required
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </Field>

            <Field label="Item type ID">
              <input
                value={form.item_type_id}
                onChange={(e) => updateField('item_type_id', e.target.value)}
                placeholder="Opsional"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </Field>

            <Field label="Gudang default">
              <select
                value={form.warehouse_id}
                onChange={(e) => updateField('warehouse_id', e.target.value)}
                disabled={loadingWarehouses}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:bg-slate-100"
              >
                <option value="">Tidak ada</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} — {w.city}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Kontrol stok">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.control_stock}
                  onChange={(e) => updateField('control_stock', e.target.checked)}
                  className="size-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500/30"
                />
                Ya
              </label>
            </Field>

            <Field label="Safety stock">
              <input
                type="number"
                min={0}
                value={form.safety_stock}
                onChange={(e) =>
                  updateField('safety_stock', Number.parseInt(e.target.value, 10) || 0)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm tabular-nums text-slate-800 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </Field>

            <Field label="MOQ">
              <input
                type="number"
                min={1}
                value={form.minimum_order_quantity}
                onChange={(e) =>
                  updateField(
                    'minimum_order_quantity',
                    Math.max(1, Number.parseInt(e.target.value, 10) || 1)
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm tabular-nums text-slate-800 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </Field>

            <Field label="Lead time (hari)">
              <input
                type="number"
                min={0}
                value={form.lead_time_in_days}
                onChange={(e) =>
                  updateField('lead_time_in_days', Number.parseInt(e.target.value, 10) || 0)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm tabular-nums text-slate-800 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </Field>

            <Field label="Spesifikasi" className="sm:col-span-2">
              <textarea
                value={form.specification}
                onChange={(e) => updateField('specification', e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                placeholder="Opsional"
              />
            </Field>

            <Field label="Catatan" className="sm:col-span-2">
              <textarea
                value={form.remark}
                onChange={(e) => updateField('remark', e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                placeholder="Opsional"
              />
            </Field>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <Link
              href="/items"
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-700 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" strokeWidth={2} />
              )}
              Simpan item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      {children}
    </div>
  );
}
