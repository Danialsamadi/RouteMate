# 🚀 RouteMate - One Command Setup

## ⚡ Quick Start (No Configuration Required)

### **Option 1: One Command Setup**
```bash
./start.sh
```

### **Option 2: Manual Start**
```bash
# Terminal 1 - Backend
cd backend && node server.js

# Terminal 2 - Frontend  
cd frontend && npm start
```

## 🎯 What You Get

- **🗺️ Interactive Google Maps** with GPS markers
- **📍 Sample Route** from Algonquin College to Downtown Ottawa
- **➕ Add New Locations** with real-time updates
- **🔗 Route Visualization** with polylines
- **📱 Responsive Design** for desktop and mobile

## 🌐 Access the App

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Health Check**: http://localhost:5001/api/health

## 🎨 Features

### **Demo Mode (Default)**
- Works immediately without database setup
- Shows sample GPS coordinates
- Demonstrates PostGIS concepts
- Perfect for presentations

### **Production Mode (Optional)**
- Set up Supabase database
- Real-time data persistence
- Scalable geospatial queries

## 🔧 Configuration (Optional)

### **For Google Maps (Required for full functionality)**
1. Get Google Maps API key
2. Add to `frontend/.env`:
   ```
   REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

### **For Database (Optional)**
1. Set up Supabase project
2. Add credentials to `backend/.env`
3. Run `backend/setup-database.sql`

## 📊 Sample Data

The app includes a complete route from Algonquin College to Downtown Ottawa:

1. **Algonquin College** (45.3499, -75.7574)
2. **Baseline Station** (45.3600, -75.7500)
3. **Bayview Station** (45.3800, -75.7200)
4. **Parliament Hill** (45.4215, -75.6972)
5. **Downtown Ottawa** (45.4200, -75.6900)

## 🎓 Perfect for Presentations

This setup demonstrates:
- **PostGIS** geospatial data storage
- **React** modern frontend development
- **Node.js** API development
- **Google Maps** integration
- **Real-time** data visualization

## 🛠️ Troubleshooting

### **Port Already in Use**
```bash
# Kill existing processes
pkill -f "node server.js"
pkill -f "react-scripts"
```

### **Missing Dependencies**
```bash
npm run install-all
```

### **Google Maps Not Loading**
- Add your Google Maps API key to `frontend/.env`
- Enable "Maps JavaScript API" in Google Cloud Console

## 🎉 Ready to Go!

Run `./start.sh` and open http://localhost:3000 to see your GPS visualization app in action!
