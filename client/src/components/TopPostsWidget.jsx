import React from 'react';

const PostCard = ({ label, emoji, post }) => (
  <div className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl border border-slate-100 hover:shadow-lg transition-all duration-200 bg-white/80" style={{ borderColor: '#F0D8B8' }}>
    <div className="w-full md:w-28 h-28 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center text-4xl">
      {post?.thumbnail ? (
        <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
      ) : (
        <span>{emoji}</span>
      )}
    </div>
    <div className="flex-1">
      <p className="text-xs uppercase tracking-wide font-semibold mb-1" style={{ color: '#C47566' }}>{label}</p>
      <h4
        className="text-lg font-semibold text-gray-800"
        style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
      >
        {post?.title || 'Not enough data yet'}
      </h4>
      {post && (
        <>
          <p className="text-sm text-gray-500 mb-2">{post.subreddit ? `r/${post.subreddit}` : 'Unknown subreddit'}</p>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>👍 {post.ups ?? 0}</span>
            <span>💬 {post.totalComments ?? 0}</span>
            <span>⚡ {post.engagementScore ?? 0}</span>
          </div>
          {post.url && (
            <a
              href={post.url}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold mt-2 inline-block hover:underline"
              style={{ color: '#C47566' }}
            >
              View post →
            </a>
          )}
        </>
      )}
    </div>
  </div>
);

const TopPostsWidget = ({ posts = {} }) => {
  const cards = [
    { key: 'mostUpvoted', label: 'Most upvoted post', emoji: '🔥' },
    { key: 'mostCommented', label: 'Most commented post', emoji: '💬' },
    { key: 'mostEngaging', label: 'Most engaging post', emoji: '📈' }
  ];

  return (
    <div className="insightCard">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Top Performing Posts</h3>
      <div className="grid gap-4">
        {cards.map(({ key, label, emoji }) => (
          <PostCard key={key} label={label} emoji={emoji} post={posts[key]} />
        ))}
      </div>
    </div>
  );
};

export default TopPostsWidget;

