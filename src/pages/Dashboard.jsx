import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import Header from "../shared/Header";

const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#4aa3ff"];

export default function Dashboard({
  dark,
  setDark,
  apiBase = "http://127.0.0.1:5002",
}) {
  const [metricsHistory, setMetricsHistory] = useState([]);
  const [optimizationCriterion, setOptimizationCriterion] = useState("cost");

  // Fetch system metrics every 2s
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch(`${apiBase}/api/v1/metrics`);
        const data = await res.json();
        setMetricsHistory((prev) => [...prev.slice(-11), data]); // last 12 points
      } catch (err) {
        console.error("Failed to fetch metrics:", err);
      }
    };
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 2000);
    return () => clearInterval(interval);
  }, [apiBase]);

  // KPIs
  const kpis = React.useMemo(() => {
    const latest = metricsHistory[metricsHistory.length - 1] || {};
    const avgCpu = metricsHistory.length
      ? Math.round(metricsHistory.reduce((a, b) => a + b.cpu, 0) / metricsHistory.length)
      : 0;
    const avgMemory = metricsHistory.length
      ? Math.round(metricsHistory.reduce((a, b) => a + b.memory, 0) / metricsHistory.length)
      : 0;
    const avgPower = metricsHistory.length
      ? Math.round(metricsHistory.reduce((a, b) => a + b.power, 0) / metricsHistory.length)
      : 0;

    return {
      cpu: latest.cpu || 0,
      memory: latest.memory || 0,
      power: latest.power || 0,
      avgCpu,
      avgMemory,
      avgPower,
    };
  }, [metricsHistory]);

  // System health status
  const healthStatus = React.useMemo(() => {
    if (kpis.cpu > 80 || kpis.memory > 80) return "⚠️ High Load";
    if (kpis.cpu < 20 && kpis.memory < 20) return "💤 Low Activity";
    return "✅ Healthy";
  }, [kpis]);

  // Resource distribution data for pie chart
  const resourceData = [
    { name: "CPU", value: kpis.cpu, color: "#4aa3ff" },
    { name: "Memory", value: kpis.memory, color: "#58d68d" },
    { name: "Storage", value: 45, color: "#ff8042" },
    { name: "Network", value: 30, color: "#ffbb28" },
  ];

  return (
    <div className="dashboard-container">
      <Header dark={dark} setDark={setDark} />
      
      <div className="dashboard-content">
        <h1>VM Placement Optimization Dashboard</h1>
        <p>Real-time monitoring and optimization of virtual machine placement</p>

        {/* KPI Cards */}
        <div className="grid">
          <div className="card">
            <h3>CPU Usage</h3>
            <div className="kpi-value">{kpis.cpu}%</div>
            <div className="kpi-subtitle">Current: {kpis.cpu}% | Avg: {kpis.avgCpu}%</div>
          </div>
          
          <div className="card">
            <h3>Memory Usage</h3>
            <div className="kpi-value">{kpis.memory}%</div>
            <div className="kpi-subtitle">Current: {kpis.memory}% | Avg: {kpis.avgMemory}%</div>
          </div>
          
          <div className="card">
            <h3>Power Consumption</h3>
            <div className="kpi-value">{kpis.power}W</div>
            <div className="kpi-subtitle">Current: {kpis.power}W | Avg: {kpis.avgPower}W</div>
          </div>
          
          <div className="card">
            <h3>System Health</h3>
            <div className="kpi-value">{healthStatus}</div>
            <div className="kpi-subtitle">Overall Status</div>
          </div>
        </div>

        {/* Real-time Metrics Chart */}
        <div className="grid">
          <div className="card">
            <h3>Real-time Metrics</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metricsHistory}>
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="cpu" stroke="#4aa3ff" strokeWidth={2} name="CPU %" />
                <Line type="monotone" dataKey="memory" stroke="#58d68d" strokeWidth={2} name="Memory %" />
                <Line type="monotone" dataKey="power" stroke="#ff8042" strokeWidth={2} name="Power (W)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3>Resource Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={resourceData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {resourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Health & Resource Breakdown */}
        <div className="grid">
          <div className="card">
            <h3>System Health</h3>
            <div className="health-status">
              {healthStatus}
            </div>
            <div className="health-details">
              <p>CPU: {kpis.cpu}% | Memory: {kpis.memory}% | Power: {kpis.power}W</p>
            </div>
          </div>

          <div className="card">
            <h3>Resource Breakdown</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={metricsHistory.slice(-5)}>
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cpu" fill="#4aa3ff" name="CPU %" />
                <Bar dataKey="memory" fill="#58d68d" name="Memory %" />
                <Bar dataKey="power" fill="#ff8042" name="Power (W)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid">
          <div className="card">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <Link to="/optimize" className="btn btn-primary">
                Run Optimization
              </Link>
              <Link to="/ml-comparison" className="btn btn-secondary">
                ML Model Comparison
              </Link>
              <Link to="/simulate-ml" className="btn btn-secondary">
                ML Simulation
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-container {
          min-height: 100vh;
          padding: 20px;
        }

        .dashboard-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-content h1 {
          text-align: center;
          margin-bottom: 10px;
          color: #ecf0f1;
        }

        .dashboard-content p {
          text-align: center;
          margin-bottom: 30px;
          color: #bdc3c7;
        }

        .kpi-value {
          font-size: 2.5rem;
          font-weight: bold;
          color: #4aa3ff;
          margin: 10px 0;
        }

        .kpi-subtitle {
          color: #95a5a6;
          font-size: 0.9rem;
        }

        .health-status {
          font-size: 2rem;
          font-weight: bold;
          text-align: center;
          margin: 20px 0;
        }

        .health-details {
          text-align: center;
          color: #95a5a6;
        }

        .action-buttons {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          text-decoration: none;
          font-weight: bold;
          transition: all 0.3s ease;
          display: inline-block;
        }

        .btn-primary {
          background-color: #4aa3ff;
          color: white;
        }

        .btn-primary:hover {
          background-color: #357abd;
          transform: translateY(-2px);
        }

        .btn-secondary {
          background-color: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background-color: #545b62;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}