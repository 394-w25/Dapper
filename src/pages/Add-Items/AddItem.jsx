import React, { useState } from "react";
import { Form, Button, Container, Card, Modal, ListGroup } from "react-bootstrap";
import { getDatabase, ref, push, set } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

const categories = {
    Tops: ["T-Shirt", "Sweater", "Blouse", "Hoodie", "Tank Top", "Polo Shirt"],
    Bottoms: ["Jeans", "Skirt", "Shorts", "Trousers", "Leggings", "Joggers"],
    Shoes: ["Sneakers", "Boots", "Sandals", "Loafers", "Heels", "Slippers"],
    Accessories: ["Hat", "Scarf", "Watch", "Belt", "Earrings", "Necklace"],
    Outerwear: ["Jacket", "Coat", "Blazer", "Windbreaker"],
    Bags: ["Backpack", "Handbag", "Tote", "Clutch"],
    Dresses: ["Casual Dress", "Evening Dress", "Gown", "Sundress"],
    Others: ["Costumes", "Sleepwear", "Gym Wear", "Swimwear"]
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

    // Handle Image Upload
    const handleImageUpload = async () => {
        if (!imageFile) return;

        const imageRef = storageRef(storage, `clothing/${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        const downloadUrl = await getDownloadURL(imageRef);
        setItem({ ...item, imageUrl: downloadUrl });
    };

    // Save to Firebase
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleSave = async () => {
        if (!item.name || !item.category) {
            alert("Please fill all required fields.");
            return;
        }

        const newItemRef = push(ref(db, "clothing"));
        await set(newItemRef, { ...item, createdAt: Date.now() });

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
    };


    return (
        <Container className="mt-4">
            <Card className="p-4 shadow-sm">
                <h2 className="text-center">New Item</h2>

                {/* Image Upload */}
                <Form.Group controlId="imageUpload" className="mb-3">
                    {item.imageUrl ? (
                        <>
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
                        <Form.Control type="file" onChange={(e) => setImageFile(e.target.files[0])} />
                    )}
                    <Button variant="secondary" className="mt-2 w-100" onClick={handleImageUpload} disabled={!imageFile}>
                        Upload Image
                    </Button>
                </Form.Group>


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