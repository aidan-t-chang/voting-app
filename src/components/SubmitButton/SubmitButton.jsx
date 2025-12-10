import React from 'react';
import './SubmitButton.css';

function SubmitButton({ onClick, text }) {
    return (
        <>
            <a className="submit-button" onClick={onClick}>
                {text}
            </a>
        </>
    )
}

export default SubmitButton;