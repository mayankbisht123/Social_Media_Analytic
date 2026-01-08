import { useState } from 'react'
import Nav from './components/Nav';
import './App.css'
import Home from './pages/Home';
import Login from './pages/Login';
import DetailedInfo from './pages/DetailedInfo';
import DashState from './context/dashState';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";
import ActivityFeed from './pages/ActivityFeed';

function App() {

  return (
    <>
      
        <Router>
        <DashState>
          <Nav />
          <Routes>
            <Route element={<Home />} path='/' />
            <Route element={<Login />} path='/login' />
            <Route element={<DetailedInfo/>} path='/info/:type'/>
            <Route element={<ActivityFeed/>} path='/activity'/>
          </Routes>
          </DashState>
        </Router>
      
    </>
  )
}

export default App
