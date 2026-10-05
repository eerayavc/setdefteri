'use client';
import {useState} from 'react';
import {Choice} from './training-panels';
import {matOptions,strengthOptions,type CalorieInfo,type Workout,setMode} from '@/lib/training';
export function EnergyFields({value,onChange,workout,part='all'}:{part?:'all'|'general'|'mat';value:CalorieInfo;onChange:(value:CalorieInfo)=>void;workout:Workout}){
 const [raw,setRaw]=useState<Record<string,string>>({});
 const hasSets=workout.entries.some(e=>e.sets.length);
 const timedSeconds=workout.entries.flatMap(e=>e.sets).filter(s=>setMode(s)==='timed').reduce((sum,s)=>sum+(s.seconds||0),0);
 function field(key:'weight'|'strengthMinutes'|'matMinutes',label:string){return <label className="formfield">{label}<input required inputMode="decimal" value={raw[key]??String(value[key]??0)} onChange={e=>{const input=e.target.value;setRaw(r=>({...r,[key]:input}));onChange({...value,method:'met-net-v2',matMinutes:value.matMinutes||0,matMet:value.matMet||2.8,[key]:input.trim()===''?NaN:Number(input.replace(',','.'))})}}/></label>}
 return <>{part!=='mat'&&field('weight','Antrenman günündeki kilo (kg)')}{hasSets&&<>
 {part!=='mat'&&<section className="energy-section"><h3>Ağırlık çalışması</h3>{field('strengthMinutes','Ağırlık süresi (dakika)')}<Choice label="Ağırlık çalışmasının türü" value={String(value.strengthMet)} items={strengthOptions} onChange={v=>onChange({...value,strengthMet:Number(v)})}/><p className="method-note">Normal set arası dinlenmeler dâhil. Uzun molaları, mat çalışmasını ve kardiyoyu çıkar. Yapmadıysan 0 bırak.</p></section>}
 {part!=='general'&&<section className="energy-section"><h3>Mat / Vücut ağırlığı</h3>{field('matMinutes','Mat / vücut ağırlığı süresi (dakika)')}<Choice label="Mat ve vücut ağırlığı çalışma türü" value={String(value.matMet||2.8)} items={matOptions} onChange={v=>onChange({...value,method:'met-net-v2',matMinutes:value.matMinutes||0,matMet:Number(v)})}/><p className="method-note">Hareket ettiğin süreyi gir; molaları çıkar. 30 saniye = 0,5 dakika. Aynı süreyi ağırlık alanına tekrar ekleme. Yapmadıysan 0 bırak.</p>{timedSeconds>0&&<p className="method-note">Süreyle kaydettiğin setlerin toplamı: {timedSeconds} sn ({(timedSeconds/60).toLocaleString('tr-TR',{maximumFractionDigits:2})} dk). Tekrarla kaydettiğin hareketlerin süresini de hesaba kat.</p>}</section>}
 </>}<p className="method-note">Hareket adı ve set kilosu tek başına enerji harcamasını belirlemez. Süreyi veya çalışma türünü değiştirince tahmin güncellenir.</p></>;
}
export function validEnergyDuration(w:Workout){return !w.entries.some(e=>e.sets.length)||(w.calorie?.strengthMinutes||0)+(w.calorie?.matMinutes||0)>0}
