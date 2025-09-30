# RouteMate Test Suite

This directory contains all test files for the RouteMate application.

## Test Files

### `test-api.js`
Basic API endpoint testing for core functionality.

### `test-new-endpoints.js`
Tests the new performance-optimized endpoints:
- `/api/locations/nearby` - Proximity search
- `/api/locations/bounds` - Bounding box queries
- Error handling and validation

### `performance-benchmark.js`
Comprehensive performance benchmarking:
- Basic endpoint performance testing
- Concurrent load testing
- Performance statistics and recommendations

### `detailed-performance-analysis.js`
Advanced performance analysis:
- Database performance testing
- Spatial query performance analysis
- System resource monitoring
- Concurrent load testing with different levels
- Comprehensive performance reporting

## Running Tests

```bash
# Basic API tests
node tests/test-api.js

# New endpoints tests
node tests/test-new-endpoints.js

# Performance benchmark
node tests/performance-benchmark.js

# Detailed performance analysis
node tests/detailed-performance-analysis.js
```

## Prerequisites

- Node.js server must be running (`node server.js`)
- Supabase database must be accessible
- Test data should be available in the database

## Performance Metrics

The performance tests measure:
- Response times (average, min, max, median)
- Concurrent request handling
- Database query performance
- Spatial query efficiency
- System resource usage
