import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navTo = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <h1 className="nav-logo" onClick={() => navTo('/dashboard')} style={{ cursor: 'pointer' }}>
          🛣️ Road Maintenance
        </h1>
        {user && (
          <>
            <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              ☰
            </button>
            <div className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
              <div className="nav-links">
                <button className="nav-link" onClick={() => navTo('/dashboard')}>
                  Dashboard
                </button>
                <button className="nav-link" onClick={() => navTo('/roads')}>
                  Roads
                </button>
                <button className="nav-link" onClick={() => navTo('/damage-reports')}>
                  Reports
                </button>
                <button className="nav-link" onClick={() => navTo('/maintenance')}>
                  Maintenance
                </button>
                <button className="nav-link" onClick={() => navTo('/map')}>
                  Map
                </button>
              </div>
              <div className="nav-user">
                <span className="user-info">
                  {user.username} • {user.role}
                </span>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
