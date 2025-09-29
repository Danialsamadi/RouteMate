import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import './App.css';

const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

// Default center (Ottawa)
const defaultCenter = {
  lat: 45.4223318,
  lng: -75.7370025
};

const mapContainerStyle = {
  width: '100%',
  height: '60vh',
  minHeight: '400px'
};

const mapOptions = {
  zoom: 12,
  center: defaultCenter,
  mapTypeId: 'roadmap'
};

function App() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newLocation, setNewLocation] = useState({ name: '', lat: '', lng: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', lat: '', lng: '' });
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);

  // Fetch locations from API
  const fetchLocations = async () => {
    try {
      setLoading(true);
      console.log('Fetching locations...');
      const response = await fetch('/api/locations');
      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }
      const data = await response.json();
      console.log('Fetched locations:', data);
      setLocations(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching locations:', err);
      setError('Failed to load locations. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Add new location
  const addLocation = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', newLocation);
    
    if (!newLocation.name || !newLocation.lat || !newLocation.lng) {
      alert('Please fill in all fields');
      return;
    }

    try {
      console.log('Sending request to /api/locations');
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newLocation.name,
          lat: parseFloat(newLocation.lat),
          lng: parseFloat(newLocation.lng)
        }),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(`Failed to add location: ${responseData.error || 'Unknown error'}`);
      }

      // Refresh locations
      await fetchLocations();
      setNewLocation({ name: '', lat: '', lng: '' });
      setShowAddForm(false);
      alert('Location added successfully!');
    } catch (err) {
      console.error('Error adding location:', err);
      alert(`Failed to add location: ${err.message}`);
    }
  };

  // Edit location
  const editLocation = async (e) => {
    e.preventDefault();
    
    if (!editForm.name || !editForm.lat || !editForm.lng) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch(`/api/locations/${editingLocation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editForm.name,
          lat: parseFloat(editForm.lat),
          lng: parseFloat(editForm.lng)
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(`Failed to update location: ${responseData.error || 'Unknown error'}`);
      }

      // Refresh locations
      await fetchLocations();
      setEditingLocation(null);
      setEditForm({ name: '', lat: '', lng: '' });
      alert('Location updated successfully!');
    } catch (err) {
      console.error('Error updating location:', err);
      alert(`Failed to update location: ${err.message}`);
    }
  };

  // Delete location
  const deleteLocation = async (locationId, locationName) => {
    if (!window.confirm(`Are you sure you want to delete "${locationName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/locations/${locationId}`, {
        method: 'DELETE',
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(`Failed to delete location: ${responseData.error || 'Unknown error'}`);
      }

      // Refresh locations
      await fetchLocations();
      alert('Location deleted successfully!');
    } catch (err) {
      console.error('Error deleting location:', err);
      alert(`Failed to delete location: ${err.message}`);
    }
  };

  // Start editing a location
  const startEdit = (location) => {
    setEditingLocation(location);
    setEditForm({
      name: location.name,
      lat: location.coordinates.lat.toString(),
      lng: location.coordinates.lng.toString()
    });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingLocation(null);
    setEditForm({ name: '', lat: '', lng: '' });
  };

  // Create reliable markers that will always show up
  const createReliableMarkers = useCallback((map) => {
    console.log('Creating reliable markers...');
    
    // Clear existing markers
    markersRef.current.forEach(marker => {
      if (marker.setMap) {
        marker.setMap(null);
      }
    });
    markersRef.current = [];

    // Initialize info window
    if (!infoWindowRef.current) {
      infoWindowRef.current = new window.google.maps.InfoWindow();
    }

    if (locations.length === 0) {
      // Create default marker
      console.log('Creating default marker at:', defaultCenter);
      const defaultMarker = new window.google.maps.Marker({
        map: map,
        position: defaultCenter,
        title: '1. Default Location - Algonquin College',
        label: {
          text: '1',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '14px'
        },
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          scaledSize: new window.google.maps.Size(32, 32)
        }
      });

      defaultMarker.addListener('click', () => {
        console.log('Default marker clicked');
        infoWindowRef.current.close();
        infoWindowRef.current.setContent(defaultMarker.title);
        infoWindowRef.current.open(defaultMarker.map, defaultMarker);
      });

      markersRef.current.push(defaultMarker);
      console.log('Default marker created and added to map');
      return;
    }

    // Create markers for each location
    console.log(`Creating ${locations.length} location markers`);
    locations.forEach((location, index) => {
      console.log(`Creating marker ${index + 1} for ${location.name}:`, {
        lat: location.coordinates.lat,
        lng: location.coordinates.lng
      });

      const marker = new window.google.maps.Marker({
        map: map,
        position: {
          lat: parseFloat(location.coordinates.lat),
          lng: parseFloat(location.coordinates.lng)
        },
        title: `${index + 1}. ${location.name}`,
        label: {
          text: `${index + 1}`,
          color: 'white',
          fontWeight: 'bold',
          fontSize: '12px'
        },
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
          scaledSize: new window.google.maps.Size(35, 35)
        }
      });

      marker.addListener('click', () => {
        console.log(`Marker clicked: ${location.name}`);
        infoWindowRef.current.close();
        infoWindowRef.current.setContent(`
          <div>
            <h3>${marker.title}</h3>
            <p><strong>Coordinates:</strong> ${location.coordinates.lat.toFixed(6)}, ${location.coordinates.lng.toFixed(6)}</p>
            <p><strong>ID:</strong> ${location.id}</p>
          </div>
        `);
        infoWindowRef.current.open(marker.map, marker);
      });

      markersRef.current.push(marker);
      console.log(`Marker ${index + 1} created and added to map`);
    });

    console.log(`Total markers created: ${markersRef.current.length}`);
  }, [locations]);

  useEffect(() => {
    fetchLocations();
  }, []);

  // Update markers when locations change
  useEffect(() => {
    if (mapRef.current && window.google && window.google.maps) {
      createReliableMarkers(mapRef.current);
    }
  }, [createReliableMarkers]);

  // Debug: Log when locations change
  console.log('Current locations:', locations);
  console.log('API_KEY present:', !!API_KEY);
  console.log('Locations with coordinates:', locations.map(loc => ({
    id: loc.id,
    name: loc.name,
    lat: loc.coordinates?.lat,
    lng: loc.coordinates?.lng
  })));

  if (!API_KEY) {
    return (
      <div className="error-container">
        <h2>Google Maps API Key Required</h2>
        <p>Please add your Google Maps API key to the environment variables.</p>
        <p>Copy <code>frontend/env.example</code> to <code>frontend/.env</code> and add your API key.</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>RouteMate - GPS Visualization</h1>
        <div className="controls">
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : 'Add Location'}
          </button>
          <button 
            className="btn btn-secondary"
            onClick={fetchLocations}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </header>

      {showAddForm && (
        <div className="add-form">
          <h3>Add New Location</h3>
          <form onSubmit={addLocation} onKeyDown={(e) => console.log('Form keydown:', e.key)}>
            <input
              type="text"
              placeholder="Location name"
              value={newLocation.name}
              onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
              required
            />
            <input
              type="number"
              step="any"
              placeholder="Latitude"
              value={newLocation.lat}
              onChange={(e) => setNewLocation({...newLocation, lat: e.target.value})}
              required
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude"
              value={newLocation.lng}
              onChange={(e) => setNewLocation({...newLocation, lng: e.target.value})}
              required
            />
            <button type="submit" className="btn btn-success" onClick={() => console.log('Submit button clicked')}>Add Location</button>
          </form>
        </div>
      )}

      {editingLocation && (
        <div className="edit-form">
          <h3>Edit Location: {editingLocation.name}</h3>
          <form onSubmit={editLocation}>
            <input
              type="text"
              placeholder="Location name"
              value={editForm.name}
              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
              required
            />
            <input
              type="number"
              step="any"
              placeholder="Latitude"
              value={editForm.lat}
              onChange={(e) => setEditForm({...editForm, lat: e.target.value})}
              required
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude"
              value={editForm.lng}
              onChange={(e) => setEditForm({...editForm, lng: e.target.value})}
              required
            />
            <div className="form-buttons">
              <button type="submit" className="btn btn-success">Save Changes</button>
              <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <div className="map-container">
        <LoadScript 
          googleMapsApiKey={API_KEY}
          loadingElement={<div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Map...</div>}
        >
          <GoogleMap
            key={locations.length} // Force re-render when locations change
            mapContainerStyle={mapContainerStyle}
            options={mapOptions}
            zoom={12}
            center={locations.length > 0 ? {
              lat: locations[0].coordinates.lat,
              lng: locations[0].coordinates.lng
            } : defaultCenter}
            onLoad={(map) => {
              console.log('Map loaded successfully');
              console.log('Map center:', map.getCenter());
              console.log('Map zoom:', map.getZoom());
              console.log('Locations to render:', locations.length);
              mapRef.current = map;
              createReliableMarkers(map);
            }}
            onError={(error) => {
              console.error('Map error:', error);
            }}
          >
            {/* Markers are created programmatically in createReliableMarkers function */}
          </GoogleMap>
        </LoadScript>
      </div>

      <div className="info-panel">
        <h3>Locations ({locations.length})</h3>
        {loading ? (
          <p>Loading locations...</p>
        ) : locations.length === 0 ? (
          <p>No locations found. Add some locations to see them on the map!</p>
        ) : (
          <ul>
            {locations.map((location, index) => (
              <li key={location.id} className="location-item">
                <div className="location-info">
                  <strong>{index + 1}. {location.name}</strong>
                  <br />
                  <small>
                    Lat: {location.coordinates.lat.toFixed(6)}, 
                    Lng: {location.coordinates.lng.toFixed(6)}
                  </small>
                </div>
                <div className="location-actions">
                  <button 
                    className="btn btn-edit"
                    onClick={() => startEdit(location)}
                    title="Edit location"
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-delete"
                    onClick={() => deleteLocation(location.id, location.name)}
                    title="Delete location"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
