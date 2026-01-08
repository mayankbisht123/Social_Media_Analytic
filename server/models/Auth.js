const mongooes = require('mongoose');
const Schema = mongooes.Schema;

const postSummarySchema = new Schema({
    title: String,
    subreddit: String,
    ups: Number,
    created: Date,
    url: String,
    totalComments: Number,
    totalReplies: Number,
    engagementScore: Number,
    thumbnail: String,
    mediaUrl: String,
    views: Number
}, { _id: false });

const redditMonthSchema = new Schema({
    month: String,
    totalLikes: { type: Number, default: 0 },
    totalComments: { type: Number, default: 0 },
    totalReplies: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    postCount: { type: Number, default: 0 },
    subredditStats: {
        type: Map,
        of: Number,
        default: {}
    },
    topPosts: [postSummarySchema],
    postSummaries: [postSummarySchema]
}, { _id: false });

const redditSchema = new Schema({
    year: String,
    months: [redditMonthSchema]
}, { _id: false });

const lifetimeStatsSchema = new Schema({
    totalPosts: { type: Number, default: 0 },
    totalComments: { type: Number, default: 0 },
    totalReplies: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    bestMonths: [{
        label: String,
        score: Number
    }]
}, { _id: false });

const data = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        reddit: {
            username: String,
            karma: Number,
            access_token: String,
            refresh_token: String,
            expires_at: Date,
            accountCreatedAt: Date,
            lastSyncedAt: Date,
            lifetimeStats: lifetimeStatsSchema,
            analytics: [redditSchema]
        }
    }
)

const User = mongooes.model('UserInfo', data);
User.syncIndexes();
module.exports = User;