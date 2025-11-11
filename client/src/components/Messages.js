import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/Messages.css';
import ExchangeStatus from './ExchangeStatus';

const Messages = ({ currentUserId }) => {
  const { itemId, receiverId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showExchangePrompt, setShowExchangePrompt] = useState(false);
  const [initiatorId, setInitiatorId] = useState(null);
  const [exchangeStatus, setExchangeStatus] = useState('pending');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/messages/${itemId}/${currentUserId}/${receiverId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
          if (data.length > 0) {
            setInitiatorId(data[0].sender_id);
          }
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    const fetchExchangeStatus = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/exchange/status/${itemId}`);
        if (res.ok) {
          const data = await res.json();
          setExchangeStatus(data.status);
        }
      } catch (err) {
        console.error('Error fetching exchange status:', err);
      }
    };

    fetchMessages();
    fetchExchangeStatus();
    const interval = setInterval(() => {
      fetchMessages();
      fetchExchangeStatus();
    }, 3000);

    return () => clearInterval(interval);
  }, [itemId, currentUserId, receiverId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleExchangeAction = async (action) => {
    let message = '';
    let newStatus = exchangeStatus;

    if (action === 'request') {
      message = '🔁 I would like to exchange this item.';
      newStatus = 'exchange';
    } else if (action === 'accept') {
      message = '✅ I agree to exchange this item.';
      newStatus = 'agreed';
    } else if (action === 'decline') {
      message = '❌ I do not want to exchange this item.';
      newStatus = 'declined';
    } else if (action === 'received') {
      message = '📦 I have received the item. Exchange complete!';
      newStatus = 'completed';
    }

    try {
      await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUserId,
          receiverId,
          itemId,
          content: message,
        }),
      });

      await fetch('http://localhost:5000/api/exchange/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          userId: currentUserId,
          status: newStatus,
        }),
      });

      setMessages(prev => [
        ...prev,
        {
          sender_id: currentUserId,
          receiver_id: receiverId,
          item_id: itemId,
          content: message,
          timestamp: new Date().toISOString(),
        },
      ]);

      setExchangeStatus(newStatus);
      setShowExchangePrompt(false);
    } catch (err) {
      console.error('Error handling exchange action:', err);
    }
  };

  const renderExchangeControls = () => {
    if (currentUserId === initiatorId && exchangeStatus === 'pending') {
      return (
        <button onClick={() => handleExchangeAction('request')}>Request Exchange</button>
      );
    }

    if (currentUserId !== initiatorId && exchangeStatus === 'exchange') {
      return (
        <div className="exchange-response-buttons">
          <p>Do you want to exchange this item?</p>
          <button onClick={() => handleExchangeAction('accept')}>Yes</button>
          <button onClick={() => handleExchangeAction('decline')}>No</button>
        </div>
      );
    }

    if (currentUserId === initiatorId && exchangeStatus === 'agreed') {
      return (
        <button onClick={() => handleExchangeAction('received')}>Mark as Received</button>
      );
    }

    return null;
  };

  return (
    <div className="messages-container">
      <h2>Messages</h2>

      <ExchangeStatus
        itemId={itemId}
        currentUserId={currentUserId}
        senderId={initiatorId}
        receiverId={receiverId}
      />

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

      <div className="exchange-prompt">
        {renderExchangeControls()}
      </div>
    </div>
  );
};

export default Messages;