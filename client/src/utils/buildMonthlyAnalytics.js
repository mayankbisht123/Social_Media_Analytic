export const buildMonthlyAnalytics = (analytics, monthIndexMap) => {
    if (!analytics || !Array.isArray(analytics.analytics)) return [];

    return analytics.analytics.flatMap((yearObj) =>
        (yearObj.months || []).map((monthObj) => ({
            year: Number(yearObj.year) || 0,
            monthName: monthObj.month,
            monthIndex: monthIndexMap[monthObj.month] ?? 0,
            postCount: monthObj.postCount ?? 0,
            totalLikes: monthObj.totalLikes ?? 0,
            totalComments: monthObj.totalComments ?? 0,
            totalReplies: monthObj.totalReplies ?? 0,
            totalViews: monthObj.totalViews ?? 0,
            subredditStats: monthObj.subredditStats || {},
            postSummaries: monthObj.postSummaries || []
        }))
    ).sort((a, b) => (a.year - b.year) || (a.monthIndex - b.monthIndex));
};
export default buildMonthlyAnalytics;