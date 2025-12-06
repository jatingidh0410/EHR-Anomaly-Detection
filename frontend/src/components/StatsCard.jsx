export default function StatsCard({ icon, label, value, color = 'cyan', trend }) {
  const colorClasses = {
    cyan: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30',
    green: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    red: 'from-red-500/20 to-rose-500/20 border-red-500/30',
    amber: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
  };

  const valueClasses = {
    cyan: 'text-cyan-400',
    green: 'text-green-400',
    red: 'text-red-400',
    amber: 'text-amber-400',
  };

  return (
    <div className={`card-base p-6 animate-fade-in bg-linear-to-br ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">{label}</span>
        {icon && <div className="text-2xl">{icon}</div>}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className={`text-3xl font-bold ${valueClasses[color]}`}>{value}</div>
          {trend && <p className="text-xs text-slate-400 mt-1">{trend}</p>}
        </div>
      </div>
    </div>
  );
}
