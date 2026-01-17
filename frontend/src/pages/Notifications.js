import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import Navbar from '../components/Navbar';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await notificationService.getAll();
        setNotifications(data);
      } catch (err) {
        setError('Bildirimler yüklenirken hata oluştu');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const getNotificationTypeInfo = (type) => {
    const types = {
      'TaskAssigned': { text: 'Görev Atandı', color: 'var(--primary)', icon: '📌' },
      'TaskUpdated': { text: 'Görev Güncellendi', color: 'var(--warning)', icon: '🔄' },
      'TaskCompleted': { text: 'Görev Tamamlandı', color: 'var(--success)', icon: '✅' },
      'ProjectUpdated': { text: 'Proje Güncellendi', color: 'var(--info)', icon: '📁' },
      'CommentAdded': { text: 'Yorum Eklendi', color: 'var(--secondary)', icon: '💬' },
      'Other': { text: 'Bildirim', color: 'var(--secondary)', icon: '🔔' }
    };
    return types[type] || { text: type, color: 'var(--secondary)', icon: '🔔' };
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
          <div style={{ border: '4px solid var(--border)', borderTop: '4px solid var(--primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
        </div>
      </>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      <Navbar />
      <div className="container animate-fade-in" style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.875rem' }}>Bildirimler</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Tüm aktivitelerden haberdar ol.</p>
          </div>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              Hepsini Okundu Yap
            </button>
          )}
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '2rem' }}>
            {error}
          </div>
        )}

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <h3>Bildirim bulunmuyor</h3>
              <p>Henüz bir bildirim almadınız.</p>
            </div>
          ) : (
            <div>
              {notifications.map(notification => {
                const info = getNotificationTypeInfo(notification.type);
                return (
                  <div
                    key={notification.id}
                    onClick={() => {
                      if (!notification.isRead) handleMarkAsRead(notification.id);
                      if (notification.taskId) window.location.href = `/tasks/${notification.taskId}`;
                      else if (notification.projectId) window.location.href = `/projects/${notification.projectId}`;
                    }}
                    style={{
                      padding: '1.5rem',
                      backgroundColor: notification.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.03)',
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      gap: '1.25rem',
                      position: 'relative'
                    }}
                    className="notification-item"
                  >
                    {!notification.isRead && (
                      <div style={{
                        position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: 'var(--primary)'
                      }}></div>
                    )}
                    
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '12px',
                      backgroundColor: notification.isRead ? 'var(--background)' : 'white',
                      border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
                      flexShrink: 0,
                      boxShadow: notification.isRead ? 'none' : 'var(--shadow-sm)'
                    }}>
                      {info.icon}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: notification.isRead ? '600' : '700' }}>
                          {notification.title}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {new Date(notification.createdAt).toLocaleString('tr-TR')}
                        </span>
                      </div>
                      
                      <p style={{ margin: '0.25rem 0 0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                        {notification.message}
                      </p>

                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <span style={{ 
                          fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', 
                          color: info.color, backgroundColor: 'var(--background)',
                          padding: '2px 8px', borderRadius: '4px', border: `1px solid ${info.color}44`
                        }}>
                          {info.text}
                        </span>
                        {notification.taskTitle && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: '500' }}>
                            📌 {notification.taskTitle}
                          </span>
                        )}
                        {notification.projectName && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: '500' }}>
                            📁 {notification.projectName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <style>{`
        .notification-item:hover { background-color: var(--background) !important; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};

export default Notifications;
