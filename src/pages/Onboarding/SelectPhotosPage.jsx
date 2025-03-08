import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Container } from "react-bootstrap";
import "./SelectPhotosPage.css"; // Ensure this CSS file matches the styles
import { useDbUpdate, useAuthState } from "../../utilities/firebase";
import { useDbData } from "../../utilities/firebase";


const SelectPhotosPage = () => {
    const navigate = useNavigate();
    const [user] = useAuthState();
    const [selectedStyles, setSelectedStyles] = useState([]);
    const [error, setError] = useState(null);
    const [updateData] = useDbUpdate(user ? `users/${user.uid}` : null);
    const [recommendationsData] = useDbData("recommendations");

    const toggleSelection = (style) => {
        // Check if the user is trying to select more than 3 styles
        if (selectedStyles.length === 3 && !selectedStyles.includes(style)) {
            setError("You can only select up to 3 styles.");
            return;
        }

        // Update the selected styles (toggle the style)
        setSelectedStyles((prev) => {
            // Create the new updated styles array
            const updatedStyles = prev.includes(style)
                ? prev.filter((s) => s !== style) // Remove style if already selected
                : [...prev, style]; // Add style if not selected

            // Ensure the error is cleared when the number of selected styles is less than 3
            if (updatedStyles.length < 3) {
                setError(null);
            }

            // Update the user data in the database with the new styles
            if (user) {
                updateData({ styles: updatedStyles });
            }

            // Return the updated styles array
            return updatedStyles;
        });
    };

    return (
        <div className="select-photos-page">
            <Container className="select-photos-container">
                <h2>What styles inspire you the most?</h2>
                <div className="style-grid">
                    {recommendationsData &&
                        Object.keys(recommendationsData).map((key) => {
                            const outfit = recommendationsData[key];
                            return (
                                <div
                                    key={key}
                                    className={`style-card ${selectedStyles.includes(outfit.outfitName) ? "selected" : ""}`}
                                    onClick={() => toggleSelection(outfit.outfitName)}
                                >
                                    <img
                                        src={outfit.outfitPicUrl}
                                        alt={outfit.outfitName}
                                        className="style-image"
                                    />
                                </div>
                            );
                        })}
                </div>
                {selectedStyles.length == 3 ? <p className="text-danger">{error}</p> : null}
                <div className="buttons-group">
                    <button className="btn btn-dark w-100 mb-2" onClick={() => navigate("/onboarding/selecttags")}>Continue</button>

                    <button className="btn btn-link text-muted" onClick={() => navigate("/onboarding/selecttags")}>Skip for now</button></div>
            </Container>
        </div>
    );
};

export default SelectPhotosPage;
