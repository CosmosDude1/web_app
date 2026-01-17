import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import Navbar from '../components/Navbar';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--background)' }}>
        <div className="animate-fade-in" style={{ textAlign: 'center' }}>
          <div style={{ border: '4px solid var(--border)', borderTop: '4px solid var(--primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p style={{ fontWeight: '500', color: 'var(--text-muted)' }}>Yükleniyor...</p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const projectStatusData = {
    labels: stats?.projectStatusStats?.map(s => s.status) || [],
    datasets: [
      {
        label: 'Proje Sayısı',
        data: stats?.projectStatusStats?.map(s => s.count) || [],
        backgroundColor: [
          'rgba(99, 102, 241, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(100, 116, 139, 0.7)',
        ],
        borderRadius: 6,
      },
    ],
  };

  const taskStatusData = {
    labels: stats?.taskStatusStats?.map(s => s.status) || [],
    datasets: [
      {
        data: stats?.taskStatusStats?.map(s => s.count) || [],
        backgroundColor: [
          'rgba(99, 102, 241, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(239, 68, 68, 0.7)',
        ],
        hoverOffset: 4,
      },
    ],
  };

  return (
    <>
      <Navbar />
      <div className="container animate-fade-in">
        <header style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Genel Bakış</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Hoş geldin, <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{user?.firstName}</span>! İşte projelerindeki son durum.</p>
        </header>

        <div className="grid-4">
          <div className="card stat-card">
            <span className="stat-label">Toplam Proje</span>
            <span className="stat-value">{stats?.totalProjects || 0}</span>
          </div>
          <div className="card stat-card">
            <span className="stat-label">Toplam Görev</span>
            <span className="stat-value" style={{ color: 'var(--info)' }}>{stats?.totalTasks || 0}</span>
          </div>
          <div className="card stat-card">
            <span className="stat-label">Tamamlanan</span>
            <span className="stat-value" style={{ color: 'var(--success)' }}>{stats?.completedTasks || 0}</span>
          </div>
          <div className="card stat-card">
            <span className="stat-label">Devam Eden</span>
            <span className="stat-value" style={{ color: 'var(--warning)' }}>{stats?.inProgressTasks || 0}</span>
          </div>
        </div>

        <div className="grid-2" style={{ marginTop: '2.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Proje Durum Dağılımı</h3>
            <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
              {stats?.projectStatusStats && <Bar data={projectStatusData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />}
            </div>
          </div>
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Görev Durum Dağılımı</h3>
            <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
              {stats?.taskStatusStats && <Doughnut data={taskStatusData} options={{ maintainAspectRatio: false }} />}
            </div>
          </div>
        </div>

        <div className="grid-2" style={{ marginTop: '2.5rem', alignItems: 'start' }}>
          {/* Yaklaşan Görevler */}
          <div className="card" style={{ padding: '0' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Yaklaşan Görevler</h3>
            </div>
            <div style={{ padding: '0.5rem' }}>
              {stats?.upcomingTasks && stats.upcomingTasks.length > 0 ? (
                stats.upcomingTasks.map(task => (
                  <div key={task.id} style={{ 
                    padding: '1rem', 
                    borderRadius: 'var(--radius-sm)', 
                    margin: '0.5rem',
                    transition: 'background 0.2s'
                  }} className="hover-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <a href={`/tasks/${task.id}`} style={{ fontWeight: '600', color: 'var(--text-main)' }}>{task.title}</a>
                      <span className={`badge ${task.priority === 'High' ? 'badge-danger' : 'badge-warning'}`}>{task.priority}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem' }}>
                      <span>📂 {task.projectName}</span>
                      <span>📅 {new Date(task.dueDate).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Yakın zamanda bitişi olan görev yok.</div>
              )}
            </div>
          </div>

          {/* Son Aktiviteler */}
          <div className="card" style={{ padding: '0' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Son Aktiviteler</h3>
            </div>
            <div style={{ padding: '0.5rem' }}>
              {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                stats.recentActivities.map(activity => (
                  <div key={activity.id} style={{ 
                    padding: '1rem', 
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--background)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem'
                    }}>👤</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.9rem', margin: 0 }}>
                        <span style={{ fontWeight: '600' }}>{activity.userName}</span> {activity.description}
                      </p>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(activity.createdAt).toLocaleString('tr-TR')}
                        </span>
                        {activity.taskId && <a href={`/tasks/${activity.taskId}`} style={{ fontSize: '0.75rem' }}>Görevi Görüntüle</a>}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Henüz aktivite bulunmuyor.</div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .hover-item:hover { background-color: var(--background); }
      `}</style>
    </>
  );
};

export default Dashboard;
