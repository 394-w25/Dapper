import React, { useState, useEffect } from "react";
import Header from "../../components/header/Header";
import { useDbData, useAuthState } from "../../utilities/firebase";
import { database } from "../../utilities/firebase";
import { ref, get } from "firebase/database";
import { Container, ButtonGroup, Button, Row, Col, Card } from "react-bootstrap";
import "./MyClosetPage.css";

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
                const clothingRef = ref(database, `mockClothingData/${clothingId}`);
                const snapshot = await get(clothingRef);

                if (snapshot.exists()) {
                    clothingDetails.push({ id: clothingId, ...snapshot.val() });
                }
            }

            setClothingItems(clothingDetails);
        };

        fetchClothingDetails();
    }, [userData]);

    const categories = ["All", "Tops", "Bottoms", "Shoes", "Outerwear", "Accessories"];

    const filteredClothing = clothingItems.filter(
        (item) => selectedCategory === "All" || item.Category === selectedCategory
    );

    return (
        <div className="mycloset">
            <Header title="My Closet" />

            <Container className="mycloset-content">
                <Container fluid className="category-filter-container">
                    <div className="category-filter">
                        <ButtonGroup>
                            {categories.map((category) => (
                                <Button
                                    key={category}
                                    variant={selectedCategory === category ? "dark" : "outline-dark"}
                                    onClick={() => setSelectedCategory(category)}
                                >
                                    {category}
                                </Button>
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
                                        <Card.Img variant="top" src={item.ImageURL} alt={item.Name} />
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