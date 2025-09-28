-- RouteMate Database Setup
-- Run this in your Supabase SQL editor

-- Enable PostGIS extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create locations table with PostGIS geography column
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    coordinates GEOGRAPHY(POINT, 4326) NOT NULL,
    user_id TEXT DEFAULT 'default_user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on coordinates for better geospatial query performance
CREATE INDEX IF NOT EXISTS idx_locations_coordinates ON locations USING GIST (coordinates);

-- Create index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_locations_created_at ON locations (created_at);

-- Insert sample data: Route from Algonquin College to Downtown Ottawa
INSERT INTO locations (name, coordinates) VALUES
('Algonquin College', ST_GeogFromText('POINT(-75.7574 45.3499)')),
('Baseline Station', ST_GeogFromText('POINT(-75.7500 45.3600)')),
('Bayview Station', ST_GeogFromText('POINT(-75.7200 45.3800)')),
('Parliament Hill', ST_GeogFromText('POINT(-75.6972 45.4215)')),
('Downtown Ottawa', ST_GeogFromText('POINT(-75.6900 45.4200)'));

-- Verify the data was inserted correctly
SELECT 
    id,
    name,
    ST_AsText(coordinates) as coordinates_text,
    ST_X(coordinates::geometry) as longitude,
    ST_Y(coordinates::geometry) as latitude,
    created_at
FROM locations 
ORDER BY created_at;

-- Example geospatial queries you can run:

-- 1. Find all locations within 5km of Algonquin College
-- SELECT name, ST_Distance(coordinates, ST_GeogFromText('POINT(-75.7574 45.3499)')) as distance_meters
-- FROM locations 
-- WHERE ST_DWithin(coordinates, ST_GeogFromText('POINT(-75.7574 45.3499)'), 5000);

-- 2. Calculate total distance of the route
-- SELECT ST_Length(ST_MakeLine(coordinates::geometry ORDER BY created_at)) as total_distance_meters
-- FROM locations;

-- 3. Find nearest location to a given point
-- SELECT name, ST_Distance(coordinates, ST_GeogFromText('POINT(-75.7000 45.4000)')) as distance_meters
-- FROM locations 
-- ORDER BY coordinates <-> ST_GeogFromText('POINT(-75.7000 45.4000)')
-- LIMIT 1;
