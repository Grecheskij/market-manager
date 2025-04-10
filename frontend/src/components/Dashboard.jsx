import React, { useState, useEffect } from 'react';
import './Dashboard.css';

function Dashboard({ token, onLogout }) {
  const [spots, setSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [filter, setFilter] = useState('all');
  const [floor, setFloor] = useState(1);
  const [darkMode, setDarkMode] = useState(true);

  const [formData, setFormData] = useState({
    status: 'free', name: '', phone: '', startDate: '', endDate: ''
  });

  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/spots', {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        if (res.ok) {
          const data = await res.json();
          setSpots(data);
        } else console.error('Не удалось получить список мест');
      } catch (error) {
        console.error('Ошибка при получении мест:', error);
      }
    };
    fetchSpots();
  }, [token]);

  const openSpotModal = (spot) => {
    setSelectedSpot(spot);
    setFormData({
      status: spot.status,
      name: spot.tenant?.name || '',
      phone: spot.tenant?.phone || '',
      startDate: spot.tenant?.startDate?.substring(0, 10) || '',
      endDate: spot.tenant?.endDate?.substring(0, 10) || ''
    });
  };

  const closeModal = () => setSelectedSpot(null);

  const handleSave = async () => {
    if (!selectedSpot) return;
    try {
      const res = await fetch(`http://localhost:5000/api/spots/${selectedSpot._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const updatedSpot = await res.json();
        setSpots(spots.map(s => s._id === updatedSpot._id ? updatedSpot : s));
        closeModal();
      } else {
        console.error('Ошибка при сохранении места');
      }
    } catch (error) {
      console.error('Ошибка запроса сохранения:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'free': return '#c8e6c9';
      case 'reserved': return '#fff9c4';
      case 'rented': return '#ffcdd2';
      default: return '#eeeeee';
    }
  };

  // Фильтрация мест по статусу
  const filteredSpots = spots.filter(s => {
    const isOnCurrentFloor = floor === 1 ? s.number <= 200 : s.number > 200;
    const matchesFilter = filter === 'all' || s.status === filter;
    return isOnCurrentFloor && matchesFilter;
  });

  // Подсчёт количества свободных, зарезервированных и арендованных мест
  const countSpotsByStatus = (status) => {
    return spots.filter(spot => spot.status === status && (floor === 1 ? spot.number <= 200 : spot.number > 200)).length;
  };

  const freeSpots = countSpotsByStatus('free');
  const reservedSpots = countSpotsByStatus('reserved');
  const rentedSpots = countSpotsByStatus('rented');

  const date = new Date().toLocaleDateString();

  return (
    <div className={`dashboard ${darkMode ? 'dark-theme' : ''}`}>
      <div className="navbar">
        <div className="market-title">Рынок Алтын Арман</div>
        <div className="user-info">
          <span>Пользователь: admin</span>
          <span>{date}</span>
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? 'Светлая тема' : 'Тёмная тема'}
          </button>
          <button onClick={onLogout}>Выйти</button>
        </div>
      </div>

      <div className="controls">
        <div>
          <strong>Фильтр: </strong>
          {['all', 'free', 'reserved', 'rented'].map(type => (
            <button key={type} onClick={() => setFilter(type)}>{type}</button>
          ))}
        </div>
        <div>
          <strong>Этаж: </strong>
          {[1, 2].map(n => (
            <button key={n} onClick={() => setFloor(n)} disabled={n === floor}>{n} этаж</button>
          ))}
        </div>
        <div>
          <strong>Занятые: </strong> {rentedSpots} <br />
          <strong>Зарезервированные: </strong> {reservedSpots} <br />
          <strong>Свободные: </strong> {freeSpots}
        </div>
      </div>

      <h2>Карта рынка — Этаж {floor}</h2>
      <div className="grid" style={{ marginBottom: '60px' }}>
        {Array.from({ length: 10 }).map((_, row) => (
          <div className="row" key={row}>
            {Array.from({ length: 20 }).map((_, col) => {
              const number = (floor === 1 ? 0 : 200) + row * 20 + col + 1;
              const spot = spots.find(s => s.number === number);
              const visible = filteredSpots.some(s => s.number === number);

              return (
                <div
                  key={col}
                  className="cell"
                  style={{
                    backgroundColor: getStatusColor(spot ? spot.status : 'free'),
                    visibility: visible ? 'visible' : 'hidden'
                  }}
                  onClick={() => visible && spot && openSpotModal(spot)}
                >
                  {number}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {selectedSpot && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Место №{selectedSpot.number}</h3>
            <label>Статус: </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="free">свободно</option>
              <option value="reserved">зарезервировано</option>
              <option value="rented">арендовано</option>
            </select>

            {formData.status !== 'free' && (
              <>
                <label>Арендатор (ФИО): </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <label>Телефон: </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <label>Дата начала аренды: </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
                <label>Дата окончания аренды: </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </>
            )}
            <div className="modal-actions">
              <button onClick={handleSave}>Сохранить</button>
              <button onClick={closeModal}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
