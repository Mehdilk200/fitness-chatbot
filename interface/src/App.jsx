import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/auth" element={<Auth theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/onboarding" element={<ProtectedRoute requireProfile={false}><Onboarding theme={theme} toggleTheme={toggleTheme} /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat theme={theme} toggleTheme={toggleTheme} /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard theme={theme} toggleTheme={toggleTheme} /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile theme={theme} toggleTheme={toggleTheme} /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
