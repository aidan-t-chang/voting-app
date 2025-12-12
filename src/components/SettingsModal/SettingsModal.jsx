import React from 'react';
import './SettingsModal.css';

function SettingsModal({ isOpen, onClose }) {
    return (
        <>
            <div className={`modal ${isOpen ? 'open' : ''}`} onClick={onClose}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <span className="close" onClick={onClose}>&times;</span>
                    <h1 className="modal-header">Settings</h1>
                    <input type="checkbox" id="showRealName" name="showRealName" />
                    <label htmlFor="showRealName"> Show Real Name on Profile</label><br/><br/>
                    {/* update onclick later */}
                    <button id="saveChangesButton">Save Changes</button>
                </div>
            </div>
        </>
    );
};

export default SettingsModal;
