import React, { useEffect, useState } from "react";
import { getDatabase, ref, get, push, set, update } from "firebase/database";
import { useAuthState } from "../../utilities/firebase";
import { useNavigate } from "react-router-dom";
import UserSearchBar from "../Friends/UserSearchBar";
import { FiUsers, FiUserPlus, FiLink, FiX } from "react-icons/fi";

import "./FeedbackRequestModal.css";

const FeedbackRequestModal = ({ outfitId, onClose }) => {
  const [user] = useAuthState();
  const db = getDatabase();
  const navigate = useNavigate();

  const [tab, setTab] = useState("friends");
  const [friendsList, setFriendsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // For invite link
  const inviteLink = `https://dapperoutfitgenerator.web.app/invite?outfitId=${outfitId || "error"}`;

  useEffect(() => {
    if (!user) return;
    fetchFriends();
  }, [user]);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const friendsRef = ref(db, `users/${user.uid}/friends`);
      const snapshot = await get(friendsRef);
      if (snapshot.exists()) {
        const friendIds = Object.keys(snapshot.val());
  
        const usersRef = ref(db, "users");
        const usersSnapshot = await get(usersRef);
  
        if (usersSnapshot.exists()) {
          const usersData = usersSnapshot.val();
          const friendList = friendIds.map((id) => ({
            id,
            displayName: usersData[id]?.displayName || "Unknown",
            photoURL: usersData[id]?.photoURL || null,
          }));
  
          setFriendsList(friendList);
        }
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
    setLoading(false);
  };
  
  // Send feedback request and show success message + redirect to chat
  const sendFeedbackRequest = async () => {
    if (!selectedFriendId) {
      alert("Please select a friend to request feedback.");
      return;
    }

    try {
      const chatRef = ref(db, "chats");
      const snapshot = await get(chatRef);
      let existingChatId = null;
      let existingOutfitIds = [];

      if (snapshot.exists()) {
        const chats = snapshot.val();
        Object.entries(chats).forEach(([chatId, chatData]) => {
          if (chatData.users[user.uid] && chatData.users[selectedFriendId]) {
            existingChatId = chatId;
            existingOutfitIds = chatData.outfitIds || [];
          }
        });
      }

      if (!existingChatId) {
        // Create a new chat if one doesn't exist
        const newChatRef = push(ref(db, "chats"));
        const newChatId = newChatRef.key;
        await set(newChatRef, {
          outfitIds: [outfitId],
          users: {
            [user.uid]: true,
            [selectedFriendId]: true,
          },
          messages: {
            [push(ref(db, `chats/${newChatId}/messages`)).key]: {
              senderId: user.uid,
              text: "Check out this outfit!",
              timestamp: Date.now(),
            },
          },
        });
        existingChatId = newChatId;
      } else {
        // If chat exists, add outfitId only if it's not already in the list
        if (!existingOutfitIds.includes(outfitId)) {
          const updatedOutfitIds = [...existingOutfitIds, outfitId];
          await update(ref(db, `chats/${existingChatId}`), { outfitIds: updatedOutfitIds });

          // Send a system message to notify the friend
          const newMessageRef = push(ref(db, `chats/${existingChatId}/messages`));
          await set(newMessageRef, {
            senderId: "system",
            text: "A new outfit was added to this chat for feedback!",
            timestamp: Date.now(),
          });
        }
      }

      setSuccessMessage("Feedback request sent! Redirecting to chat...");

      setTimeout(() => {
        navigate(`/chat/${existingChatId}`);
        onClose();
      }, 2000);

    } catch (error) {
      console.error("Error sending feedback request:", error);
    }
  };

  return (
    <div className="feedback-modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="feedback-modal-content">
        <h2>Request Feedback</h2>
        
        <div className="tabs">
          <button 
            className={tab === "friends" ? "active" : ""} 
            onClick={() => setTab("friends")}
          >
            <FiUsers style={{ marginRight: '6px' }} /> My Friends
          </button>
          <button 
            className={tab === "addFriend" ? "active" : ""} 
            onClick={() => setTab("addFriend")}
          >
            <FiUserPlus style={{ marginRight: '6px' }} /> Add Friend
          </button>
          <button 
            className={tab === "invite" ? "active" : ""} 
            onClick={() => setTab("invite")}
          >
            <FiLink style={{ marginRight: '6px' }} /> Share Link
          </button>
        </div>

        {/* Success message (if present) */}
        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        {/* TAB: FRIENDS LIST */}
        {tab === "friends" && (
          <>
            {loading ? (
              <div className="loading-spinner">Loading friends...</div>
            ) : friendsList.length === 0 ? (
              <p>No friends yet. Try adding one or share an invite link!</p>
            ) : (
              <div className="friends-list">
                {friendsList.map((friend) => (
                  <label key={friend.id} className="friend-item">
                    <div className="friend-avatar">
                      {friend.photoURL ? (
                        <img src={friend.photoURL} alt={friend.displayName} />
                      ) : (
                        <span>{friend.displayName.charAt(0)}</span>
                      )}
                    </div>
                    <span className="friend-name">{friend.displayName}</span>
                    <input
                      type="radio"
                      name="friend"
                      value={friend.id}
                      onChange={() => setSelectedFriendId(friend.id)}
                    />
                  </label>
                ))}
              </div>
            )}
            {friendsList.length > 0 && (
              <button className="send-btn" onClick={sendFeedbackRequest}>
                Send Feedback Request
              </button>
            )}
          </>
        )}

        {/* TAB: ADD FRIEND */}
        {tab === "addFriend" && (
          <div className="user-search-container">
            <UserSearchBar 
              searchResults={searchResults} 
              setSearchResults={setSearchResults} 
              fetchFriends={fetchFriends} 
            />
          </div>
        )}

        {/* TAB: INVITE LINK */}
        {tab === "invite" && (
          <>
            <p>Share this link with someone who doesn't have the app:</p>
            <div className="invite-link">
              <a href={inviteLink} target="_blank" rel="noreferrer">
                {inviteLink}
              </a>
            </div>
            <button className="send-btn" onClick={() => {
              navigator.clipboard.writeText(inviteLink);
              alert("Link copied to clipboard!");
            }}>
              Copy Link
            </button>
          </>
        )}

        <button className="close-btn" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default FeedbackRequestModal;