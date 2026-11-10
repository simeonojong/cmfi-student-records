begin;

-- Public, read-only gallery data. Only students with a linked portrait are returned.
create or replace function public.cmfi_public_graduates() returns jsonb
 language sql stable security definer set search_path='' as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id',record->>'id',
    'name',record->>'name',
    'photo',record->>'photo',
    'program',record->>'program',
    'year',record->>'year',
    'grade',record->>'grade',
    'institution',record->>'institution'
  ) order by coalesce(record->>'name','')),'[]'::jsonb)
  from public.cmfi_students
  where coalesce(record->>'photo','') <> '';
$$;

revoke all on function public.cmfi_public_graduates() from public;
grant execute on function public.cmfi_public_graduates() to anon,authenticated;

commit;
