import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import './NavigationBar.css';

const NavigationBar = () => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const handleNavigate = (path) => {
    setShowModal(false); // Close modal before navigating
    navigate(path);
  };

  return (
    <>
      <Navbar className="navbar">
        <Container className="d-flex justify-content-center align-items-center">
          <Nav className="w-100 d-flex justify-content-between align-items-center position-relative">
            <Nav.Link as={NavLink} to="/" className="nav-icon" activeclassname="active">
              <i className="bi bi-house-door-fill"></i>
              <p>Home</p>
            </Nav.Link>
            <Nav.Link as={NavLink} to="/discover" className="nav-icon" activeclassname="active">
              <i className="bi bi-compass-fill"></i>
              <p>Discover</p>
            </Nav.Link>

            <div className="nav-placeholder"></div>

            {/* Add Button */}
            <Button className="add-icon" variant="secondary" onClick={handleShow}>
              <i className="bi bi-plus"></i>
            </Button>

            <Nav.Link as={NavLink} to="/friends" className="nav-icon" activeclassname="active">
              <i className="bi bi-people-fill"></i>
              <p>Friends</p>
            </Nav.Link>
            <Nav.Link as={NavLink} to="/profile" className="nav-icon" activeclassname="active">
              <i className="bi bi-person-circle"></i>
              <p>Profile</p>
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      {/* Modal */}
      <Modal show={showModal} onHide={handleClose} centered dialogClassName="nav-modal">
        <Modal.Header closeButton>
          <Modal.Title className="nav-modal-title">Add Item</Modal.Title>
        </Modal.Header>
        <Modal.Body className="nav-modal-body">
          <Button
            variant="secondary"
            className="w-100 mb-2"
            onClick={() => handleNavigate('/outfit-builder')}
          >
            Add Outfit
          </Button>
          <Button
            variant="secondary"
            className="w-100 mb-2"
            onClick={() => handleNavigate('/add-item')}
          >
            Add Clothing
          </Button>
          <Button
            variant="secondary"
            className="w-100"
            onClick={() => handleNavigate('/add-inspiration')} // herbert change the link here when you create the inspiration page
          >
            Add Inspiration
          </Button>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default NavigationBar;