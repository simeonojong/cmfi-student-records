begin;
create table public.cmfi_staff (
 user_id uuid primary key references auth.users(id),
 display_name text not null,
 role text not null default 'registrar' check(role in ('admin','registrar')),
 active boolean not null default true
);
create table public.cmfi_students (
 id text primary key check(length(id) between 1 and 80),
 record jsonb not null check(jsonb_typeof(record)='object' and record->>'id'=id),
 updated_at timestamptz not null default now()
);
create table public.cmfi_documents (
 id text primary key check(id ~ '^SCH-[A-F0-9-]{8,40}$'),
 student_id text not null references public.cmfi_students(id),
 payload jsonb not null check(jsonb_typeof(payload)='object'),
 revoked boolean not null default false,
 created_at timestamptz not null default now()
);
create index cmfi_documents_student on public.cmfi_documents(student_id);
create table public.cmfi_workspace_revision (
 singleton boolean primary key default true check(singleton),
 revision bigint not null default 0
);
insert into public.cmfi_workspace_revision(singleton) values(true);
create table public.cmfi_audit_log (
 id bigint generated always as identity primary key,
 actor uuid not null references auth.users(id),
 action text not null,
 details jsonb not null default '{}',
 created_at timestamptz not null default now()
);
alter table public.cmfi_staff enable row level security;
alter table public.cmfi_students enable row level security;
alter table public.cmfi_documents enable row level security;
alter table public.cmfi_workspace_revision enable row level security;
alter table public.cmfi_audit_log enable row level security;
revoke all on public.cmfi_staff,public.cmfi_students,public.cmfi_documents,public.cmfi_workspace_revision,public.cmfi_audit_log from anon,authenticated;
create policy cmfi_staff_own_record on public.cmfi_staff for select to authenticated using(user_id=(select auth.uid()));
grant select on public.cmfi_staff to authenticated;
create function public.cmfi_is_staff() returns boolean
 language sql stable security definer set search_path=''
 as $$select exists(select 1 from public.cmfi_staff where user_id=(select auth.uid()) and active)$$;
revoke all on function public.cmfi_is_staff() from public,anon;
grant execute on function public.cmfi_is_staff() to authenticated;
create function public.cmfi_load_workspace() returns jsonb
 language plpgsql security definer set search_path='' as $$
begin
 if not public.cmfi_is_staff() then raise exception 'STAFF_ACCESS_REQUIRED' using errcode='42501';end if;
 return jsonb_build_object('students',coalesce((select jsonb_agg(record order by id) from public.cmfi_students),'[]'::jsonb),'documents',coalesce((select jsonb_agg(payload||jsonb_build_object('revoked',revoked) order by created_at desc,id) from public.cmfi_documents),'[]'::jsonb),'revision',(select revision from public.cmfi_workspace_revision where singleton));
end$$;
revoke all on function public.cmfi_load_workspace() from public,anon;
grant execute on function public.cmfi_load_workspace() to authenticated;
create function public.cmfi_save_workspace(student_records jsonb,document_records jsonb,expected_revision bigint) returns bigint
 language plpgsql security definer set search_path='' as $$
declare current_revision bigint; item jsonb; old_payload jsonb; subject jsonb;
begin
 if not public.cmfi_is_staff() then raise exception 'STAFF_ACCESS_REQUIRED' using errcode='42501';end if;
 if jsonb_typeof(student_records) is distinct from 'array' or jsonb_typeof(document_records) is distinct from 'array' then raise exception 'INVALID_RECORD_ARRAYS';end if;
 if jsonb_array_length(student_records)>5000 or jsonb_array_length(document_records)>20000 or octet_length(student_records::text)+octet_length(document_records::text)>16000000 then raise exception 'WORKSPACE_TOO_LARGE';end if;
 select revision into current_revision from public.cmfi_workspace_revision where singleton for update;
 if expected_revision is distinct from current_revision then raise exception 'WORKSPACE_CHANGED';end if;
 if (select count(*) from jsonb_array_elements(student_records)) <> (select count(distinct value->>'id') from jsonb_array_elements(student_records)) then raise exception 'DUPLICATE_STUDENT_IDS';end if;
 if (select count(*) from jsonb_array_elements(document_records)) <> (select count(distinct value->>'id') from jsonb_array_elements(document_records)) then raise exception 'DUPLICATE_DOCUMENT_IDS';end if;
 for item in select value from jsonb_array_elements(student_records) loop
  if jsonb_typeof(item) is distinct from 'object' or coalesce(length(item->>'name'),0) not between 1 and 200 or coalesce(length(item->>'id'),0) not between 1 and 80 then raise exception 'INVALID_STUDENT_RECORD';end if;
  if coalesce(item->>'gender','') not in ('','Male','Female') then raise exception 'INVALID_GENDER';end if;
  if jsonb_typeof(item->'subjects') is distinct from 'array' then raise exception 'INVALID_SUBJECTS';end if;
  for subject in select value from jsonb_array_elements(item->'subjects') loop
   if jsonb_typeof(subject) is distinct from 'array' or jsonb_array_length(subject)<>2 or jsonb_typeof(subject->0) is distinct from 'string' or jsonb_typeof(subject->1) is distinct from 'number' then raise exception 'INVALID_GRADE';end if;
   if (subject->>1)::numeric not between 0 and 100 or length(subject->>0) not between 1 and 200 then raise exception 'INVALID_GRADE';end if;
  end loop;
  insert into public.cmfi_students(id,record) values(item->>'id',item)
   on conflict(id) do update set record=excluded.record,updated_at=now() where cmfi_students.record is distinct from excluded.record;
 end loop;
 for item in select value from jsonb_array_elements(document_records) loop
  if jsonb_typeof(item) is distinct from 'object' or coalesce(item->>'type','') not in ('Transcript','Recommendation letter','Diploma') or coalesce(item->>'id','') !~ '^SCH-[A-F0-9-]{8,40}$' or jsonb_typeof(item->'snapshot') is distinct from 'object' or item->'snapshot'->>'id' is distinct from item->>'student' then raise exception 'INVALID_DOCUMENT';end if;
  if item->'snapshot'->>'status' is distinct from 'Approved' or jsonb_typeof(item->'snapshot'->'subjects') is distinct from 'array' or jsonb_array_length(item->'snapshot'->'subjects')=0 then raise exception 'APPROVED_RECORD_REQUIRED';end if;
  select payload into old_payload from public.cmfi_documents where id=item->>'id';
  if found and (old_payload-'revoked') is distinct from (item-'revoked') then raise exception 'ISSUED_SNAPSHOT_IS_IMMUTABLE';end if;
  insert into public.cmfi_documents(id,student_id,payload,revoked) values(item->>'id',item->>'student',item,coalesce((item->>'revoked')::boolean,false))
   on conflict(id) do update set revoked=excluded.revoked;
 end loop;
 update public.cmfi_workspace_revision set revision=revision+1 where singleton returning revision into current_revision;
 insert into public.cmfi_audit_log(actor,action,details) values(auth.uid(),'workspace_saved',jsonb_build_object('students',jsonb_array_length(student_records),'documents',jsonb_array_length(document_records),'revision',current_revision));
 return current_revision;
end$$;
revoke all on function public.cmfi_save_workspace(jsonb,jsonb,bigint) from public,anon;
grant execute on function public.cmfi_save_workspace(jsonb,jsonb,bigint) to authenticated;
create function public.cmfi_verify_document(credential_id text) returns jsonb
 language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 if credential_id is null or length(credential_id)>80 or upper(credential_id) !~ '^SCH-[A-F0-9-]{8,40}$' then return null;end if;
 select jsonb_build_object('document',d.payload||jsonb_build_object('revoked',d.revoked),'student',s.record,'checkedAt',now()) into result
 from public.cmfi_documents d join public.cmfi_students s on s.id=d.student_id where d.id=upper(credential_id);
 return result;
end$$;
revoke all on function public.cmfi_verify_document(text) from public;
grant execute on function public.cmfi_verify_document(text) to anon,authenticated;
commit;
