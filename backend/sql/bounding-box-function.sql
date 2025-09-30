-- Create bounding box query function for map viewport
CREATE OR REPLACE FUNCTION locations_in_bounds(
  min_lat DOUBLE PRECISION,
  min_lng DOUBLE PRECISION,
  max_lat DOUBLE PRECISION,
  max_lng DOUBLE PRECISION
)
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.name,
    ST_Y(l.coordinates::geometry) as latitude,
    ST_X(l.coordinates::geometry) as longitude,
    l.created_at
  FROM locations l
  WHERE l.coordinates::geometry && ST_MakeEnvelope(
    min_lng, min_lat, max_lng, max_lat, 4326
  )
  LIMIT 1000;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION locations_in_bounds TO anon, authenticated;
