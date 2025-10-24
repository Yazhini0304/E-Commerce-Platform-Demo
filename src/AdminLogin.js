import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'password123';

const AdminLogin = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      onLoginSuccess();
      navigate('/admin-orders');
    } else {
      setError('Invalid username or password. Use: admin / password123');
      setPassword('');
    }
  };

 
  const styles = {
    pageContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
    },
    card: {
      width: '100%',
      maxWidth: '400px',
      backgroundColor: '#fff',
      padding: '40px',
      borderRadius: '15px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
    },
    heading: {
      fontSize: '28px',
      fontWeight: '800',
      color: '#3123e9ff',
      marginBottom: '20px',
      borderBottom: '2px solid #3123e9ff',
      paddingBottom: '10px',
    },
    label: {
      textAlign: 'left',
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '5px',
      display: 'block',
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      marginBottom: '15px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '15px',
      outline: 'none',
      transition: '0.3s',
    },
    inputFocus: {
      borderColor: '#3123e9ff',
      boxShadow: '0 0 0 3px rgba(220, 38, 38, 0.2)',
    },
    button: {
      width: '100%',
      backgroundColor: '#3123e9ff',
      color: '#fff',
      padding: '12px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: '0.3s',
    },
    buttonHover: {
      backgroundColor: '#3123e9ff',
    },
    errorBox: {
      backgroundColor: '#fee2e2',
      color: '#3123e9ff',
      padding: '8px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      border: '1px solid #fecaca',
      marginBottom: '10px',
    },
  };

  
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState('');

  return (
    <div style={styles.pageContainer}>
      <div style={styles.card}>
        <h3 style={styles.heading}>Admin Panel Access</h3>

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Username</label>
          <input
            type="text"
            value={username}
            onFocus={() => setFocus('username')}
            onBlur={() => setFocus('')}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              ...styles.input,
              ...(focus === 'username' ? styles.inputFocus : {}),
            }}
            required
          />

          <label style={styles.label}>Password</label>
          <input
            type="password"
            value={password}
            onFocus={() => setFocus('password')}
            onBlur={() => setFocus('')}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              ...styles.input,
              ...(focus === 'password' ? styles.inputFocus : {}),
            }}
            required
          />

          {error && <p style={styles.errorBox}>{error}</p>}

          <button
            type="submit"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
              ...styles.button,
              ...(hover ? styles.buttonHover : {}),
            }}
          >
            Log In Securely
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
