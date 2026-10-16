export const MAX_IMAGE_BYTES=3*1024*1024;
export function detectImageType(bytes){
 if(bytes.length<12)return null;
 if(bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff)return {type:'image/jpeg',ext:'jpg'};
 if([137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v))return {type:'image/png',ext:'png'};
 if(new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP')return {type:'image/webp',ext:'webp'};
 return null;
}
