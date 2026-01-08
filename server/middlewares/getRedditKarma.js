const axios = require('axios');

const getRedditKarma = async (access_token) => {
    const userAgent = 'Social/1.0 by Tooth-Busy';
    try {
        const response = await axios.get(`https://oauth.reddit.com/api/v1/me`, {
            headers: {
                Authorization: `Bearer ${access_token}`,
                'User-Agent': userAgent
            }
        });

        const profile = response.data;

        return(profile.link_karma+profile.comment_karma);

    } catch (error) {
        console.log("Server error "+error);
        return(0);
    }
};



module.exports = getRedditKarma;