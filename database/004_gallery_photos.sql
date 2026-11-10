begin;

create table if not exists public.cmfi_gallery_photos (
  id uuid primary key default gen_random_uuid(),
  filename text not null check (length(filename) between 1 and 240),
  title text not null default '' check (length(title) <= 240),
  image_data text not null check (octet_length(image_data) <= 600000),
  published boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.cmfi_gallery_photos enable row level security;
revoke all on public.cmfi_gallery_photos from anon,authenticated;

create or replace function public.cmfi_save_gallery_photos(photo_records jsonb) returns jsonb
 language plpgsql security definer set search_path='' as $$
declare item jsonb; result jsonb;
begin
 if not public.cmfi_is_staff() then raise exception 'STAFF_ACCESS_REQUIRED' using errcode='42501';end if;
 if jsonb_typeof(photo_records) is distinct from 'array' or jsonb_array_length(photo_records)>40 then raise exception 'INVALID_GALLERY_BATCH';end if;
 for item in select value from jsonb_array_elements(photo_records) loop
  if jsonb_typeof(item) is distinct from 'object' or coalesce(length(item->>'filename'),0) not between 1 and 240 or coalesce(length(item->>'title'),0)>240 or coalesce(item->>'image_data','') !~ '^data:image/(jpeg|png|webp);base64,' or octet_length(item->>'image_data')>600000 then raise exception 'INVALID_GALLERY_PHOTO';end if;
  insert into public.cmfi_gallery_photos(filename,title,image_data,created_by) values(item->>'filename',coalesce(item->>'title',''),item->>'image_data',auth.uid());
 end loop;
 select coalesce(jsonb_agg(jsonb_build_object('id',id::text,'filename',filename,'title',title,'photo',image_data,'createdAt',created_at) order by created_at desc),'[]'::jsonb) into result from public.cmfi_gallery_photos where created_by=auth.uid() and created_at>=now()-interval '10 minutes';
 return result;
end$$;
revoke all on function public.cmfi_save_gallery_photos(jsonb) from public,anon;
grant execute on function public.cmfi_save_gallery_photos(jsonb) to authenticated;

create or replace function public.cmfi_public_gallery_photos() returns jsonb
 language sql stable security definer set search_path='' as $$
  select coalesce(jsonb_agg(jsonb_build_object('id',id::text,'filename',filename,'title',title,'photo',image_data,'createdAt',created_at) order by created_at desc),'[]'::jsonb)
  from public.cmfi_gallery_photos where published;
$$;
revoke all on function public.cmfi_public_gallery_photos() from public;
grant execute on function public.cmfi_public_gallery_photos() to anon,authenticated;

commit;
