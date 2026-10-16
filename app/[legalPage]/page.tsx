import type {Metadata} from 'next';
import {notFound,redirect} from 'next/navigation';
import {readContent,adminUser,defaults} from '../../lib/cms';
import {legalDocument,legalLinks} from '../../lib/legal.mjs';
import {localizeContent} from '../../public/translations.mjs';
export const dynamic='force-dynamic';
export const metadata:Metadata={robots:{index:false,follow:true}};
const slugs=new Set(['impressum','datenschutz','cookies','agb','widerruf','barrierefreiheit']);
type Props={params:Promise<{legalPage:string}>,searchParams:Promise<Record<string,string|undefined>>};
export default async function LegalPage({params,searchParams}:Props){
 const {legalPage}=await params;if(!slugs.has(legalPage))notFound();
 const query=await searchParams,preview=query.preview!==undefined,isTr=query.lang==='tr';
 if(preview&&!await adminUser())redirect('/admin');
 let c=defaults,unavailable=false;
 try{c=(await readContent(preview?'draft':'published')).data;if(isTr)c=localizeContent(c,'tr')}catch{unavailable=true}
 const doc=legalDocument(c,legalPage);if(!doc)notFound();
 const l=c.legal,s=c.settings;
 const suffix=(isTr?'/tr':'')+(preview?'?preview=1':'');
 const localized=(path:string)=>isTr?'/tr'+(path==='/'?'':path):path;
 const switchHref=isTr?(legalPage==='/tr'?'/'+'/'+legalPage.replace(/^tr\//,''):'/'+legalPage):'/tr/'+legalPage;
 return <>
  <title>{doc.title+' | '+s.name}</title><link rel="stylesheet" href="/style.css"/>
  {isTr&&<script dangerouslySetInnerHTML={{__html:"document.documentElement.lang='tr'"}}/>}
  <a className="skip-link" href="#legal-content">{isTr?'İçeriğe geç':'Zum Inhalt'}</a>
  <div className="top">{s.announcement}</div>
  <header className="wrap"><nav className="nav" aria-label={isTr?'Ana menü':'Hauptnavigation'}><a className="brand" href={(isTr?'/tr':'/')+(preview?'?preview=1':'')}>{s.name}<small>{s.tagline}</small></a><div className="navlinks"><a href={(isTr?'/tr':'/')+(preview?'?preview=1':'')}>{c.navigation.home}</a><a href={localized('/katalog')+(preview?'?preview=1':'')}>{c.navigation.catalog}</a><a className="language-switch" href={switchHref} lang={isTr?'de':'tr'}>{isTr?'DE':'TR'}</a></div></nav></header>
  <main className="wrap legal-page" id="legal-content"><div className="eyebrow">{s.name} / {isTr?'BİLGİLER':'INFORMATIONEN'}</div><h1>{doc.title}</h1>
   {(unavailable||!l.confirmed||preview)&&<aside className="legal-notice" role="note">{unavailable?(isTr?'Yayımlanan sürüme şu anda erişilemiyor. Aşağıda eksik bir taslak gösteriliyor. ':'Aktuell ist die veröffentlichte Fassung nicht abrufbar. Nachfolgend wird eine unvollständige Entwurfsfassung gezeigt. '):''}{l.draftNotice}</aside>}
   {l.lastUpdated&&<p className="legal-updated">{l.headings.updated}: {l.lastUpdated}</p>}
   {'intro' in doc&&doc.intro&&<p>{doc.intro}</p>}
   {doc.sections.map((part:any,i:number)=><section key={i}><h2>{part.title}</h2><p style={{whiteSpace:'pre-wrap'}}>{part.text}</p></section>)}
   <a className="btn outline" href={(isTr?'/tr':'/')+(preview?'?preview=1':'')}>{l.headings.back} ↗</a>
  </main>
  <footer className="wrap footer"><div className="footer-row"><small>{s.footerText}</small><nav className="footer-links" aria-label={isTr?'Yasal bilgiler':'Rechtliche Informationen'}>{legalLinks(c).map((item:any)=><a key={item.href} href={localized(item.href)+(preview?'?preview=1':'')} aria-current={item.href==='/'+legalPage?'page':undefined}>{item.title}</a>)}</nav></div></footer>
 </>;
}
