import React, { useState, useEffect } from "react";
import Header from "../../components/header/Header";
import CustomModal from "../../components/modal/CustomModal";
import { useDbData, useAuthState } from "../../utilities/firebase";
import { database } from "../../utilities/firebase";
import { ref, get, remove, update } from "firebase/database";
import { Container, ButtonGroup, Button, Row, Col, Card, Nav, Modal } from "react-bootstrap";
import { FaTshirt } from 'react-icons/fa';
import { FaBagShopping } from 'react-icons/fa6';
import { TbHanger } from "react-icons/tb";
import { PiPantsFill } from "react-icons/pi";
import { GiRunningShoe } from "react-icons/gi";
import { FiTrash2 } from 'react-icons/fi';
import "./MyClosetPage.css";

const categories = [
    { name: 'All', icon: <TbHanger /> },
    { name: 'Tops', icon: <FaTshirt /> },
    { name: 'Bottoms', icon: <PiPantsFill /> },
    { name: 'Shoes', icon: <GiRunningShoe /> },
    { name: 'Accessories', icon: <FaBagShopping /> }
];

const MyClosetPage = () => {
    const [user] = useAuthState();
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [clothingItems, setClothingItems] = useState([]);

    const [userData] = useDbData(user ? `users/${user.uid}` : null);

    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    useEffect(() => {
        fetchClothingDetails();
    }, [userData]);

    const fetchClothingDetails = async () => {
        if (!userData || !userData.closet) return;

        const clothingDetails = [];

        for (const clothingId of userData.closet) {
            const clothingRef = ref(database, `clothing/${clothingId}`);
            const snapshot = await get(clothingRef);

            if (snapshot.exists()) {
                clothingDetails.push({ id: clothingId, ...snapshot.val() });
            }
        }

        setClothingItems(clothingDetails);
    };

    const filteredClothing = clothingItems.filter(
        (item) => selectedCategory === "All" || item.category === selectedCategory
    );

    const handleShowModal = (item) => {
        setSelectedItem(item);
        setShowModal(true);
    }

    const handleDeleteClick = (item) => {
        setItemToDelete(item);
        setShowDeleteModal(true);
        setShowModal(false); // Close the item details modal
    }

    const confirmDelete = async () => {
        if (!itemToDelete || !user) return;

        try {
            // 1. Remove the clothing item from the database
            await remove(ref(database, `clothing/${itemToDelete.id}`));

            // 2. Remove the clothing ID from the user's closet
            const updatedCloset = userData.closet.filter(id => id !== itemToDelete.id);
            await update(ref(database, `users/${user.uid}`), {
                closet: updatedCloset
            });

            // 3. Check if the item is used in any outfits and handle accordingly
            const outfitsRef = ref(database, 'outfits');
            const outfitsSnapshot = await get(outfitsRef);
            
            if (outfitsSnapshot.exists()) {
                const outfits = outfitsSnapshot.val();
                for (const outfitId in outfits) {
                    const outfit = outfits[outfitId];
                    if (outfit.clothingIDs.includes(itemToDelete.id)) {
                        // Remove the clothing ID from the outfit
                        const updatedClothingIDs = outfit.clothingIDs.filter(id => id !== itemToDelete.id);
                        await update(ref(database, `outfits/${outfitId}`), {
                            clothingIDs: updatedClothingIDs
                        });
                    }
                }
            }

            // 4. Update the local state
            setClothingItems(clothingItems.filter(item => item.id !== itemToDelete.id));
            
            // 5. Close the modal and reset the state
            setShowDeleteModal(false);
            setItemToDelete(null);
            console.log("Clothing item deleted successfully!");
        } catch (error) {
            console.error("Error deleting clothing item:", error);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setItemToDelete(null);
    };

    return (
        <div className="mycloset">
            <Header title="My Closet" />

            <Container fluid className="category-filter-container">
                <div className="category-filter">
                    <ButtonGroup className="categories mb-3">
                        {categories.map((category) => (
                            <Nav.Item key={category.name}>
                                <Button
                                    variant={category.name === selectedCategory ? "secondary" : "outline-secondary"}
                                    onClick={() => setSelectedCategory(category.name)}
                                    className="category-button">
                                    {category.icon} {category.name}
                                </Button>
                            </Nav.Item>
                        ))}
                    </ButtonGroup>
                </div>
            </Container>

            <Container className="mycloset-content">
                <Row className="clothing-grid">
                    {filteredClothing.length > 0 ? (
                        filteredClothing.map((item, index) => (
                            <Col key={index} xs={6} className="mb-3">
                                <Card className="clothing-item" onClick={() => handleShowModal(item)}>
                                    <div className="clothing-image-wrapper">
                                        <Card.Img variant="top" src={item.imageUrl} alt={item.name} />
                                        <button 
                                            className="delete-button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteClick(item);
                                            }}
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </Card>
                            </Col>
                        ))
                    ) : (
                        <p className="no-items">No items in this category</p>
                    )}
                </Row>
            </Container>

            {/* Item Details Modal */}
            <CustomModal show={showModal} onClose={() => setShowModal(false)} title={selectedItem?.name}>
                {selectedItem && (
                    <>
                        <div className="modal-image-wrapper">
                            <img src={selectedItem.imageUrl} alt={selectedItem.name} className="modal-image" />
                        </div>
                        <div className="modal-details">
                            <p><strong>Category:</strong> {selectedItem.category}</p>
                            <p><strong>Brand:</strong> {selectedItem.brand}</p>
                            <p><strong>Color:</strong> {selectedItem.color}</p>
                            <p><strong>Size:</strong> {selectedItem.size}</p>
                            <p><strong>Created At:</strong> {new Date(selectedItem.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="footer-buttons">
                            <Button 
                                variant="danger" 
                                onClick={() => handleDeleteClick(selectedItem)}
                                className="delete-item-btn"
                            >
                                <FiTrash2 /> Delete Item
                            </Button>
                        </div>
                    </>
                )}
            </CustomModal>

            {/* Delete Confirmation Modal */}
            <CustomModal 
                show={showDeleteModal} 
                onClose={cancelDelete} 
                title="Delete Clothing Item"
            >
                <div className="delete-modal-content">
                    <p>Are you sure you want to delete "{itemToDelete?.name}"?</p>
                    <p className="warning-text">This action cannot be undone and may affect outfits using this item.</p>
                    <div className="footer-buttons">
                        <Button variant="secondary" onClick={cancelDelete}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </div>
                </div>
            </CustomModal>
        </div>
    );
};

export default MyClosetPage;