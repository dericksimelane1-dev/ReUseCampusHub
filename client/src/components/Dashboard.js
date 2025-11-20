import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  // ✅ Use absolute paths from public folder
  const images = [
    '/images/slide1.jpg',
    '/images/slide2.jpg',
    '/images/slide3.jpg',
    '/images/slide4.jpg',
    '/images/slide5.jpg'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  const nextSlide = () => setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  const prevSlide = () => setCurrentIndex((prevIndex) => prevIndex === 0 ? images.length - 1 : prevIndex - 1);

  const handleNavigation = (path) => navigate(path);

  return (
    <div className="dashboard-container">
      

      {/* Header */}
      <header className="dashboard-header">
        <h1>ReuseCampus Hub</h1>
        <p className="tagline">Empowering Sustainability Through Student Exchange</p>
      </header>

      {/* Intro */}
      <section className="intro-section">
        <p>
          Welcome to your campus sustainability hub! ReuseCampus helps students exchange, donate reusable items like textbooks, electronics, clothing, and furniture. Save money, reduce waste, and earn eco-points while making a difference.
        </p>
      </section>

      {/* Features */}
      <section className="features-section">
        <h2>Key Features</h2>
        <ul>
          <li>📍 <strong>Geolocation</strong> for nearby exchanges</li>
          <li>🎯 <strong>AI-powered recommendations</strong> based on your interaction and interests</li>
          <li>💬 <strong>In-app messaging</strong> for smooth communication</li>
          <li>🏆 <strong>Eco-points rewards</strong> to incentivize participation</li>
        </ul>
      </section>

      {/* Slider */}
      <section className="slider-section">
        <div className="slider-container">
          <button className="slider-btn prev" onClick={prevSlide}>❮</button>
          <img src={images[currentIndex]} alt={`Slide ${currentIndex + 1}`} className="slider-image" />
          <button className="slider-btn next" onClick={nextSlide}>❯</button>
        </div>
      </section>

      

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>Contact Us: support@reusecampushub.com</p>
        <p>Follow Us: <a href="https://web.facebook.com/ReuseCampusHub" target="_blank" rel="noopener noreferrer">Facebook</a></p>
        <p>Privacy Policy: <a href="/documents/ReuseCampusHub_Privacy_Policy.docx" target="_blank" rel="noopener noreferrer">View Document</a></p>
        <p>Terms of Service: <a href="/documents/ReuseCampusHub_Terms_Conditions.docx" target="_blank" rel="noopener noreferrer">View Document</a></p>
        <p>ReuseCampus © {new Date().getFullYear()} | Building a Greener Future Together</p>
      </footer>
    </div>
  );
};

export default Dashboard;