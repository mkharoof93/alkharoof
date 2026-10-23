'use client';

import {useEffect, useMemo, useState} from 'react';
import {
  ArrowRight, BadgeCheck, Check, ChevronLeft, ChevronRight, CircleUserRound,
  Clock3, Flame, Globe2, Grid2X2, Heart, Home as HomeIcon, MapPin, Menu,
  MessageCircle, Minus, PackageCheck, Plus, Search, ShieldCheck, ShoppingBag,
  SlidersHorizontal, Sparkles, Trash2, Truck, Phone, X
} from 'lucide-react';
import {Banner, Category, Product, StoreSettings, TickerItem, imageLibrary, seedBanners} from '../lib/data';
import type {StoreData} from '../lib/store';

const WhatsAppIcon=({size=26}:{size?:number})=><svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>;
type CartItem={key:string;id:string;qty:number;unit:string;factor:number;processing:string};
type WeightOption={label:string;factor:number};
const money=(n:number)=>`${n.toFixed(3)} KD`;
const allCategories=['All','Lamb','Beef','Chicken','Offal','BBQ','Packs'];
const categoryAr:Record<string,string>={All:'الكل',Lamb:'لحم الخروف',Beef:'اللحم البقري',Chicken:'الدجاج',Offal:'الأحشاء',BBQ:'الشوي',Packs:'البوكسات'};
const processAr:Record<string,string>={Whole:'كامل','Medium cut':'تقطيع متوسط','Small cut':'تقطيع صغير',Cleaned:'منظف','Curry cut':'تقطيع للمرق','8 pieces':'8 قطع','Ready to cook':'جاهز للطبخ','No cutting':'بدون تقطيع'};

function weightOptions(p:Product):WeightOption[]{
  if(p.unit==='1 kg') return [{label:'500 g',factor:.5},{label:'1 kg',factor:1},{label:'2 kg',factor:2}];
  if(p.unit==='500 g') return [{label:'500 g',factor:1},{label:'1 kg',factor:2}];
  return [{label:p.unit,factor:1}];
}
function processingOptions(p:Product){
  if(p.category==='Chicken') return ['Whole','8 pieces','Curry cut'];
  if(p.category==='Lamb'||p.category==='Beef') return ['No cutting','Medium cut','Small cut'];
  if(p.category==='Offal') return ['Cleaned','Whole'];
  return ['Ready to cook'];
}

// Store data is rendered on the server (app/page.tsx) from a cached snapshot, so visitors
// never see placeholder data and the browser makes no extra API calls.
export default function Store({initial}:{initial:StoreData}){
  const [ar,setAr]=useState(false);
  const products:Product[]=initial.products;
  const banners:Banner[]=initial.banners;
  const categories:Category[]=initial.categories;
  const tickerItems:TickerItem[]=initial.ticker;
  const storeSettings:StoreSettings=initial.settings;
  const [slide,setSlide]=useState(0);
  const [category,setCategory]=useState('All');
  const [search,setSearch]=useState('');
  const [visible,setVisible]=useState(16);
  const [favorites,setFavorites]=useState<string[]>([]);
  const [cart,setCart]=useState<CartItem[]>([]);
  const [menuOpen,setMenuOpen]=useState(false);
  const [productSheet,setProductSheet]=useState<Product|null>(null);
  const [selectedWeight,setSelectedWeight]=useState<WeightOption>({label:'1 kg',factor:1});
  const [selectedProcessing,setSelectedProcessing]=useState('No cutting');
  const [selectedQty,setSelectedQty]=useState(1);
  const [cartOpen,setCartOpen]=useState(false);
  const [checkout,setCheckout]=useState(false);
  const [wishlistOnly,setWishlistOnly]=useState(false);
  const [notice,setNotice]=useState('');
  const [error,setError]=useState('');
  const [name,setName]=useState('');
  const [phone,setPhone]=useState('');
  const [area,setArea]=useState('');
  const [block,setBlock]=useState('');
  const [street,setStreet]=useState('');
  const [building,setBuilding]=useState('');
  const [location,setLocation]=useState('');
  const [notes,setNotes]=useState('');

  const t=(en:string,arabic:string)=>ar?arabic:en;
  const cash=(n:number)=>ar?`${n.toFixed(3)} د.ك`:`${n.toFixed(3)} KD`;
  const heroCash=(value?:string)=>ar?(value||'').replace(/KD/g,'د.ك'):(value||'');

  useEffect(()=>{
    try{
      const c=localStorage.getItem('akh-cart-v3'); if(c)setCart(JSON.parse(c));
      const f=localStorage.getItem('akh-favs-v3'); if(f)setFavorites(JSON.parse(f));
    }catch{}
  },[]);
  useEffect(()=>{try{localStorage.setItem('akh-cart-v3',JSON.stringify(cart))}catch{}},[cart]);
  useEffect(()=>{try{localStorage.setItem('akh-favs-v3',JSON.stringify(favorites))}catch{}},[favorites]);
  useEffect(()=>{document.documentElement.lang=ar?'ar':'en'},[ar]);
  useEffect(()=>{const live=banners.filter(b=>b.active!==false);if(!live.length)return;const id=setInterval(()=>setSlide(s=>(s+1)%live.length),5600);return()=>clearInterval(id)},[banners]);
  useEffect(()=>setVisible(16),[category,search,wishlistOnly]);

  const filtered=useMemo(()=>products.filter(p=>p.active!==false)
    .filter(p=>category==='All'||p.category===category)
    .filter(p=>!wishlistOnly||favorites.includes(p.id))
    .filter(p=>(`${p.en} ${p.ar} ${p.category}`).toLowerCase().includes(search.toLowerCase())),[products,category,search,wishlistOnly,favorites]);

  const cartRows=cart.map(c=>({c,p:products.find(p=>p.id===c.id)})).filter(x=>x.p) as {c:CartItem;p:Product}[];
  const subtotal=cartRows.reduce((n,{c,p})=>n+(p.price*c.factor*c.qty),0);
  const count=cart.reduce((n,c)=>n+c.qty,0);
  const liveBanners=banners.filter(b=>b.active!==false);
  const hero=liveBanners[slide%Math.max(1,liveBanners.length)]||seedBanners[0];
  const liveCategories=categories.filter(c=>c.active!==false).sort((a,b)=>a.sortOrder-b.sortOrder);
  const liveTicker=tickerItems.filter(x=>x.active!==false).sort((a,b)=>a.sortOrder-b.sortOrder);
  // Repeat messages so each half of the marquee is wider than any screen (no gap before the loop restarts).
  const tickerLoop=liveTicker.length?Array.from({length:Math.ceil(12/liveTicker.length)},()=>liveTicker).flat():[];
  const dynamicCategories=['All',...liveCategories.map(c=>c.nameEn)];
  const categoryArabic:Record<string,string>={...categoryAr,...Object.fromEntries(liveCategories.map(c=>[c.nameEn,c.nameAr]))};
  const whatsappDigits=storeSettings.whatsapp.replace(/\D/g,'');
  // "+96550982666" -> "+965 5098 2666" for display; links keep the raw number.
  const prettyPhone=(n:string)=>{const d=n.replace(/\D/g,'');return d.length===11&&d.startsWith('965')?`+965 ${d.slice(3,7)} ${d.slice(7)}`:n};
  const mapsUrl=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${storeSettings.companyNameEn}, ${storeSettings.addressEn}, Kuwait`)}`;

  function go(id:string){document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'})}
  function chooseCategory(c:string){setWishlistOnly(false);setCategory(c);setMenuOpen(false);setTimeout(()=>go('shop'),70)}
  function openProduct(p:Product){
    const w=weightOptions(p)[0]; setSelectedWeight(w); setSelectedProcessing(processingOptions(p)[0]);setSelectedQty(1);setProductSheet(p);
  }
  function addConfigured(p:Product){
    const key=`${p.id}-${selectedWeight.label}-${selectedProcessing}`;
    setCart(current=>{
      const found=current.find(x=>x.key===key);
      return found?current.map(x=>x.key===key?{...x,qty:x.qty+selectedQty}:x):[...current,{key,id:p.id,qty:selectedQty,unit:selectedWeight.label,factor:selectedWeight.factor,processing:selectedProcessing}];
    });
    setProductSheet(null);setNotice(t('Added to basket','تمت الإضافة إلى السلة'));setTimeout(()=>setNotice(''),1500);
  }
  function quickAdd(p:Product){
    const w=weightOptions(p)[0]; const proc=processingOptions(p)[0]; const key=`${p.id}-${w.label}-${proc}`;
    setCart(current=>{const found=current.find(x=>x.key===key);return found?current.map(x=>x.key===key?{...x,qty:x.qty+1}:x):[...current,{key,id:p.id,qty:1,unit:w.label,factor:w.factor,processing:proc}]});
    setNotice(t('Added to basket','تمت الإضافة إلى السلة'));setTimeout(()=>setNotice(''),1500);
  }
  function adjust(key:string,delta:number){setCart(c=>c.map(x=>x.key===key?{...x,qty:x.qty+delta}:x).filter(x=>x.qty>0))}
  function favorite(id:string){setFavorites(f=>f.includes(id)?f.filter(x=>x!==id):[...f,id])}
  function useLocation(){
    if(!navigator.geolocation){setError(t('Location is not supported.','الموقع غير مدعوم.'));return}
    navigator.geolocation.getCurrentPosition(({coords})=>{setLocation(`https://maps.google.com/?q=${coords.latitude},${coords.longitude}`);setError('')},()=>setError(t('Please allow location access or paste a map link.','يرجى السماح بالموقع أو لصق رابط الخريطة.')),{enableHighAccuracy:true,timeout:8000});
  }
  function sendWhatsApp(){
    if(!name.trim()||!phone.trim()||!area.trim()||!block.trim()||!street.trim()||!building.trim()){
      setError(t('Please complete your contact and Kuwait delivery address.','يرجى إكمال بيانات التواصل وعنوان التوصيل في الكويت.'));return;
    }
    const order=`AK-${Date.now().toString().slice(-6)}`;
    const lines=[
      ar?'*طلب جديد - شركة ملحمة الخروف*':'*NEW ORDER - AL KHAROOF BUTCHERY CO.*',
      `${ar?'رقم الطلب':'Order No'}: ${order}`,'',
      ...cartRows.map(({c,p})=>`• ${ar?p.ar:p.en} — ${c.unit} — ${ar?(processAr[c.processing]||c.processing):c.processing} × ${c.qty} — ${cash(p.price*c.factor*c.qty)}`),
      '',`${ar?'المجموع الفرعي':'SUBTOTAL'}: *${cash(subtotal)}*`,ar?'رسوم التوصيل تؤكد عبر واتساب':'Delivery charge will be confirmed on WhatsApp','',
      `${ar?'الاسم':'Name'}: ${name}`,`${ar?'الهاتف':'Phone'}: ${phone}`,`${ar?'المنطقة':'Area'}: ${area}`,`${ar?'القطعة':'Block'}: ${block}`,`${ar?'الشارع':'Street'}: ${street}`,`${ar?'المبنى / المنزل':'Building / House'}: ${building}`,
      location?`${ar?'الموقع':'Location'}: ${location}`:'',notes?`${ar?'ملاحظات':'Notes'}: ${notes}`:''
    ].filter(Boolean);
    window.open(`https://wa.me/${whatsappDigits}?text=${encodeURIComponent(lines.join('\n'))}`,'_blank','noopener,noreferrer');
  }


  return <div className="site" dir={ar?'rtl':'ltr'}>
    <div className="desktopAnnouncement"><span>{t('Fresh halal meat delivered across Kuwait','لحوم حلال طازجة مع توصيل داخل الكويت')}</span><span>•</span><span>{t(`WhatsApp ordering ${storeSettings.whatsapp}`,`للطلب واتساب ${storeSettings.whatsapp}`)}</span></div>

    <header className="desktopHeader">
      <div className="desktopHeaderInner">
        <button className="brand" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}><img src="/images/logo.jpg" alt="Best Quality Al Kharoof"/><span className="brandNames"><strong className="brandArabic" dir="rtl">{storeSettings.companyNameAr}</strong><small className="brandEnglish" dir="ltr">{storeSettings.companyNameEn}</small></span></button>
        <nav><button onClick={()=>go('home')}>{t('Home','الرئيسية')}</button><button onClick={()=>go('categories')}>{t('Categories','الأقسام')}</button><button onClick={()=>go('shop')}>{t('Shop','تسوق')}</button><button onClick={()=>go('offers')}>{t('Offers','العروض')}</button><button onClick={()=>go('story')}>{t('About','من نحن')}</button><button onClick={()=>go('contact')}>{t('Contact','التواصل')}</button></nav>
        <div className="desktopActions"><button className="langBtn" onClick={()=>setAr(!ar)} aria-label={t('Switch to Arabic','التبديل إلى الإنجليزية')}><Globe2 size={18}/><span>{ar?'English':'العربية'}</span></button><button className="iconBtn" onClick={()=>{setWishlistOnly(true);setCategory('All');go('shop')}}><Heart size={20}/></button><button className="iconBtn cartCount" onClick={()=>setCartOpen(true)}><ShoppingBag size={21}/>{count>0&&<b>{count}</b>}</button></div>
      </div>
    </header>

    <div className="mobileBrandBar" id="home"><button className="mobileBrandLockup" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}><span className="mobileLogoWrap"><img src="/images/logo.jpg" alt="Best Quality Al Kharoof"/></span><span className="brandNames"><strong className="brandArabic" dir="rtl">{storeSettings.companyNameAr}</strong><small className="brandEnglish" dir="ltr">{storeSettings.companyNameEn}</small></span></button></div>
    <div className="mobileSearchBar">
      <button className="plainIcon menuIcon" onClick={()=>setMenuOpen(true)} aria-label={t('Open menu','فتح القائمة')}><Menu size={22}/></button>
      <label className="mobileSearch"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} onFocus={()=>go('shop')} placeholder={t('Search meat, chicken, offers...','دوّر على لحم، دجاج أو عرض...')}/>{search&&<button onClick={()=>setSearch('')} aria-label={t('Clear search','مسح البحث')}><X size={15}/></button>}</label>
      <button className="plainIcon languageIcon" onClick={()=>setAr(!ar)} aria-label={t('Switch to Arabic','التبديل إلى الإنجليزية')} title={ar?'English':'العربية'}><Globe2 size={20}/></button>
    </div>
    <div className="latestTicker" aria-label={t('Latest products and offers','أحدث المنتجات والعروض')}>
      <div className="tickerTrack" style={{animationDuration:`${tickerLoop.length*9}s`}}>{[0,1].map(copy=><div className="tickerGroup" aria-hidden={copy===1} key={copy}>
        {tickerLoop.map((item,i)=><span className="tickerDynamic" key={`${copy}-${i}-${item.id}`}><button onClick={()=>item.productId?go('shop'):go('offers')}><b>{ar?item.labelAr:item.labelEn}</b><span>{ar?item.textAr:item.textEn}</span></button><i>✦</i></span>)}
      </div>)}</div>
    </div>

    <main>
      <section className="categorySection sectionShell" id="categories">
        <div className="sectionTitle compact"><div><span className="eyebrow">{t('SHOP YOUR WAY','تسوق على كيفك')}</span><h2>{t('What are you looking for?','شنو بخاطرك اليوم؟')}</h2></div><button onClick={()=>chooseCategory('All')}>{t('View all','شوف الكل')} <ArrowRight size={16}/></button></div>
        <div className="categoryRail">
          {liveCategories.map(c=><button className={`categoryBubble ${category===c.nameEn?'active':''}`} key={c.id} onClick={()=>chooseCategory(c.nameEn)}>
            <span className="categoryImage"><img src={c.image} alt={c.nameEn}/></span>
            <strong>{ar?c.nameAr:c.nameEn}</strong><small>{ar?(c.subtitleAr||'شوف القسم'):(c.subtitleEn||'Shop now')}</small>
          </button>)}
        </div>
        <div className="railProgress"><span/></div>
      </section>

      <section className="heroWrap sectionShell">
        <div className={`heroCard heroTheme-${hero.theme||'sunny'}`}>
          <div className="heroGlow heroGlowOne"/><div className="heroGlow heroGlowTwo"/>
          <div className="heroCopy">
            <span className="heroTag"><Sparkles size={14}/>{hero.tag}</span>
            <h1>{ar?hero.ar:hero.en}</h1>
            <p>{ar?hero.subAr:hero.subEn}</p>
            {hero.price&&<div className="heroPrice"><span>{t('Offer price','سعر اليوم')}</span><strong>{heroCash(hero.price)}</strong>{hero.oldPrice&&<del>{heroCash(hero.oldPrice)}</del>}</div>}
            <div className="heroActions">
              <button className="heroPrimary" onClick={()=>hero.category?chooseCategory(hero.category):go('shop')}>{ar?(hero.ctaAr||'شوف العرض'):(hero.ctaEn||'Shop offer')}<ArrowRight size={17}/></button>
              <button className="heroSecondary" onClick={()=>window.open(`https://wa.me/${whatsappDigits}`,'_blank')}><MessageCircle size={17}/>{t('Order on WhatsApp','اطلب الحين')}</button>
            </div>
          </div>
          <div className="heroProduct">
            {hero.offer&&<span className="offerBurst">{hero.offer}</span>}
            <div className="heroImageFrame"><img src={hero.image} alt={ar?(hero.productAr||hero.ar):(hero.productEn||hero.en)}/></div>
            <div className="heroProductMeta"><strong>{ar?(hero.productAr||hero.ar):(hero.productEn||hero.en)}</strong><small>{ar?(hero.productEn||hero.en):(hero.productAr||hero.ar)}</small></div>
          </div>
          <div className="heroNav"><button onClick={()=>setSlide(s=>(s-1+Math.max(1,liveBanners.length))%Math.max(1,liveBanners.length))}><ChevronLeft size={19}/></button><div>{liveBanners.map((_,i)=><button key={i} className={i===slide?'active':''} onClick={()=>setSlide(i)}/>)}</div><button onClick={()=>setSlide(s=>(s+1)%Math.max(1,liveBanners.length))}><ChevronRight size={19}/></button></div>
        </div>
      </section>

      <section className="trustStrip sectionShell">
        <div><ShieldCheck/><span><strong>{t('100% Halal','حلال 100%')}</strong><small>{t('Trusted sourcing','مصادر موثوقة')}</small></span></div>
        <div><PackageCheck/><span><strong>{t('Freshly prepared','يتجهز لك طازج')}</strong><small>{t('Prepared to order','على طلبك')}</small></span></div>
        <div><Truck/><span><strong>{t('Kuwait delivery','توصيل الكويت')}</strong><small>{t('Fast local delivery','توصيل محلي سريع')}</small></span></div>
        <div><MessageCircle/><span><strong>{t('Easy WhatsApp order','طلبك بواتساب')}</strong><small>{t('One message checkout','كل الطلب برسالة')}</small></span></div>
      </section>

      <section className="featuredRailSection sectionShell">
        <div className="featuredRailHead"><div><span className="eyebrow">{t('POPULAR RIGHT NOW','الأكثر طلباً الحين')}</span><h2>{t('Butcher’s picks for today','اختيارات الجزار اليوم')}</h2></div><button onClick={()=>go('shop')}>{t('Shop all','شوف الكل')} <ArrowRight size={15}/></button></div>
        <div className="featuredRail">{products.filter(p=>p.active!==false&&p.featured).slice(0,8).map(p=><article className="featuredMini" key={`featured-${p.id}`} onClick={()=>openProduct(p)}>
          <div className="featuredMiniImage"><img src={p.image} alt={p.en}/>{p.oldPrice&&<span>{Math.round((1-p.price/p.oldPrice)*100)}%</span>}</div>
          <div className="featuredMiniCopy"><small>{ar?(categoryArabic[p.category]||p.category):p.category}</small><strong>{ar?p.ar:p.en}</strong><em>{ar?p.en:p.ar}</em><div><b>{cash(p.price)}</b><button onClick={e=>{e.stopPropagation();quickAdd(p)}} aria-label={t('Quick add','إضافة سريعة')}><Plus size={16}/></button></div></div>
        </article>)}</div>
      </section>

      <section className="offers sectionShell" id="offers">
        <div className="offerCard campaignCard grillCampaign"><img src={products.find(p=>p.id==='p19')?.image||'/images/liver.jpg'} alt="BBQ"/><div className="campaignShade"/><div className="campaignCopy"><span>{t('WEEKEND GRILL','ويكند الشوي')}</span><h3>{t('Fire up the weekend','جهزوا جمعتكم للشوي')}</h3><p>{t('Kofta, skewers and grill-ready cuts picked for easy gatherings.','كفتة وأسياخ وقطع جاهزة للشوي — مرتبة لجمعات الويكند.')}</p><button onClick={()=>chooseCategory('BBQ')}>{t('Shop grill favourites','شوف اختيارات الشوي')} <ArrowRight size={15}/></button></div></div>
        <div className="offerCard campaignCard familyCampaign"><img src={products.find(p=>p.id==='p20')?.image||'/images/chicken.jpg'} alt="Family boxes"/><div className="campaignShade"/><div className="campaignCopy"><span>{t('FAMILY VALUE','وفر للعائلة')}</span><h3>{t('One box. More value.','بوكس واحد، قيمة أكثر')}</h3><p>{t('Family-ready combinations made for weekly shopping and gatherings.','تشكيلات عملية للبيت والجمعات — أوفر وأسهل في طلب واحد.')}</p><button onClick={()=>chooseCategory('Packs')}>{t('Explore family boxes','شوف بوكسات العائلة')} <ArrowRight size={15}/></button></div></div>
      </section>

      <section className="shop sectionShell" id="shop">
        <div className="shopHead">
          <div><span className="eyebrow">{wishlistOnly?t('YOUR SAVED PICKS','المفضلة'):t(category==='All'?'FRESH PICKS':'SHOP COLLECTION',category==='All'?'اختيارات اليوم':'شوف القسم')}</span><h2>{wishlistOnly?t('Wishlist','المفضلة'):category==='All'?t('Fresh picks, just for you','مختارين لك اليوم'):t(category,categoryArabic[category]||category)}</h2><p>{t('Choose a product, weight and preparation. We will send the complete basket to WhatsApp.','اختَر اللي تبيه، وحدد الوزن والتقطيع، وإحنا نجهز لك الطلب ونرسله واتساب.')}</p></div>
          <label className="desktopSearch"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t('Search lamb, chicken, liver...','دوّر على خروف، دجاج، كبد...')}/></label>
        </div>
        <div className="filterRow">
          <div className="filterChips">{dynamicCategories.map(c=><button className={category===c&&!wishlistOnly?'active':''} key={c} onClick={()=>{setWishlistOnly(false);setCategory(c)}}>{ar?(categoryArabic[c]||c):c}</button>)}</div>
          <div className="viewControls"><button><Grid2X2 size={17}/>{t('2 columns','عمودان')}</button><button><SlidersHorizontal size={17}/>{t('Filters','فلترة')}</button></div>
        </div>

        {filtered.length===0?<div className="emptyState"><Heart size={36}/><h3>{t('Nothing here yet','لا توجد منتجات هنا بعد')}</h3><button className="primaryBtn" onClick={()=>{setWishlistOnly(false);setCategory('All');setSearch('')}}>{t('Browse all products','عرض كل المنتجات')}</button></div>:
        <div className="productGrid">{filtered.slice(0,visible).map(p=>{
          const discount=p.oldPrice?Math.round((1-p.price/p.oldPrice)*100):0;
          return <article className="productCard" key={p.id}>
            <div className="productImage" onClick={()=>openProduct(p)}><img src={p.image} alt={p.en}/>{discount>0&&<span className="discount">-{discount}%</span>}{p.badge&&<span className="freshBadge">{ar?(p.badge==='Fresh'?'طازج':p.badge==='Best seller'?'الأكثر مبيعاً':'قيمة'):p.badge}</span>}<button className={`heart ${favorites.includes(p.id)?'liked':''}`} onClick={e=>{e.stopPropagation();favorite(p.id)}}><Heart size={17} fill={favorites.includes(p.id)?'currentColor':'none'}/></button></div>
            <div className="productBody"><div className="productMetaRow"><span className="productCat">{ar?(categoryArabic[p.category]||p.category):p.category}</span><span className={`stockPill ${p.stockStatus==='low_stock'?'low':''}`}><i/>{p.stockStatus==='low_stock'?t('Low stock','باقي قليل'):t('In stock','متوفر')}</span></div><h3>{ar?p.ar:p.en}</h3><small>{ar?p.en:p.ar}</small><div className="productSpec"><span>{p.unit}</span>{p.preparationOptions?.length?<span>{t('Cut to order','تقطيع حسب الطلب')}</span>:null}</div><div className="priceLine"><strong>{cash(p.price)}</strong>{p.oldPrice&&<del>{cash(p.oldPrice)}</del>}</div><button className="selectBtn" onClick={()=>openProduct(p)}>{t('Choose options','اختَر التفاصيل')}</button><button className="quickPlus" onClick={()=>quickAdd(p)} aria-label="Quick add"><Plus size={18}/></button></div>
          </article>})}</div>}
        {visible<filtered.length&&<button className="loadMore" onClick={()=>setVisible(v=>v+16)}>{t('Load more products','عرض المزيد')}</button>}
      </section>

      <section className="whatsappBand">
        <div className="sectionShell whatsappInner"><div><span className="eyebrow gold">{t('FASTEST WAY TO ORDER','أسرع طريقة للطلب')}</span><h2>{t('Your order. One WhatsApp message.','كل طلبك برسالة واتساب وحدة.')}</h2><p>{t('Add products, choose preparation, enter your Kuwait delivery details and we prepare the complete message for you.','اختَر منتجاتك والتقطيع وعنوانك، وإحنا نرتب لك رسالة الطلب كاملة.')}</p><button className="creamBtn" onClick={()=>setCartOpen(true)}>{t('Start your order','ابدأ طلبك الحين')} <ArrowRight size={17}/></button></div><div className="steps"><div><b>01</b><span>{t('Choose your meat','اختَر اللي تبيه')}</span></div><div><b>02</b><span>{t('Add delivery details','أضف عنوان التوصيل')}</span></div><div><b>03</b><span>{t('Send to WhatsApp','أرسل عبر واتساب')}</span></div></div></div>
      </section>

      <section className="contactSection sectionShell" id="contact">
        <div className="contactIntro"><span className="eyebrow">{t('VISIT & CONTACT','العنوان والتواصل')}</span><h2>{t('Find Al Kharoof in West Abu Fateera.','زورونا في غرب أبو فطيرة.')}</h2><p>{t('Visit our shop, call us, or send your order on WhatsApp — we are happy to help with cuts and preparation.','زورونا في المحل، اتصلوا فينا، أو أرسلوا طلبكم على الواتساب — حاضرين لأي تقطيع أو تجهيز تبونه.')}</p></div>
        <div className="contactCards">
          <div className="contactCard addressCard"><i className="contactIcon"><MapPin/></i><div><span>{t('Address','العنوان')}</span><strong dir="rtl">{storeSettings.addressAr}</strong><p dir="ltr">{storeSettings.addressEn}</p><a className="contactAction" href={mapsUrl} target="_blank" rel="noreferrer">{t('Get directions','افتح الموقع')} <ArrowRight size={16}/></a></div></div>
          <div className="contactCard phoneCard"><i className="contactIcon"><Phone/></i><div><span>{t('Call us','اتصل فينا')}</span><div className="phoneLinks"><a href={`tel:${storeSettings.phone1}`} dir="ltr">{prettyPhone(storeSettings.phone1)}</a><a href={`tel:${storeSettings.phone2}`} dir="ltr">{prettyPhone(storeSettings.phone2)}</a></div><small>{t('Business contact numbers','أرقام التواصل الخاصة بالشركة')}</small></div></div>
          <div className="contactCard whatsappContact"><i className="contactIcon"><MessageCircle/></i><div><span>{t('WhatsApp Orders','طلبات واتساب')}</span><strong dir="ltr">{prettyPhone(storeSettings.whatsapp)}</strong><small>{t('Send your basket and delivery details','أرسل السلة وبيانات التوصيل')}</small><a className="contactAction waAction" href={`https://wa.me/${whatsappDigits}`} target="_blank" rel="noreferrer"><MessageCircle size={17}/> {t('Chat on WhatsApp','راسلنا على الواتساب')}</a></div></div>
        </div>
      </section>

      <section className="story sectionShell" id="story"><div><span className="eyebrow">{t('AL KHAROOF BUTCHERY CO.','شركة ملحمة الخروف')}</span><h2>{t('Good food begins with quality.','الجودة تبين من أول لقمة.')}</h2><p>{t('A Kuwait butchery focused on quality halal meat, careful preparation and a simple modern ordering experience.','ملحمة كويتية نهتم فيها بجودة اللحم الحلال، نظافة التجهيز، وطلب سهل من أول اختيار لين التوصيل.')}</p><div className="storyPoints"><span><ShieldCheck/> {t('Halal selection','اختيار حلال')}</span><span><PackageCheck/> {t('Prepared to order','تجهيز حسب الطلب')}</span><span><Truck/> {t('Kuwait delivery','توصيل داخل الكويت')}</span></div></div><div className="storyVisual"><img className="storyPhoto" src={imageLibrary.butcher} alt={t('Fresh cuts prepared at Al Kharoof','تجهيز اللحم الطازج في ملحمة الخروف')}/><div className="storyBadge"><img src="/images/logo.jpg" alt="Best Quality"/></div></div></section>
    </main>

    <footer><div className="sectionShell footerGrid"><div><button className="footerBrand" onClick={()=>go('home')}><img src="/images/logo.jpg" alt="Al Kharoof"/><span className="brandNames"><strong className="brandArabic" dir="rtl">{storeSettings.companyNameAr}</strong><small className="brandEnglish" dir="ltr">{storeSettings.companyNameEn}</small></span></button><p>{t('Premium halal meat ordering for Kuwait.','طلب لحوم حلال عالية الجودة في الكويت.')}</p></div><div><strong>{t('Shop','المتجر')}</strong>{liveCategories.slice(0,4).map(c=><button key={c.id} onClick={()=>chooseCategory(c.nameEn)}>{ar?c.nameAr:c.nameEn}</button>)}</div><div className="footerContact"><strong>{t('Contact','التواصل')}</strong><span dir="rtl">{storeSettings.addressAr}</span><span dir="ltr">{storeSettings.addressEn}</span><a href={`tel:${storeSettings.phone1}`}>{storeSettings.phone1}</a><a href={`tel:${storeSettings.phone2}`}>{storeSettings.phone2}</a><a className="footerWhatsapp" href={`https://wa.me/${whatsappDigits}`} target="_blank" rel="noreferrer">WhatsApp: {storeSettings.whatsapp}</a><a href="/admin">Admin</a></div></div><div className="footerBottom sectionShell"><span>© 2026 {storeSettings.companyNameEn}</span><span>{t('Demo prices require client approval before launch.','الأسعار التجريبية تحتاج موافقة العميل قبل الإطلاق.')}</span></div></footer>

    <nav className="mobileBottomNav">
      <button onClick={()=>{setWishlistOnly(false);window.scrollTo({top:0,behavior:'smooth'})}}><HomeIcon size={22}/><small>{t('Home','الرئيسية')}</small></button>
      <button onClick={()=>go('categories')}><Grid2X2 size={22}/><small>{t('Categories','الأقسام')}</small></button>
      <button onClick={()=>go('offers')}><Flame size={22}/><small>{t('Offers','العروض')}</small></button>
      <button onClick={()=>{setWishlistOnly(true);setCategory('All');go('shop')}} className={wishlistOnly?'active':''}><Heart size={22}/><small>{t('Wishlist','المفضلة')}</small></button>
      <button className="bottomCart" onClick={()=>setCartOpen(true)}><ShoppingBag size={22}/>{count>0&&<b>{count}</b>}<small>{t('Cart','السلة')}</small></button>
    </nav>
    {count>0&&!cartOpen&&<button className="mobileBasketBar" onClick={()=>setCartOpen(true)}><span><ShoppingBag size={18}/><b>{count}</b> {t('items','منتجات')}</span><strong>{cash(subtotal)}</strong><em>{t('View basket','عرض السلة')} <ArrowRight size={15}/></em></button>}

    {menuOpen&&<div className="overlay" onClick={()=>setMenuOpen(false)}><aside className="sideMenu" onClick={e=>e.stopPropagation()}><div className="sideMenuHead"><div className="brandMini"><img src="/images/logo.jpg" alt=""/><span className="brandNames"><strong className="brandArabic" dir="rtl">{storeSettings.companyNameAr}</strong><small className="brandEnglish" dir="ltr">{storeSettings.companyNameEn}</small></span></div><button onClick={()=>setMenuOpen(false)}><X/></button></div><button onClick={()=>{setMenuOpen(false);window.scrollTo({top:0,behavior:'smooth'})}}><HomeIcon/> {t('Home','الرئيسية')}</button><button onClick={()=>{setMenuOpen(false);go('categories')}}><Grid2X2/> {t('Categories','الأقسام')}</button><button onClick={()=>{setMenuOpen(false);go('offers')}}><Flame/> {t('Offers','العروض')}</button><button onClick={()=>{setMenuOpen(false);go('contact')}}><MapPin/> {t('Contact','التواصل')}</button><button onClick={()=>{setMenuOpen(false);setWishlistOnly(true);go('shop')}}><Heart/> {t('Wishlist','المفضلة')}</button><button onClick={()=>{setMenuOpen(false);setAr(!ar)}}><Globe2/> <span>{ar?'English':'العربية'}</span></button><a href={`https://wa.me/${whatsappDigits}`}><MessageCircle/> WhatsApp</a></aside></div>}

    {productSheet&&<div className="sheetOverlay" onClick={()=>setProductSheet(null)}><section className="productSheet" onClick={e=>e.stopPropagation()}><div className="sheetHandle"/><button className="closeSheet" onClick={()=>setProductSheet(null)}><X/></button><div className="sheetProduct"><img src={productSheet.image} alt={productSheet.en}/><div><span>{ar?(categoryArabic[productSheet.category]||productSheet.category):productSheet.category}</span><h2>{ar?productSheet.ar:productSheet.en}</h2><small>{ar?productSheet.en:productSheet.ar}</small><strong>{money(productSheet.price*selectedWeight.factor)}</strong></div></div><div className="optionGroup"><label>{t('Weight / size','الوزن / الحجم')}</label><div>{weightOptions(productSheet).map(w=><button key={w.label} className={selectedWeight.label===w.label?'active':''} onClick={()=>setSelectedWeight(w)}>{w.label}</button>)}</div></div><div className="optionGroup"><label>{t('Processing','شلون تبيه؟')}</label><div>{processingOptions(productSheet).map(x=><button key={x} className={selectedProcessing===x?'active':''} onClick={()=>setSelectedProcessing(x)}>{ar?(processAr[x]||x):x}</button>)}</div></div><div className="sheetFooter"><div className="qty"><button onClick={()=>setSelectedQty(q=>Math.max(1,q-1))}><Minus/></button><span>{selectedQty}</span><button onClick={()=>setSelectedQty(q=>q+1)}><Plus/></button></div><button className="addBasketBtn" onClick={()=>addConfigured(productSheet)}><ShoppingBag size={19}/>{t('Add to basket','أضفه للسلة')} · {money(productSheet.price*selectedWeight.factor*selectedQty)}</button></div></section></div>}

    {cartOpen&&<div className="cartOverlay" onClick={()=>setCartOpen(false)}><aside className="cartDrawer" onClick={e=>e.stopPropagation()}><div className="cartHeader"><div><span className="eyebrow">AL KHAROOF</span><h2>{checkout?t('Delivery details','بيانات التوصيل'):t('Your basket','سلتك')} {!checkout&&<small>({count})</small>}</h2></div><button onClick={()=>{setCartOpen(false);setCheckout(false)}}><X/></button></div>
      {!checkout?<><div className="cartItems">{cartRows.length===0?<div className="emptyCart"><ShoppingBag/><h3>{t('Your basket is empty','سلتك فارغة')}</h3><p>{t('Add fresh cuts and come back here.','أضف منتجاتك الطازجة ثم عد للسلة.')}</p><button className="primaryBtn" onClick={()=>{setCartOpen(false);go('shop')}}>{t('Shop products','تسوق المنتجات')}</button></div>:cartRows.map(({c,p})=><div className="cartItem" key={c.key}><img src={p.image} alt=""/><div className="cartItemInfo"><strong>{ar?p.ar:p.en}</strong><span>{c.unit} · {ar?(processAr[c.processing]||c.processing):c.processing}</span><b>{money(p.price*c.factor)}</b><div className="cartQty"><button onClick={()=>adjust(c.key,-1)}><Minus/></button><span>{c.qty}</span><button onClick={()=>adjust(c.key,1)}><Plus/></button></div></div><button className="remove" onClick={()=>setCart(ca=>ca.filter(x=>x.key!==c.key))}><X size={18}/></button></div>)}</div>{cartRows.length>0&&<div className="cartSticky"><div className="subtotal"><span>{t('Subtotal','المجموع الفرعي')}</span><strong>{cash(subtotal)}</strong></div><small>{ar?storeSettings.deliveryNoteAr:storeSettings.deliveryNoteEn}</small><button className="continueBtn" onClick={()=>setCheckout(true)}>{t('Continue to delivery','كمل بيانات التوصيل')} <ArrowRight size={18}/></button></div>}</>:
      <><div className="deliveryForm"><button className="backLink" onClick={()=>setCheckout(false)}><ChevronLeft/> {t('Back to basket','العودة للسلة')}</button><div className="formIntro"><MapPin/><div><strong>{t('Where should we deliver?','وين نوصل طلبك؟')}</strong><p>{t('Enter your Kuwait address. We will include it in the WhatsApp order.','أدخل عنوانك في الكويت وسيتم إرفاقه برسالة واتساب.')}</p></div></div><label><span>{t('Name','الاسم')}</span><input value={name} onChange={e=>setName(e.target.value)} placeholder={t('Your name','الاسم')}/></label><label><span>{t('Mobile number','رقم الهاتف')}</span><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+965"/></label><div className="form2"><label><span>{t('Area','المنطقة')}</span><input value={area} onChange={e=>setArea(e.target.value)} placeholder={t('e.g. Salmiya','مثال: السالمية')}/></label><label><span>{t('Block','القطعة')}</span><input value={block} onChange={e=>setBlock(e.target.value)}/></label></div><div className="form2"><label><span>{t('Street','الشارع')}</span><input value={street} onChange={e=>setStreet(e.target.value)}/></label><label><span>{t('House / Building','منزل / مبنى')}</span><input value={building} onChange={e=>setBuilding(e.target.value)}/></label></div><label><span>{t('Map location','الموقع على الخريطة')}</span><div className="locationRow"><input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Google Maps link"/><button type="button" onClick={useLocation}><MapPin/>{t('Use location','حدد موقعي')}</button></div></label><label><span>{t('Order notes (optional)','ملاحظات الطلب (اختياري)')}</span><textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder={t('Cutting instructions, landmark...','تعليمات التقطيع، علامة مميزة...')}/></label>{error&&<p className="error">{error}</p>}</div><div className="cartSticky checkoutSticky"><div className="subtotal"><span>{t('Order subtotal','المجموع')}</span><strong>{cash(subtotal)}</strong></div><button className="whatsappBtn" onClick={sendWhatsApp}><MessageCircle size={20}/>{t('Send order on WhatsApp','أرسل الطلب واتساب')}</button></div></>}
    </aside></div>}

    {notice&&<div className="toast"><Check/>{notice}</div>}
    <a className="floatingWhatsapp" href={`https://wa.me/${whatsappDigits}`} target="_blank" rel="noreferrer" aria-label="WhatsApp"><WhatsAppIcon/></a>
  </div>
}
