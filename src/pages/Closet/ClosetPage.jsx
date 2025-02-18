import React from 'react';
import './ClosetPage.css';
import Button from 'react-bootstrap/Button';
import { signOut } from '../../utilities/firebase';

const ClosetPage = () => {
  
  const handleSignOut = () => {
      signOut();
      navigate('/');
    };

  return (
    <div className="closet">
      <h1>Closet</h1>
      <p>Closet stuff here</p>

      <Button variant="danger" onClick={handleSignOut}>
        Sign Out
      </Button>
    </div>
  );
};

export default ClosetPage;