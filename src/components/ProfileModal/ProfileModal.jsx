import React, { useState, useEffect } from 'react';
import { findValueInUserDB } from '../../main.js'
import './ProfileModal.css';

function ProfileModal({ isOpen, onClose, userUid, updateTrigger }) {
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchDisplayName = async () => {
                setLoading(true);
                if (userUid) {
                    const realNameToggled = await findValueInUserDB(userUid, 'realNameToggled');
                    const name = realNameToggled ? await findValueInUserDB(userUid, 'username') : await findValueInUserDB(userUid, "hiddenName");
                    setDisplayName(name);
                }
                setLoading(false);
            };
            fetchDisplayName();
        }
    }, [userUid, updateTrigger, isOpen]);

    return (
        <>
            <div className={`profilemodal ${isOpen ? 'profileopen' : ''}`} onClick={onClose}>
                <div className="profilemodal-content" onClick={e => e.stopPropagation()}>
                    <span className="profileclose" onClick={onClose}>&times;</span>
                    {loading ? <p>Loading...</p> : (
                        <h1 className="profilemodal-header">{displayName}'s Profile</h1>
                    )}
                </div>
            </div>
        </>
    );
}

export default ProfileModal;
