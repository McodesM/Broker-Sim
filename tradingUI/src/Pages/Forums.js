import { useState, useContext,useEffect } from "react";
import {AppContext} from '../Context'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useNavigate, Link } from 'react-router-dom';
import useForumController from "./Controllers/ForumController";
function Forum(){
    const myContext = useContext(AppContext);
    const navigate = useNavigate();
    const [forums, setForums] = useState([])
    const [createForum, setCreateForum] = useState(false)
    const { retrieveForums, sendCreateForumRequest, deleteForum } = useForumController()
    const [forumData, setForumData] = useState({
        title: '',
        description: ''
    });


    const userDetails = myContext.userDetails
    let button = null;
    let createForumField = null
    const fetchData = async () => {  
        try{
          const forum_Data = await retrieveForums();
          setForums(forum_Data);
          console.log("FETCHING")
        }catch(error){
          alert("Failed to retrieve forums")
        }
    };

    function handleInputChange(e){
        const { name, value } = e.target;
        setForumData({
        ...forumData,
        [name]: value,
        });
    }

    const handleSubmit = async(e)=>{
        e.preventDefault();
        await sendCreateForumRequest(forumData);
        fetchData();
        setCreateForum(false);
        setForumData({
            title: '',
            description: ''
        })
    }

    function goToPosts(forum){
        myContext.setCurrentForum(forum)
        setTimeout(() => {
            navigate('/forumPage');
          }, 100);
    }
    const handleDelete = async(forum_id)=>{
        await deleteForum(forum_id);
        console.log("Deleted")
        fetchData();
    }

    if(userDetails.admin || userDetails.level === "Expert" || userDetails.level === "Master" || userDetails.level === "Grandmaster" || userDetails.level === "Market Master"){
        button = <Button variant="primary" onClick={() => setCreateForum(!createForum)}>Create forum</Button>
    }
    if(createForum){
        createForumField = <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicTitle">
            <Form.Label>Title</Form.Label>
            <Form.Control
                type="text"
                placeholder="Enter Title"
                name="title"
                value={forumData.title}
                onChange={handleInputChange}
            />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicDescription">
                <Form.Control
                    type="text"
                    placeholder="Enter Description"
                    name="description"
                    value={forumData.description}
                    onChange={handleInputChange}
                />
            </Form.Group>
            <Button variant="primary" type="submit" disabled={!forumData.title}>
                Create
            </Button>
        </Form>
    }
    useEffect(() => {
        fetchData();
    }, []);
    return(
        <Container className="mt-5">
            {button}
            {createForumField}
            <ul className="list-unstyled">
                {forums.map((forum) => (
                    <li key={forum.id} className="mb-3">
                        <Row className="justify-content-center align-items-center">
                            <Col md={9}>
                                <Link onClick={() => goToPosts(forum)} className="card bg-secondary p-3 text-decoration-none text-light">
                                    <h3>{forum.title}</h3>
                                </Link>
                            </Col>
                            <Col md={3}>
                                {userDetails.admin && (
                                    <Button onClick={() => handleDelete(forum.id)}>
                                        Delete
                                    </Button>
                                )}
                            </Col>
                        </Row>
                    </li>
                    
                ))}
            </ul>
        </Container>
    )

}

export default Forum;