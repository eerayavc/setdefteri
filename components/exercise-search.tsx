'use client';
import {useEffect,useId,useRef,useState,type CSSProperties} from 'react';
import {Dialog,DialogContent,DialogTitle,DialogTrigger} from '@/components/ui/dialog';
import {Command,CommandInput,CommandList,CommandItem,CommandEmpty} from '@/components/ui/command';
import {Search,Check,X} from 'lucide-react';
import {ExerciseThumbnail} from './exercise-visual';
import {searchExercises} from '@/lib/exercise-search';
import {visibleExercises,exerciseSummary,type Exercise} from '@/lib/exercises';

export function ExerciseSearch({exercises,onChoose,selectedId,label,restoreFocusOnChoose=false,includeArchived=false}:{exercises:Exercise[];onChoose:(id:string)=>void;selectedId?:string;label:string;restoreFocusOnChoose?:boolean;includeArchived?:boolean}){
 const id=useId();
 const [open,setOpen]=useState(false);
 const [query,setQuery]=useState('');
 const [viewport,setViewport]=useState<CSSProperties>({});
 const choosing=useRef(false);
 const input=useRef<HTMLInputElement>(null);
 const selected=exercises.find(e=>e.id===selectedId);
 const results=searchExercises(includeArchived?exercises:visibleExercises(exercises),query);
 useEffect(()=>{
  if(!open)return;
  const vv=window.visualViewport;
  const update=()=>setViewport({'--picker-height':`${vv?.height??window.innerHeight}px`,'--picker-top':`${vv?.offsetTop??0}px`} as CSSProperties);
  update();
  vv?.addEventListener('resize',update);
  vv?.addEventListener('scroll',update);
  window.addEventListener('resize',update);
  return()=>{vv?.removeEventListener('resize',update);vv?.removeEventListener('scroll',update);window.removeEventListener('resize',update)};
 },[open]);
 const choose=(exerciseId:string)=>{
  choosing.current=true;
  input.current?.blur();
  setOpen(false);
  onChoose(exerciseId);
 };
 return <div className="exercise-search">
  <span id={id} className="exercise-search-label">{label}</span>
  <Dialog open={open} onOpenChange={value=>{setOpen(value);if(value){setQuery('');choosing.current=false}}}>
   <DialogTrigger asChild><button type="button" className="exercise-search-trigger" aria-labelledby={id}>
    <Search size={20}/><span>{selected?.name||'Hareket ara… örn. chest, row'}</span><span className="exercise-search-action">Ara</span>
   </button></DialogTrigger>
   <DialogContent className="exercise-picker" overlayClassName="exercise-picker-overlay" style={viewport} showCloseButton={false} aria-describedby={undefined}
    onOpenAutoFocus={event=>{event.preventDefault();input.current?.focus({preventScroll:true})}}
    onCloseAutoFocus={event=>{if(choosing.current&&!restoreFocusOnChoose)event.preventDefault()}}>
    <div className="exercise-picker-heading"><DialogTitle>{label}</DialogTitle><button type="button" aria-label="Aramayı kapat" onClick={()=>setOpen(false)}><X size={22}/></button></div>
    <Command shouldFilter={false} label={label}>
     <CommandInput ref={input} value={query} onValueChange={setQuery} placeholder="Hareket veya bölge ara…" aria-label="Hareket veya bölge ara" autoComplete="off" autoCorrect="off" spellCheck={false}/>
     <div className="exercise-picker-count" aria-live="polite">{results.length} hareket</div>
     <CommandList aria-label="Hareketler">
      <CommandEmpty>Hareket bulunamadı. Başka bir ad veya bölge dene.</CommandEmpty>
      {results.map(e=><CommandItem key={e.id} value={e.id} onSelect={()=>choose(e.id)}>
       <ExerciseThumbnail key={e.id+e.updated} exercise={e}/><span className="exercise-result-copy"><strong>{e.name}</strong><small>{e.group} · {exerciseSummary(e)}</small></span>{selectedId===e.id&&<Check size={20} aria-label="Seçili"/>}
      </CommandItem>)}
     </CommandList>
    </Command>
   </DialogContent>
  </Dialog>
 </div>;
}
