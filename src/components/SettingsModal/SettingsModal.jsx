import React from 'react';
import './SettingsModal.css';

function SettingsModal({ isOpen, onClose }) {
    if (!isOpen) return null;
    return (
        <>
            <div id="settingsModal" className="modal">
                <div className="modal-content">
                    <span className="close" onClick={() => {
                        document.getElementById('settingsModal').classList.remove('open');
                    }}>&times;</span>
                    <h2>Settings</h2>
                    <p>Settings content goes here.</p>
                </div>
            </div>
        </>
    );
};

export default SettingsModal;
