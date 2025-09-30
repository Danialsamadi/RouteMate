const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
dotenv.config();


const app = express();
const PORT = process.env.PORT || 5001;

// Initialize Supabase client (with fallback for demo)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
let supabase = null;

// Debug: Log environment variables
console.log('🔍 Environment variables:');
console.log('SUPABASE_URL:', supabaseUrl);
console.log('SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Not set');

// Only create Supabase client if we have valid credentials
if (supabaseUrl && supabaseKey && supabaseUrl !== 'your_supabase_project_url_here' && supabaseUrl.includes('supabase.co')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client initialized');
  } catch (error) {
    console.log('⚠️  Supabase client failed to initialize, running in demo mode');
    supabase = null;
  }
} else {
  console.log('📱 Running in demo mode - no Supabase credentials provided');
  supabase = null;
}

// Middleware
app.use(cors());
app.use(express.json());

// Routes

// Get all locations
app.get('/api/locations', async (req, res) => {
  try {
    // Check if Supabase is configured
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    // Use RPC to call a function that extracts coordinates using st_x() and st_y()
    const { data, error } = await supabase.rpc('get_locations_with_coords');

    if (error) {
      console.error('Error fetching locations:', error);
      return res.status(500).json({ error: 'Failed to fetch locations from database' });
    }

    // Check if we have data
    if (!data || data.length === 0) {
      console.log('📱 No data found in database');
      return res.json([]);
    }

    // Transform coordinates for frontend
    const transformedData = data.map(location => {
      console.log('Processing location:', location.name, 'lat:', location.lat, 'lng:', location.lng);
      
      return {
        id: location.id,
        name: location.name,
        coordinates: { 
          lat: parseFloat(location.lat), 
          lng: parseFloat(location.lng) 
        },
        created_at: location.created_at
      };
    });

    // Return the transformed data (even if empty)
    res.json(transformedData);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new location
app.post('/api/locations', async (req, res) => {
  try {
    const { name, lat, lng } = req.body;

    if (!name || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'Name, latitude, and longitude are required' });
    }

    // Check if Supabase is configured
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    // Create PostGIS POINT from lat/lng
    const { data, error } = await supabase
      .from('locations')
      .insert([
        {
          name,
          coordinates: `POINT(${lng} ${lat})` // PostGIS format: POINT(longitude latitude)
        }
      ])
      .select();

    if (error) {
      console.error('Error inserting location:', error);
      return res.status(500).json({ error: 'Failed to insert location' });
    }

    res.status(201).json({
      message: 'Location added successfully',
      location: data[0]
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk import locations from CSV
app.post('/api/locations/bulk', async (req, res) => {
  try {
    const { locations } = req.body;

    if (!locations || !Array.isArray(locations) || locations.length === 0) {
      return res.status(400).json({ error: 'Locations array is required and must not be empty' });
    }

    // Check if Supabase is configured
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    // Validate each location
    for (const location of locations) {
      if (!location.name || location.lat === undefined || location.lng === undefined) {
        return res.status(400).json({ 
          error: `Invalid location data: ${JSON.stringify(location)}. Name, lat, and lng are required.` 
        });
      }
    }

    // Prepare locations for bulk insert
    const locationsToInsert = locations.map(location => ({
      name: location.name,
      coordinates: `POINT(${location.lng} ${location.lat})` // PostGIS format: POINT(longitude latitude)
    }));

    // Insert all locations at once
    const { data, error } = await supabase
      .from('locations')
      .insert(locationsToInsert)
      .select();

    if (error) {
      console.error('Error bulk inserting locations:', error);
      return res.status(500).json({ error: 'Failed to insert locations' });
    }

    res.status(201).json({
      message: `Successfully imported ${data.length} locations`,
      locations: data
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a location
app.delete('/api/locations/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Location ID is required' });
    }

    // Check if Supabase is configured
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    // Delete the location
    const { data, error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error deleting location:', error);
      return res.status(500).json({ error: 'Failed to delete location' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json({
      message: 'Location deleted successfully',
      deletedLocation: data[0]
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a location
app.put('/api/locations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, lat, lng } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Location ID is required' });
    }

    if (!name || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'Name, latitude, and longitude are required' });
    }

    // Check if Supabase is configured
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    // Update the location
    const { data, error } = await supabase
      .from('locations')
      .update({
        name,
        coordinates: `POINT(${lng} ${lat})` // PostGIS format: POINT(longitude latitude)
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating location:', error);
      return res.status(500).json({ error: 'Failed to update location' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json({
      message: 'Location updated successfully',
      location: data[0]
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/locations/nearby - Find locations within radius
app.get('/api/locations/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ 
        error: 'Latitude and longitude are required',
        example: '/api/locations/nearby?lat=45.4215&lng=-75.6972&radius=5000'
      });
    }
    
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }
    
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusMeters = parseInt(radius);
    
    if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusMeters)) {
      return res.status(400).json({ 
        error: 'Invalid parameters. lat, lng must be numbers, radius must be integer'
      });
    }
    
    const { data, error } = await supabase.rpc('nearby_locations', {
      lat: latitude,
      lng: longitude,
      radius_meters: radiusMeters
    });
    
    if (error) {
      console.error('Error in proximity search:', error);
      return res.status(500).json({ error: error.message });
    }
    
    res.set('Cache-Control', 'public, max-age=60');
    res.json({
      data,
      query: {
        center: { lat: latitude, lng: longitude },
        radius_meters: radiusMeters,
        count: data.length
      }
    });
  } catch (error) {
    console.error('Error in proximity search:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/locations/bounds - Get locations within map viewport
app.get('/api/locations/bounds', async (req, res) => {
  try {
    const { minLat, minLng, maxLat, maxLng } = req.query;
    
    if (!minLat || !minLng || !maxLat || !maxLng) {
      return res.status(400).json({ 
        error: 'All bounds parameters required: minLat, minLng, maxLat, maxLng'
      });
    }
    
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }
    
    const { data, error } = await supabase.rpc('locations_in_bounds', {
      min_lat: parseFloat(minLat),
      min_lng: parseFloat(minLng),
      max_lat: parseFloat(maxLat),
      max_lng: parseFloat(maxLng)
    });
    
    if (error) {
      console.error('Error fetching locations in bounds:', error);
      return res.status(500).json({ error: error.message });
    }
    
    res.set('Cache-Control', 'public, max-age=60');
    res.json({
      data,
      bounds: { minLat, minLng, maxLat, maxLng },
      count: data.length
    });
  } catch (error) {
    console.error('Error fetching locations in bounds:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a single location by ID
app.get('/api/locations/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Location ID is required' });
    }

    // Check if Supabase is configured
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    // Get the location using RPC function
    const { data, error } = await supabase.rpc('get_locations_with_coords');

    if (error) {
      console.error('Error fetching location:', error);
      return res.status(500).json({ error: 'Failed to fetch location' });
    }

    // Find the specific location by ID
    const location = data.find(loc => loc.id === parseInt(id));

    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json({
      id: location.id,
      name: location.name,
      coordinates: { 
        lat: parseFloat(location.lat), 
        lng: parseFloat(location.lng) 
      },
      created_at: location.created_at
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Partial update a location (PATCH)
app.patch('/api/locations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, lat, lng } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Location ID is required' });
    }

    // Check if Supabase is configured
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    // Build update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (lat !== undefined && lng !== undefined) {
      updateData.coordinates = `POINT(${lng} ${lat})`;
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No fields provided for update' });
    }

    // Update the location
    const { data, error } = await supabase
      .from('locations')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating location:', error);
      return res.status(500).json({ error: 'Failed to update location' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json({
      message: 'Location updated successfully',
      location: data[0]
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get route for specific user (if implementing user-specific routes)
app.get('/api/route/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Use RPC to call a function that extracts coordinates using st_x() and st_y()
    const { data, error } = await supabase.rpc('get_locations_with_coords_by_user', { user_id: userId });

    if (error) {
      console.error('Error fetching route:', error);
      return res.status(500).json({ error: 'Failed to fetch route' });
    }

    // Transform coordinates for frontend
    const transformedData = data.map(location => ({
      id: location.id,
      name: location.name,
      coordinates: {
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lng)
      },
      created_at: location.created_at
    }));

    res.json(transformedData);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'RouteMate API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 RouteMate API server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});
