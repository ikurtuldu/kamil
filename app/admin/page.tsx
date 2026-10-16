import {adminUser} from '../../lib/auth';
import {authConfigured} from '../../lib/auth';
import {redirect} from 'next/navigation';
import LoginForm from './LoginForm';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export const metadata={title:'Yönetici girişi — NORDRAUM',robots:{index:false,follow:false}};
export default async function Admin(){
 if(await adminUser())redirect('/admin-panel.html');
 return <><link rel="stylesheet" href="/admin.css"/><main className="login"><p>NORDRAUM / YÖNETİM</p><h1>Yönetim paneline giriş</h1>{authConfigured()?<LoginForm/>:<p>Yönetici girişi henüz yapılandırılmamış. Kurulum rehberindeki sunucu ortam değişkenlerini tamamlayın.</p>}<a href="/">Siteye dön ↗</a></main></>;
}
