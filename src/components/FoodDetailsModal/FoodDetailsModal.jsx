import React, { useState, useEffect, useDeferredValue } from 'react';
import { findFoodRatingsGivenFood, lookForUser } from '../../main.js';
import toast, { Toaster } from 'react-hot-toast';
import './FoodDetailsModal.css';

function FoodDetailsModal({ foodId, foodName, onClose }) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchComments = async () => {
            setLoading(true);

            try {
                const sanitized = foodId.replace(/\//g, '-');
                const ratingsData = await findFoodRatingsGivenFood(sanitized);

                if (ratingsData) {
                    const comments = await Promise.all(
                        Object.entries(ratingsData).map(async ([uid, data]) => {
                            if (data.comment && data.comment.trim().length > 0) {
                                const user = await lookForUser(uid);
                                if (user) {
                                    return {
                                        id: uid,
                                        author: user.realNameToggled ? user.username : user.hiddenName,
                                        rating: data.rating,
                                        text: data.comment,
                                        timestamp: data.time_submitted ? data.time_submitted.seconds * 1000 : Date.now(),
                                    };
                                }
                            }
                            return null;
                        })
                    );
                    
                    setComments(comments.filter(c => c !== null).sort((a, b) => b.timestamp - a.timestamp));
                }
            } catch (e) {
                console.error("error fetching comments:", e);
                toast.error("Failed to load comments. Please try again later.");
            }
            setLoading(false);
        }
        if (foodId) {
            fetchComments();
        }
    }, [foodId]);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>&times;</button>
                <h2 className="header" style={{marginTop: 25}}>{foodName}</h2>
                <div className="comments-section">
                    <h3>Recent Comments</h3>
                    {loading ? (
                        <p>Loading comments...</p>
                    ) : comments.length > 0 ? (
                        <ul className="comments-list">
                            {comments.map((comment, index) => (
                                <li key={index} className="comment-item">
                                    <div className="comment-header">
                                        <div className="comment-user-info">
                                            <span className="comment-author">{comment.author}</span>
                                            <span className="comment-date">
                                                {new Date(comment.timestamp).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </span>
                                        </div>
                                        <span className="comment-rating">
                                            {'⭐'.repeat(comment.rating)}
                                        </span>

                                    </div>
                                    <p className="comment-text">{comment.text}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No comments yet for this item.</p>
                    )}
                </div>
            </div>

        </div>
    )
}

export default FoodDetailsModal;