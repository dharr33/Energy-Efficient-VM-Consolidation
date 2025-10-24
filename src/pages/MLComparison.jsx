import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import Header from '../shared/Header';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

const MLComparison = () => {
  const [models, setModels] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [featureImportance, setFeatureImportance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [predictionInput, setPredictionInput] = useState({
    cpu: 50,
    memory: 16,
    network_io: 2.5,
    power: 200,
    vm: 'VM1'
  });

  const API_BASE_URL = 'http://localhost:5001/api/ml';

  useEffect(() => {
    initializeModels();
  }, []);

  const initializeModels = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        await loadResults();
        await loadPerformance();
        await loadFeatureImportance();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to initialize models: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadResults = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/results`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setModels(Object.entries(data.results).map(([name, metrics]) => ({
          name,
          ...metrics
        })));
      }
    } catch (err) {
      console.error('Error loading results:', err);
    }
  };

  const loadPerformance = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/performance`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setPerformance(data.performance_metrics);
      }
    } catch (err) {
      console.error('Error loading performance:', err);
    }
  };

  const loadFeatureImportance = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/feature-importance`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setFeatureImportance(data.feature_importance);
      }
    } catch (err) {
      console.error('Error loading feature importance:', err);
    }
  };

  const runHyperparameterTuning = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/hyperparameter-tuning`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        await loadResults();
        await loadPerformance();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to run hyperparameter tuning: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const predictPlacement = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(predictionInput),
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setPredictionResult(data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to make prediction: ' + err.message);
    }
  };

  const performanceChartData = {
    labels: performance.map(p => p.model_name),
    datasets: [
      {
        label: 'R² Score',
        data: performance.map(p => p.r2_score),
        backgroundColor: 'rgba(74, 163, 255, 0.6)',
        borderColor: 'rgba(74, 163, 255, 1)',
        borderWidth: 1,
      },
      {
        label: 'MSE',
        data: performance.map(p => p.mse),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const featureImportanceData = {
    labels: featureImportance.map(f => f.feature),
    datasets: [
      {
        label: 'Feature Importance',
        data: featureImportance.map(f => f.importance),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#ecf0f1'
        }
      },
      title: {
        display: true,
        text: 'Model Performance Comparison',
        color: '#ecf0f1'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#ecf0f1'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      x: {
        ticks: {
          color: '#ecf0f1'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
  };

  const featureChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#ecf0f1'
        }
      },
      title: {
        display: true,
        text: 'Feature Importance (Random Forest)',
        color: '#ecf0f1'
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          color: '#ecf0f1'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: {
        ticks: {
          color: '#ecf0f1'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
  };

  return (
    <div className="ml-comparison-container">
      <Header dark={true} setDark={() => {}} />
      
      <div className="ml-comparison-content">
        <div className="header-section">
          <h1>🤖 Machine Learning Model Comparison</h1>
          <p>Compare multiple ML models for VM placement optimization</p>
        </div>

        {error && (
          <div className="error-message">
            <p>Error: {error}</p>
            <button onClick={() => setError(null)} className="btn btn-secondary">Dismiss</button>
          </div>
        )}

        <div className="controls-section">
          <button 
            onClick={initializeModels} 
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Initializing...' : 'Initialize Models'}
          </button>
          
          <button 
            onClick={runHyperparameterTuning} 
            disabled={loading}
            className="btn btn-secondary"
          >
            {loading ? 'Tuning...' : 'Run Hyperparameter Tuning'}
          </button>
        </div>

        <div className="results-section">
          <h2>Model Performance Results</h2>
          
          {models.length > 0 && (
            <div className="results-table">
              <table>
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>MSE</th>
                    <th>R² Score</th>
                    <th>MAE</th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((model, index) => (
                    <tr key={index}>
                      <td>{model.name}</td>
                      <td>{model.MSE.toFixed(4)}</td>
                      <td>{model.R2.toFixed(4)}</td>
                      <td>{model.MAE.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {performance.length > 0 && (
            <div className="chart-container">
              <Bar data={performanceChartData} options={chartOptions} />
            </div>
          )}
        </div>

        <div className="feature-importance-section">
          <h2>Feature Importance Analysis</h2>
          
          {featureImportance.length > 0 && (
            <div className="chart-container">
              <Bar 
                data={featureImportanceData} 
                options={featureChartOptions} 
              />
            </div>
          )}
        </div>

        <div className="prediction-section">
          <h2>VM Placement Prediction</h2>
          
          <div className="prediction-form">
            <div className="form-group">
              <label>CPU Usage (%):</label>
              <input
                type="number"
                value={predictionInput.cpu}
                onChange={(e) => setPredictionInput({
                  ...predictionInput,
                  cpu: parseFloat(e.target.value)
                })}
                min="0"
                max="100"
              />
            </div>
            
            <div className="form-group">
              <label>Memory (GB):</label>
              <input
                type="number"
                value={predictionInput.memory}
                onChange={(e) => setPredictionInput({
                  ...predictionInput,
                  memory: parseFloat(e.target.value)
                })}
                min="1"
                max="32"
              />
            </div>
            
            <div className="form-group">
              <label>Network I/O:</label>
              <input
                type="number"
                value={predictionInput.network_io}
                onChange={(e) => setPredictionInput({
                  ...predictionInput,
                  network_io: parseFloat(e.target.value)
                })}
                min="0.1"
                max="5.0"
                step="0.1"
              />
            </div>
            
            <div className="form-group">
              <label>Power Consumption:</label>
              <input
                type="number"
                value={predictionInput.power}
                onChange={(e) => setPredictionInput({
                  ...predictionInput,
                  power: parseFloat(e.target.value)
                })}
                min="100"
                max="300"
              />
            </div>
            
            <div className="form-group">
              <label>VM Name:</label>
              <select
                value={predictionInput.vm}
                onChange={(e) => setPredictionInput({
                  ...predictionInput,
                  vm: e.target.value
                })}
              >
                {Array.from({length: 10}, (_, i) => (
                  <option key={i} value={`VM${i+1}`}>VM{i+1}</option>
                ))}
              </select>
            </div>
            
            <button onClick={predictPlacement} className="btn btn-primary">
              Predict VM Placement
            </button>
          </div>

          {predictionResult && (
            <div className="prediction-result">
              <h3>Prediction Result</h3>
              <div className="result-card">
                <p><strong>Recommended Host:</strong> {predictionResult.prediction.recommended_host}</p>
                <p><strong>Best Model:</strong> {predictionResult.prediction.best_model}</p>
                <p><strong>Confidence:</strong> {(predictionResult.prediction.confidence * 100).toFixed(2)}%</p>
              </div>
              
              <h4>All Model Predictions:</h4>
              <div className="all-predictions">
                {Object.entries(predictionResult.all_predictions).map(([model, prediction]) => (
                  <div key={model} className="prediction-item">
                    <span className="model-name">{model}:</span>
                    <span className="prediction-value">{prediction.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .ml-comparison-container {
          min-height: 100vh;
          background: linear-gradient(180deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
          color: #ecf0f1;
        }

        .ml-comparison-content {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .header-section {
          text-align: center;
          margin-bottom: 30px;
        }

        .header-section h1 {
          color: #ecf0f1;
          margin-bottom: 10px;
          font-size: 2.5rem;
        }

        .header-section p {
          color: #bdc3c7;
          font-size: 1.2rem;
        }

        .error-message {
          background-color: #f8d7da;
          color: #721c24;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid #f5c6cb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .controls-section {
          display: flex;
          gap: 15px;
          margin-bottom: 30px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
        }

        .btn-primary {
          background-color: #4aa3ff;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #357abd;
          transform: translateY(-2px);
        }

        .btn-secondary {
          background-color: #6c757d;
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background-color: #545b62;
          transform: translateY(-2px);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .results-section, .feature-importance-section, .prediction-section {
          margin-bottom: 40px;
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(6px);
        }

        .results-section h2, .feature-importance-section h2, .prediction-section h2 {
          color: #ecf0f1;
          margin-bottom: 20px;
          font-size: 1.8rem;
        }

        .results-table {
          margin-bottom: 20px;
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }

        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          color: #ecf0f1;
        }

        th {
          background: rgba(74, 163, 255, 0.2);
          font-weight: bold;
        }

        tr:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .chart-container {
          margin: 20px 0;
          padding: 20px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }

        .prediction-form {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          margin-bottom: 5px;
          font-weight: bold;
          color: #ecf0f1;
        }

        .form-group input, .form-group select {
          padding: 10px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.1);
          color: #ecf0f1;
          font-size: 14px;
        }

        .form-group input:focus, .form-group select:focus {
          outline: none;
          border-color: #4aa3ff;
          box-shadow: 0 0 0 2px rgba(74, 163, 255, 0.2);
        }

        .form-group input::placeholder {
          color: #bdc3c7;
        }

        .prediction-result {
          margin-top: 20px;
        }

        .prediction-result h3 {
          color: #ecf0f1;
          margin-bottom: 15px;
        }

        .result-card {
          background: rgba(212, 237, 218, 0.1);
          border: 1px solid rgba(195, 230, 203, 0.3);
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .result-card p {
          margin: 8px 0;
          color: #ecf0f1;
        }

        .all-predictions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 10px;
        }

        .prediction-item {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
        }

        .model-name {
          font-weight: bold;
          color: #ecf0f1;
        }

        .prediction-value {
          color: #4aa3ff;
          font-weight: bold;
        }

        @media (max-width: 768px) {
          .ml-comparison-content {
            padding: 10px;
          }
          
          .prediction-form {
            grid-template-columns: 1fr;
          }
          
          .controls-section {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
};

export default MLComparison;