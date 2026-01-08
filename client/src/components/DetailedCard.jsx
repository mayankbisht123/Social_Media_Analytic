import React, { useState, useContext, useEffect, useRef, useMemo } from "react";
import dashContext from "../context/dashContext";

const DetailedCard = ({ type,currentMonth, last12Months }) => {
  const [selectedMetric, setSelectedMetric] = useState("overview");
  const [barWidths, setBarWidths] = useState({});
  const animationKey = useRef(0);
  const {
    analytics,
    engagementRate,
    immersionScore,
  } = useContext(dashContext);

  const chartEngamentData = useMemo(() => {
    if (!last12Months || last12Months.length === 0)
      return null;
    return last12Months.map((m) => (
      {
        month: m.month,
        engagementRate: Number(engagementRate(m))
      }))
  },[last12Months,engagementRate])

  const chartImmersionData=useMemo(()=>{
    if(!last12Months || last12Months.length===0)
    return null

    return last12Months.map((m)=>({
      month:m.month,
      immersionScore:Number(immersionScore(m))
    }))
  },[last12Months,immersionScore])

  // Reset and animate bars when switching to trends tab
  useEffect(() => {
    if (selectedMetric === "trends") {
      animationKey.current += 1;
      // Reset all bars to 0%
      setBarWidths({});

      // Get current metric data based on type
      const currentData =
        type === "engagement"
          ? chartEngamentData && chartEngamentData.length > 0
            ? chartEngamentData.map((item, index) => ({
              month: item.month,
              value: parseFloat(item.engagementRate) || 0,
            }))
            : []
          : chartImmersionData && chartImmersionData.length > 0
            ? chartImmersionData.map((item, index) => ({
              month: item.month,
              value: parseFloat(item.immersionScore) || 0,
            }))
            : [];

      if (currentData.length > 0) {
        const maxValue = Math.max(
          ...currentData.map((item) => Number(item.value) || 0)
        );
        const minValue = Math.min(
          ...currentData.map((item) => Number(item.value) || 0)
        );
        const range = maxValue - minValue || 1;

        // Animate each bar with a delay
        currentData.forEach((item, index) => {
          const normalizedValue =
            range > 0 ? ((Number(item.value) - minValue) / range) * 100 : 50;

          setTimeout(() => {
            setBarWidths((prev) => ({
              ...prev,
              [`${animationKey.current}-${index}`]: normalizedValue,
            }));
          }, index * 150); // Staggered animation
        });
      }
    }
  }, [selectedMetric, type, chartEngamentData, chartImmersionData]);

  const getMetrics = () => {
    if (type === "engagement") {
      return {
        overview: {
          title: "Engagement Overview",
          description: "Complete breakdown of your engagement metrics",
          data: [
            {
              label: "Engagement Rate",
              value: `${engagementRate(currentMonth)}%`,
              color: "bg-emerald-500",
            },
            {
              label: "Total Upvotes",
              value: currentMonth?currentMonth.totalLikes.toLocaleString():'0',
              color: "bg-slate-600",
            },
            {
              label: "Comments",
              value: currentMonth?currentMonth.totalComments.toLocaleString():'0',
              color: "bg-blue-600",
            },
            {
              label: "Followers",
              value: (analytics?.karma || 0).toLocaleString(),
              color: "bg-teal-500",
            },
          ],
        },
        trends: {
          title: "Engagement Trends",
          description: "How your engagement has evolved over time",
          data:
            chartEngamentData && chartEngamentData.length > 0
              ? chartEngamentData.map((item, index) => ({
                month: item.month,
                value: parseFloat(item.engagementRate) || 0,
                color:
                  index % 2 === 0
                    ? "bg-rose-400"
                    : index % 3 === 0
                      ? "bg-rose-600"
                      : "bg-rose-500",
              }))
              : [],
        },
      };
    } else if (type === "immersion") {
      return {
        overview: {
          title: "Immersion Overview",
          description: "Deep dive into your audience engagement quality",
          data: [
            {
              label: "Immersion Score",
              value: immersionScore(currentMonth),
              color: "bg-teal-500",
            },
            {
              label: "Deep Interactions",
              value: currentMonth?currentMonth.totalReplies.toLocaleString():'0',
              color: "bg-slate-600",
            },
            { label: "Quality Score", value: "8.7/10", color: "bg-amber-500" },
            { label: "Retention Rate", value: "87%", color: "bg-emerald-500" },
          ],
        },
        trends: {
          title: "Immersion Trends",
          description: "How your content depth has improved",
          data:
            chartImmersionData && chartImmersionData.length > 0
              ? chartImmersionData.map((item, index) => ({
                month: item.month,
                value: parseFloat(item.immersionScore) || 0,
                color:
                  index % 2 === 0
                    ? "bg-slate-400"
                    : index % 3 === 0
                      ? "bg-slate-600"
                      : "bg-slate-500",
              }))
              : [],
        },
      };
    }
    return {};
  };

  const metrics = getMetrics();
  const currentMetric = metrics[selectedMetric];

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "trends", label: "Trends", icon: "📈" },
  ];

  // Add shimmer keyframe animation via inline style tag
  useEffect(() => {
    const styleId = "detailed-card-shimmer";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
                @keyframes shimmer {
                    0% { left: -100%; }
                    100% { left: 100%; }
                }
            `;
      document.head.appendChild(style);
    }
    return () => {
      const style = document.getElementById(styleId);
      if (style) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Interactive Tabs */}
      <div className="flex flex-wrap justify-center gap-2 bg-gray-100 p-2 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedMetric(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${selectedMetric === tab.id
                ? "bg-white shadow-lg text-slate-700 transform scale-105"
                : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
              }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            {currentMetric?.title}
          </h3>
          <p className="text-gray-600">{currentMetric?.description}</p>
        </div>

        {/* Overview Content */}
        {selectedMetric === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentMetric?.data.map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600 font-medium">
                    {item.label}
                  </span>
                  <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
                </div>
                <div className="text-3xl font-bold text-gray-800">
                  {item.value}
                </div>
                <div className="mt-2 flex items-center text-emerald-500">
                  <svg
                    className="w-4 h-4 mr-1"
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
                  <span className="text-sm font-medium">
                    +12% from last month
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Trends Content */}
        {selectedMetric === "trends" && (
          <div className="space-y-6">
            {currentMetric?.data && currentMetric.data.length > 0 ? (() => {
              const values = currentMetric.data.map(
                (item) => Number(item.value) || 0
              );
              const maxValue = Math.max(...values);
              const minValue = Math.min(...values);
              const range = maxValue - minValue || 1;

              const getMonthColor = (value) => {
                const normalized =
                  range > 0 ? (value - minValue) / range : 0.5;
                const hue = type === "engagement" ? 345 : 200;
                const saturation = type === "engagement" ? 70 : 65;
                const lightness = 85 - normalized * 35;
                return {
                  backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
                  color: normalized > 0.65 ? "#f8fafc" : "#1f2937",
                };
              };

              return (
                <>
                  <div
                    className={`grid ${currentMetric.data.length <= 6
                        ? "grid-cols-6"
                        : "grid-cols-12"
                      } gap-4`}
                  >
                    {currentMetric.data.map((item, index) => {
                      const numericValue = Number(item.value) || 0;
                      const colors = getMonthColor(numericValue);
                      return (
                        <div key={index} className="text-center">
                          <div
                            className="rounded-lg p-4 mb-2 transition-all duration-300"
                            style={{
                              backgroundColor: colors.backgroundColor,
                              color: colors.color,
                            }}
                          >
                            <div className="text-sm font-semibold mb-1">
                              {item.month}
                            </div>
                            <div className="text-xs opacity-80">
                              {type === "engagement"
                                ? `${numericValue.toFixed(1)}%`
                                : numericValue.toFixed(1)}
                            </div>
                            {type === "engagement" &&
                              typeof item.value === "number" &&
                              item.value > 90 && (
                                <div className="text-xs font-medium mt-1">
                                  Excellent
                                </div>
                              )}
                            {type === "immersion" &&
                              typeof item.value === "number" &&
                              item.value > 8 && (
                                <div className="text-xs font-medium mt-1">
                                  Excellent
                                </div>
                              )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Visual Progress Bars */}
                  <div className="space-y-4">
                    {currentMetric.data.map((item, index) => {
                      const normalizedValue =
                        range > 0
                          ? ((Number(item.value) - minValue) / range) * 100
                          : 50; // Default to 50% if all values are the same

                      const barKey = `${animationKey.current}-${index}`;
                      const currentWidth = barWidths[barKey] ?? 0;

                      return (
                        <div key={index} className="flex items-center gap-4">
                          <span className="w-12 text-sm font-medium text-gray-600">
                            {item.month}
                          </span>
                          <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden relative">
                            <div
                              className={`h-3 rounded-full ${item.color}`}
                              style={{
                                width: `${currentWidth}%`,
                                transition:
                                  "width 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
                                boxShadow:
                                  currentWidth > 0
                                    ? "0 2px 6px rgba(0,0,0,0.15)"
                                    : "none",
                                position: "relative",
                                overflow: "hidden",
                              }}
                            >
                              {/* Shimmer effect */}
                              {currentWidth > 0 && (
                                <div
                                  style={{
                                    position: "absolute",
                                    top: 0,
                                    left: "-100%",
                                    width: "100%",
                                    height: "100%",
                                    background:
                                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                                    animation: "shimmer 2s infinite",
                                  }}
                                />
                              )}
                            </div>
                          </div>
                          <span className="w-12 text-sm font-bold text-gray-800">
                            {type === "engagement"
                              ? `${Number(item.value).toFixed(2)}%`
                              : Number(item.value).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })() : (
              <div className="text-center py-8 text-gray-500">
                <p>
                  No trend data available. Please fetch your analytics data
                  first.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Insights Content */}
        {selectedMetric === "insights" && (
          <div className="space-y-6">
            {currentMetric?.data.map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{item.icon}</div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium mb-2">
                      {item.insight}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${item.impact === "High"
                            ? "bg-green-100 text-green-600"
                            : "bg-yellow-100 text-yellow-600"
                          }`}
                      >
                        {item.impact} Impact
                      </span>
                      <span className="text-sm text-gray-500">
                        Expected improvement: +15-25%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailedCard;
