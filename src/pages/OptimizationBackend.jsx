import React, { useEffect, useState } from "react";

export default function OptimizationBackend({ apiBase = "http://localhost:5002" }) {
  const [hosts, setHosts] = useState([]);
  const [vms, setVMs] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [cpuWeight, setCpuWeight] = useState(0.4);
  const [energyWeight, setEnergyWeight] = useState(0.3);
  const [costWeight, setCostWeight] = useState(0.3);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const hostsRes = await fetch(`${apiBase}/api/v1/hosts`);
        const hostsData = await hostsRes.json();
        setHosts(hostsData);

        const vmsRes = await fetch(`${apiBase}/api/v1/incoming_vms`);
        const vmsData = await vmsRes.json();
        setVMs(vmsData);

        const params = new URLSearchParams({
          cpu: cpuWeight,
          energy: energyWeight,
          cost: costWeight,
        }).toString();

        const placementsRes = await fetch(`${apiBase}/api/v1/placement_results?${params}`);
        const placementsData = await placementsRes.json();
        setPlacements(placementsData);
      } catch (err) {
        console.error("Failed to load optimization backend data", err);
      }
      setLoading(false);
    };

    fetchData();
  }, [apiBase, cpuWeight, energyWeight, costWeight]);

  if (loading) return <div style={{ padding: 32, color: "#fff" }}>Loading optimization data...</div>;

  return (
    <div
      style={{
        padding: 40,
        color: "#fff",
        backgroundColor: "#1e1e2f",
        fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h2 style={{ marginBottom: 24 }}>VM Placement Optimizer</h2>

      <section style={{ marginBottom: 40 }}>
        <h3>Available Hosts</h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 12,
            boxShadow: "0 0 8px rgba(0,0,0,0.4)",
          }}
        >
          <thead style={{ backgroundColor: "#2e2e3f" }}>
            <tr>
              {hosts.length > 0 &&
                Object.keys(hosts[0]).map((key) => (
                  <th
                    key={key}
                    style={{
                      border: "1px solid #444",
                      padding: "12px 16px",
                      textAlign: "left",
                      color: "#9cc4ff",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                    }}
                  >
                    {key.replace(/_/g, " ")}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {hosts.map((host, i) => (
              <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#28293d" : "#232536" }}>
                {Object.values(host).map((val, j) => (
                  <td key={j} style={{ border: "1px solid #444", padding: 12 }}>
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h3>Incoming VMs</h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 12,
            boxShadow: "0 0 8px rgba(0,0,0,0.4)",
          }}
        >
          <thead style={{ backgroundColor: "#2e2e3f" }}>
            <tr>
              {vms.length > 0 &&
                Object.keys(vms[0]).map((key) => (
                  <th
                    key={key}
                    style={{
                      border: "1px solid #444",
                      padding: "12px 16px",
                      textAlign: "left",
                      color: "#9cc4ff",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                    }}
                  >
                    {key.replace(/_/g, " ")}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {vms.map((vm, i) => (
              <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#28293d" : "#232536" }}>
                {Object.values(vm).map((val, j) => (
                  <td key={j} style={{ border: "1px solid #444", padding: 12 }}>
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{ marginBottom: 36 }}>
        <h3>Adjust Objective Weights</h3>
        <div
          style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 400, marginTop: 8 }}
        >
          <div>
            <label
              htmlFor="cpuWeight"
              style={{ display: "block", marginBottom: 6, fontWeight: 600 }}
            >
              CPU Weight: <span style={{ color: "#92d050" }}>{cpuWeight.toFixed(2)}</span>
            </label>
            <input
              type="range"
              id="cpuWeight"
              min="0"
              max="1"
              step="0.01"
              value={cpuWeight}
              onChange={(e) => setCpuWeight(parseFloat(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label
              htmlFor="energyWeight"
              style={{ display: "block", marginBottom: 6, fontWeight: 600 }}
            >
              Energy Weight: <span style={{ color: "#f8c444" }}>{energyWeight.toFixed(2)}</span>
            </label>
            <input
              type="range"
              id="energyWeight"
              min="0"
              max="1"
              step="0.01"
              value={energyWeight}
              onChange={(e) => setEnergyWeight(parseFloat(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label htmlFor="costWeight" style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
              Cost Weight: <span style={{ color: "#f8696b" }}>{costWeight.toFixed(2)}</span>
            </label>
            <input
              type="range"
              id="costWeight"
              min="0"
              max="1"
              step="0.01"
              value={costWeight}
              onChange={(e) => setCostWeight(parseFloat(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>
        </div>
      </section>

      <section>
        <h3>Placement Results</h3>
        <ul style={{ paddingLeft: 20, marginTop: 12 }}>
          {placements.map(({ vm_id, assigned_host }, i) => (
            <li key={i} style={{ fontSize: 16, marginBottom: 8 }}>
              VM <strong>{vm_id}</strong> &rarr; Host <strong>{assigned_host}</strong>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
