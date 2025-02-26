import React from "react";
import { Button } from "react-bootstrap";
import { FaSearch, FaUpload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./InspirationFooter.css";

const InspirationFooter = ({ activePage }) => {
    const navigate = useNavigate();

    return (
        <div className="bottom-nav">
            <Button
                variant={activePage === "find" ? "dark" : "outline-dark"}
                className="nav-button"
                onClick={() => navigate("/inspiration/find")}
            >
                <FaSearch size={20} />
                Find Inspiration
            </Button>
            <Button
                variant={activePage === "upload" ? "dark" : "outline-dark"}
                className="nav-button"
                onClick={() => navigate("/inspiration/upload")}
            >
                <FaUpload size={20} />
                Upload Inspiration
            </Button>
        </div>
    );
};

export default InspirationFooter;
