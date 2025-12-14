-- Add images column as text array
alter table properties add column if not exists images text[] default '{}';

-- Migrate existing image_url to images array (only if images is empty)
update properties 
set images = array[image_url] 
where image_url is not null 
and (images is null or cardinality(images) = 0);

-- Make queries select * including the new column (no extra action needed for select *)
