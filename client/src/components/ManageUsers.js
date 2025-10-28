import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/ManageUsers.css';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const columns = ['id', 'full_name', 'email', 'phone_number', 'location'];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleView = (id) => alert(`View user ${id}`);
  const handleEdit = (id) => alert(`Edit user ${id}`);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${id}`);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleBlock = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/users/${id}/block`);
      fetchUsers();
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  const handleUnblock = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/users/${id}/unblock`);
      fetchUsers();
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
  };

  const filteredUsers = users.filter((user) =>
    Object.values(user).some(
      (value) =>
        typeof value === 'string' &&
        value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="manage-users-container">
      <h2>Manage Users</h2>

      <input
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      <table className="user-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id || `${user.email}-${user.phone_number}`}>
              {columns.map((col) => (
                <td key={`${user.id}-${col}`}>
                  {col === 'location' && user[col]
                    ? `${user[col].lat}, ${user[col].lng}`
                    : typeof user[col] === 'object' && user[col] !== null
                    ? JSON.stringify(user[col])
                    : user[col]}
                </td>
              ))}
              <td>
                <button onClick={() => handleView(user.id)}>View</button>
                <button onClick={() => handleEdit(user.id)}>Edit</button>
                <button onClick={() => handleDelete(user.id)}>Delete</button>
                {user.status === 'active' ? (
                  <button onClick={() => handleBlock(user.id)}>Block</button>
                ) : (
                  <button onClick={() => handleUnblock(user.id)}>Unblock</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageUsers;