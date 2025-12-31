import React, { useState, useEffect } from 'react';
import './RateItem.css';

function RateItem({ foodId, foodName, currentRating, onRate }) {
    const [rating, setRating] = useState(currentRating || 0);
    const [hover, setHover] = useState(0);

    useEffect(() => {
        setRating(currentRating || 0);
    }, [currentRating]);

    return (
        <>
            <div className="rate-item-card">
                <h3 className="food-name">{foodName}</h3>
                <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star, index) => {
                        const ratingValue = index + 1;
                        return (
                            <button
                            type="button"
                            key={index}
                            className={ratingValue <= (hover || rating) ? "star-button on" : "star-button off"}
                            onClick={() => onRate(foodId, ratingValue)}
                            onMouseEnter={() => setHover(ratingValue)}
                            onMouseLeave={() => setHover(rating)}
                            >
                                <span className="star">&#9733;</span>
                            </button>
                        );
                    })}
                </div>
                {currentRating > 0 ? (
                    <p className="rated-text">You rated this {currentRating} out of 5 stars.</p>
                ) : (
                    <p className="rated-text placeholder">Rate this item</p>
                )}
            </div>
        </>
    )
}

export default RateItem;