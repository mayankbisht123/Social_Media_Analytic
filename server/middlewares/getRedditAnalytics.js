const axios = require('axios');
const getRedditComments = require('./getRedditComments');

const normalizeMediaUrl = (value) => {
    if (!value || typeof value !== 'string') {
        return null;
    }

    if (value === 'self' || value === 'default' || value.startsWith('data:')) {
        return null;
    }

    return value.replace(/&amp;/g, '&');
};

const buildEmptyMonthBucket = () => ({
    totalLikes: 0,
    totalComments: 0,
    totalReplies: 0,
    totalViews: 0,
    postCount: 0,
    subredditStats: {},
    postSummaries: [],
    topPosts: []
});

async function getRedditAnalytics(username, access_token) {
    const result = {};
    const userAgent = 'Social/1.0 by Tooth-Busy';

    const response = await axios.get(`https://oauth.reddit.com/user/${username}/submitted?t=${Date.now()}`, {
        headers: {
            Authorization: `Bearer ${access_token}`,
            'User-Agent': userAgent
        }
    });

    const posts = response.data.data.children;
    console.log(posts.length, 'posts found');

    for (const p of posts) {
        const post = p.data;
        const date = new Date(post.created_utc * 1000);
        const year = date.getFullYear().toString();
        const month = date.toLocaleString('default', { month: 'long' });
        const { totalComments, totalReplies } = await getRedditComments(post.permalink, access_token);

        if (!result[year]) {
            result[year] = {};
        }
        if (!result[year][month]) {
            result[year][month] = buildEmptyMonthBucket();
        }

        const monthBucket = result[year][month];
        const upvotes = post.ups || 0;
        const views = typeof post.view_count === 'number' && post.view_count > 0
            ? post.view_count
            : Math.round((upvotes * 12) + (totalComments * 5));
        const engagementScore = Number(((upvotes * 0.5) + (totalComments * 0.3) + (totalReplies * 0.2)).toFixed(2));

        monthBucket.totalLikes += upvotes;
        monthBucket.totalComments += totalComments;
        monthBucket.totalReplies += totalReplies;
        monthBucket.totalViews += views;
        monthBucket.postCount += 1;
        monthBucket.subredditStats[post.subreddit] = (monthBucket.subredditStats[post.subreddit] || 0) + 1;

        const summary = {
            title: post.title,
            subreddit: post.subreddit,
            ups: upvotes,
            created: date,
            url: `https://reddit.com${post.permalink}`,
            totalComments,
            totalReplies,
            engagementScore,
            thumbnail: normalizeMediaUrl(post.thumbnail),
            mediaUrl: normalizeMediaUrl(post.preview?.images?.[0]?.source?.url),
            views
        };

        monthBucket.postSummaries.push(summary);
    }

    Object.values(result).forEach((yearObj) => {
        Object.values(yearObj).forEach((monthObj) => {
            monthObj.topPosts = [...monthObj.postSummaries]
                .sort((a, b) => b.ups - a.ups)
                .slice(0, 5);
        });
    });

    return result;
}

module.exports = getRedditAnalytics;
