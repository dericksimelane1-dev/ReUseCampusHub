/**
 * ItemList React component
 *
 * Renders a searchable, filterable list of items available for re-use, allows authenticated
 * users to post new items with a location and image, and displays personalized recommendations.
 *
 * Behaviour and responsibilities:
 * - Fetches all items from the backend API at GET http://localhost:5000/api/items and stores
 *   them in local state.
 * - If a JWT token is present in localStorage, decodes it to obtain the current user id and
 *   interests (via jwtDecode) and fetches recommendations from
 *   GET http://localhost:5001/recommendations using the token in the Authorization header.
 *   Recommendations are deduplicated by item_id and filtered by the user's interests (categories).
 * - Supports searching by keyword (title or description) and filtering by category in the UI.
 * - Supports toggling between a "recent only" view (first 5 results) and a full view sorted
 *   by category.
 * - For each item, displays title, description, exchange condition, poster name, status,
 *   image (via GET http://localhost:5000/api/items/:id/image) and an embedded Google Maps iframe
 *   when a valid location is available (item.location expected to be a JSON string with { lat, lng }).
 * - If the current user is not the owner of an active item, a "Message Owner" button navigates
 *   to /messages/:itemId/:ownerId.
 * - Authenticated users (determined by presence of decoded token id) can post new items via a
 *   multipart/form-data POST to http://localhost:5000/api/items. The form includes:
 *     - title (string)
 *     - description (string)
 *     - location (stringified JSON)
 *     - image (File)
 *     - exchangeCondition (string)
 *     - category (string)
 *   The token is sent in the Authorization header.
 * - Provides an image preview when a file is selected via an <input type="file"> before upload.
 * - Displays success/error messages returned by the backend or produced by client-side validation.
 *
 * State (React useState):
 * - items: Array<Object> - fetched items from the main backend.
 * - recommendations: Array<Object> - fetched and filtered recommendation items.
 * - name: string - input for the new item title.
 * - description: string - input for the new item description.
 * - exchangeCondition: string - input for the new item's exchange conditions.
 * - category: string - selected category for new item (default 'electronics').
 * - location: { lat: number, lng: number } | null - selected geography from MapPicker.
 * - image: File | null - selected image file for upload.
 * - imagePreview: string | null - data URL for previewing the selected image.
 * - userId: string | null - id decoded from JWT; used to determine ownership and posting rights.
 * - messages: { type: 'success' | 'error' | '', text: string } - UI feedback messages.
 * - showRecentOnly: boolean - toggle to show the first 5 items only.
 * - interests: string - (unused in rendering) intended to hold user interests input.
 * - searchKeyword: string - keyword string used to filter items by title/description.
 * - searchCategory: string - category string used to further filter items.
 *
 * Key internal functions:
 * - fetchItems(): Promise<void>
 *   Fetches items from GET /api/items, stores them in `items` state and logs errors to console.
 *
 * - fetchRecommendations(userInterests: Array<string> = []): Promise<void>
 *   Fetches recommendation data from the recommendation service at http://localhost:5001/recommendations.
 *   Requires Authorization: Bearer <token>. Deduplicates results by item_id and filters by the
 *   provided userInterests. Updates `recommendations` state.
 *
 * - handleImageChange(e: Event): void
 *   Reads the selected File from an <input type="file">, stores it in `image` and creates a
 *   data URL for `imagePreview` so the user can preview before upload.
 *
 * - handleSubmit(e: Event): Promise<void>
 *   Handles the posting of a new item. Prevents default form submission, validates presence of
 *   token, userId and location, constructs a FormData payload and POSTs it to /api/items with
 *   Authorization header. On success clears form fields and refetches items; on error sets `messages`.
 *
 * - toggleView(): void
 *   Toggles the `showRecentOnly` boolean to switch list presentation.
 *
 * Rendering:
 * - A search bar (text input + category select).
 * - A recommendations section (if recommendations exist) showing deduplicated recommended items.
 * - The main items list, using `displayedItems` derived from search, category filter and toggle state.
 * - A posting form for authenticated users which includes MapPicker for selecting location,
 *   file input for images and client-side previewing.
 *
 * 
 * - item objects returned by the backend are expected to contain at least:
 *   { id | item_id, title, description, exchange_condition, category, location (JSON string), poster_name, user_id, status }
 * - image endpoints are expected at GET /api/items/:id/image (for both item.id and item.item_id usage).
 * - JWT decoding uses jwtDecode(token) and the decoded token is expected to have { id, interests }.
 * - MapPicker is a child component that calls setLocation({ lat, lng }) when location is selected.
 * - Error handling is conservative: errors are logged and user-facing messages are provided where appropriate.
 *
 * @component
 * @returns {JSX.Element} The ItemList component JSX
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [interests, setInterests] = useState('');
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


useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/items');
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error('Error fetching items:', err);
      }
    };

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
      // Remove duplicates by item_id
      const uniqueItems = Array.from(new Map(result.items.map(item => [item.item_id, item])).values());

      // Filter by user interests (categories)
      const filteredItems = uniqueItems.filter(item =>
        userInterests.includes(item.category)
      );

      // If filtered list is empty, fallback to uniqueItems
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
    <div className="item-list-container">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by keyword..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
        <select value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="clothes">Clothes</option>
          <option value="textbook">Textbooks</option>
          <option value="furniture">furniture</option>
        </select>
      </div>

      {recommendations.length > 0 && (
        <div className="recommendations">
          <h3>Recommended for You</h3>
          <ul className="item-list">
            {recommendations.map(item => (
              <li key={item.item_id} className="item-card">
                <h4>{item.title}</h4>
                <p>{item.description}</p>
                
                <img
                  src={`http://localhost:5000/api/items/${item.item_id}/image`}
                  alt={item.title}
                  className="item-image"
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      <h2>List of available Items</h2>
      <button onClick={toggleView} className="toggle-button">
        {showRecentOnly ? 'Show All Items' : 'Show Recent Items'}
      </button>

     
      <ul className="item-list">
  {displayedItems.map(item => {
    let loc = null;
    try {
      loc = JSON.parse(item.location);
    } catch (e) {
      loc = null;
    }

    const isCompleted = item.status === 'completed';

    return (
      <li key={item.id} className={`item-card ${isCompleted ? 'inactive' : ''}`}>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        <p><strong>Exchange Conditions:</strong> {item.exchange_condition}</p>
        <p><strong>Posted by:</strong> {item.poster_name}</p>
        <p><strong>Status:</strong> {isCompleted ? '✅ Completed' : '🟢 Active'}</p>
        <img
          src={`http://localhost:5000/api/items/${item.id}/image`}
          alt={item.title}
          className="item-image"
        />
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
        {userId !== item.user_id && !isCompleted && (
          <button
            className="messages-button"
            onClick={() => navigate(`/messages/${item.id}/${item.user_id}`)}
          >
            Message Owner
          </button>
        )}
      </li>
    );
  })}
</ul>

      <h2>Post for Re-Use</h2>
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
            <option value="furniture">furniture</option>
          </select>
          <label>Select Location on Map:</label>
          <MapPicker setLocation={setLocation} />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="image-preview" />
          )}
          <button type="submit">Post For Re-user</button>
        </form>
      )}
    </div>
  );
};

export default ItemList;