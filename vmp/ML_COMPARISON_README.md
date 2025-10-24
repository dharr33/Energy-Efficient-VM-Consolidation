# Machine Learning Model Comparison for VM Placement

This directory contains a comprehensive machine learning comparison system for VM placement optimization. The system trains and compares multiple ML models to find the best approach for placing virtual machines on physical hosts.

## 🚀 Features

### Multiple ML Models
- **Random Forest**: Ensemble method with feature importance analysis
- **Gradient Boosting**: Sequential boosting algorithm
- **XGBoost**: Optimized gradient boosting
- **K-Nearest Neighbors**: Instance-based learning
- **Support Vector Regression**: Kernel-based method
- **Decision Tree**: Simple interpretable model
- **Neural Network**: Multi-layer perceptron

### Evaluation Metrics
- **Mean Squared Error (MSE)**: Measures prediction accuracy
- **R² Score**: Coefficient of determination
- **Mean Absolute Error (MAE)**: Average prediction error

### Advanced Features
- **Hyperparameter Tuning**: GridSearchCV for optimal parameters
- **Feature Importance**: Random Forest feature analysis
- **Cross-validation**: Robust model evaluation
- **Visualization**: Performance comparison charts
- **API Server**: RESTful endpoints for model access

## 📁 Files Structure

```
vmp/
├── ml_model_comparison.py      # Main ML comparison script
├── ml_api_server.py           # Flask API server
├── run_ml_analysis.py         # Automated analysis runner
├── requirements_ml.txt        # Python dependencies
├── models/                    # Saved trained models
├── vm_metrics.csv            # Dataset (or generated)
└── ML_COMPARISON_README.md    # This file
```

## 🛠️ Installation & Setup

### 1. Install Dependencies
```bash
cd vmp
pip install -r requirements_ml.txt
```

### 2. Run Complete Analysis
```bash
python run_ml_analysis.py
```

This will:
- Install dependencies
- Load/generate dataset
- Train all models
- Perform hyperparameter tuning
- Generate visualizations
- Start API server (optional)

### 3. Manual Execution
```bash
# Run ML comparison only
python ml_model_comparison.py

# Start API server only
python ml_api_server.py
```

## 📊 Dataset

The system works with VM metrics data containing:
- **CPU Usage**: Percentage (10-90%)
- **Memory**: GB (1-32GB)
- **Network I/O**: Bandwidth usage (0.1-5.0)
- **Power**: Consumption (100-300W)
- **VM Name**: Virtual machine identifier
- **Host**: Target host placement

If `vm_metrics.csv` doesn't exist, the system will generate synthetic data automatically.

## 🔧 API Endpoints

### Initialize Models
```http
POST /api/ml/initialize
```
Trains all ML models and prepares them for use.

### Get Results
```http
GET /api/ml/results
```
Returns performance metrics for all models.

### Get Performance Metrics
```http
GET /api/ml/performance
```
Returns detailed performance comparison with best model identification.

### Feature Importance
```http
GET /api/ml/feature-importance
```
Returns Random Forest feature importance analysis.

### Predict VM Placement
```http
POST /api/ml/predict
Content-Type: application/json

{
  "cpu": 50,
  "memory": 16,
  "network_io": 2.5,
  "power": 200,
  "vm": "VM1"
}
```

### Hyperparameter Tuning
```http
POST /api/ml/hyperparameter-tuning
```
Runs hyperparameter optimization for all models.

### Dataset Information
```http
GET /api/ml/dataset-info
```
Returns dataset statistics and information.

## 🎯 Usage Examples

### Python API Usage
```python
import requests

# Initialize models
response = requests.post('http://localhost:5001/api/ml/initialize')
print(response.json())

# Get performance results
response = requests.get('http://localhost:5001/api/ml/performance')
results = response.json()
print(f"Best model: {results['best_model']}")

# Make prediction
prediction_data = {
    "cpu": 75,
    "memory": 24,
    "network_io": 3.2,
    "power": 250,
    "vm": "VM5"
}
response = requests.post('http://localhost:5001/api/ml/predict', 
                       json=prediction_data)
result = response.json()
print(f"Recommended host: {result['prediction']['recommended_host']}")
```

### Frontend Integration
The React frontend (`/ml-comparison`) provides:
- Interactive model comparison
- Real-time performance visualization
- VM placement prediction interface
- Feature importance analysis
- Hyperparameter tuning controls

## 📈 Model Performance

The system automatically:
1. **Splits data** into 80% training, 20% testing
2. **Trains all models** with default parameters
3. **Performs hyperparameter tuning** using GridSearchCV
4. **Evaluates performance** using multiple metrics
5. **Generates visualizations** for comparison
6. **Identifies best model** based on R² score

## 🔍 Feature Importance

Random Forest provides feature importance analysis showing:
- **CPU Usage**: Most influential factor
- **Memory**: Second most important
- **Resource Intensity**: Combined CPU+Memory
- **Power Efficiency**: Power per CPU unit
- **Network I/O**: Network bandwidth usage

## 🎨 Visualizations

The system generates:
- **Performance Bar Charts**: MSE, R², MAE comparison
- **Feature Importance Plot**: Random Forest analysis
- **Model Comparison**: Side-by-side performance
- **Interactive Charts**: Real-time updates in frontend

## 🔧 Configuration

### Model Parameters
Each model can be customized in `ml_model_comparison.py`:

```python
self.models = {
    'Random Forest': RandomForestRegressor(
        n_estimators=100, 
        max_depth=20, 
        random_state=42
    ),
    'XGBoost': xgb.XGBRegressor(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=6,
        random_state=42
    ),
    # ... other models
}
```

### Hyperparameter Grids
Tuning parameters are defined in the `hyperparameter_tuning()` method:

```python
param_grids = {
    'Random Forest': {
        'n_estimators': [50, 100, 200],
        'max_depth': [10, 20, None],
        'min_samples_split': [2, 5, 10]
    },
    # ... other parameter grids
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Missing Dependencies**
   ```bash
   pip install -r requirements_ml.txt
   ```

2. **Dataset Not Found**
   - System will auto-generate synthetic data
   - Check `vm_metrics.csv` exists

3. **Memory Issues**
   - Reduce dataset size in `generate_synthetic_data()`
   - Use fewer models in comparison

4. **API Connection Issues**
   - Ensure Flask server is running on port 5001
   - Check CORS settings for frontend

### Performance Optimization

- **Large Datasets**: Use data sampling for faster training
- **Model Selection**: Disable slow models (Neural Networks)
- **Hyperparameter Tuning**: Reduce parameter grid size
- **Cross-validation**: Use fewer CV folds (cv=3 instead of 5)

## 📝 Output Files

The system generates:
- `model_performance_comparison.png`: Performance charts
- `feature_importance.png`: Feature importance plot
- `models/`: Directory with saved model files
- Console output with detailed metrics

## 🔄 Integration

### With Existing System
- Uses same dataset as main VM placement system
- Integrates with Flask API architecture
- Compatible with React frontend
- Shares model files with existing system

### Extending the System
- Add new models in `initialize_models()`
- Customize evaluation metrics
- Add new visualization types
- Implement model ensemble methods

## 📊 Expected Results

Typical performance rankings:
1. **XGBoost**: Usually best R² score
2. **Random Forest**: Good balance of performance/interpretability
3. **Gradient Boosting**: Strong performance
4. **Neural Network**: Good for complex patterns
5. **SVR**: Good for non-linear relationships
6. **KNN**: Simple but effective
7. **Decision Tree**: Most interpretable

## 🎯 Next Steps

- Implement model ensemble methods
- Add time-series analysis
- Create automated model selection
- Add real-time model retraining
- Implement A/B testing framework
