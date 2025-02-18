import React from 'react';
import './ProfilePage.css';
import { signOut } from '../../utilities/firebase';

const ProfilePage = () => {

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <div className="profile">
      <h1>Profile</h1>
      <p>Profile stuff here</p>

      <Button variant="danger" onClick={handleSignOut}>
        Sign Out
      </Button>
    </div>
  );
};

export default ProfilePage;