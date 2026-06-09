import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSidebar } from '../contexts/SidebarContext';
import { authApi } from '../services/api';
import Sidebar from './Sidebar';
import ToastContainer from './Toast';

export default function AppLayout() {
  const [userEmail, setUserEmail] = useState('');
  const [userInitials, setUserInitials] = useState('?');
  const { isOpen, toggleSidebar } = useSidebar();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authApi.getMe();
        setUserEmail(data.email);
        const initials = ((data.first_name?.[0] || '') + (data.last_name?.[0] || '')).toUpperCase();
        setUserInitials(initials || data.email?.charAt(0).toUpperCase() || '?');
      } catch {
        navigate('/auth');
      }
    };
    fetchUser();
  }, [navigate]);

  return (
    <div className="app-shell">
      <Sidebar userEmail={userEmail} initials={userInitials} />
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={toggleSidebar}></div>
      <Outlet context={{ userEmail }} />
      <ToastContainer />
    </div>
  );
}
