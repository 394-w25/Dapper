import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignInPage from './pages/SignIn/SignInPage';
import ChatPage from './pages/Chat/ChatPage';
import ChatScreen from './pages/Chat/ChatScreen';
import ClosetPage from './pages/Closet/ClosetPage';
import MyClosetPage from './pages/MyCloset/MyClosetPage';
import AddItem from './pages/Add-Items/AddItem';
import DiscoverPage from './pages/Discover/DiscoverPage';
import OutfitBuilder from './pages/OutfitBuilder/OutfitBuilderPage';
import OutfitBuilderPageNew from './pages/OutfitBuilder/Outfitbuilderpagenew';
import OutfitFeedbackPage from './pages/Feedback/OutfitFeedback';
import SuggestionModal from './pages/Feedback/SuggestionModal';
import ProfilePage from './pages/Profile/ProfilePage';
import InspirationPage from './pages/Inspiration/InspirationPage';
import FindInspirationPage from './pages/Inspiration/FindInspirationPage';
import UploadInspirationPage from './pages/Inspiration/UploadInspirationPage';
import UploadDetailsPage from './pages/Inspiration/UploadDetailsPage';
import NotFoundPage from './pages/NotFound/NotFoundPage';
import HomePage from './pages/Home/HomePage';
import NavigationBar from './components/navigation/NavigationBar';
import { useAuthState } from './utilities/firebase';
import SmartphoneFrame from './components/phoneframe/SmartphoneFrame';
import './App.css';
import { useNavigate } from 'react-router';
import WelcomePage from './pages/Onboarding/WelcomePage';
import SelectPhotosPage from './pages/Onboarding/SelectPhotosPage';
import SelectTagsPage from './pages/Onboarding/SelectTagsPage';
import { useDbData } from './utilities/firebase';

const App = () => {
  const [user, loading, error] = useAuthState();
  const navigate = useNavigate();
  const [userData] = useDbData(user ? `users/${user.uid}` : null);

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
      ) : userData?.newUser ? (
        <Routes>
          <Route path="/onboarding" element={<WelcomePage />} />
          <Route path="/onboarding/selectphotos" element={<SelectPhotosPage />} />
          <Route path="/onboarding/selecttags" element={<SelectTagsPage />} />
        </Routes>
      ) : (
        <>
          <div className="main-content">
            <Routes>
              <Route path="/" element={<HomePage user={user} />} />
              <Route path="/mycloset" element={<MyClosetPage />} />
              <Route path="/inspiration" element={<InspirationPage />} />
              <Route path="/inspiration/find" element={<FindInspirationPage />} />
              <Route path="/inspiration/upload" element={<UploadInspirationPage />} />
              <Route path="/inspiration/upload/details" element={<UploadDetailsPage />} />
              <Route path="/add-item" element={<AddItem />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/chat/:chatId" element={<ChatScreen />} />
              <Route path="/outfit-feedback/:outfitId" element={<OutfitFeedbackPage />} />
              <Route path="/review-edits/:chatId" element={<SuggestionModal />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/outfit-builder" element={<OutfitBuilder />} />
              <Route path="/outfit-builder-new" element={<OutfitBuilderPageNew />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
          <NavigationBar />
        </>
      )}
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