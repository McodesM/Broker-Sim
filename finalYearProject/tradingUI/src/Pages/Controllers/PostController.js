import { useState } from 'react';

const usePostController = () => {
    const getForumPosts = async (current_forum_id) =>{
        const response = await fetch(`http://127.0.0.1:8000/retrieve_forum_posts/${current_forum_id}/`, {
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
    }
    const sendCreatePostRequest = async (myContext, messagePost) => {
        try{
            const PostData = {
                msg: messagePost,
                forum: myContext.currentForumData.id
            }
            console.log(PostData)
            const response = await fetch(`http://127.0.0.1:8000/create_post/`, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(PostData),
                credentials: 'include'
            });
            if(!response.ok){
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        }catch(error){
            console.error("Error:", error.message);
            alert("Failed to create Post:", error.message);
        }
    }
    const deletePost = async (postID) =>{
        try{
            const response = await fetch(`http://127.0.0.1:8000/delete_post/${postID}/`, {
                method: 'DELETE',
                headers: {
                'Content-Type': 'application/json',
                },
                credentials: 'include'
            });
            const jsonResponse = await response.json();
            if(!response.ok){
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        }catch(error){
            console.error("Error:", error.message);
            alert("Failed to delete post:", error.message);
        }
    }
    const Likerequest = async (postID) => {
        try{
            const response = await fetch(`http://127.0.0.1:8000/like_post/${postID}/`, {
                method: 'PUT',
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
            alert("Error:", error.message);
        }
        console.log(`Liked post with ID ${postID}`);
    };
    const Dislikerequest = async (postID) => {
        try{
            const response = await fetch(`http://127.0.0.1:8000/dislike_post/${postID}/`, {
                method: 'PUT',
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
            alert("Error:", error.message);
        }
        console.log(`Disliked post with ID ${postID}`);
    };
    const Replyrequest = async (replyMessage, parent, myContext) => {
        try {
          const replyData = {
            msg: replyMessage,
            forum: myContext.currentForumData.id,
            parent: parent,
          };
          console.log(replyData)
          const response = await fetch(`http://127.0.0.1:8000/create_post/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(replyData),
            credentials: "include",
          });
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          console.log("Reply request made")
        } catch (error) {
          console.error("Error:", error.message);
          alert("Failed to create reply:", error.message);
        }
    };

    return { getForumPosts, sendCreatePostRequest, deletePost, Likerequest, Dislikerequest, Replyrequest };
};

export default usePostController;