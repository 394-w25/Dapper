import React from 'react';
import './ClosetPage.css';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';

const ClosetPage = () => {
  const navigate = useNavigate();

  return (
    <div className="closet">
      <h1>Closet</h1>
      <p>Closet stuff here</p>

      <Button variant="primary" onClick={() => navigate('/mycloset')}>
        My Closet
      </Button>
    </div>
  );
};

export default ClosetPage;