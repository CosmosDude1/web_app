import React, { useState, useEffect } from 'react';
import { taskService } from '../services/taskService';
import Navbar from '../components/Navbar';

const Calendar = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const startDate = new Date(selectedDate);
        startDate.setMonth(startDate.getMonth() - 1);
        const endDate = new Date(selectedDate);
        endDate.setMonth(endDate.getMonth() + 1);

        const data = await taskService.getByDateRange(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        );
        setTasks(data);
      } catch (err) {
        setError('Görevler yüklenirken hata oluştu');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [selectedDate]);

  const getTasksForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => {
      const taskStart = task.startDate.split('T')[0];
      const taskEnd = task.dueDate ? task.dueDate.split('T')[0] : taskStart;
      return dateStr >= taskStart && dateStr <= taskEnd;
    });
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

  const renderCalendar = () => {
    const currentDate = new Date(selectedDate);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

    // Boş hücreler (ayın ilk gününden önce)
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} style={{ padding: '10px' }}></div>);
    }

    // Ayın günleri
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayTasks = getTasksForDate(date);
      const isToday = date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];

      days.push(
        <div
          key={day}
          style={{
            border: '1px solid #ddd',
            padding: '10px',
            minHeight: '100px',
            backgroundColor: isToday ? '#e3f2fd' : 'white'
          }}
        >
          <div style={{ fontWeight: isToday ? 'bold' : 'normal', marginBottom: '5px' }}>
            {day}
          </div>
          <div style={{ fontSize: '11px' }}>
            {dayTasks.slice(0, 3).map(task => (
              <div
                key={task.id}
                style={{
                  backgroundColor: getStatusColor(task.status),
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  marginBottom: '2px',
                  fontSize: '10px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
                title={task.title}
              >
                {task.title}
              </div>
            ))}
            {dayTasks.length > 3 && (
              <div style={{ fontSize: '10px', color: '#6c757d', marginTop: '2px' }}>
                +{dayTasks.length - 3} daha
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '10px' }}>
          {dayNames.map(day => (
            <div key={day} style={{ padding: '10px', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f8f9fa' }}>
              {day}
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {days}
        </div>
      </div>
    );
  };

  const changeMonth = (direction) => {
    const currentDate = new Date(selectedDate);
    currentDate.setMonth(currentDate.getMonth() + direction);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ padding: '20px' }}>Yükleniyor...</div>
      </>
    );
  }

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  const currentDate = new Date(selectedDate);
  const monthName = monthNames[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  return (
    <>
      <Navbar />
      <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>Takvim</h1>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={() => changeMonth(-1)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ← Önceki Ay
            </button>
            <h2 style={{ margin: 0, minWidth: '200px', textAlign: 'center' }}>
              {monthName} {year}
            </h2>
            <button
              onClick={() => changeMonth(1)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Sonraki Ay →
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ marginRight: '10px' }}>Tarih Seç:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>

        {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          {renderCalendar()}
        </div>

        <div style={{ marginTop: '30px' }}>
          <h3>Görev Listesi</h3>
          {tasks.length === 0 ? (
            <div style={{ color: '#6c757d' }}>Seçili tarih aralığında görev yok.</div>
          ) : (
            <div style={{ display: 'grid', gap: '10px' }}>
              {tasks.map(task => (
                <div
                  key={task.id}
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
                    <div style={{ fontWeight: 'bold' }}>{task.title}</div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>
                      {new Date(task.startDate).toLocaleDateString('tr-TR')} - {task.dueDate ? new Date(task.dueDate).toLocaleDateString('tr-TR') : 'Bitiş tarihi yok'}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      backgroundColor: getStatusColor(task.status),
                      color: 'white',
                      fontSize: '12px'
                    }}
                  >
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Calendar;

