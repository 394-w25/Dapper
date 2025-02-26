import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";
import "./BackButton.css";

const BackButton = ({ to }) => {
    const navigate = useNavigate();

    return (
        <div className="back-button-container">
            <Button variant="light" className="back-button" onClick={() => navigate(to)}>
                <FaArrowLeft size={19} />
            </Button>
        </div>
    );
};

export default BackButton;
