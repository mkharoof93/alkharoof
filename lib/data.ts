export type Product = {
  id: string;
  en: string;
  ar: string;
  category: string;
  price: number;
  unit: string;
  image: string;
  featured?: boolean;
  oldPrice?: number;
  active?: boolean;
  badge?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  sku?: string;
  stockQty?: number;
  stockStatus?: 'in_stock'|'low_stock'|'out_of_stock';
  gallery?: string[];
  weightOptions?: string[];
  preparationOptions?: string[];
  sortOrder?: number;
};

const unsplash = (id:string, w=1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=84`;

export const imageLibrary = {
  lamb: unsplash('photo-1700478934617-75d2d4f01a04'),
  beefSteak: unsplash('photo-1690983322025-aab4f95a0269'),
  beefTop: unsplash('photo-1690983330548-e34b52aa8cb2'),
  butcher: unsplash('photo-1602473806870-523705019351', 1500),
  beefRibs: unsplash('photo-1777962822456-62a3fde3c39e'),
  chickenWhole: unsplash('photo-1672787153652-b3b9d92f3e8c'),
  chickenBreast: unsplash('photo-1642497394469-188b0f4bcae6'),
  chickenAlt: unsplash('photo-1633096013004-e2cb4023b560'),
  chickenPieces: unsplash('photo-1759493321741-883fbf9f433c'),
  bbq: unsplash('photo-1750461326074-f3ee4a041fb2', 1500),
  skewers: unsplash('photo-1702741168115-cd3d9a682972', 1500),
};

export const categoryCards = [
  {key:'Lamb', ar:'الخروف', image:imageLibrary.lamb, kicker:'Fresh cuts'},
  {key:'Beef', ar:'البقري', image:imageLibrary.beefSteak, kicker:'Premium cuts'},
  {key:'Chicken', ar:'الدجاج', image:'/images/chicken.jpg', kicker:'Daily fresh'},
  {key:'Offal', ar:'الأحشاء', image:'/images/liver.jpg', kicker:'Clean & fresh'},
  {key:'BBQ', ar:'المشاوي', image:imageLibrary.skewers, kicker:'Grill ready'},
  {key:'Packs', ar:'الباقات', image:imageLibrary.bbq, kicker:'Family value'},
];

type Seed = [string,string,string,number,string,string?,number?];
const seeds:Seed[] = [
  ['Shamia Chicken Griller','دجاج الشامية','Chicken',1.250,'1 kg','/images/chicken.jpg',1.400],
  ['Fresh Lamb Liver','كبد خروف طازج','Offal',1.750,'500 g','/images/liver.jpg',1.950],
  ['Lamb Feet','أرجل خروف','Offal',1.500,'pack','/images/feet.jpg'],
  ['Lamb Tongue','لسان خروف','Offal',1.750,'piece','/images/tongue.jpg'],
  ['Lamb Kidney','كلاوي خروف','Offal',1.500,'500 g','/images/kidney.jpg'],
  ['Whole Lamb','خروف كامل','Lamb',55.000,'whole','/images/whole-lamb.jpg'],
  ['Beef Mince','لحم بقري مفروم','Beef',3.500,'1 kg',imageLibrary.beefTop,3.850],
  ['Lamb Mince','لحم خروف مفروم','Lamb',4.000,'1 kg',imageLibrary.lamb],
  ['Lamb Chops','ريش خروف','Lamb',5.500,'1 kg',imageLibrary.lamb,5.950],
  ['Beef Steak','ستيك بقري','Beef',5.250,'1 kg',imageLibrary.beefSteak,5.750],
  ['Chicken Breast','صدر دجاج','Chicken',2.000,'1 kg',imageLibrary.chickenBreast],
  ['Chicken Legs','أفخاذ دجاج','Chicken',1.500,'1 kg',imageLibrary.chickenPieces],
  ['Lamb Shoulder','كتف خروف','Lamb',4.500,'1 kg',imageLibrary.lamb],
  ['Lamb Leg','فخذ خروف','Lamb',4.750,'1 kg','/images/whole-lamb.jpg'],
  ['Beef Cubes','مكعبات لحم بقري','Beef',4.000,'1 kg',imageLibrary.beefTop],
  ['Lamb Head','رأس خروف','Offal',2.500,'piece','/images/whole-lamb.jpg'],
  ['Lamb Heart','قلب خروف','Offal',1.250,'piece','/images/kidney.jpg'],
  ['Lamb Intestines','أمعاء خروف','Offal',1.500,'pack','/images/liver.jpg'],
  ['BBQ Lamb Mix','تشكيلة خروف للشواء','BBQ',4.500,'1 kg',imageLibrary.skewers,4.900],
  ['Family Meat Box','صندوق اللحوم العائلي','Packs',15.900,'box',imageLibrary.bbq,17.500],
  ['Beef Ribeye','ريب آي بقري','Beef',6.250,'1 kg',imageLibrary.beefSteak],
  ['Beef Tenderloin','فيليه بقري','Beef',7.250,'1 kg',imageLibrary.beefTop],
  ['Beef Brisket','صدر بقري','Beef',4.200,'1 kg',imageLibrary.butcher],
  ['Beef Shank','موزات بقري','Beef',3.750,'1 kg',imageLibrary.beefTop],
  ['Beef Ribs','ضلوع بقري','BBQ',4.750,'1 kg',imageLibrary.beefRibs,5.200],
  ['Beef Liver','كبد بقري','Offal',1.950,'500 g','/images/liver.jpg'],
  ['Beef Heart','قلب بقري','Offal',1.400,'500 g','/images/kidney.jpg'],
  ['Lamb Neck','رقبة خروف','Lamb',3.900,'1 kg',imageLibrary.lamb],
  ['Lamb Ribs','ضلوع خروف','Lamb',4.850,'1 kg',imageLibrary.lamb],
  ['Lamb Shank','موزات خروف','Lamb',4.750,'1 kg',imageLibrary.lamb],
  ['Lamb Boneless','لحم خروف بدون عظم','Lamb',5.500,'1 kg',imageLibrary.lamb],
  ['Lamb Curry Cut','لحم خروف للمرق','Lamb',4.200,'1 kg',imageLibrary.lamb],
  ['Lamb Kofta','كفتة خروف','BBQ',3.750,'1 kg',imageLibrary.skewers],
  ['Beef Kofta','كفتة بقري','BBQ',3.250,'1 kg',imageLibrary.skewers],
  ['Beef Burger Patties','برجر بقري','BBQ',3.500,'pack',imageLibrary.beefTop],
  ['Chicken Wings','أجنحة دجاج','Chicken',1.850,'1 kg',imageLibrary.chickenPieces],
  ['Chicken Drumsticks','دبوس دجاج','Chicken',1.650,'1 kg',imageLibrary.chickenPieces],
  ['Whole Fresh Chicken','دجاج طازج كامل','Chicken',1.950,'1 kg',imageLibrary.chickenWhole],
  ['Chicken Mince','دجاج مفروم','Chicken',2.250,'1 kg',imageLibrary.chickenAlt],
  ['Chicken Liver','كبد دجاج','Offal',1.100,'500 g','/images/liver.jpg'],
  ['Chicken Gizzards','قوانص دجاج','Offal',1.150,'500 g','/images/kidney.jpg'],
  ['Chicken Thigh Fillet','فيليه أفخاذ دجاج','Chicken',2.650,'1 kg',imageLibrary.chickenBreast],
  ['BBQ Chicken Skewers','أسياخ دجاج للشواء','BBQ',3.500,'pack',imageLibrary.skewers],
  ['Marinated Chicken','دجاج متبل','BBQ',2.900,'1 kg',imageLibrary.chickenAlt],
  ['Mixed Grill Box','بوكس مشاوي مشكل','Packs',12.900,'box',imageLibrary.bbq,13.900],
  ['Weekly Family Box','بوكس العائلة الأسبوعي','Packs',24.900,'box',imageLibrary.butcher,27.000],
  ['Lamb BBQ Box','بوكس مشاوي خروف','Packs',18.900,'box',imageLibrary.skewers],
  ['Beef BBQ Box','بوكس مشاوي بقري','Packs',17.900,'box',imageLibrary.bbq],
  ['Soup Bones','عظام للشوربة','Lamb',1.100,'1 kg','/images/whole-lamb.jpg'],
  ['Mixed Offal Pack','تشكيلة أحشاء','Offal',4.500,'pack','/images/liver.jpg'],
];

export const seedProducts:Product[] = seeds.map((s,i)=>({
  id:`p${i+1}`, en:s[0], ar:s[1], category:s[2], price:s[3], unit:s[4], image:s[5]!, oldPrice:s[6],
  featured:i<16, active:true,
  badge:i<6?'Fresh':i%10===0?'Best seller':i%13===0?'Value':undefined,
  descriptionEn:`Fresh ${s[0].toLowerCase()} prepared for convenient family shopping in Kuwait.`,
  descriptionAr:`${s[1]} طازج ومجهز بعناية لطلبات العائلة في الكويت.`,
  sku:`AK-${String(i+1).padStart(3,'0')}`,
  stockQty:i%11===0?6:25,
  stockStatus:i%17===0?'low_stock':'in_stock',
  gallery:[s[5]!],
  weightOptions:s[4]==='1 kg'?['500 g','1 kg','2 kg']:s[4]==='500 g'?['500 g','1 kg']:[s[4]],
  preparationOptions:s[2]==='Chicken'?['Whole','8 pieces','Curry cut']:(s[2]==='Lamb'||s[2]==='Beef')?['No cutting','Medium cut','Small cut']:s[2]==='Offal'?['Cleaned','Whole']:['Ready to cook'],
  sortOrder:i+1,
}));

export type Banner = {
  id:string; en:string; ar:string; subEn:string; subAr:string; image:string; tag:string;
  ctaEn?:string; ctaAr?:string; price?:string; oldPrice?:string; offer?:string;
  category?:string; productEn?:string; productAr?:string; theme?:'sunny'|'mint'|'peach';
  active?:boolean; sortOrder?:number;
};
export const seedBanners:Banner[] = [
  {
    id:'b1',
    en:'Shamia Chicken Griller 1kg',
    ar:'عرض دجاج الشامية 1 كجم',
    subEn:'A family favourite at a special price. Halal, convenient and ready for your next meal.',
    subAr:'عرض حلو للعائلة — دجاج حلال وسهل التحضير، جاهز لوجبتكم اليوم.',
    image:'/images/chicken.jpg', tag:'LIMITED OFFER', ctaEn:'Shop chicken', ctaAr:'اطلب الحين',
    price:'1.250 KD', oldPrice:'1.400 KD', offer:'SAVE 11%', category:'Chicken',
    productEn:'Shamia Chicken Griller', productAr:'دجاج الشامية', theme:'sunny'
  },
  {
    id:'b2',
    en:'Fresh Lamb Liver 500g',
    ar:'كبد خروف طازج 500 جم',
    subEn:'Freshly prepared lamb liver with a launch offer made for quick weekly shopping.',
    subAr:'كبد خروف طازج ومجهز بعناية — خذه اليوم بسعر العرض.',
    image:'/images/liver.jpg', tag:'FRESH PRICE', ctaEn:'Shop the offer', ctaAr:'شوف العرض',
    price:'1.750 KD', oldPrice:'1.950 KD', offer:'SAVE 10%', category:'Offal',
    productEn:'Fresh Lamb Liver', productAr:'كبد خروف طازج', theme:'mint'
  },
  {
    id:'b3',
    en:'Family Meat Box',
    ar:'عرض صندوق اللحوم العائلي',
    subEn:'A generous mix for family meals and weekend gatherings — more value in one box.',
    subAr:'بوكس مرتب للعائلة والويكند — تشكيلة أكثر وقيمة أوفر في طلب واحد.',
    image:imageLibrary.bbq, tag:'FAMILY DEAL', ctaEn:'View family deal', ctaAr:'شوف البوكس',
    price:'15.900 KD', oldPrice:'17.500 KD', offer:'SAVE 1.600 KD', category:'Packs',
    productEn:'Family Meat Box', productAr:'صندوق اللحوم العائلي', theme:'peach'
  },
];


export type Category = {
  id:string; nameEn:string; nameAr:string; slug:string; image:string; subtitleEn:string; subtitleAr:string;
  active:boolean; sortOrder:number;
};
export const seedCategories:Category[] = categoryCards.map((c,i)=>({
  id:`cat-${c.key.toLowerCase()}`,nameEn:c.key,nameAr:c.ar,slug:c.key.toLowerCase(),image:c.image,
  subtitleEn:c.kicker,subtitleAr:({Lamb:'قطع طازجة',Beef:'قطع ممتازة',Chicken:'طازج يومياً',Offal:'نظيف وطازج',BBQ:'جاهز للشواء',Packs:'قيمة عائلية'} as Record<string,string>)[c.key]||'',
  active:true,sortOrder:i+1
}));

export type TickerItem = {id:string; labelEn:string; labelAr:string; textEn:string; textAr:string; active:boolean; sortOrder:number; productId?:string};
export const seedTickerItems:TickerItem[] = [
  {id:'t1',labelEn:'FRESH TODAY',labelAr:'وصل اليوم',textEn:'Fresh Lamb Liver 500g · 1.750 KD',textAr:'كبد خروف طازج 500 جم · 1.750 د.ك',active:true,sortOrder:1,productId:'p2'},
  {id:'t2',labelEn:'SPECIAL',labelAr:'عرض اليوم',textEn:'Shamia Chicken Griller 1kg · 1.250 KD',textAr:'دجاج الشامية 1 كجم · 1.250 د.ك',active:true,sortOrder:2,productId:'p1'},
  {id:'t3',labelEn:'FAMILY DEAL',labelAr:'وفر أكثر',textEn:'Family Meat Box · 15.900 KD',textAr:'صندوق اللحوم العائلي · 15.900 د.ك',active:true,sortOrder:3,productId:'p20'}
];

export type StoreSettings = {
  companyNameEn:string; companyNameAr:string; whatsapp:string; phone1:string; phone2:string;
  addressEn:string; addressAr:string; currency:string; deliveryNoteEn:string; deliveryNoteAr:string;
};
export const seedSettings:StoreSettings = {
  companyNameEn:'Al Kharoof Butchery Co.',companyNameAr:'شركة ملحمة الخروف',whatsapp:'+96555816212',
  phone1:'+96550982666',phone2:'+96551196116',
  addressEn:'West Abu Fateera Building No. 119 - Shop No.5',
  addressAr:'مبارك الكبير غرب ابو فطيرة الحرفيه - القسيمة 119 - محل رقم 5',
  currency:'KWD',deliveryNoteEn:'Delivery charges, if applicable, are confirmed on WhatsApp.',deliveryNoteAr:'يتم تأكيد رسوم التوصيل عبر واتساب.'
};
