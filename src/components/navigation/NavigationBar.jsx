import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import CustomModal from '../modal/CustomModal';
import { FaTshirt, FaLightbulb, FaTrello } from 'react-icons/fa'; 
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

      {/* Custom Modal */}
      <CustomModal show={showModal} onClose={handleClose} title="Add Item">
        <div className="nav-modal-body">
          <Button
            variant="dark"
            className="w-100 mb-2 nav-modal-btn"
            onClick={() => handleNavigate('/outfit-builder')}
          >
            <FaTrello className="nav-modal-icon" /> Add Outfit
          </Button>
          <Button
            variant="dark"
            className="w-100 mb-2 nav-modal-btn"
            onClick={() => handleNavigate('/add-item')}
          >
            <FaTshirt className="nav-modal-icon" /> Add Clothing
          </Button>
          <Button
            variant="dark"
            className="w-100 nav-modal-btn"
            onClick={() => handleNavigate('/inspiration/upload')}
          >
            <FaLightbulb className="nav-modal-icon" /> Add Inspiration
          </Button>
        </div>
      </CustomModal>
    </>
  );
};

export default NavigationBar;
