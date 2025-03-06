import React from "react";
import { X } from "lucide-react"; // Import X icon from Lucide
import "./OutfitPreviewModal.css";

const OutfitPreviewModal = ({ show, onClose, outfits, navigate, user }) => {
  if (!show) return null;

  return (
    <div className="outfit-modal-overlay">
      <div className="outfit-modal">
        {/* ✅ Close Button at the Top Right */}
        <button className="outfit-modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <h2 className="outfit-modal-title">Outfits in this Chat</h2>

        <div className="outfit-list">
          {outfits.map((outfit, index) => (
            <div key={index} className="outfit-item">
              <img src={outfit.imageUrl || "default-image.png"} alt={outfit.name || "Outfit"} />
              
              <div className="outfit-content">
                {/* Using the h3 element with our strong CSS class */}
                <h3 className="outfit-name">{outfit.name || "Unnamed Outfit"}</h3>

                {/* ✅ Hide "Suggest Changes" if the user is the outfit owner */}
                {outfit.createdBy !== user.uid && (
                  <button className="outfit-suggest-btn" onClick={() => navigate(`/outfit-feedback/${outfit.id}`)}>
                    Suggest Changes
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OutfitPreviewModal;