import React, { useEffect, useState } from "react";
import { getDatabase, ref, get } from "firebase/database";
import { useAuthState } from "../../utilities/firebase";

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
          }));

          setFriends(friendList);
        }
      }
    };

    fetchFriends();
  }, [user, db]);

  return (
    <div>
      <h3>Friends List</h3>
      <ul>
        {friends.map((friend) => (
          <li key={friend.id}>
            {friend.username} ({friend.email})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FriendsList;
