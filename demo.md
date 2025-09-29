# RouteMate Demo Script

This script outlines how to present the RouteMate project effectively in your presentation.

## Pre-Demo Checklist

- [ ] Supabase project created with PostGIS enabled
- [ ] Database table created with sample data
- [ ] Backend server running (port 5000)
- [ ] Frontend app running (port 3000)
- [ ] Google Maps API key configured
- [ ] All dependencies installed
- [ ] Sample CSV file ready for bulk import demo

## Demo Flow (15-20 minutes)

### 1. **Project Introduction** (2 minutes)
- "Today I'll demonstrate how to efficiently store GPS coordinates using PostGIS and visualize them with Google Maps"
- "This full-stack application shows modern geospatial data handling"

### 2. **Database Architecture** (3 minutes)
- Show Supabase dashboard
- Explain PostGIS extension: "Instead of storing lat/lng in separate columns, we use a single GEOGRAPHY column"
- Run the SQL query from `setup-database.sql`
- Show the sample data: "5 points representing a route from Algonquin College to downtown Ottawa"

```sql
-- Show this query in Supabase SQL editor
SELECT 
    id,
    name,
    ST_AsText(coordinates) as coordinates_text,
    ST_X(coordinates::geometry) as longitude,
    ST_Y(coordinates::geometry) as latitude,
    created_at
FROM locations 
ORDER BY created_at;
```

### 3. **Backend API** (3 minutes)
- Show the Node.js server code
- Highlight the PostGIS integration: "We transform coordinates for the frontend"
- Test the API endpoints:
  ```bash
  # In terminal
  curl http://localhost:5000/api/health
  curl http://localhost:5000/api/locations
  ```
- Show the JSON response with transformed coordinates

### 4. **Frontend Visualization** (5 minutes)
- Open the React app (http://localhost:3000)
- Point out the Google Maps integration
- Show the markers for each GPS point
- Demonstrate adding a new location manually
- Show real-time updates

### 5. **CSV Bulk Import Feature** (4 minutes)
- Click the "Import CSV" button
- Upload a sample CSV file with multiple locations
- Show the preview of locations to be imported
- Demonstrate bulk import functionality
- Show all locations appearing on the map instantly
- Explain the efficiency of bulk operations vs manual entry

### 6. **Technical Benefits** (2 minutes)
- **PostGIS advantages**: Single field storage, geospatial queries, distance calculations
- **Modern stack**: React for UI, Node.js for API, Supabase for database
- **Scalability**: Can handle thousands of GPS points efficiently

## Key Talking Points

### **Why PostGIS?**
- "Traditional approach stores latitude and longitude in separate columns"
- "PostGIS stores them as a single GEOGRAPHY point, enabling powerful geospatial queries"
- "We can find nearest locations, calculate distances, and perform spatial joins"

### **API Design**
- "RESTful endpoints provide clean separation between frontend and database"
- "JSON responses are optimized for Google Maps consumption"
- "Error handling ensures robust user experience"
- "Bulk import endpoint handles multiple locations efficiently"

### **Google Maps Integration**
- "React Google Maps API provides smooth, interactive mapping"
- "Markers show individual GPS points with accessibility features"
- "Clickable markers with info windows for detailed information"
- "Real-time updates demonstrate live data flow"

### **CSV Import Functionality**
- "Bulk import feature allows efficient data entry"
- "CSV parsing handles standard format with validation"
- "Preview system shows data before import"
- "PostGIS bulk insert operations for performance"

## Live Coding Demo (Optional)

If you want to show live coding:

1. **Add a new location via API**:
   ```bash
   curl -X POST http://localhost:5000/api/locations \
     -H "Content-Type: application/json" \
     -d '{"name": "New Location", "lat": 45.4000, "lng": -75.7000}'
   ```

2. **Bulk import via API**:
   ```bash
   curl -X POST http://localhost:5000/api/locations/bulk \
     -H "Content-Type: application/json" \
     -d '{"locations": [{"name": "Location 1", "lat": 45.4000, "lng": -75.7000}, {"name": "Location 2", "lat": 45.4100, "lng": -75.7100}]}'
   ```

3. **Show the database update**:
   - Refresh the Supabase dashboard
   - Show the new records in the locations table

4. **Show frontend update**:
   - Refresh the React app
   - New markers appear on the map
   - Demonstrate CSV import functionality

## Sample Queries to Show

### **Distance Calculation**
```sql
-- Calculate distance between first and last points
SELECT 
    ST_Distance(
        (SELECT coordinates FROM locations ORDER BY created_at LIMIT 1),
        (SELECT coordinates FROM locations ORDER BY created_at DESC LIMIT 1)
    ) as distance_meters;
```

### **Route Length**
```sql
-- Calculate total route length
SELECT ST_Length(ST_MakeLine(coordinates::geometry ORDER BY created_at)) as total_distance_meters
FROM locations;
```

### **Nearest Location**
```sql
-- Find nearest location to a given point
SELECT name, ST_Distance(coordinates, ST_GeogFromText('POINT(-75.7000 45.4000)')) as distance_meters
FROM locations 
ORDER BY coordinates <-> ST_GeogFromText('POINT(-75.7000 45.4000)')
LIMIT 1;
```

## Conclusion

- "This demonstrates modern geospatial data handling"
- "PostGIS provides powerful spatial capabilities"
- "React and Google Maps create engaging user experiences"
- "Bulk import functionality demonstrates efficient data management"
- "The full stack is production-ready and scalable"

## Troubleshooting

### **If the map doesn't load**:
- Check Google Maps API key
- Verify API key has Maps JavaScript API enabled

### **If locations don't appear**:
- Check backend server is running
- Verify Supabase credentials
- Check browser console for errors

### **If database queries fail**:
- Ensure PostGIS extension is enabled
- Verify the locations table exists
- Check sample data was inserted

### **If CSV import fails**:
- Verify CSV format matches expected structure
- Check file is valid CSV format
- Ensure all required fields are present

## Mobile Demo

- The app is responsive and works on mobile
- Show how the interface adapts to smaller screens
- Demonstrate touch interactions with the map
- CSV import works on mobile devices
