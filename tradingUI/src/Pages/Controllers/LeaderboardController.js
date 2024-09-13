import { useState } from 'react';

const useLeaderboardController = () => {
    const getUsersDetails = async() =>{
        try{
            const response = await fetch(`http://127.0.0.1:8000/retrieve_all_user_scores/`, {
                method: 'GET',
                headers: {
                'Content-Type': 'application/json',
                },
                credentials: 'include'
            });
            if(!response.ok){
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const jsonresponse = await response.json();
            return jsonresponse.data
        }catch(error){
            alert("Failed to retrieve leaderboard data. Try again")
            return []
        }
    }

    return { getUsersDetails };
};

export default useLeaderboardController;