begin;

alter table public.cmfi_staff add column if not exists avatar_url text;

create or replace function public.cmfi_is_admin() returns boolean
 language sql stable security definer set search_path=''
 as $$select exists(select 1 from public.cmfi_staff where user_id=(select auth.uid()) and active and role='admin')$$;
revoke all on function public.cmfi_is_admin() from public,anon;
grant execute on function public.cmfi_is_admin() to authenticated;

create or replace function public.cmfi_update_my_profile(new_display_name text,new_avatar_url text default null) returns jsonb
 language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 if not public.cmfi_is_staff() then raise exception 'STAFF_ACCESS_REQUIRED' using errcode='42501';end if;
 if coalesce(length(trim(new_display_name)),0) not between 2 and 120 then raise exception 'INVALID_DISPLAY_NAME';end if;
 if new_avatar_url is not null and length(new_avatar_url)>500000 then raise exception 'PROFILE_IMAGE_TOO_LARGE';end if;
 if new_avatar_url is not null and new_avatar_url !~ '^(https://|data:image/(jpeg|png|webp);base64,)' then raise exception 'INVALID_PROFILE_IMAGE';end if;
 update public.cmfi_staff set display_name=trim(new_display_name),avatar_url=nullif(new_avatar_url,'') where user_id=(select auth.uid()) and active;
 if not found then raise exception 'STAFF_ACCESS_REQUIRED' using errcode='42501';end if;
 select jsonb_build_object('display_name',display_name,'role',role,'avatar_url',avatar_url) into result from public.cmfi_staff where user_id=(select auth.uid());
 return result;
end$$;
revoke all on function public.cmfi_update_my_profile(text,text) from public,anon;
grant execute on function public.cmfi_update_my_profile(text,text) to authenticated;

create or replace function public.cmfi_list_staff() returns jsonb
 language plpgsql security definer set search_path='' as $$
begin
 if not public.cmfi_is_admin() then raise exception 'ADMIN_ACCESS_REQUIRED' using errcode='42501';end if;
 return coalesce((select jsonb_agg(jsonb_build_object('user_id',s.user_id,'email',u.email,'display_name',s.display_name,'role',s.role,'active',s.active,'avatar_url',s.avatar_url) order by s.display_name,u.email) from public.cmfi_staff s join auth.users u on u.id=s.user_id),'[]'::jsonb);
end$$;
revoke all on function public.cmfi_list_staff() from public,anon;
grant execute on function public.cmfi_list_staff() to authenticated;

create or replace function public.cmfi_add_staff_member(staff_user_id uuid,staff_email text,staff_display_name text,staff_role text default 'registrar') returns jsonb
 language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 if not public.cmfi_is_admin() then raise exception 'ADMIN_ACCESS_REQUIRED' using errcode='42501';end if;
 if staff_user_id is null or not exists(select 1 from auth.users where id=staff_user_id) then raise exception 'AUTH_USER_NOT_FOUND';end if;
 if coalesce(length(trim(staff_display_name)),0) not between 2 and 120 then raise exception 'INVALID_DISPLAY_NAME';end if;
 if coalesce(staff_role,'') not in ('admin','registrar') then raise exception 'INVALID_STAFF_ROLE';end if;
 insert into public.cmfi_staff(user_id,display_name,role,active) values(staff_user_id,trim(staff_display_name),staff_role,true)
 on conflict(user_id) do update set display_name=excluded.display_name,role=excluded.role,active=true;
 select jsonb_build_object('user_id',s.user_id,'email',u.email,'display_name',s.display_name,'role',s.role,'active',s.active,'avatar_url',s.avatar_url) into result from public.cmfi_staff s join auth.users u on u.id=s.user_id where s.user_id=staff_user_id;
 return result;
end$$;
revoke all on function public.cmfi_add_staff_member(uuid,text,text,text) from public,anon;
grant execute on function public.cmfi_add_staff_member(uuid,text,text,text) to authenticated;

create or replace function public.cmfi_set_staff_active(target_user_id uuid,should_be_active boolean) returns boolean
 language plpgsql security definer set search_path='' as $$
declare target_role text;active_admins integer;
begin
 if not public.cmfi_is_admin() then raise exception 'ADMIN_ACCESS_REQUIRED' using errcode='42501';end if;
 if target_user_id=(select auth.uid()) and not should_be_active then raise exception 'CANNOT_DISABLE_SELF';end if;
 select role into target_role from public.cmfi_staff where user_id=target_user_id;
 if target_role is null then raise exception 'STAFF_NOT_FOUND';end if;
 if target_role='admin' and not should_be_active then
  select count(*) into active_admins from public.cmfi_staff where role='admin' and active;
  if active_admins<=1 then raise exception 'LAST_ADMIN_REQUIRED';end if;
 end if;
 update public.cmfi_staff set active=should_be_active where user_id=target_user_id;
 return should_be_active;
end$$;
revoke all on function public.cmfi_set_staff_active(uuid,boolean) from public,anon;
grant execute on function public.cmfi_set_staff_active(uuid,boolean) to authenticated;

commit;
