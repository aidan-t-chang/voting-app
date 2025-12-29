import React, {useState, useEffect} from 'react';
import Navbar from '../components/Navbar/Navbar.jsx';
import SubmitButton from '../Components/SubmitButton/SubmitButton.jsx';
import './style/Rate.css';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase.js';
import { findFoodRatingsGivenUid, findFoodRatingsGivenFood } from '../main.js';

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
                // a dict of ratings + comments from the user
                // fooditem: rating
                const user_ratings = await findFoodRatingsGivenUid(auth.currentUser.uid); 
                // have two rating collections: one with food id as document, one with user id as document
                // for the rating-userid collection, the key-value in the collection is food_id  then everything else
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

            {/* idea: have all items located under rate, with today's food items highlighted a certain color for each meal
            still have the calendar, but changing the date would change which items are highlighted
            this way the user clicks less and stats can be displayed for all food items:
            - total ratings + average rating
            - show comments button
            - last seen
            */}
        </>
    );
};

export default Rate;
