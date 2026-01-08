import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const UserChart = (props) => {
  console.log(props.data)
  return (
    <div className={`
      w-full h-[450px] p-6 rounded-2xl shadow-lg
      bg-gradient-to-br from-white to-slate-50 border border-black/5
      flex flex-col flex-[1_1_45%] min-w-[400px] max-w-[45%]
      hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/15
      transition-all duration-300 ease-in-out
      ${props.style || ''}
    `}>
      <div className="flex items-center mb-6 flex-shrink-0">
        <div
          className="w-8 h-8 mr-3 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #C47566 0%, #E6B794 100%)" }}
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        </div>

        <h3
          className="text-lg font-semibold"
          style={{
            backgroundImage: "linear-gradient(to right, #C47566, #E6B794)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {props.name}
        </h3>
      </div>


      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={props.data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              opacity={0.6}
            />
            <XAxis
              dataKey="month"
              stroke="#64748b"
              fontSize={12}
              fontWeight={500}
              tickMargin={8}
            />
            <YAxis
              domain={[0, (dataMax) => Math.ceil(dataMax)]}
              allowDataOverflow={false}
              stroke="#64748b"
              fontSize={12}
              fontWeight={500}
              tickMargin={8}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(255,255,255,0.95)',
                border: 'none',
                borderRadius: 8,
                boxShadow: '0px 8px 32px rgba(0,0,0,0.12)',
                fontSize: 12
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{
                fontSize: 12,
                color: '#64748b'
              }}
            />
            <Line
              type="monotone"
              name={props.name}
              dataKey={props.dataKey}
              stroke="url(#gradient)"
              strokeWidth={3}
              dot={{
                fill: '#C47566',
                strokeWidth: 2,
                stroke: '#ffffff',
                r: 4
              }}
              activeDot={{
                r: 6,
                stroke: '#ffffff',
                strokeWidth: 2,
                fill: '#C47566'
              }}
            />

            {/* Gradient definition for the line */}
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#C47566" />
                <stop offset="50%" stopColor="#E6B794" />
                <stop offset="100%" stopColor="#F0D8B8" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default UserChart;

