import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await notificationService.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLinkStyle = (path) => ({
    color: isActive(path) ? 'var(--primary)' : 'var(--text-main)',
    textDecoration: 'none',
    fontWeight: isActive(path) ? '600' : '500',
    fontSize: '0.95rem',
    transition: 'all 0.2s',
    padding: '0.5rem 0.75rem',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: isActive(path) ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
  });

  return (
    <nav style={{
      height: 'var(--navbar-height)',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <Link to="/dashboard" style={{ 
          color: 'var(--primary)', 
          textDecoration: 'none', 
          fontWeight: '800', 
          fontSize: '1.25rem',
          letterSpacing: '-0.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ 
            backgroundColor: 'var(--primary)', 
            color: 'white', 
            padding: '4px 8px', 
            borderRadius: '8px',
            fontSize: '1rem'
          }}>TM</span>
          TaskFlow
        </Link>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Link to="/dashboard" style={navLinkStyle('/dashboard')}>Dashboard</Link>
          <Link to="/projects" style={navLinkStyle('/projects')}>Projeler</Link>
          <Link to="/tasks" style={navLinkStyle('/tasks')}>Görevler</Link>
          <Link to="/calendar" style={navLinkStyle('/calendar')}>Takvim</Link>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
        <Link
          to="/notifications"
          style={{
            color: 'var(--text-main)',
            textDecoration: 'none',
            position: 'relative',
            padding: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--background)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--border)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
        >
          <span style={{ fontSize: '1.2rem' }}>🔔</span>
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                backgroundColor: 'var(--danger)',
                color: 'white',
                borderRadius: '50%',
                minWidth: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: '700',
                border: '2px solid white'
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '12px', borderLeft: '1px solid var(--border)' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)' }}>
              {user?.firstName} {user?.lastName}
            </div>
            {user?.roles && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {user.roles[0]}
              </div>
            )}
          </div>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            fontSize: '0.875rem'
          }}>
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-danger"
            style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
          >
            Çıkış
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
