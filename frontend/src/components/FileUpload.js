import React, { useState, useRef } from 'react';
import api from '../services/api';

const FileUpload = ({ taskId, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError('');
    }
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
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setFile(null);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      setError('Dosya yüklenirken hata oluştu');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '2rem',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: dragActive ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
          transition: 'all 0.2s'
        }}
      >
        <input
          ref={inputRef}
          type="file"
          onChange={handleFileChange}
          disabled={uploading}
          style={{ display: 'none' }}
        />
        <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📁</div>
        <p style={{ color: 'var(--text-main)', fontWeight: '600', marginBottom: '0.25rem' }}>
          {dragActive ? 'Dosyayı buraya bırakın' : 'Dosya yüklemek için tıklayın veya sürükleyin'}
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          PDF, DOCX, JPG, PNG vb. dosyalar desteklenir
        </p>
      </div>

      {file && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          backgroundColor: 'white', 
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '1.5rem' }}>📄</div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{file.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatFileSize(file.size)}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setFile(null)}
              className="btn"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
            >
              İptal
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="btn btn-primary"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
            >
              {uploading ? 'Yükleniyor...' : 'Yükle'}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div style={{ color: 'var(--danger)', marginTop: '0.75rem', fontSize: '0.875rem', padding: '0.5rem', backgroundColor: '#fee2e2', borderRadius: 'var(--radius-sm)' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
