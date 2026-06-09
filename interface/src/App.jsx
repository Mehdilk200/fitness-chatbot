import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import { SidebarProvider } from './contexts/SidebarContext';
import AppLayout from './components/AppLayout';

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
    <SidebarProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<ProtectedRoute requireProfile={false}><Onboarding theme={theme} toggleTheme={toggleTheme} /></ProtectedRoute>} />
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/chat" element={<Chat theme={theme} toggleTheme={toggleTheme} />} />
            <Route path="/dashboard" element={<Dashboard theme={theme} toggleTheme={toggleTheme} />} />
            <Route path="/profile" element={<Profile theme={theme} toggleTheme={toggleTheme} />} />
          </Route>
        </Routes>
      </Router>
    </SidebarProvider>
  );
}

export default App;
