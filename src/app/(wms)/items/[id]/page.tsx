'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { DashboardPageHeader } from '@/components/DashboardPageHeader';
import type { ApiResponse } from '@/types';
import {
  ArrowLeft,
  Loader2,
  Package,
  Pencil,
  X,
  Save,
  Warehouse,
} from 'lucide-react';

type WarehouseBrief = {
  id: string;
  name: string;
  city: string;
  location: string;
};

type InventoryRow = {
  id: string;
  quantity: number;
  min_stock: number;
  last_restocked: string;
  warehouse: WarehouseBrief;
};

type ItemDetail = {
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
  warehouse: WarehouseBrief | null;
  specification: string | null;
  remark: string | null;
  created_at: string;
  updated_at: string;
  inventories: InventoryRow[];
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

function itemToForm(item: ItemDetail): FormState {
  return {
    code: item.code,
    name: item.name,
    status: item.status,
    item_type_id: item.item_type_id ?? '',
    control_stock: item.control_stock,
    safety_stock: item.safety_stock,
    minimum_order_quantity: item.minimum_order_quantity,
    lead_time_in_days: item.lead_time_in_days,
    warehouse_id: item.warehouse_id ?? '',
    specification: item.specification ?? '',
    remark: item.remark ?? '',
  };
}

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : '';

  const [item, setItem] = useState<ItemDetail | null>(null);
  const [warehouses, setWarehouses] = useState<WarehouseBrief[]>([]);
  const [form, setForm] = useState<FormState | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const authHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return { Authorization: `Bearer ${token}` } as Record<string, string>;
  }, []);

  const loadWarehouses = useCallback(async () => {
    const headers = authHeaders();
    if (!headers) return;
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
      /* daftar gudang opsional untuk dropdown */
    }
  }, [authHeaders, router]);

  const loadItem = useCallback(async () => {
    if (!id) return;
    const headers = authHeaders();
    if (!headers) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/items/${id}`, { headers });
      const json: ApiResponse<ItemDetail> = await res.json();

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      if (res.status === 404 || !json.success || !json.data) {
        setError(json.error || json.message || 'Item tidak ditemukan');
        setItem(null);
        setForm(null);
        return;
      }

      setItem(json.data);
      setForm(itemToForm(json.data));
      setEditing(false);
      setSaveError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat item');
      setItem(null);
      setForm(null);
    } finally {
      setLoading(false);
    }
  }, [id, authHeaders, router]);

  useEffect(() => {
    loadWarehouses();
  }, [loadWarehouses]);

  useEffect(() => {
    loadItem();
  }, [loadItem]);

  const startEdit = () => {
    if (!item) return;
    setForm(itemToForm(item));
    setEditing(true);
    setSaveError(null);
  };

  const cancelEdit = () => {
    if (item) setForm(itemToForm(item));
    setEditing(false);
    setSaveError(null);
  };

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  };

  const buildPayload = (): Record<string, unknown> => {
    if (!form || !item) return {};
    const payload: Record<string, unknown> = {};

    if (form.code !== item.code) payload.code = form.code.trim();
    if (form.name !== item.name) payload.name = form.name.trim();
    if (form.status !== item.status) payload.status = form.status;
    const prevType = item.item_type_id ?? '';
    if (form.item_type_id.trim() !== prevType) {
      payload.item_type_id = form.item_type_id.trim()
        ? form.item_type_id.trim()
        : null;
    }
    if (form.control_stock !== item.control_stock) {
      payload.control_stock = form.control_stock;
    }
    if (form.safety_stock !== item.safety_stock) {
      payload.safety_stock = form.safety_stock;
    }
    if (form.minimum_order_quantity !== item.minimum_order_quantity) {
      payload.minimum_order_quantity = form.minimum_order_quantity;
    }
    if (form.lead_time_in_days !== item.lead_time_in_days) {
      payload.lead_time_in_days = form.lead_time_in_days;
    }
    const prevWh = item.warehouse_id ?? '';
    if (form.warehouse_id !== prevWh) {
      payload.warehouse_id = form.warehouse_id ? form.warehouse_id : null;
    }
    const prevSpec = item.specification ?? '';
    if (form.specification !== prevSpec) {
      payload.specification = form.specification.trim()
        ? form.specification.trim()
        : null;
    }
    const prevRemark = item.remark ?? '';
    if (form.remark !== prevRemark) {
      payload.remark = form.remark.trim() ? form.remark.trim() : null;
    }

    return payload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !form || !item) return;

    const payload = buildPayload();
    if (Object.keys(payload).length === 0) {
      setEditing(false);
      return;
    }

    const headers = authHeaders();
    if (!headers) {
      router.push('/login');
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const res = await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json: ApiResponse<ItemDetail> = await res.json();

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      if (!json.success) {
        setSaveError(json.error || json.message || 'Gagal menyimpan');
        return;
      }

      await loadItem();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Gagal menyimpan');
    } finally {
      setSaving(false);
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
        title={item ? item.code : 'Detail item'}
        description={
          item
            ? item.name
            : 'Memuat data master item, stok per gudang, dan pengubahan data.'
        }
        icon={Package}
        iconClassName="bg-emerald-100 text-emerald-700"
      />

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-6 text-center text-sm text-rose-800">
          {error}
        </div>
      ) : loading || !item || !form ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/90 py-20 text-slate-500 shadow-sm">
          <Loader2 className="size-5 animate-spin" />
          Memuat detail…
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
                <h2 className="text-sm font-semibold text-slate-800">
                  Data master
                </h2>
                {!editing ? (
                  <button
                    type="button"
                    onClick={startEdit}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                  >
                    <Pencil className="size-4" strokeWidth={2} />
                    Ubah
                  </button>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                    >
                      <X className="size-4" strokeWidth={2} />
                      Batal
                    </button>
                    <button
                      type="submit"
                      form="item-edit-form"
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-700 disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Save className="size-4" strokeWidth={2} />
                      )}
                      Simpan
                    </button>
                  </div>
                )}
              </div>

              {saveError ? (
                <div className="border-b border-rose-100 bg-rose-50/80 px-4 py-3 text-sm text-rose-800">
                  {saveError}
                </div>
              ) : null}

              <form id="item-edit-form" onSubmit={handleSubmit} className="p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Kode (SKU)">
                    {editing ? (
                      <input
                        required
                        value={form.code}
                        onChange={(e) => updateField('code', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                      />
                    ) : (
                      <p className="font-mono text-sm text-slate-800">{item.code}</p>
                    )}
                  </Field>
                  <Field label="Status">
                    {editing ? (
                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={form.status}
                          onChange={(e) => updateField('status', e.target.checked)}
                          className="size-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500/30"
                        />
                        Aktif
                      </label>
                    ) : (
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          item.status
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {item.status ? 'Aktif' : 'Nonaktif'}
                      </span>
                    )}
                  </Field>
                  <Field label="Nama" className="sm:col-span-2">
                    {editing ? (
                      <input
                        required
                        value={form.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                      />
                    ) : (
                      <p className="text-sm text-slate-800">{item.name}</p>
                    )}
                  </Field>
                  <Field label="Item type ID">
                    {editing ? (
                      <input
                        value={form.item_type_id}
                        onChange={(e) =>
                          updateField('item_type_id', e.target.value)
                        }
                        placeholder="Opsional"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                      />
                    ) : (
                      <p className="text-sm text-slate-700">
                        {item.item_type_id ?? '—'}
                      </p>
                    )}
                  </Field>
                  <Field label="Gudang default">
                    {editing ? (
                      <select
                        value={form.warehouse_id}
                        onChange={(e) =>
                          updateField('warehouse_id', e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                      >
                        <option value="">Tidak ada</option>
                        {warehouses.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name} — {w.city}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm text-slate-700">
                        {item.warehouse?.name ??
                          warehouses.find((w) => w.id === item.warehouse_id)
                            ?.name ??
                          item.warehouse_id ??
                          '—'}
                      </p>
                    )}
                  </Field>
                  <Field label="Kontrol stok">
                    {editing ? (
                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={form.control_stock}
                          onChange={(e) =>
                            updateField('control_stock', e.target.checked)
                          }
                          className="size-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500/30"
                        />
                        Ya
                      </label>
                    ) : (
                      <p className="text-sm text-slate-700">
                        {item.control_stock ? 'Ya' : 'Tidak'}
                      </p>
                    )}
                  </Field>
                  <Field label="Safety stock">
                    {editing ? (
                      <input
                        type="number"
                        min={0}
                        value={form.safety_stock}
                        onChange={(e) =>
                          updateField(
                            'safety_stock',
                            Number.parseInt(e.target.value, 10) || 0
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm tabular-nums text-slate-800 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                      />
                    ) : (
                      <p className="text-sm tabular-nums text-slate-800">
                        {item.safety_stock}
                      </p>
                    )}
                  </Field>
                  <Field label="MOQ">
                    {editing ? (
                      <input
                        type="number"
                        min={1}
                        value={form.minimum_order_quantity}
                        onChange={(e) =>
                          updateField(
                            'minimum_order_quantity',
                            Math.max(
                              1,
                              Number.parseInt(e.target.value, 10) || 1
                            )
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm tabular-nums text-slate-800 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                      />
                    ) : (
                      <p className="text-sm tabular-nums text-slate-800">
                        {item.minimum_order_quantity}
                      </p>
                    )}
                  </Field>
                  <Field label="Lead time (hari)">
                    {editing ? (
                      <input
                        type="number"
                        min={0}
                        value={form.lead_time_in_days}
                        onChange={(e) =>
                          updateField(
                            'lead_time_in_days',
                            Number.parseInt(e.target.value, 10) || 0
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm tabular-nums text-slate-800 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                      />
                    ) : (
                      <p className="text-sm tabular-nums text-slate-800">
                        {item.lead_time_in_days} hari
                      </p>
                    )}
                  </Field>
                  <Field label="Spesifikasi" className="sm:col-span-2">
                    {editing ? (
                      <textarea
                        value={form.specification}
                        onChange={(e) =>
                          updateField('specification', e.target.value)
                        }
                        rows={3}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                        placeholder="Opsional"
                      />
                    ) : (
                      <p className="whitespace-pre-wrap text-sm text-slate-700">
                        {item.specification?.trim() ? item.specification : '—'}
                      </p>
                    )}
                  </Field>
                  <Field label="Catatan" className="sm:col-span-2">
                    {editing ? (
                      <textarea
                        value={form.remark}
                        onChange={(e) => updateField('remark', e.target.value)}
                        rows={2}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                        placeholder="Opsional"
                      />
                    ) : (
                      <p className="whitespace-pre-wrap text-sm text-slate-700">
                        {item.remark?.trim() ? item.remark : '—'}
                      </p>
                    )}
                  </Field>
                </div>

                <dl className="mt-6 grid gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500 sm:grid-cols-2">
                  <div>
                    <dt className="font-medium text-slate-400">Dibuat</dt>
                    <dd>{formatDate(item.created_at)}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-400">Diperbarui</dt>
                    <dd>{formatDate(item.updated_at)}</dd>
                  </div>
                </dl>
              </form>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 p-4">
              <Warehouse className="size-4 text-cyan-600" strokeWidth={2} />
              <h2 className="text-sm font-semibold text-slate-800">
                Stok per gudang
              </h2>
            </div>
            <div className="p-4">
              {item.inventories.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Belum ada catatan inventori untuk item ini.
                </p>
              ) : (
                <ul className="space-y-3">
                  {item.inventories.map((inv) => (
                    <li
                      key={inv.id}
                      className="rounded-xl border border-slate-100 bg-slate-50/80 p-3"
                    >
                      <p className="text-sm font-medium text-slate-800">
                        {inv.warehouse.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {inv.warehouse.city} · {inv.warehouse.location}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                        <span>
                          Qty:{' '}
                          <strong className="tabular-nums text-slate-800">
                            {inv.quantity}
                          </strong>
                        </span>
                        <span>
                          Min:{' '}
                          <strong className="tabular-nums text-slate-800">
                            {inv.min_stock}
                          </strong>
                        </span>
                        <span className="text-slate-500">
                          Restock: {formatDate(inv.last_restocked)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
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
