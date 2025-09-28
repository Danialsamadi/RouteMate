# RouteMate Database Queries Documentation

This document contains all the SQL queries executed during the RouteMate project setup and their detailed explanations.

## Table of Contents
1. [Database Functions for Coordinate Extraction](#database-functions-for-coordinate-extraction)
2. [Query Explanations](#query-explanations)
3. [PostGIS Functions Used](#postgis-functions-used)
4. [Troubleshooting](#troubleshooting)

---

## Database Functions for Coordinate Extraction

### 1. Initial Function Creation (Failed Attempt)

```sql
-- Create function to get all locations with extracted coordinates
CREATE OR REPLACE FUNCTION get_locations_with_coords()
RETURNS TABLE (
  id bigint,
  name text,
  created_at timestamptz,
  lat double precision,
  lng double precision
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.name,
    l.created_at,
    ST_Y(l.coordinates) as lat,
    ST_X(l.coordinates) as lng
  FROM locations l
  ORDER BY l.created_at ASC;
END;
$$ LANGUAGE plpgsql;
```

**Status**: ❌ Failed  
**Error**: `function st_y(geography) does not exist`  
**Explanation**: The `coordinates` column is of type `geography`, not `geometry`. PostGIS functions `ST_X()` and `ST_Y()` work on `geometry` type, not `geography` type.

---

### 2. Fixed Function with Type Casting

```sql
-- Create function to get all locations with extracted coordinates (fixed for geography type)
CREATE OR REPLACE FUNCTION get_locations_with_coords()
RETURNS TABLE (
  id bigint,
  name text,
  created_at timestamptz,
  lat double precision,
  lng double precision
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.name,
    l.created_at,
    ST_Y(l.coordinates::geometry) as lat,
    ST_X(l.coordinates::geometry) as lng
  FROM locations l
  ORDER BY l.created_at ASC;
END;
$$ LANGUAGE plpgsql;
```

**Status**: ❌ Failed  
**Error**: `structure of query does not match function result type`  
**Explanation**: The function return type specified `bigint` for `id`, but the actual column type is `integer`.

---

### 3. Final Working Functions

#### Function for All Locations

```sql
-- Drop existing functions
DROP FUNCTION IF EXISTS get_locations_with_coords();
DROP FUNCTION IF EXISTS get_locations_with_coords_by_user(text);

-- Create function to get all locations with extracted coordinates (correct data types)
CREATE OR REPLACE FUNCTION get_locations_with_coords()
RETURNS TABLE (
  id integer,
  name text,
  created_at timestamptz,
  lat double precision,
  lng double precision
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.name,
    l.created_at,
    ST_Y(l.coordinates::geometry) as lat,
    ST_X(l.coordinates::geometry) as lng
  FROM locations l
  ORDER BY l.created_at ASC;
END;
$$ LANGUAGE plpgsql;
```

**Status**: ✅ Success  
**Result**: Function created successfully

#### Function for User-Specific Locations

```sql
-- Create function to get locations for a specific user with extracted coordinates (correct data types)
CREATE OR REPLACE FUNCTION get_locations_with_coords_by_user(user_id_param text)
RETURNS TABLE (
  id integer,
  name text,
  created_at timestamptz,
  lat double precision,
  lng double precision
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.name,
    l.created_at,
    ST_Y(l.coordinates::geometry) as lat,
    ST_X(l.coordinates::geometry) as lng
  FROM locations l
  WHERE l.user_id = user_id_param
  ORDER BY l.created_at ASC;
END;
$$ LANGUAGE plpgsql;
```

**Status**: ✅ Success  
**Result**: Function created successfully

---

## Query Explanations

### Why These Functions Were Needed

1. **Problem**: Supabase's PostgREST API doesn't support PostGIS functions directly in SELECT clauses
2. **Solution**: Create database functions that use PostGIS functions internally
3. **Benefit**: Server can call these functions via RPC (Remote Procedure Call)

### Key Components Explained

#### Type Casting: `coordinates::geometry`
- **Purpose**: Convert `geography` type to `geometry` type
- **Why Needed**: PostGIS functions `ST_X()` and `ST_Y()` work on `geometry` type
- **Syntax**: `::` is PostgreSQL's type casting operator

#### PostGIS Functions Used
- **`ST_X(geometry)`**: Extracts the X coordinate (longitude) from a geometry
- **`ST_Y(geometry)`**: Extracts the Y coordinate (latitude) from a geometry

#### Data Type Corrections
- **Original**: `id bigint` → **Corrected**: `id integer`
- **Reason**: The actual `locations.id` column is of type `integer`, not `bigint`

---

## PostGIS Functions Used

### ST_X() Function
```sql
ST_X(geometry_column)
```
- **Purpose**: Returns the X coordinate (longitude) of a point geometry
- **Input**: Geometry type (cast from geography)
- **Output**: Double precision longitude value

### ST_Y() Function
```sql
ST_Y(geometry_column)
```
- **Purpose**: Returns the Y coordinate (latitude) of a point geometry
- **Input**: Geometry type (cast from geography)
- **Output**: Double precision latitude value

### Type Casting
```sql
coordinates::geometry
```
- **Purpose**: Convert geography type to geometry type
- **Why**: PostGIS coordinate extraction functions work on geometry, not geography
- **Alternative**: Could use `ST_X(ST_Transform(coordinates, 4326))` for geography

---

## Testing Queries

### Test Function Execution
```sql
SELECT * FROM get_locations_with_coords() LIMIT 3;
```

**Result**:
```json
[
  {
    "id": 1,
    "name": "Algonquin College",
    "created_at": "2025-09-26 19:59:07.501498+00",
    "lat": 45.3499,
    "lng": -75.7574
  },
  {
    "id": 2,
    "name": "Baseline Station",
    "created_at": "2025-09-26 19:59:07.501498+00",
    "lat": 45.36,
    "lng": -75.75
  },
  {
    "id": 3,
    "name": "Bayview Station",
    "created_at": "2025-09-26 19:59:07.501498+00",
    "lat": 45.38,
    "lng": -75.72
  }
]
```

---

## Troubleshooting

### Common Issues Encountered

1. **Geography vs Geometry Type Mismatch**
   - **Error**: `function st_y(geography) does not exist`
   - **Solution**: Cast to geometry using `::geometry`

2. **Data Type Mismatch in Function Return**
   - **Error**: `structure of query does not match function result type`
   - **Solution**: Match function return types with actual column types

3. **Function Already Exists**
   - **Error**: `cannot change return type of existing function`
   - **Solution**: Drop function first, then recreate

### Best Practices

1. **Always check column data types** before creating functions
2. **Use type casting** when working with geography/geometry columns
3. **Test functions** with sample data before deploying
4. **Drop and recreate** functions when changing return types

---

## API Integration

### Server-Side Usage
```javascript
// Use RPC to call the database function
const { data, error } = await supabase.rpc('get_locations_with_coords');
```

### Expected API Response
```json
[
  {
    "id": 1,
    "name": "Algonquin College",
    "coordinates": {
      "lat": 45.3499,
      "lng": -75.7574
    },
    "created_at": "2025-09-26T19:59:07.501498+00:00"
  }
]
```

---

## Summary

The database functions successfully solve the PostGIS coordinate extraction problem by:

1. ✅ **Using proper type casting** from geography to geometry
2. ✅ **Matching data types** between function returns and actual columns
3. ✅ **Leveraging PostGIS functions** ST_X() and ST_Y() for coordinate extraction
4. ✅ **Providing clean API responses** with properly formatted coordinates

The RouteMate application now has fully functional coordinate extraction from PostGIS geography columns, enabling proper mapping and routing functionality.
