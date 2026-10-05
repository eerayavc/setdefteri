'use client';
import {useState} from 'react';
import {ImageOff} from 'lucide-react';
import {normalizeSearch} from '@/lib/exercise-search';
import type {Exercise} from '@/lib/exercises';
import {referenceExercise,type TargetSelection} from '@/lib/muscle-targets';
import pictures from '@/lib/exercise-images.json';
type Picture={src:string;author:string;source:string;license:string;licenseUrl:string};
const catalog=pictures as Record<string,{images:Picture[];note?:string}>;
function visual(exercise:Exercise,selection:TargetSelection={}){
 if(exercise.photoData===null)return undefined;
 if(exercise.photoData)return {images:[{src:exercise.photoData,author:'Kendi fotoğrafın',source:'',license:'',licenseUrl:''}],note:'Telefonundan eklediğin fotoğraf.'};
 const name=normalizeSearch(exercise.name);
 const aliases:Record<string,string>={
  'dumbbell lateral raise':'Lateral Raise','dumbell lateral raise':'Lateral Raise','dumbbell side lateral raise':'Lateral Raise','reverse peck deck':'Reverse Pec Deck',
  'glute bridge':'Glute Bridge (Matta Kalça Köprüsü)','kalca koprusu':'Glute Bridge (Matta Kalça Köprüsü)','matta kalca koprusu':'Glute Bridge (Matta Kalça Köprüsü)',
  'sit-up':'Sit-up (Mekik)','sit up':'Sit-up (Mekik)','mekik':'Sit-up (Mekik)',
  'side plank':'Side Plank (Yan Plank)','yan plank':'Side Plank (Yan Plank)','plank':'Plank',
 };
 const reference=referenceExercise(exercise,selection)?.name;
 return catalog[(selection.targetExerciseId?reference:aliases[name]||reference)||exercise.name];
}
export function ExerciseThumbnail({exercise}:{exercise:Exercise}){
 const item=visual(exercise);const [failed,setFailed]=useState(false);
 return <span className="exercise-thumbnail">{item&&!failed?<img src={item.images[0].src} width={72} height={72} loading="lazy" decoding="async" alt="" onError={()=>setFailed(true)}/>:<span className="exercise-image-missing"><ImageOff size={20}/><small>Görsel yok</small></span>}</span>;
}
export function ExerciseGallery({exercise,selection={}}:{exercise:Exercise;selection?:TargetSelection}){
 const item=visual(exercise,selection);const [index,setIndex]=useState(0);const [failed,setFailed]=useState('');
 if(!item)return <div className="exercise-no-picture"><ImageOff size={20}/><p>{exercise.photoData===null?'Bu hareketin görselini kaldırdın.':'Bu hareket için doğrulanmış görsel henüz yok.'}</p><a href={'https://www.google.com/search?tbm=isch&q='+encodeURIComponent(exercise.name+' exercise')} target="_blank" rel="noreferrer">İnternette görsellerini ara</a></div>;
 const current=item.images[index]||item.images[0];
 return <section className="exercise-gallery" aria-label={exercise.name+' görselleri'}>
 <div className="exercise-gallery-image">{failed!==current.src?<img src={current.src} alt={exercise.name+' — örnek uygulama, görsel '+(index+1)} width={480} height={360} decoding="async" onError={()=>setFailed(current.src)}/>:<p>Görsel yüklenemedi. İnternete bağlanıp yeniden açabilirsin.</p>}</div>
 {item.images.length>1&&<div className="exercise-image-tabs" aria-label="Hareketin pozisyonları">{item.images.map((p,i)=><button type="button" key={p.src} aria-pressed={index===i} onClick={()=>setIndex(i)}>Görsel {i+1}</button>)}</div>}
 <p className="exercise-image-note">{item.note||'Örnek uygulama. Makine modeli ve tutuş biçimi değişebilir.'}</p>
 {current.source&&<details className="exercise-image-credit"><summary>Görsel kaynağı</summary><p>{current.author} · <a href={current.licenseUrl} target="_blank" rel="noreferrer">{current.license}</a></p><a href={current.source} target="_blank" rel="noreferrer">Orijinal görsel</a><p>Görseller küçültülüp WebP biçimine dönüştürüldü; şeffaf çizimlere arka plan eklendi.</p></details>}
 </section>;
}
