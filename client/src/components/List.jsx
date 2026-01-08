import React from 'react';

export default function AlignItemsList() {
  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl bg-gradient-to-br from-white to-slate-50 border border-black/5 overflow-hidden shadow-lg">
      <div className="p-6 gradient-primary text-white">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold">📊 Recent Activity</h3>
          <div className="ml-auto text-sm opacity-80">
            Last 24 hours
          </div>
        </div>
      </div>
      
      <div className="p-0">
        <div className="p-6 hover:bg-blue-50/50 transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-14 h-14 rounded-full border-4 border-blue-500 shadow-lg shadow-blue-500/30 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                A
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-800">
                  Brunch this weekend?
                </h4>
                <div className="ml-auto flex items-center text-green-500">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="text-xs font-medium">+15%</span>
                </div>
              </div>
              
              <div>
                <span className="inline text-blue-500 font-semibold text-sm mr-1">
                  Ali Connors
                </span>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  I'll be in your neighborhood doing errands this weekend. Would you like to grab brunch together?
                </p>
                <div className="flex items-center gap-6">
                  <span className="text-gray-400 text-xs">📅 2 hours ago</span>
                  <span className="text-gray-400 text-xs">👥 3 people interested</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mx-6" />
        
        <div className="p-6 hover:bg-pink-50/50 transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-14 h-14 rounded-full border-4 border-pink-400 shadow-lg shadow-pink-400/30 bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white font-semibold text-lg">
                T
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-800">
                  Summer BBQ
                </h4>
                <div className="ml-auto flex items-center text-red-500">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                  <span className="text-xs font-medium">-8%</span>
                </div>
              </div>
              
              <div>
                <span className="inline text-pink-500 font-semibold text-sm mr-1">
                  to Scott, Alex, Jennifer
                </span>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Wish I could come, but I'm out of town this weekend. Let's plan for next month!
                </p>
                <div className="flex items-center gap-6">
                  <span className="text-gray-400 text-xs">📅 5 hours ago</span>
                  <span className="text-gray-400 text-xs">🍖 BBQ event</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mx-6" />
        
        <div className="p-6 hover:bg-cyan-50/50 transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-14 h-14 rounded-full border-4 border-cyan-400 shadow-lg shadow-cyan-400/30 bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-semibold text-lg">
                C
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-800">
                  Oui Oui
                </h4>
                <div className="ml-auto flex items-center text-green-500">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="text-xs font-medium">+22%</span>
                </div>
              </div>
              
              <div>
                <span className="inline text-cyan-500 font-semibold text-sm mr-1">
                  Sandra Adams
                </span>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Do you have Paris recommendations? Have you ever been to the Louvre? It's absolutely magical!
                </p>
                <div className="flex items-center gap-6">
                  <span className="text-gray-400 text-xs">📅 1 day ago</span>
                  <span className="text-gray-400 text-xs">🇫🇷 Travel discussion</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
