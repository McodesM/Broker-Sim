import { useState } from 'react';

const useForumController = () => {
    const retrieveForums = async() =>{
        const response = await fetch(`http://127.0.0.1:8000/retrieve_forums/`, {
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
        console.log(jsonresponse.data)
        return jsonresponse.data
    }

    const sendCreateForumRequest = async(forumData) =>{
        const postData = {
            title: forumData.title,
            description: forumData.description
        }
        try{
            const response = await fetch('http://127.0.0.1:8000/create_forum/', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
                credentials: 'include'
            });
            if(!response.ok){
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        }
        catch(error){
            console.error("Error:", error.message);
            alert("Failed to create Forum:", error.message);
        }
    }
    const deleteForum = async (forumID) =>{
        try{
            const response = await fetch(`http://127.0.0.1:8000/delete_forum/${forumID}/`, {
                method: 'DELETE',
                headers: {
                'Content-Type': 'application/json',
                },
                credentials: 'include'
            });
            if(!response.ok){
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        }catch(error){
            console.error("Error:", error.message);
            alert("Failed to delete forum:", error.message);
        }
    }

    return { retrieveForums, sendCreateForumRequest, deleteForum };
};

export default useForumController;