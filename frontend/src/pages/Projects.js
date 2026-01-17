import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdmin = user?.roles?.includes('Admin');
  const isManager = user?.roles?.includes('Yönetici');
  const canCreateProject = isAdmin || isManager;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectService.getAll();
        setProjects(data);
      } catch (err) {
        setError('Projeler yüklenirken hata oluştu');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

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

  return (
    <>
      <Navbar />
      <div className="container animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.875rem' }}>Projeler</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Tüm projeleri buradan yönetebilirsin.</p>
          </div>
          {canCreateProject && (
            <Link to="/projects/new" className="btn btn-primary">
              <span style={{ fontSize: '1.2rem' }}>+</span> Yeni Proje Oluştur
            </Link>
          )}
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '2rem' }}>
            {error}
          </div>
        )}

        {projects.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
            <h3>Henüz proje bulunmuyor</h3>
            <p>Sisteme henüz hiç proje eklenmemiş.</p>
            {canCreateProject && (
              <Link to="/projects/new" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                İlk Projeyi Oluştur
              </Link>
            )}
          </div>
        ) : (
          <div className="grid-4">
            {projects.map(project => (
              <div key={project.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  {getStatusBadge(project.status)}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                    ID: #{project.id}
                  </span>
                </div>
                
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>
                  <Link to={`/projects/${project.id}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                    {project.name}
                  </Link>
                </h3>

                {project.description && (
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem', flex: 1 }}>
                    {project.description.length > 120
                      ? `${project.description.substring(0, 120)}...`
                      : project.description}
                  </p>
                )}

                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Başlangıç:</span>
                    <span style={{ fontWeight: '600' }}>{new Date(project.startDate).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Oluşturan:</span>
                    <span style={{ fontWeight: '600' }}>{project.createdByUserName}</span>
                  </div>
                </div>

                <Link to={`/projects/${project.id}`} className="btn" style={{ 
                  marginTop: '1rem', 
                  width: '100%', 
                  backgroundColor: 'var(--background)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border)'
                }}>
                  Detayları Gör
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};

export default Projects;
