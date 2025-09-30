-- Create proximity search function
CREATE OR REPLACE FUNCTION nearby_locations(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_meters INTEGER DEFAULT 5000
)
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  distance_meters DOUBLE PRECISION,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.name,
    ST_Y(l.coordinates::geometry) as latitude,
    ST_X(l.coordinates::geometry) as longitude,
    ST_Distance(
      l.coordinates,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
    ) as distance_meters,
    l.created_at
  FROM locations l
  WHERE ST_DWithin(
    l.coordinates,
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
    radius_meters
  )
  ORDER BY distance_meters
  LIMIT 100;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION nearby_locations TO anon, authenticated;
