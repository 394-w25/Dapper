import React from 'react';
import Header from "../../components/header/Header";
import { useNavigate } from 'react-router-dom';
import './ClosetPage.css';
import { TbHanger } from "react-icons/tb";
import { FaTshirt } from 'react-icons/fa';
import { BsSearch, BsCloudUpload } from 'react-icons/bs';

const ClosetPage = () => {
  const navigate = useNavigate();

  return (
    <div className="closet">
      <Header title="Closet" />
      <div className="closet-header">
        <p>What would you like to do today?</p>
      </div>

      <div className="action-grid">
        <button 
          className="action-button blue"
          onClick={() => navigate('/outfit-builder')}
        >
          <FaTshirt className="action-icon" />
          <span>Create Outfit</span>
        </button>

        <button 
          className="action-button green"
        >
          <BsCloudUpload className="action-icon" />
          <span>Upload Inspiration</span>
        </button>

        <button 
          className="action-button orange"
        >
          <BsSearch className="action-icon" />
          <span>Find Clothing</span>
        </button>

        <button 
          className="action-button purple"
          onClick={() => navigate('/mycloset')}
        >
          <TbHanger className="action-icon" />
          <span>Browse Closet</span>
        </button>
      </div>

      <div className="recent-outfits">
        <h2>Recent Outfits</h2>
        <div className="outfit-grid">
          <div className="outfit-placeholder"></div>
          <div className="outfit-placeholder"></div>
          <div className="outfit-placeholder"></div>
        </div>
      </div>
    </div>
  );
};

export default ClosetPage;