import React, { useEffect, useState } from 'react';
import Header from "../../components/header/Header";
import { useNavigate } from 'react-router-dom';
import { get, ref } from "firebase/database";
import { useAuthState } from "../../utilities/firebase";
import { database } from "../../utilities/firebase";
import './ClosetPage.css';
import { TbHanger } from "react-icons/tb";
import { FaTshirt } from 'react-icons/fa';
import { BsSearch, BsCloudUpload } from 'react-icons/bs';
import FeedbackRequestModal from '../Feedback/FeedbackRequestModal';

const ClosetPage = () => {
  const navigate = useNavigate();
  const [user] = useAuthState();
  const [recentOutfits, setRecentOutfits] = useState([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedOutfitId, setSelectedOutfitId] = useState(null);

  useEffect(() => {
    const fetchOutfits = async () => {
      if (!user) return;

      try {
        const outfitsRef = ref(database, 'outfits');
        const snapshot = await get(outfitsRef);

        if (snapshot.exists()) {
          const outfitsData = snapshot.val();
          const userOutfits = Object.values(outfitsData)
            .filter(outfit => outfit.createdBy === user.uid)
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 4);

          setRecentOutfits(userOutfits);
        }
      } catch (error) {
        console.error("Error fetching recent outfits:", error);
      }
    };

    fetchOutfits();
  }, [user]);

  // Open the feedback request modal
  const openFeedbackRequest = (outfitId) => {
    setSelectedOutfitId(outfitId);
    setShowFeedbackModal(true);
  };

  return (
    <div className="closet">
      <Header title="Closet" />
      <div className="closet-header">
        <p>What would you like to do today?</p>
      </div>

      <div className="action-grid">
        <button className="action-button blue" onClick={() => navigate('/outfit-builder')}>
          <FaTshirt className="action-icon" />
          <span>Create Outfit</span>
        </button>

        <button className="action-button green">
          <BsCloudUpload className="action-icon" />
          <span>Upload Inspiration</span>
        </button>

        <button className="action-button orange">
          <BsSearch className="action-icon" />
          <span>Find Clothing</span>
        </button>

        <button className="action-button purple" onClick={() => navigate('/mycloset')}>
          <TbHanger className="action-icon" />
          <span>Browse Closet</span>
        </button>
      </div>

      <div className="recent-outfits">
        <h2>Recent Outfits</h2>
        <div className="outfit-grid">
          {recentOutfits.length > 0 ? (
            recentOutfits.map(outfit => (
              <div key={outfit.outfitId} className="outfit-card">
                <div className="outfit-image-wrapper">
                  <img src={outfit.imageUrl} alt={outfit.name} className="outfit-image" />
                </div>
                <div className="outfit-info">
                  <p className="outfit-name">{outfit.name}</p>
                  <button className="feedback-button" onClick={() => openFeedbackRequest(outfit.outfitId)}>
                    Get Feedback
                  </button>
                </div>
              </div>
            ))
          ) : [...Array(3)].map((_, index) => (
            <div key={index} className="outfit-placeholder"></div>
          ))}
        </div>
      </div>

      {showFeedbackModal && (
        <FeedbackRequestModal
          outfitId={selectedOutfitId}
          onClose={() => setShowFeedbackModal(false)}
        />
      )}
    </div>
  );
};

export default ClosetPage;
