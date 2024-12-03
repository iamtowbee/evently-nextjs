-- First, update the events table to remove the category foreign key constraint
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_category_id_fkey;

-- Update category IDs and slugs
UPDATE public.categories
SET id = 'tech-talks',
    slug = 'tech-talks'
WHERE id = 'cat_01';

UPDATE public.categories
SET id = 'business',
    slug = 'business'
WHERE id = 'cat_02';

UPDATE public.categories
SET id = 'design',
    slug = 'design'
WHERE id = 'cat_03';

UPDATE public.categories
SET id = 'health-wellness',
    slug = 'health-wellness'
WHERE id = 'cat_04';

UPDATE public.categories
SET id = 'education',
    slug = 'education'
WHERE id = 'cat_05';

-- Update the event category references
UPDATE public.events
SET category_id = 'tech-talks'
WHERE category_id = 'cat_01';

UPDATE public.events
SET category_id = 'business'
WHERE category_id = 'cat_02';

UPDATE public.events
SET category_id = 'design'
WHERE category_id = 'cat_03';

UPDATE public.events
SET category_id = 'health-wellness'
WHERE category_id = 'cat_04';

UPDATE public.events
SET category_id = 'education'
WHERE category_id = 'cat_05';

-- Re-add the foreign key constraint
ALTER TABLE public.events
  ADD CONSTRAINT events_category_id_fkey
  FOREIGN KEY (category_id)
  REFERENCES public.categories(id)
  ON DELETE SET NULL; 