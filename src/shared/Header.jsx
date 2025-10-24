import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Header({ dark, setDark }) {
  const location = useLocation();
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <nav style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Link to="/" className="btn-primary" style={{ textDecoration: 'none' }}>Dashboard</Link>
        <Link to="/optimize" className="btn-primary" style={{ textDecoration: 'none' }}>Optimize</Link>
      </nav>
      <button className="btn-primary" onClick={() => setDark(d => !d)}>{dark ? 'Light Mode' : 'Dark Mode'}</button>
    </div>
  );
}


