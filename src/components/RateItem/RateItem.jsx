import React, { useState, useEffect } from 'react';
import './RateItem.css';

function RateItem({ foodId, foodName, currentRating, currentComment, onRate, onComment }) {
    const [rating, setRating] = useState(currentRating || 0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState(currentComment || "");

    useEffect(() => {
        setRating(currentRating || 0);
    }, [currentRating]);

    useEffect(() => {
        setComment(currentComment || "");
    }, [currentComment]);

    const handleCommentChange = (e) => {
        const newComment = e.target.value;
        setComment(newComment);
        if (onComment) {
            onComment(foodId, newComment);
        }
    };

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
                            onClick={() => onRate(foodId, ratingValue === rating ? 0 : ratingValue)}
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

                <textarea 
                    className="comment-input"
                    placeholder={ rating > 0 ? "Leave a comment (optional)" : "Rate item to leave a comment" }
                    value={comment}
                    onChange={handleCommentChange}
                    disabled = {rating === 0}
                />
            </div>
        </>
    )
}

export default RateItem;