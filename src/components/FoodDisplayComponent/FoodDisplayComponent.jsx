import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase.js';
import './FoodDisplayComponent.css';

// display one single food section - breakfast, lunch, or dinner
function FoodDisplayComponent({ title, items }) {
    if (!items || items.length === 0) {
        return null;
    }

    return (
        <>
            <div className="menu-section">
                <h3>{title}</h3>
                <ul className="menu-items">
                    {items.map((item ,index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            </div>
        </>
    );
}


export default FoodDisplayComponent;