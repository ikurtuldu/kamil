'use client';
import {useState} from 'react';
export default function LoginForm(){
 const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
 return <form onSubmit={async e=>{e.preventDefault();setBusy(true);setMessage('');const form=new FormData(e.currentTarget);try{const response=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:form.get('email'),password:form.get('password')})});const result=await response.json();if(!response.ok)throw new Error(result.error);window.location.assign('/admin-panel.html')}catch(error){setMessage(error instanceof Error?error.message:'Giriş başarısız.')}finally{setBusy(false)}}}>
  <label className="field">E-posta<input type="email" name="email" autoComplete="username" required maxLength={254}/></label>
  <label className="field" style={{margin:'20px 0'}}>Şifre<input type="password" name="password" autoComplete="current-password" required maxLength={1024}/></label>
  <button className="primary" disabled={busy}>{busy?'Giriş yapılıyor…':'Giriş yap'}</button>
  <p role="alert">{message}</p>
 </form>;
}
