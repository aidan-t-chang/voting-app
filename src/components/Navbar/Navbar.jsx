import React, { useState, useEffect } from 'react';
import { auth } from '../../../firebase';
import { onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
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

    const handleLogin = async (e) => {
        e.preventDefault();
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            console.log('User signed in successfully. What\'s up ' + auth.currentUser.displayName);
            console.log('If you see this image, come see me in person and I\'ll give you a dollar.');
            // account creation is automatically handled by Firebase
        } catch (error) {
            console.error('Error signing in: ', error);
        }
    };

    return (
        <nav className="navbar">
            <ul className="navbar-links">
                <li><a href="/" className="navbar-logo-li"><img src="/logo.png" alt="Logo" className="navbar-logo"/></a></li>
                <li><a href="/">Home</a></li>
                <li><a href="/rate">Rate</a></li>
                <li><a href="/listing">Food Listing</a></li>
                <li><a href="/leaderboard">Leaderboard</a></li>
                <li><a href="/otherstats">Other Stats</a></li>
                <li><a href="/about">About</a></li>


                {/* if user is logged in, turn this into a dropdown with profile/settings options later */}
                {user ? (
                    <li className="dropdown" style={{float: 'right'}}>
                        <div className="navbar-user-main">Hello, {user.displayName}</div>
                        <div className="dropdown-content">
                            <a href="#" className="navbar-user">Settings</a>
                            <a href="#" className="navbar-user">Profile</a>
                            <a href="#" onClick={handleLogout}>Logout</a>
                        </div>
                    </li>
                ): (
                    <li style={{float:'right'}}>
                        <a href="#" onClick={handleLogin}>Login/Sign Up</a>
                    </li>
                )}
            </ul>
        </nav>
    )
}

export default Navbar;