import React from 'react';
import potLogo from '../assets/pot.png';
import './Loading.css';

function Loading({ message = "Simmering your recipes..." }) {
    return (
        <div className="loading-container">
            <div className="loading-content">
                <div className="pot-animation">
                    <img src={potLogo} alt="Loading Pot" className="loading-pot" />
                    <div className="steam-container">
                        <div className="steam steam-1"></div>
                        <div className="steam steam-2"></div>
                        <div className="steam steam-3"></div>
                    </div>
                </div>
                <p className="loading-message">{message}</p>
            </div>
        </div>
    );
}

export default Loading;
