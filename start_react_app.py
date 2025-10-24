#!/usr/bin/env python3
"""
React App Startup Script
This script ensures the React frontend starts properly and is accessible.
"""

import subprocess
import sys
import os
import time
import webbrowser
import requests
from pathlib import Path

class ReactAppStarter:
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.react_process = None
        
    def print_banner(self):
        """Print startup banner"""
        print("=" * 80)
        print("⚛️  REACT FRONTEND STARTUP")
        print("=" * 80)
        print("Starting React development server...")
        print("=" * 80)
    
    def check_node_available(self):
        """Check if Node.js is available"""
        try:
            result = subprocess.run(["node", "--version"], 
                                  capture_output=True, text=True, check=True)
            print(f"✅ Node.js {result.stdout.strip()} detected")
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("❌ Node.js not found. Please install from https://nodejs.org")
            return False
    
    def check_npm_available(self):
        """Check if npm is available"""
        try:
            result = subprocess.run(["npm", "--version"], 
                                  capture_output=True, text=True, check=True)
            print(f"✅ npm {result.stdout.strip()} detected")
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("❌ npm not found. Please install Node.js (includes npm)")
            return False
    
    def install_dependencies(self):
        """Install npm dependencies"""
        print("\n📦 Installing React dependencies...")
        
        try:
            # Install all dependencies
            subprocess.check_call(["npm", "install"], 
                                cwd=self.project_root, shell=True)
            print("✅ React dependencies installed")
            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install dependencies: {e}")
            return False
    
    def start_react_server(self):
        """Start the React development server"""
        print("\n⚛️  Starting React development server...")
        
        try:
            # Start React development server
            self.react_process = subprocess.Popen(
                ["npm", "start"],
                cwd=self.project_root,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            
            print("✅ React server starting...")
            print("   This may take 30-60 seconds to compile...")
            return True
            
        except Exception as e:
            print(f"❌ Failed to start React server: {e}")
            return False
    
    def wait_for_react_server(self, timeout=120):
        """Wait for React server to be ready"""
        print(f"\n⏳ Waiting for React server to start (timeout: {timeout}s)...")
        
        start_time = time.time()
        while time.time() - start_time < timeout:
            try:
                response = requests.get("http://localhost:3000", timeout=5)
                if response.status_code == 200:
                    print("✅ React server is ready!")
                    return True
            except requests.exceptions.RequestException:
                pass
            
            time.sleep(2)
            print(".", end="", flush=True)
        
        print(f"\n⚠️  React server didn't start within {timeout} seconds")
        return False
    
    def open_browser(self):
        """Open browser to React app"""
        print("\n🌐 Opening React app in browser...")
        try:
            webbrowser.open("http://localhost:3000")
            print("✅ Browser opened to http://localhost:3000")
        except Exception as e:
            print(f"⚠️  Could not open browser automatically: {e}")
            print("   Please open http://localhost:3000 manually")
    
    def print_success_info(self):
        """Print success information"""
        print("\n" + "=" * 80)
        print("🎉 REACT APP STARTED SUCCESSFULLY!")
        print("=" * 80)
        print("📱 Frontend: http://localhost:3000")
        print("🔧 Backend API: http://localhost:5002")
        print("🤖 ML API: http://localhost:5001")
        print("=" * 80)
        print("📋 Available Pages:")
        print("   • Dashboard:        http://localhost:3000/")
        print("   • Optimization:     http://localhost:3000/optimize")
        print("   • ML Comparison:    http://localhost:3000/ml-comparison")
        print("   • ML Simulation:    http://localhost:3000/simulate-ml")
        print("=" * 80)
        print("🛑 Press Ctrl+C to stop the React server")
        print("=" * 80)
    
    def monitor_react_server(self):
        """Monitor React server process"""
        try:
            while True:
                if self.react_process and self.react_process.poll() is not None:
                    print("\n⚠️  React server has stopped unexpectedly")
                    break
                time.sleep(5)
        except KeyboardInterrupt:
            print("\n🛑 Stopping React server...")
            if self.react_process:
                self.react_process.terminate()
            print("👋 React server stopped. Goodbye!")
    
    def run(self):
        """Main execution function"""
        try:
            self.print_banner()
            
            # Check prerequisites
            if not self.check_node_available():
                return False
            if not self.check_npm_available():
                return False
            
            # Install dependencies
            if not self.install_dependencies():
                return False
            
            # Start React server
            if not self.start_react_server():
                return False
            
            # Wait for server to be ready
            if not self.wait_for_react_server():
                print("\n⚠️  React server may still be starting...")
                print("   Check http://localhost:3000 manually")
            
            # Open browser
            self.open_browser()
            self.print_success_info()
            
            # Monitor server
            self.monitor_react_server()
            
        except KeyboardInterrupt:
            print("\n🛑 Shutdown requested by user")
        except Exception as e:
            print(f"\n❌ Error during startup: {e}")
        finally:
            if self.react_process:
                self.react_process.terminate()

def main():
    """Main function"""
    starter = ReactAppStarter()
    starter.run()

if __name__ == "__main__":
    main()
