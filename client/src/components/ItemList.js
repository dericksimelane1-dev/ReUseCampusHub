import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// v4 style
import { jwtDecode } from 'jwt-decode';
import MapPicker from './MapPicker';
import '../styles/ItemList.css';

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [exchangeCondition, setExchangeCondition] = useState('');
  const [category, setCategory] = useState('electronics');
  const [location, setLocation] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [userId, setUserId] = useState(null);
  const [messages, setMessages] = useState({ type: '', text: '' });
  const [showRecentOnly, setShowRecentOnly] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchCategory, setSearchCategory] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.id);
        fetchRecommendations(decoded.interests || []);
      } catch (err) {
        console.error('Invalid token:', err);
      }
    }
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/items');
      const result = await response.json();
      setItems(result);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const fetchRecommendations = async (userInterests = []) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:5001/recommendations', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) return;
      const result = await response.json();

      if (Array.isArray(result.items)) {
        const uniqueItems = Array.from(new Map(result.items.map(item => [item.item_id, item])).values());
        const filteredItems = uniqueItems.filter(item => userInterests.includes(item.category));
        setRecommendations(filteredItems.length > 0 ? filteredItems : uniqueItems);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token || !userId || !location) return;

    const formDataToSend = new FormData();
    formDataToSend.append('title', name);
    formDataToSend.append('description', description);
    formDataToSend.append('location', JSON.stringify(location));
    formDataToSend.append('image', image);
    formDataToSend.append('exchangeCondition', exchangeCondition);
    formDataToSend.append('category', category);

    try {
      const response = await fetch('http://localhost:5000/api/items', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });
      const result = await response.json();
      if (response.ok) {
        setMessages({ type: 'success', text: result.message || 'Item posted successfully!' });
        setName('');
        setDescription('');
        setExchangeCondition('');
        setCategory('electronics');
        setLocation(null);
        setImage(null);
        setImagePreview(null);
        fetchItems();
      } else {
        setMessages({ type: 'error', text: result.message || 'Failed to post item.' });
      }
    } catch (error) {
      setMessages({ type: 'error', text: 'An error occurred while posting the item.' });
    }
  };

  const toggleView = () => {
    setShowRecentOnly(!showRecentOnly);
  };

  const filteredItems = items.filter(item => {
    const matchesKeyword = item.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.description.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchesCategory = searchCategory === '' || item.category === searchCategory;
    return matchesKeyword && matchesCategory;
  });

  const displayedItems = showRecentOnly
    ? filteredItems.slice(0, 5)
    : [...filteredItems].sort((a, b) => a.category.localeCompare(b.category));

  
return (
  <div className="items-page">
    {/* LEFT COLUMN: Search + List */}
    <div className="content-panel">
      <div className="item-list-container">
        {/* Search row */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by keyword..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <select
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="clothes">Clothes</option>
            <option value="textbook">Textbooks</option>
            <option value="furniture">Furniture</option>
          </select>
        </div>

        {/* Toggle button */}
        <button onClick={toggleView} className="toggle-button">
          {showRecentOnly ? 'Show All Items' : 'Show Recent Items'}
        </button>

        {/* Item list title */}
        <h2 className="section-title">List of Items</h2>

        {/* Item list */}
        <ul className="item-list">
          {displayedItems.map((item) => {
            let loc = null;
            try {
              loc = JSON.parse(item.location);
            } catch (e) {
              loc = null;
            }
            const isNotAvailable = item.status === 'not available';
            return (
              <li
                key={item.id}
                className={`item-card ${isNotAvailable ? 'inactive' : ''}`}
              >
                {/* Optional image (kept as in your code) */}
                <img
                  src={`http://localhost:5000/api/items/${item.id}/image`}
                  alt={item.title}
                  className="item-image"
                />

                {/* Text content */}
                <div className="item-content">
                  <h3>{item.title}</h3>

                  <p>{item.description}</p>
                  <p>
                    <strong>Exchange Conditions:</strong> {item.exchange_condition}
                  </p>
                  <p>
                    <strong>Posted by:</strong> {item.poster_name}
                  </p>

                  {/* Status line with dot like screenshot */}
                  <p className="status-line">
                    <strong>Status:</strong>
                    <span
                      className={`status-dot ${
                        isNotAvailable ? 'inactive' : ''
                      }`}
                    />
                    {isNotAvailable ? 'Not Available' : 'Active'}
                  </p>

                  {/* Map (optional) */}
                  {loc && (
                    <div className="item-map">
                      <iframe
                        width="100%"
                        height="200"
                        frameBorder="0"
                        style={{ border: 0 }}
                        src={`https://www.google.com/maps?q=${loc.lat},${loc.lng}&hl=es;z=14&output=embed`}
                        allowFullScreen
                        title="Item Location"
                      ></iframe>
                    </div>
                  )}

                  {/* Message button */}
                  {userId !== item.user_id && !isNotAvailable && (
                    <button
                      className="messages-button"
                      onClick={() => navigate(`/messages/${item.id}/${item.user_id}`)}
                    >
                      Message Owner
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {/* Post section (unchanged) */}
        <h2 className="section-title">Post for Re-Use</h2>
        {messages.text && (
          <div className={`messages ${messages.type}`}>
            {messages.text}
          </div>
        )}
        {userId && (
          <form onSubmit={handleSubmit} className="item-form" encType="multipart/form-data">
            <input
              type="text"
              placeholder="Item Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <textarea
              placeholder="Item Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Exchange Conditions"
              value={exchangeCondition}
              onChange={(e) => setExchangeCondition(e.target.value)}
              required
            />
            <select value={category} onChange={(e) => setCategory(e.target.value)} required>
              <option value="electronics">Electronics</option>
              <option value="clothes">Clothing</option>
              <option value="textbook">Textbooks</option>
              <option value="furniture">Furniture</option>
            </select>

            <label>Select Location on Map:</label>
            <MapPicker setLocation={setLocation} />

            <input type="file" accept="image/*" onChange={handleImageChange} required />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="image-preview" />
            )}
            <button type="submit">Post For Re-use</button>
          </form>
        )}
      </div>
    </div>

    {/* RIGHT COLUMN: Recommendations */}
   


<aside className="recommendations-panel sticky">
  <h2>Recommended for You</h2>
  <div className="recommendations-scroll">
    {recommendations.length === 0 ? (
      <p style={{ color: '#777', fontSize: '12px' }}>No recommendations yet.</p>
    ) : (
      recommendations.map((rec) => (
        <div key={rec.item_id} className="recommendation-card">
          <img
            src={`http://localhost:5000/api/items/${rec.item_id}/image`}
            alt={rec.title}
          />
          <h3>{rec.title}</h3>
          <p>{rec.description}</p>
        </div>
      ))
    )}
  </div>
</aside>



  </div>
);
};

export default ItemList;