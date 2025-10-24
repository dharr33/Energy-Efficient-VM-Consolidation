import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Header({ dark, setDark }) {
  const location = useLocation();
  
  return (
    <div className="header-container">
      <div className="header-content">
        <div className="logo">
          <h2>🚀 VM Placement Optimization</h2>
        </div>
        
        <nav className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/optimize" 
            className={`nav-link ${location.pathname === '/optimize' ? 'active' : ''}`}
          >
            Optimize
          </Link>
          <Link 
            to="/ml-comparison" 
            className={`nav-link ${location.pathname === '/ml-comparison' ? 'active' : ''}`}
          >
            ML Comparison
          </Link>
          <Link 
            to="/simulate-ml" 
            className={`nav-link ${location.pathname === '/simulate-ml' ? 'active' : ''}`}
          >
            ML Simulation
          </Link>
        </nav>
        
        <div className="header-actions">
          <button 
            className="btn btn-secondary" 
            onClick={() => setDark && setDark(d => !d)}
          >
            {dark ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .header-container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          padding: 0 20px;
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          padding: 15px 0;
        }

        .logo h2 {
          color: #ecf0f1;
          margin: 0;
          font-size: 1.5rem;
        }

        .nav-links {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .nav-link {
          padding: 10px 20px;
          border-radius: 6px;
          text-decoration: none;
          color: #bdc3c7;
          font-weight: 500;
          transition: all 0.3s ease;
          border: 1px solid transparent;
        }

        .nav-link:hover {
          color: #ecf0f1;
          background: rgba(74, 163, 255, 0.1);
          border-color: rgba(74, 163, 255, 0.3);
        }

        .nav-link.active {
          color: #4aa3ff;
          background: rgba(74, 163, 255, 0.2);
          border-color: rgba(74, 163, 255, 0.5);
        }

        .header-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .btn-secondary {
          background: rgba(108, 117, 125, 0.3);
          color: #ecf0f1;
          border: 1px solid rgba(108, 117, 125, 0.5);
        }

        .btn-secondary:hover {
          background: rgba(108, 117, 125, 0.5);
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 15px;
          }

          .nav-links {
            flex-wrap: wrap;
            justify-content: center;
            gap: 10px;
          }

          .nav-link {
            padding: 8px 16px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}


