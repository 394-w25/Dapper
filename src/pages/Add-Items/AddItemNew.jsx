import React, { useState, useEffect, useRef } from "react";
import Header from "../../components/header/Header";
import { Form, Button, Container, Card, ToggleButtonGroup, ToggleButton } from "react-bootstrap";
import CustomModal from "../../components/modal/CustomModal";
import { getDatabase, ref, push, set, get } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";
import Webcam from "react-webcam";
import { FaCamera, FaUpload } from "react-icons/fa";
import { BsGlobe } from "react-icons/bs";
import "./AddItem.css";

const categories = {
  Tops: ["T-Shirt", "Sweater", "Blouse", "Hoodie"],
  Bottoms: ["Jeans", "Shorts", "Trousers", "Joggers"],
  Shoes: ["Sneakers", "Boots", "Sandals", "Loafers"],
  Accessories: ["Hat", "Scarf", "Watch", "Belt"],
};

const db = getDatabase();
const storage = getStorage();

const AddItem = () => {
  const [item, setItem] = useState({
    name: "",
    category: "",
    brand: "",
    imageUrl: "",
  });

  const [uploadMode, setUploadMode] = useState("camera"); // Camera | Upload | URL
  const [imageFile, setImageFile] = useState(null);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const webcamRef = useRef(null);

  // Handle input changes
  const handleChange = (e) => {
    setItem({ ...item, [e.target.name]: e.target.value });
  };

  // Camera Capture
  const capturePhoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setItem({ ...item, imageUrl: imageSrc });
    }
  };

  // Handle Image Upload (File Selection)
  const handleImageUpload = async (file) => {
    if (!file) return;
    const imageRef = storageRef(storage, `clothing/${file.name}`);
    await uploadBytes(imageRef, file);
    const downloadUrl = await getDownloadURL(imageRef);
    setItem({ ...item, imageUrl: downloadUrl });
  };

  // Handle URL Upload
  useEffect(() => {
    if (!imageUrlInput.trim()) return;
    const timeoutId = setTimeout(() => {
      setItem({ ...item, imageUrl: imageUrlInput });
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [imageUrlInput]);

  // Save Item to Firebase
  const handleSave = async () => {
    if (!item.name || !item.category) {
      alert("Please fill all required fields.");
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to save items.");
      return;
    }

    const userId = user.uid;
    const newItemRef = push(ref(db, "clothing"));
    await set(newItemRef, { ...item, createdAt: Date.now(), userId });

    alert("Item added successfully!");
    setItem({ name: "", category: "", brand: "", imageUrl: "" });
  };

  return (
    <div className="add-item">
      <Header title="New Item" />
      <Container className="add-item-container">
          <ToggleButtonGroup type="radio" name="upload-options" className="upload-options" value={uploadMode} onChange={setUploadMode}>
            <ToggleButton id="camera-btn" value="camera" className="upload-option">
              <FaCamera size={18} />
            </ToggleButton>
            <ToggleButton id="upload-btn" value="upload" className="upload-option">
              <FaUpload size={18} />
            </ToggleButton>
            <ToggleButton id="url-btn" value="url" className="upload-option">
              <BsGlobe size={18} />
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Image Upload Section */}
          <div className="image-preview">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt="Preview" className="uploaded-image" />
            ) : (
              <div className="photo-placeholder">Photo Area</div>
            )}
          </div>

          <Button variant="outline-dark" className="add-photo-btn">
            <FaCamera className="me-2" /> Add Photo
          </Button>

          {/* Camera Input */}
          {uploadMode === "camera" && !item.imageUrl && (
            <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="video-stream" />
          )}
          {uploadMode === "camera" && <Button onClick={capturePhoto}>Capture Photo</Button>}

          {/* File Upload */}
          {uploadMode === "upload" && (
            <Form.Group className="mb-3">
              <Form.Control type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0])} />
            </Form.Group>
          )}

          {/* URL Input */}
          {uploadMode === "url" && (
            <Form.Group className="mb-3">
              <Form.Control type="text" placeholder="Paste image URL" value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)} />
            </Form.Group>
          )}

          {/* Item Name */}
          <Form.Group className="mb-3">
            <Form.Label>Item Name</Form.Label>
            <Form.Control type="text" name="name" value={item.name} onChange={handleChange} placeholder="Enter item name" />
          </Form.Group>

          {/* Category Selection */}
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Button variant="outline-dark" className="w-100" onClick={() => setShowCategoryModal(true)}>
              {item.category || "Select Category"}
            </Button>
          </Form.Group>

          {/* Brand Input */}
          <Form.Group className="mb-3">
            <Form.Label>Brand</Form.Label>
            <Form.Control type="text" name="brand" value={item.brand} onChange={handleChange} placeholder="Enter brand name" />
          </Form.Group>

          {/* Save Button */}
          <Button variant="dark" className="w-100" onClick={handleSave}>
            Save Item
          </Button>

        {/* Category Selection Modal */}
        <CustomModal show={showCategoryModal} onClose={() => setShowCategoryModal(false)} title="Select Category">
          {Object.keys(categories).map((category) => (
            <Button key={category} variant="outline-dark" className="w-100 my-1" onClick={() => setItem({ ...item, category })}>
              {category}
            </Button>
          ))}
        </CustomModal>
      </Container>
    </div>
  );
};

export default AddItem;
