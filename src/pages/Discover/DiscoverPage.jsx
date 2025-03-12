import React, { useState, useEffect, useCallback } from 'react';
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
import { useDbData, useDbUpdate, useAuthState } from '../../utilities/firebase';
import { calculateGroupProximity } from './Map'; // make sure this function is correctly exported from Map.js

// Import the new Cart component
import Cart from './components/Cart';

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
  // 1) Track the current user
  const [user] = useAuthState();
  const userId = user?.uid;

  // 2) Fetch the recommendations from DB
  const [recommendationsData, error] = useDbData("recommendations");

  // 3) Also fetch the user's saved outfits & saved items
  //    We only fetch if userId is available; otherwise pass null to skip fetching
  const [savedOutfitsData] = useDbData(userId ? `saved_outfits/${userId}` : null);
  const [savedItemsData] = useDbData(userId ? `saved_items/${userId}` : null);

  // 4) We'll use the update hook for writing to DB
  const [updateSavedOutfits] = useDbUpdate(userId ? `saved_outfits/${userId}` : null);
  const [updateSavedItems] = useDbUpdate(userId ? `saved_items/${userId}` : null);

  // Local states
  const [outfits, setOutfits] = useState([]);
  const [concepts] = useState(getRandomConcepts());
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOutfit, setExpandedOutfit] = useState({});
  const [likedOutfits, setLikedOutfits] = useState({}); // store outfitID => boolean
  const [showUndo, setShowUndo] = useState(false);
  const [deletedOutfit, setDeletedOutfit] = useState(null);
  const [deletedIndex, setDeletedIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // For saved items (to check if an item is already saved)
  // We'll store item IDs or names in an object or set
  const [savedItems, setSavedItems] = useState({});

  // Cart state
  const [cart, setCart] = useState([]);

  // Convert savedOutfitsData to an object that tracks which outfits are liked
  useEffect(() => {
    if (savedOutfitsData) {
      // If the user has saved outfits in DB, mark them as liked
      const newLikedOutfits = {};
      Object.keys(savedOutfitsData).forEach((outfitID) => {
        newLikedOutfits[outfitID] = true;
      });
      setLikedOutfits(newLikedOutfits);
    }
  }, [savedOutfitsData]);

  // Convert savedItemsData to a local structure for quick "already saved?" checks
  useEffect(() => {
    if (savedItemsData) {
      // savedItemsData will be an object: { [itemKey]: itemData, ... }
      setSavedItems(savedItemsData);
    }
  }, [savedItemsData]);

  // Logging the fetched recommendations for debugging
  useEffect(() => {
    if (recommendationsData) {
      console.log("Fetched Recommendations:", recommendationsData);

      // Convert recommendationsData (likely an object keyed by id) into an array
      const recommendationsArray = Object.values(recommendationsData);

      // Compute a total proximity score for each recommendation
      const scoredRecommendations = recommendationsArray.map((rec) => {
        let totalScore = 0;
        if (Array.isArray(rec.elements)) {
          rec.elements.forEach((item) => {
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
    setExpandedOutfit((prev) => ({
      ...prev,
      [outfitID]: !prev[outfitID]
    }));
  };

  // 5) Like/Unlike an outfit => Save/Remove in "saved_outfits/{userId}"
  const handleToggleLike = useCallback(
    (outfitID, outfitData) => {
      if (!userId) {
        alert("Please sign in to save outfits.");
        return;
      }
      const isCurrentlyLiked = likedOutfits[outfitID];

      if (isCurrentlyLiked) {
        // Remove from saved_outfits
        updateSavedOutfits({ [outfitID]: null });
        setLikedOutfits((prev) => ({ ...prev, [outfitID]: false }));
      } else {
        // Add to saved_outfits
        // We can store the entire outfit or just minimal data
        // Here we store the outfit name, pic, etc.
        updateSavedOutfits({
          [outfitID]: outfitData
        });
        setLikedOutfits((prev) => ({ ...prev, [outfitID]: true }));
      }
    },
    [likedOutfits, updateSavedOutfits, userId]
  );

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

  // Save item logic => saved_items/{userId}
  const handleSaveItem = (item) => {
    if (!userId) {
      alert("Please sign in to save items.");
      return;
    }

    // If already saved, do not allow
    if (savedItems[item.name]) {
      alert("This item is already saved!");
      return;
    }

    // Otherwise, add it
    updateSavedItems({ [item.name]: item });
    alert("Item saved!");
  };

  // Add a single item to cart
  const handleAddToCart = (item) => {
    setCart((prevCart) => [...prevCart, item]);
    alert("Added to cart!");
  };

  // Add all items from an outfit to the cart
  const handleAddOutfitToCart = (outfit) => {
    if (outfit.elements && Array.isArray(outfit.elements)) {
      setCart((prevCart) => [...prevCart, ...outfit.elements]);
      alert("All items from the outfit have been added to your cart!");
    } else {
      alert("This outfit has no items to add!");
    }
  };

  // Filter outfits by outfitName if search is active
  const displayedOutfits = outfits.filter((outfit) =>
    outfit.outfitName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="discover">
      <Header title="Discover" />

      {/* CART ICON (upper-right) */}
      <div className="cart-container">
        <Cart cart={cart} setCart={setCart} />
      </div>

      {/* Concepts Section (displaying user's concepts) */}
      <div className="discover-header">
        <div className="concepts-container">
          <h2 className="concepts-title">My Concepts</h2>
          <div>
            {concepts.map((concept, idx) => (
              <span
                key={idx}
                className="concept-item"
                style={{
                  marginRight: '10px',
                  padding: '5px 10px',
                  border: '1px solid #ccc'
                }}
              >
                {concept}
              </span>
            ))}
          </div>
        </div>

        {/* Optional Search Bar */}
        <div className="search-icon-container">
          {!showSearch && (
            <div className="search-icon" onClick={toggleSearch}>
       
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
          {displayedOutfits.map((outfit, index) => {
            const outfitID = outfit.outfitID || `rec-${index}`; // fallback if outfitID not provided
            return (
              <div key={outfitID} className="feed-card">
                {/* Outfit Title */}
                <h3 className="feed-card-title">{outfit.outfitName}</h3>

                {/* Outfit Image */}
                {outfit.outfitPicUrl ? (
                  <div className="feed-card-image">
                    <img src={outfit.outfitPicUrl} alt={outfit.outfitName} />
                  </div>
                ) : (
                  <div className="collage-container">
                    {outfit.elements &&
                      outfit.elements.map((item, idx) => (
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
                  <div
                    className="like-button"
                    onClick={() => handleToggleLike(outfitID, outfit)}
                  >
                    {likedOutfits[outfitID] ? <AiFillHeart /> : <AiOutlineHeart />}
                  </div>
                  <div className="dislike-button" onClick={() => handleDislike(outfit, index)}>
                    <AiOutlineClose />
                  </div>
                  {/* New Cart Button for Outfit-level addition */}
                  <div className="cart-button" onClick={() => handleAddOutfitToCart(outfit)}>
                    <AiOutlineShoppingCart />
                  </div>
                  {/* Stack Button to expand items */}
                  <div className="stack-button" onClick={() => handleToggleExpand(outfitID)}>
                    <AiOutlineBars />
                  </div>
                </div>

                {/* Expanded List of Elements */}
                {expandedOutfit[outfitID] && (
                  <div className="expanded-item-list">
                    {outfit.elements &&
                      outfit.elements.map((item, idx) => (
                        <div key={idx} className="expanded-item" onClick={() => openItemModal(item)}>
                          {item.name}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Undo Popup */}
      {showUndo && (
        <div className="undo-popup">
          <span>Outfit removed.</span>
          <button onClick={handleUndo}>Undo</button>
        </div>
      )}

      {/* Item Modal (with "Save" and "Add to Cart") */}
      <Modal show={showModal} onHide={closeItemModal} centered>
        {selectedItem && (
          <div className="item-modal-content">
            {selectedItem.image && (
              <img src={selectedItem.image} alt={selectedItem.name} />
            )}
            <h5>{selectedItem.name}</h5>
            <div className="modal-buttons">
              <Button variant="dark" onClick={() => handleSaveItem(selectedItem)}>
                Save
              </Button>
              <Button variant="dark" onClick={() => handleAddToCart(selectedItem)}>
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
