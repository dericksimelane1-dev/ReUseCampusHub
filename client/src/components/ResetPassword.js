import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../styles/ResetPassword.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

  // ✅ Password strength validation
  const validatePassword = (pwd) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d@$!%*?&^#(){}[\]<>.,;:'"~`|\\/-]{8,}$/;
    return regex.test(pwd);
  };

  // ✅ Validate fields live
  const validateFields = () => {
    const newErrors = {};

    if (!token) {
      newErrors.token = 'Invalid or missing token.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (!validatePassword(password)) {
      newErrors.password =
        'Password must be at least 8 characters, include uppercase, lowercase, number, and special character.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  };

  useEffect(() => {
    validateFields();
  }, [password, confirmPassword, token]);

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!isFormValid) return;

    try {
      const response = await fetch('http://localhost:5000/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: decodeURIComponent(token),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Password reset failed');

      setMessage('✅ Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 4000);
    } catch (err) {
      setErrors({ submit: err.message });
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Set a New Password</h2>
      <form onSubmit={handleReset}>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {errors.password && <p className="error-message">{errors.password}</p>}

        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {errors.confirmPassword && (
          <p className="error-message">{errors.confirmPassword}</p>
        )}

        <button type="submit" disabled={!isFormValid}>
          Reset Password
        </button>
      </form>

      {message && <p className="success-message">{message}</p>}
      {errors.submit && <p className="error-message">{errors.submit}</p>}
    </div>
  );
};

export default ResetPassword;