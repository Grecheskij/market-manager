import React, { useState } from 'react';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Обработчик отправки формы входа
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (response.ok) {
        const data = await response.json();
        onLogin(data.token);  // передаем полученный токен вверх в App
      } else {
        alert('Неверный логин или пароль');
      }
    } catch (error) {
      console.error('Ошибка при попытке входа:', error);
      alert('Ошибка соединения с сервером');
    }
  };

  return (
    <div className="login-container">
      <h2>Вход администратора</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Логин:</label><br />
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required 
          />
        </div>
        <div>
          <label>Пароль:</label><br />
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>
        <button type="submit">Войти</button>
      </form>
    </div>
  );
}

export default Login;
