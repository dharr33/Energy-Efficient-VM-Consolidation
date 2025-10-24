// src/App.js
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Dashboard from './pages/Dashboard';
import Optimize from './pages/Optimize';
import OptimizationBackend from './pages/OptimizationBackend';
import MLSimulation from './pages/mlSimulation';


function App() {
  const [metrics, setMetrics] = useState([
    { time: '10:00', cpu: 40, memory: 55 },
    { time: '10:05', cpu: 50, memory: 70 },
    { time: '10:10', cpu: 30, memory: 60 },
    { time: '10:15', cpu: 60, memory: 80 },
  ]);
  const [dark, setDark] = useState(true);
  const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:5002';

  return (

    <Routes>
      <Route path="/" element={<Dashboard dark={dark} setDark={setDark} metrics={metrics} setMetrics={setMetrics} />} />
      <Route path="/optimize" element={<Optimize dark={dark} setDark={setDark} apiBase={apiBase} />} />
      <Route path="/optimization-backend" element={<OptimizationBackend dark={dark} setDark={setDark} apiBase={apiBase}/>} />
      <Route path="/simulate-ml" element={<MLSimulation dark={dark} setDark={setDark} apiBase={apiBase} />} />

    </Routes>
  );
}
export default App;
