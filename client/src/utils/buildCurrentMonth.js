const buildCurrentMonth = (last12Months) => {
    if (!last12Months) return null;
    for (let i = last12Months.length - 1; i >= 0; i--) {
        const m = last12Months[i];
        if (
            m.totalLikes > 0 ||
            m.totalComments > 0 ||
            m.totalReplies > 0
        ) {
            return m;
        }
    }
    return null
}

export default buildCurrentMonth;