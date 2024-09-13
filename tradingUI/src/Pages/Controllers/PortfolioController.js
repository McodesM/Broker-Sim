import { useState } from 'react';

const usePortfolioController = () => {
    const get_user_details = async() => {

        const response = await fetch(`http://127.0.0.1:8000/retrieve_user_details/`, {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            },
            credentials: 'include'
        });
        if(!response.ok){
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const json_response = await response.json();
        return json_response.data
    }
    const retrieveTrades = async() =>{
        const response = await fetch(`http://127.0.0.1:8000/retrieve_trades/`, {
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
        const data = jsonresponse.data
        const open_trades = []
        const past_trades = []
        for(let i=0; i<data.length; i++){
            if(data[i].order_type == 'open'){
                open_trades.push(data[i])
            }
            else{
                past_trades.push(data[i])
            }
        }
        return {open_trades, past_trades}
    }

    return { get_user_details, retrieveTrades };
};

export default usePortfolioController;