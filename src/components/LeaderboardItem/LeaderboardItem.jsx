import React, { useState, useEffect } from 'react';
import './LeaderboardItem.css';

// do need to update foods collection items to store a yesterday's rankings field

function LeaderboardItem({ rank, name, averageRating, numRatings, onClick, previousRank }) {
    let trend = 'neutral'; // up, down, neutral
    let change = 0;

    if (previousRank) {
        change = previousRank - rank;
        if (change > 0) {
            trend = 'up';
        } else if (change < 0) {
            trend = 'down';
        }
    }

    return (
        <div className="leaderboard-item" onClick={onClick} style={{ cursor: 'pointer' }}>
            
            {/* trend */}
            <div className={`lb-trend ${trend}`}>
                {trend === 'up' && (
                    <>
                        <span className="trend-arrow">▲</span>
                        <span className="trend-val">{change}</span>
                    </>
                )}
                {trend === 'down' && (
                    <>
                        <span className="trend-arrow">▼</span>
                        <span className="trend-val">{Math.abs(change)}</span>
                    </>
                )}
                {trend === 'neutral' && (
                    <span className="trend-dash">-</span>
                )}
            </div>

            <div className="lb-rank">{rank}</div>

            <div className="lb-content">
                <h3 className="lb-name">{name}</h3>
                <div className="lb-stats">
                    <span className="lb-rating">
                        ⭐ {averageRating ? averageRating.toFixed(2) : "N/A"}
                    </span>
                    <span className="lb-count">
                        ({numRatings || 0} rating{numRatings === 1 ? '' : 's'})
                    </span>
                </div>
            </div>
        </div>
    );
}

export default LeaderboardItem;