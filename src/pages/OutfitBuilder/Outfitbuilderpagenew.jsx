import React, { useState, useEffect } from 'react';
import './OutfitBuilderPageNew.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, ButtonGroup, Button, Row, Col, Card, Nav } from "react-bootstrap";
import Header from "../../components/header/Header";
import { useAuthState } from "../../utilities/firebase";
import { database } from "../../utilities/firebase";
import { ref, get } from 'firebase/database';

// React icons
import { FaTshirt } from 'react-icons/fa';
import { PiPantsFill } from "react-icons/pi";
import { GiRunningShoe } from "react-icons/gi";
import { FaBagShopping } from 'react-icons/fa6';
import { FiMinusCircle, FiSave, FiX, FiLock, FiUnlock } from 'react-icons/fi';

// 6 categories total => 2 columns x 3 rows
const categories = [
  { name: 'Tops', icon: <FaTshirt /> },
  { name: 'Outerwear', icon: <FaTshirt /> },
  { name: 'Bottoms', icon: <PiPantsFill /> },
  { name: 'Shoes', icon: <GiRunningShoe /> },
  { name: 'Accessory', icon: <FaBagShopping /> },
  { name: 'Accessory 2', icon: <FaBagShopping /> },
];

// If the user tries to drop an item on "Accessory 2", 
// we treat it as "Accessory" for matching.
const categoryMap = {
    Tops: "Tops",
    Outerwear: "Outerwear",
    Bottoms: "Bottoms",
    Shoes: "Shoes",
    Accessory: "Accessory",
    "Accessory 2": "Accessory"
  };
  

const OutfitBuilderPageNew = () => {
  const [user] = useAuthState();
  
  // Slots that hold the dragged-in items
  const [outfitItems, setOutfitItems] = useState({});
  
  // All clothing from DB
  const [clothingItems, setClothingItems] = useState([]);
  
  // Which category to show in the scroll below
  const [selectedCategory, setSelectedCategory] = useState("Tops");

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

  // Drag & drop
  const handleDragStart = (event, item) => {
    event.dataTransfer.setData('clothingItem', JSON.stringify(item));
  };

  const handleDrop = (event, category) => {
    event.preventDefault();
    const item = JSON.parse(event.dataTransfer.getData('clothingItem'));
    
    // Determine what item category is allowed in this slot
    const requiredCategory = categoryMap[category];
  
    if (item.category === requiredCategory) {
      // Accept the drop
      setOutfitItems(prev => ({ ...prev, [category]: item }));
    } else {
      // Reject the drop (e.g. alert or ignore)
      alert(`This slot is for ${requiredCategory} items, but you dragged a ${item.category}!`);
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

  return (
    <div className="outfit-builder">
      <Header title="Outfit Builder" />
      <Container>

        {/* ---- Row 1: The 2x3 Outfit Preview grid ---- */}
        <Row>
          <Col>
            <div className="outfit-preview">
              <Row xs={2} className="g-3">
                {categories.map(({ name, icon }) => (
                  <Col key={name}>
                  <div
                    className={`category-slot ${outfitItems[name] ? 'filled' : ''}`}
                    onDrop={(e) => handleDrop(e, name)}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    {/* Condition: locked if item is present, else unlocked */}
                    {outfitItems[name] ? (
                      <FiLock className="lock-icon top-right" />
                    ) : (
                      <FiUnlock className="lock-icon top-right" />
                    )}
                
                    {/* Show the item if present */}
                    {outfitItems[name] && (
                      <div className="outfit-item">
                        <img src={outfitItems[name].imageUrl} alt={name} />
                        <FiMinusCircle
                          onClick={() => removeItem(name)}
                          className="remove-icon"
                        />
                      </div>
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

        {/* ---- Row 2: Category filter buttons ---- */}
       {/* Category Buttons Row */}
<Row className="g-0 mt-0 mb-0">
  <Col className="p-0">
    <ButtonGroup className="categories mb-0">
      {categories.map((cat) => (
        <Button
          key={cat.name}
          size="sm"                      // <<--- Add this
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

{/* Clothing Items Row */}
<Row className="g-0 mt-0 mb-0">
  <Col className="p-0">
    <div className="card-group-wrapper">
      <div className="clothing-card-group">
        {(selectedCategory === 'All' ? clothingItems : clothingItems.filter(item => item.category === selectedCategory))
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
          <Button variant="primary" className="save-button">
            <FiSave /> Save
          </Button>
          <Button variant="outline-secondary" className="share-button">
            Share
          </Button>
          <Button
            variant="outline-secondary"
            className="reset-button"
            onClick={handleReset}
          >
            <FiX /> Reset
          </Button>
        </div>

      </Container>
    </div>
  );
};

export default OutfitBuilderPageNew;
