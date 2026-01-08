const axios = require('axios');
const User = require('../models/Auth');

const refreshRedditToken = async (req, res, next) => {
    try {

        const user = await User.findById(req.userId);
        if (!user || !user.reddit || !user.reddit.refresh_token) {
            return (res.status(404).json({ error: 'Reddit account not found' }));
        }

        const { refresh_token, expires_at } = user;

        const isTokenExpired = !user.reddit.access_token || new Date() >= new Date(expires_at);

        if (!isTokenExpired) {
            return next();
        }

        const CLIENT_ID = process.env.CLIENT_ID;
        const CLIENT_SECRET = process.env.CLIENT_SECRET;

        const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
        const userAgent = 'Social/1.0 by Tooth-Busy';

        const tokens = await axios.post('https://www.reddit.com/api/v1/access_token', new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        ),
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': userAgent
                }
            }
        );

        user.reddit.access_token=tokens.data.access_token;
        user.reddit.expires_at=new Date(Date.now() + tokens.data.expires_in * 1000);
        await user.save();

        console.log('New access token granted');
        next();

    } catch (error) {
        console.error("Failed to refresh Reddit token:", error.message);
        res.status(500).json({ error: "Failed to refresh Reddit token." });
    }
};

module.exports=refreshRedditToken;

