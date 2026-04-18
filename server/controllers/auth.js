const express = require('express');
const routes = express.Router();
const bcryptjs = require('bcryptjs');
const User = require('../models/Auth');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const saltRounds = 10;
require('dotenv').config();
const axios = require('axios');
const jwtkey = process.env.JWTKEY;
const getRedditAnalytics=require('../middlewares/getRedditAnalytics');
const getRedditKarma=require('../middlewares/getRedditKarma');
const { formatAnalytics } = require('../utils/analyticsFormatter');


const singupValidation = () => [
    body('name').notEmpty().withMessage("It should not be empty"),
    body('email').notEmpty().withMessage("It should not be empty").isEmail().withMessage("put correct value"),
    body('password').notEmpty().withMessage("It should not be empty")
        .matches(/[A-Z]/).withMessage("At least one Capital letter")
        .matches(/[a-z]/).withMessage("At least one small letter")
        .matches(/[0-9]/).withMessage("At least one number")
        .matches(/[^A-Za-z0-9]/).withMessage("At least one special character")
        .isLength({ min: 8 }).withMessage("It should be of min 8 character")

];

const loginValidation = () => [
    body('email').notEmpty().withMessage("It should not be empty").isEmail().withMessage("put correct value"),
    body('password').notEmpty().withMessage("It should not be empty")
];

routes.post('/signup', singupValidation(), async (req, res) => {

    const checkValidation = validationResult(req);
    if (!checkValidation) {
        res.status(400).json({ errors: checkValidation.array() });
        return;
    }

    if (req.body.password != req.body.cpassword) {
        res.status(403).json({ error: "Confirm password does not match" })
        return;
    }

    try {
        const encryptedPassword = await bcryptjs.hash(req.body.password, saltRounds);

        User.create({
            name: req.body.name,
            email: req.body.email,
            password: encryptedPassword
        }).then((user) => {
            res.status(200).json({success:true,message:"User created successfully"})
        }).catch((e) => {
            res.status(500).json({success:false,message:e.message})
        })

    } catch (error) {
        res.status(500).json({ title: "Server error", error: error.message });
    }




});


routes.post('/login', loginValidation(), async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        res.status(404).json({ error: "user not found" });
        return;
    }
    const checkPassword = await bcryptjs.compare(req.body.password, user.password);
    if (!checkPassword) {
        res.status(401).json({ error: "Wrong Credentials" });
        return;
    }

    const data = {
        user: {
            id: user.id
        }
    }

    const jwtToken = jwt.sign(data, jwtkey);
    res.status(200).json({ success:true, token: jwtToken });



});

routes.get('/reddit', async (req, res) => {

    try {
        const token=req.query.token;
        const decoded=jwt.verify(token,jwtkey)
        const userId=decoded.user.id;
        const CLIENT_ID = process.env.REDDIT_CLIENT_ID;
        const REDIRECT_URI = 'http://localhost:4000/api/auth/reddit/callback';
        const authUrl = `https://www.reddit.com/api/v1/authorize?client_id=${CLIENT_ID}&response_type=code&state=${userId}&redirect_uri=${REDIRECT_URI}&duration=permanent&scope=identity history read&prompt=login`;        
        res.redirect(authUrl);

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error HIHIHIHIHI");
    }

});

routes.get('/reddit/callback', async (req, res) => {

    try {

        const REDIRECT_URI = 'http://localhost:4000/api/auth/reddit/callback';
        const code = req.query.code;
        const userId = req.query.state;
        const CLIENT_ID = process.env.REDDIT_CLIENT_ID;
        const CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;

        const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
        const userAgent = 'Social/1.0 by Tooth-Busy';
        const tokenRes = await axios.post('https://www.reddit.com/api/v1/access_token', new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: REDIRECT_URI
        }), {
            headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': userAgent
            }
        });

        const access_token = tokenRes.data.access_token;
        const refresh_token = tokenRes.data.refresh_token;

        // Fetch Reddit user
        const redditUser = await axios.get('https://oauth.reddit.com/api/v1/me', {
            headers: { Authorization: `bearer ${access_token}`, 'User-Agent': userAgent }
        });

        console.log(redditUser)
        const karma=await getRedditKarma(access_token);
        // console.log(karma);

        const redditUsername = redditUser.data.name;

        const accountCreatedAt = new Date(redditUser.data.created_utc * 1000);
        const analytics = await getRedditAnalytics(redditUsername,access_token);
        const { formattedAnalytics, lifetimeStats } = formatAnalytics(analytics);

        // Save this Reddit account under the logged-in user in DB
        await User.findByIdAndUpdate(userId, {
            reddit: {
                username: redditUsername,
                karma,
                access_token,
                refresh_token,
                expires_at: new Date(Date.now() + tokenRes.data.expires_in * 1000),
                accountCreatedAt,
                lastSyncedAt: new Date(),
                lifetimeStats,
                analytics:formattedAnalytics
            }
        });
         
        // res.send("Reddit account linked successfully!");
        console.log('redirecting');
        res.redirect('http://localhost:5173/?status=success');

    } catch (error) {
        console.error(error);
    }

});

module.exports = routes;