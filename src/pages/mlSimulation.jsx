import React, { useState } from "react";

export default function MLSimulation({ apiBase = "http://localhost:5002" }) {
  const [simulation, setSimulation] = useState(null);
  const [mlResult, setMLResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = async () => {
    setLoading(true);
    setMLResult(null);
    // 1. Fetch random VM sample from backend
    const vmRes = await fetch(`${apiBase}/api/v1/simulate_vm`);
    const vmSample = await vmRes.json();
    setSimulation(vmSample);

    // 2. Send to ML predict endpoint
    const predRes = await fetch(`${apiBase}/api/v1/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vmSample)
    });
    const pred = await predRes.json();
    setMLResult(pred.host || pred.predicted_host || JSON.stringify(pred));
    setLoading(false);
  };

  return (
    <div className="App" style={{ minHeight: '100vh', padding: 0 }}>
      <div className="card" style={{ maxWidth: 480, margin: '48px auto', textAlign: 'left' }}>
        <h2 style={{ color: '#4aa3ff', marginBottom: 16 }}>ML VM Placement Simulation</h2>
        <p style={{ color: '#ecf0f1', fontSize: 16, marginBottom: 24 }}>
          Simulate a virtual machine and let the ML model suggest the best host in real time.
        </p>
        <button
          onClick={handleSimulate}
          disabled={loading}
          style={{
            background: 'linear-gradient(90deg,#4aa3ff,#00C49F)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 18,
            border: 'none',
            borderRadius: 8,
            padding: '12px 28px',
            margin: '18px 0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? "Predicting..." : "Simulate & Place VM"}
        </button>
        {simulation && (
          <div className="card" style={{ background: 'rgba(74,163,255,0.08)', margin: '24px 0 0 0', padding: 12 }}>
            <h4 style={{ color: '#00C49F', marginBottom: 8 }}>Simulated VM</h4>
            <pre style={{ fontSize: 15, color: '#ecf0f1', background: 'none', border: 'none', margin: 0 }}>{JSON.stringify(simulation, null, 2)}</pre>
          </div>
        )}
        {mlResult && (
          <div className="card" style={{ background: 'rgba(0,196,159,0.08)', margin: '24px 0 0 0', padding: 12, textAlign: 'center' }}>
            <strong style={{ color: '#4aa3ff', fontSize: 18 }}>ML Model Suggests Host:</strong>
            <div style={{ fontSize: 22, color: '#00C49F', marginTop: 8 }}>{mlResult}</div>
          </div>
        )}
      </div>
    </div>
  );
}
