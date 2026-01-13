import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar/Navbar.jsx';
import LeaderboardItem from '../components/LeaderboardItem/LeaderboardItem.jsx';
import FoodDetailsModal from '../components/FoodDetailsModal/FoodDetailsModal.jsx';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase.js';
import toast, { Toaster } from 'react-hot-toast';
import './style/Leaderboard.css';


function Leaderboard() {
    // required things:
    // - how score is going to be calculated based on num ratings and average rating
    // - other different filters:
    //    - by most rated
    //    - by highest average rating
    //    - by most comments
    //    - by lowest average rating
    const [loading, setLoading] = useState(false);
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [filter, setFilter] = useState('highest-rated');
    const [selectedFood, setSelectedFood] = useState(null);
    const [previousRank, setPreviousRank] = useState(null);

    const CACHE_DURATION = 60 * 60 * 1000; // 1 hr
    const CACHE_KEY = 'leaderboard_data';

    useEffect(() => {

        toast("Tap on a leaderboard item to view comments", {
            icon: 'ℹ️',
            position: 'top-center',
            duration: 3000,
            id: 'leaderboard-info-toast',
        })
        const loadData = async () => {
            setLoading(true);

            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                const isFresh = (Date.now() - timestamp) < CACHE_DURATION;

                if (isFresh) {
                    console.log("using cached leaderboard data");
                    setLeaderboardData(data);
                    setLoading(false);
                    return;
                }
            }

            console.log("using fresh leaderboard data");
            const freshData = await fetchLeaderboardData();

            try { 
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    data: freshData,
                    timestamp: Date.now()
                }));
            } catch (e) {
                console.error("failed to cache leaderboard data:", e);
                console.log("localstorage quota exceeded most likely")
            }

            setLeaderboardData(freshData);
            setLoading(false);
        }

        loadData();
    }, []);

    const fetchLeaderboardData = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'foods'));
            const items = [];

            querySnapshot.forEach((doc) => {
                items.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            return items;
        } catch (e) {
            console.error("error fetching leaderboard data:", e);
            return [];
        }
    };

    const getSortedData = () => {
        let data = leaderboardData.filter(item => (item.num_ratings || 0) > 0);
        switch (filter) {
            case 'highest-rated':
                return data.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
            case 'lowest-rated':
                return data.sort((a, b) => (a.avg_rating || 0) - (b.avg_rating || 0));
            case 'most-rated': 
                return data.sort((a, b) => {
                    const scoreA = (a.num_ratings || 0) * (a.avg_rating || 0);
                    const scoreB = (b.num_ratings || 0) * (b.avg_rating || 0);
                    return scoreB - scoreA;
                }); 
            default:
                return data;
        }
    };

    const sortedList = getSortedData();

    return (
        <>
            {/* <Toaster /> */}
            <Navbar />
            <div className="header-section">
                <h1 className="header">Leaderboard</h1>
                <select
                    className="filter-select"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="highest-rated">Highest Rated</option>
                    <option value="most-rated">Most Popular</option>
                    <option value="lowest-rated">Lowest Rated</option>
                </select>
            </div>
            <div className="leaderboard-container">


                {loading ? (
                    <div className="loading">Loading Leaderboard...</div>
                ) : (
                    <div className="leaderboard-list">
                        {sortedList.map((item, index) => (
                            <LeaderboardItem
                                key={item.id}
                                rank={index+1}
                                name={item.name}
                                averageRating={item.avg_rating}
                                numRatings={item.num_ratings}
                                onClick={()=>setSelectedFood(item)}
                                previousAR={item.prev_ar}
                                previousLAR={item.prev_lar}
                                previousNC={item.prev_nc}
                                previousNR={item.prev_nr}
                                filter={filter}
                            />
                        ))}
                    </div>
                )}
            </div>

            {selectedFood && (
                <FoodDetailsModal
                    foodId={selectedFood.id}
                    foodName={selectedFood.name}
                    onClose={()=>setSelectedFood(null)}
                />
            )}
        </>
    );
};

export default Leaderboard;