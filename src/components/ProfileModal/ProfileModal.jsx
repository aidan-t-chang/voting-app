import React, { useState, useEffect } from 'react';
import { findValueInUserDB, findFoodRatingsGivenUid } from '../../main.js'
import './ProfileModal.css';

function ProfileModal({ isOpen, onClose, userUid, updateTrigger }) {
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);
    const [joinDate, setJoinDate] = useState('');
    const [avgRating, setAvgRating] = useState('N/A');
    const [numComments, setNumComments] = useState(0);
    const [userComments, setUserComments] = useState([]);

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                setLoading(true);
                if (userUid) {
                    const realNameToggled = await findValueInUserDB(userUid, 'realNameToggled');
                    const name = realNameToggled ? await findValueInUserDB(userUid, 'username') : await findValueInUserDB(userUid, "hiddenName");
                    setDisplayName(name);

                    const joined = await findValueInUserDB(userUid, 'timeJoined');
                    if (joined && joined.toDate) {
                        setJoinDate(joined.toDate().toLocaleDateString());
                    } else {
                        setJoinDate("Unknown");
                    }

                    const ratings = await findFoodRatingsGivenUid(userUid);
                    let totalRating = 0;
                    let ratingCount = 0;
                    let commentCount = 0;
                    let commentsList = [];

                    if (ratings) {
                        Object.entries(ratings).forEach(([foodId, r]) => {
                            if (r.rating > 0) {
                                totalRating += r.rating;
                                ratingCount++;
                            }
                            if (r.comment && r.comment.trim().length > 0) {
                                commentsList.push({
                                    foodName: foodId.replace(/-/g, ' '),
                                    rating: r.rating,
                                    text: r.comment,
                                    timestamp: r.time_submitted ? r.time_submitted.seconds * 1000 : Date.now()
                                });
                            }
                        });
                    }

                    commentsList.sort((a, b) => b.timestamp - a.timestamp);
                    setUserComments(commentsList);
                    setAvgRating(ratingCount > 0 ? (totalRating / ratingCount).toFixed(2) : 'N/A');
                    setNumComments(commentsList.length);
                }
                setLoading(false);
            };
            fetchData();
        }
    }, [userUid, updateTrigger, isOpen]);

    return (
        <>
            <div className={`profilemodal ${isOpen ? 'profileopen' : ''}`} onClick={onClose}>
                <div className="profilemodal-content" onClick={e => e.stopPropagation()}>
                    <span className="profileclose" onClick={onClose}>&times;</span>
                    {loading ? <p>Loading...</p> : (
                        <>
                            <h1 className="profilemodal-header">{displayName}'s Profile</h1>
                            {joinDate !== 'Unknown' && (
                                <p className="profile-subtitle">Joined: {joinDate}</p>
                            )}
                            <div className="profile-stats">
                                <div className="stat-column">
                                    <h3>Average Rating</h3>
                                    <p>{avgRating}</p>
                                </div>
                                <div className="stat-column">
                                    <h3>Comments</h3>
                                    <p>{numComments}</p>
                                </div>
                            </div>

                            {userComments.length > 0 && (
                                <div className="profile-comments-section">
                                    <h3>Comment History</h3>
                                    <ul className="profile-comments-list">
                                        {userComments.map((comment, index) => (
                                            <li key={index} className="comment-item">
                                                <div className="comment-header">
                                                    <div className="comment-user-info">
                                                        <span className="comment-author">{comment.foodName}</span>
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
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

export default ProfileModal;
