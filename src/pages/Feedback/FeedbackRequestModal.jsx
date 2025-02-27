import React, { useEffect, useState } from "react";
import { getDatabase, ref, get, push, set, update } from "firebase/database";
import { useAuthState } from "../../utilities/firebase";
import UserSearchBar from "../Friends/UserSearchBar";

import "./FeedbackRequestModal.css";

const FeedbackRequestModal = ({ outfitId, onClose }) => {
  const [user] = useAuthState();
  const db = getDatabase();

  const [tab, setTab] = useState("friends"); // "friends", "addFriend", or "invite"
  const [friendsList, setFriendsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchResults, setSearchResults] = useState([]);




  // For selected friend
  const [selectedFriendId, setSelectedFriendId] = useState(null);

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
          }));
  
          setFriendsList(friendList);
        }
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
    setLoading(false);
  };
  
  
  // 🔹 Send feedback request to selected friend
  const sendFeedbackRequest = async () => {
    if (!selectedFriendId) {
      alert("Please select a friend to request feedback.");
      return;
    }
  
    try {
      const chatRef = ref(db, "chats");
      const snapshot = await get(chatRef);
  
      let existingChatId = null;
      
      // Check if a chat already exists between these users for this outfit
      if (snapshot.exists()) {
        const chats = snapshot.val();
        Object.entries(chats).forEach(([chatId, chatData]) => {
          if (
            chatData.outfitId === outfitId &&
            chatData.users[user.uid] &&
            chatData.users[selectedFriendId]
          ) {
            existingChatId = chatId;
          }
        });
      }
  
      // If chat does not exist, create a new one
      if (!existingChatId) {
        const newChatRef = push(ref(db, "chats"));
        const newChatId = newChatRef.key;
  
        await set(newChatRef, {
          outfitId: outfitId,
          users: {
            [user.uid]: true,
            [selectedFriendId]: true
          },
          messages: {
            [push(ref(db, `chats/${newChatId}/messages`)).key]: {
              senderId: user.uid,
              text: "Check out this outfit!",
              timestamp: Date.now(),
            }
          }
        });
  
        existingChatId = newChatId;
      }
  
      alert("Feedback request sent! Your friend can now chat with you.");
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error sending feedback request:", error);
    }
  };
  

  return (
    <div className="feedback-modal-overlay">
      <div className="feedback-modal-content">
        <h2>Request Feedback</h2>
        <div className="tabs">
          <button className={tab === "friends" ? "active" : ""} onClick={() => setTab("friends")}>
            My Friends
          </button>
          <button className={tab === "addFriend" ? "active" : ""} onClick={() => setTab("addFriend")}>
            Add Friend
          </button>
          <button className={tab === "invite" ? "active" : ""} onClick={() => setTab("invite")}>
            Invite Link
          </button>
        </div>

        {/* TAB: FRIENDS LIST */}
        {tab === "friends" && (
  <>
    {loading ? (
      <p>Loading friends...</p>
    ) : friendsList.length === 0 ? (
      <p>No friends yet. Try adding one or share an invite link!</p>
    ) : (
      <div className="friends-list">
        {friendsList.map((friend) => (
          <label key={friend.id} className="friend-item">
            <div className="friend-avatar">
              {friend.profilePic ? (
                <img src={friend.profilePic} alt={friend.displayName} />
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


        {/* TAB: ADD FRIEND (✅ Uses UserSearchBar) */}
        {tab === "addFriend" && (
          <>
           <UserSearchBar searchResults={searchResults} setSearchResults={setSearchResults} fetchFriends={fetchFriends} />

           
          </>
        )}

        {/* TAB: INVITE LINK */}
        {tab === "invite" && (
          <>
            <p>Share this link with someone who doesn't have the app:</p>
            <p className="invite-link">
              <a href={inviteLink} target="_blank" rel="noreferrer">
                {inviteLink}
              </a>
            </p>
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
