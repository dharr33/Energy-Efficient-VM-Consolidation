# 🚀 Quick Start Guide

## One-Click Project Startup

This project now includes a **single startup script** that handles everything automatically!

### 🎯 **EASIEST WAY - Just Run One Command:**

#### **Windows Users:**
```bash
start_project.bat
```

#### **Mac/Linux Users:**
```bash
./start_project.sh
```

#### **Universal (Any Platform):**
```bash
python start_project.py
```

---

## 🎉 What the Startup Script Does

The startup script automatically:

1. **✅ Checks Requirements**
   - Verifies Python 3.8+ is installed
   - Verifies Node.js and npm are installed
   - Shows helpful error messages if missing

2. **📦 Installs All Dependencies**
   - Python packages: Flask, pandas, scikit-learn, matplotlib, etc.
   - Node.js packages: React, Chart.js, all frontend dependencies
   - Creates necessary directories

3. **📊 Generates Sample Data**
   - Creates VM metrics dataset if not exists
   - Generates 10,000 synthetic VM records
   - Properly formatted for ML training

4. **🚀 Starts All Services**
   - **React Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:5002  
   - **ML API**: http://localhost:5001

5. **🌐 Opens Browser**
   - Automatically opens http://localhost:3000
   - Ready to use immediately!

---

## 📱 Available Pages

Once started, you can access:

- **🏠 Dashboard**: http://localhost:3000/
- **⚡ Optimization**: http://localhost:3000/optimize
- **🤖 ML Comparison**: http://localhost:3000/ml-comparison
- **📊 ML Simulation**: http://localhost:3000/simulate-ml

---

## 🛠️ Manual Setup (If Needed)

If the automated script doesn't work, you can set up manually:

### **1. Install Python Dependencies**
```bash
cd vmp
pip install flask flask-cors pandas numpy scikit-learn matplotlib seaborn xgboost joblib scipy
```

### **2. Install Node.js Dependencies**
```bash
npm install
npm install chart.js react-chartjs-2
```

### **3. Start Services Manually**

**Terminal 1 - Backend API:**
```bash
cd vmp
python api_server.py
```

**Terminal 2 - ML API:**
```bash
cd vmp  
python ml_api_server.py
```

**Terminal 3 - React Frontend:**
```bash
npm start
```

---

## 🔧 Troubleshooting

### **Common Issues:**

1. **"Python not found"**
   - Install Python 3.8+ from https://python.org
   - Make sure to check "Add to PATH" during installation

2. **"Node.js not found"**
   - Install Node.js from https://nodejs.org
   - This includes npm automatically

3. **"Port already in use"**
   - Close other applications using ports 3000, 5001, 5002
   - Or kill processes: `taskkill /f /im node.exe` (Windows)

4. **"Permission denied" (Mac/Linux)**
   - Run: `chmod +x start_project.sh`
   - Or use: `python start_project.py`

### **Reset Everything:**
```bash
# Stop all services (Ctrl+C)
# Then run:
npm install
python start_project.py
```

---

## 📊 What You'll See

After running the startup script:

```
===============================================================================
🚀 VM PLACEMENT OPTIMIZATION PROJECT STARTUP
===============================================================================
Starting all services...
===============================================================================
✅ Python 3.12.0 detected
📦 Installing Python dependencies...
✅ Installed flask>=2.3.0
✅ Installed flask-cors>=4.0.0
...
📦 Installing Node.js dependencies...
✅ React dependencies installed
✅ Chart.js dependencies installed
📁 Creating project directories...
✅ Created vmp/models
📊 Checking dataset...
✅ Generated sample data: vmp/vm_metrics.csv
🔧 Starting Backend API Server...
✅ Backend API started on http://localhost:5002
🤖 Starting ML API Server...
✅ ML API started on http://localhost:5001
⚛️  Starting React Frontend...
✅ React frontend starting on http://localhost:3000
⏳ Waiting for services to start...
🌐 Opening application in browser...
✅ Browser opened to http://localhost:3000

===============================================================================
🎉 ALL SERVICES STARTED SUCCESSFULLY!
===============================================================================
📱 Frontend:     http://localhost:3000
🔧 Backend API:  http://localhost:5002
🤖 ML API:       http://localhost:5001
===============================================================================
📋 Available Pages:
   • Dashboard:        http://localhost:3000/
   • Optimization:     http://localhost:3000/optimize
   • ML Comparison:    http://localhost:3000/ml-comparison
   • ML Simulation:    http://localhost:3000/simulate-ml
===============================================================================
🛑 Press Ctrl+C to stop all services
===============================================================================
```

---

## 🎯 Next Steps

1. **Run the startup script** (one command above)
2. **Wait for all services to start** (about 30 seconds)
3. **Browser opens automatically** to http://localhost:3000
4. **Explore the features:**
   - View real-time VM metrics on Dashboard
   - Run optimization algorithms
   - Compare ML models for VM placement
   - Simulate different scenarios

---

## 🆘 Need Help?

- **Check the console output** for specific error messages
- **Ensure all ports are free** (3000, 5001, 5002)
- **Try the manual setup** if automated script fails
- **Restart your computer** if you're having persistent issues

**The project is designed to work out-of-the-box with just one command!** 🚀
