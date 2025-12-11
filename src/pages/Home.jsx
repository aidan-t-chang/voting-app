import React from 'react';
import Navbar from '../components/Navbar/Navbar.jsx';

function Home() {
    return (
        <>
            <Navbar />
            <p id="profileModal" style={{display: 'none'}}>Yallo</p>
            <div className="text-container">
                <h1 className="header">IMSA Food Rating</h1>
                <p>Welcome to the IMSA food rating app. This platform allows you to rate your favorite food items
                    and see what IMSA students think are the best food items. This is <strong>not</strong> an official site affiliated with
                    the Illinois Math & Science Academy. In order to
                    <a className="link" href="/rate"> rate foods</a>, you must first <a className="link" href="/login">log in</a> with a valid IMSA email address.
                </p>
            </div>
            <div className="text-container">
                <h2 className="subheader">Viewing Your Profile</h2>
                <p>After logging in or signing up, you will have access to your <a className="link" style={{cursor: 'pointer'}} onClick={() => {
                    document.getElementById('profileModal').style.display = 'block';
                }}>profile page</a>.
                By hovering in the top right hand corner over your name, a dropdown menu will appear with options to view your profile, settings, or log out.
                By default, your real name is hidden for privacy reasons, but this can be changed in the settings.
                </p>
            </div>
            <div className="text-container">
                <h2 className="subheader">Rating</h2>
                <p>To rate, navigate to the <a className="link" href="/rate">rating page</a> after logging in. 
                You will be presented with a list of food items, with the most recent meal served being at the top.
                Select a date and meal (breakfast, lunch, or dinner) to view the food items served before the current meal. 
                Use the search bar to find specific food items.
                Ratings are on a scale from 1 to 5 stars, with 5 being the highest rating. Only one rating can be submitted per meal.
                An optional comment can also be added to provide additional feedback about the meal.
                </p>
            </div>
            <div className="text-container">
                <h2 className="subheader">Food Listing</h2>
                <p>To view the food listing, navigate to the <a className="link" href="/listing">food listing page</a>. 
                The food listing displays all food items served at IMSA (from Jan 2026 onwards) along with their 
                average ratings and the comments. The foods are by default sorted by their average rating, but can be sorted by
                a multitude of other parameters such as number of votes, least liked, and frequency of the food item.
                </p>
            </div>
            <div className="text-container">
                <h2 className="subheader">Leaderboard</h2>
                <p>To view the leaderboard, navigate to the <a className="link" href="/leaderboard">leaderboard page</a>. 
                The leaderboard scores food items based on the following formula:  (formula). This scoring system
                (explanation of scoring system). The leaderboard can display by either the highest scored items or by the lowest scored items.
                </p>
            </div>
            <div className="text-container">
                <h2 className="subheader">Other Stats</h2>
                <p>To view other statistics, navigate to the <a className="link" href="/otherstats">other stats page</a>. 
                This page provides additional insights and statistics about you, other users, comments, and other relevant data.
                </p>
            </div>

        </>
    );
};

export default Home;