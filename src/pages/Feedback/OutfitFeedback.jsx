import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDatabase, ref, get, set, push } from 'firebase/database';
import { useAuthState } from '../../utilities/firebase';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import DomToImage from 'dom-to-image';
import { Button, Card, Container, Row, Col, ButtonGroup, Nav } from 'react-bootstrap';
import { FiMinusCircle } from 'react-icons/fi';
import { FaTshirt } from 'react-icons/fa';
import { FaBagShopping } from 'react-icons/fa6';
import { TbHanger } from 'react-icons/tb';
import { PiPantsFill } from 'react-icons/pi';
import { GiRunningShoe } from 'react-icons/gi';
import Header from '../../components/header/Header';

const categories = [
  { name: 'All', icon: <TbHanger /> },
  { name: 'Tops', icon: <FaTshirt /> },
  { name: 'Bottoms', icon: <PiPantsFill /> },
  { name: 'Shoes', icon: <GiRunningShoe /> },
  { name: 'Accessories', icon: <FaBagShopping /> }
];

const OutfitFeedbackPage = () => {
  const { outfitId } = useParams();
  const [user] = useAuthState();
  const db = getDatabase();
  const storage = getStorage();
  const navigate = useNavigate();
  const outfitRef = useRef(null);

  const [originalOutfit, setOriginalOutfit] = useState(null);
  const [editedOutfit, setEditedOutfit] = useState([]);
  const [closetItems, setClosetItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [clickedItems, setClickedItems] = useState(new Set());
  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    if (!user || !outfitId) return;
  
    console.log("Fetching data for outfitId:", outfitId);
  
    const fetchOutfitAndCloset = async () => {
      try {
        const outfitSnapshot = await get(ref(db, `outfits/${outfitId}`));
        if (outfitSnapshot.exists()) {
          const outfitData = outfitSnapshot.val();
          console.log("Original outfit data:", outfitData);
  
          setOriginalOutfit(outfitData);
  
          // Fetch clothing details for each clothing ID
          const clothingDetails = [];
          for (const clothingId of outfitData.clothingIDs || []) {
            const clothingRef = ref(db, `clothing/${clothingId}`);
            const clothingSnapshot = await get(clothingRef);
            if (clothingSnapshot.exists()) {
              clothingDetails.push({ id: clothingId, ...clothingSnapshot.val() });
            } else {
              console.warn(`Clothing item not found for ID: ${clothingId}`);
            }
          }
  
          console.log("Fetched outfit clothing details:", clothingDetails);
          setEditedOutfit(clothingDetails);
  
          // Call fetchCloset only AFTER fetching outfit
          if (outfitData.createdBy) {
            fetchCloset(outfitData.createdBy);
          }
        } else {
          console.warn("No outfit found with outfitId:", outfitId);
        }
      } catch (error) {
        console.error("Error fetching outfit:", error);
      }
    };
  
    const fetchCloset = async (ownerId) => {
      if (!ownerId) return; // Prevent errors if ownerId is undefined
  
      console.log("Fetching closet for friend (outfit creator):", ownerId);
      const closetSnapshot = await get(ref(db, `users/${ownerId}/closet`));
  
      if (closetSnapshot.exists()) {
        const clothingIds = Object.values(closetSnapshot.val());
        console.log("Friend's Closet Clothing IDs:", clothingIds);
  
        const clothingDetails = [];
        for (const clothingId of clothingIds) {
          const clothingRef = ref(db, `clothing/${clothingId}`);
          const clothingSnapshot = await get(clothingRef);
  
          if (clothingSnapshot.exists()) {
            clothingDetails.push({ id: clothingId, ...clothingSnapshot.val() });
          } else {
            console.warn(`Clothing item not found for ID: ${clothingId}`);
          }
        }
  
        console.log("Final friend's closet items:", clothingDetails);
        setClosetItems(clothingDetails);
      } else {
        console.warn("No closet found for this user.");
      }
    };
  
    fetchOutfitAndCloset();
  
  }, [user, outfitId, db]);
  
  // Enable dragging items from the closet
  const handleDragStart = (event, item) => {
    console.log("Dragging item:", item);
    event.dataTransfer.setData('clothingItem', JSON.stringify(item));
  };

  // Allow dropping items into the outfit
  const handleDrop = (event) => {
    event.preventDefault();
    const item = JSON.parse(event.dataTransfer.getData('clothingItem'));
    console.log("Dropped item:", item);

    if (!editedOutfit.some(i => i.id === item.id)) {
      setEditedOutfit([...editedOutfit, item]);
    }
  };

  // Allow removing items from the outfit
  const removeItemFromOutfit = (itemToRemove) => {
    setEditedOutfit(editedOutfit.filter(item => item.id !== itemToRemove.id));
  };

  const suggestChanges = async () => {
    if (!user) return;
  
    console.log("Suggesting changes for outfitId:", outfitId);
    console.log("Edited Outfit Clothing IDs:", editedOutfit);
  
    try {
      // Convert outfit preview to an image
      const dataUrl = await DomToImage.toPng(outfitRef.current);
      const response = await fetch(dataUrl);
      const blob = await response.blob();
  
      // Upload image to Firebase Storage
      const suggestionId = push(ref(db, 'outfits_suggestions')).key;
      const imageRef = storageRef(storage, `outfits_suggestions/${suggestionId}.png`);
      await uploadBytes(imageRef, blob);
      const imageUrl = await getDownloadURL(imageRef);
  
      console.log("Uploaded suggested outfit image URL:", imageUrl);
  
      // Save suggested outfit
      await set(ref(db, `outfits_suggestions/${suggestionId}`), {
        outfitId,
        suggestedBy: user.uid,
        clothingIDs: editedOutfit.map(item => item.id),
        imageUrl,
        timestamp: Date.now()
      });
  
      console.log("Outfit suggestion saved successfully!");
  
      // FIND EXISTING CHAT BETWEEN USERS
      const chatsSnapshot = await get(ref(db, `chats`));
      let chatId = null;
  
      if (chatsSnapshot.exists()) {
        const chats = chatsSnapshot.val();
        for (const [id, chat] of Object.entries(chats)) {
          if (chat.users && chat.users[user.uid] && chat.users[originalOutfit.createdBy]) {
            chatId = id;  // Found existing chat
            break;
          }
        }
      }
  
      // If no existing chat, create one
      if (!chatId) {
        chatId = push(ref(db, "chats")).key;
        await set(ref(db, `chats/${chatId}`), {
          users: {
            [user.uid]: true,
            [originalOutfit.createdBy]: true
          },
          messages: {}
        });
      }
  
      // Send notification message in the correct chat
      const chatRef = ref(db, `chats/${chatId}/messages`);
      const newMessageRef = push(chatRef);
      await set(newMessageRef, {
        senderId: 'system',
        text: `${user.displayName} has suggested changes to your outfit. Click to review!`,
        suggestionId: suggestionId,
        timestamp: Date.now(),
      });
  
      console.log("Message sent to chat:", chatId);
  
      navigate(`/chat/${chatId}`);
    } catch (error) {
      console.error("Error suggesting changes:", error);
    }
  };

  return (
    <div className="outfit-builder">
      {/* Using the shared Header component */}
      <Header title="Suggest Changes" />

      <Container className="outfitbuilder-content">
        {/* Outfit Preview Area */}
        <Row className="mb-4">
          <Col>
            <div className="outfit-preview" ref={outfitRef} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
              <div className="outfit-palette">
                {editedOutfit.length > 0 ? (
                  editedOutfit.map((item, index) => (
                    <div 
                      key={index} 
                      className="outfit-item" 
                      draggable
                      style={{ gridColumn: (index % 2) + 1, gridRow: Math.floor(index / 2) + 1 }}
                      onClick={() => {
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
                      }}
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <img
                        src={item.imageUrl}
                        alt="Clothing item"
                        className="outfit-item-img"
                      />
                      {(clickedItems.has(item.id) || hoveredItem === item.id) && (
                        <FiMinusCircle
                          className="delete-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeItemFromOutfit(item);
                          }}
                        />
                      )}
                    </div>
                  ))
                ) : (
                  <p>Drag & drop items here...</p>
                )}
              </div>
            </div>
          </Col>
        </Row>

        {/* Category Filter Buttons - Similar to OutfitBuilderPage */}
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

            {/* Closet Items Grid */}
            <div className="card-group-wrapper">
              <div className="clothing-card-group">
                {(selectedCategory === 'All' 
                  ? closetItems 
                  : closetItems.filter(item => item.category === selectedCategory))
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

        {/* Submit Button - Styled like OutfitBuilderPage */}
        <Row>
          <Col className="text-center mt-3 mb-4">
            <Button 
              onClick={suggestChanges} 
              className="footer-button" 
              style={{
                background: '#000',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px'
              }}
            >
              Suggest Changes
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default OutfitFeedbackPage;