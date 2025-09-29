# RouteMate - Advanced Database Topics Project

**Course**: CST8276 Advanced Database Topics  
**Project**: GPS Location Storage & Visualization using PostGIS

A full-stack application that demonstrates advanced database concepts including geospatial data storage using PostGIS and visualization with Google Maps APIs.

## Project Overview

This project showcases advanced database topics from CST8276:
- **Geospatial Data Storage**: PostGIS extension for efficient GPS coordinate storage
- **Database Architecture**: PostgreSQL with PostGIS for spatial queries
- **Backend**: Node.js + Express API for data management  
- **Frontend**: React + Google Maps for interactive visualization
- **Features**: GPS coordinate storage, route visualization, bulk data import, and real-time mapping

## Tech Stack

- **Database**: Supabase (PostgreSQL with PostGIS extension)
- **Backend**: Node.js, Express, Supabase JS Client
- **Frontend**: React, Google Maps API, @react-google-maps/api
- **Development**: Concurrently for running both servers

## Quick Start

1. **Install dependencies**:
   ```bash
   npm run install-all
   ```

2. **Set up environment variables**:
   - Copy `backend/env.example` to `backend/.env`
   - Add your Supabase URL and API key
   - Copy `frontend/env.example` to `frontend/.env`
   - Add your Google Maps API key

3. **Set up the database**:
   - Create a Supabase project
   - Enable PostGIS extension
   - Run the SQL from `backend/setup-database.sql`

4. **Run the application**:
   ```bash
   npm run dev
   ```

## Demo Data

The application includes sample GPS coordinates for a route from Algonquin College to downtown Ottawa:
- Algonquin College (45.3499, -75.7574)
- Baseline Station (45.3600, -75.7500)  
- Bayview Station (45.3800, -75.7200)
- Parliament Hill (45.4215, -75.6972)
- Downtown Ottawa (45.4200, -75.6900)

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/locations` - Fetch all GPS locations
- `POST /api/locations` - Add new GPS location
- `POST /api/locations/bulk` - Bulk import multiple locations
- `PUT /api/locations/:id` - Update existing location
- `DELETE /api/locations/:id` - Delete location

## Project Structure

```
RouteMate/
├── backend/              # Node.js API server
│   ├── server.js         # Express server
│   ├── setup-database.sql # Database schema & sample data
│   ├── test-api.js       # API testing script
│   └── package.json      # Backend dependencies
├── frontend/             # React application
│   ├── src/
│   │   ├── App.js        # Main React component
│   │   ├── App.css       # Styling
│   │   └── index.js      # React entry point
│   └── package.json      # Frontend dependencies
├── package.json          # Root package configuration
├── SETUP.md              # Detailed setup guide
├── demo.md               # Presentation demo script
└── README.md             # Project documentation
```

## Key Features

### **PostGIS Integration**
- Single GEOGRAPHY column stores lat/lng as PostGIS POINT
- Enables powerful geospatial queries (distance, nearest neighbor, etc.)
- More efficient than separate latitude/longitude columns
- Demonstrates advanced database spatial capabilities

### **Bulk Data Import**
- CSV file import for efficient data entry
- Preview system for data validation
- Bulk database operations for performance
- Demonstrates data migration and ETL concepts

### **Real-time Visualization**
- Interactive Google Maps with markers and polylines
- Add new locations and see them immediately
- Responsive design for desktop and mobile
- Accessibility features for inclusive design

### **Modern Architecture**
- RESTful API with proper error handling
- React frontend with Google Maps integration
- Supabase for managed PostgreSQL with PostGIS
- Demonstrates full-stack development practices

## Testing

Test the API endpoints:
```bash
# Health check
curl http://localhost:5000/api/health

# Get all locations  
curl http://localhost:5000/api/locations

# Add new location
curl -X POST http://localhost:5000/api/locations \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Location", "lat": 45.4000, "lng": -75.7000}'

# Bulk import locations
curl -X POST http://localhost:5000/api/locations/bulk \
  -H "Content-Type: application/json" \
  -d '{"locations": [{"name": "Location 1", "lat": 45.4000, "lng": -75.7000}, {"name": "Location 2", "lat": 45.4100, "lng": -75.7100}]}'
```

## CST8276 Learning Objectives Demonstrated

This project demonstrates key concepts from Advanced Database Topics:

### **Spatial Database Concepts**
- PostGIS extension for geospatial data storage
- GEOGRAPHY vs GEOMETRY data types
- Spatial indexing and query optimization
- Coordinate system transformations

### **Advanced Query Techniques**
- Spatial SQL functions (ST_Distance, ST_Within, etc.)
- Geospatial joins and spatial relationships
- Performance optimization for spatial queries
- Bulk data operations and transactions

### **Database Architecture**
- Extension management in PostgreSQL
- Spatial data modeling and normalization
- API design for spatial data access
- Error handling and data validation

### **Real-world Applications**
- GPS coordinate storage and retrieval
- Route planning and optimization
- Geospatial data visualization
- Bulk data import and migration

## Documentation

- **[SETUP.md](SETUP.md)** - Complete setup guide
- **[demo.md](demo.md)** - Presentation demo script
- **[backend/setup-database.sql](backend/setup-database.sql)** - Database schema and sample data
