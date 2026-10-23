import {revalidatePath, revalidateTag, unstable_cache} from 'next/cache';
import {db} from './db';
import {Banner, Category, Product, StoreSettings, TickerItem, seedBanners, seedCategories, seedProducts, seedSettings, seedTickerItems} from './data';

export type StoreData = {products: Product[]; categories: Category[]; banners: Banner[]; ticker: TickerItem[]; settings: StoreSettings};

const STORE_TAG = 'store';

const seedStore = (): StoreData => ({products: seedProducts, categories: seedCategories, banners: seedBanners, ticker: seedTickerItems, settings: seedSettings});

// One cached snapshot of everything the storefront shows. Supabase is only queried when the
// cache is empty, after an admin change (refreshStore) or once the hourly safety window expires,
// which keeps database egress far inside the free tier no matter how many people visit.
const loadStore = unstable_cache(async (): Promise<StoreData> => {
  const d = db();
  if (!d) return seedStore();
  const live = <T,>(rows: T[] | null) => (rows || []).filter((r: any) => r.active !== false);
  const [p, c, b, t, s] = await Promise.all([
    d.from('products').select('*').order('sortOrder', {ascending: true}),
    d.from('categories').select('*').order('sortOrder', {ascending: true}),
    d.from('banners').select('*').order('sortOrder', {ascending: true}),
    d.from('ticker_items').select('*').order('sortOrder', {ascending: true}),
    d.from('store_settings').select('*').eq('id', 'store').maybeSingle(),
  ]);
  // Throwing (instead of falling back to seed data) keeps the last good page online if Supabase is unreachable.
  const err = p.error || c.error || b.error || t.error || s.error;
  if (err) throw new Error(`Supabase read failed: ${err.message}`);
  return {products: live(p.data), categories: live(c.data), banners: live(b.data), ticker: live(t.data), settings: (s.data as StoreSettings) || seedSettings};
}, ['store-data'], {tags: [STORE_TAG], revalidate: 3600});

export const getStoreData = loadStore;

// Call after every successful admin write so the storefront shows the change on the next page load.
export function refreshStore() {
  revalidateTag(STORE_TAG);
  revalidatePath('/');
}
