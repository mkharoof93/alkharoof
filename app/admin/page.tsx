'use client';

import {useEffect,useMemo,useState} from 'react';
import {
  BadgePercent,Boxes,ChevronDown,Copy,Eye,EyeOff,FileImage,ImagePlus,LayoutDashboard,
  LogOut,Menu,Package,Plus,Search,Settings,SlidersHorizontal,Sparkles,Tag,Trash2,
  X,CheckCircle2,AlertTriangle,UploadCloud,Languages,Store,PanelLeftClose,PanelLeftOpen
} from 'lucide-react';
import {
  Banner,Category,Product,StoreSettings,TickerItem,seedBanners,seedCategories,seedProducts,seedSettings,seedTickerItems
} from '../../lib/data';
import './admin.css';

type Tab='overview'|'products'|'categories'|'promotions'|'ticker'|'settings';
type Mode='demo'|'supabase';
type Notice={type:'ok'|'error';text:string}|null;
const uid=(prefix:string)=>`${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
const money=(n:number)=>`${Number(n||0).toFixed(3)} KD`;
const clone=<T,>(v:T):T=>JSON.parse(JSON.stringify(v));
// Resize to ≤1600px and re-encode as WebP before upload: keeps Supabase free-tier storage (1 GB)
// and bandwidth (5 GB/month) usage small and stays under Vercel's request size limit.
async function compressImage(file:File,max=1600,quality=0.82):Promise<File>{
  if(!/^image\/(jpeg|png|webp|avif)$/.test(file.type))return file;
  try{
    const bmp=await createImageBitmap(file);const scale=Math.min(1,max/Math.max(bmp.width,bmp.height));
    const canvas=document.createElement('canvas');canvas.width=Math.round(bmp.width*scale);canvas.height=Math.round(bmp.height*scale);
    canvas.getContext('2d')!.drawImage(bmp,0,0,canvas.width,canvas.height);bmp.close();
    const blob=await new Promise<Blob|null>(r=>canvas.toBlob(r,'image/webp',quality));
    if(!blob||blob.type!=='image/webp'||blob.size>=file.size)return file;
    return new File([blob],file.name.replace(/\.\w+$/,'')+'.webp',{type:'image/webp'});
  }catch{return file}
}

const blankProduct=():Product=>({id:'',en:'',ar:'',category:'Lamb',price:0,oldPrice:undefined,unit:'1 kg',image:'',active:true,featured:false,badge:'',descriptionEn:'',descriptionAr:'',sku:'',stockQty:0,stockStatus:'in_stock',gallery:[],weightOptions:['500 g','1 kg','2 kg'],preparationOptions:['No cutting','Medium cut','Small cut'],sortOrder:999});
const blankCategory=():Category=>({id:'',nameEn:'',nameAr:'',slug:'',image:'',subtitleEn:'',subtitleAr:'',active:true,sortOrder:999});
const blankBanner=():Banner&{active?:boolean;sortOrder?:number}=>({id:'',en:'',ar:'',subEn:'',subAr:'',image:'',tag:'SPECIAL OFFER',ctaEn:'Shop offer',ctaAr:'تسوق العرض',price:'',oldPrice:'',offer:'',category:'Lamb',productEn:'',productAr:'',theme:'sunny',active:true,sortOrder:999});
const blankTicker=():TickerItem=>({id:'',labelEn:'NEW',labelAr:'جديد',textEn:'',textAr:'',active:true,sortOrder:999});

export default function AdminPage(){
  const [mode,setMode]=useState<Mode>('demo');
  const [ready,setReady]=useState(false);
  const [authed,setAuthed]=useState(false);
  const [loginConfigured,setLoginConfigured]=useState(true);
  const [adminName,setAdminName]=useState('');
  const [username,setUsername]=useState('');
  const [password,setPassword]=useState('');
  const [showPassword,setShowPassword]=useState(false);
  const [tab,setTab]=useState<Tab>('overview');
  const [sidebarOpen,setSidebarOpen]=useState(true);
  const [products,setProducts]=useState<Product[]>(clone(seedProducts));
  const [categories,setCategories]=useState<Category[]>(clone(seedCategories));
  const [banners,setBanners]=useState<(Banner&{active?:boolean;sortOrder?:number})[]>(clone(seedBanners).map((b,i)=>({...b,active:true,sortOrder:i+1})));
  const [ticker,setTicker]=useState<TickerItem[]>(clone(seedTickerItems));
  const [settings,setSettings]=useState<StoreSettings>(clone(seedSettings));
  const [query,setQuery]=useState('');
  const [categoryFilter,setCategoryFilter]=useState('All');
  const [editor,setEditor]=useState<{kind:'product'|'category'|'banner'|'ticker';data:any}|null>(null);
  const [notice,setNotice]=useState<Notice>(null);
  const [busy,setBusy]=useState(false);

  // On phones/tablets the sidebar is an overlay drawer: start closed and close after navigating.
  const isNarrow=()=>typeof window!=='undefined'&&window.matchMedia('(max-width:900px)').matches;
  useEffect(()=>{if(isNarrow())setSidebarOpen(false)},[]);
  function goTab(k:Tab){setTab(k);if(isNarrow())setSidebarOpen(false)}

  useEffect(()=>{
    fetch('/api/admin/session',{cache:'no-store'}).then(r=>r.json()).then(async s=>{
      const next:Mode=s?.supabase?'supabase':'demo'; setMode(next);
      setLoginConfigured(!!s?.loginConfigured); setAuthed(!!s?.authenticated); setAdminName(s?.username||'');
      if(s?.authenticated){if(next==='supabase')await loadRemote();else loadDemo();}
      setReady(true);
    }).catch(()=>{setNotice({type:'error',text:'Could not reach the server. Refresh to try again.'});setReady(true)});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  function loadDemo(){
    try{
      setProducts(JSON.parse(localStorage.getItem('akh-admin-products')||'null')||clone(seedProducts));
      setCategories(JSON.parse(localStorage.getItem('akh-admin-categories')||'null')||clone(seedCategories));
      setBanners(JSON.parse(localStorage.getItem('akh-admin-banners')||'null')||clone(seedBanners).map((b:any,i:number)=>({...b,active:true,sortOrder:i+1})));
      setTicker(JSON.parse(localStorage.getItem('akh-admin-ticker')||'null')||clone(seedTickerItems));
      setSettings(JSON.parse(localStorage.getItem('akh-admin-settings')||'null')||clone(seedSettings));
    }catch{}
  }
  function persistDemo(next?:{products?:Product[];categories?:Category[];banners?:(Banner&{active?:boolean;sortOrder?:number})[];ticker?:TickerItem[];settings?:StoreSettings}){
    if(mode!=='demo')return;
    const p=next?.products||products,c=next?.categories||categories,b=next?.banners||banners,t=next?.ticker||ticker,s=next?.settings||settings;
    localStorage.setItem('akh-admin-products',JSON.stringify(p));localStorage.setItem('akh-admin-categories',JSON.stringify(c));localStorage.setItem('akh-admin-banners',JSON.stringify(b));localStorage.setItem('akh-admin-ticker',JSON.stringify(t));localStorage.setItem('akh-admin-settings',JSON.stringify(s));
  }
  async function loadRemote(){
    const [p,c,b,t,s]=await Promise.all(['/api/products','/api/categories','/api/banners','/api/ticker','/api/settings'].map(x=>fetch(x).then(r=>r.json())));
    if(Array.isArray(p))setProducts(p);if(Array.isArray(c))setCategories(c);if(Array.isArray(b))setBanners(b);if(Array.isArray(t))setTicker(t);if(s&&!s.error)setSettings(s);
  }
  async function login(e:React.FormEvent){
    e.preventDefault();setBusy(true);setNotice(null);
    try{
      const r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});const j=await r.json().catch(()=>({}));
      if(!r.ok){setNotice({type:'error',text:j.error||'Sign in failed'});return}
      setPassword('');setAdminName(j.username||username);setAuthed(true);setNotice(null);
      if(mode==='supabase')await loadRemote();else loadDemo();
    }catch{setNotice({type:'error',text:'Could not reach the server. Check your connection.'})}finally{setBusy(false)}
  }
  async function logout(){await fetch('/api/admin/logout',{method:'POST'}).catch(()=>{});setAuthed(false);setEditor(null);setNotice(null)}
  // A 401 means the session cookie expired or was revoked (e.g. password changed in Vercel).
  async function apiCall(path:string,init:RequestInit,fallback:string){
    const r=await fetch(path,init);const j=await r.json().catch(()=>({}));
    if(r.status===401){setAuthed(false);setEditor(null);throw new Error('Your session has expired. Please sign in again.')}
    if(!r.ok)throw new Error(j.error||fallback);return j;
  }
  const apiSave=(path:string,data:any)=>apiCall(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)},'Save failed');
  const apiDelete=(path:string,id:string)=>apiCall(path,{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})},'Delete failed');

  async function uploadImage(file:File,folder:string){
    if(mode==='demo') return await new Promise<string>((resolve,reject)=>{const fr=new FileReader();fr.onload=()=>resolve(String(fr.result));fr.onerror=()=>reject(fr.error);fr.readAsDataURL(file)});
    const fd=new FormData();fd.append('file',await compressImage(file));fd.append('folder',folder);
    const j=await apiCall('/api/upload',{method:'POST',body:fd},'Upload failed');return String(j.url);
  }

  async function saveEditor(){
    if(!editor)return;setBusy(true);setNotice(null);
    try{
      if(editor.kind==='product'){
        let p=editor.data as Product;if(!p.en.trim()||!p.ar.trim())throw new Error('English and Arabic product names are required.');if(Number(p.price)<0)throw new Error('Price cannot be negative.');p={...p,id:p.id||uid('product'),price:Number(p.price),oldPrice:p.oldPrice==null||p.oldPrice==='' as any?undefined:Number(p.oldPrice),stockQty:Number(p.stockQty||0),sortOrder:Number(p.sortOrder||999)};
        if(mode==='supabase')await apiSave('/api/products',p);const next=[...products.filter(x=>x.id!==p.id),p].sort((a,b)=>(a.sortOrder||999)-(b.sortOrder||999));setProducts(next);persistDemo({products:next});
      }
      if(editor.kind==='category'){
        let c=editor.data as Category;if(!c.nameEn.trim()||!c.nameAr.trim())throw new Error('Category names are required.');c={...c,id:c.id||uid('category'),slug:(c.slug||c.nameEn).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''),sortOrder:Number(c.sortOrder||999)};if(mode==='supabase')await apiSave('/api/categories',c);const next=[...categories.filter(x=>x.id!==c.id),c].sort((a,b)=>a.sortOrder-b.sortOrder);setCategories(next);persistDemo({categories:next});
      }
      if(editor.kind==='banner'){
        let b=editor.data as Banner&{active?:boolean;sortOrder?:number};if(!b.en.trim()||!b.ar.trim())throw new Error('English and Arabic banner titles are required.');b={...b,id:b.id||uid('banner'),sortOrder:Number(b.sortOrder||999)};if(mode==='supabase')await apiSave('/api/banners',b);const next=[...banners.filter(x=>x.id!==b.id),b].sort((a,b)=>(a.sortOrder||999)-(b.sortOrder||999));setBanners(next);persistDemo({banners:next});
      }
      if(editor.kind==='ticker'){
        let t=editor.data as TickerItem;if(!t.textEn.trim()||!t.textAr.trim())throw new Error('Ticker text is required in both languages.');t={...t,id:t.id||uid('ticker'),sortOrder:Number(t.sortOrder||999)};if(mode==='supabase')await apiSave('/api/ticker',t);const next=[...ticker.filter(x=>x.id!==t.id),t].sort((a,b)=>a.sortOrder-b.sortOrder);setTicker(next);persistDemo({ticker:next});
      }
      setEditor(null);setNotice({type:'ok',text:'Changes saved successfully.'});if(mode==='supabase')await loadRemote();
    }catch(e:any){setNotice({type:'error',text:e.message||'Save failed'});}finally{setBusy(false)}
  }
  async function remove(kind:'product'|'category'|'banner'|'ticker',id:string){
    if(!confirm('Delete this item? This cannot be undone.'))return;setBusy(true);try{
      const path={product:'/api/products',category:'/api/categories',banner:'/api/banners',ticker:'/api/ticker'}[kind];if(mode==='supabase')await apiDelete(path,id);
      if(kind==='product'){const n=products.filter(x=>x.id!==id);setProducts(n);persistDemo({products:n})}
      if(kind==='category'){const n=categories.filter(x=>x.id!==id);setCategories(n);persistDemo({categories:n})}
      if(kind==='banner'){const n=banners.filter(x=>x.id!==id);setBanners(n);persistDemo({banners:n})}
      if(kind==='ticker'){const n=ticker.filter(x=>x.id!==id);setTicker(n);persistDemo({ticker:n})}
      setNotice({type:'ok',text:'Item deleted.'});
    }catch(e:any){setNotice({type:'error',text:e.message||'Delete failed'});}finally{setBusy(false)}
  }
  async function saveSettings(){setBusy(true);try{if(mode==='supabase')await apiSave('/api/settings',settings);persistDemo({settings});setNotice({type:'ok',text:'Store settings saved.'})}catch(e:any){setNotice({type:'error',text:e.message})}finally{setBusy(false)}}
  function resetDemo(){if(!confirm('Reset all demo changes to the original catalogue?'))return;localStorage.removeItem('akh-admin-products');localStorage.removeItem('akh-admin-categories');localStorage.removeItem('akh-admin-banners');localStorage.removeItem('akh-admin-ticker');localStorage.removeItem('akh-admin-settings');loadDemo();setNotice({type:'ok',text:'Demo data reset.'})}

  const visibleProducts=useMemo(()=>products.filter(p=>(categoryFilter==='All'||p.category===categoryFilter)&&(`${p.en} ${p.ar} ${p.sku||''}`).toLowerCase().includes(query.toLowerCase())),[products,query,categoryFilter]);
  const activeProducts=products.filter(x=>x.active!==false).length;const lowStock=products.filter(x=>x.stockStatus==='low_stock'||Number(x.stockQty||0)<=6).length;const offerCount=products.filter(x=>x.oldPrice&&x.oldPrice>x.price).length;

  if(!ready)return <div className="adminBoot"><img src="/images/logo.jpg" alt=""/><b>Loading Al Kharoof Admin…</b></div>;
  if(!loginConfigured)return <div className="adminLogin"><div className="loginCard"><img src="/images/logo.jpg" alt="Al Kharoof"/><span className="loginEyebrow">SETUP REQUIRED</span><h1>Admin login not configured</h1><p>Add <code>ADMIN_USERNAME</code> and <code>ADMIN_PASSWORD</code> to the environment variables (Vercel → Project → Settings → Environment Variables, or <code>.env.local</code> for local development), then redeploy or restart the server.</p><a href="/">← Back to storefront</a></div></div>;
  if(!authed)return <div className="adminLogin"><div className="loginCard"><img src="/images/logo.jpg" alt="Al Kharoof"/><span className="loginEyebrow">SECURE ADMIN</span><h1>Store management</h1><p>Sign in to manage products, offers and store details.</p>{notice&&<NoticeView n={notice}/>}<form onSubmit={login}><label>Username<input value={username} onChange={e=>setUsername(e.target.value)} required autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} autoFocus/></label><label>Password<span className="passwordField"><input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password"/><button type="button" onClick={()=>setShowPassword(x=>!x)} aria-label={showPassword?'Hide password':'Show password'}>{showPassword?<EyeOff/>:<Eye/>}</button></span></label><button className="adminPrimary" disabled={busy}>{busy?'Signing in…':'Sign in'}</button></form><a href="/">← Back to storefront</a></div></div>;

  return <div className={`adminShell ${sidebarOpen?'':'sidebarCollapsed'}`}>
    <aside className="adminSidebar">
      <div className="adminBrand"><img src="/images/logo.jpg"/><div><strong>شركة ملحمة الخروف</strong><span>Al Kharoof Admin</span></div></div>
      <nav>{([
        ['overview',LayoutDashboard,'Overview'],['products',Package,'Products'],['categories',Boxes,'Categories'],['promotions',BadgePercent,'Promotion banners'],['ticker',Sparkles,'Scrolling ticker'],['settings',Settings,'Store settings']
      ] as const).map(([k,Icon,label])=><button key={k} className={tab===k?'active':''} onClick={()=>goTab(k)}><Icon/><span>{label}</span></button>)}</nav>
      <div className="sidebarFoot">{mode==='demo'&&<div className="modePill demo"><span></span>Demo / local data</div>}<a href="/">View storefront ↗</a>{mode==='demo'&&<button onClick={resetDemo}><Trash2/> Reset demo data</button>}</div>
    </aside>
    {sidebarOpen&&<div className="sidebarBackdrop" onClick={()=>setSidebarOpen(false)}/>}

    <main className="adminMain">
      <header className="adminHeader"><button className="collapseBtn" onClick={()=>setSidebarOpen(x=>!x)}>{sidebarOpen?<PanelLeftClose/>:<PanelLeftOpen/>}</button><div><span className="adminBreadcrumb">Al Kharoof / {tab}</span><h1>{tab==='overview'?'Dashboard':tab==='products'?'Products':tab==='categories'?'Categories':tab==='promotions'?'Promotion banners':tab==='ticker'?'Scrolling ticker':'Store settings'}</h1></div><div className="headerTools"><div className={`connectionChip ${mode}`}><span></span>{mode==='demo'?'Demo mode':'Live database'}</div><button className="headerLogout" onClick={logout} title={adminName?`Signed in as ${adminName}`:'Sign out'}><LogOut/><span>Sign out</span></button></div></header>
      {mode==='demo'&&<div className="adminNotice error demoWarning"><AlertTriangle/><span><b>Database not connected.</b> Changes are saved only in this browser and will not appear on the live store. Add the Supabase environment variables to go live.</span></div>}
      {notice&&<NoticeView n={notice} close={()=>setNotice(null)}/>}
      <div className="adminContent">
        {tab==='overview'&&<Overview products={products} categories={categories} banners={banners} active={activeProducts} low={lowStock} offers={offerCount} onGo={setTab}/>}        
        {tab==='products'&&<section><div className="pageToolbar"><div className="toolbarSearch"><Search/><input placeholder="Search product, Arabic name or SKU…" value={query} onChange={e=>setQuery(e.target.value)}/></div><select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)}><option>All</option>{categories.map(c=><option key={c.id} value={c.nameEn}>{c.nameEn}</option>)}</select><button className="adminPrimary" onClick={()=>setEditor({kind:'product',data:blankProduct()})}><Plus/> Add product</button></div><ProductTable items={visibleProducts} onEdit={p=>setEditor({kind:'product',data:clone(p)})} onDuplicate={p=>setEditor({kind:'product',data:{...clone(p),id:'',sku:`${p.sku||'AK'}-COPY`,en:`${p.en} Copy`,sortOrder:999}})} onDelete={id=>remove('product',id)}/></section>}
        {tab==='categories'&&<section><div className="pageToolbar simple"><div><h2>Shop categories</h2><p>Control category names, images, order and visibility.</p></div><button className="adminPrimary" onClick={()=>setEditor({kind:'category',data:blankCategory()})}><Plus/> Add category</button></div><CategoryGrid items={categories} products={products} onEdit={c=>setEditor({kind:'category',data:clone(c)})} onDelete={id=>remove('category',id)}/></section>}
        {tab==='promotions'&&<section><div className="pageToolbar simple"><div><h2>Homepage hero promotions</h2><p>Manage the bright product offer slides shown at the top of the store.</p></div><button className="adminPrimary" onClick={()=>setEditor({kind:'banner',data:blankBanner()})}><Plus/> Add banner</button></div><BannerList items={banners} onEdit={b=>setEditor({kind:'banner',data:clone(b)})} onDelete={id=>remove('banner',id)}/></section>}
        {tab==='ticker'&&<section><div className="pageToolbar simple"><div><h2>Latest products ticker</h2><p>Edit the small scrolling strip below mobile search.</p></div><button className="adminPrimary" onClick={()=>setEditor({kind:'ticker',data:blankTicker()})}><Plus/> Add message</button></div><TickerList items={ticker} onEdit={t=>setEditor({kind:'ticker',data:clone(t)})} onDelete={id=>remove('ticker',id)}/></section>}
        {tab==='settings'&&<SettingsForm value={settings} setValue={setSettings} onSave={saveSettings} busy={busy}/>}      
      </div>
    </main>
    {editor&&<EditorDrawer editor={editor} setEditor={setEditor} categories={categories} busy={busy} save={saveEditor} upload={uploadImage}/>}  
  </div>
}

function NoticeView({n,close}:{n:Notice;close?:()=>void}){if(!n)return null;return <div className={`adminNotice ${n.type}`}>{n.type==='ok'?<CheckCircle2/>:<AlertTriangle/>}<span>{n.text}</span>{close&&<button onClick={close}><X/></button>}</div>}
function Overview({products,categories,banners,active,low,offers,onGo}:{products:Product[];categories:Category[];banners:any[];active:number;low:number;offers:number;onGo:(t:Tab)=>void}){const recent=[...products].sort((a,b)=>(b.sortOrder||0)-(a.sortOrder||0)).slice(0,5);return <><div className="overviewHero"><div><span className="miniEyebrow">STORE CONTROL CENTER</span><h2>Everything needed to run the catalogue.</h2><p>Products, categories, hero offers, ticker messages and business details are managed from one place.</p></div><button className="adminPrimary" onClick={()=>onGo('products')}><Plus/> Add product</button></div><div className="statGrid"><Stat icon={<Package/>} label="Total products" value={products.length}/><Stat icon={<Eye/>} label="Visible products" value={active}/><Stat icon={<AlertTriangle/>} label="Low stock" value={low}/><Stat icon={<BadgePercent/>} label="Products on offer" value={offers}/></div><div className="overviewGrid"><div className="panel"><div className="panelHead"><div><h3>Catalogue snapshot</h3><p>Recently positioned products</p></div><button onClick={()=>onGo('products')}>Manage all</button></div><div className="miniProducts">{recent.map(p=><div key={p.id}><img src={p.image}/><div><strong>{p.en}</strong><span>{p.ar}</span></div><b>{money(p.price)}</b></div>)}</div></div><div className="panel quickPanel"><div className="panelHead"><div><h3>Quick management</h3><p>Jump to the most common updates</p></div></div><button onClick={()=>onGo('categories')}><Boxes/><span><b>{categories.length} categories</b><small>Images & display order</small></span></button><button onClick={()=>onGo('promotions')}><FileImage/><span><b>{banners.length} promotion banners</b><small>Hero offers</small></span></button><button onClick={()=>onGo('ticker')}><Sparkles/><span><b>Scrolling ticker</b><small>Fresh items & latest deals</small></span></button><button onClick={()=>onGo('settings')}><Store/><span><b>Company details</b><small>Phones, address & WhatsApp</small></span></button></div></div></>}
function Stat({icon,label,value}:{icon:React.ReactNode;label:string;value:number}){return <div className="statCard"><div>{icon}</div><span>{label}</span><strong>{value}</strong></div>}

function ProductTable({items,onEdit,onDuplicate,onDelete}:{items:Product[];onEdit:(p:Product)=>void;onDuplicate:(p:Product)=>void;onDelete:(id:string)=>void}){return <div className="tableCard"><div className="tableHeader"><span>Product</span><span>Category</span><span>Stock</span><span>Price</span><span>Status</span><span></span></div>{items.map(p=><div className="productRow" key={p.id}><div className="tableProduct"><img src={p.image||'/images/logo.jpg'}/><div><strong>{p.en}</strong><span>{p.ar}</span><small>{p.sku||'No SKU'} · {p.unit}</small></div></div><span className="categoryPill">{p.category}</span><div className="stockCell"><b>{p.stockQty??0}</b><span className={p.stockStatus||'in_stock'}>{(p.stockStatus||'in_stock').replaceAll('_',' ')}</span></div><div className="priceCell"><strong>{money(p.price)}</strong>{p.oldPrice&&<del>{money(p.oldPrice)}</del>}</div><span className={`statusPill ${p.active===false?'hidden':'live'}`}>{p.active===false?<><EyeOff/> Hidden</>:<><Eye/> Live</>}</span><div className="rowActions"><button title="Edit" onClick={()=>onEdit(p)}>Edit</button><button title="Duplicate" onClick={()=>onDuplicate(p)}><Copy/></button><button className="dangerIcon" title="Delete" onClick={()=>onDelete(p.id)}><Trash2/></button></div></div>)}{!items.length&&<Empty text="No products match your search."/>}</div>}
function CategoryGrid({items,products,onEdit,onDelete}:{items:Category[];products:Product[];onEdit:(c:Category)=>void;onDelete:(id:string)=>void}){return <div className="categoryAdminGrid">{items.map(c=><article key={c.id}><div className="catAdminImage"><img src={c.image||'/images/logo.jpg'}/><span className={c.active?'live':'hidden'}>{c.active?'Live':'Hidden'}</span></div><div className="catAdminBody"><small>ORDER {c.sortOrder}</small><h3>{c.nameEn}</h3><p>{c.nameAr}</p><span>{products.filter(p=>p.category===c.nameEn).length} products</span><div><button onClick={()=>onEdit(c)}>Edit category</button><button className="dangerIcon" onClick={()=>onDelete(c.id)}><Trash2/></button></div></div></article>)}</div>}
function BannerList({items,onEdit,onDelete}:{items:(Banner&{active?:boolean;sortOrder?:number})[];onEdit:(b:any)=>void;onDelete:(id:string)=>void}){return <div className="bannerAdminList">{items.map((b,i)=><article className={`bannerPreview ${b.theme||'sunny'}`} key={b.id}><div className="bannerPreviewCopy"><div><span>{b.tag||'OFFER'} · SLIDE {i+1}</span><h3>{b.en}</h3><p>{b.ar}</p></div><div className="bannerOffer"><b>{b.price||'—'}</b>{b.oldPrice&&<del>{b.oldPrice}</del>}<em>{b.offer}</em></div><div className="bannerButtons"><button onClick={()=>onEdit(b)}>Edit banner</button><button className="dangerIcon" onClick={()=>onDelete(b.id)}><Trash2/></button></div></div><img src={b.image||'/images/logo.jpg'}/></article>)}</div>}
function TickerList({items,onEdit,onDelete}:{items:TickerItem[];onEdit:(t:TickerItem)=>void;onDelete:(id:string)=>void}){return <div className="tickerAdminList"><div className="tickerPreview"><span>LIVE PREVIEW</span><div>{items.filter(x=>x.active).map(x=><b key={x.id}>{x.labelEn} — {x.textEn} <i>◆</i></b>)}</div></div>{items.map(t=><article key={t.id}><span className="tickerLabel">{t.labelEn}</span><div><strong>{t.textEn}</strong><p>{t.textAr}</p></div><span className={`statusPill ${t.active?'live':'hidden'}`}>{t.active?'Live':'Hidden'}</span><button onClick={()=>onEdit(t)}>Edit</button><button className="dangerIcon" onClick={()=>onDelete(t.id)}><Trash2/></button></article>)}</div>}
function SettingsForm({value,setValue,onSave,busy}:{value:StoreSettings;setValue:(s:StoreSettings)=>void;onSave:()=>void;busy:boolean}){const f=(k:keyof StoreSettings)=>(e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>setValue({...value,[k]:e.target.value});return <div className="settingsGrid"><section className="settingsPanel"><div className="settingsHead"><Languages/><div><h2>Bilingual company identity</h2><p>Displayed throughout the storefront.</p></div></div><div className="formGrid"><Field label="Arabic company name"><input dir="rtl" value={value.companyNameAr} onChange={f('companyNameAr')}/></Field><Field label="English company name"><input value={value.companyNameEn} onChange={f('companyNameEn')}/></Field></div></section><section className="settingsPanel"><div className="settingsHead"><Store/><div><h2>Contact & ordering</h2><p>Official details shown to customers.</p></div></div><div className="formGrid"><Field label="WhatsApp orders"><input value={value.whatsapp} onChange={f('whatsapp')}/></Field><Field label="Business phone 1"><input value={value.phone1} onChange={f('phone1')}/></Field><Field label="Business phone 2"><input value={value.phone2} onChange={f('phone2')}/></Field><Field label="Currency"><input value={value.currency} onChange={f('currency')}/></Field><Field label="Arabic address" wide><textarea dir="rtl" value={value.addressAr} onChange={f('addressAr')}/></Field><Field label="English address" wide><textarea value={value.addressEn} onChange={f('addressEn')}/></Field></div></section><section className="settingsPanel"><div className="settingsHead"><SlidersHorizontal/><div><h2>Checkout notes</h2><p>Short information displayed around ordering.</p></div></div><div className="formGrid"><Field label="English delivery note" wide><textarea value={value.deliveryNoteEn} onChange={f('deliveryNoteEn')}/></Field><Field label="Arabic delivery note" wide><textarea dir="rtl" value={value.deliveryNoteAr} onChange={f('deliveryNoteAr')}/></Field></div></section><div className="settingsSave"><button className="adminPrimary" onClick={onSave} disabled={busy}>{busy?'Saving…':'Save store settings'}</button></div></div>}

function EditorDrawer({editor,setEditor,categories,busy,save,upload}:{editor:{kind:string;data:any};setEditor:(v:any)=>void;categories:Category[];busy:boolean;save:()=>void;upload:(file:File,folder:string)=>Promise<string>}){const d=editor.data;const set=(k:string,v:any)=>setEditor({...editor,data:{...d,[k]:v}});const doUpload=async(e:React.ChangeEvent<HTMLInputElement>)=>{const file=e.target.files?.[0];if(!file)return;try{const url=await upload(file,editor.kind);set('image',url)}catch(err:any){alert(err.message||'Upload failed')}};return <div className="drawerBackdrop" onMouseDown={()=>setEditor(null)}><aside className="editorDrawer" onMouseDown={e=>e.stopPropagation()}><header><div><span className="miniEyebrow">{d.id?'EDIT':'CREATE'} {editor.kind.toUpperCase()}</span><h2>{editor.kind==='product'?(d.en||'New product'):editor.kind==='category'?(d.nameEn||'New category'):editor.kind==='banner'?(d.en||'New promotion'):(d.textEn||'New ticker message')}</h2></div><button onClick={()=>setEditor(null)}><X/></button></header><div className="drawerBody">
      {editor.kind==='product'&&<><div className="imageEditor"><div>{d.image?<img src={d.image}/>:<ImagePlus/>}</div><label><UploadCloud/> Upload image<input type="file" accept="image/*" onChange={doUpload}/></label><Field label="or image URL"><input value={d.image||''} onChange={e=>set('image',e.target.value)}/></Field></div><div className="editorGrid"><Field label="English name"><input value={d.en} onChange={e=>set('en',e.target.value)}/></Field><Field label="Arabic name"><input dir="rtl" value={d.ar} onChange={e=>set('ar',e.target.value)}/></Field><Field label="English description" wide><textarea value={d.descriptionEn||''} onChange={e=>set('descriptionEn',e.target.value)}/></Field><Field label="Arabic description" wide><textarea dir="rtl" value={d.descriptionAr||''} onChange={e=>set('descriptionAr',e.target.value)}/></Field><Field label="SKU"><input value={d.sku||''} onChange={e=>set('sku',e.target.value)}/></Field><Field label="Category"><select value={d.category} onChange={e=>set('category',e.target.value)}>{categories.map(c=><option key={c.id}>{c.nameEn}</option>)}</select></Field><Field label="Price (KD)"><input type="number" step="0.001" value={d.price} onChange={e=>set('price',e.target.value)}/></Field><Field label="Old price (optional)"><input type="number" step="0.001" value={d.oldPrice??''} onChange={e=>set('oldPrice',e.target.value)}/></Field><Field label="Selling unit"><input value={d.unit} onChange={e=>set('unit',e.target.value)}/></Field><Field label="Badge"><input placeholder="Fresh / Best seller / Value" value={d.badge||''} onChange={e=>set('badge',e.target.value)}/></Field><Field label="Stock quantity"><input type="number" value={d.stockQty??0} onChange={e=>set('stockQty',e.target.value)}/></Field><Field label="Stock status"><select value={d.stockStatus||'in_stock'} onChange={e=>set('stockStatus',e.target.value)}><option value="in_stock">In stock</option><option value="low_stock">Low stock</option><option value="out_of_stock">Out of stock</option></select></Field><Field label="Weight options (comma separated)" wide><input value={(d.weightOptions||[]).join(', ')} onChange={e=>set('weightOptions',e.target.value.split(',').map((x:string)=>x.trim()).filter(Boolean))}/></Field><Field label="Preparation options (comma separated)" wide><input value={(d.preparationOptions||[]).join(', ')} onChange={e=>set('preparationOptions',e.target.value.split(',').map((x:string)=>x.trim()).filter(Boolean))}/></Field><Field label="Display order"><input type="number" value={d.sortOrder??999} onChange={e=>set('sortOrder',e.target.value)}/></Field><Toggle label="Visible in store" checked={d.active!==false} onChange={v=>set('active',v)}/><Toggle label="Featured product" checked={!!d.featured} onChange={v=>set('featured',v)}/></div></>}
      {editor.kind==='category'&&<><div className="imageEditor"><div>{d.image?<img src={d.image}/>:<ImagePlus/>}</div><label><UploadCloud/> Upload category image<input type="file" accept="image/*" onChange={doUpload}/></label><Field label="or image URL"><input value={d.image||''} onChange={e=>set('image',e.target.value)}/></Field></div><div className="editorGrid"><Field label="English name"><input value={d.nameEn} onChange={e=>set('nameEn',e.target.value)}/></Field><Field label="Arabic name"><input dir="rtl" value={d.nameAr} onChange={e=>set('nameAr',e.target.value)}/></Field><Field label="Slug"><input value={d.slug||''} onChange={e=>set('slug',e.target.value)}/></Field><Field label="Display order"><input type="number" value={d.sortOrder} onChange={e=>set('sortOrder',e.target.value)}/></Field><Field label="English subtitle"><input value={d.subtitleEn||''} onChange={e=>set('subtitleEn',e.target.value)}/></Field><Field label="Arabic subtitle"><input dir="rtl" value={d.subtitleAr||''} onChange={e=>set('subtitleAr',e.target.value)}/></Field><Toggle label="Visible in store" checked={d.active!==false} onChange={v=>set('active',v)}/></div></>}
      {editor.kind==='banner'&&<><div className={`bannerEditorPreview ${d.theme||'sunny'}`}><div><span>{d.tag||'OFFER'}</span><h3>{d.en||'Promotion title'}</h3><b>{d.price||'0.000 KD'}</b><em>{d.offer||'SAVE'}</em></div>{d.image?<img src={d.image}/>:<ImagePlus/>}</div><div className="imageEditor compact"><label><UploadCloud/> Upload banner product image<input type="file" accept="image/*" onChange={doUpload}/></label><Field label="or image URL"><input value={d.image||''} onChange={e=>set('image',e.target.value)}/></Field></div><div className="editorGrid"><Field label="English title"><input value={d.en} onChange={e=>set('en',e.target.value)}/></Field><Field label="Arabic title"><input dir="rtl" value={d.ar} onChange={e=>set('ar',e.target.value)}/></Field><Field label="English description" wide><textarea value={d.subEn||''} onChange={e=>set('subEn',e.target.value)}/></Field><Field label="Arabic description" wide><textarea dir="rtl" value={d.subAr||''} onChange={e=>set('subAr',e.target.value)}/></Field><Field label="Offer tag"><input value={d.tag||''} onChange={e=>set('tag',e.target.value)}/></Field><Field label="Offer badge"><input value={d.offer||''} onChange={e=>set('offer',e.target.value)}/></Field><Field label="Offer price"><input value={d.price||''} onChange={e=>set('price',e.target.value)}/></Field><Field label="Old price"><input value={d.oldPrice||''} onChange={e=>set('oldPrice',e.target.value)}/></Field><Field label="CTA English"><input value={d.ctaEn||''} onChange={e=>set('ctaEn',e.target.value)}/></Field><Field label="CTA Arabic"><input dir="rtl" value={d.ctaAr||''} onChange={e=>set('ctaAr',e.target.value)}/></Field><Field label="Target category"><select value={d.category||''} onChange={e=>set('category',e.target.value)}><option value="">None</option>{categories.map(c=><option key={c.id}>{c.nameEn}</option>)}</select></Field><Field label="Color theme"><select value={d.theme||'sunny'} onChange={e=>set('theme',e.target.value)}><option value="sunny">Sunny yellow</option><option value="mint">Fresh mint</option><option value="peach">Warm peach</option></select></Field><Field label="Display order"><input type="number" value={d.sortOrder??999} onChange={e=>set('sortOrder',e.target.value)}/></Field><Toggle label="Banner active" checked={d.active!==false} onChange={v=>set('active',v)}/></div></>}
      {editor.kind==='ticker'&&<div className="editorGrid"><Field label="Label English"><input value={d.labelEn||''} onChange={e=>set('labelEn',e.target.value)}/></Field><Field label="Label Arabic"><input dir="rtl" value={d.labelAr||''} onChange={e=>set('labelAr',e.target.value)}/></Field><Field label="Message English" wide><input value={d.textEn||''} onChange={e=>set('textEn',e.target.value)}/></Field><Field label="Message Arabic" wide><input dir="rtl" value={d.textAr||''} onChange={e=>set('textAr',e.target.value)}/></Field><Field label="Linked product ID (optional)"><input value={d.productId||''} onChange={e=>set('productId',e.target.value)}/></Field><Field label="Display order"><input type="number" value={d.sortOrder??999} onChange={e=>set('sortOrder',e.target.value)}/></Field><Toggle label="Ticker message active" checked={d.active!==false} onChange={v=>set('active',v)}/></div>}
    </div><footer><button className="adminSecondary" onClick={()=>setEditor(null)}>Cancel</button><button className="adminPrimary" onClick={save} disabled={busy}>{busy?'Saving…':'Save changes'}</button></footer></aside></div>}
function Field({label,children,wide}:{label:string;children:React.ReactNode;wide?:boolean}){return <label className={wide?'wide':''}><span>{label}</span>{children}</label>}
function Toggle({label,checked,onChange}:{label:string;checked:boolean;onChange:(v:boolean)=>void}){return <label className="toggleField"><button type="button" className={checked?'on':''} onClick={()=>onChange(!checked)}><i></i></button><span>{label}</span></label>}
function Empty({text}:{text:string}){return <div className="adminEmpty"><Package/><b>{text}</b></div>}
