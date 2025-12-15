import React, { useState, useEffect } from 'react';
import { queryFirestoreDB } from '../../main.js'
import './ProfileModal.css';

function ProfileModal({ isOpen, onClose, user }) {
    const displayName = queryFirestoreDB("users", "realNameToggled", true);
    console.log(displayName);
    return (
        <>
            <div className={`profilemodal ${isOpen ? 'profileopen' : ''}`} onClick={onClose}>
                <div className="profilemodal-content" onClick={e => e.stopPropagation()}>
                    <span className="profileclose" onClick={onClose}>&times;</span>
                    <h1 className="profilemodal-header">hello Profile</h1>
                </div>
            </div>
        </>
    );
}

export default ProfileModal;