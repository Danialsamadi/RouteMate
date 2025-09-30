const axios = require('axios');
const { performance } = require('perf_hooks');
const os = require('os');

const API_URL = process.env.API_URL || 'http://localhost:5005/api';

// System information
function getSystemInfo() {
  return {
    platform: os.platform(),
    arch: os.arch(),
    nodeVersion: process.version,
    totalMemory: Math.round(os.totalmem() / 1024 / 1024 / 1024 * 100) / 100 + ' GB',
    freeMemory: Math.round(os.freemem() / 1024 / 1024 / 1024 * 100) / 100 + ' GB',
    cpuCount: os.cpus().length,
    uptime: Math.round(os.uptime() / 60) + ' minutes'
  };
}

// Advanced performance testing
async function testDatabasePerformance() {
  console.log('\n🗄️  Database Performance Analysis');
  console.log('===================================');
  
  const tests = [
    {
      name: 'Small Dataset (100 items)',
      endpoint: '/locations/nearby',
      params: { lat: 45.4215, lng: -75.6972, radius: 1000 },
      iterations: 10
    },
    {
      name: 'Medium Dataset (500 items)',
      endpoint: '/locations/nearby',
      params: { lat: 45.4215, lng: -75.6972, radius: 3000 },
      iterations: 10
    },
    {
      name: 'Large Dataset (1000+ items)',
      endpoint: '/locations/bounds',
      params: { minLat: 45.0, minLng: -76.0, maxLat: 46.0, maxLng: -75.0 },
      iterations: 10
    }
  ];
  
  const results = {};
  
  for (const test of tests) {
    console.log(`\n📊 Testing: ${test.name}`);
    const times = [];
    
    for (let i = 0; i < test.iterations; i++) {
      const start = performance.now();
      try {
        const response = await axios.get(`${API_URL}${test.endpoint}`, { params: test.params });
        const end = performance.now();
        const duration = end - start;
        times.push(duration);
        
        console.log(`  Iteration ${i + 1}: ${duration.toFixed(2)}ms (${response.data.data?.length || response.data.length} items)`);
      } catch (error) {
        console.log(`  ❌ Iteration ${i + 1}: Failed - ${error.message}`);
      }
    }
    
    if (times.length > 0) {
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const min = Math.min(...times);
      const max = Math.max(...times);
      const median = times.sort((a, b) => a - b)[Math.floor(times.length / 2)];
      
      results[test.name] = {
        average: avg,
        minimum: min,
        maximum: max,
        median: median,
        iterations: times.length
      };
      
      console.log(`  📈 Average: ${avg.toFixed(2)}ms`);
      console.log(`  ⚡ Fastest: ${min.toFixed(2)}ms`);
      console.log(`  🐌 Slowest: ${max.toFixed(2)}ms`);
      console.log(`  📊 Median: ${median.toFixed(2)}ms`);
    }
  }
  
  return results;
}

async function testSpatialQueryPerformance() {
  console.log('\n🗺️  Spatial Query Performance Analysis');
  console.log('======================================');
  
  const spatialTests = [
    {
      name: 'Point-in-Radius Query',
      endpoint: '/locations/nearby',
      params: { lat: 45.4215, lng: -75.6972, radius: 1000 },
      description: 'Find locations within 1km radius'
    },
    {
      name: 'Bounding Box Query',
      endpoint: '/locations/bounds',
      params: { minLat: 45.4, minLng: -75.7, maxLat: 45.5, maxLng: -75.6 },
      description: 'Find locations in specific map bounds'
    },
    {
      name: 'Large Radius Query',
      endpoint: '/locations/nearby',
      params: { lat: 45.4215, lng: -75.6972, radius: 10000 },
      description: 'Find locations within 10km radius'
    }
  ];
  
  const results = {};
  
  for (const test of spatialTests) {
    console.log(`\n🔍 ${test.name}: ${test.description}`);
    
    const times = [];
    for (let i = 0; i < 5; i++) {
      const start = performance.now();
      try {
        const response = await axios.get(`${API_URL}${test.endpoint}`, { params: test.params });
        const end = performance.now();
        const duration = end - start;
        times.push(duration);
        
        const resultCount = response.data.data?.length || response.data.length;
        console.log(`  Iteration ${i + 1}: ${duration.toFixed(2)}ms (${resultCount} results)`);
      } catch (error) {
        console.log(`  ❌ Iteration ${i + 1}: Failed - ${error.message}`);
      }
    }
    
    if (times.length > 0) {
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      results[test.name] = {
        average: avg,
        iterations: times.length
      };
    }
  }
  
  return results;
}

async function testConcurrentLoad() {
  console.log('\n⚡ Concurrent Load Testing');
  console.log('===========================');
  
  const concurrentLevels = [1, 5, 10, 20];
  const results = {};
  
  for (const level of concurrentLevels) {
    console.log(`\n🔥 Testing ${level} concurrent requests...`);
    
    const start = performance.now();
    const promises = Array.from({ length: level }, async (_, i) => {
      const requestStart = performance.now();
      try {
        const response = await axios.get(`${API_URL}/locations/nearby`, {
          params: { lat: 45.4215, lng: -75.6972, radius: 5000 }
        });
        const requestEnd = performance.now();
        return {
          success: true,
          duration: requestEnd - requestStart,
          status: response.status
        };
      } catch (error) {
        const requestEnd = performance.now();
        return {
          success: false,
          duration: requestEnd - requestStart,
          error: error.message
        };
      }
    });
    
    const responses = await Promise.all(promises);
    const totalTime = performance.now() - start;
    
    const successful = responses.filter(r => r.success);
    const failed = responses.filter(r => !r.success);
    
    results[`${level} concurrent`] = {
      totalTime: totalTime,
      successful: successful.length,
      failed: failed.length,
      averageResponseTime: successful.length > 0 ? 
        successful.reduce((sum, r) => sum + r.duration, 0) / successful.length : 0,
      requestsPerSecond: (level / totalTime) * 1000
    };
    
    console.log(`  📊 Total time: ${totalTime.toFixed(2)}ms`);
    console.log(`  ✅ Successful: ${successful.length}/${level}`);
    console.log(`  ❌ Failed: ${failed.length}/${level}`);
    console.log(`  📈 Average response time: ${results[`${level} concurrent`].averageResponseTime.toFixed(2)}ms`);
    console.log(`  🚀 Requests per second: ${results[`${level} concurrent`].requestsPerSecond.toFixed(2)}`);
  }
  
  return results;
}

function generatePerformanceReport(systemInfo, dbResults, spatialResults, concurrentResults) {
  console.log('\n📊 COMPREHENSIVE PERFORMANCE REPORT');
  console.log('====================================');
  
  console.log('\n🖥️  System Information:');
  console.log(`  Platform: ${systemInfo.platform} (${systemInfo.arch})`);
  console.log(`  Node.js: ${systemInfo.nodeVersion}`);
  console.log(`  Memory: ${systemInfo.freeMemory} free / ${systemInfo.totalMemory} total`);
  console.log(`  CPU Cores: ${systemInfo.cpuCount}`);
  console.log(`  System Uptime: ${systemInfo.uptime}`);
  
  console.log('\n🗄️  Database Performance:');
  Object.entries(dbResults).forEach(([test, data]) => {
    console.log(`  ${test}:`);
    console.log(`    Average: ${data.average.toFixed(2)}ms`);
    console.log(`    Range: ${data.minimum.toFixed(2)}ms - ${data.maximum.toFixed(2)}ms`);
    console.log(`    Median: ${data.median.toFixed(2)}ms`);
  });
  
  console.log('\n🗺️  Spatial Query Performance:');
  Object.entries(spatialResults).forEach(([test, data]) => {
    console.log(`  ${test}: ${data.average.toFixed(2)}ms average`);
  });
  
  console.log('\n⚡ Concurrent Load Performance:');
  Object.entries(concurrentResults).forEach(([test, data]) => {
    console.log(`  ${test}:`);
    console.log(`    Success Rate: ${((data.successful / (data.successful + data.failed)) * 100).toFixed(1)}%`);
    console.log(`    Average Response: ${data.averageResponseTime.toFixed(2)}ms`);
    console.log(`    Throughput: ${data.requestsPerSecond.toFixed(2)} req/s`);
  });
  
  // Performance recommendations
  console.log('\n💡 PERFORMANCE RECOMMENDATIONS:');
  console.log('===============================');
  
  const avgDbTime = Object.values(dbResults).reduce((sum, data) => sum + data.average, 0) / Object.keys(dbResults).length;
  const avgSpatialTime = Object.values(spatialResults).reduce((sum, data) => sum + data.average, 0) / Object.keys(spatialResults).length;
  
  if (avgDbTime < 100) {
    console.log('✅ Database queries are performing excellently!');
  } else if (avgDbTime < 500) {
    console.log('✅ Database performance is good. Consider adding indexes for better performance.');
  } else {
    console.log('⚠️  Database queries are slow. Consider optimizing queries and adding indexes.');
  }
  
  if (avgSpatialTime < 200) {
    console.log('✅ Spatial queries are performing well!');
  } else {
    console.log('⚠️  Spatial queries could be optimized. Consider PostGIS spatial indexes.');
  }
  
  const maxConcurrent = Math.max(...Object.values(concurrentResults).map(r => r.successful));
  if (maxConcurrent >= 20) {
    console.log('✅ System handles concurrent requests well!');
  } else if (maxConcurrent >= 10) {
    console.log('✅ Good concurrent performance. Consider connection pooling.');
  } else {
    console.log('⚠️  Concurrent performance needs improvement. Check database connections.');
  }
  
  console.log(`\n🎯 Overall Performance Grade: ${getPerformanceGrade(avgDbTime, avgSpatialTime, maxConcurrent)}`);
}

function getPerformanceGrade(avgDb, avgSpatial, maxConcurrent) {
  let score = 0;
  
  if (avgDb < 100) score += 3;
  else if (avgDb < 500) score += 2;
  else if (avgDb < 1000) score += 1;
  
  if (avgSpatial < 200) score += 3;
  else if (avgSpatial < 500) score += 2;
  else if (avgSpatial < 1000) score += 1;
  
  if (maxConcurrent >= 20) score += 3;
  else if (maxConcurrent >= 10) score += 2;
  else if (maxConcurrent >= 5) score += 1;
  
  if (score >= 8) return 'A+';
  if (score >= 6) return 'A';
  if (score >= 4) return 'B';
  if (score >= 2) return 'C';
  return 'D';
}

async function runDetailedPerformanceAnalysis() {
  console.log('🚀 RouteMate Detailed Performance Analysis');
  console.log('==========================================');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`API URL: ${API_URL}`);
  
  try {
    // Get system information
    const systemInfo = getSystemInfo();
    
    // Run performance tests
    const dbResults = await testDatabasePerformance();
    const spatialResults = await testSpatialQueryPerformance();
    const concurrentResults = await testConcurrentLoad();
    
    // Generate comprehensive report
    generatePerformanceReport(systemInfo, dbResults, spatialResults, concurrentResults);
    
  } catch (error) {
    console.error('❌ Performance analysis failed:', error.message);
  }
}

// Run the detailed analysis
runDetailedPerformanceAnalysis();
