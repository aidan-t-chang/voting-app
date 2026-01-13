import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react'
import Navbar from './components/Navbar/Navbar.jsx'
import './App.css'
import About from './pages/About.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Listing from './pages/Listing.jsx';
import Rate from './pages/Rate.jsx';
import Home from './pages/Home.jsx';
import Toast, { Toaster } from 'react-hot-toast';


function App() {

  return (
    <>
    <div><Toaster position="bottom-right"/></div>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/listing" element={<Listing />} />
        <Route path="/rate" element={<Rate />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
    </>
  );
}

export default App;