import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {AppContext} from '../Context'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import useLoginController from './Controllers/LoginController';
function Login(){
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    function handleInputChange(e){
        const { name, value } = e.target;
        setFormData({
        ...formData,
        [name]: value,
        });
    }
    const navigate = useNavigate();
    const myContext = useContext(AppContext);
    const { sendLoginData } = useLoginController()

    function handleSubmit(e){
        e.preventDefault();
        sendLoginData(formData, navigate, myContext);
    }

return(
    <Container>
      <Row className="justify-content-center">
        <Col md={6}>
          <div className="bg-dark text-light p-4 rounded">
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formBasicUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Login with username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Button variant="primary" type="submit">
                Submit
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
)
}

export default Login;