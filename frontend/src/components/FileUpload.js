import React, { useState } from 'react';
import api from '../services/api';

const FileUpload = ({ taskId, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Lütfen bir dosya seçin');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      await api.post(`/attachments/${taskId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFile(null);
      if (onUploadSuccess) {
        onUploadSuccess();
      }
      alert('Dosya başarıyla yüklendi');
    } catch (err) {
      setError('Dosya yüklenirken hata oluştu');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h4>Dosya Yükle</h4>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="file"
          onChange={handleFileChange}
          disabled={uploading}
          style={{ flex: 1, padding: '8px' }}
        />
        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: uploading || !file ? 'not-allowed' : 'pointer'
          }}
        >
          {uploading ? 'Yükleniyor...' : 'Yükle'}
        </button>
      </div>
      {error && <div style={{ color: 'red', marginTop: '10px', fontSize: '14px' }}>{error}</div>}
    </div>
  );
};

export default FileUpload;

