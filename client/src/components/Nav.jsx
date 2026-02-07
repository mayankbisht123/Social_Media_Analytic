import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import dashContext from '../context/dashContext';


export default function Nav(props) {
  const [open, setOpen] = useState(false);
  const {insightVisibility,setInsightVisibility}=props
  const { reddit, ActivityFeed } = useContext(dashContext);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const handleInsight=()=>{
    setInsightVisibility(!insightVisibility)
  }
  const handleLoginAndLogout = () => {
    if (token) {
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <div className="mb-12 shadow-lg gradient-primary">
      {/* Main Navigation Bar */}
      <nav className="relative backdrop-blur-lg bg-white/10">
        <div className="px-6 py-4 flex items-center justify-start gap-6 w-full">
          {/* Menu Button */}
          <button
            onClick={toggleDrawer}
            className="mr-6 p-2 rounded-lg text-white hover:bg-white/10 hover:scale-110 transition-all duration-300"
            aria-label="menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className='flex items-center justify-between w-full'>
            {/* Title */}
            <button className='cursor-pointer' onClick={() => navigate('/')}>
              <h1 className="text-2xl font-bold text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                📊 Social Media Analytics Dashboard
              </h1>
            </button>
            <div className='flex gap-3'>
            {/* {Insight Button} */}
            <button className='text-4xl gap-2 outline-none focus-visible:outline-none bg-transparent focus:outline-none cursor-pointer'
                  onClick={handleInsight}>
              💡
            </button>
            {/* Login/Logout Button */}
            <Link to="/login" className="no-underline">
              <button
                onClick={handleLoginAndLogout}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:-translate-y-1 ${token
                  ? 'bg-red-500/90 border-2 border-red-500/30 hover:bg-red-500 hover:border-red-500/60 hover:shadow-lg hover:shadow-red-500/40'
                  : 'bg-green-500/90 border-2 border-green-500/30 hover:bg-green-500 hover:border-green-500/60 hover:shadow-lg hover:shadow-green-500/40'
                  }`}
              >
                {token ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Login
                  </>
                )}
              </button>
            </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Side Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={toggleDrawer}
          />

          {/* Drawer */}
          <div className="relative w-72 h-full gradient-primary text-white shadow-2xl">
            {/* Header */}
            <div className="p-6 text-center border-b border-white/10">
              <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center bg-white/20 rounded-full">
                📊
              </div>
              <h2 className="text-xl font-semibold">Dashboard</h2>
            </div>

            {/* Navigation Items */}
            <div className="p-4">
              <div className="space-y-2">
                <button
                  onClick={() => {
                    reddit();
                    toggleDrawer();
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-lg text-left hover:bg-white/10 hover:translate-x-2 transition-all duration-300"
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    📥
                  </div>
                  <span>Add Reddit</span>
                </button>
              </div>

              <div className="border-t border-white/10 my-4" />

              <div className="space-y-2">
                {['Activity'].map((text, index) => (
                  <button
                    key={text}
                    onClick={() => {
                      if (index == 0) {
                        navigate('/activity')
                        toggleDrawer()
                      }
                    }}
                    className="w-full flex items-center gap-4 p-4 rounded-lg text-left hover:bg-white/10 hover:translate-x-2 transition-all duration-300"
                  >
                    {/* <div className="w-8 h-8 flex items-center justify-center">
                      {index % 2 === 0 ? '📧' : '📮'}
                    </div> */}
                    <span className='ml-4'>{text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

