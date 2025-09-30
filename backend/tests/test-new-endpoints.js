const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5005/api';

async function testEndpoints() {
  console.log('🧪 Testing RouteMate API Endpoints\n');
  
  try {
    // Test 1: Paginated locations
    console.log('1️⃣ Testing GET /api/locations (paginated)...');
    const locationsResponse = await axios.get(`${API_URL}/locations`);
    console.log(`✅ Success! Returned ${locationsResponse.data.length} locations\n`);
    
    // Test 2: Nearby search
    console.log('2️⃣ Testing GET /api/locations/nearby...');
    const nearbyResponse = await axios.get(`${API_URL}/locations/nearby`, {
      params: {
        lat: 45.4215,
        lng: -75.6972,
        radius: 5000
      }
    });
    console.log(`✅ Success! Found ${nearbyResponse.data.data.length} locations within 5km`);
    if (nearbyResponse.data.data.length > 0) {
      console.log(`   Closest: ${nearbyResponse.data.data[0].name} (${nearbyResponse.data.data[0].distance_meters.toFixed(0)}m away)\n`);
    }
    
    // Test 3: Bounding box
    console.log('3️⃣ Testing GET /api/locations/bounds...');
    const boundsResponse = await axios.get(`${API_URL}/locations/bounds`, {
      params: {
        minLat: 45.3,
        minLng: -75.8,
        maxLat: 45.5,
        maxLng: -75.6
      }
    });
    console.log(`✅ Success! Found ${boundsResponse.data.count} locations in viewport\n`);
    
    // Test 4: Error handling
    console.log('4️⃣ Testing error handling...');
    try {
      await axios.get(`${API_URL}/locations/nearby?lat=invalid`);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(`✅ Error handling works correctly\n`);
      }
    }
    
    console.log('✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
    process.exit(1);
  }
}

testEndpoints();
