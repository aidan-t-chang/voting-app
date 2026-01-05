import React, {useState, useEffect} from 'react';
import Navbar from '../components/Navbar/Navbar.jsx';
import SubmitButton from '../Components/SubmitButton/SubmitButton.jsx';
import './style/Rate.css';
import { doc, getDoc, setDoc, deleteField, serverTimestamp } from 'firebase/firestore';
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
                    const hasMealSections = ['Breakfast', 'Lunch', 'Dinner'].some(meal => data[meal] && Array.isArray(data[meal]));

                    if (hasMealSections) {
                        currentMenu = data;
                    } else if (data.food && Array.isArray(data.food)) {
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

        const originalEntry = userRatings[foodId] || { rating: 0, comment: "" };
        const curPending = pendingRatings[foodId] || originalEntry;

        const newEntry = {
            ...curPending, // merge existing comment if there is one
            rating: rating,
            time_submitted: serverTimestamp()
        }

        const isRatingSame = newEntry.rating === (originalEntry.rating);

        // if there is a rating that is 0, remove from pendingRatings
        if (isRatingSame) {
            setPendingRatings(prev => {
                const newState = { ...prev };
                delete newState[foodId];
                return newState;
            });
        } else {
            setPendingRatings(prev => ({ ...prev, [foodId]: newEntry }));
        }
    };

    const handleComment = (foodId, comment) => {
        if (!auth.currentUser) {
            return;
        }

        const originalEntry = userRatings[foodId] || { rating: 0, comment: "" };
        const curPending = pendingRatings[foodId] || originalEntry;

        const newEntry = {
            ...curPending, // merge existing comment if there is one
            comment: comment,
            time_submitted: serverTimestamp()
        }

        const isRatingSame = newEntry.rating === (originalEntry.rating);

        // if there is a rating that is 0, remove from pendingRatings
        if (isRatingSame) {
            setPendingRatings(prev => {
                const newState = { ...prev };
                delete newState[foodId];
                return newState;
            })
        } else {
            setPendingRatings(prev => ({ ...prev, [foodId]: newEntry }));
        }
    }


    const submitRatings = async () => {
        console.log("Submitting ratings")
        if (Object.keys(pendingRatings).length === 0) {
            return;
        }

        setLoading(true);
        try {
            const userRatingsRef = doc(db, 'ratings-userid', auth.currentUser.uid);

            // check for 0 ratings (cleared ratings) before submitting to db
            const userUpdates = {};
            Object.entries(pendingRatings).forEach(([key, val]) => {
                if (val.rating > 0) {
                    userUpdates[key] = val;
                } else {
                    userUpdates[key] = deleteField();
                }
            });

            await setDoc(userRatingsRef, userUpdates, { merge: true });

            const batchPromises = Object.entries(pendingRatings).map( async ([foodId, ratingData]) => {
                const newFoodId = foodId.replace(/\//g, '-');
                const foodRatingsRef = doc(db, 'ratings-foodname', newFoodId);

                await setDoc(foodRatingsRef, { [auth.currentUser.uid]: ratingData }, { merge: true });
            });

            await Promise.all(batchPromises);

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

                        const entry = pendingRatings[foodId] !== undefined ? 
                            pendingRatings[foodId] : userRatings[foodId];

                        const displayRating = entry?.rating || 0;
                        const displayComment = entry?.comment || "";

                            return (
                                <RateItem
                                    key={foodId}
                                    foodId={foodId}
                                    foodName={details.name}
                                    currentRating={displayRating}
                                    currentComment={displayComment}
                                    onRate={handleRate}
                                    onComment={handleComment}
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
                    {Object.keys(menuItems).length === 0 && <p>No menu items found for this date.</p>}
                    <div className={`submit-section ${hasChanges ? 'visible' : ''}`}>
                        {hasChanges && (
                            <SubmitButton
                            onClick={submitRatings}
                            text={loading ? "Saving..." : 
                                (Object.keys(pendingRatings).length === 1 ? "Save 1 Rating" : `Save ${Object.keys(pendingRatings).length} Ratings`)
                            }></SubmitButton>
                        )}
                    </div>
                </div>
            )}


        </>
    );
};

export default Rate;
