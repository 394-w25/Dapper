import React, { useState, useEffect, useRef } from 'react';
import './OutfitBuilderPageNew.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, ButtonGroup, Button, Row, Col, Card, Modal } from "react-bootstrap";
import Header from "../../components/header/Header";
import { useAuthState } from "../../utilities/firebase";
import { database } from "../../utilities/firebase";
import { getDatabase, ref, get, set, push } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import FeedbackRequestModal from "../Feedback/FeedbackRequestModal";


// React icons
import { FaTshirt } from 'react-icons/fa';
import { PiPantsFill } from "react-icons/pi";
import { GiRunningShoe } from "react-icons/gi";
import { FaBagShopping } from 'react-icons/fa6';
import { FiMinusCircle, FiSave, FiX, FiLock, FiUnlock } from 'react-icons/fi';

const categories = [
  { name: 'Inspiration', icon: <FiLock /> },
  { name: 'Tops', icon: <FaTshirt /> },
  { name: 'Outerwear', icon: <FaTshirt /> },
  { name: 'Bottoms', icon: <PiPantsFill /> },
  { name: 'Shoes', icon: <GiRunningShoe /> },
  { name: 'Accessory', icon: <FaBagShopping /> },
];

const categoryMap = {
  Tops: "Tops",
  Outerwear: "Outerwear",
  Bottoms: "Bottoms",
  Shoes: "Shoes",
  Accessory: "Accessory",
};

const OutfitBuilderPageNew = () => {
  const [user] = useAuthState();
  const db = getDatabase();
  const storage = getStorage();
  const outfitRef = useRef(null);

  const [outfitItems, setOutfitItems] = useState({});
  const [clothingItems, setClothingItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Tops");
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [inspirations, setInspirations] = useState([]);
  const [savedOutfitId, setSavedOutfitId] = useState(null); // ✅ Store saved outfitId
  const [showFeedbackModal, setShowFeedbackModal] = useState(false); // ✅ Control feedback modal


  // Fetch user’s clothing
  useEffect(() => {
    if (!user) return;
    const fetchUserClothing = async () => {
      const userRef = ref(database, `users/${user.uid}/closet`);
      const userSnapshot = await get(userRef);
      if (userSnapshot.exists()) {
        const clothingIds = userSnapshot.val();
        const clothingDetails = [];
        for (const clothingId of clothingIds) {
          const clothingRef = ref(database, `clothing/${clothingId}`);
          const clothingSnapshot = await get(clothingRef);
          if (clothingSnapshot.exists()) {
            clothingDetails.push({ id: clothingId, ...clothingSnapshot.val() });
          }
        }
        setClothingItems(clothingDetails);
      }
    };
    fetchUserClothing();
  }, [user]);

  // Fetch inspirations from Firebase
  useEffect(() => {
    if (!user) return;
    const fetchInspirations = async () => {
      const inspirationRef = ref(database, `inspiration/${user.uid}/inspirations`);
      const inspirationSnapshot = await get(inspirationRef);
      if (inspirationSnapshot.exists()) {
        const inspirationsList = Object.values(inspirationSnapshot.val());
        setInspirations(inspirationsList);
      }
    };
    fetchInspirations();
  }, [user]);

  // Drag & drop
  const handleDragStart = (event, item) => {
    event.dataTransfer.setData('clothingItem', JSON.stringify(item));
  };

  const handleDrop = (event, category) => {
    event.preventDefault();
    if (category === "Inspiration") return;

    const item = JSON.parse(event.dataTransfer.getData('clothingItem'));
    const requiredCategory = categoryMap[category];

    if (item.category === requiredCategory) {
      setOutfitItems(prev => ({ ...prev, [category]: item }));
    } else {
      alert(`This slot is for ${requiredCategory} items!`);
    }
  };

  const removeItem = (category) => {
    setOutfitItems(prev => {
      const updated = { ...prev };
      delete updated[category];
      return updated;
    });
  };

  const handleReset = () => {
    setOutfitItems({});
  };

  // Handle selecting an inspiration
  const handleSelectInspiration = (imageUrl) => {
    setOutfitItems(prev => ({ ...prev, Inspiration: { imageUrl } }));
    setShowModal(false);
  };



  // **SAVE OUTFIT FUNCTION**
  const handleSaveOutfit = async () => {
    if (!user) return;

    try {
        console.log("🔄 Generating new outfit image...");

        if (Object.keys(outfitItems).length === 0) {
            console.warn("⚠️ No clothing items selected!");
            return;
        }

        // **Step 1: Exclude "Inspiration" and fetch clothing images**
        const filteredOutfitItems = Object.entries(outfitItems)
            .filter(([category, item]) => category !== "Inspiration") // Remove Inspiration
            .map(([category, item]) => item);

        const clothingImageUrls = filteredOutfitItems.map(item => item.imageUrl);
        const clothingIDs = filteredOutfitItems.map(item => item?.id).filter(id => id !== undefined); // Ensure valid IDs

        if (clothingImageUrls.length === 0) {
            console.error("❌ No valid clothing images found. Aborting image generation.");
            return;
        }

        console.log("📸 Retrieved clothing images:", clothingImageUrls);
        console.log("🛠 Clothing IDs Before Saving:", clothingIDs);

        // **Step 2: Create structured layout for outfit image**
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = 350;
        canvas.height = 250;

        const itemWidth = 80, itemHeight = 80;
        const itemsPerRow = Math.ceil(Math.sqrt(clothingImageUrls.length));
        const totalRows = Math.ceil(clothingImageUrls.length / itemsPerRow);

        const startX = (canvas.width - itemsPerRow * (itemWidth + 20)) / 2;
        const startY = (canvas.height - totalRows * (itemHeight + 20)) / 2;

        for (let i = 0; i < clothingImageUrls.length; i++) {
            const img = await loadImage(clothingImageUrls[i]);

            const x = startX + (i % itemsPerRow) * (itemWidth + 20);
            const y = startY + Math.floor(i / itemsPerRow) * (itemHeight + 20);

            ctx.drawImage(img, x, y, itemWidth, itemHeight);
        }

        // **Step 3: Convert canvas to Blob**
        const dataUrl = canvas.toDataURL("image/png");
        const response = await fetch(dataUrl);
        const blob = await response.blob();

        // **Step 4: Upload new outfit image to Firebase Storage**
        const outfitId = push(ref(database, 'outfits')).key; // Ensure 'database' is correctly referenced
        const imageRef = storageRef(storage, `outfits/${outfitId}.png`);
        await uploadBytes(imageRef, blob);
        const imageUrl = await getDownloadURL(imageRef);

        console.log("✅ New outfit image uploaded successfully:", imageUrl);

        setSavedOutfitId(outfitId); // ✅ Store outfitId immediately


        // **Step 5: Save outfit metadata in Firebase Database**
        await set(ref(database, `outfits/${outfitId}`), {
            outfitId,
            createdBy: user.uid,
            createdAt: Date.now(),
            clothingIDs, // Only valid clothing items, no inspiration
            imageUrl,
            name: "My Outfit"
        });

        // ✅ **Show success message**
        setSuccessMessage("🎉 Outfit saved successfully!");
        setTimeout(() => setSuccessMessage(""), 3000); // Clear message after 3s
    } catch (error) {
        console.error("❌ Error saving outfit:", error);
        alert("Failed to save outfit. Please try again.");
    }
};

// Helper function to load images
const loadImage = (src) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; // Allow cross-origin images
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
};

  
  

  return (
    <div className="outfit-builder">
      <Header title="Outfit Builder" />
      <Container>

       {/* Success Message Alert with Floating Position */}
       {successMessage && (
        <div className="success-alert">
          {successMessage}
        </div>
      )}

        {/* ---- Outfit Preview Grid ---- */}
        <Row>
          <Col>
            <div className="outfit-preview"  ref={outfitRef}>
              <Row xs={2} className="g-3">
              {categories.map(({ name, icon }) => (
  <Col key={name}>
    <div
      className={`category-slot ${outfitItems[name] ? 'filled' : ''}`}
      onDrop={(e) => handleDrop(e, name)}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => name === "Inspiration" && setShowModal(true)}
    >
      {/* Only show lock icon for other categories */}
      {name !== "Inspiration" && (
        outfitItems[name] ? <FiLock className="lock-icon top-left" /> : <FiUnlock className="lock-icon top-left" />
      )}

      {/* Inspiration Image Fully Covering the Card */}
      {name === "Inspiration" ? (
        outfitItems[name] ? (
          <img src={outfitItems[name].imageUrl} alt="Inspiration" className="inspiration-image" />
        ) : (
          <div className="empty-inspiration">Click to select an inspiration</div>
        )
      ) : (
        outfitItems[name] && (
          <div className="outfit-item">
            <img src={outfitItems[name].imageUrl} alt={name} />
            <FiMinusCircle onClick={() => removeItem(name)} className="remove-icon" />
          </div>
        )
      )}

      {/* Category Label */}
      <span className="category-label">{icon} {name}</span>
    </div>
  </Col>
))}

              </Row>
            </div>
          </Col>
        </Row>

        {/* ---- Category Buttons ---- */}
        <Row className="g-0 mt-0 mb-0">
          <Col className="p-0">
            <ButtonGroup className="categories mb-0">
              {categories.filter(cat => cat.name !== "Inspiration").map((cat) => (
                <Button
                  key={cat.name}
                  size="sm"
                  variant={cat.name === selectedCategory ? "secondary" : "outline-secondary"}
                  onClick={() => setSelectedCategory(cat.name)}
                  className="category-button"
                >
                  {cat.icon} {cat.name}
                </Button>
              ))}
            </ButtonGroup>
          </Col>
        </Row>

        {/* ---- Clothing Items ---- */}
        <Row className="g-0 mt-0 mb-0">
          <Col className="p-0">
            <div className="card-group-wrapper">
              <div className="clothing-card-group">
                {clothingItems.filter(item => item.category === selectedCategory)
                  .map((item, index) => (
                    <Card
                      key={index}
                      className="clothing-option"
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                    >
                      <Card.Img variant="top" src={item.imageUrl} />
                    </Card>
                  ))}
              </div>
            </div>
          </Col>
        </Row>

        {/* ---- Footer Buttons ---- */}
        <div className="footer-buttons">
        <Button variant="primary" className="save-button" onClick={handleSaveOutfit}>
            <FiSave /> Save
          </Button>
                {/* ✅ Show "Share" button only when outfit is saved */}
                {savedOutfitId !== null && (
          <Button
              variant="outline-secondary"
              className="share-button"
              onClick={() => setShowFeedbackModal(true)}
          >
              Share
          </Button>
      )}


          <Button variant="outline-secondary" className="reset-button" onClick={handleReset}>
            <FiX /> Reset
          </Button>
        </div>

      </Container>

      {/* ---- Inspiration Selection Modal ---- */}
      <Modal show={showModal} onHide={() => setShowModal(false)} dialogClassName="mobile-modal">
  <Modal.Header closeButton>
    <Modal.Title>Select an Inspiration</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <div className="inspiration-grid">
      {inspirations.map((inspo, index) => (
        <div key={index} className="inspo-container">
          <img
            src={inspo.imageUrl}
            alt="Inspiration"
            className="inspo-thumbnail"
            onClick={() => handleSelectInspiration(inspo.imageUrl)}
          />
        </div>
      ))}
    </div>
  </Modal.Body>
</Modal>

{/* ✅ Feedback Request Modal with outfitId */}
{showFeedbackModal && savedOutfitId && (
        <FeedbackRequestModal
          outfitId={savedOutfitId} // ✅ Pass saved outfitId
          onClose={() => setShowFeedbackModal(false)}
        />
      )}

    </div>
  );
};

export default OutfitBuilderPageNew;
