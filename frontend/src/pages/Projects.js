import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../services/projectService';
import Navbar from '../components/Navbar';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const getStatusColor = (status) => {
    const colors = {
      'NotStarted': '#6c757d',
      'InProgress': '#007bff',
      'Completed': '#28a745',
      'OnHold': '#ffc107',
      'Cancelled': '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusText = (status) => {
    const texts = {
      'NotStarted': 'Başlamadı',
      'InProgress': 'Devam Ediyor',
      'Completed': 'Tamamlandı',
      'OnHold': 'Beklemede',
      'Cancelled': 'İptal Edildi'
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ padding: '20px' }}>Yükleniyor...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>Projeler</h1>
          <Link
            to="/projects/new"
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            + Yeni Proje
          </Link>
        </div>

        {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

        {projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
            Henüz proje yok. İlk projenizi oluşturun!
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {projects.map(project => (
              <div
                key={project.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '20px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                  <h3 style={{ margin: 0 }}>
                    <Link to={`/projects/${project.id}`} style={{ color: '#007bff', textDecoration: 'none' }}>
                      {project.name}
                    </Link>
                  </h3>
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      backgroundColor: getStatusColor(project.status),
                      color: 'white',
                      fontSize: '12px'
                    }}
                  >
                    {getStatusText(project.status)}
                  </span>
                </div>
                {project.description && (
                  <p style={{ color: '#6c757d', marginBottom: '10px', fontSize: '14px' }}>
                    {project.description.length > 100
                      ? `${project.description.substring(0, 100)}...`
                      : project.description}
                  </p>
                )}
                <div style={{ fontSize: '12px', color: '#6c757d' }}>
                  <div>Başlangıç: {new Date(project.startDate).toLocaleDateString('tr-TR')}</div>
                  {project.endDate && (
                    <div>Bitiş: {new Date(project.endDate).toLocaleDateString('tr-TR')}</div>
                  )}
                  <div>Oluşturan: {project.createdByUserName}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Projects;

