import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar/Navbar.jsx';
import FoodDisplay from '../components/FoodDisplay/FoodDisplay.jsx'; 
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase.js';
import './style/Home.css';

function Home() {
    const [menuData, setMenuData] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const docRef = doc(db, "menu", "daily");
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setMenuData(data);

                    if (data.last_updated) {
                        const date = data.last_updated.toDate();
                        setLastUpdated(date.toLocaleString() + " CST");
                    }
                }
            } catch (e) {
                console.error("error fetching menu: ", e);
            }
        };

        fetchMenu();
    }, []);

    return (
        <>
            <Navbar />
            <div className="text-container">
                <h1 className="header">IMSA Food Rating</h1>
                <p>Welcome to the IMSA food rating app. This platform allows you to rate your favorite food items
                    and see what IMSA students think are the best food items. This is <strong>not</strong> an official site affiliated with
                    the Illinois Math & Science Academy. In order to
                    <a className="link" href="/rate"> rate foods</a>, you must first log in with a valid IMSA email address.
                    <br /><br /><strong>The <a className="link" href="/leaderboard">leaderboard</a> is updated every day at 10 PM CST.</strong>
                </p>
            </div>
            <div className="text-container">
                <div className="title-and-update">
                    <h1 className="header">Today's Food</h1>
                    {lastUpdated && (
                        <span className="last-updated">
                            (Last Updated: {lastUpdated})
                        </span>
                    )}
                </div>
                <FoodDisplay menuData={menuData}/>
            </div>

        </>
    );
};

export default Home;