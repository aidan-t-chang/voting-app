import React, { useState } from 'react';
import SubmitButton from '../components/SubmitButton/SubmitButton.jsx';
import './style/Login.css';


{/* Login page is a modal for both login and registration */}
function Login() {
    return (
        <>
          <div className="border-container">
            <SubmitButton text="Login with Google" onClick = {() => {
              {/* fill this out later */}

            }} />
          </div>
        </>
    );
};

export default Login;