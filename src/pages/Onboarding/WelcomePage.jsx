import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./WelcomePage.css";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Button, Form } from "react-bootstrap";
import { useAuthState, uploadInspiration, useDbUpdate } from "../../utilities/firebase";
import { Modal } from "react-bootstrap";

const WelcomePage = () => {
    const navigate = useNavigate();
    const [user] = useAuthState();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const source = params.get("source");
    const [updateData] = useDbUpdate(`inspiration/${user?.uid}`);

    const [image, setImage] = useState(null);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [title, setTitle] = useState("");
    const [tags, setTags] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);

    const handleUploadOption = (source) => {
        navigate(`/inspiration/upload/details?source=${source}`);
    };

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

            navigate("/onboarding");
        } catch (error) {
            console.error("Error saving inspiration:", error);
            alert("Failed to save inspiration. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="welcome">
            <Container className="welcome-container">
                <h3 className="fw-bold">Welcome to Dapper!</h3>
                <p className="text-muted">
                    Begin uploading your saved style inspiration in your camera roll or by
                    connecting your Pinterest account!
                </p>

                <button className="btn btn-dark w-100 mb-2" onClick={() => setShowUploadModal(true)}>
                    <i className="bi bi-image me-2"></i> Upload from Camera Roll
                </button>

                <div className="or-divider">
                    <span className="text-muted">or</span>
                </div>

                <button className="btn btn-outline-secondary w-100 mb-3 mt-2">
                    <i className="bi bi-pinterest me-2"></i> Connect Pinterest Account
                </button>

                <p className="text-muted small">
                    Uploaded inspiration can improve our ability to suggest outfits and styles you like
                </p>
                <div className="buttons-group">
                    <button className="btn btn-dark w-100 mb-2" onClick={() => navigate("/onboarding/selectphotos")}>Continue</button>

                    <button className="btn btn-link text-muted" onClick={() => navigate("/onboarding/selectphotos")}>Skip for now</button></div>
            </Container >

            <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)} dialogClassName="customize-modal">
                <Modal.Header closeButton>
                    <Modal.Title className="customize-modal-title">Upload Inspiration</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* Form inside Modal.Body */}
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

                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Tags</Form.Label>
                            <Form.Control
                                type="text"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="e.g., Casual, Streetwear"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="dark" className="w-100" onClick={() => {handleSave(); setShowUploadModal(false); }} disabled={loading}>
                        {loading ? "Saving..." : "Save Inspiration"}
                    </Button>
                </Modal.Footer>
            </Modal>

        </div >
    );
};

export default WelcomePage;
