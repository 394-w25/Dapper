import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/header/Header";
import CustomModal from "../../components/modal/CustomModal";
import FeedbackRequestModal from "../Feedback/FeedbackRequestModal";
import { useDbData, useAuthState } from "../../utilities/firebase";
import { database } from "../../utilities/firebase";
import { ref, get, remove, update } from "firebase/database";
import { Container, ButtonGroup, Button, Row, Col, Card, Nav } from "react-bootstrap";
import { FaTshirt } from 'react-icons/fa';
import { FaBagShopping } from 'react-icons/fa6';
import { TbHanger } from "react-icons/tb";
import { PiPantsFill } from "react-icons/pi";
import { GiRunningShoe } from "react-icons/gi";
import { FiTrash2, FiEdit2 } from 'react-icons/fi';
import BackButton from "../../components/inspiration/BackButton";
import "./MyClosetPage.css";

const categories = [
  { name: 'All', icon: <TbHanger /> },
  { name: 'Tops', icon: <FaTshirt /> },
  { name: 'Bottoms', icon: <PiPantsFill /> },
  { name: 'Shoes', icon: <GiRunningShoe /> },
  { name: 'Accessories', icon: <FaBagShopping /> }
];

const topLevelFilters = [
  { name: "All" },
  { name: "Clothing" },
  { name: "Outfits" }
];

const MyClosetPage = () => {

  const location = useLocation();
  const navigate = useNavigate();

  const [user] = useAuthState();
  const [userData] = useDbData(user ? `users/${user.uid}` : null);

  const [selectedTopFilter, setSelectedTopFilter] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [clothingItems, setClothingItems] = useState([]);
  const [userOutfits, setUserOutfits] = useState([]);

  // Modals & selected item
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");

  useEffect(() => {
    // If we got a filter from navigation state, use it
    if (location.state && location.state.selectedTopFilter) {
      setSelectedTopFilter(location.state.selectedTopFilter);
    }
  }, [location]);
  //feedback modals
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedOutfitId, setSelectedOutfitId] = useState(null);

  const handleOpenFeedbackModal = (outfitId) => {
    setSelectedOutfitId(outfitId);
    setShowFeedbackModal(true);
  };


  // On mount or when user data changes, fetch clothes & outfits
  useEffect(() => {
    fetchClothingDetails();
    fetchUserOutfits();
  }, [userData, user]);

  const fetchClothingDetails = async () => {
    if (!userData || !userData.closet) return;

    const clothingDetails = [];
    for (const clothingId of userData.closet) {
      const clothingRef = ref(database, `clothing/${clothingId}`);
      const snapshot = await get(clothingRef);

      if (snapshot.exists()) {
        clothingDetails.push({ id: clothingId, ...snapshot.val() });
      }
    }
    setClothingItems(clothingDetails);
  };

  const fetchUserOutfits = async () => {
    if (!user) return;

    try {
      const outfitsRef = ref(database, 'outfits');
      const snapshot = await get(outfitsRef);

      if (snapshot.exists()) {
        const outfitsData = snapshot.val();
        const userOutfits = Object.values(outfitsData)
          .filter(outfit => outfit.createdBy === user.uid)
          .map(outfit => ({
            id: outfit.outfitId,
            ...outfit
          }));

        setUserOutfits(userOutfits);
      }
    } catch (error) {
      console.error("Error fetching user outfits:", error);
    }
  };

  // When user clicks an item in the grid (outfit or clothing)
  const handleShowModal = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  // When user clicks delete button (on grid card or inside modal)
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowModal(false);  // Close the detail modal if open
    setShowDeleteModal(true);
  };

  // When user clicks edit button for an outfit
  const handleEditOutfit = (e, outfit) => {
    e.stopPropagation(); // Prevent opening the modal
    navigate('/outfit-builder-new', { state: { editOutfitId: outfit.id } });
  };

  // Actually delete the item (if it's clothing). You may also add logic for outfits here if needed.
  const confirmDelete = async () => {
    if (!itemToDelete || !user) return;

    try {
      // If it's clothing (it has 'category'), we do the old logic
      if (itemToDelete.category) {
        // Remove from clothing table
        await remove(ref(database, `clothing/${itemToDelete.id}`));

        // Remove from user's closet
        const updatedCloset = userData.closet.filter(id => id !== itemToDelete.id);
        await update(ref(database, `users/${user.uid}`), {
          closet: updatedCloset
        });

        // Remove from outfits that use it
        const outfitsRef = ref(database, 'outfits');
        const outfitsSnapshot = await get(outfitsRef);
        if (outfitsSnapshot.exists()) {
          const outfits = outfitsSnapshot.val();
          for (const outfitId in outfits) {
            const outfit = outfits[outfitId];
            if (outfit.clothingIDs?.includes(itemToDelete.id)) {
              const updatedClothingIDs = outfit.clothingIDs.filter(id => id !== itemToDelete.id);
              await update(ref(database, `outfits/${outfitId}`), {
                clothingIDs: updatedClothingIDs
              });
            }
          }
        }

        // Remove from local state
        setClothingItems(clothingItems.filter(item => item.id !== itemToDelete.id));
        setDeleteMessage("Clothing item deleted successfully!");
      } else {
        // If it's an outfit, we do a similar logic:
        await remove(ref(database, `outfits/${itemToDelete.id}`));

        // Remove from userData.outfits array if it exists
        if (userData.outfits) {
          const updatedOutfits = userData.outfits.filter(id => id !== itemToDelete.id);
          await update(ref(database, `users/${user.uid}`), {
            outfits: updatedOutfits
          });
        }

        // Remove from local state
        setUserOutfits(userOutfits.filter(o => o.id !== itemToDelete.id));
        setDeleteMessage("Outfit deleted successfully!");
      }

      setShowDeleteModal(false);
      setItemToDelete(null);
      setDeleteSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setDeleteSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error deleting item:", error);
      setDeleteMessage("Error deleting item. Please try again.");
      setDeleteSuccess(true);
      setTimeout(() => {
        setDeleteSuccess(false);
      }, 3000);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  // Decide what to display in the grid based on top-level and category filter
  // 1) If top-level is "Outfits", ignore the category filter, just show outfits
  // 2) If top-level is "Clothing", show only clothing + category filter
  // 3) If top-level is "All", show both clothing + outfits, but apply category filter to clothing only.

  let itemsToDisplay = [];

  if (selectedTopFilter === "Outfits") {
    // Show outfits only
    itemsToDisplay = userOutfits.map(outfit => ({ ...outfit, isOutfit: true }));
  } else if (selectedTopFilter === "Clothing") {
    // Only clothing, applying category
    const filtered = clothingItems.filter(item =>
      selectedCategory === "All" || item.category === selectedCategory
    );
    itemsToDisplay = filtered.map(item => ({ ...item, isOutfit: false }));
  } else {
    // selectedTopFilter === "All"
    // Show both outfits + clothing, but apply category to clothing
    const filteredClothes = clothingItems
      .filter(item => selectedCategory === "All" || item.category === selectedCategory)
      .map(item => ({ ...item, isOutfit: false }));
    const outf = userOutfits.map(outfit => ({ ...outfit, isOutfit: true }));
    itemsToDisplay = [...filteredClothes, ...outf];
  }

  return (
    <div className="mycloset">
      <BackButton to={-1} />
      <Header title="My Closet" />

      {/* Top-level filter: All, Clothing, Outfits */}
      <div className="closet-actions">
        {topLevelFilters.map((filter) => (
          <Button
            key={filter.name}
            variant={selectedTopFilter === filter.name ? "dark" : "outline-dark"}
            className={`closet-button ${selectedTopFilter === filter.name ? "active" : ""}`}
            onClick={() => {
              setSelectedTopFilter(filter.name);
              setSelectedCategory("All"); // reset category when top-level filter changes
            }}
          >
            {filter.name}
          </Button>
        ))}
      </div>

      {/* Category filter: only visible as normal if top-level is Clothing or All; 
          if top-level is Outfits, show only "All" button. */}
      <Container fluid className="category-filter-container">
        <div className="category-filter">
          <ButtonGroup className="categories">
            {selectedTopFilter === "Outfits" ? (
              // Only show "All"
              <Nav.Item>
                <Button
                  variant={selectedCategory === "All" ? "secondary" : "outline-secondary"}
                  onClick={() => setSelectedCategory("All")}
                  className="category-button"
                >
                  {categories[0].icon} All
                </Button>
              </Nav.Item>
            ) : (
              // Otherwise show normal categories
              categories.map((category) => (
                <Nav.Item key={category.name}>
                  <Button
                    variant={category.name === selectedCategory ? "secondary" : "outline-secondary"}
                    onClick={() => setSelectedCategory(category.name)}
                    className="category-button"
                  >
                    {category.icon} {category.name}
                  </Button>
                </Nav.Item>
              ))
            )}
          </ButtonGroup>
        </div>
      </Container>

      {/* Grid */}
      <Container className="mycloset-content">
        {deleteSuccess && (
          <div className="delete-success-message">
            {deleteMessage}
          </div>
        )}
        <Row className="clothing-grid">
          {itemsToDisplay.length > 0 ? (
            itemsToDisplay.map((item, index) => (
              <Col key={index} xs={6} className="mb-3">
                <Card className="clothing-item">
                  <div className="clothing-image-wrapper" onClick={() => handleShowModal(item)}>
                    <Card.Img variant="top" src={item.imageUrl} alt={item.name} />
                    <button
                      className="delete-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(item);
                      }}
                    >
                      <FiTrash2 />
                    </button>
                    {item.isOutfit && (
                      <button
                        className="edit-button"
                        onClick={(e) => handleEditOutfit(e, item)}
                      >
                        <FiEdit2 />
                      </button>
                    )}
                  </div>

                  {/* Show "Get Feedback" button only for outfits */}
                  {item.isOutfit && (
                    <button
                      className="feedback-button"
                      onClick={() => handleOpenFeedbackModal(item.id)}
                    >
                      Get Feedback
                    </button>
                  )}
                </Card>
              </Col>
            ))
          ) : (
            <p className="no-items">No items to show</p>
          )}
        </Row>

      </Container>

      {/* Item/Outfit Details Modal */}
      <CustomModal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={selectedItem?.name || "Details"}
      >
        {selectedItem && (
          <>
            <div className="modal-image-wrapper">
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.name}
                className="modal-image"
              />
            </div>

            {/* If it's an outfit (isOutfit===true), show minimal fields (name, maybe createdAt).
                Otherwise, show the clothing details. */}
            {selectedItem.isOutfit ? (
              <div className="modal-details">
                <p><strong>Name:</strong> {selectedItem.name}</p>
                {selectedItem.createdAt && (
                  <p><strong>Created At:</strong> {new Date(selectedItem.createdAt).toLocaleDateString()}</p>
                )}
                {selectedItem.updatedAt && (
                  <p><strong>Last Updated:</strong> {new Date(selectedItem.updatedAt).toLocaleDateString()}</p>
                )}
              </div>
            ) : (
              <div className="modal-details">
                <p><strong>Category:</strong> {selectedItem.category}</p>
                <p><strong>Brand:</strong> {selectedItem.brand}</p>
                <p><strong>Color:</strong> {selectedItem.color}</p>
                <p><strong>Size:</strong> {selectedItem.size}</p>
                {selectedItem.createdAt && (
                  <p><strong>Created At:</strong> {new Date(selectedItem.createdAt).toLocaleDateString()}</p>
                )}
              </div>
            )}

            <div className="footer-buttons">
              {selectedItem.isOutfit && (
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowModal(false);
                    navigate('/outfit-builder-new', { state: { editOutfitId: selectedItem.id } });
                  }}
                  className="edit-item-btn"
                >
                  <FiEdit2 /> Edit
                </Button>
              )}
              <Button
                variant="danger"
                onClick={() => handleDeleteClick(selectedItem)}
                className="delete-item-btn"
              >
                <FiTrash2 /> Delete
              </Button>
            </div>
          </>
        )}
      </CustomModal>

      {/* Delete Confirmation Modal */}
      <CustomModal
        show={showDeleteModal}
        onClose={cancelDelete}
        title="Delete Item"
      >
        <div className="delete-modal-content">
          <p>
            Are you sure you want to delete "
            {itemToDelete?.name}
            "?
          </p>
          <p className="warning-text">
            This action cannot be undone and may affect outfits if this is clothing.
          </p>
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

      {/* Feedback Request Modal */}
      {showFeedbackModal && (
        <FeedbackRequestModal
          outfitId={selectedOutfitId}
          onClose={() => setShowFeedbackModal(false)}
        />
      )}

    </div>

  );
};

export default MyClosetPage;