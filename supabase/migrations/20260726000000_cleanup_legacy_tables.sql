-- Migration: Limpeza de tabelas legadas em inglês
-- Remove tabelas do schema inicial que foram substituídas pelas versões PT

DO $$
DECLARE
  tbl TEXT;
  pol TEXT;
BEGIN
  -- Dropar políticas apenas se a tabela existir
  FOR tbl IN 
    SELECT unnest(ARRAY[
      'companies', 'news', 'entity_members', 'places', 'place_images',
      'operating_hours', 'amenities', 'place_amenities', 'reviews', 'events',
      'company_claims', 'favorites'
    ])
  LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = tbl) THEN
      FOR pol IN
        SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = tbl
      LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol, tbl);
      END LOOP;
    END IF;
  END LOOP;
END $$;

-- Dropar tabelas com CASCADE (seguro com IF EXISTS)
DROP TABLE IF EXISTS public.company_claims CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;
DROP TABLE IF EXISTS public.news CASCADE;
DROP TABLE IF EXISTS public.entity_members CASCADE;
DROP TABLE IF EXISTS public.places CASCADE;
DROP TABLE IF EXISTS public.place_images CASCADE;
DROP TABLE IF EXISTS public.operating_hours CASCADE;
DROP TABLE IF EXISTS public.amenities CASCADE;
DROP TABLE IF EXISTS public.place_amenities CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.favorites CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
