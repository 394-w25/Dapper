import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue, push, set } from "firebase/database";
import { useAuthState } from "../../utilities/firebase";
import { useParams, useNavigate } from "react-router-dom";
import SuggestionModal from "../Feedback/SuggestionModal";  // ✅ Import SuggestionModal
import "./ChatScreen.css";

const ChatScreen = () => {
  const [user] = useAuthState();
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [outfit, setOutfit] = useState(null);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [suggestionId, setSuggestionId] = useState(null);
  const [outfitId, setOutfitId] = useState(null);
  const [isOwner, setIsOwner] = useState(false);  // ✅ Track if user is the outfit owner
  const db = getDatabase();

  useEffect(() => {
    if (!user || !chatId) return;

    const chatRef = ref(db, `chats/${chatId}`);
    onValue(chatRef, (snapshot) => {
      if (snapshot.exists()) {
        const chatData = snapshot.val();
        setMessages(Object.values(chatData.messages || {}));

        // Fetch outfit details using the outfitId stored in chatData
        if (chatData.outfitId) {
          setOutfitId(chatData.outfitId);  // ✅ Store outfitId globally
          const outfitRef = ref(db, `outfits/${chatData.outfitId}`);
          onValue(outfitRef, async (outfitSnapshot) => {
            if (outfitSnapshot.exists()) {
              const outfitData = outfitSnapshot.val();
              console.log("Updated outfit detected:", outfitData);
              setOutfit(outfitData);

              // ✅ Check if the current user is the owner
              setIsOwner(outfitData.createdBy === user.uid);
            }
          });
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

  const handleSuggestChanges = () => {
    if (outfitId) {
      navigate(`/outfit-feedback/${outfitId}`);
    } else {
      console.error("Outfit ID is missing!");
    }
  };

  return (
    <div className="chat-container">
      <h2>Chat</h2>

      {outfit && (
        <div className="outfit-preview">
          <h3>Outfit Preview</h3>
          <img src={outfit.imageUrl || "default-image.png"} alt={outfit.name || "Outfit"} />
          
          {/* ✅ Only show "Suggest Changes" if the current user is NOT the owner */}
          {!isOwner && (
            <button onClick={handleSuggestChanges}>Suggest Changes</button>
          )}
        </div>
      )}

<div className="chat-messages">
        {messages.map((msg, index) => {
          const isSystemMessage = msg.senderId === "system"; // ✅ Check if it's a system message
          
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
                    setSuggestionId(msg.suggestionId);  // ✅ Set Suggestion ID
                    setShowSuggestionModal(true);       // ✅ Show Modal
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

      {/* ✅ Include Suggestion Modal */}
      <SuggestionModal
        show={showSuggestionModal}
        onHide={() => setShowSuggestionModal(false)}
        suggestionId={suggestionId}
        outfitId={outfitId}  
        chatId={chatId}      
        user={user}          
      />
    </div>
  );
};

export default ChatScreen;
