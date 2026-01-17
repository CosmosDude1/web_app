import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { projectService } from '../services/projectService';
import Navbar from '../components/Navbar';

const ProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      const fetchProject = async () => {
        try {
          const project = await projectService.getById(id);
          setFormData({
            name: project.name,
            description: project.description || '',
            startDate: project.startDate.split('T')[0],
            endDate: project.endDate ? project.endDate.split('T')[0] : ''
          });
        } catch (err) {
          setError('Proje yüklenirken hata oluştu');
        }
      };
      fetchProject();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit) {
        await projectService.update(id, formData);
      } else {
        await projectService.create(formData);
      }
      navigate('/projects');
    } catch (err) {
      setError(err.response?.data?.message || 'İşlem başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container animate-fade-in" style={{ maxWidth: '700px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link to="/projects" style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.5rem' }}>
            ← Projelere Dön
          </Link>
          <h1 style={{ margin: 0, fontSize: '1.875rem' }}>{isEdit ? 'Proje Düzenle' : 'Yeni Proje Oluştur'}</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Proje bilgilerini aşağıdan düzenleyebilirsin.</p>
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
                Proje Adı <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Projenin adını girin"
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
                placeholder="Proje hakkında kısa bir açıklama yazın..."
                style={{ resize: 'vertical', minHeight: '100px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Başlangıç Tarihi <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Hedef Bitiş Tarihi
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
                {loading ? 'Kaydediliyor...' : (isEdit ? 'Değişiklikleri Kaydet' : 'Proje Oluştur')}
              </button>
              <button
                type="button"
                onClick={() => navigate('/projects')}
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

export default ProjectForm;
