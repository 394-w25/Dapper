import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Container, ListGroup } from 'react-bootstrap';
import { signOut, database } from '../../utilities/firebase';
import { ref, get, query, orderByChild, equalTo, limitToLast } from 'firebase/database';
import './ProfilePage.css';
import Header from '../../components/header/Header';
import { useDbData, useAuthState } from "../../utilities/firebase";
import { MdKeyboardArrowRight } from "react-icons/md";

const ProfilePage = () => {
  const [user] = useAuthState();
  const [userData] = useDbData(user ? `users/${user.uid}` : null);
  const navigate = useNavigate();
  const [recentOutfits, setRecentOutfits] = useState([]);
  const [recentClothing, setRecentClothing] = useState([]);
  const [recentInspirations, setRecentInspirations] = useState([]);

  useEffect(() => {
    fetchOutfits();
  }, [user]);

  const fetchOutfits = async () => {
    if (!user) return;

    try {
      const outfitsRef = ref(database, 'outfits');
      const snapshot = await get(outfitsRef);

      if (snapshot.exists()) {
        const outfitsData = snapshot.val();
        const userOutfits = Object.values(outfitsData)
          .filter(outfit => outfit.createdBy === user.uid)
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 4);

        setRecentOutfits(userOutfits);
      }
    } catch (error) {
      console.error("Error fetching recent outfits:", error);
    }
  };

  useEffect(() => {
    const fetchClothingDetails = async () => {
      if (!userData || !userData.closet) return;
  
      try {
        const clothingRefs = userData.closet.map((id) => ref(database, `clothing/${id}`));
        const clothingPromises = clothingRefs.map((clothingRef) => get(clothingRef));
        const clothingSnapshots = await Promise.all(clothingPromises);
  
        const clothingDetails = clothingSnapshots
          .filter((snapshot) => snapshot.exists())
          .map((snapshot) => ({ id: snapshot.key, ...snapshot.val() }));
  
        const recentClothing = clothingDetails
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 3);
  
        setRecentClothing(recentClothing);
      } catch (error) {
        console.error('Error fetching clothing details:', error);
      }
    };
    fetchClothingDetails();
  }, [userData]);

  useEffect(() => { // herbert change the inspirations variables here if needed
    const fetchInspirations = async () => {
      if (!userData || !userData.inspirations) return;

      const inspirationDetails = [];

      for (const id of userData.inspirations) {
        const inspirationRef = ref(database, `inspirations/${id}`);
        const snapshot = await get(inspirationRef);

        if (snapshot.exists()) {
          inspirationDetails.push({ id: id, ...snapshot.val() });
        }
      }
      const recentInspiration = inspirationDetails.filter(inspiration => inspiration.createdBy === user.uid)
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 3);
      setRecentInspirations(recentInspiration);
    };
    fetchInspirations();
  }, [userData]);

  return (
    <div className="profile-page">
      <Header title="My Closet" />
      <Container className="profile-page-content">
        <div className="profile-header">
          <img
            src={userData?.photoURL}
            alt="Profile"
            className="rounded-circle"
            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
          />
          <span style={{ fontSize: '22px'}}>{userData?.displayName}</span>
        </div>

        {/* Outfits Section */}
        <Card className="section-cards">
          <Card.Header className="section-card-header" onClick={() => navigate('/outfits')} style={{ cursor: "pointer" }}>
            Outfits
            <MdKeyboardArrowRight className="arrow-icon" />
          </Card.Header>
          <Card.Body>
            <div className="outfit-grid">
              {recentOutfits.length > 0 ? (
                recentOutfits.map(outfit => (
                  <div key={outfit.outfitId} className="outfit-card">
                    <div className="outfit-image-wrapper">
                      <img src={outfit.imageUrl} alt={outfit.name} className="clothing-image" />
                    </div>
                  </div>
                ))
              ) : [...Array(3)].map((_, index) => (
                <div key={index} className="outfit-placeholder"></div>
              ))}
            </div>
          </Card.Body>
        </Card>

        {/* Clothing Section */}
        <Card className="section-cards">
          <Card.Header className="section-card-header" onClick={() => navigate('/mycloset')} style={{ cursor: "pointer" }}>Clothing
            <MdKeyboardArrowRight className="arrow-icon" />
          </Card.Header>
          <Card.Body>
            <div className="outfit-grid">
              {recentClothing.length > 0 ? (
                recentClothing.map(item => (
                  <div key={item.id} className="outfit-card">
                    <div className="outfit-image-wrapper">
                      <img src={item.imageUrl} alt={item.name} className="clothing-image" />
                    </div>
                  </div>
                ))
              ) : [...Array(3)].map((_, index) => (
                <div key={index} className="outfit-placeholder"></div>
              ))}
            </div>
          </Card.Body>
        </Card>

        <Card className="section-cards">
          <Card.Header className="section-card-header" onClick={() => navigate('/inspiration')} style={{ cursor: "pointer" }}>Inspiration
            <MdKeyboardArrowRight className="arrow-icon" />
          </Card.Header>
          <Card.Body>
            <div className="outfit-grid">
              {recentInspirations.length > 0 ? (
                recentInspirations.map(item => (
                  <div key={item.id} className="outfit-card">
                    <div className="outfit-image-wrapper">
                      <img src={item.imageUrl} alt={item.name} className="clothing-image" />
                    </div>
                  </div>
                ))
              ) : [...Array(3)].map((_, index) => (
                <div key={index} className="outfit-placeholder"></div>
              ))}
            </div>
          </Card.Body>
        </Card>

        {/* <div className="text-center mt-4">
          <Button variant="danger" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div> */}
      </Container>
    </div>
  );
};

export default ProfilePage;
