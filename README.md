# Dapper: Outfit Inspiration & Builder App Prototype

**Version:** 1.0  
**Last Updated:** March 17, 2025

---

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Firebase Integration](#firebase-integration)
6. [Third-Party Services](#third-party-services)
7. [Installation & Setup](#installation--setup)
8. [Development Workflow](#development-workflow)
9. [Deployment Instructions](#deployment-instructions)
10. [Testing](#testing)
11. [Additional Considerations](#additional-considerations)
12. [Troubleshooting & Known Issues](#troubleshooting--known-issues)
13. [Contributing Guidelines](#contributing-guidelines)
14. [License](#license)
15. [Contact Information](#contact-information)

---

## Introduction

The **Dapper** app prototype is a mobile-first application designed to empower users with the ability to:
- **Discover** outfit inspirations sourced from curated APIs.
- **Build** personalized outfits using an intuitive drag-and-drop interface.
- **Receive feedback** on their outfits from friends and peers via integrated chat and feedback mechanisms.

Originally developed as a class project, this prototype is now being handed over for further development and production deployment. This document provides all the necessary details for new developers to understand, manage, and extend the project.

---

## Features

- **User Authentication:**  
  - Supports Google sign-in and Email/Password methods using Firebase Auth.
  - Custom hooks (e.g., `useAuthState`) are implemented to manage authentication state.

- **Outfit Inspiration:**  
  - Users can search and save outfit inspirations using the Pexels API.
  - Inspirations can be browsed by category and saved into personal collections.

- **Outfit Builder:**  
  - Drag-and-drop interface allows users to select clothing items for different outfit categories.
  - Offers functionalities such as image canvas generation and saving the constructed outfit image to Firebase Storage.

- **Feedback & Chat System:**  
  - Integrated chat for exchanging feedback on outfits.
  - Dedicated pages for viewing chats and sending suggestions.

- **Closet Management:**  
  - Users can manage their own clothing items, including adding new items, editing details, and deleting.
  - A virtual closet page displays recent outfits and clothing items.

- **Social Features:**  
  - Manage friends, add new friends, and view friend lists.
  - Ability to initiate chats and request outfit feedback.

---

## Tech Stack

- **Frontend:**
  - **React** – Primary framework for building the user interface.
  - **JavaScript** – Core scripting language.
  - **CSS & Bootstrap** – Styling and responsive design.
  - **React Router** – Client-side routing.
  - **React Icons** – Icon library for UI elements.

- **Backend & APIs:**
  - **Firebase:**  
    - **Authentication:** Handles user login and registration.
    - **Realtime Database:** Stores user data, outfits, clothing items, and chat messages.
    - **Storage:** Manages image uploads (e.g., clothing, outfits, inspirations).
  - **Pexels API:** Fetches outfit inspiration images.
  - **RemoveBG API:** Processes images by removing backgrounds before uploading.

---

## Project Structure

The project is organized into several folders to separate components, pages, and utilities. Below is an overview of the directory structure:

```
.
├── App.css
├── App.jsx
├── App.test.jsx
├── Data-App.test.jsx
├── components
│   ├── header
│   │   ├── Header.css
│   │   └── Header.jsx
│   ├── inspiration
│   │   ├── BackButton.css
│   │   ├── BackButton.jsx
│   │   ├── InspirationFooter.css
│   │   └── InspirationFooter.jsx
│   ├── logo
│   │   ├── Logo.css
│   │   └── Logo.jsx
│   ├── modal
│   │   ├── CustomModal.css
│   │   └── CustomModal.jsx
│   ├── navigation
│   │   ├── NavigationBar.css
│   │   └── NavigationBar.jsx
│   └── phoneframe
│       ├── SmartphoneFrame.css
│       └── SmartphoneFrame.jsx
├── images
│   ├── googlelogo.svg
│   └── shirt.svg
├── index.css
├── index.jsx
├── logo.svg
├── pages
│   ├── Add-Items
│   │   ├── AddItem.css
│   │   ├── AddItem.jsx
│   │   ├── AddItemNew.css
│   │   └── AddItemNew.jsx
│   ├── Chat
│   │   ├── ChatPage.css
│   │   ├── ChatPage.jsx
│   │   ├── ChatScreen.css
│   │   ├── ChatScreen.jsx
│   │   ├── OutfitPreviewModal.css
│   │   └── OutfitPreviewModal.jsx
│   ├── Closet
│   │   └── ClosetPage.jsx
│   ├── Discover
│   │   ├── DiscoverPage.css
│   │   ├── DiscoverPage.jsx
│   │   ├── Map.jsx
│   │   └── components
│   │       ├── Cart.css
│   │       └── Cart.jsx
│   ├── Feedback
│   │   ├── FeedbackRequestModal.css
│   │   ├── FeedbackRequestModal.jsx
│   │   ├── OutfitFeedback.css
│   │   ├── OutfitFeedback.jsx
│   │   ├── SuggestionModal.css
│   │   └── SuggestionModal.jsx
│   ├── Friends
│   │   ├── AddFriendButton.jsx
│   │   ├── FriendList.css
│   │   ├── FriendList.jsx
│   │   ├── FriendsPage.css
│   │   ├── FriendsPage.jsx
│   │   ├── RemoveFriendButton.jsx
│   │   ├── UserSearchBar.css
│   │   └── UserSearchBar.jsx
│   ├── Home
│   │   ├── HomePage.css
│   │   └── HomePage.jsx
│   ├── Inspiration
│   │   ├── FindInspirationPage.css
│   │   ├── FindInspirationPage.jsx
│   │   ├── InspirationPage.css
│   │   ├── InspirationPage.jsx
│   │   ├── UploadDetailsPage.css
│   │   ├── UploadDetailsPage.jsx
│   │   ├── UploadInspirationPage.css
│   │   └── UploadInspirationPage.jsx
│   ├── MyCloset
│   │   ├── MyClosetPage.css
│   │   └── MyClosetPage.jsx
│   ├── NotFound
│   │   ├── NotFoundPage.css
│   │   └── NotFoundPage.jsx
│   ├── Onboarding
│   │   ├── SelectPhotosPage.css
│   │   ├── SelectPhotosPage.jsx
│   │   ├── SelectTagsPage.css
│   │   ├── SelectTagsPage.jsx
│   │   ├── WelcomePage.css
│   │   └── WelcomePage.jsx
│   ├── OutfitBuilder
│   │   ├── OutfitBuilderPage.css
│   │   ├── OutfitBuilderPage.jsx
│   │   ├── OutfitBuilderPageNew.css
│   │   └── Outfitbuilderpagenew.jsx
│   ├── Profile
│   │   ├── ProfilePage.css
│   │   └── ProfilePage.jsx
│   └── SignIn
│       ├── SignInPage.css
│       └── SignInPage.jsx
└── utilities
    ├── firebase.js
    ├── pexelsapi.js
    └── removeBgApi.js
```


*Note:* While not every single component is documented here, the essential modules to understand the app’s behavior are included.

---

## Firebase Integration

Firebase serves as the backbone of the app. It is responsible for:

- **Authentication:**  
  - Managed through Firebase Auth using both Google and Email/Password methods.
  - Look at `utilities/firebase.js` for the implementation of authentication methods such as `signInWithGoogle`, `loginWithEmail`, and `signUpWithEmail`.
  - A custom hook `useAuthState` is used to track the current user session.

- **Realtime Database:**  
  - Stores structured data including user profiles, outfits, clothing items, chat messages, and friend relationships.
  - Custom hooks such as `useDbData`, `useDbAdd`, and `useDbUpdate` abstract database operations.

- **Storage:**  
  - Handles image uploads for user clothing items, outfit creations, and inspirations.
  - Functions like `uploadImage` and `uploadInspiration` manage file uploads and retrieval of download URLs.

**Security Note:**  
Make sure to review and tighten Firebase security rules before production. Additionally, consider moving sensitive API keys to secure environment variables.

---

## Third-Party Services

- **Pexels API:**  
  - Used to retrieve outfit inspiration images.
  - See `utilities/pexelsapi.js` for API calls and usage examples.
  
- **RemoveBG API:**  
  - Processes images to remove backgrounds before uploading to Firebase Storage.
  - The integration is demonstrated in the Add Item page and in `utilities/removeBgApi.js`.
  - Monitor API usage to avoid unexpected charges or rate limits.

---

## Installation & Setup

### Prerequisites

- **Node.js** (v14 or higher recommended)
- **npm** or **yarn**
- **Firebase CLI:**  
  - Install globally using:  
    ```bash
    npm install -g firebase-tools
    ```

### Steps to Set Up the Project

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-repo/dapper-app.git
   cd dapper-app
    ```

## Install Dependencies:

```bash
npm install
```

Or if using yarn:

```bash
yarn install
```

## Configure Firebase:

- Create a Firebase project in the Firebase Console.
- Enable Authentication (Google and Email/Password), Realtime Database, and Storage.
- Update the `firebaseConfig` object in `utilities/firebase.js` with your project's credentials.
- Secure your API keys (e.g., RemoveBG API key) by storing them in Firebase Database or using environment variables.

## Environment Variables (Optional but Recommended):

- Create a `.env` file at the project root.
- Define your Firebase and third-party API keys here.
- Update your codebase to read from these environment variables instead of hardcoding sensitive data.

## Development Workflow

### Running the Application Locally

Start the development server with:

```bash
npm start
```

This will launch the app at [http://localhost:3000](http://localhost:3000).

### Running Tests

Execute unit and integration tests (e.g., `App.test.jsx`, `Data-App.test.jsx`) with:

```bash
npm test
```

### Code Quality Tools

**Linting:**

```bash
npm run lint
```

**Formatting:**

```bash
npm run format
```

### Git Workflow

- **Branching:**  
  Create feature branches for new features or bug fixes.

- **Pull Requests:**  
  Submit PRs for review. Ensure code passes all tests and linting checks before merging.

- **Commit Messages:**  
  Use clear and concise commit messages following conventional commit guidelines.

## Deployment Instructions

### Building the Application

Generate a production-ready build with:

```bash
npm run build
```

### Deploying to Firebase Hosting

Log in to Firebase:

```bash
firebase login
```

Deploy the build:

```bash
firebase deploy
```

*Note:* Ensure your Firebase project settings (hosting configuration, security rules, etc.) are correctly configured prior to deployment.

## Testing

- **Unit Tests:**  
  Located alongside component files (e.g., `App.test.jsx`).

- **Integration Tests:**  
  Test critical flows (e.g., authentication, outfit building) are provided.

- **Manual Testing:**  
  Verify drag-and-drop functionality, responsiveness, and third-party API integrations in multiple browsers and devices.

## Additional Considerations

- **Responsiveness:**  
  The app includes a smartphone frame component (`SmartphoneFrame.jsx`) to simulate mobile views on desktops. Some responsiveness issues (e.g., mobile view not hiding the frame) are known and may need further refinement.

- **State Management:**  
  React Hooks are primarily used. For future scalability, consider implementing Redux or Context API for global state management.

- **Security:**  
  Update Firebase security rules, secure API keys, and verify that sensitive data is not exposed in the code.

- **Performance:**  
  Optimize image sizes and consider lazy loading for large images. Monitor third-party API usage to manage rate limits.

- **Browser Compatibility:**  
  Test across multiple browsers to ensure drag-and-drop and canvas functionalities perform as expected.

## Troubleshooting & Known Issues

- **Smartphone Frame Behavior:**  
  The smartphone frame component may not disable properly on mobile devices. A workaround is provided, but further updates are planned.

- **API Key Exposure:**  
  Ensure that no sensitive API keys are hardcoded in the repository. Use environment variables or secure Firebase storage.

- **Drag & Drop Limitations:**  
  Some browser-specific issues with drag-and-drop functionality may arise. Test thoroughly and apply polyfills or fixes as needed.

- **Image Upload Performance:**  
  Large images might cause performance issues. Consider compressing images before upload.

## Contributing Guidelines

For developers taking over or contributing to this project:

- Follow the established coding conventions and folder structure.
- Document any changes or new features in both code comments and the README.
- Submit pull requests for review and ensure that new features pass all tests.
- Maintain consistency with the existing design and architectural decisions.

## License

This project is licensed under the MIT License. Please refer to the LICENSE file for details.

## Contact Information

For further support or inquiries, please reach out to:

- **Project Lead:** Herbert Botwe
- **Email:** herbertbotwe2025@u.northwestern.edu

This README is intended as a comprehensive guide to the Dapper app prototype. Please review all sections carefully and update configuration and security settings as needed before deploying to production.
