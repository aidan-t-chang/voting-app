import React, { useState, useEffect } from 'react';
import { findValueInUserDB, findFoodRatingsGivenUid } from '../../main.js'
import './ProfileModal.css';

function ProfileModal({ isOpen, onClose, userUid, updateTrigger }) {
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);
    const [joinDate, setJoinDate] = useState('');
    const [avgRating, setAvgRating] = useState('N/A');
    const [numComments, setNumComments] = useState(0);

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
                    if (ratings) {
                        Object.values(ratings).forEach(r => {
                            if (r.rating > 0) {
                                totalRating += r.rating;
                                ratingCount++;
                            }
                            if (r.comment && r.comment.trim().length > 0) {
                                commentCount++;
                            }
                        });
                    }
                    setAvgRating(ratingCount > 0 ? (totalRating / ratingCount).toFixed(2) : 'N/A');
                    setNumComments(commentCount);
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
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

export default ProfileModal;
