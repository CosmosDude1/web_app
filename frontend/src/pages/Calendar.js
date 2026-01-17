import React, { useState, useEffect } from 'react';
import { taskService } from '../services/taskService';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

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
      'ToDo': 'var(--secondary)',
      'InProgress': 'var(--info)',
      'InReview': 'var(--warning)',
      'Completed': 'var(--success)',
      'Cancelled': 'var(--danger)'
    };
    return colors[status] || 'var(--secondary)';
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

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} style={{ padding: '10px', backgroundColor: 'var(--background)', opacity: 0.3 }}></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayTasks = getTasksForDate(date);
      const isToday = date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];

      days.push(
        <div
          key={day}
          style={{
            border: '1px solid var(--border)',
            padding: '12px',
            minHeight: '120px',
            backgroundColor: isToday ? 'rgba(99, 102, 241, 0.05)' : 'white',
            transition: 'all 0.2s',
            position: 'relative'
          }}
          className="calendar-day"
        >
          <div style={{ 
            fontWeight: '700', 
            fontSize: '0.9rem',
            color: isToday ? 'var(--primary)' : 'var(--text-main)',
            marginBottom: '8px',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span style={isToday ? { 
              backgroundColor: 'var(--primary)', 
              color: 'white', 
              width: '24px', 
              height: '24px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '0.75rem'
            } : {}}>{day}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {dayTasks.slice(0, 3).map(task => (
              <Link
                to={`/tasks/${task.id}`}
                key={task.id}
                style={{
                  backgroundColor: getStatusColor(task.status),
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: '600',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  textDecoration: 'none',
                  display: 'block'
                }}
                title={task.title}
              >
                {task.title}
              </Link>
            ))}
            {dayTasks.length > 3 && (
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textAlign: 'center', marginTop: '2px' }}>
                + {dayTasks.length - 3} görev daha
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
          {dayNames.map(day => (
            <div key={day} style={{ 
              padding: '12px', 
              fontWeight: '700', 
              textAlign: 'center', 
              backgroundColor: 'var(--background)',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              textTransform: 'uppercase'
            }}>
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
        <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
          <div style={{ border: '4px solid var(--border)', borderTop: '4px solid var(--primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
        </div>
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
      <div className="container animate-fade-in" style={{ maxWidth: '1200px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.875rem' }}>Takvim</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Görevlerin zaman planlamasını takip et.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', backgroundColor: 'var(--card-bg)', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <button onClick={() => changeMonth(-1)} className="btn" style={{ padding: '0.5rem', minWidth: '40px', backgroundColor: 'var(--background)' }}>←</button>
            <h3 style={{ margin: 0, minWidth: '150px', textAlign: 'center', fontSize: '1.1rem' }}>
              {monthName} {year}
            </h3>
            <button onClick={() => changeMonth(1)} className="btn" style={{ padding: '0.5rem', minWidth: '40px', backgroundColor: 'var(--background)' }}>→</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '2rem', alignItems: 'start' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            {error && <div style={{ color: 'var(--danger)', marginBottom: '1.5rem' }}>{error}</div>}
            {renderCalendar()}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="card">
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Tarih Seç</h3>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ marginBottom: '0.5rem' }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hızlıca bir tarihe gitmek için seçin.</p>
            </div>

            <div className="card" style={{ padding: 0 }}>
              <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1rem', margin: 0 }}>Aylık Liste</h3>
              </div>
              <div style={{ maxHeight: '500px', overflowY: 'auto', padding: '0.5rem' }}>
                {tasks.length === 0 ? (
                  <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Bu ay görev yok.</p>
                ) : (
                  tasks.map(task => (
                    <div key={task.id} style={{ 
                      padding: '1rem', 
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '0.5rem',
                      transition: 'all 0.2s'
                    }} className="hover-item">
                      <Link to={`/tasks/${task.id}`} style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.875rem', display: 'block', marginBottom: '4px' }}>
                        {task.title}
                      </Link>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {new Date(task.startDate).toLocaleDateString('tr-TR')}
                        </span>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getStatusColor(task.status) }}></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .calendar-day:hover { transform: scale(1.02); z-index: 10; box-shadow: var(--shadow-lg); border-color: var(--primary) !important; cursor: pointer; }
        .hover-item:hover { background-color: var(--background); }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};

export default Calendar;
