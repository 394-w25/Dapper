import React from 'react';
import './Logo.css';
import shirt from '../../images/shirt.svg';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="logo-container">
      <img src={shirt} alt="Shirt" className="logo-icon" />
      <span className="logo-text">
        Dapper
      </span>
      </Link>
  );
};

export default Logo;
