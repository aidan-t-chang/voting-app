import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase.js';
import FoodDisplayComponent from '../FoodDisplayComponent/FoodDisplayComponent';
import './FoodDisplay.css';

function FoodDisplay({ menuData }) {

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