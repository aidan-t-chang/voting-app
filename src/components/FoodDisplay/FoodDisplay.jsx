import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase.js';
import FoodDisplayComponent from '../FoodDisplayComponent/FoodDisplayComponent';

function FoodDisplay() {
    const [menuData, setMenuData] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const docRef = doc(db, "menu", "daily");
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setMenuData(docSnap.data());
                }
            } catch (e) {
                console.error("error fetching menu data: ", e);
            } finally {
                setLoading(false);
            }
        };

        fetchMenu();
    }, []);

    if (loading) {
        return <p>Loading...</p>
    }
    if (!menuData) {
        return <p>No menu available.</p>
    }

    return (
        <div className="food-display-container">
            <FoodDisplayComponent title="Breakfast" items={menuData.Breakfast} />
            <FoodDisplayComponent title="Lunch" items={menuData.Lunch} />
            <FoodDisplayComponent title="Dinner" items={menuData.Dinner} />
        </div>
    )
}


export default FoodDisplay;