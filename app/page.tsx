import StoreFront from './StoreFront';
import {getStoreData} from '../lib/store';

// Statically generated and served from Vercel's CDN. Admin writes call refreshStore(),
// which regenerates this page immediately; the hourly window is only a safety net.
export const revalidate = 3600;

export default async function Page(){
  return <StoreFront initial={await getStoreData()}/>;
}
