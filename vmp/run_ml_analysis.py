#!/usr/bin/env python3
"""
Script to run the complete ML analysis pipeline
This script installs dependencies, runs the ML comparison, and starts the API server
"""

import subprocess
import sys
import os
import time

def install_requirements():
    """Install required packages"""
    print("Installing ML dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements_ml.txt"])
        print("✅ Dependencies installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing dependencies: {e}")
        return False

def run_ml_analysis():
    """Run the ML model comparison"""
    print("Running ML model comparison...")
    try:
        from ml_model_comparison import MLModelComparison
        
        # Create models directory
        os.makedirs('models', exist_ok=True)
        
        # Run the analysis
        ml_comparison = MLModelComparison()
        results = ml_comparison.run_complete_analysis()
        
        print("✅ ML analysis completed successfully!")
        print("\nResults Summary:")
        print(results.round(4))
        
        return True
    except Exception as e:
        print(f"❌ Error running ML analysis: {e}")
        return False

def start_api_server():
    """Start the Flask API server"""
    print("Starting ML API server...")
    try:
        from ml_api_server import app
        print("🚀 ML API Server starting on http://localhost:5001")
        print("Available endpoints:")
        print("- POST /api/ml/initialize - Initialize and train models")
        print("- GET /api/ml/results - Get model comparison results")
        print("- GET /api/ml/performance - Get detailed performance metrics")
        print("- GET /api/ml/feature-importance - Get feature importance")
        print("- POST /api/ml/predict - Predict VM placement")
        print("- POST /api/ml/hyperparameter-tuning - Run hyperparameter tuning")
        print("- GET /api/ml/dataset-info - Get dataset information")
        print("- GET /api/health - Health check")
        print("\nPress Ctrl+C to stop the server")
        
        app.run(debug=False, host='0.0.0.0', port=5001)
        
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting API server: {e}")

def main():
    """Main function"""
    print("🤖 VM Placement ML Analysis Pipeline")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("ml_model_comparison.py"):
        print("❌ Please run this script from the vmp directory")
        sys.exit(1)
    
    # Install dependencies
    if not install_requirements():
        sys.exit(1)
    
    # Run ML analysis
    if not run_ml_analysis():
        sys.exit(1)
    
    # Ask user if they want to start the API server
    response = input("\nDo you want to start the API server? (y/n): ").lower().strip()
    if response in ['y', 'yes']:
        start_api_server()
    else:
        print("✅ ML analysis completed. You can start the API server later with:")
        print("python ml_api_server.py")

if __name__ == "__main__":
    main()
