import React, { useState } from "react";
import { Container, Button, Form } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import Header from "../../components/header/Header";
import BackButton from "../../components/inspiration/BackButton";
import InspirationFooter from "../../components/inspiration/InspirationFooter";
import "./FindInspirationPage.css";

const categories = ["All Styles", "Formal", "Casual", "Sporty"];

const inspirations = [
    { id: 1, title: "Classic Formal", subtitle: "Suits & Business" },
    { id: 2, title: "Smart Casual", subtitle: "Polished & Relaxed" },
    { id: 3, title: "Streetwear", subtitle: "Urban & Casual" },
    { id: 4, title: "Minimalist", subtitle: "Clean & Essential" },
    { id: 5, title: "Athletic", subtitle: "Sports & Active" },
    { id: 6, title: "Vintage", subtitle: "Retro & Classic" }
];

const FindInspirationPage = () => {
    const [selectedCategory, setSelectedCategory] = useState("All Styles");

    return (
        <div className="find-inspiration">
            <BackButton to="/inspiration" />
            <Header title="Find Inspiration" />

            <Container className="find-container">
                {/* Search Bar */}
                <Form.Group className="search-bar">
                    <FaSearch className="search-icon" />
                    <Form.Control type="text" placeholder="Search styles" />
                </Form.Group>

                {/* Category Filters */}
                <div className="category-buttons">
                    {categories.map((category) => (
                        <Button
                            key={category}
                            className={`category-button ${selectedCategory === category ? "active" : ""}`}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category}
                        </Button>
                    ))}
                </div>

                {/* Inspirations Grid */}
                <div className="inspiration-grid">
                    {inspirations.map((item) => (
                        <div key={item.id} className="inspiration-card">
                            <div className="inspiration-placeholder">{item.title}</div>
                            <div className="inspiration-details">
                                <h5>{item.title}</h5>
                                <p>{item.subtitle}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Save Inspiration Button */}
                <Button className="save-button">Save Inspiration</Button>
            </Container>

            {/* Reusable Footer */}
            <InspirationFooter activePage="find" />
        </div>
    );
};

export default FindInspirationPage;
