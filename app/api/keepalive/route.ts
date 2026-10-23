import {NextResponse} from 'next/server';
import {db} from '../../../lib/db';

export const dynamic='force-dynamic';

// Supabase pauses free-tier projects after a week without activity. Because the storefront is
// served from cache, real traffic rarely reaches the database, so a daily Vercel cron (vercel.json)
// runs one tiny query here to keep the project awake.
export async function GET(req:Request){
  const secret=process.env.CRON_SECRET;
  if(secret&&req.headers.get('authorization')!==`Bearer ${secret}`)return NextResponse.json({error:'Unauthorized'},{status:401});
  const d=db();if(!d)return NextResponse.json({ok:false,reason:'Supabase is not configured'});
  const {error}=await d.from('store_settings').select('id').limit(1);
  return error?NextResponse.json({ok:false,error:error.message},{status:500}):NextResponse.json({ok:true,at:new Date().toISOString()});
}
