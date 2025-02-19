import React, { useState } from "react";
import { Form, Button, Container, Card, Modal, ListGroup } from "react-bootstrap";
import { getDatabase, ref, push, set, get, child, update } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";
import axios from "axios";



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

  const [imageFile, setImageFile] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);

  const db = getDatabase();
  const storage = getStorage();

  // Handle input changes
  const handleChange = (e) => {
    setItem({ ...item, [e.target.name]: e.target.value });
  };

  const [imageUrlInput, setImageUrlInput] = useState(""); // ✅ Fix for undefined variable

  const handleUrlUpload = async () => {
    if (!imageUrlInput.trim()) return; // Prevent empty input
  
    try {
      const response = await fetch(imageUrlInput);
      if (!response.ok) throw new Error("Invalid Image URL");
  
      const blob = await response.blob();
      const file = new File([blob], "uploaded-image.jpg", { type: blob.type });
  
      const imageRef = storageRef(storage, `clothing/${file.name}`);
      await uploadBytes(imageRef, file);
      const downloadUrl = await getDownloadURL(imageRef);
  
      setItem({ ...item, imageUrl: downloadUrl });
      setImageUrlInput(""); // ✅ Clear input field after successful upload
    } catch (error) {
      console.error("Error uploading image from URL:", error);
      alert("Failed to upload image from URL. Please check the link.");
    }
  };
  
  

  // Handle Image Upload
  const handleImageUpload = async (file) => {
    if (!file) {
      alert("Please select an image file.");
      return;
    }
  
    if (!file.type.startsWith("image/")) {
      alert("Invalid file type. Please select an image.");
      return;
    }
  
    const apiKey = import.meta.env.VITE_REMOVE_BG_API_KEY;
    if (!apiKey) {
      console.error("RemoveBG API Key is missing! Check your .env setup.");
      return;
    }
  
    const formData = new FormData();
    formData.append("image_file", file);
    formData.append("size", "auto");
  
    try {
      // Send image to remove.bg API
      const response = await axios.post("https://api.remove.bg/v1.0/removebg", formData, {
        headers: {
          "X-Api-Key": apiKey,
          "Content-Type": "multipart/form-data",
        },
        responseType: "blob",
      });
  
      // Create a new file from the response
      const removedBgFile = new File([response.data], "removed-bg.png", { type: "image/png" });
  
      // Upload the cleaned image to Firebase
      const imageRef = storageRef(storage, `clothing/${removedBgFile.name}`);
      await uploadBytes(imageRef, removedBgFile);
      const downloadUrl = await getDownloadURL(imageRef);
  
      setItem({ ...item, imageUrl: downloadUrl });
    } catch (error) {
      console.error("Error removing background:", error);
      alert("Failed to remove background. Please try again.");
    }
  };
  
  
  // Save to Firebase
  const [showSuccessModal, setShowSuccessModal] = useState(false);


  const handleSave = async () => {
    if (!item.name || !item.category) {
      alert("Please fill all required fields.");
      return;
    }
  
    const auth = getAuth();
    const user = auth.currentUser; // Get logged-in user
    if (!user) {
      alert("You must be logged in to save items.");
      return;
    }
  
    const userId = user.uid; // Get user's unique ID
  
    const newItemRef = push(ref(db, "clothing")); // Keep all items under "clothing"
    await set(newItemRef, { 
      ...item, 
      createdAt: Date.now(),
      userId: userId // ✅ Associate item with the user
    });

    // Reference to the user's closet array
    const userRef = ref(db, `users/${userId}`);

    try {
        // Retrieve existing closet array
        const snapshot = await get(child(userRef, "closet"));
        let closetArray = snapshot.exists() ? snapshot.val() : [];

        // Ensure it's an array before pushing
        if (!Array.isArray(closetArray)) {
            closetArray = [];
        }

        // Append the new clothing ID
        closetArray.push(newItemRef.key);

        // Update the user's closet
        await update(userRef, { closet: closetArray });

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

    } catch (error) {
        console.error("Error updating closet:", error);
        alert("Failed to update closet. Please try again.");
    }
  };
  


  return (
    <Container className="mt-4">
      <Card className="p-4 shadow-sm">
        <h2 className="text-center">New Item</h2>

        {/* Image Upload Options */}
<Form.Group controlId="imageUpload" className="mb-3">
  {item.imageUrl ? (
    <>
      {/* Display Uploaded Image */}
      <img src={item.imageUrl} alt="Uploaded" className="w-100 rounded mb-2" />
      <Button
        variant="danger"
        className="w-100 mb-2"
        onClick={() => {
          setImageFile(null);
          setItem({ ...item, imageUrl: "" });
        }}
      >
        Remove Image
      </Button>
    </>
  ) : (
    <>
      {/* ✅ Take a Photo (Opens Camera Directly) */}
     

      {/* ✅ Upload from Device Storage */}
      <Form.Group controlId="galleryUpload" className="mb-3">
        <Form.Label>Upload from Gallery</Form.Label>
        <Form.Control
          type="file"
          accept="image/*"
          onClick={(e) => (e.target.value = null)}
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) handleImageUpload(file);
          }}
        />
      </Form.Group>
    </>
  )}
</Form.Group>

{/* ✅ Hide "Upload from URL" when an image is uploaded */}
{!item.imageUrl && (
  <Form.Group className="mb-3">
    <Form.Label>Upload from URL</Form.Label>
    <Form.Control
      type="text"
      placeholder="Paste image link (Instagram, Twitter, etc.)"
      value={imageUrlInput}
      onChange={(e) => setImageUrlInput(e.target.value)}
    />
    <Button
      variant="secondary"
      className="mt-2 w-100"
      onClick={handleUrlUpload}
      disabled={!imageUrlInput.trim()}
    >
      Upload from Link
    </Button>
  </Form.Group>
)}



        {/* Form Fields */}
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Item Name</Form.Label>
            <Form.Control type="text" name="name" value={item.name} onChange={handleChange} />
          </Form.Group>

          {/* Category Selection - Opens Modal */}
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
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

          {/* Save Button */}
          <Button variant="primary" className="w-100 mt-3" onClick={handleSave}>
            Create Item
          </Button>
        </Form>
      </Card>

      {/* Category Selection Modal */}
      <Modal show={showCategoryModal} onHide={() => setShowCategoryModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Select Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
        </Modal.Body>
      </Modal>

      {/* Subcategory Selection Modal */}
      <Modal show={showSubcategoryModal} onHide={() => setShowSubcategoryModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Select Subcategory</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
        </Modal.Body>
      </Modal>

      {/* Success Modal */}
    <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered>
    <Modal.Header closeButton>
        <Modal.Title>Item Added Successfully</Modal.Title>
    </Modal.Header>
    <Modal.Body>
        <p>Your item has been added to the closet successfully!</p>
    </Modal.Body>
    <Modal.Footer>
        <Button variant="primary" onClick={() => setShowSuccessModal(false)}>
        OK
        </Button>
    </Modal.Footer>
    </Modal>

    </Container>
  );
};

export default AddItem;
