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
import { useLocation, useNavigate } from 'react-router-dom';

// Icons
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

// *** Customize these constants to your liking ***
const TARGET_HEIGHT = 80;          // Each item up to 80px tall
const SPACING = 10;               // Gap on left + between items
const MAX_CANVAS_WIDTH = 280;     // We won't let it exceed 280
const CANVAS_HEIGHT = 100;        // Canvas is 100px tall

const OutfitBuilderPageNew = () => {
  const [user] = useAuthState();
  const db = getDatabase();
  const storage = getStorage();
  const location = useLocation();
  const navigate = useNavigate();

  const outfitCanvasRef = useRef(null);

  const [outfitItems, setOutfitItems] = useState({});
  const [clothingItems, setClothingItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Tops");
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [inspirations, setInspirations] = useState([]);

  const [savedOutfitId, setSavedOutfitId] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [outfitName, setOutfitName] = useState("My Outfit");

  // -------------------------
  // Load existing outfit if editing
  // -------------------------
  const loadOutfit = async (outfitId) => {
    try {
      const outfitDataRef = ref(db, `outfits/${outfitId}`);
      const snapshot = await get(outfitDataRef);

      if (snapshot.exists()) {
        const outfitData = snapshot.val();
        if (outfitData.name) setOutfitName(outfitData.name);
        
        // Load clothing items
        if (outfitData.clothingIDs && outfitData.clothingIDs.length > 0) {
          const newOutfitItems = {};
          for (const clothingId of outfitData.clothingIDs) {
            const clothingRef = ref(db, `clothing/${clothingId}`);
            const clothingSnapshot = await get(clothingRef);
            if (clothingSnapshot.exists()) {
              const clothingData = { id: clothingId, ...clothingSnapshot.val() };
              if (clothingData.category === "Tops") {
                newOutfitItems.Tops = clothingData;
              } else if (clothingData.category === "Bottoms") {
                newOutfitItems.Bottoms = clothingData;
              } else if (clothingData.category === "Shoes") {
                newOutfitItems.Shoes = clothingData;
              } else if (clothingData.category === "Accessory") {
                newOutfitItems.Accessory = clothingData;
              } else if (clothingData.category === "Outerwear") {
                newOutfitItems.Outerwear = clothingData;
              }
            }
          }
          setOutfitItems(newOutfitItems);
        }

        setSuccessMessage("Outfit loaded for editing");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        console.error("Outfit not found");
        setSuccessMessage("Error: Outfit not found");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error loading outfit:", error);
      setSuccessMessage("Error loading outfit");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  useEffect(() => {
    if (location.state && location.state.editOutfitId) {
      const outfitId = location.state.editOutfitId;
      setSavedOutfitId(outfitId);
      setIsEditing(true);
      loadOutfit(outfitId);
    }
  }, [location]);

  // -------------------------
  // Fetch user clothing
  // -------------------------
  useEffect(() => {
    if (!user) return;
    const fetchUserClothing = async () => {
      const userRef = ref(db, `users/${user.uid}/closet`);
      const userSnapshot = await get(userRef);
      if (userSnapshot.exists()) {
        const clothingIds = userSnapshot.val();
        const clothingDetails = [];
        for (const clothingId of clothingIds) {
          const clothingDataRef = ref(db, `clothing/${clothingId}`);
          const clothingSnapshot = await get(clothingDataRef);
          if (clothingSnapshot.exists()) {
            clothingDetails.push({ id: clothingId, ...clothingSnapshot.val() });
          }
        }
        setClothingItems(clothingDetails);
      }
    };
    fetchUserClothing();
  }, [user]);

  // -------------------------
  // Fetch user inspirations
  // -------------------------
  useEffect(() => {
    if (!user) return;
    const fetchInspirations = async () => {
      const inspirationRef = ref(db, `inspiration/${user.uid}/inspirations`);
      const inspirationSnapshot = await get(inspirationRef);
      if (inspirationSnapshot.exists()) {
        const inspirationsList = Object.values(inspirationSnapshot.val());
        setInspirations(inspirationsList);
      }
    };
    fetchInspirations();
  }, [user]);

  // -------------------------
  // Redraw the canvas whenever outfitItems changes
  // -------------------------
  useEffect(() => {
    drawCanvas();
  }, [outfitItems]);

  const drawCanvas = async () => {
    const canvas = outfitCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // 1) Gather categories (excluding Inspiration)
    const catKeys = Object.keys(outfitItems).filter(k => k !== "Inspiration");
    if (catKeys.length === 0) {
      // no items => clear canvas, done
      canvas.width = MAX_CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    // 2) Load the images
    const images = [];
    for (let cat of catKeys) {
      const item = outfitItems[cat];
      if (!item || !item.imageUrl) continue;
      const img = await loadImage(item.imageUrl);
      images.push(img);
    }
    if (images.length === 0) return;

    // 3) Measure total needed width if each image is drawn at TARGET_HEIGHT
    // We'll store them in an array so we know width/height
    const sizedImages = images.map(img => {
      const ratio = img.naturalWidth / img.naturalHeight;
      const w = ratio * TARGET_HEIGHT; // scale to 80px tall
      return { img, width: w, height: TARGET_HEIGHT };
    });

    const totalItemsWidth = sizedImages.reduce((acc, s) => acc + s.width, 0);
    // Number of gaps = images.length + 1 (left edge + between + right edge)
    const neededWidth = totalItemsWidth + SPACING * (images.length + 1);

    // 4) Decide final canvas width & scale factor
    let finalWidth;
    let scale = 1;

    if (neededWidth <= MAX_CANVAS_WIDTH) {
      // If it fits, canvas width = neededWidth
      finalWidth = neededWidth;
    } else {
      // If it's too big, scale down to fit in MAX_CANVAS_WIDTH
      finalWidth = MAX_CANVAS_WIDTH;
      scale = MAX_CANVAS_WIDTH / neededWidth;
    }

    // 5) Now set the canvas dimensions
    canvas.width = finalWidth;
    canvas.height = CANVAS_HEIGHT;

    // Clear it out
    ctx.clearRect(0, 0, finalWidth, CANVAS_HEIGHT);

    console.log("DEBUG: neededWidth =", neededWidth, ", scale =", scale, ", finalWidth =", finalWidth);

    // 6) Actually draw
    let xPos = SPACING * scale; // left margin scaled
    sizedImages.forEach((s, i) => {
      const wScaled = s.width * scale;
      const hScaled = s.height * scale;
      const yPos = (CANVAS_HEIGHT - hScaled) / 2;
      console.log(`DEBUG: Drawing item ${i} at x=${xPos}, y=${yPos}, w=${wScaled}, h=${hScaled}`);
      ctx.drawImage(s.img, xPos, yPos, wScaled, hScaled);
      xPos += wScaled + (SPACING * scale);
    });
  };

  // Helper to load image with crossOrigin
  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  /* ---------------------------------------------
     Drag & Drop
  --------------------------------------------- */
  const handleDragStart = (event, item) => {
    event.dataTransfer.setData("clothingItem", JSON.stringify(item));
  };

  const handleDrop = (event, category) => {
    event.preventDefault();
    if (category === "Inspiration") return;
    const item = JSON.parse(event.dataTransfer.getData("clothingItem"));
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

  /* ---------------------------------------------
     Inspiration
  --------------------------------------------- */
  const handleSelectInspiration = (imageUrl) => {
    setOutfitItems(prev => ({ ...prev, Inspiration: { imageUrl } }));
    setShowModal(false);
  };

  /* ---------------------------------------------
     SAVE OUTFIT (from the canvas)
  --------------------------------------------- */
  const handleSaveOutfit = async () => {
    if (!user) return;
    const realClothingKeys = Object.keys(outfitItems).filter(cat => cat !== "Inspiration");
    if (realClothingKeys.length === 0) {
      alert("Please add at least one clothing item to the outfit.");
      return;
    }

    try {
      const canvas = outfitCanvasRef.current;
      const dataUrl = canvas.toDataURL("image/png");
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      const outfitId = isEditing
        ? savedOutfitId
        : push(ref(db, "outfits")).key;

      // Upload
      const imageRef = storageRef(storage, `outfits/${outfitId}.png`);
      await uploadBytes(imageRef, blob);
      const imageUrl = await getDownloadURL(imageRef);

      // Gather clothing IDs
      const clothingIDs = realClothingKeys.map(cat => outfitItems[cat].id);

      // Build or update
      let outfitData = {};
      if (isEditing) {
        const existingSnap = await get(ref(db, `outfits/${outfitId}`));
        if (existingSnap.exists()) {
          outfitData = existingSnap.val() || {};
        }
        outfitData.clothingIDs = clothingIDs;
        outfitData.imageUrl = imageUrl;
        outfitData.name = outfitName;
        outfitData.updatedAt = Date.now();
      } else {
        outfitData = {
          outfitId,
          clothingIDs,
          imageUrl,
          name: outfitName,
          createdBy: user.uid,
          createdAt: Date.now()
        };
      }

      // Save
      await set(ref(db, `outfits/${outfitId}`), outfitData);
      await set(ref(db, `users/${user.uid}/outfits/${outfitId}`), outfitData);

      setSavedOutfitId(outfitId);
      setSuccessMessage(isEditing ? "🎉 Outfit updated successfully!" : "🎉 Outfit created successfully!");
      navigate("/mycloset");
    } catch (err) {
      console.error("❌ Error saving outfit:", err);
      alert("Failed to save outfit. Please try again.");
    }
  };

  return (
    <div className="outfit-builder">
      <Header title={isEditing ? `Edit ${outfitName}` : "New Outfit"} />
      <Container>
        {successMessage && (
          <div className="success-alert">{successMessage}</div>
        )}

        {/* The drag & drop grid */}
        <Row>
          <Col>
            <div className="outfit-preview">
              <Row xs={2} className="g-3">
                {categories.map(({ name, icon }) => (
                  <Col key={name}>
                    <div
                      className={`category-slot ${outfitItems[name] ? "filled" : ""}`}
                      onDrop={e => handleDrop(e, name)}
                      onDragOver={e => e.preventDefault()}
                      onClick={() => name === "Inspiration" && setShowModal(true)}
                    >
                      {name !== "Inspiration" && (
                        outfitItems[name] ? (
                          <FiLock className="lock-icon top-left" />
                        ) : (
                          <FiUnlock className="lock-icon top-left" />
                        )
                      )}
                      {name === "Inspiration" ? (
                        outfitItems[name] ? (
                          <img
                            src={outfitItems[name].imageUrl}
                            alt="Inspiration"
                            className="inspiration-image"
                          />
                        ) : (
                          <div className="empty-inspiration">
                            Click to select an inspiration
                          </div>
                        )
                      ) : (
                        outfitItems[name] && (
                          <div className="outfit-item">
                            <img src={outfitItems[name].imageUrl} alt={name} />
                            <FiMinusCircle
                              onClick={() => removeItem(name)}
                              className="remove-icon"
                            />
                          </div>
                        )
                      )}

                      <span className="category-label">
                        {icon} {name}
                      </span>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          </Col>
        </Row>

        {/* The final canvas (280 wide by default, 100 tall) */}
        <Row>
          <Col className="mt-3 text-center">
            <canvas
              ref={outfitCanvasRef}
              width={MAX_CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              style={{ backgroundColor: "#fff" }}
            />
            <p style={{ fontSize: "14px", marginTop: "4px", color: "#666" }}>
              Outfit Preview (Canvas)
            </p>
          </Col>
        </Row>

        {/* Category Buttons */}
        <Row className="g-0 mt-0 mb-0">
          <Col className="p-0">
            <ButtonGroup className="categories mb-2">
              {categories
                .filter(cat => cat.name !== "Inspiration")
                .map(cat => (
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

        {/* Clothing items for that category */}
        <Row className="g-0 mt-0 mb-0">
          <Col className="p-0">
            <div className="card-group-wrapper">
              <div className="clothing-card-group">
                {clothingItems
                  .filter(item => item.category === selectedCategory)
                  .map((item, index) => (
                    <Card
                      key={index}
                      className="clothing-option"
                      draggable
                      onDragStart={e => handleDragStart(e, item)}
                    >
                      <Card.Img variant="top" src={item.imageUrl} />
                    </Card>
                  ))}
              </div>
            </div>
          </Col>
        </Row>

        {/* Footer buttons */}
        <div className="footer-buttons">
          <Button variant="primary" className="save-button" onClick={handleSaveOutfit}>
            <FiSave /> {isEditing ? "Update" : "Save"}
          </Button>
          {savedOutfitId && (
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

      {/* Inspiration Modal */}
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

      {/* Feedback modal */}
      {showFeedbackModal && savedOutfitId && (
        <FeedbackRequestModal
          outfitId={savedOutfitId}
          onClose={() => setShowFeedbackModal(false)}
        />
      )}
    </div>
  );
};

export default OutfitBuilderPageNew;
