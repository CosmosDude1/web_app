import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'User',
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      console.error('Register error:', err);
      if (err.response?.data) {
        if (err.response.data.errors) {
          const errorMessages = Object.values(err.response.data.errors).flat().join(', ');
          setError(errorMessages || 'Kayıt başarısız');
        } else if (err.response.data.message) {
          setError(err.response.data.message);
        } else if (Array.isArray(err.response.data)) {
          const errorMessages = err.response.data.map(e => e.description || e.code).join(', ');
          setError(errorMessages || 'Kayıt başarısız');
        } else {
          setError('Kayıt başarısız');
        }
      } else {
        setError(err.message || 'Kayıt başarısız');
      }
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
      padding: '40px 20px'
    }}>
      <div className="card animate-fade-in" style={{ 
        width: '100%', 
        maxWidth: '500px', 
        padding: '2.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            backgroundColor: 'var(--primary)', 
            color: 'white', 
            width: '48px', 
            height: '48px', 
            borderRadius: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '1.5rem', 
            fontWeight: '800',
            margin: '0 auto 1rem'
          }}>TF</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Yeni Hesap Oluştur</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>TaskFlow ailesine katıl ve yönetmeye başla.</p>
        </div>

        {error && (
          <div style={{ 
            backgroundColor: '#fee2e2', 
            color: '#991b1b', 
            padding: '0.75rem', 
            borderRadius: 'var(--radius-sm)', 
            fontSize: '0.85rem', 
            marginBottom: '1.5rem',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Ad</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Örn: Arda"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Soyad</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Örn: Meydan"
                required
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>E-posta Adresi</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@company.com"
              required
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Şifre</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Rol Seçimi</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="User">Çalışan (User)</option>
              <option value="Yönetici">Yönetici</option>
              <option value="Admin">Admin</option>
            </select>
            <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              * Admin tüm yetkilere, Yönetici proje/görev yönetimine erişebilir.
            </p>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', backgroundColor: '#10b981' }}>
            Hesabı Oluştur
          </button>
        </form>

        <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Zaten bir hesabın var mı? <Link to="/login" style={{ fontWeight: '600' }}>Giriş Yap</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
