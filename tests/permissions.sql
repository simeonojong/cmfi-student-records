\set ON_ERROR_STOP on
insert into public.cmfi_staff(user_id,display_name,role) values('11111111-1111-4111-8111-111111111111','Test administrator','admin');
set role anon;
do $$begin
 begin perform * from public.cmfi_students;raise exception 'FAIL: anonymous table read';exception when insufficient_privilege then null;end;
 begin perform public.cmfi_load_workspace();raise exception 'FAIL: anonymous workspace read';exception when insufficient_privilege then null;end;
 begin perform public.cmfi_save_workspace('[]','[]',0);raise exception 'FAIL: anonymous write';exception when insufficient_privilege then null;end;
 if public.cmfi_verify_document('SCH-1234ABCD') is not null then raise exception 'FAIL: unknown document should return null';end if;
end$$;
reset role;
set role authenticated;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',false);
do $$begin
 begin perform public.cmfi_load_workspace();raise exception 'FAIL: nonstaff workspace access';exception when insufficient_privilege then null;end;
 begin perform public.cmfi_save_workspace('[]','[]',0);raise exception 'FAIL: nonstaff write';exception when insufficient_privilege then null;end;
 begin insert into public.cmfi_staff(user_id,display_name) values('22222222-2222-4222-8222-222222222222','Self promoted');raise exception 'FAIL: self promotion';exception when insufficient_privilege then null;end;
end$$;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
do $$declare student jsonb; doc jsonb; revision bigint;
begin
 student='{"id":"TEST-001","name":"Test Student","gender":"Female","status":"Approved","subjects":[["Mathematics",90]]}';
 doc=jsonb_build_object('id','SCH-12345678-1234-1234-1234-123456789ABC','student','TEST-001','type','Transcript','date','2026-11-09','snapshot',student,'revoked',false);
 revision=public.cmfi_save_workspace(jsonb_build_array(student),jsonb_build_array(doc),0);
 if revision<>1 then raise exception 'FAIL: revision did not advance';end if;
 if public.cmfi_load_workspace()->'students'->0->>'id'<>'TEST-001' then raise exception 'FAIL: saved student missing';end if;
 begin perform public.cmfi_save_workspace(jsonb_build_array(student),jsonb_build_array(doc),0);raise exception 'FAIL: stale overwrite accepted';exception when others then if sqlerrm<>'WORKSPACE_CHANGED' then raise;end if;end;
 begin perform public.cmfi_save_workspace(jsonb_build_array(student||'{"subjects":[["Mathematics",101]]}'),jsonb_build_array(doc),1);raise exception 'FAIL: invalid grade accepted';exception when others then if sqlerrm<>'INVALID_GRADE' then raise;end if;end;
 begin perform public.cmfi_save_workspace(jsonb_build_array(student),jsonb_build_array(jsonb_set(doc,'{snapshot,name}','"Changed after issue"')),1);raise exception 'FAIL: historical snapshot changed';exception when others then if sqlerrm<>'ISSUED_SNAPSHOT_IS_IMMUTABLE' then raise;end if;end;
 revision=public.cmfi_save_workspace(jsonb_build_array(student),jsonb_build_array(doc||'{"revoked":true}'),1);
 if revision<>2 then raise exception 'FAIL: revocation revision missing';end if;
end$$;
reset role;
set role anon;
do $$declare result jsonb;begin
 result=public.cmfi_verify_document('sch-12345678-1234-1234-1234-123456789abc');
 if result->'student'->>'name'<>'Test Student' then raise exception 'FAIL: public student lookup';end if;
 if (result->'document'->>'revoked')::boolean is distinct from true then raise exception 'FAIL: public revocation status';end if;
 if result->'document'->'snapshot'->>'name'<>'Test Student' then raise exception 'FAIL: snapshot preservation';end if;
 if public.cmfi_verify_document('not an id') is not null then raise exception 'FAIL: invalid id';end if;
end$$;
reset role;
update public.cmfi_staff set active=false where user_id='11111111-1111-4111-8111-111111111111';
set role authenticated;
do $$begin
 begin perform public.cmfi_load_workspace();raise exception 'FAIL: former staff retained access';exception when insufficient_privilege then null;end;
end$$;
reset role;
select 'PASS: anonymous access blocked; nonstaff denied; self-promotion blocked; staff save; stale write rejected; grade validation; immutable document snapshots; public lookup; revocation; former staff denied' as result;
