'use client';
import {useEffect,useState} from 'react';
import {Dialog,DialogContent,DialogTitle} from '@/components/ui/dialog';
import {Dumbbell,Quote} from 'lucide-react';
export const openingQuote='Bugün sen basmazsan yarın sana basarlar';
export function DailyMotivation({ready,onStart}:{ready:boolean;onStart:()=>void}){
 const [open,setOpen]=useState(false),[count,setCount]=useState(0),[replay,setReplay]=useState(0);
 useEffect(()=>{if(ready)setOpen(true)},[ready]);
 useEffect(()=>{
  if(!open)return;
  let timer:ReturnType<typeof setTimeout>|undefined,n=0,disposed=false;
  const tick=()=>{if(disposed||document.hidden)return;n++;setCount(n);if(n<openingQuote.length)timer=setTimeout(tick,65)};
  const restart=()=>{clearTimeout(timer);n=0;setCount(0);if(!document.hidden)timer=setTimeout(tick,350)};
  restart();
  const visibility=()=>{if(document.hidden)clearTimeout(timer);else restart()};
  document.addEventListener('visibilitychange',visibility);
  return()=>{disposed=true;clearTimeout(timer);document.removeEventListener('visibilitychange',visibility)};
 },[open,replay]);
 function start(){setOpen(false);onStart()}
 if(!ready)return null;
 return <><button className="daily-banner" onClick={()=>{setCount(0);setOpen(true)}} aria-label="Motivasyon ekranını aç"><Quote size={18}/><span><small>GÜNÜN NOTU · ANONİM</small><span>{openingQuote}</span></span></button>
 <Dialog open={open} onOpenChange={value=>{if(!value)start()}}><DialogContent className="motivation-screen" showCloseButton={false} aria-describedby={undefined} onOpenAutoFocus={e=>e.preventDefault()}>
 <div className="motivation-inner"><div className="motivation-brand"><span className="brandmark"><Dumbbell size={23}/></span><span>SET DEFTERİ</span></div><div className="motivation-copy"><p className="eyebrow">{new Date().toLocaleDateString('tr-TR',{day:'numeric',month:'long'})} · SENİN ZAMANIN</p><DialogTitle className="motivation-title"><span className="sr-only">{openingQuote}</span><span aria-hidden="true">{openingQuote.slice(0,count)}<span className={'typing-caret'+(count>=openingQuote.length?' done':'')}/></span></DialogTitle><div className="motivation-rule"/><p>Anonim</p><button type="button" className="textbtn" onClick={()=>setReplay(v=>v+1)}>Yazıyı yeniden oynat</button></div><button className="primary motivation-start" onClick={start}>Hadi yapalım şu işi</button></div>
 </DialogContent></Dialog></>
}
