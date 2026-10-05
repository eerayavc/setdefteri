import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata={title:'Set Defteri',description:'Antrenmanını kaydet. Gelişimini gör.',manifest:'/manifest.webmanifest',appleWebApp:{capable:true,statusBarStyle:'black-translucent',title:'Set Defteri'},icons:{icon:'/favicon.svg',apple:'/icon-192.png'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="tr"><head><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/><meta name="theme-color" content="#111513"/></head><body>{children}</body></html>}
