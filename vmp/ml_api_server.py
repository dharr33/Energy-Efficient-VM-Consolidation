"""
Flask API Server for ML Model Comparison Results
Provides endpoints to access ML model performance and predictions
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import os
from ml_model_comparison import MLModelComparison

app = Flask(__name__)
CORS(app)

# Global variables to store models and results
ml_comparison = None
results_data = None

@app.route('/api/ml/initialize', methods=['POST'])
def initialize_ml_models():
    """Initialize and train all ML models"""
    global ml_comparison, results_data
    
    try:
        ml_comparison = MLModelComparison()
        ml_comparison.load_and_preprocess_data()
        ml_comparison.initialize_models()
        ml_comparison.train_models()
        
        # Get results
        results_data = {}
        for name, results in ml_comparison.results.items():
            results_data[name] = {
                'MSE': float(results['MSE']),
                'R2': float(results['R2']),
                'MAE': float(results['MAE'])
            }
        
        return jsonify({
            'status': 'success',
            'message': 'ML models initialized and trained successfully',
            'models_trained': list(results_data.keys())
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error initializing models: {str(e)}'
        }), 500

@app.route('/api/ml/results', methods=['GET'])
def get_ml_results():
    """Get ML model comparison results"""
    global results_data
    
    if results_data is None:
        return jsonify({
            'status': 'error',
            'message': 'Models not initialized. Please call /api/ml/initialize first.'
        }), 400
    
    return jsonify({
        'status': 'success',
        'results': results_data
    })

@app.route('/api/ml/performance', methods=['GET'])
def get_performance_metrics():
    """Get detailed performance metrics for all models"""
    global ml_comparison
    
    if ml_comparison is None:
        return jsonify({
            'status': 'error',
            'message': 'Models not initialized'
        }), 400
    
    try:
        # Create performance summary
        performance_data = []
        for name, results in ml_comparison.results.items():
            performance_data.append({
                'model_name': name,
                'mse': float(results['MSE']),
                'r2_score': float(results['R2']),
                'mae': float(results['MAE']),
                'best_model': name == max(ml_comparison.results.keys(), 
                                       key=lambda x: ml_comparison.results[x]['R2'])
            })
        
        # Sort by R2 score (descending)
        performance_data.sort(key=lambda x: x['r2_score'], reverse=True)
        
        return jsonify({
            'status': 'success',
            'performance_metrics': performance_data,
            'best_model': performance_data[0]['model_name'] if performance_data else None
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error getting performance metrics: {str(e)}'
        }), 500

@app.route('/api/ml/feature-importance', methods=['GET'])
def get_feature_importance():
    """Get feature importance from Random Forest model"""
    global ml_comparison
    
    if ml_comparison is None:
        return jsonify({
            'status': 'error',
            'message': 'Models not initialized'
        }), 400
    
    try:
        if 'Random Forest' in ml_comparison.models:
            rf_model = ml_comparison.models['Random Forest']
            feature_importance = rf_model.feature_importances_
            feature_names = ml_comparison.X.columns.tolist()
            
            # Create feature importance data
            importance_data = []
            for feature, importance in zip(feature_names, feature_importance):
                importance_data.append({
                    'feature': feature,
                    'importance': float(importance)
                })
            
            # Sort by importance (descending)
            importance_data.sort(key=lambda x: x['importance'], reverse=True)
            
            return jsonify({
                'status': 'success',
                'feature_importance': importance_data
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'Random Forest model not available'
            }), 400
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error getting feature importance: {str(e)}'
        }), 500

@app.route('/api/ml/predict', methods=['POST'])
def predict_vm_placement():
    """Predict VM placement using the best model"""
    global ml_comparison
    
    if ml_comparison is None:
        return jsonify({
            'status': 'error',
            'message': 'Models not initialized'
        }), 400
    
    try:
        # Get input data from request
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['cpu', 'memory', 'network_io', 'power']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f'Missing required field: {field}'
                }), 400
        
        # Create feature vector
        cpu = float(data['cpu'])
        memory = float(data['memory'])
        network_io = float(data['network_io'])
        power = float(data['power'])
        vm = data.get('vm', 'VM1')
        
        # Calculate derived features
        cpu_memory_ratio = cpu / (memory + 1)
        resource_intensity = (cpu + memory) / 2
        power_efficiency = power / (cpu + 1)
        
        # Encode VM if encoder is available
        vm_encoded = 0
        if 'vm' in ml_comparison.label_encoders:
            vm_encoded = ml_comparison.label_encoders['vm'].transform([vm])[0]
        
        # Create feature array
        features = np.array([[
            cpu, memory, network_io, power, 
            cpu_memory_ratio, resource_intensity, power_efficiency, vm_encoded
        ]])
        
        # Get predictions from all models
        predictions = {}
        for name, model in ml_comparison.models.items():
            if name in ['K-Nearest Neighbors', 'Support Vector Regression', 'Neural Network']:
                # Use scaled features for these models
                features_scaled = ml_comparison.scaler.transform(features)
                pred = model.predict(features_scaled)[0]
            else:
                pred = model.predict(features)[0]
            
            predictions[name] = float(pred)
        
        # Get the best model prediction
        best_model_name = max(ml_comparison.results.keys(), 
                            key=lambda x: ml_comparison.results[x]['R2'])
        best_prediction = predictions[best_model_name]
        
        # Convert prediction to host name
        if 'host' in ml_comparison.label_encoders:
            host_encoder = ml_comparison.label_encoders['host']
            host_name = host_encoder.inverse_transform([int(round(best_prediction))])[0]
        else:
            # Map numeric prediction to host
            if best_prediction <= 0.5:
                host_name = 'Host1'
            elif best_prediction <= 1.5:
                host_name = 'Host2'
            else:
                host_name = 'Host3'
        
        return jsonify({
            'status': 'success',
            'prediction': {
                'recommended_host': host_name,
                'confidence': float(ml_comparison.results[best_model_name]['R2']),
                'best_model': best_model_name
            },
            'all_predictions': predictions
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error making prediction: {str(e)}'
        }), 500

@app.route('/api/ml/hyperparameter-tuning', methods=['POST'])
def run_hyperparameter_tuning():
    """Run hyperparameter tuning for all models"""
    global ml_comparison
    
    if ml_comparison is None:
        return jsonify({
            'status': 'error',
            'message': 'Models not initialized'
        }), 400
    
    try:
        ml_comparison.hyperparameter_tuning()
        ml_comparison.train_models()  # Retrain with tuned parameters
        
        # Update results
        global results_data
        results_data = {}
        for name, results in ml_comparison.results.items():
            results_data[name] = {
                'MSE': float(results['MSE']),
                'R2': float(results['R2']),
                'MAE': float(results['MAE'])
            }
        
        return jsonify({
            'status': 'success',
            'message': 'Hyperparameter tuning completed successfully',
            'updated_results': results_data
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error in hyperparameter tuning: {str(e)}'
        }), 500

@app.route('/api/ml/dataset-info', methods=['GET'])
def get_dataset_info():
    """Get information about the dataset"""
    global ml_comparison
    
    if ml_comparison is None:
        return jsonify({
            'status': 'error',
            'message': 'Models not initialized'
        }), 400
    
    try:
        dataset_info = {
            'shape': ml_comparison.df.shape,
            'columns': ml_comparison.df.columns.tolist(),
            'missing_values': ml_comparison.df.isnull().sum().to_dict(),
            'feature_columns': ml_comparison.X.columns.tolist(),
            'target_variable': 'host_placement',
            'train_test_split': {
                'train_size': ml_comparison.X_train.shape[0],
                'test_size': ml_comparison.X_test.shape[0],
                'split_ratio': '80:20'
            }
        }
        
        return jsonify({
            'status': 'success',
            'dataset_info': dataset_info
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error getting dataset info: {str(e)}'
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'success',
        'message': 'ML API Server is running',
        'models_initialized': ml_comparison is not None
    })

if __name__ == '__main__':
    print("Starting ML API Server...")
    print("Available endpoints:")
    print("- POST /api/ml/initialize - Initialize and train models")
    print("- GET /api/ml/results - Get model comparison results")
    print("- GET /api/ml/performance - Get detailed performance metrics")
    print("- GET /api/ml/feature-importance - Get feature importance")
    print("- POST /api/ml/predict - Predict VM placement")
    print("- POST /api/ml/hyperparameter-tuning - Run hyperparameter tuning")
    print("- GET /api/ml/dataset-info - Get dataset information")
    print("- GET /api/health - Health check")
    
    app.run(debug=True, host='0.0.0.0', port=5001)
