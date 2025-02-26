import React, { useState } from "react";
import { getDatabase, ref, update } from "firebase/database";
import { useAuthState } from "../../utilities/firebase";

const AddFriendButton = ({ friendId }) => {
  const [isAdded, setIsAdded] = useState(false);
  const [user] = useAuthState();
  const db = getDatabase();

  const handleAddFriend = async () => {
    if (!user) return;

    const userFriendsRef = ref(db, `users/${user.uid}/friends`);
    await update(userFriendsRef, { [friendId]: true });

    setIsAdded(true);
  };

  return (
    <button onClick={handleAddFriend} disabled={isAdded}>
      {isAdded ? "Added ✅" : "Add Friend"}
    </button>
  );
};

export default AddFriendButton;
