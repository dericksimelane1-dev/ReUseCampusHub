import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../styles/Signup.css';

// Fix default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function LocationPicker({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return null;
}

function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone_number: '',
    interests: '',
    location: null,
  });

  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhoneNumber = (number) => /^0\d{9}$/.test(number);

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'full_name':
      if (!value.trim()) {
       error = 'Full name is required.';
        } else if (value.trim().length < 5) {
       error = 'Full name must be at least 5 characters long.';
      }
      break;
      case 'email':
        if (!validateEmail(value)) error = 'Invalid email format.';
        break;
      case 'password':
        if (!value.trim()) {
           error = 'Password is required.';
        } else if (!validatePassword(value)) {
          error = 'Password must be at least 8 characters, include uppercase, lowercase, number, and special character.';
        }
      break;
      case 'phone_number':
        if (!validatePhoneNumber(value)) error = 'Phone must be 10 digits starting with 0.';
        break;
      case 'interests':
        if (!value) error = 'Please select your interests.';
        break;
      default:
        break;
    }
    return error;
  };

  const validatePassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d@$!%*?&^#(){}[\]<>.,;:'"~`|\\/-]{8,}$/;
  return regex.test(password);
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const handleLocationSelect = (latlng) => {
    setFormData({ ...formData, location: latlng });
    if (!latlng) {
      setErrors({ ...errors, location: 'Please select your location.' });
    } else {
      setErrors({ ...errors, location: '' });
    }
  };

  useEffect(() => {
    const allValid =
      formData.full_name &&
      validateEmail(formData.email) &&
      formData.password &&
      validatePhoneNumber(formData.phone_number) &&
      formData.interests &&
      formData.location &&
      Object.values(errors).every((err) => err === '');
    setIsFormValid(allValid);
  }, [formData, errors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');

    if (!isFormValid) return;

    try {
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      setSuccess('Signup successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setErrors({ ...errors, submit: err.message });
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="full_name"
          placeholder="Full Name"
          value={formData.full_name}
          onChange={handleChange}
        />
        {errors.full_name && <p className="error">{errors.full_name}</p>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <p className="error">{errors.email}</p>}

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />
        {errors.password && <p className="error">{errors.password}</p>}

        <input
          type="text"
          name="phone_number"
          placeholder="Phone Number"
          value={formData.phone_number}
          onChange={handleChange}
        />
        {errors.phone_number && <p className="error">{errors.phone_number}</p>}

        <select
          name="interests"
          value={formData.interests}
          onChange={handleChange}
        >
          <option value="">Select Your Interests</option>
          <option value="Electronics">Electronics</option>
          <option value="Clothes">Clothes</option>
          <option value="Textbooks">Textbooks</option>
          <option value="Furniture">Furniture</option>
        </select>
        {errors.interests && <p className="error">{errors.interests}</p>}

        <div className="map-section">
          <label>Select Your Location:</label>
          <MapContainer
            center={[-25.7697, 29.4648]} // Middelburg, Mpumalanga
            zoom={13}
            style={{ height: '300px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <LocationPicker onLocationSelect={handleLocationSelect} />
            {formData.location && <Marker position={formData.location} />}
          </MapContainer>
        </div>
        {errors.location && <p className="error">{errors.location}</p>}

        <button type="submit" disabled={!isFormValid}>
          Register
        </button>
        {errors.submit && <p className="error">{errors.submit}</p>}
        {success && <p className="success">{success}</p>}
      </form>
      <div className="signup-links">
        <Link to="/login">Already have an account? Login</Link>
      </div>
    </div>
  );
}

export default Signup;