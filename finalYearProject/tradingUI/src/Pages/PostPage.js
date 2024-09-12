import { useState, useContext,useEffect } from "react";
import {AppContext} from '../Context'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import upvoteImage from '../images/redUp.png';
import downvoteImage from '../images/downRed.png';
import blackDownArrow from '../images/blackDown.png'
import blackUpArrow from '../images/blackUp.png'
import usePostController from "./Controllers/PostController";
import './styles/PostPageCSS.css'
import Reply from "./Reply";

function ForumPage(){
    const myContext = useContext(AppContext);
    const [messagePost, setMessagePost] = useState("")
    const [posts, setPosts] = useState([]) 
    const [replyTo, setReplyTo] = useState(null);
    const [replyMessage, setReplyMessage] = useState("");
    const { getForumPosts, sendCreatePostRequest, deletePost, Likerequest, Dislikerequest, Replyrequest } = usePostController()
    const current_forum_id = myContext.currentForumData.id

    const fetchData = async () => {  
        try{
            const post_data = await getForumPosts(current_forum_id);
            setPosts(post_data);
            console.log("FETCHING")
        }catch(error){
          alert("Failed to retrieve posts")
        }
    };

    function handleInputChange(e){
        const { name, value } = e.target;
        setMessagePost(value);
    }
    const handleSubmit = async (e) =>{
        e.preventDefault();
        console.log("Submitting")
        await sendCreatePostRequest(myContext, messagePost);
        fetchData();
        setMessagePost("")
    }

    function handleReplySubmit(e){
        e.preventDefault();
        sendReply(replyMessage, replyTo);
    }
    const handleLike = async (postID) => {
        await Likerequest(postID);
        fetchData();
    };

    const handleDislike = async (postID) => {
        await Dislikerequest(postID);
        fetchData();
    };

    const handleDeletePost = async(postID) =>{
        await deletePost(postID)
        fetchData();
    }

    const sendReply = async (replyMessage, parent) => {
        await Replyrequest(replyMessage, parent, myContext)
        setReplyMessage(""); 
        setReplyTo(null); 
        fetchData();
    };

    const handleReply = (postId) => {
        setReplyTo(postId);
    };


    useEffect(() => {
        console.log("USER effecting right now")
        fetchData();
    }, []);
    return (
        <div className="forum-container">
            <h1>{myContext.currentForumData.title}</h1>
            <p>{myContext.currentForumData.description}</p>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicPost">
                    <Form.Control
                        type="text"
                        placeholder="Type Message"
                        name="messagePost"
                        value={messagePost}
                        onChange={handleInputChange}
                    />
                </Form.Group>
                <Button variant="primary" type="submit" disabled={!messagePost}>
                    Post
                </Button>
            </Form>
            <ul className="post-list">
                {posts.map((post) => (
                    <li key={post.id} className="post-item">
                        <div className="post-content">
                            <p className="post-creator">{post.creator}</p>
                            <p className="post-message">{post.message}</p>
                            {post.creator === myContext.userDetails.username && (
                                <button className="delete-button" onClick={() => handleDeletePost(post.id)}>
                                    Delete
                                </button>
                            )}
                            {post.creator != myContext.userDetails.username && myContext.userDetails.admin && (
                                <button className="delete-button" onClick={() => handleDeletePost(post.id)}>
                                    Delete
                                </button>
                            )}
                            {post.creator != myContext.userDetails.username &&(
                                <div>
                                    <div className="like-dislike-container">
                                        {post.liked_array.includes(myContext.userDetails.id) ? (
                                            <span className="like-dislike" onClick={() => handleLike(post.id)}>
                                                <img src={upvoteImage} alt="Like" className="like-dislike-icon" />
                                            </span>
                                        ): (
                                            <span className="like-dislike" onClick={() => handleLike(post.id)}>
                                                <img src={blackUpArrow} alt="Like" className="like-dislike-icon" />
                                            </span>
                                        )}
                    
                                        {post.disliked_array.includes(myContext.userDetails.id) ? (
                                            <span className="like-dislike" onClick={() => handleDislike(post.id)}>
                                                <img src={downvoteImage} alt="Dislike" className="like-dislike-icon" />
                                            </span>
                                        ): (
                                            <span className="like-dislike" onClick={() => handleDislike(post.id)}>
                                                <img src={blackDownArrow} alt="Dislike" className="like-dislike-icon" />
                                            </span>
                                        )}
                                    </div>
                                    <p className="like-count">{post.likes}</p>
                                    <button onClick={() => handleReply(post.id)}>Reply</button>
                                </div>
                            )}
                            {post.creator === myContext.userDetails.username &&(
                                <p className="like-count">Likes: {post.likes}</p>
                            )}
                            {replyTo === post.id && (
                                <Form onSubmit={handleReplySubmit}>
                                    <Form.Group controlId={`replyForm-${post.id}`}>
                                    <Form.Control
                                        type="text"
                                        placeholder="Type Message"
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                    />
                                    <Button type="submit" disabled={!replyMessage}>Reply</Button>
                                    </Form.Group>
                                </Form>
                            )}
                            {post.replies.map((reply) => (
                                <Reply
                                    key={reply.id}
                                    reply={reply}
                                    handleLike={handleLike}
                                    handleDislike={handleDislike}
                                    sendReply={sendReply}
                                    deleteReply={handleDeletePost}
                                />
                            ))}
                            
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ForumPage