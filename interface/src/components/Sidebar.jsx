import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSidebar } from '../contexts/SidebarContext';
import logoImg from '../assets/logoelet.png';

export default function Sidebar({ userEmail, initials }) {
  const { isOpen, toggleSidebar } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('is_profile_complete');
    navigate('/auth');
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
      <div className="sidebar-header">
        <Link to="/" className="logo logo-img-wrap">
          <img src={logoImg} alt="ELITEFIT" className="logo-img" />
          <span className="logo-text">ELITEFI<span>T</span></span>
        </Link>
        <button className="sidebar-close" onClick={toggleSidebar} aria-label={isOpen ? 'Réduire le menu' : 'Développer le menu'}>
          <i className={`ph ${isOpen ? 'ph-caret-left' : 'ph-list'}`}></i>
        </button>
      </div>

      <nav className="sidebar-nav">
        <Link to="/chat" className={`nav-item ${isActive('/chat') ? 'active' : ''}`}>
          <span className="ni"><i className="ph ph-chat-circle-text"></i></span>
          <span className="nav-text">Chat</span>
        </Link>
        <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
          <span className="ni"><i className="ph ph-chart-bar"></i></span>
          <span className="nav-text">Dashboard</span>
        </Link>
        <Link to="/profile" className={`nav-item ${isActive('/profile') ? 'active' : ''}`}>
          <span className="ni"><i className="ph ph-user"></i></span>
          <span className="nav-text">Profil</span>
        </Link>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{initials || userEmail?.charAt(0).toUpperCase() || '?'}</div>
          <div className="user-details">
            <span>{userEmail || 'Chargement...'}</span>
            <span className="user-plan">Plan Gratuit</span>
          </div>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          <i className="ph ph-sign-out"></i>
          <span className="logout-text">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
