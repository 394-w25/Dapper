import React, { useState, useEffect } from "react";
import { getDatabase, ref, get } from "firebase/database";
import { useAuthState } from "../../utilities/firebase";
import AddFriendButton from "./AddFriendButton";

const UserSearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [user] = useAuthState();
  const db = getDatabase();

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const fetchUsers = async () => {
      const usersRef = ref(db, "users");
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const filteredUsers = Object.entries(usersData)
        .filter(([id, data]) => 
          (data.displayName && data.displayName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (data.email && data.email.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .map(([id, data]) => ({ id, ...data }));
      

        setSearchResults(filteredUsers);
      }
    };

    fetchUsers();
  }, [searchQuery, db]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search by username or email..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <ul>
        {searchResults.map((userData) => (
          <li key={userData.id}>
            {userData.username} ({userData.email})
            <AddFriendButton friendId={userData.id} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserSearchBar;
