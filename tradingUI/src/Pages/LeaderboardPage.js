import { useState, useContext,useEffect } from "react";
import "./styles/LeaderBoardCSS.css"
import useLeaderboardController from "./Controllers/LeaderboardController";
function Leaderboard(){
    const [users_details_list, set_user_details_list] = useState([]) 
    const { getUsersDetails } = useLeaderboardController()
    useEffect(() => {
        const fetchData = async () => {  
            const leaderboardData = await getUsersDetails();
            console.log(leaderboardData);
            set_user_details_list(leaderboardData);
        };
        fetchData();
    }, []);
    return(
        <div className="leaderboard-container">
            <ul className="leaderboard-list">
                {users_details_list.map((userDetails, index) => (
                    <li key={index} className="leaderboard-item">
                        <div className="user-rank">{index + 1}</div>
                        <div className="user-details">
                            <span className="username">{userDetails.username}</span>
                            <span className="user-level">{userDetails.level}</span>
                        </div>
                        <div className="user-stats">
                            <span className="user-points">{userDetails.points} points</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Leaderboard