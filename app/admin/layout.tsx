import type {Metadata} from 'next';

// The admin is a client component, so its metadata lives here. Keep it out of search results.
export const metadata:Metadata={
  title:'Admin',
  robots:{index:false,follow:false,nocache:true,googleBot:{index:false,follow:false}}
};

export default function AdminLayout({children}:{children:React.ReactNode}){
  return children;
}
