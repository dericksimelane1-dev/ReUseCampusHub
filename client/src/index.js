import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AdminApp from './AdminApp';


const root = ReactDOM.createRoot(document.getElementById('root'));

const token = localStorage.getItem('token');

// If admin-token, load AdminApp; otherwise, load App
if (token === 'admin-token') {
  root.render(<AdminApp />);
} else {
  root.render(<App />);
}