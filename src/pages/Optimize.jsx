  import React from 'react';
  import Header from '../shared/Header';

  export default function Optimize({ dark, setDark }) {
    const apiBase = "http://127.0.0.1:5002"; // <-- must match Flask port

    const [vmOptions,setVmOptions] = React.useState([]);
    const [form,setForm] = React.useState({ vm:'', cpu:50, memory:16, network_io:1.0, power:150 });
    const [weights,setWeights] = React.useState({ cost:0.34, energy:0.33, load:0.33 });
    const [placement,setPlacement] = React.useState(null);
    const [loading,setLoading] = React.useState(false);
    const [error,setError] = React.useState('');
    const [backendLog,setBackendLog] = React.useState([]);

    React.useEffect(()=>{
      const fetchVMs = async()=>{
        try{
          const res = await fetch(`${apiBase}/api/v1/vms`);
          const data = await res.json();
          setVmOptions(data.vms || []);
          setForm(prev => ({ ...prev, vm: data.vms[0] || '' }));
          setBackendLog(prev=>[...prev, `VM Fetch: ${JSON.stringify(data)}`]);
        } catch(e){
          setError("Cannot load VM options from ML server.");
          setBackendLog(prev=>[...prev, `ERROR: ${e.message}`]);
        }
      }
      fetchVMs();
    },[]);

    const handlePredict = async()=>{
      if(!form.vm) return;
      setLoading(true);
      setError('');
      setPlacement(null);
      try{
        const res = await fetch(`${apiBase}/api/v1/predict`,{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ ...form, weights })
        });
        const data = await res.json();
        if(!res.ok) throw new Error(data.error || 'Prediction failed');
        setPlacement({
          host:data.host,
          cost:data.objectives.cost,
          energy:data.objectives.energy,
          loadBalance:data.objectives.loadBalance,
          weightedScore:data.objectives.weightedScore,
          inputEcho:data.inputEcho,
          weights:data.objectives.weights
        });
        setBackendLog(prev=>[...prev, `Predict: ${JSON.stringify(data)}`]);
      } catch(e){
        setError(e.message);
        setBackendLog(prev=>[...prev, `ERROR: ${e.message}`]);
      } finally{ setLoading(false); }
    };

    const themeStyle = dark
      ? { backgroundColor:'#1e1e1e', color:'#ecf0f1' }
      : { backgroundColor:'#f7f9fc', color:'#2c3e50' };

    return (
      <div style={{ maxWidth:1100, margin:'20px auto', padding:20, ...themeStyle }}>
        <Header dark={dark} setDark={setDark} />

        <div className="card">
          <h2 style={{marginTop:0}}>VM Optimization</h2>
          <div style={{ display:'flex', flexWrap:'wrap', gap:16 }}>
            <div>
              <label>VM:</label>
              <select value={form.vm} onChange={e=>setForm({...form, vm:e.target.value})} style={{ padding:8 }}>
                {vmOptions.map(v=><option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label>CPU (%):</label>
              <input type="number" min={0} max={100} value={form.cpu} onChange={e=>setForm({...form, cpu:Number(e.target.value)})} />
            </div>
            <div>
              <label>Memory (GB):</label>
              <input type="number" min={1} max={1024} value={form.memory} onChange={e=>setForm({...form, memory:Number(e.target.value)})} />
            </div>
            <div>
              <label>Network I/O:</label>
              <input type="number" step="0.01" value={form.network_io} onChange={e=>setForm({...form, network_io:Number(e.target.value)})} />
            </div>
            <div>
              <label>Power (W):</label>
              <input type="number" value={form.power} onChange={e=>setForm({...form, power:Number(e.target.value)})} />
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <label>Weights - Cost:</label>
            <input type="number" step="0.01" min={0} max={1} value={weights.cost} onChange={e=>setWeights({...weights, cost:Number(e.target.value)})} />
            <label>Energy:</label>
            <input type="number" step="0.01" min={0} max={1} value={weights.energy} onChange={e=>setWeights({...weights, energy:Number(e.target.value)})} />
            <label>Load:</label>
            <input type="number" step="0.01" min={0} max={1} value={weights.load} onChange={e=>setWeights({...weights, load:Number(e.target.value)})} />
          </div>

          <button className="btn-primary" onClick={handlePredict} disabled={loading || !form.vm}>
            {loading ? 'Predicting…' : 'Predict Placement'}
          </button>
        </div>

        <div className="card" style={{marginTop:16}}>
          <h3>Recommended Placement</h3>
          {placement ? (
            <div>
              <div><strong>Host:</strong> {placement.host}</div>
              <div>
                Cost: {placement.cost} | Energy: {placement.energy} | Load: {placement.loadBalance} | Score: {placement.weightedScore}
              </div>
              <pre style={{ backgroundColor: dark?'#333':'#eee', padding:10, borderRadius:6 }}>
                Input: {JSON.stringify(placement.inputEcho, null,2)}
                {'\n'}Weights: {JSON.stringify(placement.weights,null,2)}
              </pre>
            </div>
          ) : <div>No recommendation yet.</div>}
        </div>

        <div className="card" style={{marginTop:16}}>
          <h3>Backend Log</h3>
          <pre style={{ backgroundColor: dark?'#333':'#eee', padding:10, maxHeight:300, overflowY:'auto' }}>
            {backendLog.map((l,i)=><div key={i}>{l}</div>)}
          </pre>
        </div>

        {error && <div style={{marginTop:16,color:'red'}}>Error: {error}</div>}
      </div>
    );
  }
