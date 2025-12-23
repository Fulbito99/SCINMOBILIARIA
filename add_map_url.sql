-- Add map_url column to properties table if it doesn't exist
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'properties' and column_name = 'map_url') then
        alter table public.properties add column map_url text;
    end if;
end $$;
