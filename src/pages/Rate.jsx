import React, {useState, useEffect} from 'react';
import Navbar from '../components/Navbar/Navbar.jsx';
import SubmitButton from '../Components/SubmitButton/SubmitButton.jsx';
import './style/Rate.css';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase.js';
import { findFoodRatingsGivenUid, findFoodRatingsGivenFood } from '../main.js';
import RateItem from '../components/RateItem/RateItem.jsx';
import toast, { Toaster } from 'react-hot-toast';

function Rate() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [loading, setLoading] = useState(false);
    const [menuItems, setMenuItems] = useState({});
    const [userRatings, setUserRatings] = useState({});
    const [foodDetails, setFoodDetails] = useState({});
    const [pendingRatings, setPendingRatings] = useState({});

    useEffect(() => {
        fetchMenuItems();
        setPendingRatings({});
    }, [selectedDate]);

    const fetchMenuItems = async () => {
        setLoading(true);
        try {
            const today = new Date().toISOString().split("T")[0];
            let currentMenu = {};

            if (selectedDate == today) {
                const docRef = doc(db, "menu", "daily");
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();

                    // remove last_updated
                    const { last_updated, ...menuData } = data;
                    currentMenu = menuData;
                    setMenuItems(menuData);
                }
            } else {
                const docRef = doc(db, "all-foods", String(selectedDate));
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.food && Array.isArray(data.food)) {
                        currentMenu = { "All Items": data.food };
                    } else {
                        currentMenu = data;
                    }
                    setMenuItems(currentMenu);
                } else {
                    setMenuItems({});
                }
            }

            if (auth.currentUser) {
                const user_ratings = await findFoodRatingsGivenUid(auth.currentUser.uid); 
                setUserRatings(user_ratings || {});

                // get the menu items without breakfast, lunch, dinner
                const allFoodIds = new Set();
                Object.values(currentMenu).forEach(items => {
                    if (Array.isArray(items)) {
                        items.forEach(foodId => allFoodIds.add(foodId))
                    }
                });

                if (allFoodIds.size > 0) {
                    const foodPromises = Array.from(allFoodIds).map(foodId => getDoc(doc(db, 'foods', foodId.replace(/\//g, '-'))));
                    const foodSnapshots = await Promise.all(foodPromises);

                    const details = {};
                    foodSnapshots.forEach(snap => {
                        if (snap.exists()) {
                            details[snap.id] = snap.data();
                        }
                    });
                    setFoodDetails(details);
                } else {
                    setFoodDetails({});
                }
            }
        } catch (e) {
            console.error("error fetching menu: ", e);
        } 
        setLoading(false);
    };     

    const handleRate = (foodId, rating) => {
        if (!auth.currentUser) {
            toast.error("You must be logged in to rate food items.");
            return;
        }
        setPendingRatings(prev => ({
            ...prev, [foodId]: rating
        }));
    };

    const submitRatings = async () => {
        console.log("Submitting ratings.")
        if (Object.keys(pendingRatings).length === 0) {
            return;
        }

        setLoading(true);
        try {
            const userRatingsRef = doc(db, 'ratings-userid', auth.currentUser.uid);

            await setDoc(userRatingsRef, pendingRatings, { merge: true });
            setUserRatings(prev => ({
                ...prev, ...pendingRatings 
            }));
            setPendingRatings({});
            toast.success("Ratings submitted successfully!");
            console.log("ratings submitted successfully");
        } catch (e) {
            toast.error("Error submitting ratings. Please try again.");
            console.error("error submitting ratings: ", e);
        }
        setLoading(false);
    }
    
    const isWeekend = (dateString) => {
        const day = new Date(dateString + "T12:00:00").getDay();
        return day === 0 || day === 6;
    }

    const renderMealSection = (mealName) => {
        const items = menuItems[mealName];
        if (!items || items.length === 0) {
            return null;
        }

        return (
            <div key={mealName} className="meal-section">
                <h2 className="meal-header">{mealName}</h2>
                <div className="meal-items-grid">
                    {items.map(foodId => {
                        const details = foodDetails[foodId];
                        if (!details) return null;

                        const displayRating = pendingRatings[foodId] !== undefined ?
                            pendingRatings[foodId] : userRatings[foodId];

                            return (
                                <RateItem
                                    key={foodId}
                                    foodId={foodId}
                                    foodName={details.name}
                                    currentRating={displayRating}
                                    onRate={handleRate}
                                />
                            );
                    })}
                </div>
            </div>
        );
    };

    const getMealsToDisplay = () => {
        const availableMeals = Object.keys(menuItems);
        if (availableMeals.includes("All Items")) {
            return ["All Items"];
        }

        let preferredOrder = [];
        if (isWeekend(selectedDate)) {
            preferredOrder = ["Lunch", "Dinner"];
        } else {
            preferredOrder = ["Breakfast", "Lunch", "Dinner"];
        }
        
        return preferredOrder.filter(meal => availableMeals.includes(meal));
    };

    const hasChanges = Object.keys(pendingRatings).length > 0;

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

            {loading && Object.keys(menuItems).length === 0 ? (
                <p>Loading menu items...</p>
            ) : (
                <div className="meals-container">
                    {getMealsToDisplay().map(meal => renderMealSection(meal))}
                    {Object.keys(menuItems).length > 0 && <p>No menu items found for this date.</p>}
                </div>
            )}

            <div className={`submit-section ${hasChanges ? 'visible' : ''}`}>
                {hasChanges && (
                    <SubmitButton
                    onClick={submitRatings}
                    text={loading ? "Saving..." : 
                        (Object.keys(pendingRatings).length === 1 ? "Save 1 Rating" : `Save ${Object.keys(pendingRatings).length} Ratings`)
                    }></SubmitButton>
                )}
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
