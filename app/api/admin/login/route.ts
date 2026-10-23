import {NextResponse} from 'next/server';
import {SESSION_COOKIE,checkCredentials,createSessionToken,credentialsConfigured,sessionCookieOptions} from '../../../../lib/admin-session';

// Best-effort brute-force guard (per server instance): 8 failed attempts per IP per 15 minutes.
const attempts=new Map<string,{n:number;until:number}>();
const WINDOW=15*60*1000,LIMIT=8;

export async function POST(req:Request){
  if(!credentialsConfigured())return NextResponse.json({error:'Admin login is not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD.'},{status:503});
  const ip=(req.headers.get('x-forwarded-for')||'').split(',')[0].trim()||'local';
  const now=Date.now();const rec=attempts.get(ip);
  if(rec&&rec.until>now&&rec.n>=LIMIT)return NextResponse.json({error:'Too many attempts. Try again in a few minutes.'},{status:429});
  let body:any={};try{body=await req.json()}catch{}
  if(!checkCredentials(String(body.username||''),String(body.password||''))){
    const r=rec&&rec.until>now?rec:{n:0,until:now+WINDOW};r.n++;attempts.set(ip,r);
    await new Promise(res=>setTimeout(res,600));
    return NextResponse.json({error:'Incorrect username or password.'},{status:401});
  }
  attempts.delete(ip);
  const res=NextResponse.json({ok:true,username:process.env.ADMIN_USERNAME});
  res.cookies.set(SESSION_COOKIE,createSessionToken(),sessionCookieOptions());
  return res;
}
