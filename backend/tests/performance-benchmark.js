const axios = require('axios');
const { performance } = require('perf_hooks');

const API_URL = process.env.API_URL || 'http://localhost:5005/api';

// Performance measurement utilities
class PerformanceTimer {
  constructor() {
    this.startTime = null;
    this.endTime = null;
  }

  start() {
    this.startTime = performance.now();
  }

  end() {
    this.endTime = performance.now();
    return this.endTime - this.startTime;
  }

  getDuration() {
    if (!this.startTime || !this.endTime) return 0;
    return this.endTime - this.startTime;
  }
}

// Test configurations
const TEST_CONFIGS = {
  nearby: {
    lat: 45.4215,
    lng: -75.6972,
    radius: 5000
  },
  bounds: {
    minLat: 45.3,
    minLng: -75.8,
    maxLat: 45.5,
    maxLng: -75.6
  },
  pagination: {
    page: 1,
    limit: 100
  }
};

// Performance test functions
async function testEndpointPerformance(endpoint, params = {}, iterations = 10) {
  console.log(`\n🔍 Testing ${endpoint} (${iterations} iterations)...`);
  
  const results = [];
  const timer = new PerformanceTimer();

  for (let i = 0; i < iterations; i++) {
    timer.start();
    
    try {
      const response = await axios.get(`${API_URL}${endpoint}`, { params });
      const duration = timer.end();
      
      results.push({
        iteration: i + 1,
        duration: duration,
        status: response.status,
        dataSize: JSON.stringify(response.data).length,
        success: true
      });
      
      console.log(`  ✅ Iteration ${i + 1}: ${duration.toFixed(2)}ms (${response.data.data?.length || response.data.length} items)`);
      
    } catch (error) {
      const duration = timer.end();
      results.push({
        iteration: i + 1,
        duration: duration,
        status: error.response?.status || 500,
        error: error.message,
        success: false
      });
      
      console.log(`  ❌ Iteration ${i + 1}: ${duration.toFixed(2)}ms - ${error.message}`);
    }
  }

  return results;
}

async function testConcurrentPerformance(endpoint, params = {}, concurrent = 5) {
  console.log(`\n⚡ Testing ${endpoint} with ${concurrent} concurrent requests...`);
  
  const timer = new PerformanceTimer();
  timer.start();
  
  const promises = Array.from({ length: concurrent }, async (_, i) => {
    const requestTimer = new PerformanceTimer();
    requestTimer.start();
    
    try {
      const response = await axios.get(`${API_URL}${endpoint}`, { params });
      const duration = requestTimer.end();
      
      return {
        request: i + 1,
        duration: duration,
        status: response.status,
        success: true
      };
    } catch (error) {
      const duration = requestTimer.end();
      return {
        request: i + 1,
        duration: duration,
        status: error.response?.status || 500,
        error: error.message,
        success: false
      };
    }
  });
  
  const results = await Promise.all(promises);
  const totalTime = timer.end();
  
  console.log(`  📊 Total time for ${concurrent} concurrent requests: ${totalTime.toFixed(2)}ms`);
  console.log(`  📈 Average time per request: ${(totalTime / concurrent).toFixed(2)}ms`);
  
  return results;
}

function calculateStatistics(results) {
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  if (successful.length === 0) {
    return {
      total: results.length,
      successful: 0,
      failed: failed.length,
      successRate: 0,
      avgDuration: 0,
      minDuration: 0,
      maxDuration: 0,
      medianDuration: 0
    };
  }
  
  const durations = successful.map(r => r.duration);
  const sortedDurations = durations.sort((a, b) => a - b);
  
  return {
    total: results.length,
    successful: successful.length,
    failed: failed.length,
    successRate: (successful.length / results.length) * 100,
    avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
    minDuration: Math.min(...durations),
    maxDuration: Math.max(...durations),
    medianDuration: sortedDurations[Math.floor(sortedDurations.length / 2)]
  };
}

function printPerformanceReport(testName, results) {
  const stats = calculateStatistics(results);
  
  console.log(`\n📊 ${testName} Performance Report:`);
  console.log(`  Total Requests: ${stats.total}`);
  console.log(`  Successful: ${stats.successful} (${stats.successRate.toFixed(1)}%)`);
  console.log(`  Failed: ${stats.failed}`);
  console.log(`  Average Response Time: ${stats.avgDuration.toFixed(2)}ms`);
  console.log(`  Fastest Response: ${stats.minDuration.toFixed(2)}ms`);
  console.log(`  Slowest Response: ${stats.maxDuration.toFixed(2)}ms`);
  console.log(`  Median Response Time: ${stats.medianDuration.toFixed(2)}ms`);
  
  if (stats.failed > 0) {
    console.log(`  ⚠️  ${stats.failed} requests failed`);
  }
  
  return stats;
}

async function runComprehensiveBenchmark() {
  console.log('🚀 RouteMate Performance Benchmark');
  console.log('=====================================');
  console.log(`API URL: ${API_URL}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  const allResults = {};
  
  try {
    // Test 1: Basic endpoints performance
    console.log('\n📋 Test 1: Basic Endpoints Performance');
    console.log('-------------------------------------');
    
    allResults.locations = await testEndpointPerformance('/locations', {}, 5);
    allResults.nearby = await testEndpointPerformance('/locations/nearby', TEST_CONFIGS.nearby, 5);
    allResults.bounds = await testEndpointPerformance('/locations/bounds', TEST_CONFIGS.bounds, 5);
    
    // Test 2: Concurrent performance
    console.log('\n⚡ Test 2: Concurrent Performance');
    console.log('----------------------------------');
    
    allResults.concurrentLocations = await testConcurrentPerformance('/locations', {}, 10);
    allResults.concurrentNearby = await testConcurrentPerformance('/locations/nearby', TEST_CONFIGS.nearby, 10);
    allResults.concurrentBounds = await testConcurrentPerformance('/locations/bounds', TEST_CONFIGS.bounds, 10);
    
    // Test 3: Load testing
    console.log('\n🔥 Test 3: Load Testing');
    console.log('------------------------');
    
    allResults.loadTest = await testEndpointPerformance('/locations/nearby', TEST_CONFIGS.nearby, 20);
    
    // Generate comprehensive report
    console.log('\n📈 COMPREHENSIVE PERFORMANCE REPORT');
    console.log('=====================================');
    
    const reports = {};
    reports['GET /locations'] = printPerformanceReport('GET /locations', allResults.locations);
    reports['GET /locations/nearby'] = printPerformanceReport('GET /locations/nearby', allResults.nearby);
    reports['GET /locations/bounds'] = printPerformanceReport('GET /locations/bounds', allResults.bounds);
    reports['Concurrent /locations'] = printPerformanceReport('Concurrent /locations', allResults.concurrentLocations);
    reports['Concurrent /locations/nearby'] = printPerformanceReport('Concurrent /locations/nearby', allResults.concurrentNearby);
    reports['Concurrent /locations/bounds'] = printPerformanceReport('Concurrent /locations/bounds', allResults.concurrentBounds);
    reports['Load Test /locations/nearby'] = printPerformanceReport('Load Test /locations/nearby', allResults.loadTest);
    
    // Performance summary
    console.log('\n🏆 PERFORMANCE SUMMARY');
    console.log('=======================');
    
    const fastestEndpoint = Object.entries(reports)
      .filter(([name, stats]) => stats.successful > 0)
      .sort((a, b) => a[1].avgDuration - b[1].avgDuration)[0];
    
    const slowestEndpoint = Object.entries(reports)
      .filter(([name, stats]) => stats.successful > 0)
      .sort((a, b) => b[1].avgDuration - a[1].avgDuration)[0];
    
    console.log(`Fastest Endpoint: ${fastestEndpoint[0]} (${fastestEndpoint[1].avgDuration.toFixed(2)}ms)`);
    console.log(`Slowest Endpoint: ${slowestEndpoint[0]} (${slowestEndpoint[1].avgDuration.toFixed(2)}ms)`);
    
    // Performance recommendations
    console.log('\n💡 PERFORMANCE RECOMMENDATIONS');
    console.log('===============================');
    
    const avgResponseTime = Object.values(reports)
      .filter(stats => stats.successful > 0)
      .reduce((sum, stats) => sum + stats.avgDuration, 0) / Object.values(reports).length;
    
    if (avgResponseTime < 100) {
      console.log('✅ Excellent performance! All endpoints are responding quickly.');
    } else if (avgResponseTime < 500) {
      console.log('✅ Good performance. Consider caching for even better results.');
    } else if (avgResponseTime < 1000) {
      console.log('⚠️  Moderate performance. Consider optimizing database queries.');
    } else {
      console.log('❌ Poor performance. Database optimization and caching required.');
    }
    
    console.log(`\n📊 Overall Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`🎯 Performance Grade: ${avgResponseTime < 100 ? 'A+' : avgResponseTime < 500 ? 'A' : avgResponseTime < 1000 ? 'B' : 'C'}`);
    
  } catch (error) {
    console.error('❌ Benchmark failed:', error.message);
  }
}

// Run the benchmark
runComprehensiveBenchmark();
