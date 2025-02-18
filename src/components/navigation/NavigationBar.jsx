import React from 'react';
import { NavLink } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import './NavigationBar.css';

const NavigationBar = () => {
  return (
    <Navbar className="navbar">
      <Container className="d-flex justify-content-around">
        <Nav className="w-100 d-flex justify-content-between">
          <Nav.Link as={NavLink} to="/" className="nav-icon" activeclassname="active">
            <i className="bi bi-house-door-fill"></i>
            <p>Home</p>
          </Nav.Link>
          <Nav.Link as={NavLink} to="/discover" className="nav-icon" activeclassname="active">
            <i className="bi bi-compass-fill"></i>
            <p>Discover</p>
          </Nav.Link>
          <Nav.Link as={NavLink} to="/outfit-builder" className="nav-icon" activeclassname="active">
            <i className="bi bi-plus-circle-fill"></i>
            <p>Add</p>
          </Nav.Link>
          <Nav.Link as={NavLink} to="/chat" className="nav-icon" activeclassname="active">
            <i className="bi bi-chat-dots-fill"></i>
            <p>Chat</p>
          </Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
