import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import Signup from './Pages/SignupPage';
import Login from './Pages/LoginPage';
import {AppContext} from './Context'
import Home from './Pages/HomePage';
import Portfolio from './Pages/PortfolioPage';
import Sell from './Pages/SellPage';
import Forum from './Pages/Forums';
import ForumPage from './Pages/PostPage';
import Leaderboard from './Pages/LeaderboardPage';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import './App.css';

function App() {
  const myContext = useContext(AppContext);
  const [loggedOut, setLoggedOut] = useState(false); 
  const handleLogout = async()=>{
    try {
        const response = await fetch('http://127.0.0.1:8000/logout/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
          
        });
        if(!response.ok){
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const jsonResponse = await response.json();
        console.log('Message:', jsonResponse.message);
        myContext.logout()
        setLoggedOut(true)
        setTimeout(() => {
          setLoggedOut(false);
        }, 500);
    }
    catch (error){
        console.error("Error:", error.message);
        alert("Error:", error.message);
    }
  }
  return (
    <Router>
      <div className="app-container">
        <Navbar expand="lg">
          <Container>
            <Navbar.Brand as={Link} to="/" className="text-light">
              Market Master
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              {myContext.user ? (
                  <Nav className="me-auto">
                    <Nav.Link as={Link} to="/portfolio" className="text-light">
                      Portfolio
                    </Nav.Link>
                    <Nav.Link as={Link} to="/home" className="text-light">
                      Search
                    </Nav.Link>
                    <Nav.Link as={Link} to="/forums" className="text-light">
                      Forums
                    </Nav.Link>
                    <Nav.Link as={Link} to="/leaderboard" className="text-light">
                      Leaderboard
                    </Nav.Link>
                    <Nav.Link onClick={handleLogout} className="text-light">
                      Logout
                    </Nav.Link>
                  </Nav>
                ) : (
                  <Nav className="me-auto">
                    <Nav.Link as={Link} to="/" className="text-light">
                      Login
                    </Nav.Link>
                    <Nav.Link as={Link} to="/signup" className="text-light">
                      Signup
                    </Nav.Link>
                  </Nav>
              )}
            </Navbar.Collapse>
          </Container>
        </Navbar>

        {loggedOut && <Navigate to="/" />}

        <Container className="mt-3">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/home" element={<Home />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/sell" element={<Sell />} />
            <Route path="/forums" element={<Forum />} />
            <Route path="/forumPage" element={<ForumPage />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;
