import React, { useState, useEffect } from 'react';
import './LeaderboardItem.css';

function LeaderboardItem({ rank, name, averageRating, numRatings, onClick, previousAR, previousLAR, previousNR, filter }) {
    // previous average rating, previous lowest average rating, previous number comments, previous number ratings RANKING

    let previousRank;
    switch (filter) {
        case 'highest-rated':
            previousRank = previousAR;
            // console.log("chose previousAR:", previousAR);
            break;
        case 'lowest-rated':
            previousRank = previousLAR;
            // console.log("chose previousLAR:", previousLAR);
            break;
        case 'most-rated':
            previousRank = previousNR;
            // console.log("chose previousNR:", previousNR);
            break;
        default: 
            previousRank = previousAR;
    }

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
                        ⭐ {averageRating ? averageRating.toFixed(1) : "N/A"}
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