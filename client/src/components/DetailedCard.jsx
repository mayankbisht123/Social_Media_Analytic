import React, { useState, useContext, useEffect, useRef, useMemo } from "react";
import dashContext from "../context/dashContext";

const DetailedCard = ({ type, currentMonth, last12Months, content }) => {
  const [selectedMetric, setSelectedMetric] = useState("overview");
  const [barWidths, setBarWidths] = useState({});
  const animationKey = useRef(0);
  
  const { analytics, engagementRate, immersionScore } = useContext(dashContext);

  const chartEngamentData = useMemo(() => {
    if (!last12Months || last12Months.length === 0) return null;
    return last12Months.map((m) => ({
      month: m.month,
      engagementRate: Number(engagementRate(m))
    }));
  }, [last12Months, engagementRate]);

  const chartImmersionData = useMemo(() => {
    if (!last12Months || last12Months.length === 0) return null;
    return last12Months.map((m) => ({
      month: m.month,
      immersionScore: Number(immersionScore(m))
    }));
  }, [last12Months, immersionScore]);

  useEffect(() => {
    if (selectedMetric === "trends") {
      animationKey.current += 1;
      setBarWidths({});

      const currentData =
        type === "engagement"
          ? chartEngamentData && chartEngamentData.length > 0
            ? chartEngamentData.map((item) => ({ month: item.month, value: item.engagementRate || 0 }))
            : []
          : chartImmersionData && chartImmersionData.length > 0
            ? chartImmersionData.map((item) => ({ month: item.month, value: item.immersionScore || 0 }))
            : [];

      if (currentData.length > 0) {
        const maxValue = Math.max(...currentData.map((item) => Number(item.value) || 0));
        const minValue = Math.min(...currentData.map((item) => Number(item.value) || 0));
        const range = maxValue - minValue || 1;

        currentData.forEach((item, index) => {
          const normalizedValue = range > 0 ? ((Number(item.value) - minValue) / range) * 100 : 50;
          setTimeout(() => {
            setBarWidths((prev) => ({
              ...prev,
              [`${animationKey.current}-${index}`]: normalizedValue,
            }));
          }, index * 150);
        });
      }
    }
  }, [selectedMetric, type, chartEngamentData, chartImmersionData]);

  const getMetrics = () => {
    const baseObj = {
      overview: {
        title: `${content?.title || "Analytics"} Overview`,
        description: content?.description || "",
        data: content?.stats || []
      }
    };

    if (type === "engagement") {
      return {
        ...baseObj,
        trends: {
          title: "Engagement Trends",
          description: "How your engagement has evolved over time",
          data: chartEngamentData && chartEngamentData.length > 0
            ? chartEngamentData.map((item, index) => ({
                month: item.month,
                value: item.engagementRate || 0,
                color: index % 2 === 0 ? "bg-rose-400" : index % 3 === 0 ? "bg-rose-600" : "bg-rose-500",
              }))
            : [],
        },
      };
    } else if (type === "immersion") {
      return {
        ...baseObj,
        trends: {
          title: "Immersion Trends",
          description: "How your content depth has improved",
          data: chartImmersionData && chartImmersionData.length > 0
            ? chartImmersionData.map((item, index) => ({
                month: item.month,
                value: item.immersionScore || 0,
                color: index % 2 === 0 ? "bg-slate-400" : index % 3 === 0 ? "bg-slate-600" : "bg-slate-500",
              }))
            : [],
        },
      };
    }
    return baseObj;
  };

  const metrics = getMetrics();
  const currentMetric = metrics[selectedMetric];

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "trends", label: "Trends", icon: "📈" },
  ];

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
      if (style) document.head.removeChild(style);
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
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              selectedMetric === tab.id
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
                  <span className="text-gray-600 font-medium">{item.label}</span>
                  <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
                </div>
                <div className="text-3xl font-bold text-gray-800">{item.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Trends Content */}
        {selectedMetric === "trends" && (
          <div className="space-y-6">
            {currentMetric?.data && currentMetric.data.length > 0 ? (() => {
              const values = currentMetric.data.map((item) => Number(item.value) || 0);
              const maxValue = Math.max(...values);
              const minValue = Math.min(...values);
              const range = maxValue - minValue || 1;

              const getMonthColor = (value) => {
                const normalized = range > 0 ? (value - minValue) / range : 0.5;
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
                  <div className={`grid ${currentMetric.data.length <= 6 ? "grid-cols-6" : "grid-cols-12"} gap-4`}>
                    {currentMetric.data.map((item, index) => {
                      const numericValue = Number(item.value) || 0;
                      const colors = getMonthColor(numericValue);
                      
                      // Convert absolute value to a 0 to 5 Star Rating based on trend range
                      const starRating = range > 0 ? ((numericValue - minValue) / range) * 5 : 5;

                      return (
                        <div key={index} className="text-center">
                          <div
                            className="rounded-lg p-3 mb-2 transition-all duration-300 flex flex-col items-center"
                            style={{ backgroundColor: colors.backgroundColor, color: colors.color }}
                          >
                            <div className="text-sm font-semibold mb-2">{item.month}</div>
                            
                            {/* SVG Star Renderer */}
                            <div className="flex items-center justify-center gap-0.5 mb-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg 
                                  key={star} 
                                  className={`w-3.5 h-3.5 ${
                                    star <= starRating 
                                      ? "text-yellow-400" 
                                      : star - 0.5 <= starRating 
                                        ? "text-yellow-400 opacity-60" 
                                        : "text-current opacity-20"
                                  }`} 
                                  fill="currentColor" viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            
                            <div className="text-xs font-bold opacity-90">
                              {starRating.toFixed(1)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Visual Progress Bars */}
                  <div className="space-y-4 mt-6">
                    {currentMetric.data.map((item, index) => {
                      const numericValue = Number(item.value) || 0;
                      const starRating = range > 0 ? ((numericValue - minValue) / range) * 5 : 5;
                      
                      const normalizedValue = range > 0 ? ((numericValue - minValue) / range) * 100 : 50;
                      const barKey = `${animationKey.current}-${index}`;
                      const currentWidth = barWidths[barKey] ?? 0;

                      return (
                        <div key={index} className="flex items-center gap-4">
                          <span className="w-12 text-sm font-medium text-gray-600">{item.month}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden relative">
                            <div
                              className={`h-3 rounded-full ${item.color}`}
                              style={{
                                width: `${currentWidth}%`,
                                transition: "width 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
                                boxShadow: currentWidth > 0 ? "0 2px 6px rgba(0,0,0,0.15)" : "none",
                                position: "relative",
                                overflow: "hidden",
                              }}
                            >
                              {currentWidth > 0 && (
                                <div
                                  style={{
                                    position: "absolute", top: 0, left: "-100%", width: "100%", height: "100%",
                                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                                    animation: "shimmer 2s infinite",
                                  }}
                                />
                              )}
                            </div>
                          </div>
                          {/* Updated bar end label to show Stars instead of percentages */}
                          <div className="w-16 flex flex-col items-end">
                            <span className="text-sm font-bold text-gray-800">{starRating.toFixed(1)} <span className="text-yellow-500 text-base leading-none">★</span></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })() : (
              <div className="text-center py-8 text-gray-500">
                <p>No trend data available. Please fetch your analytics data first.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailedCard;