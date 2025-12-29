import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      backgroundColor: '#343a40',
      padding: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: 'white'
    }}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
          Görev Yönetim Sistemi
        </Link>
        <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
        <Link to="/projects" style={{ color: 'white', textDecoration: 'none' }}>Projeler</Link>
        <Link to="/tasks" style={{ color: 'white', textDecoration: 'none' }}>Görevler</Link>
        <Link to="/calendar" style={{ color: 'white', textDecoration: 'none' }}>Takvim</Link>
      </div>
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <span>{user?.firstName} {user?.lastName}</span>
        <button
          onClick={handleLogout}
          style={{
            padding: '5px 15px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Çıkış
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

