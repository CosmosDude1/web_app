import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { taskService } from '../services/taskService';
import { attachmentService } from '../services/attachmentService';
import { activityLogService } from '../services/activityLogService';
import { useAuth } from '../context/AuthContext';
import { getUserIdFromToken } from '../utils/jwt';
import FileUpload from '../components/FileUpload';
import Navbar from '../components/Navbar';

const TaskDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdmin = user?.roles?.includes('Admin');
  const isManager = user?.roles?.includes('Yönetici');
  const canEditTask = isAdmin || isManager;
  const userId = getUserIdFromToken();
  const isAssignedToUser = task?.assignedToUserIds?.includes(userId) || false;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [taskData, attachmentsData, activityData] = await Promise.all([
          taskService.getById(id),
          attachmentService.getByTaskId(id).catch(() => []),
          activityLogService.getByTask(id).catch(() => [])
        ]);
        setTask(taskData);
        setAttachments(attachmentsData);
        setActivityLogs(activityData);
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ToDo': return <span className="badge">Yapılacak</span>;
      case 'InProgress': return <span className="badge badge-info">Devam Ediyor</span>;
      case 'InReview': return <span className="badge badge-warning">İncelemede</span>;
      case 'Completed': return <span className="badge badge-success">Tamamlandı</span>;
      case 'Cancelled': return <span className="badge badge-danger">İptal</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Low': return <span className="badge badge-success">Düşük</span>;
      case 'Medium': return <span className="badge badge-warning">Orta</span>;
      case 'High': return <span className="badge badge-danger">Yüksek</span>;
      case 'Critical': return <span className="badge badge-danger" style={{ border: '2px solid red' }}>KRİTİK</span>;
      default: return <span className="badge">{priority}</span>;
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      if (!canEditTask) {
        await taskService.update(id, { 
          ...task, 
          status: newStatus,
          assignedToUserIds: task.assignedToUserIds || []
        });
      } else {
        await taskService.update(id, { ...task, status: newStatus });
      }
      setTask({ ...task, status: newStatus });
    } catch (err) {
      alert('Durum güncellenirken hata oluştu');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
          <div style={{ border: '4px solid var(--border)', borderTop: '4px solid var(--primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <Link to="/tasks" style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.5rem' }}>
              ← Görev Listesi
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <h1 style={{ margin: 0, fontSize: '2rem' }}>{task.title}</h1>
              {getPriorityBadge(task.priority)}
            </div>
          </div>
          {canEditTask && (
            <Link to={`/tasks/${id}/edit`} className="btn btn-primary">Düzenle</Link>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '2rem' }}>
          <div>
            <div className="card" style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>Açıklama</h3>
              <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-main)', lineHeight: '1.7' }}>
                {task.description || 'Bu görev için bir açıklama girilmemiş.'}
              </p>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>Dosyalar</h3>
              {(canEditTask || isAssignedToUser) && (
                <div style={{ backgroundColor: 'var(--background)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                  <FileUpload taskId={id} onUploadSuccess={handleUploadSuccess} />
                </div>
              )}
              
              <div style={{ display: 'grid', gap: '1rem' }}>
                {attachments.length > 0 ? (
                  attachments.map(attachment => (
                    <div key={attachment.id} style={{ 
                      padding: '1rem', 
                      borderRadius: 'var(--radius-sm)', 
                      border: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'background 0.2s'
                    }} className="hover-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ fontSize: '1.5rem' }}>📄</div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{attachment.fileName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(attachment.uploadedAt).toLocaleDateString('tr-TR')}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleDownload(attachment.id, attachment.fileName)} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>İndir</button>
                        <button onClick={() => handleDelete(attachment.id)} className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Sil</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>
                    Henüz dosya yüklenmemiş.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="card">
              <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem' }}>Görev Durumu</h3>
              <div style={{ marginBottom: '1.5rem' }}>
                {getStatusBadge(task.status)}
              </div>
              
              {(canEditTask || isAssignedToUser) && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Durumu Güncelle</label>
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {[
                      { id: 'ToDo', label: 'Yapılacak' },
                      { id: 'InProgress', label: 'Devam Ediyor' },
                      { id: 'InReview', label: 'İncelemede' },
                      { id: 'Completed', label: 'Tamamlandı' }
                    ].map(status => (
                      <button
                        key={status.id}
                        onClick={() => handleStatusChange(status.id)}
                        className="btn"
                        style={{
                          backgroundColor: task.status === status.id ? 'var(--primary)' : 'var(--background)',
                          color: task.status === status.id ? 'white' : 'var(--text-main)',
                          border: task.status === status.id ? 'none' : '1px solid var(--border)',
                          justifyContent: 'flex-start',
                          padding: '0.75rem 1rem'
                        }}
                        disabled={task.status === status.id}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem' }}>Detaylar</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Proje:</span>
                  <Link to={`/projects/${task.projectId}`} style={{ fontWeight: '600' }}>{task.projectName}</Link>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Bitiş:</span>
                  <span style={{ fontWeight: '600' }}>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('tr-TR') : '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Oluşturan:</span>
                  <span style={{ fontWeight: '600' }}>{task.createdByUserName}</span>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Atananlar</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {task.assignedToUserNames && task.assignedToUserNames.length > 0 ? (
                    task.assignedToUserNames.map((name, i) => (
                      <div key={i} style={{ 
                        display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px 4px 4px', 
                        backgroundColor: 'var(--background)', borderRadius: '999px', fontSize: '0.8rem', border: '1px solid var(--border)' 
                      }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                          {name.charAt(0)}
                        </div>
                        {name}
                      </div>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Kimse atanmamış.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Aktivite Geçmişi */}
        <div className="card" style={{ marginTop: '2rem', padding: 0 }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.125rem', margin: 0 }}>Aktivite Geçmişi</h3>
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {activityLogs.length > 0 ? (
              activityLogs.map(log => (
                <div key={log.id} style={{ 
                  padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                    <div>
                      <p style={{ fontSize: '0.9rem', margin: 0 }}>
                        <span style={{ fontWeight: '600' }}>{log.userName}</span> {log.description}
                      </p>
                      <span className="badge" style={{ fontSize: '0.65rem', padding: '2px 6px', marginTop: '4px', display: 'inline-block', backgroundColor: 'var(--background)', color: 'var(--text-muted)' }}>
                        {log.action.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(log.createdAt).toLocaleString('tr-TR')}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Henüz aktivite kaydı yok.</p>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .hover-item:hover { background-color: var(--background); }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};

export default TaskDetail;
