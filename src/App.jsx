import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignInPage from './pages/SignIn/SignInPage';
import ChatPage from './pages/Chat/ChatPage';
import ClosetPage from './pages/Closet/ClosetPage';
import AddItem from './pages/Closet/Add-Items/AddItem';  // ✅ Import AddItem Page
import MyClosetPage from './pages/MyCloset/MyClosetPage';
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
              <Route path="/add-item" element={<AddItem />} /> 
              <Route path="/mycloset" element={<MyClosetPage />} />
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

const AppWrapper = () => (
  <Router>
    <SmartphoneFrame>
      <App />
    </SmartphoneFrame>
  </Router>
);

export default AppWrapper;