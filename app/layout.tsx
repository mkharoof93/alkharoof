import './style.css';
import type {Metadata, Viewport} from 'next';
import {seedSettings} from '../lib/data';
import {siteUrl} from '../lib/site';

const title='Al Kharoof Butchery – ملحمة الخروف | Fresh Halal Meat in Kuwait';
const description='Fresh halal lamb, beef, chicken and offal from Al Kharoof Butchery in West Abu Fatira, Kuwait. Pick your cut and weight, then order in one WhatsApp message.';

export const metadata:Metadata={
  metadataBase:new URL(siteUrl),
  title:{default:title,template:'%s | Al Kharoof Butchery'},
  description,
  applicationName:'Al Kharoof Butchery',
  keywords:['butchery Kuwait','halal meat Kuwait','fresh lamb Kuwait','meat delivery Kuwait','Abu Fatira butcher','Mubarak Al-Kabeer butchery','ملحمة الخروف','ملحمة الكويت','لحم غنم طازج','لحوم حلال الكويت','ملحمة أبو فطيرة','توصيل لحوم الكويت'],
  alternates:{canonical:'/'},
  manifest:'/manifest.webmanifest',
  openGraph:{type:'website',url:'/',siteName:'Al Kharoof Butchery Co.',title,description,locale:'en_KW',alternateLocale:['ar_KW']},
  twitter:{card:'summary_large_image',title,description},
  robots:{index:true,follow:true,googleBot:{index:true,follow:true,'max-image-preview':'large','max-snippet':-1}},
  category:'food'
};
export const viewport:Viewport={themeColor:'#063b26',width:'device-width',initialScale:1,viewportFit:'cover'};

// Local business structured data so Google can show the shop's name, address and phone.
const s=seedSettings;
const jsonLd={
  '@context':'https://schema.org',
  '@type':'ButcherShop',
  '@id':`${siteUrl}/#business`,
  name:s.companyNameEn,
  alternateName:s.companyNameAr,
  url:siteUrl,
  logo:`${siteUrl}/images/logo.jpg`,
  image:`${siteUrl}/opengraph-image.jpg`,
  description,
  telephone:s.phone1,
  address:{'@type':'PostalAddress',streetAddress:'Building No. 119, Shop No. 5, West Abu Fatira Craft Area',addressLocality:'West Abu Fatira',addressRegion:'Mubarak Al-Kabeer',addressCountry:'KW'},
  areaServed:{'@type':'Country',name:'Kuwait'},
  currenciesAccepted:s.currency,
  servesCuisine:'Halal',
  contactPoint:[
    {'@type':'ContactPoint',contactType:'sales',telephone:s.whatsapp,availableLanguage:['English','Arabic'],url:`https://wa.me/${s.whatsapp.replace(/\D/g,'')}`},
    {'@type':'ContactPoint',contactType:'customer service',telephone:s.phone2,availableLanguage:['English','Arabic']}
  ]
};

export default function Root({children}:{children:React.ReactNode}){
  return <html lang="en"><body>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd).replace(/</g,'\\u003c')}}/>
    {children}
  </body></html>
}
