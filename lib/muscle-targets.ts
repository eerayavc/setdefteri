import {defaults,type Exercise} from './exercises';
import {normalizeSearch} from './exercise-search';
import type {Entry,Workout} from './training';
export const muscleLabels={
 'chest-upper':'Üst göğüs','chest-middle':'Orta göğüs','chest-lower':'Alt göğüs',
 'delt-front':'Ön omuz','delt-side':'Yan omuz','delt-rear':'Arka omuz',
 biceps:'Biceps',brachialis:'Brachialis · kolun derin kası',forearm:'Ön kol',triceps:'Triceps',
 lats:'Kanat · latissimus',upperback:'Kürek kemikleri arası',traps:'Üst trapez',erectors:'Bel · sırt doğrultucular',
 abs:'Ön karın',obliques:'Yan karın',quads:'Ön bacak',hamstrings:'Arka bacak',glutes:'Kalça',abductors:'Yan kalça',adductors:'İç bacak',calves:'Baldır',hipflexors:'Kalça bükücüler',
} as const;
export type Muscle=keyof typeof muscleLabels;
export type TargetProfile={primary:Muscle[];secondary:Muscle[];emphasis:Muscle[];note:string;known:boolean};
export const targetVariants=[{id:'unspecified',label:'Açı / yön belirtilmedi'},{id:'flat',label:'Yatay / düz press'},{id:'incline',label:'Yukarı eğimli press (incline)'},{id:'decline',label:'Aşağı eğimli press (decline)'},{id:'fly-level',label:'Fly · göğüs hizasında'},{id:'fly-up',label:'Fly · aşağıdan yukarıya'},{id:'fly-down',label:'Fly · yukarıdan aşağıya'}];
export type TargetSelection={targetExerciseId?:string;targetVariant?:string};
const chest:Muscle[]=['chest-upper','chest-middle','chest-lower'];
const profile=(primary:Muscle[],secondary:Muscle[]=[],emphasis:Muscle[]=[],note=''):TargetProfile=>({primary,secondary,emphasis,note,known:true});
export function referenceExercise(exercise:Exercise,selection:TargetSelection={}){
 return selection.targetExerciseId?defaults.find(e=>e.id===selection.targetExerciseId):defaults.find(e=>normalizeSearch(e.name)===normalizeSearch(exercise.name));
}
export function variantOptions(exercise:Exercise,selection:TargetSelection={}){
 const ref=referenceExercise(exercise,selection);
 if(ref?.name==='Chest Press Machine')return targetVariants.slice(0,4);
 if(ref?.name==='Cable Crossover')return [targetVariants[0],...targetVariants.slice(4)];
 return [];
}
export function targetsFor(exercise:Exercise,selection:TargetSelection={}):TargetProfile{
 const ref=referenceExercise(exercise,selection);
 if(!ref)return {...profile([],[],[],'Bu özel hareket için hedef bilgisi belirlenmedi. Aynı hareketin katalog karşılığı varsa aşağıdan eşleştirebilirsin.'),known:false};
 const name=ref.name;
 const variant=variantOptions(exercise,selection).some(v=>v.id===selection.targetVariant)?selection.targetVariant:undefined;
 if(ref.group==='Göğüs'){
  const fly=/Fly|Crossover/.test(name);
  const upper=/Incline|Low-to-High/.test(name)||variant==='incline'||variant==='fly-up';
  const lower=/Decline|Chest Dip/.test(name)||variant==='decline'||variant==='fly-down';
  return profile(chest,fly?['delt-front']:['delt-front','triceps'],upper?['chest-upper']:lower?['chest-lower']:[],variantOptions(exercise,selection).length&&(!variant||variant==='unspecified')?'Göğüs ana hedeftir; açı / yön bilinmediği için üst–alt vurgu belirtilmez.':'Üst / orta / alt alanlar görsel bölümlerdir; bağımsız kaslar değildir. Vurgu, diğer alanların çalışmadığı anlamına gelmez.');
 }
 if(ref.group==='Sırt'){
  if(name==='Back Extension')return profile(['erectors'],['glutes','hamstrings'],[],'Kalçadan veya belden hareket etme biçimi kas katkısını değiştirir.');
  if(/Straight Arm/.test(name))return profile(['lats'],['triceps','abs']);
  if(/Row/.test(name))return profile(['lats','upperback'],['biceps','delt-rear','forearm'],[],'Dirsek yolu ve tutuş, kanat ile kürek kemikleri arasındaki vurguyu değiştirir.');
  return profile(['lats'],['biceps','upperback','forearm']);
 }
 if(ref.group==='Omuz'){
  if(/Shrug/.test(name))return profile(['traps'],['forearm']);
  if(/Face Pull/.test(name))return profile(['delt-rear','upperback'],[],[],'Omuzun dış rotatorları da katılır; küçük ve derin kasların tamamı çizimde yer almaz.');
  if(/Reverse/.test(name))return profile(['delt-rear'],['upperback']);
  if(/Lateral/.test(name))return profile(['delt-side'],['traps']);
  if(/Front Raise/.test(name))return profile(['delt-front']);
  return profile(['delt-front','delt-side'],['triceps']);
 }
 if(ref.group==='Biceps'){
  if(/Hammer|Reverse EZ/.test(name))return profile(['brachialis','forearm','biceps'],[],[],'Nötr / ters tutuşta brachialis ve brachioradialis katkısı öne çıkar. Bicepsin uzun ve kısa başı için ayrı aktivasyon ölçülmez.');
  return profile(['biceps'],['brachialis','forearm'],[],'Bicepsin uzun ve kısa başı birlikte çalışır. Omuz pozisyonu ve tutuş etkilidir; yalnızca hareket adından bir başın izole çalıştığı sonucunu çıkarmıyoruz.');
 }
 if(ref.group==='Triceps')return profile(['triceps'],/Bench|Dip/.test(name)?['chest-upper','chest-middle','chest-lower','delt-front']:[],[],/Overhead/.test(name)?'Baş üstü konum uzun başı daha uzun kas boyunda çalıştırır; diğer başlar da çalışır. Harita triceps başlarını ayrı ölçülmüş gibi göstermez.':'Tricepsin üç başı birlikte çalışır; harita bunları tek kas grubu olarak gösterir.');
 if(ref.group==='Bacak'){
  if(/Calf/.test(name))return profile(['calves'],[],[],'Baldır gastrocnemius ve soleusu kapsar; diz açısı katkılarını değiştirir.');
  if(/Romanian/.test(name))return profile(['hamstrings','glutes'],['erectors','adductors','forearm']);
  if(/Leg Curl/.test(name))return profile(['hamstrings'],['calves']);
  if(/Leg Extension/.test(name))return profile(['quads']);
  if(/Hip Thrust|Glute Bridge/.test(name))return profile(['glutes'],['hamstrings']);
  if(/Abduction/.test(name))return profile(['abductors']);
  if(/Adduction/.test(name))return profile(['adductors']);
  return profile(['quads','glutes'],['adductors'],[],'Ayak konumu, hareket derinliği ve teknik kasların katkısını değiştirir.');
 }
 if(name==='Side Plank (Yan Plank)')return profile(['obliques'],['abs','abductors']);
 if(name==='Plank')return profile(['abs'],['obliques','glutes']);
 if(/Twist|Woodchop|Bicycle/.test(name))return profile(['obliques','abs'],[],[],'Ön ve yan karın birlikte görev alır.');
 if(/Leg Raise|Knee Raise|Captain/.test(name))return profile(['hipflexors'],['abs'],[],'Diz / bacak kaldırmada kalça bükücüler önemli rol oynar. Pelvisi kıvırma miktarı karın katkısını değiştirir.');
 return profile(['abs'],/Dead Bug/.test(name)?['hipflexors']:[],[],'Ön karın tek bir kasın devamıdır; üst–alt bölümleri tamamen ayrı çalışıyor gibi gösterilmez.');
}
export type MuscleContribution={exerciseId:string;name:string;sets:number;role:'primary'|'secondary';emphasis:boolean};
export function workoutTargets(workout:Workout,exercises:Exercise[]){
 const muscles=new Map<Muscle,MuscleContribution[]>();const unknown:string[]=[];
 if(workout.deleted)return {muscles,unknown};
 for(const entry of workout.entries){
  if(!entry.sets.length)continue;
  const exercise=exercises.find(e=>e.id===entry.exerciseId);
  if(!exercise){unknown.push('Katalogda bulunamayan hareket');continue}
  const target=targetsFor(exercise,entry);
  if(!target.known){unknown.push(exercise.name);continue}
  for(const muscle of new Set([...target.primary,...target.secondary])){
   const rows=muscles.get(muscle)||[];
   rows.push({exerciseId:exercise.id,name:exercise.name,sets:entry.sets.length,role:target.primary.includes(muscle)?'primary':'secondary',emphasis:target.emphasis.includes(muscle)});
   muscles.set(muscle,rows);
  }
 }
 return {muscles,unknown};
}
