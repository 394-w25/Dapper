import React, { useEffect, useState } from "react";
import { getDatabase, ref, get, push, set, update } from "firebase/database";
import { useAuthState } from "../../utilities/firebase";
import "./FeedbackRequestModal.css";

const FeedbackRequestModal = ({ outfitId, onClose }) => {
  const [user] = useAuthState();
  const db = getDatabase();

  const [tab, setTab] = useState("friends"); // "friends", "addFriend", or "invite"
  const [friendsList, setFriendsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // For "Add Friend" flow
  const [searchQuery, setSearchQuery] = useState("");
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
  
  

  // 🔹 Search for a user to add as friend
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const usersRef = ref(db, "users");
      const snapshot = await get(usersRef);
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const results = Object.entries(usersData)
          .filter(([uid, data]) => {
            // Exclude current user
            if (uid === user.uid) return false;
            const usernameMatch = data.displayName?.toLowerCase().includes(searchQuery.toLowerCase());
            const emailMatch = data.email?.toLowerCase().includes(searchQuery.toLowerCase());
            return usernameMatch || emailMatch;
          })
          .map(([uid, data]) => ({ uid, ...data }));

        setSearchResults(results);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  // 🔹 Add friend
  const handleAddFriend = async (friendUid) => {
    if (!user) return;
    try {
      // Update the user's friend list
      const userFriendsRef = ref(db, `users/${user.uid}/friends`);
      await update(userFriendsRef, { [friendUid]: true });
      alert("Friend added!");
      fetchFriends(); // Refresh the friends list
      setTab("friends"); // Switch back to friend list
    } catch (error) {
      console.error("Error adding friend:", error);
    }
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
                    <input
                      type="radio"
                      name="friend"
                      value={friend.id}
                      onChange={() => setSelectedFriendId(friend.id)}
                    />
                    <span>{friend.displayName}</span>
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
          <>
            <input
              type="text"
              placeholder="Search by username or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>

            <ul className="search-results">
              {searchResults.map((result) => (
                <li key={result.uid}>
                  {result.username || "No Username"} ({result.email})
                  <button onClick={() => handleAddFriend(result.uid)}>Add</button>
                </li>
              ))}
            </ul>
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
