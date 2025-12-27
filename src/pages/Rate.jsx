import React, {useState, useEffect} from 'react';
import Navbar from '../components/Navbar/Navbar.jsx';
import SubmitButton from '../Components/SubmitButton/SubmitButton.jsx';
import './style/Rate.css';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase.js';
import { fetchUserRatingsOnDate } from '../main.js';

function Rate() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [menuItems, setMenuItems] = useState({});

    useEffect(() => {
        fetchMenuItems();
    }, [selectedDate]);

    const fetchMenuItems = async () => {
        setLoading(true);
        try {
            const today = new Date().toISOString().split("T")[0];
            if (selectedDate == today) {
                const docRef = doc(db, "menu", "daily");
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();

                    // remove last_updated
                    const { last_updated, ...menuData } = data;
                    setMenuItems(menuData);
                }
            } else {
                const docRef = doc(db, "all-foods", selectedDate.toISOString().split("T")[0]);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setMenuItems({ "All Items": data.food || [] });
                } else {
                    setMenuItems({});
                }
            }

            // if the person is logged in
            if (auth.currentUser) {
                // problem with this implementation: it fetches for ratings on a certain date, but what if a user
                // rated food that is present today on a different date?

                // fix: have ratings stored for a food and not for a date
                const { ratings: existingRatings, comments: existingComments } = await fetchUserRatingsOnDate(
                    auth.currentUser.uid,
                    selectedDate
                );
            }
        } catch (e) {
            console.error("error fetching menu: ", e);
        } 
        setLoading(false);
    };     
    
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
