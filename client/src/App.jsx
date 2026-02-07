import { useState } from 'react'
import Nav from './components/Nav';
import './App.css'
import Home from './pages/Home';
import Login from './pages/Login';
import DetailedInfo from './pages/DetailedInfo';
import DashState from './context/DashState';
import InsightAgent from './components/InsightAgent';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";
import ActivityFeed from './pages/ActivityFeed';

function App() {
  const [insightVisibility, setInsightVisibility] = useState(false)
  return (
    <div className='flex w-full h-screen overflow-hidden'>
      <DashState>
        <div className={`Main-content overflow-y-auto ${insightVisibility ? 'w-3/5' : 'w-full'}`}>
          <Router>
            <Nav insightVisibility={insightVisibility} setInsightVisibility={setInsightVisibility} />
            <Routes>
              <Route element={<Home />} path='/' />
              <Route element={<Login />} path='/login' />
              <Route element={<DetailedInfo />} path='/info/:type' />
              <Route element={<ActivityFeed />} path='/activity' />
            </Routes>
          </Router>
        </div>
        <div className={`Insight break-words overflow-y-auto ${insightVisibility ? 'w-2/5 z-50' : 'hidden'}`}>
          <InsightAgent />
        </div>
      </DashState>
    </div>
  )
}

export default App
