function formatAnalytics(rawAnalytics) {
    const formattedAnalytics = Object.entries(rawAnalytics).map(([year, monthsObj]) => ({
        year,
        months: Object.entries(monthsObj).map(([month, data]) => ({
            month,
            totalLikes: data.totalLikes,
            totalComments: data.totalComments,
            totalReplies: data.totalReplies,
            totalViews: data.totalViews,
            postCount: data.postCount,
            subredditStats: data.subredditStats,
            topPosts: data.topPosts,
            postSummaries: data.postSummaries
        }))
    }));

    const lifetimeStats = formattedAnalytics.reduce((acc, yearObj) => {
        yearObj.months.forEach((monthObj) => {
            const posts = monthObj.postCount || monthObj.postSummaries?.length || 0;
            acc.totalPosts += posts;
            acc.totalComments += monthObj.totalComments || 0;
            acc.totalReplies += monthObj.totalReplies || 0;
            acc.totalViews += monthObj.totalViews || 0;
            const label = `${monthObj.month} ${yearObj.year}`;
            const score = (monthObj.totalLikes || 0) + (monthObj.totalComments || 0);
            acc._monthScores.push({ label, score });
        });
        return acc;
    }, { totalPosts: 0, totalComments: 0, totalReplies: 0, totalViews: 0, _monthScores: [] });

    lifetimeStats.bestMonths = lifetimeStats._monthScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
    delete lifetimeStats._monthScores;

    return { formattedAnalytics, lifetimeStats };
}

module.exports = {
    formatAnalytics
};

