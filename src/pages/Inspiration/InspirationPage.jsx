import React, { useState, useEffect } from "react";
import { useAuthState, useDbData, useDbUpdate } from "../../utilities/firebase";
import Header from "../../components/header/Header";
import InspirationFooter from "../../components/inspiration/InspirationFooter";
import CustomModal from "../../components/modal/CustomModal";
import { Container, Button, ListGroup, Card, Form } from "react-bootstrap";
import { FaFolder, FaPlus, FaEye } from "react-icons/fa";
import { FiTrash2 } from 'react-icons/fi';
import "./InspirationPage.css";

const InspirationPage = () => {
    const [user] = useAuthState();
    const [inspirationData] = useDbData(user ? `inspiration/${user.uid}` : null);

    const [folders, setFolders] = useState([]);
    const [inspirations, setInspirations] = useState([]);
    const [viewMode, setViewMode] = useState("folders"); // 'folders' | 'all' | 'folder'
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [selectedInspiration, setSelectedInspiration] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [showNewFolderModal, setShowNewFolderModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [selectedInspirationIds, setSelectedInspirationIds] = useState([]);
    const [updateData] = useDbUpdate(`inspiration/${user?.uid}`);
    const [showAddInspirationModal, setShowAddInspirationModal] = useState(false);

    const [showDeleteFolderModal, setShowDeleteFolderModal] = useState(false);
    const [folderToDelete, setFolderToDelete] = useState(null);

    const [showDeleteInspirationModal, setShowDeleteInspirationModal] = useState(false);
    const [inspirationToDelete, setInspirationToDelete] = useState(null);


    useEffect(() => {
        if (inspirationData) {
            // Set folders
            if (inspirationData.folders) {
                setFolders(Object.entries(inspirationData.folders).map(([id, data]) => ({
                    id,
                    ...data
                })));
            }
            // Set inspirations
            if (inspirationData.inspirations) {
                setInspirations(Object.entries(inspirationData.inspirations).map(([id, data]) => ({
                    id,
                    ...data
                })));
            }
        }
    }, [inspirationData]);

    useEffect(() => {
        const savedViewMode = localStorage.getItem("viewMode");

        // If the saved mode was a folder, reset to "folders" on refresh
        if (savedViewMode === "folder") {
            setViewMode("folders");
            localStorage.setItem("viewMode", "folders");
        } else if (savedViewMode) {
            setViewMode(savedViewMode);
        }
    }, []);

    const changeViewMode = (mode) => {
        setViewMode(mode);
        localStorage.setItem("viewMode", mode);
    };


    // Handle folder creation
    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) {
            alert("Folder name cannot be empty!");
            return;
        }

        if (!user) {
            alert("You must be signed in to create a folder.");
            return;
        }

        const folderId = `${Date.now()}`;
        const newFolder = {
            name: newFolderName.trim(),
            createdAt: Date.now(),
            inspirationIds: selectedInspirationIds.length > 0 ? selectedInspirationIds : [],
        };

        try {
            await updateData({
                [`folders/${folderId}`]: newFolder
            });

            setShowNewFolderModal(false);
            setNewFolderName("");
            setSelectedInspirationIds([]);
        } catch (error) {
            console.error("Error creating folder:", error);
            alert("Failed to create folder. Please try again.");
        }
    };

    // Handle adding inspirations to a folder
    const handleAddInspirationsToFolder = async () => {
        if (!selectedFolder || selectedInspirationIds.length === 0) return;

        const updatedInspirationIds = [...(selectedFolder.inspirationIds || []), ...selectedInspirationIds];

        await updateData({
            [`folders/${selectedFolder.id}/inspirationIds`]: updatedInspirationIds,
        });

        setFolders((prevFolders) =>
            prevFolders.map((folder) =>
                folder.id === selectedFolder.id
                    ? { ...folder, inspirationIds: updatedInspirationIds }
                    : folder
            )
        );

        // Update selectedFolder state so it immediately reflects the new inspirations
        setSelectedFolder((prevFolder) => ({
            ...prevFolder,
            inspirationIds: updatedInspirationIds,
        }));

        setShowAddInspirationModal(false);
        setSelectedInspirationIds([]);
    };

    const handleDeleteFolder = async () => {
        if (!folderToDelete || !user) return;

        try {
            await updateData({
                [`folders/${folderToDelete.id}`]: null
            });

            // Remove the folder from state
            setFolders((prevFolders) => prevFolders.filter(folder => folder.id !== folderToDelete.id));

            setShowDeleteFolderModal(false);
            setFolderToDelete(null);
        } catch (error) {
            console.error("Error deleting folder:", error);
        }
    };

    const handleDeleteInspiration = async (removeFromFolder = false) => {
        if (!inspirationToDelete || !user) return;

        try {
            if (removeFromFolder && selectedFolder) {
                // Remove the inspiration from the selected folder only
                const updatedInspirationIds = selectedFolder.inspirationIds.filter(
                    (id) => id !== inspirationToDelete.id
                );

                await updateData({
                    [`folders/${selectedFolder.id}/inspirationIds`]: updatedInspirationIds,
                });

                // Update local state
                setFolders((prevFolders) =>
                    prevFolders.map((folder) =>
                        folder.id === selectedFolder.id
                            ? { ...folder, inspirationIds: updatedInspirationIds }
                            : folder
                    )
                );

                // Update selectedFolder state so it immediately reflects the new inspirations
                setSelectedFolder((prevFolder) => ({
                    ...prevFolder,
                    inspirationIds: updatedInspirationIds,
                }));
            } else {
                // Delete inspiration from everywhere
                await updateData({
                    [`inspirations/${inspirationToDelete.id}`]: null
                });

                // Remove inspiration from all folders that contain it
                const updatedFolders = folders.map(folder => ({
                    ...folder,
                    inspirationIds: folder.inspirationIds?.filter(id => id !== inspirationToDelete.id) || []
                }));

                const updates = {};
                updatedFolders.forEach(folder => {
                    updates[`folders/${folder.id}/inspirationIds`] = folder.inspirationIds;
                });
                await updateData(updates);

                // Remove from state
                setInspirations((prev) => prev.filter(insp => insp.id !== inspirationToDelete.id));
                setFolders(updatedFolders);
            }

            setShowDeleteInspirationModal(false);
            setInspirationToDelete(null);
        } catch (error) {
            console.error("Error deleting inspiration:", error);
        }
    };

    const handleFolderClick = (folder) => {
        setSelectedFolder(folder);
        setViewMode("folder");
    };

    // Get inspirations for a specific folder
    const inspirationsInFolder = selectedFolder?.inspirationIds
        ? inspirations.filter((insp) => selectedFolder.inspirationIds.includes(insp.id))
        : [];

    // Get inspirations that are not in the selected folder
    const availableInspirations = inspirations.filter(
        (insp) => !selectedFolder?.inspirationIds?.includes(insp.id)
    );


    return (
        <div className="main-inspiration">
            <Header title="Outfit Inspiration" />
            <Container className="inspiration-container">
                {/* Folder & View Buttons */}
                <div className="inspiration-actions">
                    <Button
                        variant={viewMode === "folders" ? "dark" : "outline-dark"}
                        className={`folder-button ${viewMode === "folders" ? "active" : ""}`}
                        onClick={() => changeViewMode("folders")}
                    >
                        <FaFolder /> Folders
                    </Button>
                    <Button
                        variant={viewMode === "view" ? "dark" : "outline-dark"}
                        className={`view-button ${viewMode === "all" ? "active" : ""}`}
                        onClick={() => {
                            changeViewMode("all");
                            setSelectedFolder(null);
                        }}
                    >
                        <FaEye /> View
                    </Button>
                </div>

                {/* Folders View */}
                {viewMode === "folders" && (
                    <>
                        {folders.length > 0 ? (
                            <ListGroup className="folder-list">
                                {folders.map((folder) => (
                                    <ListGroup.Item key={folder.id} className="folder-item" onClick={() => handleFolderClick(folder)}>
                                        <FaFolder className="folder-icon" />
                                        {folder.name}
                                        <button
                                            className="delete-button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFolderToDelete(folder);
                                                setShowDeleteFolderModal(true);
                                            }}
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        ) : (
                            <div className="empty-message">
                                <p>You haven't created any folders yet.</p>
                                <p>Click below to start organizing your inspirations.</p>
                            </div>
                        )}

                        <Button variant="dark" className="new-folder-button" onClick={() => setShowNewFolderModal(true)}>
                            <FaPlus /> New Folder
                        </Button>
                    </>
                )}


                {/* All Inspirations View */}
                {viewMode === "all" && (
                    inspirations.length > 0 ? (
                        <div className="inspiration-grid">
                            {inspirations.map((insp) => (
                                <Card key={insp.id} className="inspiration-card" onClick={() => { setSelectedInspiration(insp); setShowModal(true); }}>
                                    <Card.Img variant="top" src={insp.imageUrl} />
                                    <button
                                        className="delete-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setInspirationToDelete(insp);
                                            setShowDeleteInspirationModal(true);
                                        }}
                                    >
                                        <FiTrash2 />
                                    </button>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p className="empty-message">No inspirations added yet.</p>
                    )
                )}

                {/* Inspirations inside a Folder */}
                {viewMode === "folder" && selectedFolder && (
                    <>
                        <div className="folder-header">
                            <FaFolder className="folder-header-icon" />
                            <h5 className="folder-header-text">{selectedFolder.name}</h5>
                        </div>

                        <>
                            {inspirationsInFolder.length > 0 ? (
                                <div className="inspiration-grid">
                                    {inspirationsInFolder.map((insp) => (
                                        <Card key={insp.id} className="inspiration-card" onClick={() => { setSelectedInspiration(insp); setShowModal(true); }}>
                                            <Card.Img variant="top" src={insp.imageUrl} />
                                            <button
                                                className="delete-button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setInspirationToDelete(insp);
                                                    setShowDeleteInspirationModal(true);
                                                }}
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <p className="empty-message">No inspirations in this folder yet.</p>
                            )}
                        </>

                        <Button
                            variant="dark"
                            className="new-folder-button"
                            onClick={() => setShowAddInspirationModal(true)}
                        >
                            + Add Inspiration to Folder
                        </Button>
                    </>
                )}
            </Container>

            <InspirationFooter activePage="inspiration" />

            {/* Modal for Inspiration Details */}
            <CustomModal show={showModal} onClose={() => setShowModal(false)} title={selectedInspiration?.title}>
                {selectedInspiration && (
                    <>
                        <div className="modal-image-wrapper">
                            <img src={selectedInspiration.imageUrl} alt={selectedInspiration.name} className="modal-image" />
                        </div>
                        <div className="modal-details">
                            <p><strong>Source:</strong> {selectedInspiration.source}</p>
                            <p><strong>Tags:</strong> {selectedInspiration.tags.join(", ")}</p>
                            <p><strong>Created At:</strong> {new Date(selectedInspiration.createdAt).toLocaleDateString()}</p>
                        </div>
                    </>
                )}
            </CustomModal>

            {/* Modal for New Folder */}
            <CustomModal show={showNewFolderModal} onClose={() => setShowNewFolderModal(false)} title="Create New Folder">
                <Form.Group>
                    <Form.Label>Folder Name</Form.Label>
                    <Form.Control
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="Enter folder name"
                    />
                </Form.Group>

                <Form.Group className="mt-3">
                    <Form.Label>Select Inspirations</Form.Label>
                    <div className="select-inspiration-scroll">
                        {inspirations.length > 0 ? (
                            inspirations.map((insp) => (
                                <div
                                    key={insp.id}
                                    className={`select-inspiration-item ${selectedInspirationIds.includes(insp.id) ? "selected" : ""}`}
                                    onClick={() => {
                                        setSelectedInspirationIds((prev) =>
                                            prev.includes(insp.id)
                                                ? prev.filter((id) => id !== insp.id)
                                                : [...prev, insp.id]
                                        );
                                    }}
                                >
                                    <img src={insp.imageUrl} alt={insp.title} className="select-inspiration-image" />
                                </div>
                            ))
                        ) : (
                            <p className="empty-message">No inspirations available.</p>
                        )}
                    </div>
                </Form.Group>

                <Button variant="dark" className="mt-3 w-100" onClick={handleCreateFolder}>
                    Create Folder
                </Button>
            </CustomModal>

            {/* Modal for Add Inspirations to Folder */}
            <CustomModal show={showAddInspirationModal} onClose={() => setShowAddInspirationModal(false)} title="Add Inspirations to Folder">
                <div className="select-inspiration-scroll">
                    {availableInspirations.length > 0 ? (
                        availableInspirations.map((insp) => (
                            <div
                                key={insp.id}
                                className={`select-inspiration-item ${selectedInspirationIds.includes(insp.id) ? "selected" : ""}`}
                                onClick={() => {
                                    setSelectedInspirationIds((prev) =>
                                        prev.includes(insp.id)
                                            ? prev.filter((id) => id !== insp.id)
                                            : [...prev, insp.id]
                                    );
                                }}
                            >
                                <img src={insp.imageUrl} alt={insp.title} className="select-inspiration-image" />
                            </div>
                        ))
                    ) : (
                        <p className="empty-message">All inspirations are already in this folder.</p>
                    )}
                </div>

                <Button variant="dark" className="w-100 mt-3" onClick={handleAddInspirationsToFolder}>
                    Add Selected Inspirations
                </Button>

            </CustomModal>

            {/* Delete Folder Modal */}
            <CustomModal
                show={showDeleteFolderModal}
                onClose={() => setShowDeleteFolderModal(false)}
                title="Delete Folder"
            >
                <p>Are you sure you want to delete "{folderToDelete?.name}"?</p>
                <p className="warning-text">This action cannot be undone.</p>
                <div className="footer-buttons">
                    <Button variant="secondary" onClick={() => setShowDeleteFolderModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDeleteFolder}>
                        Delete
                    </Button>
                </div>
            </CustomModal>

            {/* Delete Inspiration Modal */}
            <CustomModal
                show={showDeleteInspirationModal}
                onClose={() => setShowDeleteInspirationModal(false)}
                title="Delete Inspiration"
            >
                <p>Are you sure you want to delete this inspiration?</p>

                {selectedFolder ? (
                    <>
                        <p className="warning-text">
                            You are currently inside a folder. Do you want to remove this inspiration from "{selectedFolder.name}" or delete it completely?
                        </p>
                        <div className="footer-buttons">
                            {/* <Button variant="secondary" onClick={() => setShowDeleteInspirationModal(false)}>
                                Cancel
                            </Button> */}
                            <Button variant="warning" onClick={() => handleDeleteInspiration(true)}>
                                Remove from Folder
                            </Button>
                            <Button variant="danger" onClick={() => handleDeleteInspiration(false)}>
                                Delete Everywhere
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="warning-text">This action cannot be undone.</p>
                        <div className="footer-buttons">
                            <Button variant="secondary" onClick={() => setShowDeleteInspirationModal(false)}>
                                Cancel
                            </Button>
                            <Button variant="danger" onClick={() => handleDeleteInspiration(false)}>
                                Delete
                            </Button>
                        </div>
                    </>
                )}
            </CustomModal>

        </div>
    );
};

export default InspirationPage;
