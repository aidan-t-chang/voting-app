import React, {useState, useEffect} from 'react';
import Navbar from '../components/Navbar/Navbar.jsx';
import SubmitButton from '../Components/SubmitButton/SubmitButton.jsx';
import './style/Rate.css';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase.js';

function Rate() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    return (
        <>
            <Navbar />
            <div className="text-container">
                <h1 className="header">Rate Foods</h1>
            </div>
            <div className="voting-container">
                <div className="date-selector">
                    <label htmlFor="date">Select Date: </label>
                    <input
                        type="date"
                        id="date-picker"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        max={new Date().toISOString().split("T")[0]}
                    />
                </div>
            </div>

            {/* required things for the food rating:
                - calendar dropdown to select date (default should be today)
                - list of food items for that certain day
                - an option to select a rating for each food item (1-5 stars)
                - an optional place to leave comments
                - a submit button to submit the ratings and comments
             */}
        </>
    );
};

export default Rate;
