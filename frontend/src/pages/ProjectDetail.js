import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { activityLogService } from '../services/activityLogService';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdmin = user?.roles?.includes('Admin');
  const isManager = user?.roles?.includes('Yönetici');
  const canEditProject = isAdmin || isManager;
  const canCreateTask = isAdmin || isManager;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectData, tasksData, activityData] = await Promise.all([
          projectService.getById(id),
          taskService.getAll(),
          activityLogService.getByProject(id).catch(() => [])
        ]);
        setProject(projectData);
        setTasks(tasksData.filter(task => task.projectId === parseInt(id)));
        setActivityLogs(activityData);
      } catch (err) {
        setError('Veri yüklenirken hata oluştu');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'NotStarted': return <span className="badge">Başlamadı</span>;
      case 'InProgress': return <span className="badge badge-info">Devam Ediyor</span>;
      case 'Completed': return <span className="badge badge-success">Tamamlandı</span>;
      case 'OnHold': return <span className="badge badge-warning">Beklemede</span>;
      case 'Cancelled': return <span className="badge badge-danger">İptal</span>;
      default: return <span className="badge">{status}</span>;
    }
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

  if (error || !project) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <h2 style={{ color: 'var(--danger)' }}>Hata!</h2>
            <p>{error || 'Proje bulunamadı'}</p>
            <Link to="/projects" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Projelere Dön</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <Link to="/projects" style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.5rem' }}>
              ← Projeler Listesi
            </Link>
            <h1 style={{ margin: 0, fontSize: '2.25rem', letterSpacing: '-1px' }}>{project.name}</h1>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {canEditProject && (
              <Link to={`/projects/${id}/edit`} className="btn" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-main)' }}>
                Projeyi Düzenle
              </Link>
            )}
            {canCreateTask && (
              <Link to={`/tasks/new?projectId=${id}`} className="btn btn-primary">
                + Yeni Görev Ekle
              </Link>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>Proje Bilgileri</h3>
            {project.description && (
              <p style={{ marginBottom: '1.5rem', color: 'var(--text-main)', lineHeight: '1.6' }}>{project.description}</p>
            )}
            <div className="grid-2" style={{ gap: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>Başlangıç</span>
                <span style={{ fontWeight: '600' }}>{new Date(project.startDate).toLocaleDateString('tr-TR')}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>Hedef Bitiş</span>
                <span style={{ fontWeight: '600' }}>{project.endDate ? new Date(project.endDate).toLocaleDateString('tr-TR') : '-'}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>Durum</span>
                <div style={{ marginTop: '0.25rem' }}>{getStatusBadge(project.status)}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>Yönetici</span>
                <span style={{ fontWeight: '600' }}>{project.createdByUserName}</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ background: 'var(--primary)', color: 'white' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', color: 'white' }}>Proje Özeti</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Toplam Görev</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '800' }}>{tasks.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Tamamlanan</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#d1fae5' }}>{tasks.filter(t => t.status === 'Completed').length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Devam Eden</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fef3c7' }}>{tasks.filter(t => t.status === 'InProgress').length}</span>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${tasks.length > 0 ? (tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100 : 0}%`, 
                    height: '100%', 
                    backgroundColor: 'white',
                    borderRadius: '4px'
                  }}></div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem', marginTop: '4px', opacity: 0.8 }}>
                  %{tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100) : 0} Tamamlandı
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid-2" style={{ alignItems: 'start' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Görev Listesi ({tasks.length})</h2>
            {tasks.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                Henüz görev eklenmemiş.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {tasks.map(task => (
                  <div key={task.id} className="card" style={{ 
                    padding: '1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderLeft: `4px solid ${task.status === 'Completed' ? 'var(--success)' : 'var(--primary)'}`
                  }}>
                    <div>
                      <Link to={`/tasks/${task.id}`} style={{ fontWeight: '600', color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
                        {task.title}
                      </Link>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem' }}>
                        <span>📅 {task.dueDate ? new Date(task.dueDate).toLocaleDateString('tr-TR') : '-'}</span>
                        <span>🚩 {task.priority}</span>
                      </div>
                    </div>
                    <div>{getStatusBadge(task.status)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Son Proje Aktiviteleri</h2>
            <div className="card" style={{ padding: '0.5rem' }}>
              {activityLogs.length === 0 ? (
                <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Aktivite bulunmuyor.</p>
              ) : (
                activityLogs.map(log => (
                  <div key={log.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.875rem', margin: 0 }}>
                        <span style={{ fontWeight: '600' }}>{log.userName}</span> {log.description}
                      </p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(log.createdAt).toLocaleString('tr-TR')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};

export default ProjectDetail;
