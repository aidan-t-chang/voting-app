import React, { useState, useEffect } from 'react';
import { auth, db } from '../../../firebase';
import { onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import SettingsModal from '../SettingsModal/SettingsModal.jsx';
import ProfileModal from '../ProfileModal/ProfileModal.jsx';
import { generateRandomName, queryFirestoreDB } from '../../main.js';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import './Navbar.css';

async function addUserToFirestore(username, email, uid) { 
    try {
        const q = query(collection(db, 'users'), where('uid', '==', uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            console.log("user already exists in database");
            return;
        }

        const docRef = await addDoc(collection(db, 'users'), {
            username: username,
            email: email,
            uid: uid,
            realNameToggled: false,
            hiddenName: generateRandomName(),
        });
        console.log("Document written with ID: ", docRef.id);
    } catch (error) {
        console.error("Error adding document: ", error);
    }
}

function Navbar() {
    const [user, setUser] = useState(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

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
        provider.setCustomParameters({ hd: 'imsa.edu'});
        try {
            await signInWithPopup(auth, provider);
            console.log('User signed in successfully. What\'s up ' + auth.currentUser.displayName);
            console.log('If you see this message, come see me in person and I\'ll give you a dollar.');
            try {
                await addUserToFirestore(auth.currentUser.displayName, auth.currentUser.email, auth.currentUser.uid);
                console.log('User added to Firestore/signed in successfully');
            } catch (e) {
                console.error('Error adding user to Firestore:', e);
            }
        } catch (error) {
            console.error('Error signing in: ', error);
        }
    };

    const openSettings = (e) => {
        e.preventDefault();
        setIsSettingsOpen(true);
    }

    const openProfile = (e) => {
        e.preventDefault();
        setIsProfileOpen(true);
    }

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
                            <a href="#" className="navbar-user" onClick={openSettings} >Settings</a>
                            <a href="#" className="navbar-user" onClick={openProfile}>Profile</a>
                            <a href="#" onClick={handleLogout}>Logout</a>
                        </div>
                    </li>
                ): (
                    <li style={{float:'right'}}>
                        <a href="#" onClick={handleLogin}>Login/Sign Up</a>
                    </li>
                )}
            </ul>
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)}  user={user}/>
        </nav>
    )
}

export default Navbar;