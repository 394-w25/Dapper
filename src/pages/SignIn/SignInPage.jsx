import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle, useDbUpdate, database } from '../../utilities/firebase';
import { ref, get } from 'firebase/database';
import Logo from '../../components/logo/Logo';
import googleLogo from '../../images/googlelogo.svg';
import './SignInPage.css';

const Login = () => {
    const navigate = useNavigate();
    const [update] = useDbUpdate('/users');
    const [error, setError] = useState('');

    const handleGoogleSignIn = async () => {
        try {

            const result = await signInWithGoogle();
            // console.log('result:', result);
            const userID = result.uid;

            const userRef = ref(database, `/users/${userID}`);
            const snapshot = await get(userRef);

            if (!snapshot.exists()) {
                const userData = {
                    [userID]:
                    {
                        displayName: result.displayName,
                        email: result.email,
                        photoURL: result.photoURL,
                        claimedItems: [],
                        foundItems: [],
                        about: '',
                        newUser: true,
                        styles: [],
                    }
                };

                await (update(userData));
                navigate('/onboarding');
            }

            if (snapshot.exists()) {
                const userData = snapshot.val();
                if (userData.newUser) {
                    navigate('/onboarding');
                } else {
                    navigate('/');
                }
            }

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="auth-page">
            <Logo />
            <button onClick={handleGoogleSignIn} className="auth-button google-button">
                <img
                    src={googleLogo}
                    alt="Google logo"
                    className="google-icon"
                />
                Sign in with Google
            </button>
            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default Login;
