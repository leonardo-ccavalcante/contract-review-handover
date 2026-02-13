interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  delta?: number;        // positive/negative change
  deltaLabel?: string;
  icon: React.ReactNode;
  iconBg?: string;       // tailwind class e.g. "bg-bolt-green-light"
}

export function KPICard({ title, value, subtitle, delta, deltaLabel, icon, iconBg = 'bg-bolt-green-light' }: KPICardProps) {
  return (
    <div className="kpi-card">
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-lg ${iconBg}`}>{icon}</div>
        {delta !== undefined && (
          <span className={`text-xs font-semibold ${delta >= 0 ? 'text-bolt-green-dark' : 'text-red-500'}`}>
            {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        {(subtitle || deltaLabel) && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle ?? deltaLabel}</p>
        )}
      </div>
    </div>
  );
}
