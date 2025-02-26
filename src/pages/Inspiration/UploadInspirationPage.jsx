import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/header/Header";
import InspirationFooter from "../../components/inspiration/InspirationFooter";
import BackButton from "../../components/inspiration/BackButton";
import { Button, Container } from "react-bootstrap";
import { FaCamera, FaImages } from "react-icons/fa";
import { BsInstagram, BsPinterest, BsReddit, BsGlobe } from "react-icons/bs";
import { FaUpload } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import "./UploadInspirationPage.css";

const UploadInspirationPage = () => {
    const navigate = useNavigate();

    const handleUploadOption = (source) => {
        navigate(`/inspiration/upload/details?source=${source}`);
    };

    return (
        <div className="upload-inspiration">
            <BackButton to="/inspiration" />

            <Header title="Upload Inspiration" />
            <Container className="upload-container">
                <div className="upload-grid">
                    <Button variant="light" className="upload-option" onClick={() => handleUploadOption("camera")}>
                        <FaCamera size={20} />
                        <span>Camera</span>
                    </Button>
                    <Button variant="light" className="upload-option" onClick={() => handleUploadOption("camera-roll")}>
                        <FaImages size={20} />
                        <span>Camera Roll</span>
                    </Button>
                    <Button variant="light" className="upload-option" onClick={() => handleUploadOption("instagram")}>
                        <BsInstagram size={20} />
                        <span>Instagram</span>
                    </Button>
                    <Button variant="light" className="upload-option" onClick={() => handleUploadOption("pinterest")}>
                        <BsPinterest size={20} />
                        <span>Pinterest</span>
                    </Button>
                    <Button variant="light" className="upload-option" onClick={() => handleUploadOption("reddit")}>
                        <BsReddit size={20} />
                        <span>Reddit</span>
                    </Button>
                    <Button variant="light" className="upload-option" onClick={() => handleUploadOption("browser")}>
                        <BsGlobe size={20} />
                        <span>Browser</span>
                    </Button>
                </div>
            </Container>

            <InspirationFooter activePage="upload" />
        </div>
    );
};

export default UploadInspirationPage;
