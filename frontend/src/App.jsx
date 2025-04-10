import React, { useState, useEffect } from 'react';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';

function App() {
  const [token, setToken] = useState(null);

  // При запуске проверяем наличие токена в localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) setToken(storedToken);
  }, []);

  // После входа сохраняем токен
  const handleLogin = (authToken) => {
    localStorage.setItem('authToken', authToken);
    setToken(authToken);
  };

  // Обработка выхода
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
  };

  return (
    <div className="App">
      {token ? (
        <Dashboard token={token} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
