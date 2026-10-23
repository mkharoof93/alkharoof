import {NextResponse} from 'next/server';
import {authorized,db} from '../../../lib/db';

// Vercel rejects request bodies above ~4.5 MB, so keep uploads under that.
const MAX_BYTES=4*1024*1024;
const TYPES:Record<string,string>={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif','image/avif':'avif'};

export async function POST(req:Request){
  if(!(await authorized(req)))return NextResponse.json({error:'Unauthorized'},{status:401});
  const d=db();if(!d)return NextResponse.json({error:'Supabase is not configured'},{status:503});
  const form=await req.formData().catch(()=>null);
  const file=form?.get('file');
  if(!(file instanceof File))return NextResponse.json({error:'No file received'},{status:400});
  const ext=TYPES[file.type];
  if(!ext)return NextResponse.json({error:'Use a JPG, PNG, WebP, GIF or AVIF image'},{status:400});
  if(file.size>MAX_BYTES)return NextResponse.json({error:'Image is larger than 4 MB. Please compress it and try again.'},{status:413});
  const folder=String(form?.get('folder')||'misc').replace(/[^a-z0-9-]/gi,'')||'misc';
  const path=`${folder}/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
  const {error}=await d.storage.from('store-media').upload(path,Buffer.from(await file.arrayBuffer()),{contentType:file.type,cacheControl:'31536000',upsert:false});
  if(error)return NextResponse.json({error:error.message},{status:500});
  const {data}=d.storage.from('store-media').getPublicUrl(path);
  return NextResponse.json({url:data.publicUrl});
}
