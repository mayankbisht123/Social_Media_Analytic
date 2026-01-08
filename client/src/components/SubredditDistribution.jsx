import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Label } from 'recharts';

const colors = ['#C47566', '#E6B794', '#F0D8B8', '#d4a574', '#b8956a'];

const formatPercent = (value = 0) => `${Number(value || 0).toFixed(0)}%`;

const DistributionTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const { name, value } = payload[0];

  return (
    <div className="rounded-xl bg-white px-4 py-3 shadow-lg border border-slate-100 max-w-xs">
      <p className="text-sm font-semibold text-slate-800">{name}</p>
      <p className="text-xs text-slate-500 mt-1">Share of your posts</p>
      <p className="text-lg font-bold mt-2" style={{ color: '#C47566' }}>{formatPercent(value)}</p>
    </div>
  );
};

const SubredditDistribution = ({ data = [] }) => {
  const hasData = data.length > 0;

  const { chartData, topSubreddit, coverage, remainingShare } = useMemo(() => {
    if (!hasData) {
      return {
        chartData: [],
        topSubreddit: null,
        coverage: 0,
        remainingShare: 0
      };
    }

    const sorted = [...data].sort((a, b) => b.value - a.value);
    const top = sorted[0];
    const coveredShare = sorted.reduce((sum, item) => sum + item.value, 0);

    return {
      chartData: sorted,
      topSubreddit: top,
      coverage: coveredShare,
      remainingShare: Math.max(0, 100 - coveredShare)
    };
  }, [data, hasData]);

  if (!hasData) {
    return (
      <div className="insightCard">
        <p className="text-gray-500 text-center">We need more posts to build a distribution.</p>
      </div>
    );
  }

  return (
    <div className="insightCard">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Subreddit Distribution</h3>
          <p className="text-sm text-gray-500">Where your content lives the most</p>
        </div>
        {topSubreddit && (
          <div className="text-sm font-medium rounded-lg px-3 py-1.5" style={{ color: '#C47566', backgroundColor: '#F0D8B8', borderColor: '#E6B794', borderWidth: '1px', borderStyle: 'solid' }}>
            Top: {topSubreddit.name} ({formatPercent(topSubreddit.value)})
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="px-4 py-3 rounded-xl bg-slate-50 text-slate-700 border border-slate-100 text-sm">
          <span className="block text-xs uppercase opacity-70 tracking-wide">Coverage</span>
          <span className="text-lg font-semibold">
            {formatPercent(coverage)} of recent posts
          </span>
        </div>
        <div className="px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 text-sm">
          <span className="block text-xs uppercase opacity-70 tracking-wide">Subreddits tracked</span>
          <span className="text-lg font-semibold">{chartData.length}</span>
        </div>
        <div className="px-4 py-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 text-sm">
          <span className="block text-xs uppercase opacity-70 tracking-wide">Untracked</span>
          <span className="text-lg font-semibold">{formatPercent(remainingShare)}</span>
        </div>
      </div>

      <div className="h-72 flex items-center justify-between gap-6">
        <div className="flex-1 h-full" style={{ minWidth: 0, position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="75%"
                paddingAngle={2}
                startAngle={90}
                endAngle={-270}
              >
                {chartData.map((entry, index) => (
                  <Cell key={entry.name} fill={colors[index % colors.length]} />
                ))}
                <Label
                  position="center"
                  content={({ viewBox }) => {
                    if (!viewBox || !topSubreddit) return null;
                    const { cx, cy } = viewBox;
                    return (
                      <g>
                        <text x={cx} y={cy - 6} textAnchor="middle" className="text-sm" fill="#C47566">
                          Top share
                        </text>
                        <text
                          x={cx}
                          y={cy + 12}
                          textAnchor="middle"
                          className="text-lg font-semibold"
                          fill="#C47566"
                        >
                          {formatPercent(topSubreddit.value)}
                        </text>
                      </g>
                    );
                  }}
                />
              </Pie>
              <Tooltip content={<DistributionTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-3">
          {chartData.map((entry, index) => (
            <div key={entry.name} className="p-3 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="font-semibold text-slate-700">{entry.name}</span>
                <span className="ml-auto text-sm text-slate-500">{formatPercent(entry.value)}</span>
              </div>
              <div className="mt-2 w-full bg-slate-100 rounded-full h-2">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${entry.value}%`,
                    backgroundColor: colors[index % colors.length]
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubredditDistribution;

