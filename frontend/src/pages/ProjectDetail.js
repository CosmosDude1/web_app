import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import Navbar from '../components/Navbar';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectData, tasksData] = await Promise.all([
          projectService.getById(id),
          taskService.getAll()
        ]);
        setProject(projectData);
        setTasks(tasksData.filter(task => task.projectId === parseInt(id)));
      } catch (err) {
        setError('Veri yüklenirken hata oluştu');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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

  if (error || !project) {
    return (
      <>
        <Navbar />
        <div style={{ padding: '20px' }}>
          <div style={{ color: 'red' }}>{error || 'Proje bulunamadı'}</div>
          <Link to="/projects">Projelere Dön</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>{project.name}</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link
              to={`/projects/${id}/edit`}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px'
              }}
            >
              Düzenle
            </Link>
            <Link
              to={`/tasks/new?projectId=${id}`}
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px'
              }}
            >
              + Yeni Görev
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px' }}>
          <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
            <h3>Proje Bilgileri</h3>
            {project.description && (
              <p style={{ marginBottom: '15px' }}>{project.description}</p>
            )}
            <div style={{ fontSize: '14px', color: '#6c757d' }}>
              <div><strong>Başlangıç Tarihi:</strong> {new Date(project.startDate).toLocaleDateString('tr-TR')}</div>
              {project.endDate && (
                <div><strong>Bitiş Tarihi:</strong> {new Date(project.endDate).toLocaleDateString('tr-TR')}</div>
              )}
              <div><strong>Durum:</strong> 
                <span
                  style={{
                    marginLeft: '10px',
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
              <div><strong>Oluşturan:</strong> {project.createdByUserName}</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
            <h3>İstatistikler</h3>
            <div style={{ fontSize: '14px' }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>Toplam Görev:</strong> {tasks.length}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Tamamlanan:</strong> {tasks.filter(t => t.status === 'Completed').length}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Devam Eden:</strong> {tasks.filter(t => t.status === 'InProgress').length}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2>Görevler ({tasks.length})</h2>
          {tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
              Bu projede henüz görev yok.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '10px' }}>
              {tasks.map(task => (
                <div
                  key={task.id}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '15px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <Link
                      to={`/tasks/${task.id}`}
                      style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}
                    >
                      {task.title}
                    </Link>
                    {task.description && (
                      <p style={{ margin: '5px 0', color: '#6c757d', fontSize: '14px' }}>
                        {task.description.length > 100
                          ? `${task.description.substring(0, 100)}...`
                          : task.description}
                      </p>
                    )}
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>
                      <span>Durum: {task.status}</span>
                      {task.dueDate && (
                        <span style={{ marginLeft: '15px' }}>
                          Bitiş: {new Date(task.dueDate).toLocaleDateString('tr-TR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProjectDetail;

