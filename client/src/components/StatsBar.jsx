import React from 'react';

const StatItem = ({ icon, label, value, helper }) => (
  <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex-1 min-w-[160px]">
    <div className="text-5xl">{icon}</div>
    <div>
      <p className="text-xs uppercase tracking-wide text-white/70">{label}</p>
      <p className="text-lg font-semibold text-white">{value}</p>
      {helper && <p className="text-xs text-white/60">{helper}</p>}
    </div>
  </div>
);

const StatsBar = ({ stats = [] }) => {
  if (!stats.length) {
    return null;
  }

  return (
    <div className="realTimeBar gradient-primary text-white rounded-2xl px-6 py-4 mb-10 shadow-xl border border-white/10">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        {stats.map((stat) => (
          <StatItem
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            helper={stat.helper}
          />
        ))}
      </div>
    </div>
  );
};

export default StatsBar;

