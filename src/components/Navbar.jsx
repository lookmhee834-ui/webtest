import React, { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon, Compass } from 'lucide-react';

export default function Navbar({ currentTab, setCurrentTab, showAdminTab }) {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('journal_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('journal_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const allNavItems = [
    { id: 'home', label: 'หน้าแรก' },
    { id: 'travel', label: 'บันทึกการเดินทาง' },
    { id: 'gallery', label: 'คลังรูปภาพ' },
    { id: 'articles', label: 'บทความ' },
    { id: 'art', label: 'งานศิลปะ' },
    { id: 'admin', label: 'ระบบหลังบ้าน' }
  ];

  const navItems = allNavItems.filter(item => item.id !== 'admin' || showAdminTab);

  return (
    <header className="header-nav">
      <div className="nav-container">
        <div 
          className="nav-logo" 
          onClick={() => setCurrentTab('home')} 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <Compass className="animate-fade" size={28} color="var(--accent-terracotta)" />
        </div>

        {/* Desktop Navigation Links */}
        <div className="nav-links-desktop" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`nav-link ${currentTab === item.id ? 'active' : ''}`}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="nav-actions">
          <button 
            className="btn-icon" 
            onClick={toggleTheme} 
            title={theme === 'light' ? 'โหมดมืด' : 'โหมดสว่าง'}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <button 
            className="btn-icon mobile-menu-toggle" 
            onClick={() => setIsOpen(!isOpen)}
            style={{ display: 'none' }}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile nav overlay */}
      {isOpen && (
        <div 
          className="mobile-nav-menu animate-fade"
          style={{
            position: 'fixed',
            top: 'var(--header-height)',
            left: 0,
            right: 0,
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border-color)',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            zIndex: 999
          }}
        >
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentTab(item.id);
                setIsOpen(false);
              }}
              className={`nav-link ${currentTab === item.id ? 'active' : ''}`}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '1.1rem',
                fontFamily: 'inherit',
                width: '100%',
                padding: '0.5rem 0'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop {
            display: none !important;
          }
          .mobile-menu-toggle {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
}
