import React, { useState, useEffect } from 'react';
import { findValueInUserDB } from '../../main.js'
import './ProfileModal.css';

function ProfileModal({ isOpen, onClose, userUid }) {
    const [displayName, setDisplayName] = useState('');

    useEffect(() => {
        const fetchDisplayName = async () => {
            if (userUid) {
                const realNameToggled = await findValueInUserDB(userUid, 'realNameToggled');
                const name = realNameToggled ? await findValueInUserDB(userUid, 'username') : await findValueInUserDB(userUid, "hiddenName");
                setDisplayName(name);
            }
        };
        fetchDisplayName();
    }, [userUid]);

    return (
        <>
            <div className={`profilemodal ${isOpen ? 'profileopen' : ''}`} onClick={onClose}>
                <div className="profilemodal-content" onClick={e => e.stopPropagation()}>
                    <span className="profileclose" onClick={onClose}>&times;</span>
                    <h1 className="profilemodal-header">{displayName}'s Profile</h1>
                </div>
            </div>
        </>
    );
}

export default ProfileModal;
