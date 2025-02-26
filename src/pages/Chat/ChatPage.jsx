import React, { useEffect, useState } from "react";
import { getDatabase, ref, get } from "firebase/database";
import { useAuthState } from "../../utilities/firebase";
import { useNavigate } from "react-router-dom";

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
          .filter(([chatId, chat]) => chat.users && chat.users[user.uid]) // ✅ Check if chat.users exists
          .map(([chatId, chat]) => ({
            id: chatId,
            outfitId: chat.outfitId,
            latestMessage: Object.values(chat.messages || {}).pop()?.text || "No messages yet",
          }));


        setChats(userChats);
      }
    };

    fetchChats();
  }, [user, db]);

  return (
    <div>
      <h2>Chat List</h2>
      <ul>
        {chats.map((chat) => (
          <li key={chat.id} onClick={() => navigate(`/chat/${chat.id}`)}>
            Outfit ID: {chat.outfitId} - {chat.latestMessage}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatPage;
