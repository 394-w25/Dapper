import React, { useEffect, useState, useRef } from "react";
import Header from "../../components/header/Header";
import { getDatabase, ref, onValue, push, set, get } from "firebase/database";
import { useAuthState } from "../../utilities/firebase";
import { useParams, useNavigate } from "react-router-dom";
import SuggestionModal from "../Feedback/SuggestionModal";
import OutfitPreviewModal from "./OutfitPreviewModal";
import { Send } from "lucide-react"; // Import Send icon
import "./ChatScreen.css";

const ChatScreen = () => {
  const [user] = useAuthState();
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [outfits, setOutfits] = useState([]);
  const [outfitId, setOutfitId] = useState(null);
  const [friendName, setFriendName] = useState("");

  const [isOwner, setIsOwner] = useState(false);
  const [showOutfitModal, setShowOutfitModal] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [suggestionId, setSuggestionId] = useState(null);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const db = getDatabase();

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Store scroll position to maintain scroll when loading older messages
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      setScrollPosition(messagesContainerRef.current.scrollTop);
    }
  };

  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (messagesContainer) {
      messagesContainer.addEventListener('scroll', handleScroll);
      return () => {
        messagesContainer.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  // Restore scroll position after messages update
  useEffect(() => {
    if (messagesContainerRef.current && scrollPosition > 0) {
      messagesContainerRef.current.scrollTop = scrollPosition;
    }
  }, [messages, scrollPosition]);

  useEffect(() => {
    if (!user || !chatId) return;

    const chatRef = ref(db, `chats/${chatId}`);
    onValue(chatRef, async (snapshot) => {
      if (snapshot.exists()) {
        const chatData = snapshot.val();

        // Get messages and sort by timestamp
        const messagesData = chatData.messages ? Object.values(chatData.messages) : [];
        messagesData.sort((a, b) => a.timestamp - b.timestamp);
        setMessages(messagesData);

        // Get friend's name
        if (chatData.users) {
          const friendId = Object.keys(chatData.users).find(id => id !== user.uid);
          if (friendId) {
            const userRef = ref(db, `users/${friendId}`);
            const userSnapshot = await get(userRef);
            if (userSnapshot.exists()) {
              setFriendName(userSnapshot.val().displayName || "Chat");
            }
          }
        }

        if (chatData.outfitIds) {
          const outfitPromises = chatData.outfitIds.map(async (outfitId) => {
            const outfitRef = ref(db, `outfits/${outfitId}`);
            const outfitSnapshot = await get(outfitRef);
            return outfitSnapshot.exists() ? { ...outfitSnapshot.val(), id: outfitId } : null;
          });

          const outfitsData = await Promise.all(outfitPromises);
          const validOutfits = outfitsData.filter(Boolean);
          setOutfits(validOutfits);

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

  // Format timestamp to readable time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="main-chat-container">
      <Header title={friendName || "Chat"} />

      <div className="preview-outfits-btn-container">
        <button className="preview-outfits-btn" onClick={() => setShowOutfitModal(true)}>
          Preview Outfits in this Chat
        </button>
      </div>

      <div className="chat-container">
        <div className="chat-messages" ref={messagesContainerRef}>
          {messages.map((msg, index) => {
            const isSystemMessage = msg.senderId === "system";

            return (
              <div
                key={index}
                className={`message ${msg.senderId === user.uid ? "sent" : "received"} ${isSystemMessage ? "system-message" : ""
                  }`}
              >
                <p>{msg.text}</p>

                {!isSystemMessage && (
                  <div className="message-time">{formatTime(msg.timestamp)}</div>
                )}

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
          <div ref={messagesEndRef} />
        </div>

        {showOutfitModal && (
          <OutfitPreviewModal
            show={showOutfitModal}
            onClose={() => setShowOutfitModal(false)}
            outfits={outfits}
            navigate={navigate}
            user={user}
          />
        )}

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

      <div className="chat-input-container">
        <div className="chat-input">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={sendMessage}>
            <Send className="send-icon" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;