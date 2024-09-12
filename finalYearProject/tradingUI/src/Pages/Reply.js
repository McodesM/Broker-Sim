import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useState, useContext,useEffect } from "react";
import {AppContext} from '../Context'
import upvoteImage from '../images/redUp.png';
import downvoteImage from '../images/downRed.png';
import blackDownArrow from '../images/blackDown.png'
import blackUpArrow from '../images/blackUp.png'
import './styles/ReplyCSS.css'

function Reply({ reply, handleLike, handleDislike, sendReply, deleteReply }) {
    const { id, creator, message, datetime, likes, replies } = reply;
    const myContext = useContext(AppContext);
    const [replyTo, setReplyTo] = useState(null);
    const [replyMessage, setReplyMessage] = useState("");
    function handleReplySubmit(e){
        e.preventDefault();
        sendReply(replyMessage, replyTo)
        setReplyMessage("")
        setReplyTo(null)
    }

    return (
        <div className="reply">
            <p className="reply-creator">{creator}</p>
            <p className="reply-message">{message}</p>
            {reply.creator === myContext.userDetails.username && (
                <button className="delete-button" onClick={() => deleteReply(id)}>
                    Delete
                </button>
            )}
            {reply.creator != myContext.userDetails.username && myContext.userDetails.admin && (
                <button className="delete-button" onClick={() => deleteReply(id)}>
                    Delete
                </button>
            )}
            {reply.creator != myContext.userDetails.username&&(
                <div>
                    <div className="like-dislike-container">
                        {reply.liked_array.includes(myContext.userDetails.id) ? (
                            <span className="like-dislike" onClick={() => handleLike(id)}>
                                <img src={upvoteImage} alt="Like" className="like-dislike-icon" />
                            </span>
                        ): (
                            <span className="like-dislike" onClick={() => handleLike(id)}>
                                <img src={blackUpArrow} alt="Like" className="like-dislike-icon" />
                            </span>
                        )}

                        {reply.disliked_array.includes(myContext.userDetails.id) ? (
                            <span className="like-dislike" onClick={() => handleDislike(id)}>
                                <img src={downvoteImage} alt="Dislike" className="like-dislike-icon" />
                            </span>
                        ): (
                            <span className="like-dislike" onClick={() => handleDislike(id)}>
                                <img src={blackDownArrow} alt="Dislike" className="like-dislike-icon" />
                            </span>
                        )}
                    </div>
                    <p className="like-count">{likes}</p>
                    <button onClick={() => setReplyTo(id)}>Reply</button>
                </div>
            )}
            {reply.creator === myContext.userDetails.username &&(
                <p className="like-count">Likes: {likes}</p>
            )}
            {replyTo === id && (
                <Form onSubmit={handleReplySubmit}>
                    <Form.Group controlId={`replyForm-${id}`}>
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
            <div className="replies">
                {replies.map((childReply) => (
                    <Reply
                        key={childReply.id}
                        reply={childReply}
                        handleLike={handleLike}
                        handleDislike={handleDislike}
                        sendReply={sendReply}
                        deleteReply={deleteReply}
                    />
                ))}
            </div>
        </div>
    );
}

export default Reply;
