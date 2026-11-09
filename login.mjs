import {getClient,login,staffSession,SetupRequiredError} from './backend.mjs';
const form=document.querySelector('#loginForm'),status=document.querySelector('#loginStatus'),button=document.querySelector('#loginButton'),password=document.querySelector('#password'),email=document.querySelector('#email');
function message(text,error=false){status.textContent=text;status.className='form-status '+(error?'error':'success');}
const reset=new URLSearchParams(location.search).get('reset')==='1';
document.querySelector('#togglePassword').onclick=()=>{const show=password.type==='password';password.type=show?'text':'password';document.querySelector('#togglePassword').textContent=show?'Hide':'Show';document.querySelector('#togglePassword').setAttribute('aria-label',show?'Hide password':'Show password');};
let client;
try{
 client=await getClient();
 if(reset){
  const {data,error}=await client.auth.getUser();if(error||!data.user)throw new Error('This password setup link is invalid or expired. Request a new one from the school administrator.');
  email.value=data.user.email;email.readOnly=true;password.minLength=12;password.autocomplete='new-password';document.querySelector('#loginTitle').textContent='Set your password.';document.querySelector('#loginIntro').textContent='Choose at least 12 characters for your school account.';document.querySelector('#passwordLabel').textContent='New password';button.innerHTML='Save password <span>↗</span>';document.querySelector('#forgotPassword').hidden=true;
 }else if(await staffSession()){location.replace(new URL('./dashboard.html',import.meta.url).href);}
}catch(error){message(error instanceof SetupRequiredError?'Staff login is awaiting the shared database connection and administrator account setup. No password has been created yet.':error.message,true);button.disabled=true;document.querySelector('#forgotPassword').disabled=true;}
form.onsubmit=async event=>{
 event.preventDefault();button.disabled=true;message(reset?'Saving your password…':'Signing in…');
 try{
  if(reset){if(password.value.length<12)throw new Error('Choose a password with at least 12 characters.');const {error}=await client.auth.updateUser({password:password.value});if(error)throw new Error('The password could not be updated. Request a fresh setup link.');if(!await staffSession())throw new Error('Password saved. Your administrator still needs to enable staff access.');}
  else await login(email.value.trim(),password.value);
  password.value='';location.href=new URL('./dashboard.html',import.meta.url).href;
 }catch(error){message(error.message,true);button.disabled=false;}
};
document.querySelector('#forgotPassword').onclick=async()=>{
 if(!email.value||!email.validity.valid)return message('Enter your registered email address first.',true);
 const control=document.querySelector('#forgotPassword');control.disabled=true;
 try{const {error}=await client.auth.resetPasswordForEmail(email.value.trim(),{redirectTo:new URL('./login.html?reset=1',import.meta.url).href});if(error)throw new Error('Password reset is unavailable. Contact the school administrator.');message('If that email has an account, password-reset instructions will be sent.');}catch(error){message(error.message,true)}finally{control.disabled=false;}
};
