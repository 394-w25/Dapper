import React, { useEffect, useState } from "react";
import { getDatabase, ref, get, update, push, set } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { Modal, Button, Spinner } from "react-bootstrap";
import ImageComponent from "react-bootstrap/Image";
import "./SuggestionModal.css";

const SuggestionModal = ({ show, onHide, suggestionId, outfitId, chatId, user }) => {
  const [suggestion, setSuggestion] = useState(null);
  const [originalOutfit, setOriginalOutfit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const db = getDatabase();

  useEffect(() => {
    if (!suggestionId) return;
    setLoading(true);
    setError(null);

    // Fetch the specific suggestion and original outfit
    const fetchData = async () => {
      try {
        // Fetch suggestion
        const suggestionRef = ref(db, `outfits_suggestions/${suggestionId}`);
        const suggestionSnapshot = await get(suggestionRef);
        
        if (suggestionSnapshot.exists()) {
          const suggestionData = suggestionSnapshot.val();
          setSuggestion(suggestionData);
          
          // Now fetch the original outfit
          if (suggestionData.outfitId) {
            const outfitRef = ref(db, `outfits/${suggestionData.outfitId}`);
            const outfitSnapshot = await get(outfitRef);
            
            if (outfitSnapshot.exists()) {
              setOriginalOutfit(outfitSnapshot.val());
            } else {
              setError("Original outfit not found");
              console.warn("Original outfit not found");
            }
          }
        } else {
          setError("Suggestion not found");
          console.warn("Suggestion not found");
        }
      } catch (err) {
        setError("Error loading data: " + err.message);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  if (!suggestion && !originalOutfit && !loading) return null;

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered 
      size="sm" 
      className="suggestion-modal"
      backdropClassName="suggestion-modal-backdrop"
    >
      <Modal.Header closeButton>
        <Modal.Title>Suggested Changes</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        {loading ? (
          <div className="loading-container">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p>Loading outfit comparison...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
          </div>
        ) : (
          <div className="outfit-comparison">
            <div className="outfit-before">
              <h4>Before</h4>
              <ImageComponent 
                src={originalOutfit.imageUrl} 
                alt="Original Outfit" 
                fluid 
                className="mb-3 outfit-image"
              />
            </div>
            <div className="outfit-after">
              <h4>After</h4>
              <ImageComponent 
                src={suggestion.imageUrl} 
                alt="Suggested Outfit" 
                fluid 
                className="mb-3 outfit-image"
              />
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
        {!loading && !error && (
          <Button 
            variant="dark" 
            onClick={handleAccept}
            style={{ background: '#000', borderColor: '#000' }}
          >
            Make This My Outfit
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default SuggestionModal;