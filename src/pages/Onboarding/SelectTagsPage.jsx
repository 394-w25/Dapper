import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Container } from "react-bootstrap";
import "./SelectTagsPage.css"; // Ensure this CSS file matches the styles
import { useDbUpdate, useAuthState } from "../../utilities/firebase";
import { useDbData } from "../../utilities/firebase";

const styles = ["Athleisure", "Bright Colors", "Distressed", "Earthy Tones", 
    "Fitted", "Heavyweight", "High Contrast", "Layered", "Monochrome", "Neutral Colors", 
    "Oversized", "Performance Fabric", "Retro Silhouettes", "Slim Fit", "Soft Fabric", 
    "Soft Fabric (suede)", "Structured", "Tapered", "Textured Fabric"];

const SelectTagsPage = () => {
    const [user] = useAuthState();
    const navigate = useNavigate();
    const [selectedStyles, setSelectedStyles] = useState([]);
    const [updateData] = useDbUpdate(user ? `users/${user.uid}` : null);
    const [error, setError] = useState(null);
    const [dbData] = useDbData(user ? `users/${user.uid}` : null);

    const toggleSelection = (style) => {
        // Check if the user is trying to select more than 3 styles
        if (selectedStyles.length === 3 && !selectedStyles.includes(style)) {
            setError("You can only select up to 3 styles.");
            return;
        }

        // Ensure the error is cleared when the number of selected styles is less than 3
        if (selectedStyles.length <= 3) {
            setError(null);
        }
    
        // Update the selected styles (toggle the style)
        setSelectedStyles((prev) => {
            // Create the new updated styles array, removing duplicates from dbData
            const updatedStyles = prev.includes(style)
                ? prev.filter((s) => s !== style) // Remove style if already selected
                : [...prev, style]; // Add style if not selected
    
            // If user data is available, fetch the current styles from the database
            if (user && dbData && dbData.styles) {
                const existingStyles = dbData.styles;
    
                // Remove duplicates by combining updatedStyles and existingStyles
                const allStyles = [...new Set([...existingStyles, ...updatedStyles])];
    
                // Update the user data in the database with the new styles (merged, no duplicates)
                updateData({ styles: allStyles });
            }
    
            // Return the updated styles if no dbData available
            return updatedStyles;
        });
    };
    

    return (
        <div className="select-tags-page">
            <Container className="select-tags-container">
                <h2>What styles inspire you the most?</h2>
                <div className="tag-grid">
                    {styles.map((style, index) => (
                        <div
                            key={index}
                            className={`tag-card ${selectedStyles.includes(style) ? "selected" : ""}`}
                            onClick={() => toggleSelection(style)}
                        >
                            <div className="tag-box">
                                {style}
                            </div>
                        </div>
                    ))}
                </div>
                <p className="text-muted small mt-3">
                    Don't worry! These can be adjusted later in your inspiration folder.
                </p>
                { error ? <p className="text-danger">{error}</p> : null } 
                <div className="buttons-group">
                    <button className="btn btn-dark w-100 mb-2" onClick={() => { updateData({ newUser: false }); navigate("/"); }}>Continue</button>

                    <button className="btn btn-link text-muted" onClick={() => { updateData({ newUser: false }); navigate("/"); }}>Skip for now</button></div>
            </Container>
        </div>
    );
};

export default SelectTagsPage;
