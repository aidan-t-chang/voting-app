import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react'
import Navbar from './components/Navbar/Navbar.jsx'
import './App.css'
import About from './pages/About.jsx';
import Login from './pages/Login.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Listing from './pages/Listing.jsx';
import Rate from './pages/Rate.jsx';
import Home from './pages/Home.jsx';
import Stats from './pages/Stats.jsx';


function App() {

  return (
    <>
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/listing" element={<Listing />} />
        <Route path="/rate" element={<Rate />} />
        <Route path="/about" element={<About />} />
        <Route path="/otherstats" element={<Stats />} />
      </Routes>
    </Router>
    </>
  );
}

export default App;