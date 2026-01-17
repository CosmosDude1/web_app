import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { taskService } from '../services/taskService';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const isAdmin = user?.roles?.includes('Admin');
  const isManager = user?.roles?.includes('Yönetici');
  const canCreateTask = isAdmin || isManager;

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await taskService.getAll();
        setTasks(data);
      } catch (err) {
        setError('Görevler yüklenirken hata oluştu');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ToDo': return <span className="badge">Yapılacak</span>;
      case 'InProgress': return <span className="badge badge-info">Devam Ediyor</span>;
      case 'InReview': return <span className="badge badge-warning">İncelemede</span>;
      case 'Completed': return <span className="badge badge-success">Tamamlandı</span>;
      case 'Cancelled': return <span className="badge badge-danger">İptal</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Low': return <span style={{ color: 'var(--success)', fontWeight: '700', fontSize: '0.75rem' }}>● Düşük</span>;
      case 'Medium': return <span style={{ color: 'var(--warning)', fontWeight: '700', fontSize: '0.75rem' }}>● Orta</span>;
      case 'High': return <span style={{ color: 'var(--danger)', fontWeight: '700', fontSize: '0.75rem' }}>● Yüksek</span>;
      case 'Critical': return <span style={{ color: 'var(--danger)', fontWeight: '800', fontSize: '0.75rem', textDecoration: 'underline' }}>● Kritik</span>;
      default: return <span>{priority}</span>;
    }
  };

  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === filter);

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

  return (
    <>
      <Navbar />
      <div className="container animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.875rem' }}>Görevler</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Tüm görevleri ve durumlarını takip et.</p>
          </div>
          {canCreateTask && (
            <Link to="/tasks/new" className="btn btn-primary">
              + Yeni Görev
            </Link>
          )}
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginBottom: '2rem', 
          overflowX: 'auto', 
          paddingBottom: '0.5rem',
          borderBottom: '1px solid var(--border)'
        }}>
          {[
            { id: 'all', label: 'Tümü' },
            { id: 'ToDo', label: 'Yapılacak' },
            { id: 'InProgress', label: 'Devam Eden' },
            { id: 'InReview', label: 'İncelemede' },
            { id: 'Completed', label: 'Tamamlanan' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding: '0.5rem 1.25rem',
                backgroundColor: filter === f.id ? 'var(--primary)' : 'transparent',
                color: filter === f.id ? 'white' : 'var(--text-muted)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.875rem',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '2rem' }}>
            {error}
          </div>
        )}

        {filteredTasks.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <h3>Görev bulunamadı</h3>
            <p>Seçili kriterlere uygun görev bulunmuyor.</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
                <tr>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Görev</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Proje</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Durum</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Öncelik</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Bitiş Tarihi</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map(task => (
                  <tr key={task.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} className="table-row">
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <Link to={`/tasks/${task.id}`} style={{ fontWeight: '600', color: 'var(--text-main)', display: 'block' }}>
                        {task.title}
                      </Link>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: #{task.id}</span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <Link to={`/projects/${task.projectId}`} style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>
                        {task.projectName}
                      </Link>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      {getStatusBadge(task.status)}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      {getPriorityBadge(task.priority)}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString('tr-TR') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <style>{`
        .table-row:hover { background-color: #f8fafc; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};

export default Tasks;
