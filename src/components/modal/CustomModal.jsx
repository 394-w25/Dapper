import React from "react";
import "./CustomModal.css";

const CustomModal = ({ show, onClose, title, children }) => {
  if (!show) return null;

  return (
    <div className="custom-modal-overlay" onClick={onClose}>
      <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
        <div className="custom-modal-header">
          <h5>{title}</h5>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="custom-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CustomModal;