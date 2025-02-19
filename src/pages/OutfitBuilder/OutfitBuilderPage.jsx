import React, { useState, useEffect } from 'react';
import './OutfitBuilderPage.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, ButtonGroup, Button, Row, Col, Card, Nav, Modal, Form } from "react-bootstrap";
import Header from "../../components/header/Header";
import { useDbData, useAuthState } from "../../utilities/firebase";
import { database } from "../../utilities/firebase";
import { ref, get, push, set } from 'firebase/database';
import { FaTshirt } from 'react-icons/fa';
import { FaBagShopping } from 'react-icons/fa6';
import { TbHanger } from "react-icons/tb";
import { PiPantsFill } from "react-icons/pi";
import { GiRunningShoe } from "react-icons/gi";
import { FiMinusCircle, FiSave, FiMessageSquare, FiX } from 'react-icons/fi';

const categories = [
  { name: 'All', icon: <TbHanger /> },
  { name: 'Tops', icon: <FaTshirt /> },
  { name: 'Bottoms', icon: <PiPantsFill /> },
  { name: 'Shoes', icon: <GiRunningShoe /> },
  { name: 'Accessories', icon: <FaBagShopping /> }
];

const OutfitBuilderPage = () => {
  const [user] = useAuthState();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [outfitItems, setOutfitItems] = useState([]);
  const [clothingItems, setClothingItems] = useState([]);
  const [clickedItems, setClickedItems] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [outfitName, setOutfitName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);

  const [userData] = useDbData(user ? `users/${user.uid}` : null);

  useEffect(() => {
    const fetchClothingDetails = async () => {
      if (!userData || !userData.closet) return;

      const clothingDetails = [];

      // Fetch each clothing item details
      for (const clothingId of userData.closet) {
        const clothingRef = ref(database, `clothing/${clothingId}`);
        const snapshot = await get(clothingRef);

        if (snapshot.exists()) {
          clothingDetails.push({ id: clothingId, ...snapshot.val() });
        }
      }

      setClothingItems(clothingDetails);
    };

    fetchClothingDetails();
  }, [userData]);

  const handleDragStart = (event, item) => {
    event.dataTransfer.setData('clothingItem', JSON.stringify(item));
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const item = JSON.parse(event.dataTransfer.getData('clothingItem'));
    if (!outfitItems.some(i => i.id === item.id)) {
      setOutfitItems([...outfitItems, item]);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDragEnd = (event, item) => {
    event.preventDefault();
  };

  const removeItemFromPalette = (itemToRemove) => {
    setOutfitItems(outfitItems.filter(item => item.id !== itemToRemove.id));
  };

  const saveOutfit = () => {
    if (!user || outfitItems.length === 0 || !outfitName) return; // Ensure user, outfitItems, and name are valid

    // Generate a unique outfit ID using Firebase push
    const outfitId = push(ref(database, 'outfits')).key;
    const clothingIDs = outfitItems.map(item => item.id);

    // Prepare the outfit data
    const outfitData = {
      outfitId: outfitId,
      clothingIDs: clothingIDs,
      createdAt: Date.now(),
      createdBy: user.uid,
      imageUrl: "placeholder", // Placeholder for an outfit image
      name: outfitName,
      sharedWith: []
    };

    // Save outfit to Firebase
    set(ref(database, `outfits/${outfitId}`), outfitData)
      .then(() => {
        console.log('Outfit saved successfully');

        // Add the outfitId to the user's outfits array
        const userOutfitsRef = ref(database, `users/${user.uid}/outfits`);

        // Fetch the existing outfits for the user
        get(userOutfitsRef)
          .then(snapshot => {
            const currentOutfits = snapshot.exists() ? snapshot.val() : [];
            const updatedOutfits = [...currentOutfits, outfitId];

            set(userOutfitsRef, updatedOutfits)
              .then(() => {
                console.log("Outfit added to user's outfits list");
                setShowModal(false);
                setOutfitName("");
                setShowSaveInput(false);
              })
              .catch(error => {
                console.error("Error updating user's outfits:", error);
              });
          })
          .catch(error => {
            console.error("Error fetching user's outfits:", error);
          });
      })
      .catch(error => {
        console.error("Error saving outfit:", error);
      });
  };

  const handleClick = (item) => {
    // Toggle clicked state for the item
    setClickedItems(prevState => {
      const newState = new Set(prevState);
      if (newState.has(item.id)) {
        newState.delete(item.id);
      } else {
        newState.add(item.id);
      }
      return newState;
    });
  };

  const handleGetFeedback = () => {
    // Placeholder for feedback functionality
    console.log("Feedback requested");
  };

  return (
    <div className="outfit-builder">
      <Header title="New Outfit" />
      <Container className="outfitbuilder-content">
        <Row className="mb-4">
          <Col>
            <div className="outfit-preview" onDrop={handleDrop} onDragOver={handleDragOver}>
              <div className="outfit-palette">
                {outfitItems.map((item, index) => (
                  <div
                    key={index}
                    className="outfit-item"
                    draggable
                    onDragEnd={(e) => handleDragEnd(e, item)}
                    style={{ gridColumn: (index % 2) + 1, gridRow: Math.floor(index / 2) + 1 }}
                  >
                    <img
                      src={item.imageUrl}
                      alt="Clothing item"
                      className="outfit-item-img"
                      onClick={() => handleClick(item)}
                    />
                    {clickedItems.has(item.id) && (
                      <FiMinusCircle
                        className="delete-item"
                        onClick={() => removeItemFromPalette(item)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Col>
        </Row>

        <Row>
          <Col>
            <ButtonGroup className="categories mb-3">
              {categories.map((category) => (
                <Nav.Item key={category.name}>
                  <Button
                    variant={category.name === selectedCategory ? "secondary" : "outline-secondary"}
                    onClick={() => setSelectedCategory(category.name)}
                    className="category-button">
                    {category.icon} {category.name}
                  </Button>
                </Nav.Item>
              ))}
            </ButtonGroup>

            <div className="card-group-wrapper">
              <div className="clothing-card-group">
                {(selectedCategory === 'All' ? clothingItems : clothingItems.filter(item => item.category === selectedCategory))
                  .map((item, index) => (
                    <Card key={index} className="clothing-option" draggable onDragStart={(e) => handleDragStart(e, item)}>
                      <Card.Img variant="top" src={item.imageUrl} />
                    </Card>
                  ))}
              </div>
            </div>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col>
            <div className="footer">
              {showSaveInput ? (
               <div className="save-input-section">
               <input
                 type="text"
                 placeholder="Outfit Name"
                 value={outfitName}
                 onChange={(e) => setOutfitName(e.target.value)}
                 className="save-input"
               />
               <div className="save-btn-group">
                 <button className="save-confirm-btn" onClick={saveOutfit}>
                   <FiSave className="btn-icon" /> Confirm
                 </button>
                 <button
                   className="save-cancel-btn"
                   onClick={() => {
                     setShowSaveInput(false);
                     setOutfitName("");
                   }}
                 >
                   <FiX className="btn-icon" /> Cancel
                 </button>
               </div>
             </div>
             
              ) : (
                <div className="footer-buttons">
                  <button className="footer-button" onClick={() => setShowSaveInput(true)}>
                    <FiSave /> Save Outfit
                  </button>
                  <button className="footer-button" onClick={handleGetFeedback}>
                    <FiMessageSquare /> Get Feedback
                  </button>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Enter Outfit Name</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="outfitName">
              <Form.Label>Outfit Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter outfit name"
                value={outfitName}
                onChange={(e) => setOutfitName(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={saveOutfit}>Save</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OutfitBuilderPage;
