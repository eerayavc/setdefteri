import {defaults,trackingFor,type Exercise,type TrackingMode} from './exercises';
export type Profile={id:'user-profile-v1';kind:'profile';weight:number;height:number;age:number;updated:number};
export type Cardio={id:string;type:string;label:string;optionId:string;effort:string;met:number;minutes:number};
export type SetEntry={id:string;weight:number;reps:number;mode?:TrackingMode;seconds?:number};
export type Entry={exerciseId:string;sets:SetEntry[];targetExerciseId?:string;targetVariant?:string};
export type CalorieInfo={weight:number;height:number;age:number;strengthMinutes:number;strengthMet:number;method:'met-net-v1'|'met-net-v2';matMinutes?:number;matMet?:number};
export type Workout={id:string;kind:'workout';date:string;ended?:string;deleted?:boolean;entries:Entry[];cardio?:Cardio[];calorie?:CalorieInfo;updated:number};
export type RecordItem=Exercise|Workout|Profile;
export const cardioTypes=[
 {id:'walking',label:'Yürüme',options:[{id:'walk-slow',label:'Düz zemin · yavaş (3,2–3,9 km/sa)',met:2.8},{id:'walk-medium',label:'Düz zemin · normal (4,5–5,5 km/sa)',met:3.8},{id:'walk-brisk',label:'Düz zemin · tempolu (5,6–6,3 km/sa)',met:4.8},{id:'walk-hill',label:'Yokuş · %6–10 eğim, orta tempo',met:7}]},
 {id:'cycling',label:'Bisiklet',options:[{id:'bike-indoor-light',label:'Sabit bisiklet · hafif (50 watt)',met:4},{id:'bike-indoor-medium',label:'Sabit bisiklet · orta (90–100 watt)',met:6},{id:'bike-indoor-hard',label:'Sabit bisiklet · yüksek (126–150 watt)',met:8},{id:'bike-outdoor-light',label:'Dışarıda · rahat (<16 km/sa)',met:4},{id:'bike-outdoor-medium',label:'Dışarıda · 16–19 km/sa',met:6.8}]},
 {id:'swimming',label:'Yüzme',options:[{id:'swim-easy',label:'Serbest stil · yavaş / rahat',met:5.8},{id:'swim-medium',label:'Krawl · orta hız (yaklaşık 46 m/dk)',met:8},{id:'swim-hard',label:'Serbest stil · hızlı / yoğun',met:9.8},{id:'swim-breast',label:'Kurbağalama · rahat',met:5.3}]},
 {id:'running',label:'Koşma',options:[{id:'run-slow',label:'Düz zemin · 6,4–6,8 km/sa',met:6.5},{id:'run-medium',label:'Düz zemin · 8–8,4 km/sa',met:8.5},{id:'run-fast',label:'Düz zemin · 9,7–10,1 km/sa',met:9.3},{id:'run-faster',label:'Düz zemin · yaklaşık 12 km/sa',met:11.8}]},
];
export const strengthOptions=[{id:'3.5',label:'Standart ağırlık antrenmanı',met:3.5},{id:'5',label:'Squat / deadlift ağırlıklı çalışma',met:5},{id:'6',label:'Yoğun ağırlık antrenmanı',met:6}];
// Adult Compendium 2024; gross = MET * 3.5 * kg / 200 * minutes.
// Net / active expenditure removes the standard 1-MET resting baseline.
// Height and age are retained as profile context, not spurious formula multipliers.
export function activeCalories(met:number,weight:number,minutes:number){if(![met,weight,minutes].every(Number.isFinite)||met<1||weight<=0||minutes<0)return 0;return (met-1)*3.5*weight/200*minutes}
export function setMode(s:SetEntry):TrackingMode{return s.mode||(s.seconds!==undefined?'timed':'weighted')}
export function setLabel(s:SetEntry){const m=setMode(s);return m==='timed'?`${s.seconds} sn`:m==='bodyweight'?`${s.reps} tekrar (vücut ağırlığı)`:`${s.weight.toLocaleString('tr-TR')} kg × ${s.reps}`}
export function setMetric(s:SetEntry,mode:TrackingMode){return mode==='timed'?s.seconds||0:mode==='bodyweight'?s.reps:s.weight}
export function caloriesFor(w:Workout){
 if(w.deleted||!w.calorie)return null;
 const c=w.calorie,hasSets=w.entries.some(e=>e.sets.length);
 const strengthMinutes=hasSets?c.strengthMinutes:0,matMinutes=hasSets&&c.method==='met-net-v2'?c.matMinutes||0:0;
 const resistance=Math.round(activeCalories(c.strengthMet,c.weight,strengthMinutes));
 const mat=Math.round(activeCalories(c.matMet||2.8,c.weight,matMinutes));
 const cardio=Math.round((w.cardio||[]).reduce((s,x)=>s+activeCalories(x.met,c.weight,x.minutes),0));
 return {resistance,mat,strength:resistance+mat,cardio,total:resistance+mat+cardio,minutes:strengthMinutes+matMinutes+(w.cardio||[]).reduce((s,x)=>s+x.minutes,0)};
}
export const matOptions=[{id:'2.8',label:'Hafif mat · crunch, plank',met:2.8},{id:'3',label:'Vücut ağırlığı · genel çalışma',met:3},{id:'3.8',label:'Vücut ağırlığı · orta efor',met:3.8},{id:'6.5',label:'Vücut ağırlığı · yüksek yoğunluk',met:6.5}];
export function dailyCalories(workouts:Workout[]){const map=new Map<string,{key:string;date:string;total:number;strength:number;cardio:number;count:number}>();for(const w of workouts){if(!w.ended||w.deleted)continue;const c=caloriesFor(w);if(!c)continue;const d=new Date(w.date);const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;const old=map.get(key)||{key,date:w.date,total:0,strength:0,cardio:0,count:0};old.total+=c.total;old.strength+=c.strength;old.cardio+=c.cardio;old.count++;map.set(key,old)}return [...map.values()].sort((a,b)=>a.key.localeCompare(b.key))}
const finite=(v:unknown,min:number,max:number)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
export function isRecord(r:any):r is RecordItem {
 if(!r||typeof r.id!=='string'||r.id.length<1||r.id.length>100||!Number.isSafeInteger(r.updated)||r.updated<0)return false;
 if(r.kind==='profile')return r.id==='user-profile-v1'&&finite(r.weight,20,400)&&finite(r.height,100,250)&&Number.isInteger(r.age)&&finite(r.age,18,100);
 if(r.kind==='exercise')return typeof r.name==='string'&&r.name.length>0&&r.name.length<=80&&['Göğüs','Sırt','Omuz','Biceps','Triceps','Bacak','Karın'].includes(r.group)&&typeof r.unit==='string'&&(r.deleted===undefined||typeof r.deleted==='boolean')&&(r.tracking===undefined||['weighted','bodyweight','timed'].includes(r.tracking))&&(r.archived===undefined||typeof r.archived==='boolean')&&(r.photoData===undefined||r.photoData===null||(typeof r.photoData==='string'&&r.photoData.length<=150000&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(r.photoData)));
 if(r.kind!=='workout'||typeof r.date!=='string'||!Number.isFinite(Date.parse(r.date))||!Array.isArray(r.entries))return false;
 if(r.deleted!==undefined&&typeof r.deleted!=='boolean')return false;
 if(r.ended!==undefined&&(typeof r.ended!=='string'||!Number.isFinite(Date.parse(r.ended))))return false;
 if(!r.entries.every((e:any)=>typeof e.exerciseId==='string'&&Array.isArray(e.sets)&&e.sets.every((s:any)=>typeof s.id==='string'&&finite(s.weight,0,2000)&&Number.isInteger(s.reps)&&finite(s.reps,1,1000)&&(s.mode===undefined||['weighted','bodyweight','timed'].includes(s.mode))&&(s.seconds===undefined||Number.isInteger(s.seconds)&&finite(s.seconds,1,36000))&&(s.mode!=='timed'||s.seconds!==undefined&&s.weight===0)&&(s.mode!=='bodyweight'||s.weight===0))))return false;
 if(!r.entries.every((e:any)=>(e.targetExerciseId===undefined||defaults.some(x=>x.id===e.targetExerciseId))&&(e.targetVariant===undefined||['unspecified','flat','incline','decline','fly-level','fly-up','fly-down'].includes(e.targetVariant))))return false;
 if(r.cardio!==undefined&&(!Array.isArray(r.cardio)||!r.cardio.every((c:any)=>typeof c.id==='string'&&typeof c.type==='string'&&typeof c.label==='string'&&typeof c.effort==='string'&&typeof c.optionId==='string'&&finite(c.met,1,25)&&finite(c.minutes,1,600))))return false;
 if(r.calorie!==undefined){const c=r.calorie;if(!c||!['met-net-v1','met-net-v2'].includes(c.method)||!finite(c.weight,20,400)||!finite(c.height,100,250)||!Number.isInteger(c.age)||!finite(c.age,18,100)||!finite(c.strengthMinutes,0,600)||![3.5,5,6].includes(c.strengthMet)||(c.method==='met-net-v2'&&(!finite(c.matMinutes,0,600)||![2.8,3,3.8,6.5].includes(c.matMet)||c.strengthMinutes+c.matMinutes>600)))return false}
 return true;
}

export function entryIsMat(entry:Entry,exercises:Exercise[]){
 const exercise=exercises.find(e=>e.id===entry.exerciseId);
 return entry.sets.some(s=>setMode(s)!=='weighted'||s.weight===0&&trackingFor(exercise)!=='weighted')||!entry.sets.length&&trackingFor(exercise)!=='weighted';
}
