import React, { type ReactNode, useEffect } from 'react';
import './styles/global.css';
import Header from './components/Header';
import { useAuthStore } from './stores/authStore';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { validateToken } = useAuthStore();

  useEffect(() => {
    // Validate token on app startup
    validateToken();
  }, [validateToken]);

  return (
    <div className="main-layout">
      <Header/>
      <main className="container my-4">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;