import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
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
        // Backend'den gelen hata mesajlarını göster
        if (err.response.data.errors) {
          // Validation hataları
          const errorMessages = Object.values(err.response.data.errors).flat().join(', ');
          setError(errorMessages || 'Kayıt başarısız');
        } else if (err.response.data.message) {
          setError(err.response.data.message);
        } else if (Array.isArray(err.response.data)) {
          // Identity hataları
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
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2>Kayıt Ol</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Ad:</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Soyad:</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Şifre:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>
          Kayıt Ol
        </button>
      </form>
      <p style={{ marginTop: '15px', textAlign: 'center' }}>
        Zaten hesabınız var mı? <a href="/login">Giriş Yap</a>
      </p>
    </div>
  );
};

export default Register;

