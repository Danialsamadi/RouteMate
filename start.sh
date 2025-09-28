#!/bin/bash

echo "🚀 Starting RouteMate - Complete GPS Visualization App"
echo "=================================================="

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "node server.js" 2>/dev/null || true
pkill -f "react-scripts" 2>/dev/null || true
pkill -f "concurrently" 2>/dev/null || true

# Wait a moment
sleep 2

echo "📦 Starting Backend Server..."
cd backend
node server.js &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

echo "🎨 Starting Frontend App..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ RouteMate is now running!"
echo "📍 Backend API: http://localhost:5001"
echo "🌐 Frontend App: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
wait
