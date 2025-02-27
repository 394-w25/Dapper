import React, { useState, useEffect } from 'react';
import './OutfitBuilderPage.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, ButtonGroup, Button, Row, Col, Card, Nav, Modal, Form } from "react-bootstrap";
import Header from "../../components/header/Header";
import { useDbData, useAuthState } from "../../utilities/firebase";
import { database } from "../../utilities/firebase";
import { ref, get, push, set, update } from 'firebase/database';
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
import CustomModal from '../../components/modal/CustomModal';
import { useNavigate, useLocation } from 'react-router-dom';

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
  const [outfitName, setOutfitName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentOutfitId, setCurrentOutfitId] = useState(null);
  const outfitPaletteRef = useRef(null);
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [userData] = useDbData(user ? `users/${user.uid}` : null);
  const storage = getStorage();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Check if we have an outfit ID in the location state (for editing)
    if (location.state && location.state.editOutfitId) {
      const outfitId = location.state.editOutfitId;
      setCurrentOutfitId(outfitId);
      setIsEditing(true);
      loadOutfit(outfitId);
    }
  }, [location]);

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

  const loadOutfit = async (outfitId) => {
    try {
      const outfitRef = ref(database, `outfits/${outfitId}`);
      const snapshot = await get(outfitRef);

      if (snapshot.exists()) {
        const outfitData = snapshot.val();
        setOutfitName(outfitData.name);

        // Load each clothing item in the outfit
        const outfitClothingItems = [];
        for (const clothingId of outfitData.clothingIDs) {
          const clothingRef = ref(database, `clothing/${clothingId}`);
          const clothingSnapshot = await get(clothingRef);

          if (clothingSnapshot.exists()) {
            outfitClothingItems.push({ id: clothingId, ...clothingSnapshot.val() });
          }
        }

        setOutfitItems(outfitClothingItems);
      } else {
        console.error("Outfit not found");
      }
    } catch (error) {
      console.error("Error loading outfit:", error);
    }
  };

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
    if (!user) return;

    if (!outfitName) {
      alert("Please enter a name for the outfit.");
      return;
    }

    if (outfitItems.length === 0) {
      alert("Please add items to the outfit.");
      return;
    }

    try {
      // Get clothing IDs from the outfit items
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

      // If editing, use the existing outfit ID, otherwise create a new one
      const outfitIdToUse = isEditing ? currentOutfitId : push(ref(database, 'outfits')).key;

      // Upload to Firebase Storage
      const imageRef = storageRef(storage, `outfits/${outfitIdToUse}.png`);
      await uploadBytes(imageRef, blob);
      const imageUrl = await getDownloadURL(imageRef);

      // Create outfit data object
      const outfitData = {
        outfitId: outfitIdToUse,
        clothingIDs,
        imageUrl,
        name: outfitName,
        sharedWith: []
      };

      // If editing, maintain the creation details but update the modification time
      if (isEditing) {
        outfitData.updatedAt = Date.now();
      } else {
        outfitData.createdAt = Date.now();
        outfitData.createdBy = user.uid;
      }

      // Save to Firebase Database
      if (isEditing) {
        await update(ref(database, `outfits/${outfitIdToUse}`), outfitData);
        console.log("Outfit updated successfully!");
      } else {
        await set(ref(database, `outfits/${outfitIdToUse}`), outfitData);
        console.log("Outfit saved successfully!");
      }

      await set(ref(database, `users/${user.uid}/outfits/${outfitIdToUse}`), outfitData);
      
      setShowSaveInput(false);
      
      // Navigate back to the home page where closet is located
      setTimeout(() => {
        window.location.replace('/');
      }, 100);

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
      <Header title={isEditing ? "Edit Outfit" : "New Outfit"} />
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

        {/* Save Outfit Modal */}
        <CustomModal show={showSaveInput} onClose={() => setShowSaveInput(false)} title={isEditing ? "Update Outfit" : "Save Outfit"}>
          <Form>
            <Form.Group>
              <Form.Label>Outfit Name</Form.Label>
              <Form.Control
                type="text"
                value={outfitName}
                onChange={(e) => setOutfitName(e.target.value)}
                placeholder="Enter outfit name"
              />
            </Form.Group>
          </Form>
          <div className="footer-buttons">
            <Button variant="secondary" onClick={() => setShowSaveInput(false)} className="save-cancel-button">
              <FiX /> Cancel
            </Button>
            <Button variant="primary" onClick={saveOutfit} className="footer-button">
              <FiSave /> {isEditing ? "Update" : "Save"}
            </Button>
          </div>
        </CustomModal>

        <Row>
          <Col className="footer">
            <div className="footer-buttons">
              <button className="footer-button" onClick={() => setShowSaveInput(true)}>
                <FiSave /> {isEditing ? "Update Outfit" : "Save Outfit"}
              </button>
              <button className="footer-button" onClick={handleGetFeedback}>
                <FiMessageSquare /> Get Feedback
              </button>
              <button className="footer-button cancel-button" onClick={() => window.location.replace('/')}>
                <FiX /> Cancel
              </button>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default OutfitBuilderPage;