import {NextResponse} from 'next/server';
import {supabaseConfigured} from '../../../lib/db';
export async function GET(){return NextResponse.json({supabase:supabaseConfigured(),mode:supabaseConfigured()?'supabase':'demo'})}
