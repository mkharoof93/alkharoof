import {NextResponse} from 'next/server';
import {authorized,db} from '../../../lib/db';import {refreshStore} from '../../../lib/store';
import {seedProducts} from '../../../lib/data';

export async function GET(){
  const d=db(); if(!d)return NextResponse.json(seedProducts);
  const {data,error}=await d.from('products').select('*').order('sortOrder',{ascending:true});
  return error?NextResponse.json({error:error.message},{status:500}):NextResponse.json(data||[]);
}
export async function POST(req:Request){
  if(!(await authorized(req)))return NextResponse.json({error:'Unauthorized'},{status:401});
  const d=db();if(!d)return NextResponse.json({error:'Supabase is not configured'},{status:503});
  const b=await req.json();
  if(!b.en?.trim()||!b.ar?.trim()||!Number.isFinite(Number(b.price))||Number(b.price)<0)return NextResponse.json({error:'Name and valid price are required'},{status:400});
  const p={
    id:b.id||crypto.randomUUID(),en:String(b.en).trim(),ar:String(b.ar).trim(),descriptionEn:String(b.descriptionEn||''),descriptionAr:String(b.descriptionAr||''),
    sku:String(b.sku||''),category:String(b.category||'Lamb'),price:Number(b.price),oldPrice:b.oldPrice===''||b.oldPrice==null?null:Number(b.oldPrice),unit:String(b.unit||'1 kg'),
    image:String(b.image||''),gallery:Array.isArray(b.gallery)?b.gallery:[],featured:!!b.featured,active:b.active!==false,badge:String(b.badge||''),
    stockQty:Number.isFinite(Number(b.stockQty))?Number(b.stockQty):0,stockStatus:String(b.stockStatus||'in_stock'),
    weightOptions:Array.isArray(b.weightOptions)?b.weightOptions:[],preparationOptions:Array.isArray(b.preparationOptions)?b.preparationOptions:[],sortOrder:Number.isFinite(Number(b.sortOrder))?Number(b.sortOrder):999
  };
  const {error}=await d.from('products').upsert(p,{onConflict:'id'}); if(!error)refreshStore();return error?NextResponse.json({error:error.message},{status:500}):NextResponse.json(p);
}
export async function DELETE(req:Request){
  if(!(await authorized(req)))return NextResponse.json({error:'Unauthorized'},{status:401}); const d=db();if(!d)return NextResponse.json({error:'Supabase is not configured'},{status:503});
  const {id}=await req.json(); const {error}=await d.from('products').delete().eq('id',id);if(!error)refreshStore();return error?NextResponse.json({error:error.message},{status:500}):NextResponse.json({ok:true});
}
