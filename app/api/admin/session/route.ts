import {NextResponse} from 'next/server';
import {credentialsConfigured,sessionFromRequest} from '../../../../lib/admin-session';
import {supabaseConfigured} from '../../../../lib/db';

export const dynamic='force-dynamic';

export async function GET(req:Request){
  const s=sessionFromRequest(req);
  return NextResponse.json({authenticated:!!s,username:s?.username||null,loginConfigured:credentialsConfigured(),supabase:supabaseConfigured()},{headers:{'Cache-Control':'no-store'}});
}
