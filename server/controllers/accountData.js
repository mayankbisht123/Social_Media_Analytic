const User = require('../models/Auth');
const axios = require('axios');
const verifyUser = require('../middlewares/jwtdecoder');
const express = require('express');
const refreshRedditToken = require('../middlewares/refreshRedditToken');
const routes = express.Router();
const getRedditAnalytics = require('../middlewares/getRedditAnalytics');
const { formatAnalytics } = require('../utils/analyticsFormatter');

routes.get('/reddit/fetch', verifyUser,refreshRedditToken, async (req, res) => {
    const user = await User.findById(req.userId);
    const { access_token, username } = user.reddit;

    const analytics = await getRedditAnalytics(username, access_token);
    const { formattedAnalytics, lifetimeStats } = formatAnalytics(analytics);

    user.reddit.analytics = formattedAnalytics;
    user.reddit.lifetimeStats = lifetimeStats;
    user.reddit.lastSyncedAt = new Date();
    await user.save();
    res.status(200).json(user.reddit);

});

routes.get('/reddit/get', verifyUser,async (req, res) => {

    try {
        const user = await User.findById(req.userId);
        if (!user) {
            console.error("User doesn't exist");
            res.status(404).json({ 'message': 'user-notFound' });
        }

        const data = user;
        // console.log(data.reddit.analytics);
        res.status(200).json(data.reddit);

    } catch (error) {
        console.error("Server error!" + error);
    }
});

routes.get('/reddit/activity',verifyUser,refreshRedditToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId)
        if (!user) {
            console.error("User doesn't exist");
            res.status(403).json({ 'message': 'user-notFound' });
        }
        const { access_token, username } = user.reddit;
        const response = await axios.get(`https://oauth.reddit.com/user/${username}/submitted`, {
            headers: {
                Authorization: `Bearer ${access_token}`,
                'User-Agent': 'Social/1.0 by Tooth-Busy',
            }
        });

        const posts = response.data.data.children;
        const result={};


        posts.forEach(p => {
            const post = p.data;
            const date = new Date(post.created_utc * 1000);
            const month = date.toLocaleString('default', { month: 'long' });
            const year = date.getFullYear().toString();

            if(!result[year])
            {
                result[year]={};
            }
            if(!result[year][month])
            {
                result[year][month]={posts:[]};
            }
            result[year][month].posts.push({
                title: post.title,
                subreddit: `r/${post.subreddit}`,
                upvotes: post.ups,
                timeAgo: date.toLocaleString(),
                url: `https://reddit.com${post.permalink}`
            })
        })

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({"message":"Internal Server Error",'error':error});
    }


})


module.exports = routes;