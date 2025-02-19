import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignInPage from './pages/SignIn/SignInPage';
import ChatPage from './pages/Chat/ChatPage';
import ClosetPage from './pages/Closet/ClosetPage';
import MyClosetPage from './pages/MyCloset/MyClosetPage';
import AddItem from './pages/Add-Items/AddItem';
import DiscoverPage from './pages/Discover/DiscoverPage';
import OutfitBuilder from './pages/OutfitBuilder/OutfitBuilderPage';
import ProfilePage from './pages/Profile/ProfilePage';
import NotFoundPage from './pages/NotFound/NotFoundPage';
import NavigationBar from './components/navigation/NavigationBar';
import { useAuthState } from './utilities/firebase';
import SmartphoneFrame from './components/phoneframe/SmartphoneFrame';
import './App.css';

const App = () => {
  const [user, loading, error] = useAuthState();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <>
      {!user ? (
        <SignInPage />
      ) : (
        <>
          <div className="main-content">
            <Routes>
              <Route path="/" element={<ClosetPage />} />
              <Route path="/mycloset" element={<MyClosetPage />} />
              <Route path="/add-item" element={<AddItem />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/outfit-builder" element={<OutfitBuilder />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
          <NavigationBar />
        </>
      )};
    </>
  );
};

// const AppWrapper = () => (
//   <Router>
//     <SmartphoneFrame>
//       <App />
//     </SmartphoneFrame>
//   </Router>
// );

// export default AppWrapper;

const AppWrapper = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 480);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Router>
      {isMobile ? <App /> : <SmartphoneFrame><App /></SmartphoneFrame>}
    </Router>
  );
};

export default AppWrapper;