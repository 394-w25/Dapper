import React, { useState, useEffect } from "react";
import { getDatabase, ref, get, update } from "firebase/database";
import { useAuthState, useDbData } from "../../utilities/firebase";
import Header from "../../components/header/Header";
import FriendList from "./FriendList";
import UserSearchBar from "./UserSearchBar";
import "./FriendsPage.css";

const FriendsPage = () => {
  const [user] = useAuthState();
  const [userData] = useDbData(user ? `users/${user.uid}` : null);
  const [activeTab, setActiveTab] = useState("friends");
  const [searchResults, setSearchResults] = useState([]);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showManageFriends, setShowManageFriends] = useState(false);
  const [friends, setFriends] = useState([]);
  const [chats, setChats] = useState([]);
  const db = getDatabase();

  // Fetch friends data
  const fetchFriends = async () => {
    if (!user) return;

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
          email: usersData[id]?.email || "No email",
          photoURL: usersData[id]?.photoURL || null,
        }));

        setFriends(friendList);
      }
    } else {
      setFriends([]);
    }
  };

  // Fetch chats data
  const fetchChats = async () => {
    if (!user) return;

    const chatRef = ref(db, "chats");
    const snapshot = await get(chatRef);

    if (snapshot.exists()) {
      const chatData = snapshot.val();
      const userChats = [];

      for (const [chatId, chat] of Object.entries(chatData)) {
        if (chat.users && chat.users[user.uid]) {
          const friendId = Object.keys(chat.users).find((uid) => uid !== user.uid);
          
          if (friendId) {
            const friendRef = ref(db, `users/${friendId}`);
            const friendSnapshot = await get(friendRef);
            
            const messages = chat.messages ? Object.values(chat.messages) : [];
            const latestMessage = messages.length > 0 
              ? messages.sort((a, b) => b.timestamp - a.timestamp)[0] 
              : null;

            let friendName = "Unknown User";
            let photoURL = null;
            if (friendSnapshot.exists()) {
              const friendData = friendSnapshot.val();
              friendName = friendData.displayName || friendData.username || "Unknown User";
              photoURL = friendData.photoURL || null;
            }

            userChats.push({
              id: chatId,
              friendId: friendId,
              friendName: friendName,
              photoURL: photoURL,
              latestMessage: latestMessage?.text || "No messages yet",
              timestamp: latestMessage?.timestamp || 0
            });
          }
        }
      }

      userChats.sort((a, b) => b.timestamp - a.timestamp);
      setChats(userChats);
    }
  };

  useEffect(() => {
    fetchFriends();
    fetchChats();
  }, [user, db]);

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name || name === "Unknown User") return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Remove friend
  const handleRemoveFriend = async (friendId) => {
    if (!user) return;

    try {
      const userFriendsRef = ref(db, `users/${user.uid}/friends`);
      await update(userFriendsRef, { [friendId]: null });
      fetchFriends(); // Refresh the friends list
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  return (
    <div className="friends-page">
      <Header title="My Friends" />

      {/* Tabs */}
      <div className="friends-tabs">
        <div 
          className={`friends-tab ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          My Friends
        </div>
        <div 
          className={`friends-tab ${activeTab === 'chats' ? 'active' : ''}`}
          onClick={() => setActiveTab('chats')}
        >
          My Chats
        </div>
      </div>

      {/* Friends List Tab */}
      {activeTab === 'friends' && (
        <div className="friends-content">
          {showAddFriend ? (
            <div className="add-friend-container">
              <h3>Add Friend</h3>
              <UserSearchBar 
                searchResults={searchResults} 
                setSearchResults={setSearchResults} 
                fetchFriends={fetchFriends}
              />
              <button 
                className="back-button"
                onClick={() => setShowAddFriend(false)}
              >
                Back
              </button>
            </div>
          ) : showManageFriends ? (
            <div className="manage-friends-container">
              <h3>Manage Friends</h3>
              <div className="friends-list manage-mode">
                {friends.length > 0 ? (
                  friends.map((friend) => (
                    <div key={friend.id} className="friend-item">
                      <div className="friend-info">
                        <div className="friend-avatar">
                          {friend.photoURL ? (
                            <img src={friend.photoURL} alt={friend.displayName} />
                          ) : (
                            <span>{getInitials(friend.displayName)}</span>
                          )}
                        </div>
                        <span className="friend-name">{friend.displayName}</span>
                      </div>
                      <button 
                        className="remove-friend-btn"
                        onClick={() => handleRemoveFriend(friend.id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="no-friends-message">No friends yet.</p>
                )}
              </div>
              <button 
                className="back-button"
                onClick={() => setShowManageFriends(false)}
              >
                Back
              </button>
            </div>
          ) : (
            <>
              <div className="friends-actions">
                <button 
                  className="friends-action-btn"
                  onClick={() => setShowAddFriend(true)}
                >
                  Add Friend
                </button>
                <button 
                  className="friends-action-btn"
                  onClick={() => setShowManageFriends(true)}
                >
                  Manage Friends
                </button>
              </div>
              <div className="friends-list">
                {friends.length > 0 ? (
                  friends.map((friend) => (
                    <div key={friend.id} className="friend-item">
                      <div className="friend-avatar">
                        {friend.photoURL ? (
                          <img src={friend.photoURL} alt={friend.displayName} />
                        ) : (
                          <span>{getInitials(friend.displayName)}</span>
                        )}
                      </div>
                      <span className="friend-name">{friend.displayName}</span>
                    </div>
                  ))
                ) : (
                  <p className="no-friends-message">No friends yet. Add friends to start chatting!</p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Chats Tab */}
      {activeTab === 'chats' && (
        <div className="chats-content">
          <div className="chat-list">
            {chats.length > 0 ? (
              chats.map((chat) => (
                <div key={chat.id} className="chat-item" onClick={() => window.location.href = `/chat/${chat.id}`}>
                  <div className="chat-avatar">
                    {chat.photoURL ? (
                      <img src={chat.photoURL} alt={chat.friendName} />
                    ) : (
                      <span>{getInitials(chat.friendName)}</span>
                    )}
                  </div>
                  <div className="chat-info">
                    <span className="chat-friend-name">{chat.friendName}</span>
                    <span className="chat-latest-message">{chat.latestMessage}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-chats-message">No chats yet. Start a conversation by requesting feedback!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendsPage;