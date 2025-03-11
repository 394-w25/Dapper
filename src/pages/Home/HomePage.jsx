import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../../components/header/Header";
import { FaTshirt } from 'react-icons/fa';
import { BsLightbulb } from 'react-icons/bs';
import { MdKeyboardArrowRight } from "react-icons/md";
import { useDbData } from '../../utilities/firebase'; 
import './HomePage.css';

const HomePage = ({ user }) => {
  const navigate = useNavigate();
  const [userData] = useDbData(user ? `users/${user.uid}` : null);

  // No toggling logic—always show these actions:
  const actions = [
    { id: 1, name: "Build an Outfit", link: "outfit-builder-new", icon: <FaTshirt /> },
    { id: 2, name: "Find Inspiration", link: "inspiration", icon: <BsLightbulb /> },
    { id: 3, name: "My Closet", link: "mycloset", icon: <FaTshirt /> },
  ];

  return (
    <div className="home-page">
      {/* Optional header component */}
      <Header title="Home" />

      {/* Overlapping background at the top */}
      <div className="top-overlap"></div>

      {/* Main content that sits on top of the overlapped background */}
      <div className="home-content">
        <div className="home-header-overlapped">
          <div className="user-info-overlapped">
            <img
              src={userData?.photoURL}
              alt="Profile"
              className="profile-pic-overlapped"
            />
            <span className="user-name-overlapped">
              {userData?.displayName}
            </span>
          </div>
          {/* Removed the three-dot menu entirely */}
        </div>

        {/* Large "card" with placeholders for your outfit items */}
        <div className="big-card">
          <div className="big-avatar-placeholder">Avatar Placeholder</div>
          <div className="big-shirt-placeholder">Shirt Placeholder</div>
          <div className="big-shoes-placeholder">Shoes Placeholder</div>
        </div>

        {/* Simple list of action buttons */}
        <div className="main-actions">
          {actions.map(action => (
            <div 
              key={action.id}
              className="action-button"
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
      </div>
    </div>
  );
};

export default HomePage;
