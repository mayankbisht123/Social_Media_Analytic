const axios = require('axios');

function getTotalReplies(comment) {
    let count = 0;
    if (comment.data.replies && typeof comment.data.replies === 'object') {
        const repliesArray = comment.data.replies.data.children;
        for (const reply of repliesArray) {
            if (reply.kind === 't1') {
                count++;
                count += getTotalReplies(reply);
            }
        }
    }

    return count;
}

async function getRedditComments(permalink, access_token) {
    const url = `https://oauth.reddit.com${permalink}.json`;
    const response = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${access_token}`,
            'User-Agent': 'Social/1.0 by Tooth-Busy'
        }
    });

    const comments = response.data[1].data.children
        .filter(c => c.kind === 't1')
        .map(c => ({
            author: c.data.author,
            body: c.data.body,
            upvotes: c.data.score,
            totalReplies: getTotalReplies(c),
        }));

    const totalReplies = comments.reduce((sum, c) => sum + c.totalReplies, 0);
    const totalComments = comments.reduce((sum, c) => sum + c.totalReplies + 1, 0);

    return { totalComments, totalReplies };

}

module.exports = getRedditComments;