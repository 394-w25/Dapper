import React, { useEffect, useState } from "react";
import { getDatabase, ref, get, update, push, set } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { Modal, Button } from "react-bootstrap";
import ImageComponent from "react-bootstrap/Image";

const SuggestionModal = ({ show, onHide, suggestionId, outfitId, chatId, user }) => {
  const [suggestion, setSuggestion] = useState(null);
  const db = getDatabase();

  useEffect(() => {
    if (!suggestionId) return;

    // Fetch the specific suggestion
    const fetchSuggestion = async () => {
      const suggestionRef = ref(db, `outfits_suggestions/${suggestionId}`);
      const snapshot = await get(suggestionRef);
      if (snapshot.exists()) {
        setSuggestion(snapshot.val());
      } else {
        console.warn("Suggestion not found");
      }
    };

    fetchSuggestion();
  }, [suggestionId, db]);

  const handleAccept = async () => {
    if (!suggestion || !chatId || !user || !suggestion.outfitId) {
      console.warn("🚨 Missing required data:", { suggestion, chatId, user, outfitId });
      return;
    }
  
    const targetOutfitId = suggestion.outfitId; 
    const storage = getStorage();
    const db = getDatabase();
  
    try {
      console.log("🔄 Generating new outfit image...");
  
      if (!Array.isArray(suggestion.clothingIDs) || suggestion.clothingIDs.length === 0) {
        console.warn("⚠️ suggestion.clothingIDs is empty or not an array!");
        return;
      }
  
      // Step 1: Fetch clothing item image URLs from database
      const clothingImageUrls = [];
      for (const clothingId of suggestion.clothingIDs) {
        const clothingRef = ref(db, `clothing/${clothingId}`);
        const clothingSnapshot = await get(clothingRef);
        if (clothingSnapshot.exists()) {
          clothingImageUrls.push(clothingSnapshot.val().imageUrl);
        } else {
          console.warn(`⚠️ Clothing item not found for ID: ${clothingId}`);
        }
      }
  
      if (clothingImageUrls.length === 0) {
        console.error("❌ No valid clothing images found. Aborting image generation.");
        return;
      }
  
      console.log("📸 Retrieved clothing images:", clothingImageUrls);
  
      // Step 2: Create structured layout for outfit image
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
  
      // Set canvas dimensions
      const canvasWidth = 350;
      const canvasHeight = 250;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
  
      // Set size for each clothing item
      const itemWidth = 80;
      const itemHeight = 80;
  
      // Determine grid layout
      const itemsPerRow = Math.ceil(Math.sqrt(clothingImageUrls.length));
      const totalRows = Math.ceil(clothingImageUrls.length / itemsPerRow);
  
      // Calculate spacing for centering
      const totalWidth = itemsPerRow * itemWidth + (itemsPerRow - 1) * 20; // Include spacing
      const totalHeight = totalRows * itemHeight + (totalRows - 1) * 20;
  
      const startX = (canvasWidth - totalWidth) / 2; // Center horizontally
      const startY = (canvasHeight - totalHeight) / 2; // Center vertically
  
      for (let i = 0; i < clothingImageUrls.length; i++) {
        const img = await loadImage(clothingImageUrls[i]);
  
        const col = i % itemsPerRow; // Column position
        const row = Math.floor(i / itemsPerRow); // Row position
  
        const x = startX + col * (itemWidth + 20); // Offset for centering
        const y = startY + row * (itemHeight + 20);
  
        ctx.drawImage(img, x, y, itemWidth, itemHeight);
      }
  
      // Convert canvas to Blob
      const dataUrl = canvas.toDataURL("image/png");
      const response = await fetch(dataUrl);
      const blob = await response.blob();
  
      // Step 3: Upload new image to Firebase Storage
      const newImageRef = storageRef(storage, `outfits/${targetOutfitId}.png`);
      await uploadBytes(newImageRef, blob);
      const newImageUrl = await getDownloadURL(newImageRef);
  
      console.log("✅ New outfit image uploaded successfully:", newImageUrl);
  
      // Step 4: Update the outfit in Firebase with new clothing IDs and image URL
      await update(ref(db, `outfits/${targetOutfitId}`), {
        clothingIDs: suggestion.clothingIDs,
        imageUrl: newImageUrl, 
      });
  
      console.log("✅ Outfit updated successfully!");
  
      // Step 5: Send system message in chat
      const messageRef = push(ref(db, `chats/${chatId}/messages`));
      await set(messageRef, {
        senderId: "system",
        text: `${user.displayName} has accepted the suggested outfit.`,
        timestamp: Date.now(),
      });
  
      console.log("✅ System message sent to chat!");
  
      // Close modal after update
      onHide();
    } catch (error) {
      console.error("❌ Error updating outfit:", error);
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

  if (!suggestion) return null;

  return (
    <Modal show={show} onHide={onHide} centered size="sm">
      <Modal.Header closeButton>
        <Modal.Title>Suggested Changes</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <ImageComponent 
          src={suggestion.imageUrl} 
          alt="Suggested Outfit" 
          fluid 
          className="mb-3"
          style={{ maxHeight: '250px' }}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
        <Button 
          variant="dark" 
          onClick={handleAccept}
          style={{ background: '#000', borderColor: '#000' }}
        >
          Make This My Outfit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SuggestionModal;