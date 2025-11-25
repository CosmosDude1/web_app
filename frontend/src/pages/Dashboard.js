import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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
    return <div>Yükleniyor...</div>;
  }

  const projectStatusData = {
    labels: stats?.projectStatusStats?.map(s => s.status) || [],
    datasets: [
      {
        label: 'Proje Durumu',
        data: stats?.projectStatusStats?.map(s => s.count) || [],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
    ],
  };

  const taskStatusData = {
    labels: stats?.taskStatusStats?.map(s => s.status) || [],
    datasets: [
      {
        label: 'Görev Durumu',
        data: stats?.taskStatusStats?.map(s => s.count) || [],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>
      <p>Hoş geldiniz, {user?.firstName} {user?.lastName}!</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
          <h3>Toplam Proje</h3>
          <p style={{ fontSize: '2em', fontWeight: 'bold' }}>{stats?.totalProjects || 0}</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
          <h3>Toplam Görev</h3>
          <p style={{ fontSize: '2em', fontWeight: 'bold' }}>{stats?.totalTasks || 0}</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
          <h3>Tamamlanan Görevler</h3>
          <p style={{ fontSize: '2em', fontWeight: 'bold' }}>{stats?.completedTasks || 0}</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
          <h3>Devam Eden Görevler</h3>
          <p style={{ fontSize: '2em', fontWeight: 'bold' }}>{stats?.inProgressTasks || 0}</p>
        </div>
      </div>

      <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        <div>
          <h3>Proje Durumu Dağılımı</h3>
          {stats?.projectStatusStats && <Bar data={projectStatusData} />}
        </div>
        <div>
          <h3>Görev Durumu Dağılımı</h3>
          {stats?.taskStatusStats && <Bar data={taskStatusData} />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;




