import React, { useEffect, useState } from "react";
import { getDatabase, ref, get } from "firebase/database";
import { useAuthState } from "../../utilities/firebase";
import "./FriendsList.css"; // Import the new styles

const FriendsList = () => {
  const [friends, setFriends] = useState([]);
  const [user] = useAuthState();
  const db = getDatabase();

  useEffect(() => {
    if (!user) return;

    const fetchFriends = async () => {
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
            username: usersData[id]?.username || "Unknown",
            email: usersData[id]?.email || "No email",
            profilePic: usersData[id]?.profilePic || null, // Use profile picture if available
          }));

          setFriends(friendList);
        }
      }
    };

    fetchFriends();
  }, [user, db]);

  return (
    <div className="friends-container">
      <h3>Friends List</h3>
      <ul className="friends-list">
        {friends.map((friend) => (
          <li key={friend.id} className="friend-card">
            <div className="friend-avatar">
              {friend.profilePic ? (
                <img src={friend.profilePic} alt={friend.username} />
              ) : (
                <span>{friend.username.charAt(0)}</span>
              )}
            </div>
            <div className="friend-info">
              <p className="friend-name">{friend.username}</p>
              <p className="friend-email">{friend.email}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FriendsList;
