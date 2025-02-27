import React, { useEffect, useState } from "react";
import { getDatabase, ref, get, update, push, set } from "firebase/database";
import { Modal, Button, Image, ListGroup } from "react-bootstrap";


const SuggestionModal = ({ show, onHide, suggestionId, outfitId, chatId, user }) => {
  const [suggestion, setSuggestion] = useState(null);
  const db = getDatabase();

  useEffect(() => {
    if (!suggestionId) return;

    // ✅ Fetch the specific suggestion
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
  
    const targetOutfitId = suggestion.outfitId; // ✅ Use the outfitId from suggestion
  
    try {
     
      // ✅ Ensure clothingIDs exist before updating
      if (!Array.isArray(suggestion.clothingIDs) || suggestion.clothingIDs.length === 0) {
        console.warn("⚠️ suggestion.clothingIDs is empty or not an array!");
        return;
      }
  
      // ✅ Update the outfit in Firebase with new clothingIDs
      await update(ref(db, `outfits/${targetOutfitId}`), {
        clothingIDs: suggestion.clothingIDs, // ✅ Properly replacing clothing IDs
        imageUrl: suggestion.imageUrl, 
      });
  
      console.log("✅ Outfit updated successfully!");
  
      // ✅ Verify update by fetching the updated outfit
      const updatedSnapshot = await get(ref(db, `outfits/${targetOutfitId}`));
      if (updatedSnapshot.exists()) {
        const updatedOutfit = updatedSnapshot.val();
        console.log("🔍 Updated Outfit Data:", updatedOutfit);
  
        if (JSON.stringify(updatedOutfit.clothingIDs) !== JSON.stringify(suggestion.clothingIDs)) {
          console.warn("⚠️ Firebase update mismatch! The clothing IDs did not change.");
        }
      } else {
        console.warn("⚠️ Failed to fetch updated outfit data!");
      }
  
      // ✅ Send system message in chat
      console.log("💬 Sending system message to chat...");
      const messageRef = push(ref(db, `chats/${chatId}/messages`));
      await set(messageRef, {
        senderId: "system",
        text: `${user.displayName} has accepted the suggested outfit.`,
        timestamp: Date.now(),
      });
  
      console.log("✅ System message sent to chat!");
  
      // ✅ Close modal
      onHide();
    } catch (error) {
      console.error("❌ Error updating outfit:", error);
    }
  };
  
  
  

  if (!suggestion) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Suggested Outfit Changes</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Image src={suggestion.imageUrl} alt="Suggested Outfit" fluid />
        <h5 className="mt-3">New Clothing Items</h5>
        <ListGroup>
          {suggestion.clothingIDs.map((id, index) => (
            <ListGroup.Item key={index}>Clothing ID: {id}</ListGroup.Item>
          ))}
        </ListGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
        <Button variant="success" onClick={handleAccept}>Make This My Outfit</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SuggestionModal;
