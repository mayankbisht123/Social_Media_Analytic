import React, { useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import DetailedCard from '../components/DetailedCard';
import dashContext from '../context/dashContext';
import buildMonthlyAnalytics from '../utils/buildMonthlyAnalytics';
import buildLast12Months from '../utils/buildLast12Months';
import buildCurrentMonth from '../utils/buildCurrentMonth';

const DetailedInfo = (props) => {
    const { type } = useParams();
    const { analytics, engagementRate, immersionScore } = useContext(dashContext);
    
    const monthIndexMap = useMemo(() => ({
        January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
        July: 6, August: 7, September: 8, October: 9, November: 10, December: 11
    }), []);
    
    const monthlyAnalytics = useMemo(() => buildMonthlyAnalytics(analytics, monthIndexMap), [analytics]);
    const last12Months = useMemo(() => buildLast12Months(monthlyAnalytics), [monthlyAnalytics]);
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
                        { label: 'Engagement Rate', value: `${engagementRate(currentMonth)}%`, color: 'bg-emerald-500' },
                        { label: 'Total Upvotes', value: currentMonth ? currentMonth.totalLikes.toLocaleString() : '0', color: 'bg-slate-600' },
                        { label: 'Comments', value: currentMonth ? currentMonth.totalComments.toLocaleString() : '0', color: 'bg-blue-600' },
                        { label: 'Followers', value: (analytics?.karma || 0).toLocaleString(), color: 'bg-teal-500' }
                    ]
                };
            case 'immersion': {
                const replyRate = currentMonth && currentMonth.totalComments > 0
                    ? Math.round((currentMonth.totalReplies / currentMonth.totalComments) * 100)
                    : 0;
                const commentsPerPost = currentMonth && currentMonth.postCount > 0
                    ? Math.round(currentMonth.totalComments / currentMonth.postCount)
                    : 0;
                    
                return {
                    title: 'Immersion Analytics', 
                    description: 'Deep dive into your immersion scores and user behavior patterns',
                    icon: '🧠',
                    gradient: 'from-teal-600 to-blue-700',
                    bgGradient: 'from-teal-50 to-blue-50',
                    stats: [
                        { label: 'Immersion Score', value: immersionScore(currentMonth), color: 'bg-teal-500' },
                        { label: 'Deep Interactions', value: currentMonth ? currentMonth.totalReplies.toLocaleString() : '0', color: 'bg-slate-600' },
                        { label: 'Reply Rate', value: `${replyRate}%`, color: 'bg-amber-500' },
                        { label: 'Avg Comments / Post', value: commentsPerPost.toString(), color: 'bg-emerald-500' }
                    ]
                };
            }
            default:
                return {
                    title: 'Analytics Dashboard',
                    description: 'Comprehensive view of your social media performance',
                    icon: '📊',
                    gradient: 'from-slate-600 to-blue-600',
                    bgGradient: 'from-slate-50 to-blue-50',
                    stats: []
                };
        }
    };

    const content = getPageContent();

    return(
        <div className={`min-h-screen bg-gradient-to-br ${content.bgGradient}`}>
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
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

                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
                    <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                        Interactive Analytics Dashboard
                    </h2>
                    <DetailedCard type={type} currentMonth={currentMonth} last12Months={last12Months} content={content}/>
                </div>
            </div>
        </div>
    );
}

export default DetailedInfo;