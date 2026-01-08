import React, { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';

const formatNumber = (value = 0) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue.toLocaleString() : '0';
};

const TimelineTooltip = ({ active, payload, label, isBestMonth }) => {
  if (!active || !payload?.length) return null;

  const visiblePayload = payload.filter((item) => item?.name);

  return (
    <div className="rounded-xl bg-white px-4 py-3 shadow-lg border border-slate-100 max-w-xs">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        {isBestMonth && (
          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
            Best month
          </span>
        )}
      </div>
      <div className="space-y-2">
        {visiblePayload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-slate-500">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}
            </span>
            <span className="font-semibold text-slate-800">{formatNumber(entry.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ActivityTimeline = ({ data = [], bestMonths = [] }) => {
  const hasData = data.length > 0;

  const { enhancedData, totals, averages, bestMonthSet } = useMemo(() => {
    if (!hasData) {
      return {
        enhancedData: [],
        totals: { posts: 0, comments: 0, upvotes: 0 },
        averages: { posts: 0 },
        bestMonthSet: new Set()
      };
    }

    const bestSet = new Set(bestMonths);
    const totalsAccumulator = data.reduce(
      (acc, month) => ({
        posts: acc.posts + (month.posts || 0),
        comments: acc.comments + (month.comments || 0),
        upvotes: acc.upvotes + (month.upvotes || 0)
      }),
      { posts: 0, comments: 0, upvotes: 0 }
    );

    const enhanced = data.map((month) => {
      const posts = month.posts || 0;
      const comments = month.comments || 0;
      const upvotes = month.upvotes || 0;
      return {
        ...month,
        totalEngagement: posts + comments + upvotes,
        isBestMonth: bestSet.has(month.label)
      };
    });

    return {
      enhancedData: enhanced,
      totals: totalsAccumulator,
      averages: {
        posts: Math.round(totalsAccumulator.posts / data.length || 0)
      },
      bestMonthSet: bestSet
    };
  }, [data, bestMonths, hasData]);

  if (!hasData) {
    return (
      <div className="insightCard">
        <p className="text-gray-500 text-center">Not enough data to build the timeline yet.</p>
      </div>
    );
  }

  const summaryChips = [
    {
      label: 'Total posts',
      value: formatNumber(totals.posts),
      classes: 'border',
      style: { backgroundColor: '#F0D8B8', color: '#C47566', borderColor: '#E6B794' }
    },
    {
      label: 'Total comments',
      value: formatNumber(totals.comments),
      classes: 'border',
      style: { backgroundColor: '#E6B794', color: '#C47566', borderColor: '#F0D8B8' }
    },
    {
      label: 'Total upvotes',
      value: formatNumber(totals.upvotes),
      classes: 'border',
      style: { backgroundColor: '#F0D8B8', color: '#C47566', borderColor: '#E6B794' }
    }
  ];

  return (
    <div className="insightCard">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">User Activity Timeline</h3>
          <p className="text-sm text-gray-500">
            Combined view of posts, comments and upvotes with best-performing highlights
          </p>
        </div>
        {bestMonths.length > 0 && (
          <div className="flex gap-2 flex-wrap justify-end">
            {bestMonths.map((month) => (
              <span key={month} className="badge badge-best">
                ⭐ {month}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {summaryChips.map((chip) => (
          <div
            key={chip.label}
            className={`px-3 py-2 rounded-xl text-sm font-medium ${chip.classes}`}
            style={chip.style}
          >
            <span className="block text-xs uppercase opacity-70 tracking-wide">{chip.label}</span>
            <span className="text-base">{chip.value}</span>
          </div>
        ))}
        <div className="px-3 py-2 rounded-xl bg-slate-50 text-slate-700 border border-slate-100 text-sm font-medium">
          <span className="block text-xs uppercase opacity-70 tracking-wide">Avg. posts / month</span>
          <span className="text-base">{formatNumber(averages.posts)}</span>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer>
          <ComposedChart data={enhancedData}>
            <defs>
              <linearGradient id="timelineEngagementGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F0D8B8" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#F3F0E9" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="label" stroke="#94a3b8" tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: 'rgba(99,102,241,0.08)' }}
              content={({ active, payload, label }) => (
                <TimelineTooltip
                  active={active}
                  payload={payload}
                  label={label}
                  isBestMonth={bestMonthSet.has(label)}
                />
              )}
            />
            <Legend />

            <Area
              type="monotone"
              dataKey="totalEngagement"
              name="Total engagement"
              stroke="#C47566"
              fillOpacity={1}
              fill="url(#timelineEngagementGradient)"
              strokeWidth={2}
            />
            <Bar dataKey="posts" name="Posts" radius={[6, 6, 0, 0]} barSize={32}>
              {enhancedData.map((entry, index) => (
                <Cell
                  key={`cell-${entry.label}-${index}`}
                  fill={entry.isBestMonth ? '#E6B794' : '#C47566'}
                />
              ))}
            </Bar>
            <Line
              dataKey="comments"
              name="Comments"
              type="monotone"
              stroke="#E6B794"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
            />
            <Line
              dataKey="upvotes"
              name="Upvotes"
              type="monotone"
              stroke="#F0D8B8"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
            />
            <ReferenceLine
              y={averages.posts}
              stroke="#C47566"
              strokeDasharray="6 6"
              label={{ value: 'Avg posts', position: 'insideRight', fill: '#C47566', fontSize: 12 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ActivityTimeline;

