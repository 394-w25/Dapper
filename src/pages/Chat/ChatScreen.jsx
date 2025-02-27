import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue, push, set, get } from "firebase/database";
import { useAuthState } from "../../utilities/firebase";
import { useParams, useNavigate } from "react-router-dom";
import SuggestionModal from "../Feedback/SuggestionModal";
import OutfitPreviewModal from "./OutfitPreviewModal";
import "./ChatScreen.css";

const ChatScreen = () => {
  const [user] = useAuthState();
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [outfits, setOutfits] = useState([]);
  const [outfitId, setOutfitId] = useState(null);

  const [isOwner, setIsOwner] = useState(false);
  const [showOutfitModal, setShowOutfitModal] = useState(false);
  
  // ✅ Define showSuggestionModal state to fix the error
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [suggestionId, setSuggestionId] = useState(null);

  const db = getDatabase();



  useEffect(() => {
    if (!user || !chatId) return;
  
    const chatRef = ref(db, `chats/${chatId}`);
    onValue(chatRef, async (snapshot) => {
      if (snapshot.exists()) {
        const chatData = snapshot.val();
        setMessages(Object.values(chatData.messages || {}));
  
        if (chatData.outfitIds) {
          const outfitPromises = chatData.outfitIds.map(async (outfitId) => {
            const outfitRef = ref(db, `outfits/${outfitId}`);
            const outfitSnapshot = await get(outfitRef);
            return outfitSnapshot.exists() ? { ...outfitSnapshot.val(), id: outfitId } : null;
          });
  
          const outfitsData = await Promise.all(outfitPromises);
          const validOutfits = outfitsData.filter(Boolean);
          setOutfits(validOutfits);
  
          // ✅ Set outfitId when outfits are fetched
          if (validOutfits.length > 0) {
            setOutfitId(validOutfits[0].id);
          }
  
          setIsOwner(validOutfits.some(outfit => outfit.createdBy === user.uid));
        }
      }
    });
  }, [user, chatId, db]);
  

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const newMessageRef = push(ref(db, `chats/${chatId}/messages`));

    await set(newMessageRef, {
      senderId: user.uid,
      text: newMessage,
      timestamp: Date.now(),
    });

    setNewMessage("");
  };


  return (
    <div className="chat-container">
      <h2>Chat</h2>

      <button className="preview-outfits-btn" onClick={() => setShowOutfitModal(true)}>
        Preview Outfits in this Chat
      </button>

      <div className="chat-messages">
        {messages.map((msg, index) => {
          const isSystemMessage = msg.senderId === "system";

          return (
            <div
              key={index}
              className={`message ${msg.senderId === user.uid ? "sent" : "received"} ${
                isSystemMessage ? "system-message" : ""
              }`}
            >
              <p>{msg.text}</p>

              {/* ✅ Show "Review Suggested Changes" button only if the user is the outfit owner */}
              {isSystemMessage && msg.text.includes("suggested changes") && isOwner && (
                <button
                  onClick={() => {
                    setSuggestionId(msg.suggestionId);
                    setShowSuggestionModal(true);
                  }}
                >
                  Review Suggested Changes
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>

      {/* ✅ Include Outfit Preview Modal */}
      {showOutfitModal && (
        <OutfitPreviewModal
        show={showOutfitModal}
        onClose={() => setShowOutfitModal(false)}
        outfits={outfits}
        navigate={navigate}
        user={user} // ✅ Pass user to hide "Suggest Changes" button for the owner
      />
      
      )}

      {/* ✅ Include Suggestion Modal */}
      {showSuggestionModal && (
        <SuggestionModal 
        show={showSuggestionModal}
        onHide={() => setShowSuggestionModal(false)}
        suggestionId={suggestionId}
        outfitId={outfitId}  
        chatId={chatId}      
        user={user}          
      />
      
      )}
    </div>
  );
};

export default ChatScreen;
