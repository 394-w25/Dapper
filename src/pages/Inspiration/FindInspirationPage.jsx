import React, { useState, useEffect } from "react";
import { Container, Button, Form } from "react-bootstrap";
import { FaSearch, FaCheckCircle } from "react-icons/fa";
import Header from "../../components/header/Header";
import BackButton from "../../components/inspiration/BackButton";
import InspirationFooter from "../../components/inspiration/InspirationFooter";
import { fetchOutfitInspirations } from "../../utilities/pexelsapi";
import { useAuthState, useDbData, useDbUpdate } from "../../utilities/firebase";
import CustomModal from "../../components/modal/CustomModal";
import "./FindInspirationPage.css";

const categories = ["All Styles", "Formal", "Casual", "Sporty"];

const FindInspirationPage = () => {
    const [user] = useAuthState();

    // Fetch saved inspirations and pexels IDs from Firebase
    const [inspirationData] = useDbData(user ? `inspiration/${user.uid}` : null);
    const [updateData] = useDbUpdate(user ? `inspiration/${user.uid}` : null);

    const [selectedCategory, setSelectedCategory] = useState("All Styles");
    const [searchQuery, setSearchQuery] = useState("");
    const [inspirations, setInspirations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedInspiration, setSelectedInspiration] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [savedInspirationIds, setSavedInspirationIds] = useState([]);
    const [folders, setFolders] = useState([]);

    // Infinite Scroll State
    // const [page, setPage] = useState(1);
    // const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        if (inspirationData) {
            if (inspirationData.pexels) {
                setSavedInspirationIds(inspirationData.pexels.map(Number));
            }
            if (inspirationData.folders) {
                setFolders(inspirationData.folders);
            }
        }
    }, [inspirationData]);

    useEffect(() => {
        handleSearch("mens fashion outfits");
    }, []);

    const handleSearch = async (query) => {
        setLoading(true);
        const data = await fetchOutfitInspirations(query);
        setInspirations(data);
        setLoading(false);
    };

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        handleSearch(category === "All Styles" ? "mens fashion outfits" : `mens ${category.toLowerCase()} fashion outfits`);
    };

    const openInspirationModal = (inspiration) => {
        setSelectedInspiration(inspiration);
        setShowModal(true);
    };

    const saveInspiration = async () => {
        if (!user || !selectedInspiration) return;

        const inspirationId = selectedInspiration.id;
        if (savedInspirationIds.includes(inspirationId)) return;

        const newInspiration = {
            title: "Pexel Inpsiration",
            source: "Pexels",
            imageUrl: selectedInspiration.src.medium,
            tags: ["fashion", selectedCategory.toLowerCase()],
            createdAt: Date.now(),
        };

        try {
            await updateData({
                [`inspirations/${inspirationId}`]: newInspiration,
                [`pexels`]: [...Array.from(savedInspirationIds), `${inspirationId}`],
            });

            // Update state to reflect saved inspiration
            setSavedInspirationIds([...savedInspirationIds, inspirationId]);
            setShowModal(false);
        } catch (error) {
            console.error("Error saving inspiration:", error);
        }
    };

    const removeInspiration = async () => {
        if (!user || !selectedInspiration) return;

        const inspirationId = selectedInspiration.id;
        if (!savedInspirationIds.includes(inspirationId)) return;

        try {
            const updates = {
                [`inspirations/${inspirationId}`]: null,
                [`pexels`]: savedInspirationIds.filter(id => id !== inspirationId).map(String),
            };

            // Remove inspiration from all folders that contain it
            const updatedFolders = { ...folders };
            Object.entries(updatedFolders).forEach(([folderId, folder]) => {
                if (folder.inspirationIds?.includes(inspirationId.toString())) {
                    updatedFolders[folderId].inspirationIds = folder.inspirationIds.filter(id => id !== inspirationId.toString());
                    updates[`folders/${folderId}/inspirationIds`] = updatedFolders[folderId].inspirationIds;
                }
            });

            await updateData(updates);

            // Update local state
            setSavedInspirationIds(savedInspirationIds.filter(id => id !== inspirationId));
            setFolders(updatedFolders);
            setShowModal(false);
        } catch (error) {
            console.error("Error removing inspiration:", error);
        }
    };

    return (
        <div className="find-inspiration">
            <BackButton to="/inspiration" />
            <Header title="Find Inspiration" />

            <Container className="find-container">
                {/* Search Bar */}
                <Form.Group className="search-bar">
                    <FaSearch className="search-icon" />
                    <Form.Control
                        type="text"
                        placeholder="Search styles"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSearch(searchQuery)}
                    />
                    <Button variant="dark" onClick={() => handleSearch(searchQuery)}>Search</Button>
                </Form.Group>

                {/* Category Filters */}
                <div className="category-filter-container">
                    <div className="category-filter">
                        {categories.map((category) => (
                            <Button
                                key={category}
                                variant={selectedCategory === category ? "dark" : "outline-dark"}
                                className={`category-button ${selectedCategory === category ? "active" : ""}`}
                                onClick={() => handleCategoryClick(category)}
                            >
                                {category}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Inspirations Grid */}
                <div className="inspiration-grid">
                    {loading ? (
                        <p>Loading inspirations...</p>
                    ) : inspirations.length > 0 ? (
                        inspirations.map((item) => (
                            <div key={item.id} className="inspiration-card" onClick={() => openInspirationModal(item)}>
                                <img src={item.src.medium} alt={item.photographer} className="inspiration-image" />
                                {savedInspirationIds.includes(item.id) && (
                                    <FaCheckCircle className="saved-indicator" title="Saved" />
                                )}
                            </div>
                        ))
                    ) : (
                        <p>No inspirations found.</p>
                    )}
                </div>
            </Container>

            {/* Inspiration Details Modal */}
            <CustomModal show={showModal} onClose={() => setShowModal(false)} title="Inspiration Details">
                {selectedInspiration && (
                    <>
                        <div className="modal-image-wrapper">
                            <img src={selectedInspiration.src.large} alt="Inspiration" className="modal-image" />
                        </div>
                        <p><strong>Source:</strong> Pexels</p>
                        <p><strong>Photographer:</strong> {selectedInspiration.photographer}</p>
                        <p><strong>Category:</strong> {selectedCategory}</p>
                        <div className="footer-buttons">
                            <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                            {savedInspirationIds.includes(selectedInspiration.id) ? (
                                <Button variant="danger" onClick={removeInspiration}>Remove Inspiration</Button>
                            ) : (
                                <Button variant="dark" onClick={saveInspiration}>Save Inspiration</Button>
                            )}
                        </div>
                    </>
                )}
            </CustomModal>;

            {/* Footer */}
            <InspirationFooter activePage="find" />
        </div>
    );
};

export default FindInspirationPage;
