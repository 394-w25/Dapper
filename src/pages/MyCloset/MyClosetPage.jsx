import React, { useState, useEffect } from "react";
import Header from "../../components/header/Header";
import { useDbData, useAuthState } from "../../utilities/firebase";
import { database } from "../../utilities/firebase";
import { ref, get } from "firebase/database";
import { Container, ButtonGroup, Button, Row, Col, Card, Nav } from "react-bootstrap";
import { FaTshirt } from 'react-icons/fa';
import { FaBagShopping } from 'react-icons/fa6';
import { TbHanger } from "react-icons/tb";
import { PiPantsFill } from "react-icons/pi";
import { GiRunningShoe } from "react-icons/gi";
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

    useEffect(() => {
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

        fetchClothingDetails();
    }, [userData]);

    const filteredClothing = clothingItems.filter(
        (item) => selectedCategory === "All" || item.category === selectedCategory
    );

    return (
        <div className="mycloset">
            <Header title="My Closet" />

            <Container className="mycloset-content">
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

                <Row className="clothing-grid">
                    {filteredClothing.length > 0 ? (
                        filteredClothing.map((item, index) => (
                            <Col key={index} xs={6} className="mb-3">
                                <Card className="clothing-item">
                                    <div className="clothing-image-wrapper">
                                        <Card.Img variant="top" src={item.imageUrl} alt={item.name} />
                                    </div>
                                </Card>
                            </Col>
                        ))
                    ) : (
                        <p className="no-items">No items in this category</p>
                    )}
                </Row>
            </Container>
        </div>
    );
};

export default MyClosetPage;
