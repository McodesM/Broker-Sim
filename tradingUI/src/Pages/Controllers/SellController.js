import { useState } from 'react';

const useSellController = () => {
    const getStockData = async(period, myContext) => {

        const response = await fetch(`http://127.0.0.1:8000/get_stock_data/${period}/${myContext.sellStock.stock_name}`, {
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

    const sendSellOrder = async (currentPrice, myContext, numberOfStocks, navigate) =>{
        try{
            const Sell_Details = {
                sell_order_id: myContext.sellStock.id,
                num_sell: numberOfStocks,
                sell_price: currentPrice,
                stock_name: myContext.sellStock.stock_name
            }
            const response = await fetch(`http://127.0.0.1:8000/sell_stock/`, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(Sell_Details),
                credentials: 'include'
            });
            if(!response.ok){
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const jsonResponse = await response.json();
            console.log(jsonResponse.message);
            navigate('/portfolio')
        }
        catch(error){
            console.error("Error:", error.message);
            alert("Error carrying out sell order:", error.message);
        }
    }

    return { getStockData, sendSellOrder };
};

export default useSellController;