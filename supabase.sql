-- Al Kharoof Butchery Co. / شركة ملحمة الخروف
-- Production-ready Supabase schema + initial catalogue seed.
-- Run this once in Supabase SQL Editor after creating the project.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id text primary key,
  en text not null,
  ar text not null,
  "descriptionEn" text not null default '',
  "descriptionAr" text not null default '',
  sku text not null default '',
  category text not null,
  price numeric(12,3) not null check(price >= 0),
  "oldPrice" numeric(12,3),
  unit text not null default '1 kg',
  image text not null default '',
  gallery jsonb not null default '[]'::jsonb,
  featured boolean not null default false,
  active boolean not null default true,
  badge text not null default '',
  "stockQty" integer not null default 0,
  "stockStatus" text not null default 'in_stock' check ("stockStatus" in ('in_stock','low_stock','out_of_stock')),
  "weightOptions" jsonb not null default '[]'::jsonb,
  "preparationOptions" jsonb not null default '[]'::jsonb,
  "sortOrder" integer not null default 999,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id text primary key,
  "nameEn" text not null,
  "nameAr" text not null,
  slug text not null unique,
  image text not null default '',
  "subtitleEn" text not null default '',
  "subtitleAr" text not null default '',
  active boolean not null default true,
  "sortOrder" integer not null default 999,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.banners (
  id text primary key,
  en text not null,
  ar text not null,
  "subEn" text not null default '',
  "subAr" text not null default '',
  image text not null default '',
  tag text not null default '',
  "ctaEn" text not null default '',
  "ctaAr" text not null default '',
  price text not null default '',
  "oldPrice" text not null default '',
  offer text not null default '',
  category text not null default '',
  "productEn" text not null default '',
  "productAr" text not null default '',
  theme text not null default 'sunny' check(theme in ('sunny','mint','peach')),
  active boolean not null default true,
  "sortOrder" integer not null default 999,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ticker_items (
  id text primary key,
  "labelEn" text not null default '',
  "labelAr" text not null default '',
  "textEn" text not null default '',
  "textAr" text not null default '',
  active boolean not null default true,
  "sortOrder" integer not null default 999,
  "productId" text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.store_settings (
  id text primary key default 'store',
  "companyNameEn" text not null default '',
  "companyNameAr" text not null default '',
  whatsapp text not null default '',
  phone1 text not null default '',
  phone2 text not null default '',
  "addressEn" text not null default '',
  "addressAr" text not null default '',
  currency text not null default 'KWD',
  "deliveryNoteEn" text not null default '',
  "deliveryNoteAr" text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

-- Backward-compatible upgrades for earlier project versions.
alter table public.products add column if not exists "descriptionEn" text not null default '';
alter table public.products add column if not exists "descriptionAr" text not null default '';
alter table public.products add column if not exists sku text not null default '';
alter table public.products add column if not exists "oldPrice" numeric(12,3);
alter table public.products add column if not exists gallery jsonb not null default '[]'::jsonb;
alter table public.products add column if not exists badge text not null default '';
alter table public.products add column if not exists "stockQty" integer not null default 0;
alter table public.products add column if not exists "stockStatus" text not null default 'in_stock';
alter table public.products add column if not exists "weightOptions" jsonb not null default '[]'::jsonb;
alter table public.products add column if not exists "preparationOptions" jsonb not null default '[]'::jsonb;
alter table public.products add column if not exists "sortOrder" integer not null default 999;
alter table public.products add column if not exists updated_at timestamptz not null default now();
alter table public.banners add column if not exists active boolean not null default true;
alter table public.banners add column if not exists "sortOrder" integer not null default 999;
alter table public.banners add column if not exists updated_at timestamptz not null default now();

-- Storefront reads are server-side. Database tables stay locked behind service-role APIs.
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.banners enable row level security;
alter table public.ticker_items enable row level security;
alter table public.store_settings enable row level security;
alter table public.admin_users enable row level security;

-- Admin users can see their own membership row (used by Storage policies).
drop policy if exists "admin can read self" on public.admin_users;
create policy "admin can read self" on public.admin_users for select to authenticated using (user_id = auth.uid());

-- Public media bucket. Only authenticated admin_users may upload/update/delete.
insert into storage.buckets (id,name,public) values ('store-media','store-media',true) on conflict (id) do update set public=true;
drop policy if exists "admins upload store media" on storage.objects;
create policy "admins upload store media" on storage.objects for insert to authenticated with check (bucket_id='store-media' and exists(select 1 from public.admin_users a where a.user_id=auth.uid()));
drop policy if exists "admins update store media" on storage.objects;
create policy "admins update store media" on storage.objects for update to authenticated using (bucket_id='store-media' and exists(select 1 from public.admin_users a where a.user_id=auth.uid()));
drop policy if exists "admins delete store media" on storage.objects;
create policy "admins delete store media" on storage.objects for delete to authenticated using (bucket_id='store-media' and exists(select 1 from public.admin_users a where a.user_id=auth.uid()));

-- Initial categories
insert into public.categories (id,"nameEn","nameAr",slug,image,"subtitleEn","subtitleAr",active,"sortOrder") values
('cat-lamb','Lamb','الخروف','lamb','https://images.unsplash.com/photo-1700478934617-75d2d4f01a04?auto=format&fit=crop&w=1200&q=84','Fresh cuts','قطع طازجة',true,1),
('cat-beef','Beef','البقري','beef','https://images.unsplash.com/photo-1690983322025-aab4f95a0269?auto=format&fit=crop&w=1200&q=84','Premium cuts','قطع ممتازة',true,2),
('cat-chicken','Chicken','الدجاج','chicken','/images/chicken.jpg','Daily fresh','طازج يومياً',true,3),
('cat-offal','Offal','الأحشاء','offal','/images/liver.jpg','Clean & fresh','نظيف وطازج',true,4),
('cat-bbq','BBQ','المشاوي','bbq','https://images.unsplash.com/photo-1702741168115-cd3d9a682972?auto=format&fit=crop&w=1500&q=84','Grill ready','جاهز للشواء',true,5),
('cat-packs','Packs','الباقات','packs','https://images.unsplash.com/photo-1750461326074-f3ee4a041fb2?auto=format&fit=crop&w=1500&q=84','Family value','قيمة عائلية',true,6)
on conflict (id) do update set "nameEn"=excluded."nameEn","nameAr"=excluded."nameAr",slug=excluded.slug,image=excluded.image,"subtitleEn"=excluded."subtitleEn","subtitleAr"=excluded."subtitleAr",active=excluded.active,"sortOrder"=excluded."sortOrder";

-- Initial 50-product catalogue
insert into public.products (id,en,ar,"descriptionEn","descriptionAr",sku,category,price,"oldPrice",unit,image,gallery,featured,active,badge,"stockQty","stockStatus","weightOptions","preparationOptions","sortOrder") values
('p1','Shamia Chicken Griller','دجاج الشامية','Fresh shamia chicken griller prepared for convenient family shopping in Kuwait.','دجاج الشامية طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-001','Chicken',1.25,1.4,'1 kg','/images/chicken.jpg','["/images/chicken.jpg"]'::jsonb,true,true,'Fresh',6,'low_stock','["500 g", "1 kg", "2 kg"]'::jsonb,'["Whole", "8 pieces", "Curry cut"]'::jsonb,1),
('p2','Fresh Lamb Liver','كبد خروف طازج','Fresh fresh lamb liver prepared for convenient family shopping in Kuwait.','كبد خروف طازج طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-002','Offal',1.75,1.95,'500 g','/images/liver.jpg','["/images/liver.jpg"]'::jsonb,true,true,'Fresh',25,'in_stock','["500 g", "1 kg"]'::jsonb,'["Cleaned", "Whole"]'::jsonb,2),
('p3','Lamb Feet','أرجل خروف','Fresh lamb feet prepared for convenient family shopping in Kuwait.','أرجل خروف طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-003','Offal',1.5,null,'pack','/images/feet.jpg','["/images/feet.jpg"]'::jsonb,true,true,'Fresh',25,'in_stock','["pack"]'::jsonb,'["Cleaned", "Whole"]'::jsonb,3),
('p4','Lamb Tongue','لسان خروف','Fresh lamb tongue prepared for convenient family shopping in Kuwait.','لسان خروف طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-004','Offal',1.75,null,'piece','/images/tongue.jpg','["/images/tongue.jpg"]'::jsonb,true,true,'Fresh',25,'in_stock','["piece"]'::jsonb,'["Cleaned", "Whole"]'::jsonb,4),
('p5','Lamb Kidney','كلاوي خروف','Fresh lamb kidney prepared for convenient family shopping in Kuwait.','كلاوي خروف طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-005','Offal',1.5,null,'500 g','/images/kidney.jpg','["/images/kidney.jpg"]'::jsonb,true,true,'Fresh',25,'in_stock','["500 g", "1 kg"]'::jsonb,'["Cleaned", "Whole"]'::jsonb,5),
('p6','Whole Lamb','خروف كامل','Fresh whole lamb prepared for convenient family shopping in Kuwait.','خروف كامل طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-006','Lamb',55.0,null,'whole','/images/whole-lamb.jpg','["/images/whole-lamb.jpg"]'::jsonb,true,true,'Fresh',25,'in_stock','["whole"]'::jsonb,'["No cutting", "Medium cut", "Small cut"]'::jsonb,6),
('p7','Beef Mince','لحم بقري مفروم','Fresh beef mince prepared for convenient family shopping in Kuwait.','لحم بقري مفروم طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-007','Beef',3.5,3.85,'1 kg','https://images.unsplash.com/photo-1690983330548-e34b52aa8cb2?auto=format&fit=crop&w=1200&q=84','["https://images.unsplash.com/photo-1690983330548-e34b52aa8cb2?auto=format&fit=crop&w=1200&q=84"]'::jsonb,true,true,'',25,'in_stock','["500 g", "1 kg", "2 kg"]'::jsonb,'["No cutting", "Medium cut", "Small cut"]'::jsonb,7),
('p8','Lamb Mince','لحم خروف مفروم','Fresh lamb mince prepared for convenient family shopping in Kuwait.','لحم خروف مفروم طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-008','Lamb',4.0,null,'1 kg','https://images.unsplash.com/photo-1700478934617-75d2d4f01a04?auto=format&fit=crop&w=1200&q=84','["https://images.unsplash.com/photo-1700478934617-75d2d4f01a04?auto=format&fit=crop&w=1200&q=84"]'::jsonb,true,true,'',25,'in_stock','["500 g", "1 kg", "2 kg"]'::jsonb,'["No cutting", "Medium cut", "Small cut"]'::jsonb,8),
('p9','Lamb Chops','ريش خروف','Fresh lamb chops prepared for convenient family shopping in Kuwait.','ريش خروف طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-009','Lamb',5.5,5.95,'1 kg','https://images.unsplash.com/photo-1700478934617-75d2d4f01a04?auto=format&fit=crop&w=1200&q=84','["https://images.unsplash.com/photo-1700478934617-75d2d4f01a04?auto=format&fit=crop&w=1200&q=84"]'::jsonb,true,true,'',25,'in_stock','["500 g", "1 kg", "2 kg"]'::jsonb,'["No cutting", "Medium cut", "Small cut"]'::jsonb,9),
('p10','Beef Steak','ستيك بقري','Fresh beef steak prepared for convenient family shopping in Kuwait.','ستيك بقري طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-010','Beef',5.25,5.75,'1 kg','https://images.unsplash.com/photo-1690983322025-aab4f95a0269?auto=format&fit=crop&w=1200&q=84','["https://images.unsplash.com/photo-1690983322025-aab4f95a0269?auto=format&fit=crop&w=1200&q=84"]'::jsonb,true,true,'',25,'in_stock','["500 g", "1 kg", "2 kg"]'::jsonb,'["No cutting", "Medium cut", "Small cut"]'::jsonb,10),
('p11','Chicken Breast','صدر دجاج','Fresh chicken breast prepared for convenient family shopping in Kuwait.','صدر دجاج طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-011','Chicken',2.0,null,'1 kg','https://images.unsplash.com/photo-1642497394469-188b0f4bcae6?auto=format&fit=crop&w=1200&q=84','["https://images.unsplash.com/photo-1642497394469-188b0f4bcae6?auto=format&fit=crop&w=1200&q=84"]'::jsonb,true,true,'Best seller',25,'in_stock','["500 g", "1 kg", "2 kg"]'::jsonb,'["Whole", "8 pieces", "Curry cut"]'::jsonb,11),
('p12','Chicken Legs','أفخاذ دجاج','Fresh chicken legs prepared for convenient family shopping in Kuwait.','أفخاذ دجاج طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-012','Chicken',1.5,null,'1 kg','https://images.unsplash.com/photo-1759493321741-883fbf9f433c?auto=format&fit=crop&w=1200&q=84','["https://images.unsplash.com/photo-1759493321741-883fbf9f433c?auto=format&fit=crop&w=1200&q=84"]'::jsonb,true,true,'',6,'in_stock','["500 g", "1 kg", "2 kg"]'::jsonb,'["Whole", "8 pieces", "Curry cut"]'::jsonb,12),
('p13','Lamb Shoulder','كتف خروف','Fresh lamb shoulder prepared for convenient family shopping in Kuwait.','كتف خروف طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-013','Lamb',4.5,null,'1 kg','https://images.unsplash.com/photo-1700478934617-75d2d4f01a04?auto=format&fit=crop&w=1200&q=84','["https://images.unsplash.com/photo-1700478934617-75d2d4f01a04?auto=format&fit=crop&w=1200&q=84"]'::jsonb,true,true,'',25,'in_stock','["500 g", "1 kg", "2 kg"]'::jsonb,'["No cutting", "Medium cut", "Small cut"]'::jsonb,13),
('p14','Lamb Leg','فخذ خروف','Fresh lamb leg prepared for convenient family shopping in Kuwait.','فخذ خروف طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-014','Lamb',4.75,null,'1 kg','/images/whole-lamb.jpg','["/images/whole-lamb.jpg"]'::jsonb,true,true,'Value',25,'in_stock','["500 g", "1 kg", "2 kg"]'::jsonb,'["No cutting", "Medium cut", "Small cut"]'::jsonb,14),
('p15','Beef Cubes','مكعبات لحم بقري','Fresh beef cubes prepared for convenient family shopping in Kuwait.','مكعبات لحم بقري طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-015','Beef',4.0,null,'1 kg','https://images.unsplash.com/photo-1690983330548-e34b52aa8cb2?auto=format&fit=crop&w=1200&q=84','["https://images.unsplash.com/photo-1690983330548-e34b52aa8cb2?auto=format&fit=crop&w=1200&q=84"]'::jsonb,true,true,'',25,'in_stock','["500 g", "1 kg", "2 kg"]'::jsonb,'["No cutting", "Medium cut", "Small cut"]'::jsonb,15),
('p16','Lamb Head','رأس خروف','Fresh lamb head prepared for convenient family shopping in Kuwait.','رأس خروف طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-016','Offal',2.5,null,'piece','/images/whole-lamb.jpg','["/images/whole-lamb.jpg"]'::jsonb,true,true,'',25,'in_stock','["piece"]'::jsonb,'["Cleaned", "Whole"]'::jsonb,16),
('p17','Lamb Heart','قلب خروف','Fresh lamb heart prepared for convenient family shopping in Kuwait.','قلب خروف طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-017','Offal',1.25,null,'piece','/images/kidney.jpg','["/images/kidney.jpg"]'::jsonb,false,true,'',25,'in_stock','["piece"]'::jsonb,'["Cleaned", "Whole"]'::jsonb,17),
('p18','Lamb Intestines','أمعاء خروف','Fresh lamb intestines prepared for convenient family shopping in Kuwait.','أمعاء خروف طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-018','Offal',1.5,null,'pack','/images/liver.jpg','["/images/liver.jpg"]'::jsonb,false,true,'',25,'low_stock','["pack"]'::jsonb,'["Cleaned", "Whole"]'::jsonb,18),
('p19','BBQ Lamb Mix','تشكيلة خروف للشواء','Fresh bbq lamb mix prepared for convenient family shopping in Kuwait.','تشكيلة خروف للشواء طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-019','BBQ',4.5,4.9,'1 kg','https://images.unsplash.com/photo-1702741168115-cd3d9a682972?auto=format&fit=crop&w=1500&q=84','["https://images.unsplash.com/photo-1702741168115-cd3d9a682972?auto=format&fit=crop&w=1500&q=84"]'::jsonb,false,true,'',25,'in_stock','["500 g", "1 kg", "2 kg"]'::jsonb,'["Ready to cook"]'::jsonb,19),
('p20','Family Meat Box','صندوق اللحوم العائلي','Fresh family meat box prepared for convenient family shopping in Kuwait.','صندوق اللحوم العائلي طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-020','Packs',15.9,17.5,'box','https://images.unsplash.com/photo-1750461326074-f3ee4a041fb2?auto=format&fit=crop&w=1500&q=84','["https://images.unsplash.com/photo-1750461326074-f3ee4a041fb2?auto=format&fit=crop&w=1500&q=84"]'::jsonb,false,true,'',25,'in_stock','["box"]'::jsonb,'["Ready to cook"]'::jsonb,20),
('p21','Beef Ribeye','ريب آي بقري','Fresh beef ribeye prepared for convenient family shopping in Kuwait.','ريب آي بقري طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-021','Beef',6.25,null,'1 kg','https://images.unsplash.com/photo-1690983322025-aab4f95a0269?auto=format&fit=crop&w=1200&q=84','["https://images.unsplash.com/photo-1690983322025-aab4f95a0269?auto=format&fit=crop&w=1200&q=84"]'::jsonb,false,true,'Best seller',25,'in_stock','["500 g", "1 kg", "2 kg"]'::jsonb,'["No cutting", "Medium cut", "Small cut"]'::jsonb,21),
('p22','Beef Tenderloin','فيليه بقري','Fresh beef tenderloin prepared for convenient family shopping in Kuwait.','فيليه بقري طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-022','Beef',7.25,null,'1 kg','https://images.unsplash.com/photo-1690983330548-e34b52aa8cb2?auto=format&fit=crop&w=1200&q=84','["https://images.unsplash.com/photo-1690983330548-e34b52aa8cb2?auto=format&fit=crop&w=1200&q=84"]'::jsonb,false,true,'',25,'in_stock','["500 g", "1 kg", "2 kg"]'::jsonb,'["No cutting", "Medium cut", "Small cut"]'::jsonb,22),
('p23','Beef Brisket','صدر بقري','Fresh beef brisket prepared for convenient family shopping in Kuwait.','صدر بقري طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-023','Beef',4.2,null,'1 kg','https://images.unsplash.com/photo-1602473806870-523705019351?auto=format&fit=crop&w=1500&q=84','["https://images.unsplash.com/photo-1602473806870-523705019351?auto=format&fit=crop&w=1500&q=84"]'::jsonb,false,true,'',6,'in_stock','["500 g", "1 kg", "2 kg"]'::jsonb,'["No cutting", "Medium cut", "Small cut"]'::jsonb,23),
('p24','Beef Shank','موزات بقري','Fresh beef shank prepared for convenient family shopping in Kuwait.','موزات بقري طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-024','Beef',3.75,null,'1 kg','https://images.unsplash.com/photo-1690983330548-e34b52aa8cb2?auto=format&fit=crop&w=1200&q=84','["https://images.unsplash.com/photo-1690983330548-e34b52aa8cb2?auto=format&fit=crop&w=1200&q=84"]'::jsonb,false,true,'',25,'in_stock','["500 g", "1 kg", "2 kg"]'::jsonb,'["No cutting", "Medium cut", "Small cut"]'::jsonb,24),
('p25','Beef Ribs','ضلوع بقري','Fresh beef ribs prepared for convenient family shopping in Kuwait.','ضلوع بقري طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-025','BBQ',4.75,5.2,'1 kg','https://images.unsplash.com/photo-1777962822456-62a3fde3c39e?auto=format&fit=crop&w=1200&q=84','["https://images.unsplash.com/photo-1777962822456-62a3fde3c39e?auto=format&fit=crop&w=1200&q=84"]'::jsonb,false,true,'',25,'in_stock','["500 g", "1 kg", "2 kg"]'::jsonb,'["Ready to cook"]'::jsonb,25),
('p26','Beef Liver','كبد بقري','Fresh beef liver prepared for convenient family shopping in Kuwait.','كبد بقري طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-026','Offal',1.95,null,'500 g','/images/liver.jpg','["/images/liver.jpg"]'::jsonb,false,true,'',25,'in_stock','["500 g", "1 kg"]'::jsonb,'["Cleaned", "Whole"]'::jsonb,26),
('p27','Beef Heart','قلب بقري','Fresh beef heart prepared for convenient family shopping in Kuwait.','قلب بقري طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-027','Offal',1.4,null,'500 g','/images/kidney.jpg','["/images/kidney.jpg"]'::jsonb,false,true,'Value',25,'in_stock','["500 g", "1 kg"]'::jsonb,'["Cleaned", "Whole"]'::jsonb,27),
('p28','Lamb Neck','رقبة خروف','Fresh lamb neck prepared for convenient family shopping in Kuwait.','رقبة خروف طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-028','Lamb',3.9,null,'1 kg','https://images.unsplash.com/photo-1700478934617-75d2d4f01a04?auto=format&fit=crop&w=1200&q=84','["https://images.unsplash.com/photo-1700478934617-75d2d4f01a04?auto=format&fit=crop&w=1200&q=84"]'::jsonb,false,true,'',25,'in_stock','["500 g", "1 kg", "2 kg"]'::jsonb,'["No cutting", "Medium cut", "Small cut"]'::jsonb,28),
('p29','Lamb Ribs','ضلوع خروف','Fresh lamb ribs prepared for convenient family shopping in Kuwait.','ضلوع خروف طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-029','Lamb',4.85,null,'1 kg','https://images.unsplash.com/photo-1700478934617-75d2d4f01a04?auto=format&fit=crop&w=1200&q=84','["https://images.unsplash.com/photo-1700478934617-75d2d4f01a04?auto=format&fit=crop&w=1200&q=84"]'::jsonb,false,true,'',25,'in_stock','["500 g", "1 kg", "2 kg"]'::jsonb,'["No cutting", "Medium cut", "Small cut"]'::jsonb,29),
('p30','Lamb Shank','موزات خروف','Fresh lamb shank prepared for convenient family shopping in Kuwait.','موزات خروف طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-030','Lamb',4.75,null,'1 kg','https://images.unsplash.com/photo-1700478934617-75d2d4f01a04?auto=format&fit=crop&w=1200&q=84','["https://images.unsplash.com/photo-1700478934617-75d2d4f01a04?auto=format&fit=crop&w=1200&q=84"]'::jsonb,false,true,'',25,'in_stock','["500 g", "1 kg", "2 kg"]'::jsonb,'["No cutting", "Medium cut", "Small cut"]'::jsonb,30),
('p31','Lamb Boneless','لحم خروف بدون عظم','Fresh lamb boneless prepared for convenient family shopping in Kuwait.','لحم خروف بدون عظم طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-031','Lamb',5.5,null,'1 kg','https://images.unsplash.com/photo-1700478934617-75d2d4f01a04?auto=format&fit=crop&w=1200&q=84','["https://images.unsplash.com/photo-1700478934617-75d2d4f01a04?auto=format&fit=crop&w=1200&q=84"]'::jsonb,false,true,'Best seller',25,'in_stock','["500 g", "1 kg", "2 kg"]'::jsonb,'["No cutting", "Medium cut", "Small cut"]'::jsonb,31),
('p32','Lamb Curry Cut','لحم خروف للمرق','Fresh lamb curry cut prepared for convenient family shopping in Kuwait.','لحم خروف للمرق طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-032','Lamb',4.2,null,'1 kg','https://images.unsplash.com/photo-1700478934617-75d2d4f01a04?auto=format&fit=crop&w=1200&q=84','["https://images.unsplash.com/photo-1700478934617-75d2d4f01a04?auto=format&fit=crop&w=1200&q=84"]'::jsonb,false,true,'',25,'in_stock','["500 g", "1 kg", "2 kg"]'::jsonb,'["No cutting", "Medium cut", "Small cut"]'::jsonb,32),
('p33','Lamb Kofta','كفتة خروف','Fresh lamb kofta prepared for convenient family shopping in Kuwait.','كفتة خروف طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-033','BBQ',3.75,null,'1 kg','https://images.unsplash.com/photo-1702741168115-cd3d9a682972?auto=format&fit=crop&w=1500&q=84','["https://images.unsplash.com/photo-1702741168115-cd3d9a682972?auto=format&fit=crop&w=1500&q=84"]'::jsonb,false,true,'',25,'in_stock','["500 g", "1 kg", "2 kg"]'::jsonb,'["Ready to cook"]'::jsonb,33),
('p34','Beef Kofta','كفتة بقري','Fresh beef kofta prepared for convenient family shopping in Kuwait.','كفتة بقري طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-034','BBQ',3.25,null,'1 kg','https://images.unsplash.com/photo-1702741168115-cd3d9a682972?auto=format&fit=crop&w=1500&q=84','["https://images.unsplash.com/photo-1702741168115-cd3d9a682972?auto=format&fit=crop&w=1500&q=84"]'::jsonb,false,true,'',6,'in_stock','["500 g", "1 kg", "2 kg"]'::jsonb,'["Ready to cook"]'::jsonb,34),
('p35','Beef Burger Patties','برجر بقري','Fresh beef burger patties prepared for convenient family shopping in Kuwait.','برجر بقري طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-035','BBQ',3.5,null,'pack','https://images.unsplash.com/photo-1690983330548-e34b52aa8cb2?auto=format&fit=crop&w=1200&q=84','["https://images.unsplash.com/photo-1690983330548-e34b52aa8cb2?auto=format&fit=crop&w=1200&q=84"]'::jsonb,false,true,'',25,'low_stock','["pack"]'::jsonb,'["Ready to cook"]'::jsonb,35),
('p36','Chicken Wings','أجنحة دجاج','Fresh chicken wings prepared for convenient family shopping in Kuwait.','أجنحة دجاج طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-036','Chicken',1.85,null,'1 kg','https://images.unsplash.com/photo-1759493321741-883fbf9f433c?auto=format&fit=crop&w=1200&q=84','["https://images.unsplash.com/photo-1759493321741-883fbf9f433c?auto=format&fit=crop&w=1200&q=84"]'::jsonb,false,true,'',25,'in_stock','["500 g", "1 kg", "2 kg"]'::jsonb,'["Whole", "8 pieces", "Curry cut"]'::jsonb,36),
('p37','Chicken Drumsticks','دبوس دجاج','Fresh chicken drumsticks prepared for convenient family shopping in Kuwait.','دبوس دجاج طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-037','Chicken',1.65,null,'1 kg','https://images.unsplash.com/photo-1759493321741-883fbf9f433c?auto=format&fit=crop&w=1200&q=84','["https://images.unsplash.com/photo-1759493321741-883fbf9f433c?auto=format&fit=crop&w=1200&q=84"]'::jsonb,false,true,'',25,'in_stock','["500 g", "1 kg", "2 kg"]'::jsonb,'["Whole", "8 pieces", "Curry cut"]'::jsonb,37),
('p38','Whole Fresh Chicken','دجاج طازج كامل','Fresh whole fresh chicken prepared for convenient family shopping in Kuwait.','دجاج طازج كامل طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-038','Chicken',1.95,null,'1 kg','https://images.unsplash.com/photo-1672787153652-b3b9d92f3e8c?auto=format&fit=crop&w=1200&q=84','["https://images.unsplash.com/photo-1672787153652-b3b9d92f3e8c?auto=format&fit=crop&w=1200&q=84"]'::jsonb,false,true,'',25,'in_stock','["500 g", "1 kg", "2 kg"]'::jsonb,'["Whole", "8 pieces", "Curry cut"]'::jsonb,38),
('p39','Chicken Mince','دجاج مفروم','Fresh chicken mince prepared for convenient family shopping in Kuwait.','دجاج مفروم طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-039','Chicken',2.25,null,'1 kg','https://images.unsplash.com/photo-1633096013004-e2cb4023b560?auto=format&fit=crop&w=1200&q=84','["https://images.unsplash.com/photo-1633096013004-e2cb4023b560?auto=format&fit=crop&w=1200&q=84"]'::jsonb,false,true,'',25,'in_stock','["500 g", "1 kg", "2 kg"]'::jsonb,'["Whole", "8 pieces", "Curry cut"]'::jsonb,39),
('p40','Chicken Liver','كبد دجاج','Fresh chicken liver prepared for convenient family shopping in Kuwait.','كبد دجاج طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-040','Offal',1.1,null,'500 g','/images/liver.jpg','["/images/liver.jpg"]'::jsonb,false,true,'Value',25,'in_stock','["500 g", "1 kg"]'::jsonb,'["Cleaned", "Whole"]'::jsonb,40),
('p41','Chicken Gizzards','قوانص دجاج','Fresh chicken gizzards prepared for convenient family shopping in Kuwait.','قوانص دجاج طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-041','Offal',1.15,null,'500 g','/images/kidney.jpg','["/images/kidney.jpg"]'::jsonb,false,true,'Best seller',25,'in_stock','["500 g", "1 kg"]'::jsonb,'["Cleaned", "Whole"]'::jsonb,41),
('p42','Chicken Thigh Fillet','فيليه أفخاذ دجاج','Fresh chicken thigh fillet prepared for convenient family shopping in Kuwait.','فيليه أفخاذ دجاج طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-042','Chicken',2.65,null,'1 kg','https://images.unsplash.com/photo-1642497394469-188b0f4bcae6?auto=format&fit=crop&w=1200&q=84','["https://images.unsplash.com/photo-1642497394469-188b0f4bcae6?auto=format&fit=crop&w=1200&q=84"]'::jsonb,false,true,'',25,'in_stock','["500 g", "1 kg", "2 kg"]'::jsonb,'["Whole", "8 pieces", "Curry cut"]'::jsonb,42),
('p43','BBQ Chicken Skewers','أسياخ دجاج للشواء','Fresh bbq chicken skewers prepared for convenient family shopping in Kuwait.','أسياخ دجاج للشواء طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-043','BBQ',3.5,null,'pack','https://images.unsplash.com/photo-1702741168115-cd3d9a682972?auto=format&fit=crop&w=1500&q=84','["https://images.unsplash.com/photo-1702741168115-cd3d9a682972?auto=format&fit=crop&w=1500&q=84"]'::jsonb,false,true,'',25,'in_stock','["pack"]'::jsonb,'["Ready to cook"]'::jsonb,43),
('p44','Marinated Chicken','دجاج متبل','Fresh marinated chicken prepared for convenient family shopping in Kuwait.','دجاج متبل طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-044','BBQ',2.9,null,'1 kg','https://images.unsplash.com/photo-1633096013004-e2cb4023b560?auto=format&fit=crop&w=1200&q=84','["https://images.unsplash.com/photo-1633096013004-e2cb4023b560?auto=format&fit=crop&w=1200&q=84"]'::jsonb,false,true,'',25,'in_stock','["500 g", "1 kg", "2 kg"]'::jsonb,'["Ready to cook"]'::jsonb,44),
('p45','Mixed Grill Box','بوكس مشاوي مشكل','Fresh mixed grill box prepared for convenient family shopping in Kuwait.','بوكس مشاوي مشكل طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-045','Packs',12.9,13.9,'box','https://images.unsplash.com/photo-1750461326074-f3ee4a041fb2?auto=format&fit=crop&w=1500&q=84','["https://images.unsplash.com/photo-1750461326074-f3ee4a041fb2?auto=format&fit=crop&w=1500&q=84"]'::jsonb,false,true,'',6,'in_stock','["box"]'::jsonb,'["Ready to cook"]'::jsonb,45),
('p46','Weekly Family Box','بوكس العائلة الأسبوعي','Fresh weekly family box prepared for convenient family shopping in Kuwait.','بوكس العائلة الأسبوعي طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-046','Packs',24.9,27.0,'box','https://images.unsplash.com/photo-1602473806870-523705019351?auto=format&fit=crop&w=1500&q=84','["https://images.unsplash.com/photo-1602473806870-523705019351?auto=format&fit=crop&w=1500&q=84"]'::jsonb,false,true,'',25,'in_stock','["box"]'::jsonb,'["Ready to cook"]'::jsonb,46),
('p47','Lamb BBQ Box','بوكس مشاوي خروف','Fresh lamb bbq box prepared for convenient family shopping in Kuwait.','بوكس مشاوي خروف طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-047','Packs',18.9,null,'box','https://images.unsplash.com/photo-1702741168115-cd3d9a682972?auto=format&fit=crop&w=1500&q=84','["https://images.unsplash.com/photo-1702741168115-cd3d9a682972?auto=format&fit=crop&w=1500&q=84"]'::jsonb,false,true,'',25,'in_stock','["box"]'::jsonb,'["Ready to cook"]'::jsonb,47),
('p48','Beef BBQ Box','بوكس مشاوي بقري','Fresh beef bbq box prepared for convenient family shopping in Kuwait.','بوكس مشاوي بقري طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-048','Packs',17.9,null,'box','https://images.unsplash.com/photo-1750461326074-f3ee4a041fb2?auto=format&fit=crop&w=1500&q=84','["https://images.unsplash.com/photo-1750461326074-f3ee4a041fb2?auto=format&fit=crop&w=1500&q=84"]'::jsonb,false,true,'',25,'in_stock','["box"]'::jsonb,'["Ready to cook"]'::jsonb,48),
('p49','Soup Bones','عظام للشوربة','Fresh soup bones prepared for convenient family shopping in Kuwait.','عظام للشوربة طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-049','Lamb',1.1,null,'1 kg','/images/whole-lamb.jpg','["/images/whole-lamb.jpg"]'::jsonb,false,true,'',25,'in_stock','["500 g", "1 kg", "2 kg"]'::jsonb,'["No cutting", "Medium cut", "Small cut"]'::jsonb,49),
('p50','Mixed Offal Pack','تشكيلة أحشاء','Fresh mixed offal pack prepared for convenient family shopping in Kuwait.','تشكيلة أحشاء طازج ومجهز بعناية لطلبات العائلة في الكويت.','AK-050','Offal',4.5,null,'pack','/images/liver.jpg','["/images/liver.jpg"]'::jsonb,false,true,'',25,'in_stock','["pack"]'::jsonb,'["Cleaned", "Whole"]'::jsonb,50)
on conflict (id) do update set en=excluded.en,ar=excluded.ar,"descriptionEn"=excluded."descriptionEn","descriptionAr"=excluded."descriptionAr",sku=excluded.sku,category=excluded.category,price=excluded.price,"oldPrice"=excluded."oldPrice",unit=excluded.unit,image=excluded.image,gallery=excluded.gallery,featured=excluded.featured,active=excluded.active,badge=excluded.badge,"stockQty"=excluded."stockQty","stockStatus"=excluded."stockStatus","weightOptions"=excluded."weightOptions","preparationOptions"=excluded."preparationOptions","sortOrder"=excluded."sortOrder";


-- Initial hero promotion slides
insert into public.banners (id,en,ar,"subEn","subAr",image,tag,"ctaEn","ctaAr",price,"oldPrice",offer,category,"productEn","productAr",theme,active,"sortOrder") values
('b1','Shamia Chicken Griller 1kg','عرض دجاج الشامية 1 كجم','A family favourite at a special price. Halal, convenient and ready for your next meal.','عرض حلو للعائلة — دجاج حلال وسهل التحضير، جاهز لوجبتكم اليوم.','/images/chicken.jpg','LIMITED OFFER','Shop chicken','اطلب الحين','1.250 KD','1.400 KD','SAVE 11%','Chicken','Shamia Chicken Griller','دجاج الشامية','sunny',true,1),
('b2','Fresh Lamb Liver 500g','كبد خروف طازج 500 جم','Freshly prepared lamb liver with a launch offer made for quick weekly shopping.','كبد خروف طازج ومجهز بعناية — خذه اليوم بسعر العرض.','/images/liver.jpg','FRESH PRICE','Shop the offer','شوف العرض','1.750 KD','1.950 KD','SAVE 10%','Offal','Fresh Lamb Liver','كبد خروف طازج','mint',true,2),
('b3','Family Meat Box','عرض صندوق اللحوم العائلي','A generous mix for family meals and weekend gatherings — more value in one box.','بوكس مرتب للعائلة والويكند — تشكيلة أكثر وقيمة أوفر في طلب واحد.','https://images.unsplash.com/photo-1750461326074-f3ee4a041fb2?auto=format&fit=crop&w=1500&q=84','FAMILY DEAL','View family deal','شوف البوكس','15.900 KD','17.500 KD','SAVE 1.600 KD','Packs','Family Meat Box','صندوق اللحوم العائلي','peach',true,3)
on conflict (id) do update set en=excluded.en,ar=excluded.ar,"subEn"=excluded."subEn","subAr"=excluded."subAr",image=excluded.image,tag=excluded.tag,"ctaEn"=excluded."ctaEn","ctaAr"=excluded."ctaAr",price=excluded.price,"oldPrice"=excluded."oldPrice",offer=excluded.offer,category=excluded.category,"productEn"=excluded."productEn","productAr"=excluded."productAr",theme=excluded.theme,active=excluded.active,"sortOrder"=excluded."sortOrder";

-- Initial scrolling ticker
insert into public.ticker_items (id,"labelEn","labelAr","textEn","textAr",active,"sortOrder","productId") values
('t1','FRESH TODAY','وصل اليوم','Fresh Lamb Liver 500g · 1.750 KD','كبد خروف طازج 500 جم · 1.750 د.ك',true,1,'p2'),
('t2','SPECIAL','عرض اليوم','Shamia Chicken Griller 1kg · 1.250 KD','دجاج الشامية 1 كجم · 1.250 د.ك',true,2,'p1'),
('t3','FAMILY DEAL','وفر أكثر','Family Meat Box · 15.900 KD','صندوق اللحوم العائلي · 15.900 د.ك',true,3,'p20')
on conflict (id) do update set "labelEn"=excluded."labelEn","labelAr"=excluded."labelAr","textEn"=excluded."textEn","textAr"=excluded."textAr",active=excluded.active,"sortOrder"=excluded."sortOrder","productId"=excluded."productId";

-- Company details from official letterhead + WhatsApp ordering number
insert into public.store_settings (id,"companyNameEn","companyNameAr",whatsapp,phone1,phone2,"addressEn","addressAr",currency,"deliveryNoteEn","deliveryNoteAr") values
('store','Al Kharoof Butchery Co.','شركة ملحمة الخروف','+96555816212','+96550982666','+96551196116','West Abu Fateera Building No. 119 - Shop No.5','مبارك الكبير غرب ابو فطيرة الحرفيه - القسيمة 119 - محل رقم 5','KWD','Delivery charges, if applicable, are confirmed on WhatsApp.','يتم تأكيد رسوم التوصيل عبر واتساب.')
on conflict (id) do update set "companyNameEn"=excluded."companyNameEn","companyNameAr"=excluded."companyNameAr",whatsapp=excluded.whatsapp,phone1=excluded.phone1,phone2=excluded.phone2,"addressEn"=excluded."addressEn","addressAr"=excluded."addressAr",currency=excluded.currency,"deliveryNoteEn"=excluded."deliveryNoteEn","deliveryNoteAr"=excluded."deliveryNoteAr";

-- AFTER creating the admin account in Authentication > Users, run ONE line like:
-- insert into public.admin_users (user_id) values ('PASTE-AUTH-USER-UUID-HERE') on conflict do nothing;
