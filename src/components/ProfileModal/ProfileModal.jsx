import React, { useState, useEffect } from 'react';
import { generateRandomName } from '../../main.js';
import './ProfileModal.css';

function ProfileModal({ isOpen, onClose, user }) {
    const [showRealName, setShowRealName] = useState(false);
    const randomName = generateRandomName(); // in the future will be pulled from the database

    const displayName = showRealName ? user.name : randomName;
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