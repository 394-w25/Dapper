import React, { useState, useEffect, useRef, useCallback } from "react";
import Header from "../../components/header/Header";
import { Form, Button, Container, ListGroup } from "react-bootstrap";
import CustomModal from "../../components/modal/CustomModal";
import { getDatabase, ref, push, set, get } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";
import Webcam from "react-webcam";
import { FaCamera, FaUpload, FaRedo } from "react-icons/fa";
import { BsGlobe } from "react-icons/bs";
import { removeBackground } from "../../utilities/removeBgApi";
import "./AddItemNew.css";
import "../Inspiration/UploadDetailsPage.css";

const categories = {
  Tops: [
    "T-Shirt", "Sweater", "Blouse", "Hoodie", "Tank Top", "Polo Shirt",
    "Long Sleeve Shirt", "Crop Top", "Cardigan", "Vest"
  ],
  Bottoms: [
    "Jeans", "Skirt", "Shorts", "Trousers", "Leggings", "Joggers",
    "Chinos", "Cargo Pants", "Dress Pants"
  ],
  Shoes: [
    "Sneakers", "Boots", "Sandals", "Loafers", "Heels", "Slippers",
    "Formal Shoes", "Running Shoes", "Moccasins", "Derby Shoes"
  ],
  Accessories: [
    "Hat", "Scarf", "Watch", "Belt", "Earrings", "Necklace",
    "Bracelet", "Gloves", "Socks", "Sunglasses", "Cufflinks", "Tie", "Bow Tie"
  ],
  Outerwear: [
    "Jacket", "Coat", "Blazer", "Windbreaker", "Trench Coat",
    "Denim Jacket", "Puffer Jacket", "Bomber Jacket", "Raincoat"
  ],
  Bags: [
    "Backpack", "Handbag", "Tote", "Clutch", "Messenger Bag",
    "Crossbody Bag", "Briefcase", "Duffle Bag", "Fanny Pack"
  ],
  Formalwear: [
    "Suit", "Tuxedo", "Dress Shirt", "Blazer", "Tie", "Bow Tie",
    "Formal Trousers", "Cufflinks"
  ],
  Dresses: [
    "Casual Dress", "Evening Dress", "Gown", "Sundress",
    "Cocktail Dress", "Maxi Dress", "Mini Dress", "Bodycon Dress"
  ],
  Activewear: [
    "Gym Wear", "Tracksuit", "Yoga Pants", "Compression Shirt",
    "Running Shorts", "Sport Bra", "Tank Top"
  ],
  Others: [
    "Costumes", "Sleepwear", "Swimwear", "Kimono", "Poncho",
    "Lounge Wear", "Thermal Wear", "Robe"
  ]
};

const db = getDatabase();
const storage = getStorage();

const AddItem = () => {
  const [item, setItem] = useState({
    name: "",
    category: "",
    subcategory: "",
    brand: "",
    size: "",
    color: "",
    imageUrl: "",
  });
  const [uploadMode, setUploadMode] = useState("camera"); // Camera | Upload | URL
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [error, setError] = useState("");
  const webcamRef = useRef(null);

  // Handle camera capture
  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      fetch(imageSrc)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], `captured-${Date.now()}.jpg`, { type: blob.type });
          handleImageUpload(file); // Process the image
        })
        .catch((error) => console.error("Error capturing image:", error));
    }
  }, [webcamRef]);


  useEffect(() => {
    if (uploadMode === "camera") {
      setIsCameraOpen(true);
    }
  }, [uploadMode]);

  // Handle input changes
  const handleChange = (e) => {
    setItem({ ...item, [e.target.name]: e.target.value });
  };

  // Save Item to Firebase
  const handleSave = async () => {
    if (!item.name || !item.category || !item.imageUrl) {
      alert("Please fill all required fields.");
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser; // Get logged-in user
    if (!user) {
      alert("You must be logged in to save items.");
      return;
    }

    const userId = user.uid;

    // Save item to "clothing" collection
    const newItemRef = push(ref(db, "clothing"));
    await set(newItemRef, {
      ...item,
      createdAt: Date.now(),
      userId: userId
    });

    const clothingId = newItemRef.key;

    const userClothingRef = ref(db, `users/${userId}/closet`);

    try {
      const snapshot = await get(userClothingRef);
      if (snapshot.exists()) {
        const existingClothing = snapshot.val();
        if (!existingClothing.includes(clothingId)) {
          await set(userClothingRef, [...existingClothing, clothingId]); // Append new clothing ID
        }
      } else {
        await set(userClothingRef, [clothingId]);
      }
    } catch (error) {
      console.error("Error updating user clothing list:", error);
    }

    // Show success modal
    setShowSuccessModal(true);

    // Reset form
    setItem({
      name: "",
      category: "",
      subcategory: "",
      brand: "",
      size: "",
      color: "",
      imageUrl: "",
    });

    setImage(null);
    setImageUrl("");
  };

  // handleImageUpload function to use RemoveBG API
  const handleImageUpload = async (file) => {
    if (!file) return;

    setIsProcessing(true);

    try {
      const processedImageUrl = await removeBackground(file); // Remove background
      if (processedImageUrl) {
        validateProcessedImage(processedImageUrl); // Ensure it's valid before display
      }
    } catch (error) {
      console.error("Error processing image:", error);
    } finally {
      setIsCameraOpen(false);
      setIsProcessing(false);
    }
  };


  // URL Image Processing to Remove Background
  const validateImageUrl = async (url) => {
    if (!url.trim()) {
      setError("Please enter a valid URL.");
      setImage(null);
      return;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Invalid Image URL");

      const blob = await response.blob();
      const file = new File([blob], `uploaded-${Date.now()}.jpg`, { type: blob.type });

      setIsProcessing(true);
      const processedImageUrl = await removeBackground(file); // Remove background

      if (processedImageUrl) {
        validateProcessedImage(processedImageUrl); // Ensure it's valid before display
      } else {
        setError("Failed to process image.");
      }
    } catch (error) {
      console.error("❌ Error processing image:", error);
      setError("Failed to load image. Check the URL and try again.");
      setImage(null);
    } finally {
      setIsProcessing(false);
    }
  };


  // Validate Processed Image
  const validateProcessedImage = (url) => {
    const img = new Image();
    img.src = url;

    img.onload = () => {
      setError("");
      setImage(url);
      setImageUrl(url);
      setItem({ ...item, imageUrl: url });
    };

    img.onerror = () => {
      setError("Failed to load processed image.");
      setImage(null);
    };
  };



  return (
    <div className="add-item-new">
      <Header title="Add Clothing" />
      <Container className="add-item-container">

        {/* Upload Mode Selection */}
        <div className="upload-actions-add-item">
          <Button
            variant={uploadMode === "camera" ? "dark" : "outline-dark"}
            className={`upload-button-add-item ${uploadMode === "camera" ? "active" : ""}`}
            onClick={() => {
              setImage(null);
              setUploadMode("camera")
            }}
          >
            <FaCamera /> Camera
          </Button>
          <Button
            variant={uploadMode === "upload" ? "dark" : "outline-dark"}
            className={`upload-button-add-item ${uploadMode === "upload" ? "active" : ""}`}
            onClick={() => {
              setImage(null);
              setUploadMode("upload")
            }}
          >
            <FaUpload /> Upload
          </Button>
          <Button
            variant={uploadMode === "url" ? "dark" : "outline-dark"}
            className={`upload-button-add-item ${uploadMode === "url" ? "active" : ""}`}
            onClick={() => {
              setImage(null);
              setUploadMode("url")
            }}
          >
            <BsGlobe /> URL
          </Button>
        </div>

        {/* Show Loading if Processing */}
        {isProcessing ? (
          <div className="loading-container">
            <p>Processing image...</p>
          </div>
        ) : uploadMode === "camera" && isCameraOpen ? (
          <div className="camera-container">
            <p className="take-photo-text">Take photo of your item<span className="text-danger">*</span></p>
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
        ) : uploadMode === "upload" && !image ? (
          <Form.Group className="mb-3">
            <Form.Label>Upload Image<span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  handleImageUpload(file); // Process the image
                }
              }}
            />
          </Form.Group>
        ) : uploadMode === "url" && !image ? (
          // URL Input for Other Sources
          <Form.Group className="mb-3">
            <Form.Label>Enter Image URL<span className="text-danger">*</span></Form.Label>
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

        {/* Form Fields */}
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Item Name <span className="text-danger">*</span></Form.Label>
            <Form.Control type="text" name="name" value={item.name} onChange={handleChange} />
          </Form.Group>

          {/* Category Selection - Opens Modal */}
          <Form.Group className="mb-3">
            <Form.Label>Category <span className="text-danger">*</span></Form.Label>
            <Button variant="outline-dark" className="w-100" onClick={() => setShowCategoryModal(true)}>
              {item.category || "Select Category"}
            </Button>
          </Form.Group>

          {/* Subcategory Selection - Opens Modal */}
          {item.category && (
            <Form.Group className="mb-3">
              <Form.Label>Subcategory</Form.Label>
              <Button variant="outline-dark" className="w-100" onClick={() => setShowSubcategoryModal(true)}>
                {item.subcategory || "Select Subcategory"}
              </Button>
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Brand</Form.Label>
            <Form.Control type="text" name="brand" value={item.brand} onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Size</Form.Label>
            <Form.Control type="text" name="size" value={item.size} onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Color</Form.Label>
            <Form.Control type="text" name="color" value={item.color} onChange={handleChange} />
          </Form.Group>
        </Form>

        {/* Save Item Button */}
        <Button variant="dark" className="w-100" onClick={handleSave}>
          Save Item
        </Button>

        {/* Category Selection Modal */}
        <CustomModal show={showCategoryModal} onClose={() => setShowCategoryModal(false)} title="Select Category">
          <ListGroup>
            {Object.keys(categories).map((category) => (
              <ListGroup.Item
                key={category}
                action
                onClick={() => {
                  setItem({ ...item, category, subcategory: "" });
                  setShowCategoryModal(false);
                }}
              >
                {category}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </CustomModal>

        {/* Subcategory Selection Modal */}
        <CustomModal show={showSubcategoryModal} onClose={() => setShowSubcategoryModal(false)} title="Select Subcategory">
          <ListGroup>
            {categories[item.category]?.map((subcategory) => (
              <ListGroup.Item
                key={subcategory}
                action
                onClick={() => {
                  setItem({ ...item, subcategory });
                  setShowSubcategoryModal(false);
                }}
              >
                {subcategory}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </CustomModal>

        {/* Success Modal */}
        <CustomModal show={showSuccessModal} onClose={() => setShowSuccessModal(false)} title="Item Added Successfully">
          <div className="success-modal-content">
            <p>Your item has been added to the closet successfully!</p>
            <Button className="ok-button" onClick={() => setShowSuccessModal(false)}>OK</Button>
          </div>
        </CustomModal>

      </Container>
    </div>
  );
};

export default AddItem;