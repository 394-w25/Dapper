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
import html2canvas from 'html2canvas';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRef } from 'react';
import DomToImage from 'dom-to-image';

const categories = [
  { name: 'All', icon: <TbHanger /> },
  { name: 'Tops', icon: <FaTshirt /> },
  { name: 'Bottoms', icon: <PiPantsFill /> },
  { name: 'Shoes', icon: <GiRunningShoe /> },
  { name: 'Accessories', icon: <FaBagShopping /> }
];

const OutfitBuilderPage = ({ selectedOutfitId }) => {
  const [user] = useAuthState();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [outfitItems, setOutfitItems] = useState([]);
  const [clothingItems, setClothingItems] = useState([]);
  const [clickedItems, setClickedItems] = useState(new Set());
  const [outfitName, setOutfitName] = useState("");
  const outfitPaletteRef = useRef(null);
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [userData] = useDbData(user ? `users/${user.uid}` : null);
  const storage = getStorage();

  useEffect(() => {
    if (selectedOutfitId) {
      loadOutfit(selectedOutfitId);
    }
  }, [selectedOutfitId]);

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

  const saveOutfit = async () => {
    if (!user || outfitItems.length === 0 || !outfitName) return;

    try {
      const outfitId = push(ref(database, 'outfits')).key;
      const clothingIDs = outfitItems.map(item => item.id);

      // Ensure images are loaded
      const images = outfitPaletteRef.current.querySelectorAll('img');
      await Promise.all([...images].map(img => new Promise(resolve => {
        if (img.complete) resolve();
        img.onload = resolve;
      })));

      // Convert the outfit preview to an image
      const dataUrl = await DomToImage.toPng(outfitPaletteRef.current);

      // Convert dataUrl to Blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Upload to Firebase Storage
      const imageRef = storageRef(storage, `outfits/${outfitId}.png`);
      await uploadBytes(imageRef, blob);
      const imageUrl = await getDownloadURL(imageRef);

      // Save to Firebase Database
      await set(ref(database, `outfits/${outfitId}`), {
        outfitId,
        clothingIDs,
        createdAt: Date.now(),
        createdBy: user.uid,
        imageUrl,
        name: outfitName,
        sharedWith: []
      });

      setShowSaveInput(false);
      setOutfitName("");

      console.log("Outfit saved successfully!");

    } catch (error) {
      console.error("Error saving outfit:", error);
    }
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
            <div className="outfit-preview" ref={outfitPaletteRef} onDrop={handleDrop} onDragOver={handleDragOver}>
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
    </div>
  );
};

export default OutfitBuilderPage;
