import React from 'react';
import './SmartphoneFrame.css';

const SmartphoneFrame = ({ children }) => {
  return (
    <div className="smartphone-container">
      <div className="smartphone">
        <div className="smartphone-notch"></div>
        <div className="smartphone-content">{children}</div>
      </div>
    </div>
  );
};

export default SmartphoneFrame;
