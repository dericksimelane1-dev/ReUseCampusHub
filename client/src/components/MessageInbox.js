import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/MessageInbox.css'; // Optional: for styling

const MessageInbox = ({ currentUserId }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/conversations/${currentUserId}`);
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
        } else {
          console.error('Failed to fetch conversations');
        }
      } catch (err) {
        console.error('Error fetching conversations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [currentUserId]);

  if (loading) return <p>Loading conversations...</p>;

  return (
    <div className="inbox-container">
      <h2>Your Conversations</h2>
      {conversations.length === 0 ? (
        <p>No conversations yet.</p>
      ) : (
        <ul className="conversation-list">
          {conversations.map((conv, index) => (
            <li key={index}>
              <Link to={`/messages/${conv.item_id}/${conv.other_user_id}`}>
                Chat with {conv.other_user_name} about "{conv.item_title}"
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MessageInbox;