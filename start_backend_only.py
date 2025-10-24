#!/usr/bin/env python3
"""
Backend-Only Startup Script
This script starts only the Python backend services (API servers) without requiring Node.js.
Use this if you don't have Node.js installed or want to run just the backend.
"""

import subprocess
import sys
import os
import time
import webbrowser
from pathlib import Path

class BackendStarter:
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.processes = []
        self.running = True
        
    def print_banner(self):
        """Print project startup banner"""
        print("=" * 80)
        print("🚀 VM PLACEMENT OPTIMIZATION - BACKEND ONLY")
        print("=" * 80)
        print("Starting Python backend services...")
        print("=" * 80)
    
    def check_python_version(self):
        """Check if Python version is compatible"""
        if sys.version_info < (3, 8):
            print("❌ Python 3.8+ is required")
            sys.exit(1)
        print(f"✅ Python {sys.version.split()[0]} detected")
    
    def install_python_dependencies(self):
        """Install Python dependencies"""
        print("\n📦 Installing Python dependencies...")
        
        # Install backend dependencies
        backend_requirements = [
            "flask>=2.3.0",
            "flask-cors>=4.0.0",
            "pandas>=2.0.0",
            "numpy>=1.24.0",
            "scikit-learn>=1.3.0",
            "matplotlib>=3.7.0",
            "seaborn>=0.12.0",
            "xgboost>=1.7.0",
            "joblib>=1.3.0",
            "scipy>=1.10.0"
        ]
        
        for package in backend_requirements:
            try:
                subprocess.check_call([
                    sys.executable, "-m", "pip", "install", package, "--quiet"
                ])
                print(f"✅ Installed {package}")
            except subprocess.CalledProcessError:
                print(f"⚠️  Warning: Could not install {package}")
    
    def create_directories(self):
        """Create necessary directories"""
        print("\n📁 Creating project directories...")
        
        directories = [
            "vmp/models",
            "vmp/logs"
        ]
        
        for directory in directories:
            os.makedirs(self.project_root / directory, exist_ok=True)
            print(f"✅ Created {directory}")
    
    def generate_sample_data(self):
        """Generate sample VM metrics data if not exists"""
        print("\n📊 Checking dataset...")
        
        data_file = self.project_root / "vmp" / "vm_metrics.csv"
        
        if not data_file.exists():
            print("Generating sample VM metrics data...")
            try:
                import pandas as pd
                import numpy as np
                
                # Generate synthetic data
                np.random.seed(42)
                n_samples = 10000
                
                data = {
                    'timestamp': np.random.uniform(1600000000, 1700000000, n_samples),
                    'vm': [f'VM{i%10+1}' for i in range(n_samples)],
                    'cpu': np.random.randint(10, 91, n_samples),
                    'memory': np.random.randint(1, 33, n_samples),
                    'network_io': np.random.uniform(0.1, 5.0, n_samples),
                    'power': np.random.randint(100, 301, n_samples)
                }
                
                # Assign hosts based on resource requirements
                hosts = []
                for i in range(n_samples):
                    cpu = data['cpu'][i]
                    memory = data['memory'][i]
                    
                    if cpu <= 33 and memory <= 11:
                        hosts.append('Host1')
                    elif cpu <= 66 and memory <= 22:
                        hosts.append('Host2')
                    else:
                        hosts.append('Host3')
                
                data['host'] = hosts
                df = pd.DataFrame(data)
                df.to_csv(data_file, index=False)
                print(f"✅ Generated sample data: {data_file}")
                
            except Exception as e:
                print(f"⚠️  Warning: Could not generate sample data: {e}")
        else:
            print(f"✅ Dataset found: {data_file}")
    
    def start_backend_api(self):
        """Start the main Flask backend API"""
        print("\n🔧 Starting Backend API Server...")
        
        try:
            # Start the main API server
            process = subprocess.Popen([
                sys.executable, "vmp/api_server.py"
            ], cwd=self.project_root)
            
            self.processes.append(("Backend API", process))
            print("✅ Backend API started on http://localhost:5002")
            
        except Exception as e:
            print(f"❌ Failed to start Backend API: {e}")
    
    def start_ml_api(self):
        """Start the ML comparison API server"""
        print("\n🤖 Starting ML API Server...")
        
        try:
            # Start the ML API server
            process = subprocess.Popen([
                sys.executable, "vmp/ml_api_server.py"
            ], cwd=self.project_root)
            
            self.processes.append(("ML API", process))
            print("✅ ML API started on http://localhost:5001")
            
        except Exception as e:
            print(f"❌ Failed to start ML API: {e}")
    
    def wait_for_services(self):
        """Wait for services to start up"""
        print("\n⏳ Waiting for services to start...")
        time.sleep(5)  # Give services time to start
    
    def print_service_info(self):
        """Print service information"""
        print("\n" + "=" * 80)
        print("🎉 BACKEND SERVICES STARTED SUCCESSFULLY!")
        print("=" * 80)
        print("🔧 Backend API:  http://localhost:5002")
        print("🤖 ML API:       http://localhost:5001")
        print("=" * 80)
        print("📋 Available API Endpoints:")
        print("   • Backend API:")
        print("     - GET  /api/v1/metrics")
        print("     - POST /api/v1/optimize")
        print("   • ML API:")
        print("     - POST /api/ml/initialize")
        print("     - GET  /api/ml/results")
        print("     - POST /api/ml/predict")
        print("     - GET  /api/ml/feature-importance")
        print("=" * 80)
        print("💡 To start the React frontend:")
        print("   1. Install Node.js from https://nodejs.org")
        print("   2. Run: npm install")
        print("   3. Run: npm start")
        print("   4. Open: http://localhost:3000")
        print("=" * 80)
        print("🛑 Press Ctrl+C to stop all services")
        print("=" * 80)
    
    def monitor_processes(self):
        """Monitor running processes"""
        while self.running:
            try:
                for name, process in self.processes:
                    if process.poll() is not None:
                        print(f"⚠️  {name} has stopped unexpectedly")
                        self.running = False
                        break
                time.sleep(5)
            except KeyboardInterrupt:
                self.running = False
                break
    
    def cleanup(self):
        """Clean up processes on exit"""
        print("\n🛑 Stopping all services...")
        
        for name, process in self.processes:
            try:
                process.terminate()
                print(f"✅ Stopped {name}")
            except Exception as e:
                print(f"⚠️  Error stopping {name}: {e}")
        
        print("👋 All services stopped. Goodbye!")
    
    def run(self):
        """Main execution function"""
        try:
            self.print_banner()
            self.check_python_version()
            self.install_python_dependencies()
            self.create_directories()
            self.generate_sample_data()
            
            # Start backend services
            self.start_backend_api()
            self.start_ml_api()
            
            self.wait_for_services()
            self.print_service_info()
            
            # Monitor processes
            self.monitor_processes()
            
        except KeyboardInterrupt:
            print("\n🛑 Shutdown requested by user")
        except Exception as e:
            print(f"\n❌ Error during startup: {e}")
        finally:
            self.cleanup()

def main():
    """Main function"""
    starter = BackendStarter()
    starter.run()

if __name__ == "__main__":
    main()
