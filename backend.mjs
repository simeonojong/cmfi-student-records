export class SetupRequiredError extends Error {
 constructor(){super('The shared records service is not connected yet. Please contact the school office.');this.name='SetupRequiredError'}
}
let clientPromise,configPromise;
async function loadConfig(){
 if(!configPromise)configPromise=(async()=>{
  const response=await fetch(new URL('./config.json?v=database-20261110',import.meta.url),{cache:'no-store'});
  if(!response.ok)throw new SetupRequiredError();
  const config=await response.json();
  if(!config.supabaseUrl||!config.supabasePublishableKey)throw new SetupRequiredError();
  if(!/^https:\/\//.test(config.supabaseUrl))throw new Error('The records service must use HTTPS.');
  if(config.supabasePublishableKey.startsWith('sb_secret_'))throw new Error('A secret key must never be used in browser configuration.');
  return config;
 })();
 return configPromise;
}
async function makeClient(persistSession){
 const config=await loadConfig();
 const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
 return createClient(config.supabaseUrl,config.supabasePublishableKey,{auth:{persistSession,autoRefreshToken:persistSession,detectSessionInUrl:persistSession}});
}
export async function getClient(){if(!clientPromise)clientPromise=makeClient(true);return clientPromise;}
export async function staffSession(){
 const client=await getClient();const {data,error}=await client.auth.getUser();
 if(error||!data.user)return null;
 const staff=await client.from('cmfi_staff').select('display_name,role,avatar_url,active').eq('user_id',data.user.id).eq('active',true).maybeSingle();
 if(staff.error)throw staff.error;
 if(!staff.data)return null;
 return {user:data.user,...staff.data};
}
export async function requireStaff(){
 const session=await staffSession();
 if(!session){location.replace(new URL('./login.html',import.meta.url).href);throw new Error('Staff sign-in required.');}
 return session;
}
export async function login(email,password){
 const client=await getClient();const result=await client.auth.signInWithPassword({email,password});
 if(result.error)throw new Error('Sign-in failed. Check your username and password.');
 if(!await staffSession()){await client.auth.signOut();throw new Error('This account does not have active school staff access.');}
}
export async function logout(){const client=await getClient();await client.auth.signOut();location.href=new URL('./login.html',import.meta.url).href;}
export async function updatePassword(password){const client=await getClient();const {error}=await client.auth.updateUser({password});if(error)throw new Error('The password could not be updated.');}
export async function updateMyProfile(displayName,avatarUrl){const client=await getClient();const {data,error}=await client.rpc('cmfi_update_my_profile',{new_display_name:displayName,new_avatar_url:avatarUrl||null});if(error)throw new Error(error.message);return data;}
export async function listStaff(){const client=await getClient();const {data,error}=await client.rpc('cmfi_list_staff');if(error)throw new Error(error.message);return Array.isArray(data)?data:[];}
export async function setStaffActive(userId,active){const client=await getClient();const {data,error}=await client.rpc('cmfi_set_staff_active',{target_user_id:userId,should_be_active:active});if(error)throw new Error(error.message);return data;}
export async function createStaffUser(email,password,displayName,role){
 const client=await getClient();const isolated=await makeClient(false);
 const signup=await isolated.auth.signUp({email,password,options:{data:{display_name:displayName}}});
 if(signup.error)throw new Error(signup.error.message||'The staff account could not be created.');
 if(!signup.data.user)throw new Error('The staff account could not be created.');
 const {data,error}=await client.rpc('cmfi_add_staff_member',{staff_user_id:signup.data.user.id,staff_email:email,staff_display_name:displayName,staff_role:role});
 if(error)throw new Error(error.message);return data;
}
export async function loadWorkspace(){const client=await getClient();const {data,error}=await client.rpc('cmfi_load_workspace');if(error)throw new Error(error.message);return data;}
export async function saveWorkspace(students,documents,revision){
 const client=await getClient();const {data,error}=await client.rpc('cmfi_save_workspace',{student_records:students,document_records:documents,expected_revision:revision});
 if(error){if(error.message.includes('WORKSPACE_CHANGED'))throw new Error('A colleague saved new changes. Reload the workspace before editing again; your unsaved copy can be exported.');throw new Error(error.message)}
 return data;
}
export function normalizeCredential(value){
 let id=value.trim();
 if(/^https?:\/\//i.test(id)){try{const url=new URL(id);id=url.searchParams.get('verify')||url.searchParams.get('document')||''}catch{throw new Error('Enter the document ID or its QR link.')}}
 if(!/^SCH-[a-f0-9-]{8,40}$/i.test(id))throw new Error('Enter the complete SCH- document ID printed beside the QR code.');
 return id.toUpperCase();
}
export async function publicRecord(value){const credential=normalizeCredential(value);const client=await getClient();const {data,error}=await client.rpc('cmfi_verify_document',{credential_id:credential});if(error)throw new Error('The verification service could not be reached. Please try again.');return data;}
