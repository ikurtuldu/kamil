import {defaults,validateContent,safeUrl,normalizeContent} from '/content-schema.mjs';
import {legalIssues} from '/legal.mjs';
const $=s=>document.querySelector(s),el=(tag,props={})=>Object.assign(document.createElement(tag),props);
const labels={settings:'Firma ve görünüm',seo:'Arama motoru ayarları',navigation:'Menü ve bağlantı metinleri',hero:'Ana sayfa giriş bölümü',services:'Nakliye hizmetleri',feature:'Koleksiyon tanıtımı',process:'Çalışma süreci',shops:'Satış siteleri',catalog:'Katalog ve kategoriler',products:'Mobilya ürünleri',contact:'İletişim ve form',legal:'Yasal metinler',name:'Ad / firma adı',tagline:'Marka alt başlığı',announcement:'Üst duyuru metni',language:'Site dili kodu',email:'İletişim e-postası',phone:'Telefon',address:'Adres',area:'Hizmet bölgesi',logo:'Logo görseli',primaryColor:'Ana renk',accentColor:'Vurgu rengi',backgroundColor:'Arka plan rengi',footerText:'Alt bilgi sloganı',notice:'Bilgilendirme metni',homeTitle:'Ana sayfa tarayıcı başlığı',catalogTitle:'Katalog tarayıcı başlığı',description:'Açıklama',home:'Ana sayfa',privacy:'Gizlilik metni',imprint:'Firma künyesi metni',title:'Başlık',accent:'Vurgulu başlık',text:'Metin',button:'Buton metni',eyebrow:'Bölüm üst etiketi',secondaryButton:'İkinci buton metni',secondaryText:'İkinci açıklama',image:'Görsel',imageAlt:'Görsel açıklaması',imageTitle:'Görsel üzeri başlık',imageSubtitle:'Görsel üzeri alt başlık',benefits:'Avantajlar',rail:'Giriş altı maddeler',items:'Öğeler',label:'Kısa etiket',url:'Hedef bağlantı',unavailable:'Bağlantı yoksa gösterilen metin',all:'Tümü filtresi',detailButton:'Ürün sorgulama butonu',requestPrice:'Fiyat belirtilmediğinde',dimensionsLabel:'Ölçüler alan etiketi',availabilityLabel:'Stok alan etiketi',empty:'Boş liste mesajı',bottomTitle:'Katalog alt başlığı',bottomText:'Katalog alt açıklaması',bottomButton:'Katalog alt butonu',categories:'Ürün kategorileri',id:'Benzersiz ürün kimliği',category:'Kategori',material:'Malzeme / renk',price:'Fiyat (ör. 890 €)',dimensions:'Ölçüler',availability:'Stok / teslimat bilgisi',visible:'Sitede göster',note:'Form açıklaması',nameLabel:'Ad alan etiketi',emailLabel:'E-posta alan etiketi',serviceLabel:'Hizmet alan etiketi',fromLabel:'Çıkış yeri etiketi',toLabel:'Varış yeri etiketi',messageLabel:'Mesaj alan etiketi',preparedTitle:'Hazırlanan talep başlığı',preparedText:'Hazırlanan talep açıklaması',emailButton:'E-posta açma butonu',copyButton:'Kopyalama butonu',copied:'Kopyalama başarılı mesajı',copyFallback:'Kopyalama alternatif mesajı',noEmail:'E-posta eksik mesajı',imprintTitle:'Firma künyesi başlığı',privacyTitle:'Gizlilik başlığı'};
Object.assign(labels,{confirmed:'Hukuki içerikler firmaya ve fiili işleyişe göre kontrol edildi',draftNotice:'Kontrol tamamlanmadığında ziyaretçiye gösterilen taslak uyarısı',lastUpdated:'Hukuki metinlerin son güncelleme tarihi',operator:'Resmî işletmeci bilgileri',legalName:'Tam ticari unvan / işletme sahibinin tam adı',legalForm:'Hukuki tür (doğrulanmışsa)',representative:'Yetkili / temsilci',registerCourt:'Ticaret sicili mahkemesi (varsa)',registerNumber:'Sicil numarası (varsa)',vatId:'USt-IdNr. (varsa)',businessId:'Wirtschafts-Identifikationsnummer (varsa)',supervisoryAuthority:'Yetkili ruhsat / denetim kurumu (gerekiyorsa)',professionalRules:'Mesleki düzenlemeler (gerekiyorsa)',insurance:'Mesleki sorumluluk sigortası bilgileri (gerekiyorsa)',otherInformation:'Ek resmî bilgiler',disputeText:'Tüketici uyuşmazlık çözümü açıklaması (§ 36 VSBG)',privacyIntro:'Gizlilik giriş metni',hostingText:'Hosting, alıcılar ve sunucu kayıtları',contactText:'Talep formu ve e-posta ile iletişim',adminText:'Yönetici girişi ve sürüm kayıtları',retentionText:'Veri saklama süreleri / kriterleri',transferText:'EWR dışına veri aktarımı ve güvenceler',rightsText:'İlgili kişinin hakları',authorityText:'Veri koruma denetim kurumu',dpoText:'Veri koruma görevlisi (gerekiyorsa)',linksText:'Haricî satış platformları',mediaText:'Görseller ve yazı tipleri',cookiesTitle:'Çerez bilgi sayfası başlığı',cookiesText:'Gerçekte kullanılan çerez / depolama bilgileri',formPrivacyText:'Form altı gizlilik açıklaması',formPrivacyLink:'Form altı gizlilik bağlantısı metni',headings:'Hukuki sayfa bölüm başlıkları',provider:'DDG işletmeci başlığı',representative:'Temsilci / yetkili',register:'Sicil başlığı',tax:'Vergi kimlikleri başlığı',authority:'Denetim kurumu başlığı',dispute:'Tüketici uyuşmazlığı başlığı',controller:'Veri sorumlusu başlığı',hosting:'Hosting başlığı',inquiries:'İletişim başlığı',administration:'Yönetici işlemleri başlığı',retention:'Saklama süresi başlığı',transfers:'Yurtdışı aktarım başlığı',rights:'Haklar başlığı',complaints:'Şikâyet kurumu başlığı',dpo:'Veri koruma görevlisi başlığı',links:'Satış platformları başlığı',media:'Görseller başlığı',additional:'Ek bilgiler başlığı',updated:'Güncelleme etiketi',back:'Ana sayfaya dönüş metni',terms:'AGB — sözleşme şartları (uygulanacaksa)',withdrawal:'Cayma bilgilendirmesi (uygulanacaksa)',accessibility:'BFSG erişilebilirlik bilgileri (uygulanacaksa)',enabled:'Sayfayı etkinleştir ve alt menüde göster'});
let data,version=0,history=[],publishedVersion=0,section='overview',dirty=false,busy=false;
function status(text,error=false){const box=$('#status');box.textContent=text;box.className='status'+(error?' error':'')}
function markDirty(){dirty=true;$('#saveState').textContent='Kaydedilmemiş değişiklikler'}
function set(path,value){let obj=data;for(const part of path.slice(0,-1))obj=obj[part];obj[path.at(-1)]=value;markDirty()}
function lookup(obj,path){for(const k of path)obj=obj[k];return obj}
function template(path){let obj=defaults;for(const k of path)obj=Array.isArray(obj)?obj[0]:obj[k];return obj}
function count(){return data.products.filter(p=>p.visible).length}
function field(key,value,path){
 const label=el('label',{className:'field'}),caption=el('span',{textContent:labels[key]||key});label.append(caption);
 if(typeof value==='boolean'){const input=el('input',{type:'checkbox',checked:value});input.onchange=()=>set(path,input.checked);label.append(input);return label}
 let input;
 if(key==='category'&&path[0]==='products'){input=el('select');for(const cat of data.catalog.categories)input.append(el('option',{value:cat,textContent:cat}));input.value=value}
 else if(key.toLowerCase().includes('color'))input=el('input',{type:'color',value});
 else if(['text','description','secondaryText','imprint','privacy','notice','note','title','preparedText'].includes(key)||String(value).length>110||String(value).includes('\n')){input=el('textarea',{value,rows:['imprint','privacy'].includes(key)?12:3});label.classList.add('wide')}
 else input=el('input',{value,type:key==='email'?'email':'text'});
 input.oninput=()=>set(path,input.value);label.append(input);
 if(['image','logo'].includes(key)){
  label.classList.add('wide');const image=el('img',{className:'image-preview',alt:'Görsel önizlemesi'});if(value&&safeUrl(value,'image'))image.src=value;else image.hidden=true;
  input.oninput=()=>{set(path,input.value);image.hidden=!input.value||!safeUrl(input.value,'image');if(!image.hidden)image.src=input.value};
  const tools=el('div',{className:'image-tools'}),file=el('input',{type:'file',accept:'image/jpeg,image/png,image/webp'}),uploadStatus=el('small',{className:'upload-status',role:'status'});file.setAttribute('aria-label','Görsel yükle');const uploadMessage=(text,error=false)=>{uploadStatus.textContent=text;uploadStatus.classList.toggle('error',error);uploadStatus.setAttribute('role',error?'alert':'status');status(text,error)};
  file.onchange=async()=>{if(!file.files[0])return;if(file.files[0].size>3*1024*1024){uploadMessage('Görsel en fazla 3 MB olabilir.',true);return}file.disabled=true;uploadMessage('Görsel yükleniyor…');try{const body=new FormData();body.append('file',file.files[0]);const r=await fetch('/api/upload',{method:'POST',body}),v=await r.json();if(!r.ok)throw Error(v.error||`Görsel yüklenemedi (HTTP ${r.status}).`);input.value=v.url;set(path,v.url);image.src=v.url;image.hidden=false;uploadMessage('Görsel yüklendi. Değişikliği kaydetmeyi unutmayın.')}catch(e){uploadMessage(e.message||'Görsel yüklenemedi. Bağlantınızı ve depolama ayarlarını kontrol edin.',true)}finally{file.disabled=false}};
  tools.append(file,uploadStatus);label.append(image,tools,el('small',{className:'helper',textContent:'JPEG, PNG veya WebP · En fazla 3 MB. Görsel adresi de girebilirsiniz.'}));
 }
 if(key==='url')label.append(el('small',{className:'helper',textContent:'https:// ile başlayan adres veya /katalog gibi site içi yol. Boş bırakırsanız bağlantı gösterilmez.'}));
 return label;
}
function fields(value,path){
 const grid=el('div',{className:'fields'});
 if(Array.isArray(value)){
  value.forEach((item,i)=>{
   const card=el('div',{className:'group'}),head=el('div',{className:'group-head'}),controls=el('div');head.append(el('h2',{textContent:typeof item==='object'?(item.name||item.title||`Öğe ${i+1}`):`Öğe ${i+1}`}));
   for(const [text,delta]of [['↑',-1],['↓',1]]){const b=el('button',{textContent:text,className:'mini',disabled:i+delta<0||i+delta>=value.length});b.setAttribute('aria-label',delta<0?'Yukarı taşı':'Aşağı taşı');b.onclick=()=>{[value[i],value[i+delta]]=[value[i+delta],value[i]];markDirty();render()};controls.append(b)}
   const remove=el('button',{textContent:'Sil',className:'mini danger'});remove.onclick=()=>confirmAction('Bu öğe silinsin mi? Kaydedene kadar değişiklik yayına yansımaz.',()=>{value.splice(i,1);markDirty();render()});controls.append(remove);head.append(controls);card.append(head);
   card.append(typeof item==='object'?fields(item,[...path,i]):field(path.at(-1),item,[...path,i]));grid.append(card)
  });
  const add=el('button',{textContent:'+ '+(path[0]==='products'?'Ürün ekle':'Öğe ekle'),className:'wide'});add.onclick=()=>{
   let model=structuredClone(template([...path,0]));
   if(typeof model==='object'){for(const k of Object.keys(model))model[k]=typeof model[k]==='boolean'?true:'';if(path[0]==='products'){model.id=crypto.randomUUID();model.name='Yeni ürün';model.category=data.catalog.categories[0]||''}}
   else model='';value.push(model);markDirty();render();
  };grid.append(add);return grid;
 }
 for(const [k,v]of Object.entries(value)){
  if(typeof v==='object'){const box=el('div',{className:'wide'});box.append(el('h2',{textContent:labels[k]||k}),fields(v,[...path,k]));grid.append(box)}else grid.append(field(k,v,[...path,k]));
 }return grid;
}
function render(){
 $('#sectionTitle').textContent=section==='overview'?'Site yönetimi':section==='history'?'Yayın geçmişi':labels[section];
 document.querySelectorAll('[data-section]').forEach(b=>b.classList.toggle('active',b.dataset.section===section));
 const body=$('#editor');body.replaceChildren();
 if(section==='overview'){
  const stats=el('div',{className:'stats'});for(const [number,text]of [[count(),'Görünür ürün'],[data.shops.items.length,'Satış sitesi'],[publishedVersion,'Yayın sürümü']]){const card=el('div',{className:'stat'});card.append(el('strong',{textContent:number}),el('small',{textContent:text}));stats.append(card)}
  body.append(stats,el('h2',{textContent:'İçeriği düzenleyin, kontrol edin, yayınlayın.'}),el('p',{textContent:'Soldaki menüden düzenlemek istediğiniz bölümü açın. Taslağı kaydet butonu değişiklikleri veritabanında saklar. Taslak önizlemesi yalnızca yöneticiye açıktır. Siteye yayınla butonu kaydedilmiş veya ekranda düzenlenmiş içeriği ziyaretçilere açar.'}),el('p',{textContent:'Ürün ve satış sitesi listelerine yeni öğe ekleyebilir, sıralarını değiştirebilir veya silebilirsiniz. Görseller dosya olarak yüklenebilir. İletişim formu, ayarladığınız e-posta adresine gönderilmek üzere ziyaretçinin e-posta programını açar.'}));
 }else if(section==='history'){
  body.append(el('p',{textContent:'Son 20 yayın. Geri alınan sürüm önce taslağa yüklenir; siteye yansıtmak için ayrıca yayınlayın.'}));
  if(!history.length)body.append(el('p',{textContent:'Henüz yayın geçmişi yok.'}));
  history.forEach(item=>{const row=el('div',{className:'history-item'}),restore=el('button',{textContent:'Taslağa geri al'});row.append(el('span',{textContent:new Date(item.created_at).toLocaleString('tr-TR')}),restore);restore.onclick=()=>confirmAction('Bu sürüm mevcut taslağın yerine alınsın mı?',()=>save('restore',{historyId:item.id}));body.append(row)})
 }else {
  if(section==='legal'){
   body.append(el('p',{textContent:'Impressum ve gizlilik sayfaları her zaman alt menüde bulunur. AGB, cayma ve BFSG sayfalarını yalnızca faaliyetiniz için uygulanacak, kontrol edilmiş içeriklerle etkinleştirin. Firma adresi, e-posta ve telefon Firma ve görünüm bölümünden alınır. Köşeli parantezli alanlar tamamlanmalıdır. Kontrol kutusu bir hukuki uygunluk garantisi oluşturmaz.'}));
   const issues=legalIssues(data),box=el('div',{className:'status'+(issues.length?' error':'')});box.textContent=issues.length?issues.join('\n'):'Eksik şablon alanı tespit edilmedi. Firma türüne ve faaliyete özel yükümlülükleri ayrıca doğrulayın.';body.append(box);
   const links=el('p');for(const [path,text]of [['impressum','Impressum'],['datenschutz','Datenschutz'],['cookies','Çerez bilgileri']]){const a=el('a',{href:`/${path}?preview=1`,textContent:text+' ↗ ',target:'_blank',rel:'noopener'});links.append(a)}body.append(links);
  }
  body.append(fields(data[section],[section]));
 }
}
function confirmAction(text,action){const dialog=$('#confirm');dialog.querySelector('p').textContent=text;dialog.querySelector('[data-confirm]').onclick=()=>{dialog.close();action()};dialog.showModal()}
async function load(){const r=await fetch('/api/admin',{cache:'no-store'});if(r.status===403){location.replace('/admin');return false}const value=await r.json();if(!r.ok)throw Error(value.error);data=normalizeContent(value.draft.data);version=value.draft.version;publishedVersion=value.published.version;history=value.history;dirty=false;return true}
async function save(action='save',extra={}){
 if(busy)return;try{if(action!=='restore')validateContent(data)}catch(e){status(e.message,true);return false}
 busy=true;$('#editor').inert=true;$('#sections').inert=true;document.querySelectorAll('[data-mutate]').forEach(b=>b.disabled=true);status(action==='publish'?'Yayınlanıyor…':'Kaydediliyor…');
 try{const r=await fetch('/api/admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,data,version,...extra})}),value=await r.json();if(!r.ok)throw Error(value.error);
  version=value.version;dirty=false;$('#saveState').textContent='Kaydedildi · '+new Date(value.updatedAt).toLocaleTimeString('tr-TR');
  if(action!=='save'){await load();render()}
  status(action==='publish'?'İçerik siteye yayınlandı. Ziyaretçiler yeni içeriği görebilir.':action==='restore'?'Sürüm taslağa geri alındı. Kontrol edip yayınlayabilirsiniz.':'Taslak kaydedildi. Canlı site henüz değişmedi.');return true;
 }catch(e){status(e.message,true);return false}finally{busy=false;$('#editor').inert=false;$('#sections').inert=false;document.querySelectorAll('[data-mutate]').forEach(b=>b.disabled=false)}
}
async function start(){
 if(!await load())return;
 $('#admin').innerHTML=`<header><div><strong>NORDRAUM</strong><small>İÇERİK YÖNETİM PANELİ</small></div><div class="actions"><span id="saveState">Tüm değişiklikler kaydedildi</span><a class="button" href="/" target="_blank" rel="noopener">Siteyi aç ↗</a><button id="preview" data-mutate>Önizle</button><button id="save" data-mutate>Taslağı kaydet</button><button id="publish" class="primary" data-mutate>Siteye yayınla</button></div></header><div class="shell"><aside id="sections"></aside><main><h1 id="sectionTitle"></h1><p class="subtitle">Sitenizin içeriklerini buradan yönetin.</p><div id="status" class="status" role="status">İçerikler yüklendi.</div><div id="editor"></div></main></div><dialog id="confirm"><h2>İşlemi onaylayın</h2><p></p><div class="actions"><button data-cancel>Vazgeç</button><button data-confirm class="primary">Onayla</button></div></dialog>`;
 const sidebar=$('#sections');for(const [id,text]of [['overview','Genel bakış'],...Object.keys(defaults).map(k=>[k,labels[k]]),['history','Yayın geçmişi']]){const b=el('button',{textContent:text});b.dataset.section=id;b.onclick=()=>{section=id;render()};sidebar.append(b)}
 const refresh=el('button',{textContent:'Güncel içeriği yükle'});refresh.onclick=()=>confirmAction('Kaydedilmemiş değişiklikler atılır. Güncel içerik yüklensin mi?',async()=>{try{await load();render();$('#saveState').textContent='Güncel içerik yüklendi';status('Güncel içerik yüklendi.')}catch(e){status(e.message,true)}});sidebar.append(refresh,el('p',{textContent:'Değişiklikler ortak veritabanında saklanır. Giriş yalnızca yetkilendirilmiş yönetici hesaplarına açıktır.'}));const logout=el('button',{textContent:'Çıkış yap'});logout.onclick=async()=>{try{const r=await fetch('/api/auth/logout',{method:'POST'});if(!r.ok)throw Error('Çıkış yapılamadı.');dirty=false;location.assign('/admin')}catch(e){status(e.message,true)}};sidebar.append(logout);
 $('#confirm [data-cancel]').onclick=()=>$('#confirm').close();$('#save').onclick=()=>save();$('#publish').onclick=()=>confirmAction('Bu içerik ziyaretçilere yayınlansın mı?',()=>save('publish'));$('#preview').onclick=async()=>{const tab=window.open('about:blank','_blank');if(await save()){if(tab)tab.location='/index.html?preview=1';else status('Taslak kaydedildi. Tarayıcınız önizleme penceresini engelledi. /index.html?preview=1 adresini açabilirsiniz.')}else tab?.close()};render();
}
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue=''}});
start().catch(e=>{const box=el('main',{className:'login'});box.append(el('h1',{textContent:'Panel yüklenemedi'}),el('p',{textContent:e.message}),el('a',{href:'/admin',textContent:'Giriş sayfasına dön'}));$('#admin').replaceChildren(box)});
