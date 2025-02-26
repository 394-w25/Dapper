import React, { useEffect, useState } from 'react';
import Header from "../../components/header/Header";
import { useNavigate } from 'react-router-dom';

import { get, ref, remove } from "firebase/database";
import { useDbData, useAuthState } from "../../utilities/firebase";
import { database } from "../../utilities/firebase";
import { TbHanger } from "react-icons/tb";
import { FaTshirt } from 'react-icons/fa';
import { BsSearch, BsCloudUpload } from 'react-icons/bs';

import FeedbackRequestModal from '../Feedback/FeedbackRequestModal';
import { FiTrash2, FiEdit2 } from 'react-icons/fi';
import CustomModal from '../../components/modal/CustomModal';
import { Button } from 'react-bootstrap';
import { getStorage, ref as storageRef, deleteObject } from 'firebase/storage';

const ClosetPage = () => {
  const navigate = useNavigate();
  const [user] = useAuthState();
  const [recentOutfits, setRecentOutfits] = useState([]);

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedOutfitId, setSelectedOutfitId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [outfitToDelete, setOutfitToDelete] = useState(null);
  const storage = getStorage();

  useEffect(() => {
    fetchOutfits();
  }, [user]);

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

  const handleDeleteClick = (e, outfit) => {
    e.stopPropagation(); // Prevent triggering outfit click/navigation
    setOutfitToDelete(outfit);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!outfitToDelete) return;

    try {
      // Remove from Firebase Database
      await remove(ref(database, `outfits/${outfitToDelete.outfitId}`));
      
      // Remove image from Firebase Storage
      try {
        const imageRef = storageRef(storage, `outfits/${outfitToDelete.outfitId}.png`);
        await deleteObject(imageRef);
      } catch (storageError) {
        console.error("Error removing outfit image:", storageError);
        // Continue even if image deletion fails
      }

      // Update local state
      setRecentOutfits(recentOutfits.filter(outfit => outfit.outfitId !== outfitToDelete.outfitId));
      setShowDeleteModal(false);
      setOutfitToDelete(null);
      console.log("Outfit deleted successfully!");
    } catch (error) {
      console.error("Error deleting outfit:", error);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setOutfitToDelete(null);
  };

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
                  <button 
                    className="edit-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/outfit-builder', { state: { editOutfitId: outfit.outfitId } });
                    }}
                  >
                    <FiEdit2 />
                  </button>
                  <button 
                    className="delete-button"
                    onClick={(e) => handleDeleteClick(e, outfit)}
                  >
                    <FiTrash2 />
                  </button>
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

      {/* Delete Confirmation Modal */}
      <CustomModal 
        show={showDeleteModal} 
        onClose={cancelDelete} 
        title="Delete Outfit"
      >
        <div className="delete-modal-content">
          <p>Are you sure you want to delete "{outfitToDelete?.name}"?</p>
          <p className="warning-text">This action cannot be undone.</p>
          <div className="footer-buttons">
            <Button variant="secondary" onClick={cancelDelete}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </CustomModal>
    </div>
  );
};

export default ClosetPage;