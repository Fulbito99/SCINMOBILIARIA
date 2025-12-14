-- Check if the 'images' column exists and show a sample of data
SELECT 
    column_name, 
    data_type 
FROM 
    information_schema.columns 
WHERE 
    table_name = 'properties' 
    AND column_name = 'images';

-- Show first 5 properties to see if images data is being populated
SELECT id, title, image_url, images FROM properties LIMIT 5;
