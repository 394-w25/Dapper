import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container } from "react-bootstrap";
import { FaPlus, FaEye, FaFolder } from "react-icons/fa";
import Header from "../../components/header/Header";
import InspirationFooter from "../../components/inspiration/InspirationFooter";
import "./InspirationPage.css";

const folders = ["Around Town", "Date Night", "Formal", "Work"];

const InspirationPage = () => {
    const navigate = useNavigate();

    return (
        <div className="inspiration-page">

            <Header title="Outfit Inspiration" />

            <Container className="inspiration-container">

                {/* New Folder & View Buttons */}
                <div className="inspiration-actions">
                    <Button variant="dark" className="action-button">
                        <FaPlus /> New Folder
                    </Button>
                    <Button variant="light" className="action-button">
                        <FaEye /> View
                    </Button>
                </div>

                {/* Folder List */}
                <div className="folder-list">
                    {folders.map((folder, index) => (
                        <div 
                            key={index} 
                            className="folder-item"
                            onClick={() => navigate(`/inspiration/folder?name=${encodeURIComponent(folder)}`)}
                        >
                            <FaFolder className="folder-icon" />
                            <span>{folder}</span>
                        </div>
                    ))}
                </div>
            </Container>

            {/* Reusable Footer */}
            <InspirationFooter activePage="" />
        </div>
    );
};

export default InspirationPage;
