import React, { useState, useEffect } from 'react';
import { auth, db } from '../../../firebase';
import { onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import SettingsModal from '../SettingsModal/SettingsModal.jsx';
import ProfileModal from '../ProfileModal/ProfileModal.jsx';
import { generateRandomName } from '../../main.js';
import { collection, addDoc, query, where, getDocs, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import toast, { Toaster } from 'react-hot-toast';
import './Navbar.css';

var id = "";

async function addUserToFirestore(username, email, uid) { 
    try {
        const userDocRef = doc(db, 'users', uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            console.log("user already exists in database");
            id = uid;
            return;
        }

        await setDoc(userDocRef, {
            username: username,
            email: email,
            uid: uid,
            realNameToggled: true,
            hiddenName: generateRandomName(),
            numComments: 0,
            timeJoined: serverTimestamp(),
        });
        console.log("Document written with ID: ", uid);
        id = uid;
        console.log("User ID assigned: " + id);
    } catch (error) {
        console.error("Error adding document: ", error);
    }
}

function Navbar() {
    const [user, setUser] = useState(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [profileTrigger, setProfileTrigger] = useState(0);

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
            toast("Welcome, " + auth.currentUser.displayName);
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

    const handleSettingsSaved = () => {
        setProfileTrigger(prev => prev + 1);
    }
    // have another dropdown option to view all a user's rating history

    return (
        <nav className="navbar">
            <ul className="navbar-links">
                <li><a href="/" className="navbar-logo-li"><img src="/logo.png" alt="Logo" className="navbar-logo"/></a></li>
                <li><a href="/">Home</a></li>
                <li><a href="/rate">Rate</a></li>
                <li><a href="/leaderboard">Leaderboard</a></li>
                <li><a href="/about">About</a></li>

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
            {user && <SettingsModal 
            isOpen={isSettingsOpen} 
            onClose={() => setIsSettingsOpen(false)} 
            userUid={user.uid}
            onSettingsSaved={handleSettingsSaved}/>}
            {user && <ProfileModal 
            isOpen={isProfileOpen} 
            onClose={() => setIsProfileOpen(false)}  
            userUid={user.uid}
            updateTrigger={profileTrigger}/>}
        </nav>
    )
}

export default Navbar;
export { id };
