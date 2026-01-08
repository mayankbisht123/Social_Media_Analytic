const buildLast12Months = (monthlyAnalytics) => {
  const now = new Date();
  const months = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const monthIndex = d.getMonth();

    const match = monthlyAnalytics.find(
      m => m.year === year && m.monthIndex === monthIndex
    );

    months.push({
      year,
      monthIndex,
      month: d.toLocaleString('default', { month: 'short' }),
      totalLikes: match?.totalLikes ?? 0,
      totalComments: match?.totalComments ?? 0,
      totalReplies: match?.totalReplies ?? 0,
      postCount: match?.postCount ?? 0
    });
  }

  return months;
};

export default buildLast12Months;