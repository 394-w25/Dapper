import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/header/Header";
import BackButton from "../../components/inspiration/BackButton";
import { Container, Button, Form } from "react-bootstrap";
import { FaCamera, FaRedo } from "react-icons/fa";
import Webcam from "react-webcam";
import { useAuthState, uploadInspiration, useDbUpdate } from "../../utilities/firebase";
import "./UploadDetailsPage.css";

const UploadDetailsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const source = params.get("source");
    const [user] = useAuthState();
    const [updateData] = useDbUpdate(`inspiration/${user?.uid}`);

    const [image, setImage] = useState(null);
    const [title, setTitle] = useState("");
    const [tags, setTags] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [error, setError] = useState("");
    const webcamRef = useRef(null);

    // Handle camera capture
    const capturePhoto = useCallback(() => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            setImage(imageSrc);
            setIsCameraOpen(false);
        }
    }, [webcamRef]);

    useEffect(() => {
        if (source === "camera") {
            setIsCameraOpen(true); // Open camera when the source is "camera"
        }
    }, [source]);

    // Save to Firebase
    const handleSave = async () => {
        if (!user) {
            alert("You must be logged in to save inspiration.");
            return;
        }

        if (!title.trim() || (!image && !imageUrl.trim())) {
            alert("Please provide a title and an image.");
            return;
        }

        setLoading(true);

        try {
            let finalImageUrl = imageUrl;

            // If the image was captured via the camera, convert it to a Blob and upload it
            if (image) {
                const blob = await fetch(image).then((res) => res.blob());
                const uniqueFileName = `captured_image_${Date.now()}.jpg`;
                const file = new File([blob], uniqueFileName, { type: blob.type });
                finalImageUrl = await uploadInspiration(file);
            }

            const inspirationId = Date.now().toString();
            const newInspiration = {
                title,
                tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
                imageUrl: finalImageUrl,
                source,
                createdAt: Date.now(),
            };

            // Update inspirations list under the user
            await updateData({
                [`inspirations/${inspirationId}`]: newInspiration
            });

            alert("Inspiration saved successfully!");

            navigate("/inspiration/upload");
        } catch (error) {
            console.error("Error saving inspiration:", error);
            alert("Failed to save inspiration. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const validateImageUrl = (url) => {
        if (!url.trim()) {
            setError("Please enter a valid URL.");
            setImage(null);
            return;
        }

        // Create a new Image object to check if the URL loads correctly
        const img = new Image();
        img.src = url;

        img.onload = () => {
            setError("");
            setImageUrl(url);
            setImage(url);
        };

        img.onerror = () => {
            setError("Failed to load image. Check the URL and try again.");
            setImage(null);
        };
    };

    return (
        <div className="upload-details">
            <BackButton to="/inspiration/upload" />

            <Header title="Upload Details" />
            <Container className="details-container">
                <h5>{source.charAt(0).toUpperCase() + source.slice(1)}</h5>

                {source === "camera" && isCameraOpen ? (
                    <div className="camera-container">
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{ facingMode: "environment" }}
                            className="video-stream"
                        />
                        <Button variant="dark" onClick={capturePhoto} className="capture-button">
                            <FaCamera /> Capture Photo
                        </Button>
                    </div>
                ) : source === "camera-roll" && !image ? (
                    <Form.Group className="mb-3">
                        <Form.Label>Upload Image</Form.Label>
                        <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    setImage(URL.createObjectURL(file));
                                }
                            }}
                        />
                    </Form.Group>
                ) : source === "instagram" || source === "pinterest" || source === "reddit" || source === "browser" && !image ? (
                    // URL Input for Other Sources
                    <Form.Group className="mb-3">
                        <Form.Label>Enter Image URL</Form.Label>
                        <Form.Control
                            type="text"
                            // value={imageUrl}
                            onChange={(e) => {
                                validateImageUrl(e.target.value);
                            }}
                            placeholder="Paste image link"
                        />
                        {error && <p className="error-text">{error}</p>}
                    </Form.Group>
                ) : image ? (
                    // If image is taken, show the preview
                    <div className="image-preview">
                        <img src={image} alt="Captured Preview" />
                        <Button
                            variant="dark"
                            className="capture-button"
                            onClick={() => {
                                setImage(null);
                                setIsCameraOpen(true);
                            }}
                        >
                            <FaRedo /> Capture Again
                        </Button>
                    </div>
                ) : null
                }

                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Title</Form.Label>
                        <Form.Control type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Tags</Form.Label>
                        <Form.Control type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g., Casual, Streetwear" />
                    </Form.Group>

                    <Button variant="dark" className="w-100" onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : "Save Inspiration"}
                    </Button>
                </Form>
            </Container>
        </div>
    );
};

export default UploadDetailsPage;
