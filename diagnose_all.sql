-- DIAGNÓSTICO COMPLETO EN UNA SOLA FILA
-- Ejecuta esto y pásame el resultado (una sola fila con números y texto).

WITH policy_info AS (
    SELECT string_agg(policyname, ' | ') as lista_politicas
    FROM pg_policies
    WHERE tablename = 'properties'
)
SELECT 
    (SELECT count(*) FROM public.profiles) as cant_perfiles,
    (SELECT count(*) FROM public.properties) as cant_propiedades_en_db,
    (SELECT count(*) FROM public.properties WHERE user_id IS NULL) as props_sin_dueño,
    (SELECT lista_politicas FROM policy_info) as politicas_activas,
    current_setting('request.jwt.claim.sub', true) as user_id_simulado;
