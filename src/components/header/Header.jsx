import React from 'react';
import Logo from '../logo/Logo';
import './Header.css';

const Header = () => {
  return (
    <header className="app-header">
      <div className="logo-container">
        <Logo />
      </div>
    </header>
  );
};

export default Header;
