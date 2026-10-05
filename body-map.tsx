'use client';
import {useId,useState} from 'react';
import {silhouette,frontRegions,backRegions} from '@/lib/body-map';
import {muscleLabels,workoutTargets,type Muscle} from '@/lib/muscle-targets';
import {MuscleSources} from './muscle-info';
import type {Workout} from '@/lib/training';
import type {Exercise} from '@/lib/exercises';
export function BodyMap({workout,exercises}:{workout:Workout;exercises:Exercise[]}){
 const {muscles,unknown}=workoutTargets(workout,exercises);const id=useId();const [selected,setSelected]=useState<Muscle|null>(null);
 const active=selected&&muscles.has(selected)?selected:[...muscles.keys()][0];
 const state=(m:Muscle)=>{const rows=muscles.get(m)||[];return rows.some(r=>r.emphasis)?'emphasis':rows.some(r=>r.role==='primary')?'primary':rows.length?'secondary':'inactive'};
 return <section className="body-map" aria-labelledby={id+'-heading'}><div className="sectionhead"><h3 id={id+'-heading'}>Kas haritan</h3></div><p className="body-map-note">Bir bölgeye veya aşağıdaki adına dokun; hangi hareketlerin katkı verdiğini gör.</p>
 <div className="muscle-map-key"><span className="key-primary">Ana hedef</span><span className="key-emphasis">Bölgesel vurgu</span><span className="key-secondary">Yardımcı</span></div>
 <div className="body-map-views">{[{name:'ÖNDEN',regions:frontRegions},{name:'ARKADAN',regions:backRegions}].map((view,i)=><figure key={view.name}><svg viewBox="0 0 200 400" role="group" aria-labelledby={id+'-view-'+i}><title id={id+'-view-'+i}>{view.name.toLocaleLowerCase('tr')} kas haritası; bölge adları aşağıdaki düğmelerde de bulunur.</title><ellipse cx="100" cy="32" rx="20" ry="26" className="body-base"/><path d={silhouette} className="body-base"/>{view.regions.map((region,j)=>{const muscle=region.group as Muscle;const enabled=muscles.has(muscle);return <path key={j} d={region.d} className={'body-region target-'+state(muscle)+(active===muscle?' selected-muscle':'')} role={enabled?'button':undefined} tabIndex={enabled?0:undefined} aria-label={muscleLabels[muscle]} aria-pressed={enabled?active===muscle:undefined} onClick={()=>enabled&&setSelected(muscle)} onKeyDown={e=>{if(enabled&&(e.key==='Enter'||e.key===' ')){e.preventDefault();setSelected(muscle)}}}><title>{muscleLabels[muscle]}</title></path>})}</svg><figcaption>{view.name}</figcaption></figure>)}</div>
 <div className="muscle-region-buttons">{[...muscles.keys()].map(m=><button type="button" key={m} className={'target-'+state(m)} aria-pressed={active===m} onClick={()=>setSelected(m)}>{muscleLabels[m]}</button>)}</div>
 {active&&<div className="muscle-contributions" aria-live="polite"><h4>{muscleLabels[active]}</h4>{muscles.get(active)!.map((row,i)=><div key={row.exerciseId+i}><strong>{row.name}</strong><span>{row.sets} set · {row.role==='primary'?'Ana hedef':'Yardımcı katkı'}{row.emphasis?' · Bölgesel vurgu':''}</span></div>)}{muscles.get(active)!.some(r=>r.emphasis)&&<p>Vurgu, bu kasın diğer bölümlerinin çalışmadığı anlamına gelmez.</p>}</div>}
 {unknown.length>0&&<p className="body-map-empty">Hedef bilgisi belirlenmemiş: {unknown.join(', ')}. Antrenmanı düzenleyip katalog karşılığını seçebilirsin.</p>}
 {!muscles.size&&!unknown.length&&<p className="body-map-empty">Bu antrenmanda ağırlık seti yok. Kardiyodan kas haritası çıkarılmaz.</p>}
 <MuscleSources/>
 </section>;
}
