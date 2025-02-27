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

const fakeOutfitList = [
  {
    outfitName: 'Simple White Summer',
    outfitImage: null,
    outfitID: 1,
    items: [
      {
        itemID: 1,
        brand: 'H&M',
        name: 'Caqui Hat',
        price: 32.99,
        image:
          'https://image.hm.com/assets/hm/4f/98/4f9835b075ad1bb554cabc851a099efd313887f1.jpg?imwidth=1536'
      },
      {
        itemID: 2,
        brand: 'H&M',
        name: 'Caqui Shorts',
        price: 35.99,
        image:
          'https://image.hm.com/assets/hm/a4/de/a4de3e23bbff8294ac11887f01bdea22f8e5f1a8.jpg?imwidth=1536'
      },
      {
        itemID: 3,
        brand: 'H&M',
        name: 'Caqui Tee',
        price: 39.99,
        image:
          'https://image.hm.com/assets/hm/e4/2c/e42cf363bd794ee8c09dd22bd21efa6048e898d5.jpg?imwidth=1536'
      }
    ]
  },
  {
    outfitName: 'Jeans Combo',
    outfitID: 2,
    outfitImage:
      'https://image.hm.com/content/dam/global_campaigns/season_01/men/start-page-assets/w04/cat-entries/MS11CE10-Jeans-CE-w04.jpg?imwidth=1536',
    items: [
      {
        itemID: 4,
        brand: 'H&M',
        name: 'Baggy Jeans',
        price: 71.99,
        image:
          'https://image.hm.com/assets/hm/2c/77/2c77a9ff7cf1bc0cd4f2c2c94c23cff06ea3d555.jpg?imwidth=657'
      },
      {
        itemID: 5,
        brand: 'H&M',
        name: 'Jean Jacket',
        price: 49.99,
        image:
          'https://image.hm.com/assets/hm/a1/ae/a1ae4d7e6eafb9dfa9a618ce87bc1ffc8583655d.jpg?imwidth=657'
      }
    ]
  },
  {
    outfitName: 'Relaxed Chilly Day',
    outfitID: 3,
    outfitImage:
      'https://image.hm.com/content/dam/global_campaigns/season_01/men/start-page-assets/w04/cat-entries/MS11CE8-Tshirts-tops-CE-w04.jpg?imwidth=1536',
    items: [
      {
        itemID: 6,
        brand: 'H&M',
        name: 'Knight Sweater',
        price: 65.99,
        image:
          'https://image.hm.com/assets/hm/bd/6a/bd6af2e19d50a33077662696cd01a8ee27691e02.jpg?imwidth=657'
      },
      {
        itemID: 7,
        brand: 'H&M',
        name: 'Jean Jacket',
        price: 44.99,
        image:
          'https://image.hm.com/assets/hm/80/67/8067893a23b923983beda69a988a67e9983cf361.jpg?imwidth=657'
      }
    ]
  }
];

const DiscoverPage = () => {
  const [outfits, setOutfits] = useState(fakeOutfitList);

  // Search states
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Concepts
  const concepts = ['Surprise Me','Everyday', 'Special Occasion', ];
  const [selectedConcept, setSelectedConcept] = useState('Surprise Me');

  // Expanded state for each outfit to show/hide item list
  const [expandedOutfit, setExpandedOutfit] = useState({});

  // Like state for each outfit
  const [likedOutfits, setLikedOutfits] = useState({});

  // For "dislike" undo functionality
  const [showUndo, setShowUndo] = useState(false);
  const [deletedOutfit, setDeletedOutfit] = useState(null);
  const [deletedIndex, setDeletedIndex] = useState(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Timer reference for undo popup
  useEffect(() => {
    let timer;
    if (showUndo) {
      timer = setTimeout(() => {
        setShowUndo(false);
      }, 3000); // Hide the undo popup after 3 seconds
    }
    return () => clearTimeout(timer);
  }, [showUndo]);

  // Toggle search bar
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

  // Toggle like
  const handleToggleLike = (outfitID) => {
    setLikedOutfits((prev) => ({
      ...prev,
      [outfitID]: !prev[outfitID]
    }));
  };

  // Dislike & remove from feed
  const handleDislike = (outfit, index) => {
    const newOutfits = [...outfits];
    newOutfits.splice(index, 1);
    setOutfits(newOutfits);

    setDeletedOutfit(outfit);
    setDeletedIndex(index);
    setShowUndo(true);
  };

  // Undo removing
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

  // Filter outfits based on searchTerm
  const displayedOutfits = outfits.filter((outfit) =>
    outfit.outfitName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="discover">
      {/* Existing header */}
      <Header title="Discover" />

      {/* Search / Concepts Section */}
      <div className="discover-header">
        {!showSearch && (
          <div className="search-icon-container">
            <div className="search-icon" onClick={toggleSearch}>
              <AiOutlineSearch />
            </div>
          </div>
        )}

        {showSearch && (
          <>
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

            <div className="concepts-container">
              {concepts.map((concept) => (
                <div
                  key={concept}
                  className={`concept-item ${
                    selectedConcept === concept ? 'selected' : ''
                  }`}
                  onClick={() => setSelectedConcept(concept)}
                >
                  {concept}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Main feed content */}
      <div className="discover-content">
        <div className="feed-container">
          {displayedOutfits.map((outfit, index) => (
            <div key={outfit.outfitID} className="feed-card">
              {/* Outfit Title */}
              <h3 className="feed-card-title">{outfit.outfitName}</h3>

              {/* Outfit Image or Collage */}
              {outfit.outfitImage ? (
                <div className="feed-card-image">
                  <img src={outfit.outfitImage} alt={outfit.outfitName} />
                </div>
              ) : (
                <div className="collage-container">
                  {outfit.items.map((item) => (
                    <div key={item.itemID} className="collage-item">
                      <img src={item.image} alt={item.name} />
                    </div>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="action-buttons">
                <div
                  className="like-button"
                  onClick={() => handleToggleLike(outfit.outfitID)}
                >
                  {likedOutfits[outfit.outfitID] ? (
                    <AiFillHeart />
                  ) : (
                    <AiOutlineHeart />
                  )}
                </div>

                <div
                  className="dislike-button"
                  onClick={() => handleDislike(outfit, index)}
                >
                  <AiOutlineClose />
                </div>

                <div className="cart-button">
                  <AiOutlineShoppingCart />
                </div>

                <div
                  className="stack-button"
                  onClick={() => handleToggleExpand(outfit.outfitID)}
                >
                  <AiOutlineBars />
                </div>
              </div>

              {/* Expanded item list */}
              {expandedOutfit[outfit.outfitID] && (
                <div className="expanded-item-list">
                  {outfit.items.map((item) => (
                    <div
                      key={item.itemID}
                      className="expanded-item"
                      onClick={() => openItemModal(item)}
                    >
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

      {/* Item Modal (react-bootstrap) */}
      <Modal show={showModal} onHide={closeItemModal} centered>
        {selectedItem && (
          <div className="item-modal-content">
            <img src={selectedItem.image} alt={selectedItem.name} />
            <h5>{selectedItem.name}</h5>
            <p>Price: ${selectedItem.price}</p>
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
