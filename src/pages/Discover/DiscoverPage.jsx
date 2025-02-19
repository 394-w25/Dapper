import React from 'react';
import Header from "../../components/header/Header";
import './DiscoverPage.css';

const DiscoverPage = () => {
  return (
    <div className="discover">
      <Header title="Discover" />
      <div className="discover-content">
        <p>Discover stuff here</p>
      </div>
    </div>
  );
};

export default DiscoverPage;