# 🚀 RouteMate Setup Guide

This guide will walk you through setting up the complete RouteMate application.

## 📋 Prerequisites

- Node.js (v16 or higher)
- A Supabase account (free tier available)
- A Google Maps API key

## 🔧 Step-by-Step Setup

### 1. Supabase Database Setup

1. **Create a new Supabase project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and anon key

2. **Enable PostGIS extension**:
   - In your Supabase dashboard, go to SQL Editor
   - Run this command:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

3. **Create the locations table**:
   - Copy the contents of `backend/setup-database.sql`
   - Paste and run it in the Supabase SQL Editor
   - This will create the table and insert sample data

### 2. Backend Setup

1. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp env.example .env
   ```
   - Edit `.env` and add your Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   PORT=5000
   NODE_ENV=development
   ```

3. **Start the backend server**:
   ```bash
   npm run dev
   ```
   - Server will run on http://localhost:5000
   - Test with: http://localhost:5000/api/health

### 3. Frontend Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Configure Google Maps API**:
   ```bash
   cp env.example .env
   ```
   - Edit `.env` and add your Google Maps API key:
   ```
   REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

3. **Start the frontend**:
   ```bash
   npm start
   ```
   - App will run on http://localhost:3000

### 4. Google Maps API Setup

1. **Get a Google Maps API key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable the "Maps JavaScript API"
   - Create credentials (API key)
   - Restrict the key to your domain (optional but recommended)

2. **Required APIs**:
   - Maps JavaScript API
   - (Optional) Geocoding API for address lookup

## 🎯 Quick Start (All at Once)

From the root directory:

```bash
# Install all dependencies
npm run install-all

# Set up environment variables (see steps above)

# Run both servers
npm run dev
```

## 🧪 Testing the Application

1. **Backend API Test**:
   ```bash
   curl http://localhost:5000/api/health
   curl http://localhost:5000/api/locations
   ```

2. **Frontend Test**:
   - Open http://localhost:3000
   - You should see the map with markers for the sample route
   - Try adding a new location using the "Add Location" button

## 📊 Sample Data

The application comes with sample GPS coordinates for a route from Algonquin College to downtown Ottawa:

- Algonquin College (45.3499, -75.7574)
- Baseline Station (45.3600, -75.7500)
- Bayview Station (45.3800, -75.7200)
- Parliament Hill (45.4215, -75.6972)
- Downtown Ottawa (45.4200, -75.6900)

## 🔍 Troubleshooting

### Common Issues:

1. **"Google Maps API Key Required"**:
   - Make sure you've set `REACT_APP_GOOGLE_MAPS_API_KEY` in `frontend/.env`

2. **"Failed to load locations"**:
   - Check if backend server is running on port 5000
   - Verify Supabase credentials in `backend/.env`

3. **Database connection errors**:
   - Ensure PostGIS extension is enabled in Supabase
   - Check that the locations table was created successfully

4. **CORS errors**:
   - The backend is configured to allow CORS from the frontend
   - If issues persist, check the proxy setting in `frontend/package.json`

## 📚 API Endpoints

- `GET /api/health` - Health check
- `GET /api/locations` - Get all locations
- `POST /api/locations` - Add new location
- `GET /api/route/:userId` - Get route for specific user

## 🎨 Features

- **Interactive Map**: Google Maps with markers and polylines
- **Real-time Updates**: Add locations and see them immediately
- **Route Visualization**: Connected path showing the journey
- **Responsive Design**: Works on desktop and mobile
- **Geospatial Queries**: PostGIS-powered location storage

## 🔧 Development

- Backend: Node.js + Express + Supabase
- Frontend: React + Google Maps API
- Database: PostgreSQL + PostGIS
- Development: Hot reload for both frontend and backend

