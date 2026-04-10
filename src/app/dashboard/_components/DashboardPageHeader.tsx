import { LucideIcon } from 'lucide-react';

type Props = {
  title: string;
  description: string;
  icon: LucideIcon;
  iconClassName?: string;
};

export function DashboardPageHeader({
  title,
  description,
  icon: Icon,
  iconClassName = 'bg-cyan-100 text-cyan-700',
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${iconClassName}`}
        >
          <Icon size={18} />
        </span>
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
    </div>
  );
}
