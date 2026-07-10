// Home.jsx
import React, { useContext, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Chart from '../components/Chart';
import dashContext from '../context/dashContext';
import '../styles/Home.css';
import StatsBar from '../components/StatsBar';
import ActivityTimeline from '../components/ActivityTimeline';
import TopPostsWidget from '../components/TopPostsWidget';
import SubredditDistribution from '../components/SubredditDistribution';
import buildLast12Months from '../utils/buildLast12Months';
import buildMonthlyAnalytics from '../utils/buildMonthlyAnalytics';
import buildCurrentMonth from '../utils/buildCurrentMonth'


const Home = () => {
    console.log("📦 Home.jsx module loaded"); // Top of the file

    const { getReddit, analytics, setAnalytics, engagementRate, immersionScore } = useContext(dashContext);
    const navigate = useNavigate();
    const location = useLocation();
    console.log(location.search);

    useEffect(() => {
        let token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
    }, []);

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const status = urlParams.get('status');
        console.log('Status:', status);

        if (status === 'success') {
            console.log('Fetching Reddit data...');
            getReddit().then((data) => {
                setAnalytics(data);
            }).catch((e) => {
                console.error("Promise is refused" + e);
            });
        }

        const clearUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, clearUrl);
    }, [location.search]);

    const monthIndexMap = useMemo(() => ({
        January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
        July: 6, August: 7, September: 8, October: 9, November: 10, December: 11
    }), []);

    const monthlyAnalytics = useMemo(() => buildMonthlyAnalytics(analytics, monthIndexMap), [analytics, monthIndexMap]);

    const last12Months = useMemo(() => {
        return buildLast12Months(monthlyAnalytics);
    }, [monthlyAnalytics]);

    const currentMonth = useMemo(() => buildCurrentMonth(last12Months), [last12Months]);

    const engagementChartData = useMemo(() => {
        if (!last12Months.length || !analytics?.karma) return [];

        return last12Months.map((m) => ({
            month: m.month, // already short name from buildLast12Months
            engagementRate: Number(
                (((m.totalLikes + m.totalComments) / analytics.karma) * 100)
                    .toFixed(2))
        }));
    }, [last12Months, analytics]);

    const immersionChartData = useMemo(() => {
        return last12Months.map((m) => ({
            month: m.month,
            immersionScore: Number((
                m.totalComments * 0.7 +
                m.totalReplies * 0.3 +
                m.totalLikes * 0.2)
                    .toFixed(2))
        }));
    }, [last12Months]);



    const { timelineData, bestMonths } = useMemo(() => {
        if (!monthlyAnalytics.length) return { timelineData: [], bestMonths: [] };

        const recent = monthlyAnalytics.slice(-12).map((month) => {
            const label = `${month.monthName.slice(0, 3)} '${month.year.toString().slice(-2)}`;
            const score = (month.totalLikes || 0) + (month.totalComments || 0);
            return {
                label,
                posts: month.postCount,
                comments: month.totalComments,
                upvotes: month.totalLikes,
                score
            };
        });

        const best = [...recent]
            .sort((a, b) => b.score - a.score)
            .slice(0, 1)
            .map((item) => item.label);

        return { timelineData: recent, bestMonths: best };
    }, [monthlyAnalytics]);

    const totals = useMemo(() => {
        return monthlyAnalytics.reduce((acc, month) => {
            acc.totalPosts += month.postCount;
            acc.totalComments += month.totalComments;
            acc.totalReplies += month.totalReplies;
            acc.totalLikes += month.totalLikes;
            acc.totalViews += month.totalViews;
            Object.entries(month.subredditStats || {}).forEach(([subreddit, count]) => {
                acc.subreddits[subreddit] = (acc.subreddits[subreddit] || 0) + count;
            });
            acc.posts.push(
                ...(month.postSummaries || []).map((post) => ({
                    ...post,
                    totalComments: post.totalComments ?? 0,
                    totalReplies: post.totalReplies ?? 0,
                    engagementScore: post.engagementScore ?? Number(((post.ups || 0) * 0.5 + (post.totalComments ?? 0) * 0.3 + (post.totalReplies ?? 0) * 0.2).toFixed(2)),
                    thumbnail: post.thumbnail || post.mediaUrl || null
                }))
            );
            return acc;
        }, { totalPosts: 0, totalComments: 0, totalReplies: 0, totalLikes: 0, totalViews: 0, subreddits: {}, posts: [] });
    }, [monthlyAnalytics]);

    const subredditDistribution = useMemo(() => {
        const entries = Object.entries(totals.subreddits);
        if (!entries.length) return [];

        const total = entries.reduce((sum, [, count]) => sum + count, 0);
        const sorted = entries.sort((a, b) => b[1] - a[1]);
        const top = sorted.slice(0, 4).map(([name, count]) => ({
            name: `r/${name}`,
            value: Math.round((count / total) * 100)
        }));
        const remainder = sorted.slice(4);
        if (remainder.length) {
            const otherCount = remainder.reduce((sum, [, count]) => sum + count, 0);
            top.push({
                name: 'Other',
                value: Math.max(1, Math.round((otherCount / total) * 100))
            });
        }
        const sumPercent = top.reduce((sum, item) => sum + item.value, 0);
        if (sumPercent !== 100 && top.length) {
            top[0].value += (100 - sumPercent);
        }
        return top;
    }, [totals.subreddits]);


    const topPosts = useMemo(() => {
        if (!totals.posts.length) return {};

        const byUpvotes = [...totals.posts].sort((a, b) => (b.ups || 0) - (a.ups || 0));
        const byComments = [...totals.posts].sort((a, b) => (b.totalComments || 0) - (a.totalComments || 0));
        const byEngagement = [...totals.posts].sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0));

        return {
            mostUpvoted: byUpvotes[0],
            mostCommented: byComments[0],
            mostEngaging: byEngagement[0]
        };
    }, [totals.posts]);

    const avgEngagementRate = useMemo(() => {
        if (!last12Months.length || !analytics?.karma) return 0;

        const monthlyRates = last12Months.map(m =>{
            
               return Number(engagementRate(m))
        }
        );

        const sum = monthlyRates.reduce((a, b) => a + b, 0);

        return (sum / monthlyRates.length).toFixed(2);
    }, [last12Months, analytics]);


    const statsBarData = useMemo(() => {
        if (!totals.totalPosts && !analytics?.karma) return [];

        const formatNumber = (value) => {
            if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
            return value.toString();
        };

        const createdDate = analytics?.accountCreatedAt ? new Date(analytics.accountCreatedAt) : null;
        let accountAge = 'Link account';
        if (createdDate && !Number.isNaN(createdDate.getTime())) {
            const now = new Date();
            const totalMonths = (now.getFullYear() - createdDate.getFullYear()) * 12 + (now.getMonth() - createdDate.getMonth());
            const years = Math.floor(totalMonths / 12);
            const months = totalMonths % 12;
            accountAge = `${years ? `${years}y ` : ''}${months}m`;
        }

        return [
            { label: 'Account Age', value: accountAge, icon: '⏱️', helper: createdDate ? createdDate.toLocaleDateString() : null },
            { label: 'Total Posts', value: formatNumber(totals.totalPosts), icon: '📝' },
            { label: 'Total Comments', value: formatNumber(totals.totalComments), icon: '💬' },
            { label: 'Total Karma', value: formatNumber(analytics?.karma || 0), icon: '⭐' },
            { label: 'Avg Engagement', value: `${avgEngagementRate}`, icon: '📊', helper: 'per month' }
        ];
    }, [totals, analytics]);

    const isRedditLinked = analytics && analytics.username;
    const hasPosts = totals.totalPosts > 0 || totals.totalComments > 0;

    if (!isRedditLinked) {
        return (
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center mt-20">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 max-w-2xl mx-auto border border-gray-100">
                    <div className="text-6xl mb-6">👈</div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Connect Your Reddit Account</h2>
                    <p className="text-gray-600 text-lg mb-8">
                        Click the <span className="font-bold text-orange-500">Add Reddit</span> button in the sidebar to link your account and unlock your analytics dashboard.
                    </p>
                </div>
            </div>
        );
    }

    if (isRedditLinked && !hasPosts) {
        return (
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center mt-20">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 max-w-2xl mx-auto border border-gray-100">
                    <div className="text-6xl mb-6">👻</div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                        Welcome, u/{analytics.username}!
                    </h2>
                    <p className="text-gray-600 text-lg mb-4">
                        Your account is successfully linked, but we couldn't find any recent posts or comments to analyze.
                    </p>
                    <div className="bg-slate-50 rounded-xl p-6 mt-6 text-sm text-slate-500 border border-slate-200">
                        Once you start posting or commenting on Reddit, your stats will automatically appear here!
                    </div>
                </div>
            </div>
        );
    }

    


    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            {/* Welcome Section */}
            <div className="welcomeSection mb-12">
                <div className="gradient-primary text-white rounded-2xl p-8 relative overflow-hidden shadow-lg">
                    {/* Background Pattern */}
                    <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full bg-white/10 opacity-30" />
                    <div className="absolute -bottom-5 -left-5 w-20 h-20 rounded-full bg-white/10 opacity-20" />

                    <div className="relative z-10">
                        <div className="text-6xl mb-6 opacity-90">📊</div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent">
                            Welcome to Your Dashboard
                        </h1>
                        <p className="text-xl opacity-90 leading-relaxed">
                            Track your social media performance and engagement metrics in real-time
                        </p>
                    </div>
                </div>
            </div>

            {/* Real-time Stats Bar */}
            <StatsBar stats={statsBarData} />

            {/* Stats Cards */}
            <div className='Hero mb-12'>
                <Card title={'Welcome back'} name={(analytics && analytics.username) ? analytics.username : "<Name>"} description={"Here's what's happening with your social media account today"} />

                {/* Right side grid container */}
                <div className="rightSideGrid">
                    <Card about={'followers'} title={(analytics && analytics.karma) ? analytics.karma.toString() : "0"} description={'Compare to previous month'} />
                    <Card
                        about={'Engagement'}
                        title={(analytics && analytics.karma && analytics.karma !== 0) ? engagementRate(currentMonth) + '%' : "0%"}
                        description={'Engagement rate'}
                        onClick={() => navigate('/info/engagement')}
                    />
                    <Card
                        about={'Immersion'}
                        title={(analytics) ? immersionScore(currentMonth) : "0"}
                        description={'About it'}
                        onClick={() => navigate('/info/immersion')}
                    />
                </div>
            </div>

            {/* Charts Section */}
            <div className="sectionHeader mb-12">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 flex items-center justify-center gap-3 mb-4">
                        <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        Performance Analytics
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Monitor your engagement and immersion trends over time
                    </p>
                </div>

                <div className='chartBlock'>
                    <Chart data={engagementChartData} dataKey="engagementRate" name="Engagement Rate" />
                    <Chart data={immersionChartData} dataKey="immersionScore" name="Immersion Score" />
                </div>
            </div>

            {/* Advanced Insights */}
            <div className="insightGrid">
                <ActivityTimeline data={timelineData} bestMonths={bestMonths} />
            </div>

            <div className="insightGrid">
                <TopPostsWidget posts={topPosts} />
                <SubredditDistribution data={subredditDistribution} />
            </div>
        </div>
    );
}

export default Home;