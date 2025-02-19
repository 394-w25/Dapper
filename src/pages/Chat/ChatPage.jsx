import React from 'react';
import Header from "../../components/header/Header";
import './ChatPage.css';

const ChatPage = () => {
  return (
    <div className="chat">
      <Header title="Chat" />
      <div className="chat-content">
        <p>Check and reply to messages here.</p>
      </div>
    </div>
  );
};

export default ChatPage;