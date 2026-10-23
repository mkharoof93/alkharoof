import {createClient} from '@supabase/supabase-js';
import {sessionFromRequest} from './admin-session';

export function db(){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key)return null;
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}

// Cookie-authenticated writes must come from this site (blocks cross-site form/fetch posts).
function sameOrigin(req:Request){
  const origin=req.headers.get('origin');
  if(!origin)return true;
  try{return new URL(origin).host===(req.headers.get('x-forwarded-host')||req.headers.get('host'))}catch{return false}
}

export async function authorized(req:Request){
  const raw=req.headers.get('authorization')?.replace(/^Bearer\s+/i,'')||'';
  if(process.env.ADMIN_API_KEY && raw===process.env.ADMIN_API_KEY) return true;
  return !!sessionFromRequest(req)&&sameOrigin(req);
}

export const supabaseConfigured=()=>!!(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.SUPABASE_SERVICE_ROLE_KEY);
