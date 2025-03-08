import React, { useState, useEffect } from 'react';
import Header from '../../components/header/Header';
import './DiscoverPage.css';
import { Modal, Button } from 'react-bootstrap';
import {
  AiOutlineSearch,
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineClose,
  AiOutlineShoppingCart,
  AiOutlineBars
} from 'react-icons/ai';
import { useDbData } from '../../utilities/firebase'; // adjust the import path if needed
import { calculateGroupProximity } from './Map'; // make sure this function is correctly exported from Map.js

// List of all available labels
const allLabels = [
  "Heavyweight",
  "Structured",
  "Neutral Colors",
  "Monochrome",
  "Tapered",
  "Distressed",
  "Layered",
  "Soft Fabric",
  "Athleisure",
  "Fitted",
  "Retro Silhouettes",
  "Earthy Tones",
  "Slim Fit",
  "High Contrast",
  "Oversized",
  "Soft Fabric (suede)",
  "Performance Fabric"
];

// Helper function to randomly select 3 unique concepts from allLabels
const getRandomConcepts = () => {
  const shuffled = [...allLabels].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
};

const DiscoverPage = () => {
  // State for recommendations fetched from Firebase
  const [recommendationsData, error] = useDbData("recommendations");
  const [outfits, setOutfits] = useState([]);
  
  // Generate random concepts on initial load
  const [concepts] = useState(getRandomConcepts());
  
  // Logging the fetched recommendations for debugging
  useEffect(() => {
    if (recommendationsData) {
      console.log("Fetched Recommendations:", recommendationsData);
      
      // Convert recommendationsData (likely an object keyed by id) into an array
      const recommendationsArray = Object.values(recommendationsData);
      
      // Compute a total proximity score for each recommendation
      const scoredRecommendations = recommendationsArray.map(rec => {
        let totalScore = 0;
        if (Array.isArray(rec.elements)) {
          rec.elements.forEach(item => {
            if (item.labels && Array.isArray(item.labels)) {
              // Use our calculateGroupProximity function to score each item
              const proximity = calculateGroupProximity(concepts, item.labels);
              totalScore += proximity;
            }
          });
        }
        return { ...rec, score: totalScore };
      });
      
      // Sort recommendations by ascending score (lower = better match)
      scoredRecommendations.sort((a, b) => a.score - b.score);
      
      // Only keep the top 4 outfits
      setOutfits(scoredRecommendations.slice(0, 4));
    }
  }, [recommendationsData, concepts]);
  
  // UI states for search, expand, like, undo, and modal functionality
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOutfit, setExpandedOutfit] = useState({});
  const [likedOutfits, setLikedOutfits] = useState({});
  const [showUndo, setShowUndo] = useState(false);
  const [deletedOutfit, setDeletedOutfit] = useState(null);
  const [deletedIndex, setDeletedIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Auto-hide undo popup after 3 seconds
  useEffect(() => {
    let timer;
    if (showUndo) {
      timer = setTimeout(() => {
        setShowUndo(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showUndo]);
  
  // Toggle search bar visibility
  const toggleSearch = () => {
    setShowSearch(!showSearch);
    setSearchTerm('');
  };
  
  // Expand/hide outfit items
  const handleToggleExpand = (outfitID) => {
    setExpandedOutfit(prev => ({
      ...prev,
      [outfitID]: !prev[outfitID]
    }));
  };
  
  // Toggle like for an outfit
  const handleToggleLike = (outfitID) => {
    setLikedOutfits(prev => ({
      ...prev,
      [outfitID]: !prev[outfitID]
    }));
  };
  
  // Remove outfit from feed (dislike)
  const handleDislike = (outfit, index) => {
    const newOutfits = [...outfits];
    newOutfits.splice(index, 1);
    setOutfits(newOutfits);
    
    setDeletedOutfit(outfit);
    setDeletedIndex(index);
    setShowUndo(true);
  };
  
  // Undo remove
  const handleUndo = () => {
    if (deletedOutfit && deletedIndex !== null) {
      const newOutfits = [...outfits];
      newOutfits.splice(deletedIndex, 0, deletedOutfit);
      setOutfits(newOutfits);
      setDeletedOutfit(null);
      setDeletedIndex(null);
      setShowUndo(false);
    }
  };
  
  // Open/close item modal
  const openItemModal = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };
  const closeItemModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };
  
  // Filter outfits by outfitName if search is active (optional)
  const displayedOutfits = outfits.filter(outfit =>
    outfit.outfitName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="discover">
      <Header title="Discover" />
      
      {/* Concepts Section (displaying user's concepts) */}
      <div className="discover-header">
        <div className="concepts-container">
          <h2 className='concepts-title'>My Concepts</h2>
          <div>
            {concepts.map((concept, idx) => (
              <span key={idx} className="concept-item" style={{ marginRight: '10px', padding: '5px 10px', border: '1px solid #ccc' }}>
                {concept}
              </span>
            ))}
          </div>
        </div>
        
        {/* Optional Search Bar */}
        <div className="search-icon-container">
          {!showSearch && (
            <div className="search-icon" onClick={toggleSearch}>
              <AiOutlineSearch />
            </div>
          )}
          {showSearch && (
            <div className="search-container">
              <input
                type="text"
                className="search-bar"
                placeholder="Search outfits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="close-search-icon" onClick={toggleSearch}>
                <AiOutlineClose />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Main Feed Content */}
      <div className="discover-content">
        <div className="feed-container">
          {displayedOutfits.map((outfit, index) => (
            <div key={outfit.outfitID} className="feed-card">
              {/* Outfit Title */}
              <h3 className="feed-card-title">{outfit.outfitName}</h3>
              
              {/* Outfit Image */}
              {outfit.outfitPicUrl ? (
                <div className="feed-card-image">
                  <img src={outfit.outfitPicUrl} alt={outfit.outfitName} />
                </div>
              ) : (
                <div className="collage-container">
                  {outfit.elements && outfit.elements.map((item, idx) => (
                    <div key={idx} className="collage-item">
                      {item.image ? (
                        <img src={item.image} alt={item.name} />
                      ) : (
                        <div>{item.name}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="action-buttons">
                <div className="like-button" onClick={() => handleToggleLike(outfit.outfitID)}>
                  {likedOutfits[outfit.outfitID] ? <AiFillHeart /> : <AiOutlineHeart />}
                </div>
                <div className="dislike-button" onClick={() => handleDislike(outfit, index)}>
                  <AiOutlineClose />
                </div>
                <div className="cart-button">
                  <AiOutlineShoppingCart />
                </div>
                <div className="stack-button" onClick={() => handleToggleExpand(outfit.outfitID)}>
                  <AiOutlineBars />
                </div>
              </div>
              
              {/* Expanded List of Elements */}
              {expandedOutfit[outfit.outfitID] && (
                <div className="expanded-item-list">
                  {outfit.elements && outfit.elements.map((item, idx) => (
                    <div key={idx} className="expanded-item" onClick={() => openItemModal(item)}>
                      {item.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Undo Popup */}
      {showUndo && (
        <div className="undo-popup">
          <span>Outfit removed.</span>
          <button onClick={handleUndo}>Undo</button>
        </div>
      )}
      
      {/* Item Modal (without price info) */}
      <Modal show={showModal} onHide={closeItemModal} centered>
        {selectedItem && (
          <div className="item-modal-content">
            <img src={selectedItem.image} alt={selectedItem.name} />
            <h5>{selectedItem.name}</h5>
            <div className="modal-buttons">
              <Button variant="dark" onClick={() => alert('Saved!')}>
                Save
              </Button>
              <Button variant="dark" onClick={() => alert('Added to cart!')}>
                <AiOutlineShoppingCart /> Add to Cart
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DiscoverPage;
