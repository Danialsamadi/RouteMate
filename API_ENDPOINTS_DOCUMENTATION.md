# RouteMate API Endpoints Documentation

This document provides comprehensive documentation for all RouteMate API endpoints, including the newly added delete and edit functionality.

## Table of Contents
1. [Location Management Endpoints](#location-management-endpoints)
2. [User Route Endpoints](#user-route-endpoints)
3. [Health Check](#health-check)
4. [Request/Response Examples](#requestresponse-examples)
5. [Error Handling](#error-handling)

---

## Location Management Endpoints

### 1. Get All Locations
**GET** `/api/locations`

Retrieves all locations with extracted coordinates.

**Response:**
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

### 2. Get Single Location
**GET** `/api/locations/:id`

Retrieves a specific location by ID.

**Parameters:**
- `id` (path): Location ID

**Response:**
```json
{
  "id": 1,
  "name": "Algonquin College",
  "coordinates": {
    "lat": 45.3499,
    "lng": -75.7574
  },
  "created_at": "2025-09-26T19:59:07.501498+00:00"
}
```

**Errors:**
- `400`: Location ID is required
- `404`: Location not found
- `500`: Database not configured or internal server error

### 3. Create New Location
**POST** `/api/locations`

Creates a new location.

**Request Body:**
```json
{
  "name": "New Location",
  "lat": 45.3499,
  "lng": -75.7574
}
```

**Response:**
```json
{
  "message": "Location added successfully",
  "location": {
    "id": 15,
    "name": "New Location",
    "coordinates": "0101000020E6100000...",
    "user_id": "default_user",
    "created_at": "2025-09-26T21:30:00.000000+00:00"
  }
}
```

**Errors:**
- `400`: Name, latitude, and longitude are required
- `500`: Database not configured or failed to insert location

### 4. Update Location (Full Update)
**PUT** `/api/locations/:id`

Updates all fields of a location.

**Parameters:**
- `id` (path): Location ID

**Request Body:**
```json
{
  "name": "Updated Location Name",
  "lat": 45.35,
  "lng": -75.76
}
```

**Response:**
```json
{
  "message": "Location updated successfully",
  "location": {
    "id": 1,
    "name": "Updated Location Name",
    "coordinates": "0101000020E6100000...",
    "user_id": "default_user",
    "created_at": "2025-09-26T19:59:07.501498+00:00"
  }
}
```

**Errors:**
- `400`: Location ID is required or name, latitude, and longitude are required
- `404`: Location not found
- `500`: Database not configured or failed to update location

### 5. Partial Update Location
**PATCH** `/api/locations/:id`

Updates only the provided fields of a location.

**Parameters:**
- `id` (path): Location ID

**Request Body (any combination):**
```json
{
  "name": "Updated Name Only"
}
```
or
```json
{
  "lat": 45.35,
  "lng": -75.76
}
```
or
```json
{
  "name": "Updated Name",
  "lat": 45.35,
  "lng": -75.76
}
```

**Response:**
```json
{
  "message": "Location updated successfully",
  "location": {
    "id": 1,
    "name": "Updated Name",
    "coordinates": "0101000020E6100000...",
    "user_id": "default_user",
    "created_at": "2025-09-26T19:59:07.501498+00:00"
  }
}
```

**Errors:**
- `400`: Location ID is required, no fields provided for update, or invalid data
- `404`: Location not found
- `500`: Database not configured or failed to update location

### 6. Delete Location
**DELETE** `/api/locations/:id`

Deletes a location by ID.

**Parameters:**
- `id` (path): Location ID

**Response:**
```json
{
  "message": "Location deleted successfully",
  "deletedLocation": {
    "id": 14,
    "name": "Test Location",
    "coordinates": "0101000020E6100000...",
    "user_id": "default_user",
    "created_at": "2025-09-26T21:13:52.659922+00:00"
  }
}
```

**Errors:**
- `400`: Location ID is required
- `404`: Location not found
- `500`: Database not configured or failed to delete location

---

## User Route Endpoints

### Get User-Specific Route
**GET** `/api/route/:userId`

Retrieves all locations for a specific user.

**Parameters:**
- `userId` (path): User ID

**Response:**
```json
[
  {
    "id": 1,
    "name": "User Location",
    "coordinates": {
      "lat": 45.3499,
      "lng": -75.7574
    },
    "created_at": "2025-09-26T19:59:07.501498+00:00"
  }
]
```

---

## Health Check

### API Health Check
**GET** `/api/health`

Checks if the API server is running.

**Response:**
```json
{
  "status": "OK",
  "message": "RouteMate API is running"
}
```

---

## Request/Response Examples

### cURL Examples

#### Get All Locations
```bash
curl -X GET http://localhost:5005/api/locations
```

#### Get Single Location
```bash
curl -X GET http://localhost:5005/api/locations/1
```

#### Create New Location
```bash
curl -X POST http://localhost:5005/api/locations \
  -H "Content-Type: application/json" \
  -d '{"name": "New Location", "lat": 45.3499, "lng": -75.7574}'
```

#### Update Location (Full)
```bash
curl -X PUT http://localhost:5005/api/locations/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Location", "lat": 45.35, "lng": -75.76}'
```

#### Partial Update Location
```bash
curl -X PATCH http://localhost:5005/api/locations/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name Only"}'
```

#### Delete Location
```bash
curl -X DELETE http://localhost:5005/api/locations/1
```

---

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "error": "Location ID is required"
}
```

#### 404 Not Found
```json
{
  "error": "Location not found"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Database not configured"
}
```

### Error Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Database Integration

### PostGIS Coordinate Handling

All location endpoints properly handle PostGIS geography data:

1. **Storage**: Coordinates are stored as PostGIS `geography` type
2. **Extraction**: Uses database functions with `ST_X()` and `ST_Y()` for coordinate extraction
3. **Format**: API returns coordinates as `{lat: number, lng: number}` objects

### Database Functions Used

- `get_locations_with_coords()`: Extracts coordinates for all locations
- `get_locations_with_coords_by_user(user_id)`: Extracts coordinates for user-specific locations

---

## Testing

### Manual Testing Commands

```bash
# Test all endpoints
curl -X GET http://localhost:5005/api/health
curl -X GET http://localhost:5005/api/locations
curl -X GET http://localhost:5005/api/locations/1
curl -X POST http://localhost:5005/api/locations -H "Content-Type: application/json" -d '{"name": "Test", "lat": 45.0, "lng": -75.0}'
curl -X PUT http://localhost:5005/api/locations/1 -H "Content-Type: application/json" -d '{"name": "Updated", "lat": 45.1, "lng": -75.1}'
curl -X PATCH http://localhost:5005/api/locations/1 -H "Content-Type: application/json" -d '{"name": "Patched"}'
curl -X DELETE http://localhost:5005/api/locations/1
```

---

## Summary

The RouteMate API now provides complete CRUD (Create, Read, Update, Delete) functionality for location management:

✅ **GET** `/api/locations` - List all locations  
✅ **GET** `/api/locations/:id` - Get single location  
✅ **POST** `/api/locations` - Create new location  
✅ **PUT** `/api/locations/:id` - Full update location  
✅ **PATCH** `/api/locations/:id` - Partial update location  
✅ **DELETE** `/api/locations/:id` - Delete location  

All endpoints include proper error handling, validation, and PostGIS coordinate extraction.

