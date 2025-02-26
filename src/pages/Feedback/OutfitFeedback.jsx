import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDatabase, ref, get, set, push } from 'firebase/database';
import { useAuthState } from '../../utilities/firebase';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import DomToImage from 'dom-to-image';
import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import { FiMinusCircle } from 'react-icons/fi';
// import './OutfitFeedbackPage.css';

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
  
          // ✅ Call fetchCloset only AFTER fetching outfit
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
      if (!ownerId) return; // 🛑 Prevent errors if ownerId is undefined
  
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
  
    fetchOutfitAndCloset(); // ✅ Call fetchOutfit, which will then call fetchCloset
  
  }, [user, outfitId, db]);
  

  // 🟢 Enable dragging items from the closet
  const handleDragStart = (event, item) => {
    console.log("Dragging item:", item);
    event.dataTransfer.setData('clothingItem', JSON.stringify(item));
  };

  // 🟢 Allow dropping items into the outfit
  const handleDrop = (event) => {
    event.preventDefault();
    const item = JSON.parse(event.dataTransfer.getData('clothingItem'));
    console.log("Dropped item:", item);

    if (!editedOutfit.some(i => i.id === item.id)) {
      setEditedOutfit([...editedOutfit, item]);
    }
  };

  // 🔴 Allow removing items from the outfit
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
  
      // 🔍 FIND EXISTING CHAT BETWEEN USERS
      const chatsSnapshot = await get(ref(db, `chats`));
      let chatId = null;
  
      if (chatsSnapshot.exists()) {
        const chats = chatsSnapshot.val();
        for (const [id, chat] of Object.entries(chats)) {
          if (chat.users && chat.users[user.uid] && chat.users[originalOutfit.createdBy]) {
            chatId = id;  // ✅ Found existing chat
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
        suggestionId: suggestionId,  // ✅ Store suggestionId
        timestamp: Date.now(),
      });
  
      console.log("Message sent to chat:", chatId);
  
      navigate(`/chat/${chatId}`);
    } catch (error) {
      console.error("Error suggesting changes:", error);
    }
  };
  

  return (
    <Container className="outfit-feedback">
      <h2>Suggest Changes</h2>
      
      {/* Outfit Preview */}
      <div className="outfit-preview" ref={outfitRef} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
  <div className="outfit-palette">
    {editedOutfit.length > 0 ? (
      editedOutfit.map((item, index) => (
        <div key={index} className="outfit-item" draggable>
          <img
            src={item.imageUrl}  // ✅ Show actual image
            alt={item.name}
            className="outfit-item-img"
          />
          <FiMinusCircle
            className="delete-item"
            onClick={() => removeItemFromOutfit(item)}
          />
        </div>
      ))
    ) : (
      <p>Drag & drop items here...</p>
    )}
  </div>
</div>


      {/* Closet Items */}
      <Row className="closet-items">
        {closetItems.length > 0 ? (
          closetItems.map((item) => (
            <Col key={item.id} xs={6} md={4} lg={3} className="closet-item-container">
              <Card className="closet-item-card">
                <Card.Img
                  src={item.imageUrl}
                  alt={item.name}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                  className="closet-item-img"
                />
                <Card.Body>
                  <Card.Text className="text-center">{item.name}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <p>No closet items found.</p>
        )}
      </Row>

      {/* Suggest Changes Button */}
      <Button className="mt-3" onClick={suggestChanges}>Suggest Changes</Button>
    </Container>
  );
};

export default OutfitFeedbackPage;
