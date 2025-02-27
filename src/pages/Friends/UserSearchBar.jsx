import React, { useState, useEffect } from "react";
import { getDatabase, ref, get, update } from "firebase/database";
import { useAuthState } from "../../utilities/firebase";
import { FaSearch } from "react-icons/fa";
import "./UserSearchBar.css";

const UserSearchBar = ({ searchResults, setSearchResults, fetchFriends }) =>  {
 
  const [searchQuery, setSearchQuery] = useState("");
  // const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // Track the clicked user
  const [successMessage, setSuccessMessage] = useState(""); // Success message state
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
            data.displayName && data.displayName.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map(([id, data]) => ({ id, displayName: data.displayName }));

        setSearchResults(filteredUsers);
      }
    };

    fetchUsers();
  }, [searchQuery, db]);

  const handleUserClick = (userData) => {
    setSelectedUser(userData);
  };

  const handleAddFriend = async () => {
    if (!selectedUser || !user) return;

    const friendUid = selectedUser.id;
    if (!friendUid) {
      console.error("Friend UID is missing!");
      return;
    }

    try {
      const userFriendsRef = ref(db, `users/${user.uid}/friends`);
      await update(userFriendsRef, { [friendUid]: true });

      setSuccessMessage(`${selectedUser.displayName} has been added as a friend!`);
      setSelectedUser(null); 

      if (fetchFriends) { // ✅ Only call if it exists
        fetchFriends();
      }

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error adding friend:", error);
      alert("Something went wrong! Try again.");
    }
  };


  return (
    <div className="search-container">
      <div className="search-box">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Success Message */}
      {successMessage && <p className="success-message">{successMessage}</p>}

      {searchResults.length > 0 && (
        <ul className="search-results">
          {searchResults.map((userData) => (
            <li key={userData.id} className="search-item" onClick={() => handleUserClick(userData)}>
              <span className="search-username">{userData.displayName}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Confirmation Modal */}
      {selectedUser && (
        <div className="modal-overlay">
          <div className="friend-modal-content">
            <h3 className="modal-text">Add {selectedUser.displayName} as a friend?</h3>
            <button className="confirm-btn" onClick={handleAddFriend}>Confirm</button>
            <button className="cancel-btn" onClick={() => setSelectedUser(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSearchBar;
