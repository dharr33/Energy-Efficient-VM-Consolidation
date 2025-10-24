import React, { useState, useEffect } from 'react';
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
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
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
      },
      title: {
        display: true,
        text: 'Model Performance Comparison',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const featureChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Feature Importance (Random Forest)',
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="ml-comparison-container">
      <div className="header">
        <h1>Machine Learning Model Comparison</h1>
        <p>Compare multiple ML models for VM placement optimization</p>
      </div>

      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      <div className="controls">
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

      <style jsx>{`
        .ml-comparison-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .header {
          text-align: center;
          margin-bottom: 30px;
        }

        .header h1 {
          color: #333;
          margin-bottom: 10px;
        }

        .error-message {
          background-color: #f8d7da;
          color: #721c24;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
          border: 1px solid #f5c6cb;
        }

        .controls {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.3s;
        }

        .btn-primary {
          background-color: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background-color: #0056b3;
        }

        .btn-secondary {
          background-color: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background-color: #545b62;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .results-section, .feature-importance-section, .prediction-section {
          margin-bottom: 40px;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background-color: #f9f9f9;
        }

        .results-table {
          margin-bottom: 20px;
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          background-color: white;
        }

        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }

        th {
          background-color: #f2f2f2;
          font-weight: bold;
        }

        .chart-container {
          margin: 20px 0;
          padding: 20px;
          background-color: white;
          border-radius: 5px;
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
        }

        .form-group input, .form-group select {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .prediction-result {
          margin-top: 20px;
        }

        .result-card {
          background-color: #d4edda;
          border: 1px solid #c3e6cb;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }

        .result-card p {
          margin: 5px 0;
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
          background-color: white;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .model-name {
          font-weight: bold;
        }

        .prediction-value {
          color: #007bff;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default MLComparison;
