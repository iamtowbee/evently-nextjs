CREATE OR REPLACE FUNCTION get_top_categories(limit_count integer)
RETURNS TABLE (
  id text,
  created_at timestamp with time zone,
  name text,
  slug text,
  description text,
  event_count bigint
)
LANGUAGE sql
AS $$
  SELECT 
    c.id,
    c.created_at,
    c.name,
    c.slug,
    c.description,
    COUNT(e.id)::bigint as event_count
  FROM categories c
  LEFT JOIN events e ON c.id = e.category_id
  GROUP BY c.id, c.created_at, c.name, c.slug, c.description
  ORDER BY COUNT(e.id) DESC
  LIMIT limit_count;
$$; 