import { useState } from 'react';

const useHomeController = () => {
    const retrieveUserDetails = async(myContext) =>{
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
        const jsonresponse = await response.json();
        myContext.set_User_Details(jsonresponse.data)
    }
    const sendBuyOrder = async (currentPrice, stockPriceData, searchedstockName, numberOfStocks, myContext) => {
        try{
            console.log(currentPrice)
            const postData = {
                buyPrice: currentPrice,
                stockName: searchedstockName,
                number: numberOfStocks
            }
            const response = await fetch('http://127.0.0.1:8000/buy_order/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(postData),
              credentials: 'include'
            });
            const jsonResponse = await response.json();
            console.log(jsonResponse.message)
            alert("Bought in")
            retrieveUserDetails(myContext)
        }
        catch (error){
            console.error("Error:", error.message);
        }
    }
    const retrieveStockData = async(period, stockName) => {
        const response = await fetch(`http://127.0.0.1:8000/get_stock_data/${period}/${stockName}`, {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            },
            credentials: 'include'
        });
        if(!response.ok){
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const jsonResponse = await response.json();
        return jsonResponse.data
    }
    return { retrieveUserDetails, sendBuyOrder, retrieveStockData };
};

export default useHomeController;