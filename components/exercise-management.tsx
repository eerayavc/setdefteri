'use client';
import {useEffect,useRef,useState} from 'react';
import {ImagePlus,Trash2,MoreHorizontal,ChevronRight} from 'lucide-react';
import {AlertDialog,AlertDialogContent,AlertDialogTitle,AlertDialogDescription,AlertDialogCancel,AlertDialogAction} from '@/components/ui/alert-dialog';
import {ExerciseThumbnail} from './exercise-visual';
import {exerciseSummary,type Exercise} from '@/lib/exercises';

async function preparePhoto(file:File){
 if(file.size>20*1024*1024)throw Error('En fazla 20 MB büyüklüğünde bir fotoğraf seç.');
 const url=URL.createObjectURL(file);
 try{
  const image=new Image();await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(Error('Fotoğraf açılamadı. JPG, PNG veya WebP biçiminde bir fotoğraf seç.'));image.src=url});
  if(!image.naturalWidth||!image.naturalHeight)throw Error('Geçerli bir fotoğraf seç.');
  const canvas=document.createElement('canvas');const ratio=Math.min(1,800/Math.max(image.naturalWidth,image.naturalHeight));canvas.width=Math.max(1,Math.round(image.naturalWidth*ratio));canvas.height=Math.max(1,Math.round(image.naturalHeight*ratio));
  const ctx=canvas.getContext('2d');if(!ctx)throw Error('Fotoğraf hazırlanamadı.');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);
  for(const quality of [.8,.65,.5,.35]){const data=canvas.toDataURL('image/jpeg',quality);if(data.length<=150000)return data}
  throw Error('Fotoğraf çok ayrıntılı. Kırpıp yeniden seçmeyi dene.');
 }finally{URL.revokeObjectURL(url)}
}
export function PhotoPicker({value,onChange,onBusyChange}:{value?:string|null;onChange:(value:string|null|undefined)=>void;onBusyChange?:(busy:boolean)=>void}){
 const input=useRef<HTMLInputElement>(null);const [busy,setBusy]=useState(false);const [error,setError]=useState('');const ticket=useRef(0);
 useEffect(()=>()=>{ticket.current++;onBusyChange?.(false)},[]);
 async function pick(file?:File){if(!file)return;const id=++ticket.current;setBusy(true);onBusyChange?.(true);setError('');try{const data=await preparePhoto(file);if(id===ticket.current)onChange(data)}catch(e){setError((e as Error).message)}finally{if(id===ticket.current){setBusy(false);onBusyChange?.(false)}if(input.current)input.current.value=''}}
 return <div className="photo-picker"><input ref={input} type="file" accept="image/*" hidden onChange={e=>void pick(e.target.files?.[0])}/>{value&&<img className="photo-preview" src={value} alt="Seçilen hareket fotoğrafı"/>}<div className="photo-actions"><button type="button" className="outline" disabled={busy} onClick={()=>input.current?.click()}><ImagePlus size={18}/>{busy?'Fotoğraf hazırlanıyor…':value?'Fotoğrafı değiştir':'Telefondan fotoğraf ekle'}</button><button type="button" className="outline" disabled={busy||value===null} onClick={()=>onChange(null)}><Trash2 size={17}/>Görseli kaldır</button>{value!==undefined&&<button type="button" className="textbtn" disabled={busy} onClick={()=>onChange(undefined)}>Katalog görseline dön</button>}</div><p className="method-note">Fotoğraf yer kaplamaması için küçültülür ve antrenman kayıtlarınla birlikte yedeklenir.</p>{error&&<p className="formerror" role="alert">{error}</p>}</div>;
}
export function SwipeExercise({exercise,onChoose,onDelete}:{exercise:Exercise;onChoose:()=>void;onDelete:()=>void}){
 const [open,setOpen]=useState(false);const gesture=useRef<{x:number;y:number;dragged:boolean}|null>(null);const blockClick=useRef(false);
 return <div className={'swipe-exercise'+(open?' swipe-open':'')} onPointerDown={e=>{gesture.current={x:e.clientX,y:e.clientY,dragged:false};blockClick.current=false}} onPointerMove={e=>{const g=gesture.current;if(!g)return;const dx=e.clientX-g.x,dy=e.clientY-g.y;if(Math.abs(dx)>25&&Math.abs(dx)>Math.abs(dy)*1.5){g.dragged=true;blockClick.current=true;setOpen(dx<0)}}} onPointerUp={()=>{gesture.current=null}} onPointerCancel={()=>{gesture.current=null}}>
 <button type="button" className="swipe-delete" aria-label={exercise.name+' hareketini listeden sil'} tabIndex={open?0:-1} aria-hidden={!open} onClick={onDelete}><Trash2 size={20}/>Sil</button>
 <div className="swipe-foreground"><button type="button" className="exercise" onClick={()=>{if(blockClick.current){blockClick.current=false;return}if(open){setOpen(false);return}onChoose()}}><ExerciseThumbnail key={exercise.id+exercise.updated} exercise={exercise}/><span className="exercise-list-copy"><strong>{exercise.name}</strong><small>{exerciseSummary(exercise)}</small></span><ChevronRight size={18}/></button><button type="button" className="swipe-menu" aria-label={exercise.name+' için silme seçeneği'} aria-expanded={open} onClick={()=>{if(!blockClick.current)setOpen(!open)}}><MoreHorizontal size={20}/></button></div>
 </div>;
}
export function DeleteExercise({exercise,onClose,onDelete,permanent=false}:{permanent?:boolean;exercise:Exercise;onClose:()=>void;onDelete:()=>void}){
 return <AlertDialog open onOpenChange={o=>{if(!o)onClose()}}><AlertDialogContent className="delete-confirm"><AlertDialogTitle>{permanent?'Hareket kalıcı olarak kaldırılsın mı?':'Hareket listeden silinsin mi?'}</AlertDialogTitle><AlertDialogDescription>{permanent?`“${exercise.name}” silinenler listesinden de kaldırılacak. Yüklediğin fotoğraf silinecek ve buradan geri getirilemeyecek. Eski antrenmanlarındaki hareket adı, setler ve gelişim kayıtları korunacak.`:`“${exercise.name}” yeni hareket seçimlerinde görünmeyecek. Eski antrenmanların, setlerin ve gelişim kayıtların korunacak.`}</AlertDialogDescription><div className="edit-actions"><AlertDialogCancel className="outline">Vazgeç</AlertDialogCancel><AlertDialogAction className="danger-button" onClick={onDelete}>{permanent?'Kalıcı olarak kaldır':'Listeden sil'}</AlertDialogAction></div></AlertDialogContent></AlertDialog>;
}
