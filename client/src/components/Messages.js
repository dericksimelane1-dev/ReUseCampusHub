import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/Messages.css';

const Messages = ({ currentUserId }) => {
  const { itemId, receiverId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/messages/${itemId}/${currentUserId}/${receiverId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        } else {
          console.error('Failed to fetch messages');
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();
  }, [itemId, currentUserId, receiverId]);

  const handleSend = async () => {
    if (newMessage.trim() === '') return;

    try {
      const res = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUserId,
          receiverId,
          itemId,
          content: newMessage,
        }),
      });

      if (res.ok) {
        setMessages(prev => [
          ...prev,
          {
            sender_id: currentUserId,
            receiver_id: receiverId,
            item_id: itemId,
            content: newMessage,
            timestamp: new Date().toISOString(),
          },
        ]);
        setNewMessage('');
        scrollToBottom();
      } else {
        console.error('Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="messages-container">
      <h2>Messages</h2>
      <div className="messages-list">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender_id === currentUserId ? 'sent' : 'received'}`}>
            <strong>{msg.sender_id === currentUserId ? 'You' : 'Them'}:</strong> {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default Messages;