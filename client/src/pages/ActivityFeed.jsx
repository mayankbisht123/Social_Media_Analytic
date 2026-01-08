import { useEffect, useState, useContext } from "react";
import dashContext from "../context/dashContext";

const ActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const { ActivityFeed } = useContext(dashContext);
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await ActivityFeed();
        const years = Object.keys(data).sort();
        const latestYear = years[years.length - 1];

        const monthObj = data[latestYear];
        const monthsArray = Object.keys(monthObj).map((month) => ({
          month,
          posts: monthObj[month].posts,
        }));

        setActivities(monthsArray);
        setFilteredActivities(monthsArray.flatMap((m) => m.posts));
        setSelectedMonth(null); // Reset selection when data loads
      } catch (error) {
        console.error("Error fetching Activities ", error);
      }
    };
    fetchActivities();
  }, [ActivityFeed]);

  const shortToFull = {
    Jan: "January",
    Feb: "February",
    Mar: "March",
    Apr: "April",
    May: "May",
    Jun: "June",
    Jul: "July",
    Aug: "August",
    Sep: "September",
    Oct: "October",
    Nov: "November",
    Dec: "December",
  };

  return (
    <>
      <div className="mb-8">
        <div className="flex justify-center flex-wrap gap-2 sm:gap-3 items-center">
          <button
            className={`px-5 py-2.5 rounded-xl font-semibold text-base transition-all duration-200 shadow-md ${
              selectedMonth === null
                ? "gradient-primary text-white border-2 border-white/40 scale-105 shadow-lg"
                : "gradient-primary text-white border border-white/20 hover:bg-white/10 hover:scale-105 hover:shadow-lg"
            }`}
            onClick={() => {
              setFilteredActivities(activities.flatMap((m) => m.posts));
              setSelectedMonth(null);
            }}
          >
            All
          </button>
          {Object.keys(shortToFull).map((shortName, index) => {
            const fullMonth = shortToFull[shortName];
            const isActive = selectedMonth === fullMonth;
            const posts = activities.find((a) => a.month === fullMonth)?.posts || [];
            const hasPosts = posts.length > 0;

            return (
              <button
                key={index}
                className={`px-5 py-2.5 rounded-xl font-semibold text-base transition-all duration-200 shadow-md min-w-[60px] ${
                  isActive
                    ? "gradient-primary text-white border-2 border-white/40 scale-105 shadow-lg"
                    : hasPosts
                    ? "gradient-primary text-white border border-white/20 hover:bg-white/10 hover:scale-105 hover:shadow-lg"
                    : "gradient-primary text-white/60 border border-white/10 opacity-60 cursor-not-allowed"
                }`}
                onClick={() => {
                  if (hasPosts) {
                    setFilteredActivities(posts);
                    setSelectedMonth(fullMonth);
                  }
                }}
                disabled={!hasPosts}
              >
                {shortName}
              </button>
            );
          })}
        </div>
        {selectedMonth && (
          <p className="text-center text-gray-600 text-sm mt-4">
            Showing activities for <span className="font-semibold" style={{ color: '#C47566' }}>{selectedMonth}</span>
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-semibold text-gray-800">
            Recent Reddit Activity
          </h2>
        </div>

        <div className="relative pl-6">
          {/* Timeline vertical line */}
          <div className="absolute left-3 top-0 h-full w-0.5 bg-gray-200"></div>

          {filteredActivities.length === 0 ? (
            <p className="text-gray-500 text-center">No activity found.</p>
          ) : (
            filteredActivities.map((item, index) => (
              <div key={index} className="relative mb-6">
                {/* Timeline dot */}
                <div className="absolute -left-[5px] top-1.5 w-3 h-3 rounded-full" style={{ backgroundColor: '#C47566' }}></div>

                <div className="bg-gray-50 transition-colors p-4 rounded-lg shadow-sm" style={{ '--hover-bg': '#F0D8B8' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0D8B8'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}>
                  <div className="flex justify-between">
                    <h3 className="font-medium text-gray-800">{item.title}</h3>
                    <span className="text-xs text-gray-500">
                      {item.timeAgo}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-semibold" style={{ color: '#C47566' }}>
                      {item.subreddit}
                    </span>{" "}
                    • {item.type}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    👍 {item.upvotes} upvotes
                  </p>

                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm mt-2 inline-block hover:underline"
                      style={{ color: '#C47566' }}
                    >
                      View on Reddit →
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default ActivityFeed;
