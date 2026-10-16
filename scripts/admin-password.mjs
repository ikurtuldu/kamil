import {hashPassword} from '../lib/auth-crypto.mjs';
if(!process.stdin.isTTY){console.error('Bu komutu etkileşimli terminalde çalıştırın. Şifre komut satırı argümanı olarak alınmaz.');process.exit(1)}
process.stdout.write('Yönetici şifresi (en az 12 karakter; ekranda görünmez): ');
process.stdin.setRawMode(true);process.stdin.setEncoding('utf8');process.stdin.resume();
let value='';
process.stdin.on('data',async chunk=>{
 for(const char of chunk){
  if(char==='\u0003'){process.stdin.setRawMode(false);process.exit(1)}
  if(char==='\r'||char==='\n'){
   process.stdin.setRawMode(false);process.stdin.pause();
   try{const hash=await hashPassword(value);process.stdout.write('\n\nADMIN_PASSWORD_HASH değeri:\n'+hash+'\n')}catch(e){console.error('\n'+e.message);process.exitCode=1}return;
  }
  if(char==='\u007f'||char==='\b')value=value.slice(0,-1);else if(char>=' ')value+=char;
 }
});
