import React from 'react';
import './Navbar.css';

function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <a href="/">ISMA Food Rating</a>
            </div>
            <ul className="navbar-links">
                <li><a href="/">Home</a></li> {/*where users can view highlights (top-rated, lowest-rated)*/} 
                <li><a href="/vote">Vote</a></li>
                <li><a href="/listing">Food Listing</a></li>
                <li><a href="/about">About</a></li>
            </ul>
        </nav>
    )
}

export default Navbar;