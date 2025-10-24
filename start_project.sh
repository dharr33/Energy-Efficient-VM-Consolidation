#!/bin/bash

echo "================================================================================"
echo "🚀 VM PLACEMENT OPTIMIZATION PROJECT STARTUP"
echo "================================================================================"
echo "Starting all services..."
echo "================================================================================"

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "❌ Python is not installed or not in PATH"
        echo "Please install Python 3.8+ from https://python.org"
        exit 1
    else
        PYTHON_CMD="python"
    fi
else
    PYTHON_CMD="python3"
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed or not in PATH"
    echo "Please install Node.js (includes npm) from https://nodejs.org"
    exit 1
fi

echo "✅ Python and Node.js detected"
echo ""

# Make the script executable
chmod +x start_project.py

# Run the Python startup script
echo "🚀 Starting unified project startup..."
$PYTHON_CMD start_project.py

echo ""
echo "👋 Project startup completed."
