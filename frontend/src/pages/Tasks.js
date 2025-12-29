import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { taskService } from '../services/taskService';
import Navbar from '../components/Navbar';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

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

  const getStatusColor = (status) => {
    const colors = {
      'ToDo': '#6c757d',
      'InProgress': '#007bff',
      'InReview': '#ffc107',
      'Completed': '#28a745',
      'Cancelled': '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusText = (status) => {
    const texts = {
      'ToDo': 'Yapılacak',
      'InProgress': 'Devam Ediyor',
      'InReview': 'İncelemede',
      'Completed': 'Tamamlandı',
      'Cancelled': 'İptal Edildi'
    };
    return texts[status] || status;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': '#28a745',
      'Medium': '#ffc107',
      'High': '#fd7e14',
      'Critical': '#dc3545'
    };
    return colors[priority] || '#6c757d';
  };

  const getPriorityText = (priority) => {
    const texts = {
      'Low': 'Düşük',
      'Medium': 'Orta',
      'High': 'Yüksek',
      'Critical': 'Kritik'
    };
    return texts[priority] || priority;
  };

  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === filter);

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
          <h1>Görevler</h1>
          <Link
            to="/tasks/new"
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

        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '8px 16px',
              backgroundColor: filter === 'all' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Tümü
          </button>
          <button
            onClick={() => setFilter('ToDo')}
            style={{
              padding: '8px 16px',
              backgroundColor: filter === 'ToDo' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Yapılacak
          </button>
          <button
            onClick={() => setFilter('InProgress')}
            style={{
              padding: '8px 16px',
              backgroundColor: filter === 'InProgress' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Devam Eden
          </button>
          <button
            onClick={() => setFilter('Completed')}
            style={{
              padding: '8px 16px',
              backgroundColor: filter === 'Completed' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Tamamlanan
          </button>
        </div>

        {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

        {filteredTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
            {filter === 'all' ? 'Henüz görev yok. İlk görevinizi oluşturun!' : 'Bu kategoride görev yok.'}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {filteredTasks.map(task => (
              <div
                key={task.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '20px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, marginBottom: '5px' }}>
                      <Link to={`/tasks/${task.id}`} style={{ color: '#007bff', textDecoration: 'none' }}>
                        {task.title}
                      </Link>
                    </h3>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '10px' }}>
                      Proje: <Link to={`/projects/${task.projectId}`} style={{ color: '#007bff' }}>{task.projectName}</Link>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        backgroundColor: getStatusColor(task.status),
                        color: 'white',
                        fontSize: '12px'
                      }}
                    >
                      {getStatusText(task.status)}
                    </span>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        backgroundColor: getPriorityColor(task.priority),
                        color: 'white',
                        fontSize: '12px'
                      }}
                    >
                      {getPriorityText(task.priority)}
                    </span>
                  </div>
                </div>
                {task.description && (
                  <p style={{ color: '#6c757d', marginBottom: '10px', fontSize: '14px' }}>
                    {task.description.length > 150
                      ? `${task.description.substring(0, 150)}...`
                      : task.description}
                  </p>
                )}
                <div style={{ fontSize: '12px', color: '#6c757d', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  <div>Başlangıç: {new Date(task.startDate).toLocaleDateString('tr-TR')}</div>
                  {task.dueDate && (
                    <div>Bitiş: {new Date(task.dueDate).toLocaleDateString('tr-TR')}</div>
                  )}
                  <div>Oluşturan: {task.createdByUserName}</div>
                  {task.assignedToUserNames && task.assignedToUserNames.length > 0 && (
                    <div>Atanan: {task.assignedToUserNames.join(', ')}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Tasks;

