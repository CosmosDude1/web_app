import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { taskService } from '../services/taskService';
import { attachmentService } from '../services/attachmentService';
import FileUpload from '../components/FileUpload';
import Navbar from '../components/Navbar';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [taskData, attachmentsData] = await Promise.all([
          taskService.getById(id),
          attachmentService.getByTaskId(id).catch(() => [])
        ]);
        setTask(taskData);
        setAttachments(attachmentsData);
      } catch (err) {
        setError('Görev yüklenirken hata oluştu');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleUploadSuccess = async () => {
    try {
      const data = await attachmentService.getByTaskId(id);
      setAttachments(data);
    } catch (err) {
      console.error('Dosyalar yüklenirken hata oluştu:', err);
    }
  };

  const handleDownload = async (attachmentId, fileName) => {
    try {
      const blob = await attachmentService.download(attachmentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Dosya indirilirken hata oluştu');
    }
  };

  const handleDelete = async (attachmentId) => {
    if (!window.confirm('Bu dosyayı silmek istediğinize emin misiniz?')) {
      return;
    }
    try {
      await attachmentService.delete(attachmentId);
      setAttachments(attachments.filter(a => a.id !== attachmentId));
    } catch (err) {
      alert('Dosya silinirken hata oluştu');
    }
  };

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

  const handleStatusChange = async (newStatus) => {
    try {
      await taskService.update(id, { ...task, status: newStatus });
      setTask({ ...task, status: newStatus });
    } catch (err) {
      alert('Durum güncellenirken hata oluştu');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ padding: '20px' }}>Yükleniyor...</div>
      </>
    );
  }

  if (error || !task) {
    return (
      <>
        <Navbar />
        <div style={{ padding: '20px' }}>
          <div style={{ color: 'red' }}>{error || 'Görev bulunamadı'}</div>
          <Link to="/tasks">Görevlere Dön</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>{task.title}</h1>
          <Link
            to={`/tasks/${id}/edit`}
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
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px' }}>
          <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
            <h3>Görev Detayları</h3>
            {task.description && (
              <p style={{ marginBottom: '15px', whiteSpace: 'pre-wrap' }}>{task.description}</p>
            )}
            <div style={{ fontSize: '14px', color: '#6c757d' }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>Proje:</strong> <Link to={`/projects/${task.projectId}`}>{task.projectName}</Link>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Başlangıç Tarihi:</strong> {new Date(task.startDate).toLocaleDateString('tr-TR')}
              </div>
              {task.dueDate && (
                <div style={{ marginBottom: '10px' }}>
                  <strong>Bitiş Tarihi:</strong> {new Date(task.dueDate).toLocaleDateString('tr-TR')}
                </div>
              )}
              <div style={{ marginBottom: '10px' }}>
                <strong>Oluşturan:</strong> {task.createdByUserName}
              </div>
              {task.assignedToUserNames && task.assignedToUserNames.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <strong>Atananlar:</strong> {task.assignedToUserNames.join(', ')}
                </div>
              )}
            </div>
          </div>

          <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
            <h3>Durum ve Öncelik</h3>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>Durum:</strong>
                <div style={{ marginTop: '5px' }}>
                  <span
                    style={{
                      padding: '6px 16px',
                      borderRadius: '12px',
                      backgroundColor: getStatusColor(task.status),
                      color: 'white',
                      fontSize: '14px',
                      display: 'inline-block'
                    }}
                  >
                    {getStatusText(task.status)}
                  </span>
                </div>
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {['ToDo', 'InProgress', 'InReview', 'Completed'].map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={task.status === status}
                      style={{
                        padding: '5px 10px',
                        fontSize: '12px',
                        backgroundColor: task.status === status ? getStatusColor(status) : '#e9ecef',
                        color: task.status === status ? 'white' : '#495057',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: task.status === status ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {getStatusText(status)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <strong>Öncelik:</strong>
                <div style={{ marginTop: '5px' }}>
                  <span
                    style={{
                      padding: '6px 16px',
                      borderRadius: '12px',
                      backgroundColor: getPriorityColor(task.priority),
                      color: 'white',
                      fontSize: '14px',
                      display: 'inline-block'
                    }}
                  >
                    {getPriorityText(task.priority)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '30px' }}>
          <h3>Dosyalar</h3>
          <FileUpload taskId={id} onUploadSuccess={handleUploadSuccess} />
          
          {attachments.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'grid', gap: '10px' }}>
                {attachments.map(attachment => (
                  <div
                    key={attachment.id}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '15px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{attachment.fileName}</div>
                      <div style={{ fontSize: '12px', color: '#6c757d' }}>
                        Yüklenme: {new Date(attachment.uploadedAt).toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleDownload(attachment.id, attachment.fileName)}
                        style={{
                          padding: '5px 15px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        İndir
                      </button>
                      <button
                        onClick={() => handleDelete(attachment.id)}
                        style={{
                          padding: '5px 15px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TaskDetail;

