import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [user, setUser] = useState(false);
  const [searchedStock, setStock] = useState("")
  const [sellStock, setSellStock] = useState({})
  const [userDetails, setUserDetails] = useState({}) 
  const [currentForumData, setCurrentForumData] = useState({})

  const login = () => {
    
    setUser(true);
  };

  const logout = () => {
    
    setUser(null);
  };

  const setSearchedStock = (searchstock) =>{
    setStock(searchstock)
  }

  const setStock_toSell = (sellStock) => {
    setSellStock(sellStock)
  }

  const set_User_Details = (user_details) =>{
    setUserDetails(user_details)
  }

  const setCurrentForum = (data) =>{
    setCurrentForumData(data)
  }

  return (
    <AppContext.Provider value={{ user, searchedStock, sellStock, userDetails, currentForumData, setSearchedStock, setStock_toSell,login, logout, set_User_Details, setCurrentForum }}>
      {children}
    </AppContext.Provider>
  );
};

export {AppContext, AppProvider}