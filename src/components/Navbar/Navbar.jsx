import React, { useState, useEffect } from 'react';
import { auth } from '../../../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './Navbar.css';

function Navbar() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            console.log('User signed out successfully');
        } catch (error) {
            console.error('Error signing out: ', error);
        }
    };

    return (
        <nav className="navbar">
            <ul className="navbar-links">
                <li><a href="/" className="navbar-logo-li"><img src="/logo.png" alt="Logo" className="navbar-logo"/></a></li>
                <li><a href="/">Home</a></li> {/*where users can view highlights (top-rated, lowest-rated)*/} 
                <li><a href="/vote">Vote</a></li>
                <li><a href="/listing">Food Listing</a></li>
                <li><a href="/leaderboard">Leaderboard</a></li>
                <li><a href="/otherstats">Other Stats</a></li>
                <li><a href="/about">About</a></li>


                {/* dynamic */}
                {user ? (
                    <li style={{float: 'right'}}>
                        <a href="#" onClick={handleLogout}>Logout</a>
                    </li>
                ): (
                    <li style={{float:'right'}}>
                        <a href="/login">Login/Sign Up</a>
                    </li>
                )}
            </ul>
        </nav>
    )
}

export default Navbar;