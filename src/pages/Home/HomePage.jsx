import React, { useState } from 'react';
import Header from "../../components/header/Header";
import { useNavigate } from 'react-router-dom';
import { Button, Modal } from 'react-bootstrap';
import './HomePage.css';
import { FaTshirt, FaUserFriends } from 'react-icons/fa';
import { BsClockHistory, BsChatDots, BsLightbulb, BsThreeDotsVertical, BsCompass } from 'react-icons/bs';
import { useAuthState, useDbData } from '../../utilities/firebase';
import { MdKeyboardArrowRight } from "react-icons/md";

const HomePage = ({ user }) => {
  const navigate = useNavigate();
  const [userData] = useDbData(user ? `users/${user.uid}` : null);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [actions, setActions] = useState([
    { id: 1, name: "My Closet", link: "mycloset", icon: <FaTshirt />, visible: true },
    { id: 2, name: "Outfit History", link: "myoutfits", icon: <BsClockHistory />, visible: true }, // aidan change the link here once the outfits page is done
    { id: 3, name: "Chat History", link: "chat", icon: <BsChatDots />, visible: true },
    { id: 4, name: "My Inspiration", link: "discover", icon: <BsLightbulb />, visible: true },
    { id: 5, name: "My Friends", link: "chat", icon: <FaUserFriends />, visible: true },
    { id: 6, name: "My Feed", link: "discover", icon: <BsCompass />, visible: true },
  ]);

  const toggleActionVisibility = (id) => {
    setActions((prevActions) =>
      prevActions.map((action) =>
        action.id === id ? { ...action, visible: !action.visible } : action
      )
    );
  };

  return (
    <div className="home-page">
      <Header title="Home" />
      <div className="home-header">
        <div className="user-info">
          <img
            src={userData?.photoURL}
            alt="Profile"
            className="profile-pic"
          />
          <span style={{ fontSize: '22px'}}>{userData?.displayName}</span>
        </div>
        <BsThreeDotsVertical
          className="menu-icon"
          onClick={() => setShowCustomizeModal(true)}
        />
      </div>

      {/* Action List */}
      <div className="action-list">
        {actions
          .filter((action) => action.visible)
          .map((action) => (
            <div
              key={action.id}
              className="action-card"
              onClick={() => navigate(`/${action.link}`)} 
            >
              <div className="action-title">
                <div className="action-icon">{action.icon}</div>
                <span>{action.name}</span>
              </div>
              <MdKeyboardArrowRight className="arrow-icon" />
            </div>
          ))}
      </div>

      <Modal show={showCustomizeModal} onHide={() => setShowCustomizeModal(false)} dialogClassName="customize-modal">
        <Modal.Header closeButton>
          <Modal.Title>Customize Home Screen</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {actions.map((action) => (
            <div key={action.id} className="customize-action d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center action-icon">
                {action.icon}
                <span>{action.name}</span>
              </div>
              <input
                type="checkbox"
                checked={action.visible}
                onChange={() => toggleActionVisibility(action.id)}
              />
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" className="save-button" onClick={() => setShowCustomizeModal(false)}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div >
  );
};

export default HomePage;
