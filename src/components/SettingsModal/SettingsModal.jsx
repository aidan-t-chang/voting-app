import React, { useEffect, useState} from 'react';
import { findValueInUserDB, updateDBValue } from '../../main.js'
import './SettingsModal.css';

function SettingsModal({ isOpen, onClose, userUid }) {
    const [showRealName, setShowRealName] = useState(false);

    useEffect(() => {
        const checkToDisplayRealName = async () => {
            const RealName = await findValueInUserDB(userUid, 'realNameToggled');
            if (RealName === false) {
                setShowRealName(false);
                console.log('the settings modal has found that the real name should not be shown on the profile');
            }
            else {
                setShowRealName(true);
                console.log('the settings modal has found that the real name should be shown on the profile');
            }
        }
        checkToDisplayRealName();
    }, [userUid])

    const handleChanges = async () => {
        if (showRealName) {
            await updateDBValue(userUid, 'realNameToggled', false);
            setShowRealName(false);
        } else {
            await updateDBValue(userUid, 'realNameToggled', true);
            setShowRealName(true);
        }
        console.log('changes have been saved');
    }
    return (
        <>
            <div className={`modal ${isOpen ? 'open' : ''}`} onClick={onClose}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <span className="close" onClick={onClose}>&times;</span>
                    <h1 className="modal-header">Settings</h1>
                    <input type="checkbox" id="showRealName" name="showRealName" checked={showRealName} onChange={(e) => setShowRealName(e.target.checked)}/>
                    <label htmlFor="showRealName"> Show Real Name on Profile</label><br/><br/>
                     
                    <button id="saveChangesButton" onClick={handleChanges}>Save Changes</button>
                </div>
            </div>
        </>
    );
};

export default SettingsModal;
