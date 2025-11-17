import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/NavbarAdmin.css';

/**
 * NavbarAdmin component
 *
 * Renders the administrator navigation bar with a heading/logo, links to
 * admin pages, and a logout button.
 *
 * Behavior:
 * - Uses react-router's useNavigate (expected to be imported in the module)
 *   to navigate to the root path ('/') when logging out.
 * - handleLogout removes the 'token' entry from localStorage and performs a
 *   hard reload via window.location.reload() to ensure application state is reset.
 *
 * Structure:
 * - A <nav> element with a logo/heading and an unordered list of navigation items:
 *   - Link to "/analysis"
 *   - Link to "/ManageUsers"
 *   - Link to "/exchangeHistory"
 *   - A logout <button> that invokes handleLogout
 *
 * Notes:
 * - The component does not accept any props.
 * - Assumes Link and useNavigate from react-router are available in scope.
 *
 * @component
 * @returns {JSX.Element} The admin navigation bar JSX element.
 */
const NavbarAdmin = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
   // window.dispatchEvent(new Event('storage')); // Trigger auth re-check
    navigate('/');
    window.location.reload(); // ✅ Ensures state resets
  };

  return (
    <nav className="navbar-admin">
      {/* My heading and logo*/}
            <div className="navbar-logo">
              <h2>Administrator</h2>
              
            </div>

      <ul>
        <li><Link to="/analysis">Analysis</Link></li>
        <li><Link to="/ManageUsers">Manage Users</Link></li>
        <li><Link to="/exchangeHistory">Exchange History</Link></li>
        <li><button onClick={handleLogout} className="logout-button">Logout</button></li>
      </ul>
    </nav>
  );
};

export default NavbarAdmin;