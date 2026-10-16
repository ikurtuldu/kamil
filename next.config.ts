import type {NextConfig} from 'next';
const config:NextConfig={
 poweredByHeader:false,
 serverExternalPackages:['mysql2'],
 experimental:{webpackBuildWorker:false,cpus:2},
 async headers(){return [{source:'/(.*)',headers:[{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},{key:'X-Frame-Options',value:'DENY'}]},{source:'/admin-panel.html',headers:[{key:'Cache-Control',value:'no-store'},{key:'X-Robots-Tag',value:'noindex, nofollow'}]}]}
};
export default config;
