import React from 'react';
import Navbar from '../components/Navbar/Navbar.jsx';
import './style/About.css';

function About() {

    return (
        <>
        <Navbar />
        <div className="text-container">
            <h1 className="header">About</h1>
            <p>This site was created so that there could be community-driven statistics on the 
                best food items available at the Illinois Math & Science Academy. 
                This project is entirely <a className="link" href="https://github.com/aidan-t-chang/voting-app">open source</a>. 
                <br></br><br></br>If you find any bugs, please <a className="link" href="https://github.com/aidan-t-chang/voting-app/issues">report them here </a>
                or <a className="link" href="mailto:achang1@imsa.edu">email me</a>.</p>
        </div>
        </>
    );
}

export default About;