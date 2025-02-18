import React from 'react';
import { useNavigate } from 'react-router-dom';  // ✅ Import useNavigate
import './ClosetPage.css';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';

const ClosetPage = () => {
  const navigate = useNavigate(); // ✅ Hook for navigation

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  const goToAddItem = () => {
    navigate('/add-item'); // ✅ Navigate to AddItem page
  };
  const navigate = useNavigate();

  return (
    <div className="closet">
      <h1>Closet</h1>
      <p>Closet stuff here</p>

      <Button variant="primary" onClick={goToAddItem}>
        ➕ Add Item
      </Button>

      <Button variant="danger" onClick={handleSignOut}>
        Sign Out
      <Button variant="primary" onClick={() => navigate('/mycloset')}>
        My Closet
      </Button>
    </div>
  );
};

export default ClosetPage;
