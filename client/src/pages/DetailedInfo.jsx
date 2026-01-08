import React, { useContext,useMemo } from 'react';
import { useParams } from 'react-router-dom';
import DetailedCard from '../components/DetailedCard';
import dashContext from '../context/dashContext';
import buildMonthlyAnalytics from '../utils/buildMonthlyAnalytics';
import buildLast12Months from '../utils/buildLast12Months';
import buildCurrentMonth from '../utils/buildCurrentMonth';


const DetailedInfo = (props) => {
    const { type } = useParams();
    const { analytics, engagementRate, immersionScore} = useContext(dashContext);
    const monthIndexMap = useMemo(() => ({
            January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
            July: 6, August: 7, September: 8, October: 9, November: 10, December: 11
        }), []);
    const monthlyAnalytics=useMemo(()=>buildMonthlyAnalytics(analytics,monthIndexMap),[analytics]);
    const last12Months=useMemo(()=>buildLast12Months(monthlyAnalytics),[monthlyAnalytics]);
    const currentMonth = useMemo(() => buildCurrentMonth(last12Months), [last12Months]);
    const getPageContent = () => {
        switch(type) {
            case 'engagement':
                return {
                    title: 'Engagement Analytics',
                    description: 'Detailed insights into your engagement metrics and performance trends',
                    icon: '📊',
                    gradient: 'from-rose-600 to-slate-700',
                    bgGradient: 'from-rose-50 to-slate-50',
                    stats: [
                        { label: 'Current Engagement Rate', value: `${engagementRate(currentMonth)}%`, icon: '📈', color: 'text-emerald-500' },
                        { label: 'Total Upvotes',  value: currentMonth ? currentMonth.totalLikes.toLocaleString() : '0', icon: '👍', color: 'text-slate-600' },
                        { label: 'Total Comments', value: currentMonth ? currentMonth.totalComments.toLocaleString():'0', icon: '💬', color: 'text-blue-600' },
                        { label: 'Followers', value: (analytics?.karma || 0).toLocaleString(), icon: '👥', color: 'text-teal-500' }
                    ],
                    insights: [
                        { title: 'Peak Engagement Times', description: 'Your content performs best between 2-4 PM', trend: '+23%' },
                        { title: 'Top Performing Content', description: 'Video posts generate 3x more engagement', trend: '+156%' },
                        { title: 'Audience Growth', description: 'Your follower base grew 12% this month', trend: '+12%' }
                    ]
                };
            case 'immersion':
                return {
                    title: 'Immersion Analytics', 
                    description: 'Deep dive into your immersion scores and user behavior patterns',
                    icon: '🧠',
                    gradient: 'from-teal-600 to-blue-700',
                    bgGradient: 'from-teal-50 to-blue-50',
                    stats: [
                        { label: 'Current Immersion Score', value: immersionScore(currentMonth), icon: '🎯', color: 'text-teal-500' },
                        { label: 'Deep Interactions', value: currentMonth ?currentMonth.totalReplies.toLocaleString():'0', icon: '💭', color: 'text-slate-600' },
                        { label: 'Comment Quality', value: 'High', icon: '⭐', color: 'text-amber-500' },
                        { label: 'User Retention', value: '87%', icon: '🔄', color: 'text-emerald-500' }
                    ],
                    insights: [
                        { title: 'Content Depth', description: 'Long-form posts create deeper engagement', trend: '+45%' },
                        { title: 'Community Building', description: 'Your audience actively participates in discussions', trend: '+78%' },
                        { title: 'Thought Leadership', description: 'You\'re becoming a trusted voice in your niche', trend: '+34%' }
                    ]
                };
            default:
                return {
                    title: 'Analytics Dashboard',
                    description: 'Comprehensive view of your social media performance',
                    icon: '📊',
                    gradient: 'from-slate-600 to-blue-600',
                    bgGradient: 'from-slate-50 to-blue-50',
                    stats: [],
                    insights: []
                };
        }
    };

    const content = getPageContent();

    return(
        <div className={`min-h-screen bg-gradient-to-br ${content.bgGradient}`}>
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-6 animate-pulse">
                        <span className="text-4xl">{content.icon}</span>
                    </div>
                    <h1 className={`text-4xl leading-tight pb-2 md:text-6xl font-bold bg-gradient-to-r ${content.gradient} bg-clip-text text-transparent mb-6`}>
                        {content.title}
                    </h1>
                    <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
                        {content.description}
                    </p>
                </div>

                {/* Stats Grid */}
                {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {content.stats.map((stat, index) => (
                        <div 
                            key={index}
                            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-white/20 animate-fade-in"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-3xl">{stat.icon}</div>
                                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                            </div>
                            <p className="text-gray-600 font-medium">{stat.label}</p>
                        </div>
                    ))}
                </div> */}

                {/* Insights Section */}
                {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                    {content.insights.map((insight, index) => (
                        <div 
                            key={index}
                            className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/30"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-800">{insight.title}</h3>
                                <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-sm font-semibold">
                                    {insight.trend}
                                </span>
                            </div>
                            <p className="text-gray-600 leading-relaxed">{insight.description}</p>
                        </div>
                    ))}
                </div> */}

                {/* Interactive Chart Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
                    <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                        Interactive Analytics Dashboard
                    </h2>
                    <DetailedCard type={type} currentMonth={currentMonth} last12Months={last12Months}/>
                </div>
            </div>
        </div>
    );
}

export default DetailedInfo;