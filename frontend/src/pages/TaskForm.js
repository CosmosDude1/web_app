import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const TaskForm = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!id;
  const projectIdFromQuery = searchParams.get('projectId');

  const isAdmin = user?.roles?.includes('Admin');
  const isManager = user?.roles?.includes('Yönetici');
  const canAssignUsers = isAdmin || isManager;

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    priority: 'Medium',
    status: 0,
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
          const priorityStringMap = { 0: 'Low', 1: 'Medium', 2: 'High', 3: 'Critical' };
          const statusMap = { 'ToDo': 0, 'InProgress': 1, 'InReview': 2, 'Completed': 3, 'Cancelled': 4 };
          setFormData({
            title: task.title,
            description: task.description || '',
            startDate: task.startDate.split('T')[0],
            dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
            priority: priorityStringMap[task.priority] || 'Medium',
            status: typeof task.status === 'number' ? task.status : (statusMap[task.status] || 0),
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
      const priorityMap = { 'Low': 0, 'Medium': 1, 'High': 2, 'Critical': 3 };
      const submitData = {
        title: formData.title,
        description: formData.description || null,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString(),
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        priority: priorityMap[formData.priority] !== undefined ? priorityMap[formData.priority] : 1,
        projectId: parseInt(formData.projectId),
        assignedToUserIds: formData.assignedToUserIds || []
      };

      if (isEdit) {
        const updateData = { ...submitData, status: formData.status !== undefined ? formData.status : 0 };
        await taskService.update(id, updateData);
      } else {
        await taskService.create(submitData);
      }
      navigate('/tasks');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.title?.[0] || err.response?.data?.errors ? JSON.stringify(err.response.data.errors) : err.message || 'İşlem başarısız';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container animate-fade-in" style={{ maxWidth: '800px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link to="/tasks" style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.5rem' }}>
            ← Görevlere Dön
          </Link>
          <h1 style={{ margin: 0, fontSize: '1.875rem' }}>{isEdit ? 'Görev Düzenle' : 'Yeni Görev Oluştur'}</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Görev detaylarını aşağıdan düzenleyebilirsin.</p>
        </div>
        
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                Görev Başlığı <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Görevi kısa ve net tanımlayın"
                required
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                Açıklama
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Görevle ilgili detayları buraya yazabilirsiniz..."
                style={{ resize: 'vertical', minHeight: '100px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Proje <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <select name="projectId" value={formData.projectId} onChange={handleChange} required>
                  <option value="">Proje Seçin</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Öncelik
                </label>
                <select name="priority" value={formData.priority} onChange={handleChange}>
                  <option value="Low">🟢 Düşük</option>
                  <option value="Medium">🟡 Orta</option>
                  <option value="High">🟠 Yüksek</option>
                  <option value="Critical">🔴 Kritik</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Başlangıç Tarihi <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Bitiş Tarihi
                </label>
                <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} />
              </div>
            </div>

            {canAssignUsers && (
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                  Görevi Ata
                </label>
                <div style={{ 
                  border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '1rem', 
                  maxHeight: '200px', 
                  overflowY: 'auto',
                  backgroundColor: 'var(--background)'
                }}>
                  {users.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>Kullanıcı yükleniyor...</div>
                  ) : (
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      {users.map(userItem => (
                        <label
                          key={userItem.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0.75rem 1rem',
                            cursor: 'pointer',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: (formData.assignedToUserIds || []).includes(userItem.id) ? 'rgba(99, 102, 241, 0.1)' : 'white',
                            border: `1px solid ${(formData.assignedToUserIds || []).includes(userItem.id) ? 'var(--primary)' : 'var(--border)'}`,
                            transition: 'all 0.2s'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={(formData.assignedToUserIds || []).includes(userItem.id)}
                            onChange={() => handleUserToggle(userItem.id)}
                            style={{ marginRight: '12px', width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                          <div style={{ 
                            width: '32px', height: '32px', borderRadius: '50%', 
                            backgroundColor: 'var(--primary)', color: 'white', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            fontSize: '0.75rem', fontWeight: '700', marginRight: '12px' 
                          }}>
                            {userItem.fullName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{userItem.fullName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{userItem.email}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
                {loading ? 'Kaydediliyor...' : (isEdit ? 'Değişiklikleri Kaydet' : 'Görev Oluştur')}
              </button>
              <button
                type="button"
                onClick={() => navigate('/tasks')}
                className="btn"
                style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default TaskForm;
