import React from 'react';
import Navbar from '../components/Navbar/Navbar.jsx';

function Home() {
    return (
        <>
            <Navbar />
            <div className="text-container">
                <h1 className="header">Home</h1>
                <p>Welcome to the ISMA food voting app. This platform allows you to vote for your favorite food items
                    and see what IMSA students think are the best food items. This is <strong>not</strong> an official site affiliated with
                    the Illinois Math & Science Academy. In order to
                    <a className="link" href="/vote"> vote</a>, you must first <a className="link" href="/login">log in</a> with a valid IMSA email address.
                    
                </p>
            </div>
        </>
    );
};

export default Home;