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
    const avgMem = metricsHistory.length
      ? Math.round(metricsHistory.reduce((a, b) => a + b.memory, 0) / metricsHistory.length)
      : 0;
    return [
      { label: "Current CPU", value: `${latest.cpu ?? 0}%` },
      { label: "Current Memory", value: `${latest.memory ?? 0}%` },
      { label: "Current Disk", value: `${latest.disk ?? 0}%` },
      { label: "Avg CPU (12pts)", value: `${avgCpu}%` },
      { label: "Avg Memory (12pts)", value: `${avgMem}%` },
    ];
  }, [metricsHistory]);

  const healthStatus = React.useMemo(() => {
    const latest = metricsHistory[metricsHistory.length - 1] || {};
    if ((latest.cpu ?? 0) < 70 && (latest.memory ?? 0) < 70) return "Healthy ✅";
    if ((latest.cpu ?? 0) < 85 && (latest.memory ?? 0) < 85) return "Warning ⚠";
    return "Critical 🔴";
  }, [metricsHistory]);

  const themeStyle = dark
    ? { backgroundColor: "#1e1e1e", color: "#ecf0f1" }
    : { backgroundColor: "#f7f9fc", color: "#2c3e50" };

  return (
    <div style={{ maxWidth: 1200, margin: 20, padding: 20, ...themeStyle }}>
      <Header dark={dark} setDark={setDark} />
      {/* Optimization Controls at the Top */}
      <div
        className="card"
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          Optimize by:
          <select
            value={optimizationCriterion}
            onChange={(e) => setOptimizationCriterion(e.target.value)}
            style={{ padding: 8, marginLeft: 8 }}
      
            <option value="cost">Cost</option>
            <option value="energy">Energy</option>
            <option value="load">Load</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link className="btn-primary" to="/optimize">
            Go to ML model
          </Link>
          <Link className="btn-primary" to="/optimization-backend">
            Optimization Backend
          </Link>
          <Link className="btn-primary" to="/simulate-ml">
            ML Simulation
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid" style={{ marginTop: 16 }}>
        {kpis.map((k) => (
          <div key={k.label} className="card">
            <div style={{ fontSize: 13, opacity: 0.85 }}>{k.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Trends */}
      <div className="grid" style={{ marginTop: 16 }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>CPU & Memory Trends</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={metricsHistory}>
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="cpu" stroke="#4aa3ff" name="CPU %" />
              <Line type="monotone" dataKey="memory" stroke="#58d68d" name="Memory %" />
              <Line type="monotone" dataKey="disk" stroke="#ff8042" name="Disk %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Objective Mix</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                dataKey="value"
                data={[
                  { name: "Cost", value: optimizationCriterion === "cost" ? 50 : 25 },
                  { name: "Energy", value: optimizationCriterion === "energy" ? 50 : 25 },
                  { name: "Load", value: optimizationCriterion === "load" ? 50 : 25 },
                ]}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {COLORS.map((c, i) => (
                  <Cell key={i} fill={c} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* System Health & Resource Breakdown */}
      <div className="grid" style={{ marginTop: 16 }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>System Health</h3>
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              marginTop: 20,
              textAlign: "center",
            }}
          >
            {healthStatus}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Resource Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={metricsHistory.slice(-5)}>
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cpu" fill="#4aa3ff" name="CPU %" />
              <Bar dataKey="memory" fill="#58d68d" name="Memory %" />
              <Bar dataKey="disk" fill="#ff8042" name="Disk %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
