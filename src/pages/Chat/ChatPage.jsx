import React, { useEffect, useState } from "react";
import { getDatabase, ref, get } from "firebase/database";
import { useAuthState } from "../../utilities/firebase";
import { useNavigate } from "react-router-dom";
import "./ChatPage.css"; 

const ChatPage = () => {
  const [user] = useAuthState();
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();
  const db = getDatabase();

  useEffect(() => {
    if (!user) return;

    const fetchChats = async () => {
      const chatRef = ref(db, "chats");
      const snapshot = await get(chatRef);

      if (snapshot.exists()) {
        const chatData = snapshot.val();
        const userChats = [];

        // Process each chat
        for (const [chatId, chat] of Object.entries(chatData)) {
          // Only include chats where the current user is a participant
          if (chat.users && chat.users[user.uid]) {
            // Find the other user's ID (the friend)
            const friendId = Object.keys(chat.users).find((uid) => uid !== user.uid);
            
            if (friendId) {
              // Get friend's user data
              const friendRef = ref(db, `users/${friendId}`);
              const friendSnapshot = await get(friendRef);
              
              // Get the latest message
              const messages = chat.messages ? Object.values(chat.messages) : [];
              const latestMessage = messages.length > 0 
                ? messages.sort((a, b) => b.timestamp - a.timestamp)[0] 
                : null;

              // Get the friend's display name
              let friendName = "Unknown User";
              if (friendSnapshot.exists()) {
                const friendData = friendSnapshot.val();
                friendName = friendData.displayName || friendData.username || "Unknown User";
              }

              userChats.push({
                id: chatId,
                friendId: friendId,
                friendName: friendName,
                latestMessage: latestMessage?.text || "No messages yet",
                timestamp: latestMessage?.timestamp || 0
              });
            }
          }
        }

        // Sort by newest message first
        userChats.sort((a, b) => b.timestamp - a.timestamp);
        setChats(userChats);
      }
    };

    fetchChats();
  }, [user, db]);

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name || name === "Unknown User") return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="chat-list-container">
      <h2 className="chat-list-title">Chats</h2>
      <div className="chat-list">
        {chats.length > 0 ? (
          chats.map((chat) => (
            <div key={chat.id} className="chat-card" onClick={() => navigate(`/chat/${chat.id}`)}>
              <div className="chat-avatar">
                {getInitials(chat.friendName)}
              </div>
              <div className="chat-info">
                <p className="chat-friend-name">{chat.friendName}</p>
                <p className="chat-latest-message">{chat.latestMessage}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="no-chats">
            <p>No chats yet. Start a conversation by requesting feedback!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;