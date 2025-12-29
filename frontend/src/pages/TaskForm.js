import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';
import Navbar from '../components/Navbar';

const TaskForm = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const projectIdFromQuery = searchParams.get('projectId');

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    priority: 'Medium',
    projectId: projectIdFromQuery ? parseInt(projectIdFromQuery) : '',
    assignedToUserIds: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsData, usersData] = await Promise.all([
          projectService.getAll(),
          userService.getAll()
        ]);
        setProjects(projectsData);
        setUsers(usersData);
      } catch (err) {
        console.error('Veri yüklenemedi:', err);
      }
    };
    fetchData();

    if (isEdit) {
      const fetchTask = async () => {
        try {
          const task = await taskService.getById(id);
          setFormData({
            title: task.title,
            description: task.description || '',
            startDate: task.startDate.split('T')[0],
            dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
            priority: task.priority,
            projectId: task.projectId,
            assignedToUserIds: task.assignedToUserIds || []
          });
        } catch (err) {
          setError('Görev yüklenirken hata oluştu');
        }
      };
      fetchTask();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUserToggle = (userId) => {
    setFormData(prev => {
      const currentIds = prev.assignedToUserIds || [];
      if (currentIds.includes(userId)) {
        return { ...prev, assignedToUserIds: currentIds.filter(id => id !== userId) };
      } else {
        return { ...prev, assignedToUserIds: [...currentIds, userId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit) {
        await taskService.update(id, formData);
      } else {
        await taskService.create(formData);
      }
      navigate('/tasks');
    } catch (err) {
      setError(err.response?.data?.message || 'İşlem başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px' }}>
        <h1>{isEdit ? 'Görev Düzenle' : 'Yeni Görev Oluştur'}</h1>
        
        {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Görev Başlığı *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Açıklama
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Proje *
            </label>
            <select
              name="projectId"
              value={formData.projectId}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="">Proje Seçin</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Öncelik
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="Low">Düşük</option>
              <option value="Medium">Orta</option>
              <option value="High">Yüksek</option>
              <option value="Critical">Kritik</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Başlangıç Tarihi *
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Bitiş Tarihi
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Atanan Kullanıcılar
            </label>
            <div style={{ 
              border: '1px solid #ddd', 
              borderRadius: '4px', 
              padding: '10px', 
              maxHeight: '150px', 
              overflowY: 'auto' 
            }}>
              {users.length === 0 ? (
                <div style={{ color: '#6c757d', fontSize: '14px' }}>Kullanıcı yükleniyor...</div>
              ) : (
                users.map(user => (
                  <label
                    key={user.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '5px 0',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={(formData.assignedToUserIds || []).includes(user.id)}
                      onChange={() => handleUserToggle(user.id)}
                      style={{ marginRight: '8px', cursor: 'pointer' }}
                    />
                    <span>{user.fullName} ({user.email})</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Kaydediliyor...' : (isEdit ? 'Güncelle' : 'Oluştur')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/tasks')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default TaskForm;

