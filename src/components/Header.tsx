import React from 'react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { navItems } from '../utils/constants';
import { useFileStore } from '../stores/fileStore';

const Header: React.FC = () => {
  const { isLoggedIn, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleNavigation = (item: { label: string; path: string }) => {
    if (item.label === 'Logout') {
      logout();
      useFileStore.getState().clearAllPatterns();
      navigate('/');
    } else {
      navigate(item.path);
    }
  };

  return (
    <header
      className="header shadow-sm"
      style={{
        background: 'linear-gradient(90deg, #e0e7ff 0%, #f0f4ff 100%)',
        borderBottom: '1px solid #e3e8f0',
        padding: '0.5rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}
    >
      <div className="container-fluid px-4">
        <nav className="navbar navbar-light d-flex justify-content-between align-items-center p-0">
          <div className="d-flex align-items-center">
            <div
              className="logo-block d-flex align-items-center justify-content-center me-3"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3B82F6 60%, #60A5FA 100%)',
                boxShadow: '0 2px 8px rgba(59,130,246,0.10)'
              }}
            >
              <svg width="28" height="28" fill="none" viewBox="0 0 28 28">
                <circle cx="14" cy="14" r="14" fill="#fff" fillOpacity="0.7"/>
                <path d="M14 7a4 4 0 0 1 4 4v1h-1v-1a3 3 0 0 0-6 0v1h-1v-1a4 4 0 0 1 4-4Zm-5 5a1 1 0 0 1 1 1v5a4 4 0 0 0 8 0v-5a1 1 0 1 1 2 0v5a6 6 0 0 1-12 0v-5a1 1 0 0 1 1-1Z" fill="#2563EB"/>
              </svg>
            </div>
            <span className="navbar-brand m-0 fw-bold" style={{ fontSize: '1.5rem', color: '#2563EB', letterSpacing: '0.5px' }}>
              Data Mapper Tool
            </span>
          </div>
          {isLoggedIn && (
            <div className="nav-menu-blocks d-flex align-items-center">
              {navItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleNavigation(item)}
                  className="nav-item border-0 px-4 py-2 mx-1 fw-semibold text-white"
                  style={{
                    borderRadius: '999px',
                    fontSize: '1rem',
                    boxShadow: '0 2px 8px rgba(59,130,246,0.08)',
                    transition: 'background 0.2s, color 0.2s',
                    minWidth: '110px',
                    outline: 'none',
                    cursor: 'pointer',
                    background: '#0d6efd',
                    color: '#fff',
                  }}
                  onMouseOver={e => (e.currentTarget.style.background = '#2563EB')}
                  onMouseOut={e => (e.currentTarget.style.background = '#0d6efd')}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
