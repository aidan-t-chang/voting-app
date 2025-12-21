import React from 'react';
import Navbar from '../components/Navbar/Navbar.jsx';
import FoodDisplay from '../components/FoodDisplay/FoodDisplay.jsx'; 

function Home() {
    return (
        <>
            <Navbar />
            <div className="text-container">
                <h1 className="header">IMSA Food Rating</h1>
                <p>Welcome to the IMSA food rating app. This platform allows you to rate your favorite food items
                    and see what IMSA students think are the best food items. This is <strong>not</strong> an official site affiliated with
                    the Illinois Math & Science Academy. In order to
                    <a className="link" href="/rate"> rate foods</a>, you must first log in with a valid IMSA email address.
                </p>
            </div>
            <div className="text-container">
                <h1 className="header">Today's Food</h1>
                <FoodDisplay />
            </div>

        </>
    );
};

export default Home;