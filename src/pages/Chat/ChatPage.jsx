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
        const userChats = Object.entries(chatData)
          .filter(([chatId, chat]) => chat.users && chat.users[user.uid])
          .map(([chatId, chat]) => {
            const friendId = Object.keys(chat.users).find((uid) => uid !== user.uid);
            const messages = Object.values(chat.messages || {});
            const latestMessage = messages.length > 0 ? messages[messages.length - 1] : null;

            return {
              id: chatId,
              friendName: chat.users[friendId]?.displayName || "Unknown User",
              latestMessage: latestMessage?.text || "No messages yet",
              timestamp: latestMessage?.timestamp || 0, // Use timestamp for sorting
              outfitCount: chat.outfits ? Object.keys(chat.outfits).length : 0,
            };
          })
          .sort((a, b) => b.timestamp - a.timestamp); // ✅ Sort by newest first

        setChats(userChats);
      }
    };

    fetchChats();
  }, [user, db]);

  return (
    <div className="chat-list-container">
      <h2 className="chat-list-title">Chats</h2>
      <div className="chat-list">
        {chats.map((chat) => (
          <div key={chat.id} className="chat-card" onClick={() => navigate(`/chat/${chat.id}`)}>
            <div className="chat-info">
              <p className="chat-friend-name">{chat.friendName}</p>
              <p className="chat-latest-message">{chat.latestMessage}</p>
              {chat.outfitCount > 0 && <p className="chat-outfit-count">{chat.outfitCount} outfits under discussion</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatPage;
