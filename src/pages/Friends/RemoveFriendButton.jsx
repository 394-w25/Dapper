import React, { useState } from "react";
import { getDatabase, ref, update } from "firebase/database";
import { useAuthState } from "../../utilities/firebase";

const RemoveFriendButton = ({ friendId }) => {
  const [isRemoved, setIsRemoved] = useState(false);
  const [user] = useAuthState();
  const db = getDatabase();

  const handleRemoveFriend = async () => {
    if (!user) return;

    const userFriendsRef = ref(db, `users/${user.uid}/friends`);
    await update(userFriendsRef, { [friendId]: null });

    setIsRemoved(true);
  };

  return (
    <button onClick={handleRemoveFriend} disabled={isRemoved}>
      {isRemoved ? "Removed ❌" : "Remove Friend"}
    </button>
  );
};

export default RemoveFriendButton;
