// Simple API test script
// Run with: node test-api.js

const API_BASE = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing RouteMate API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    console.log('');

    // Test locations endpoint
    console.log('2. Testing locations endpoint...');
    const locationsResponse = await fetch(`${API_BASE}/locations`);
    const locationsData = await locationsResponse.json();
    console.log('✅ Locations found:', locationsData.length);
    console.log('Sample location:', locationsData[0]);
    console.log('');

    // Test adding a new location
    console.log('3. Testing add location endpoint...');
    const newLocation = {
      name: 'Test Location',
      lat: 45.4000,
      lng: -75.7000
    };

    const addResponse = await fetch(`${API_BASE}/locations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newLocation)
    });

    if (addResponse.ok) {
      const addData = await addResponse.json();
      console.log('✅ Location added:', addData);
    } else {
      console.log('❌ Failed to add location:', await addResponse.text());
    }

    console.log('\n🎉 API tests completed!');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('\n💡 Make sure the backend server is running on port 5000');
  }
}

// Run the test
testAPI();

