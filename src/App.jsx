import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react'
import Navbar from './components/Navbar/Navbar.jsx'
import './App.css'
import About from './pages/About.jsx';
// import Login from './pages/Login.jsx';
// import Leaderboard from './pages/Leaderboard.jsx';
// import Listing from './pages/Listing.jsx';
// import Vote from './pages/Vote.jsx';


function App() {

  return (
    <>
    <Router>
      <Navbar />
      <Routes>
        {/* <Route path="/login" element={<Login />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/listing" element={<Listing />} />
        <Route path="/vote" element={<Vote />} /> */}
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
    </>
  );
}

export default App;