export type TrackingMode='weighted'|'bodyweight'|'timed';
export const trackingOptions=[{id:'weighted',label:'Ağırlık + tekrar'},{id:'bodyweight',label:'Ağırlıksız · tekrar'},{id:'timed',label:'Süre · saniye'}];
export type Exercise={id:string;kind:'exercise';name:string;group:string;unit:string;updated:number;archived?:boolean;deleted?:boolean;photoData?:string|null;tracking?:TrackingMode};
export const groups=['Göğüs','Sırt','Omuz','Biceps','Triceps','Bacak','Karın'];
// Preserve every original ID and weight convention: saved sets reference these IDs.
const original:Record<string,string[]>={Göğüs:['Bench Press','Incline Dumbbell Press','Chest Fly Machine','Chest Press Machine','Cable Crossover'],Sırt:['Lat Pulldown','Seated Cable Row','Low Row Machine','Dumbbell Row','Straight Arm Pulldown'],Omuz:['Dumbbell Shoulder Press','Lateral Raise','Reverse Pec Deck','Face Pull'],Biceps:['Dumbbell Curl','Hammer Curl','Cable Curl','Preacher Curl'],Triceps:['Triceps Pushdown','Overhead Cable Extension','Dumbbell Triceps Extension'],Bacak:['Leg Press','Leg Extension','Leg Curl','Squat Machine','Romanian Deadlift','Calf Raise'],Karın:['Cable Crunch','Crunch','Leg Raise']};
const bar='Bar dâhil toplam',db='Tek dambıl',machine='Makinede görünen',extra='Ek ağırlık',total='Toplam dış ağırlık';
const additions:Record<string,[string,string][]>= {
 Göğüs:[['Dumbbell Bench Press',db],['Incline Barbell Bench Press',bar],['Decline Barbell Bench Press',bar],['Incline Chest Press Machine',machine],['Dumbbell Fly',db],['Incline Dumbbell Fly',db],['Low-to-High Cable Fly',machine],['Push-up (Şınav)',extra],['Smith Machine Bench Press',bar],['Chest Dip',extra]],
 Sırt:[['Pull-up (Barfiks)',extra],['Chin-up',extra],['Close Grip Lat Pulldown',machine],['Reverse Grip Lat Pulldown',machine],['Single Arm Cable Row',machine],['Bent-over Barbell Row',bar],['Chest Supported Dumbbell Row',db],['T-Bar Row', 'Eklenen plakaların toplamı'],['Seated Row Machine',machine],['Back Extension',extra]],
 Omuz:[['Barbell Overhead Press',bar],['Shoulder Press Machine',machine],['Arnold Press',db],['Cable Lateral Raise',machine],['Lateral Raise Machine',machine],['Dumbbell Front Raise',db],['Cable Front Raise',machine],['Bent-over Dumbbell Reverse Fly',db],['Cable Reverse Fly',machine],['Dumbbell Shrug',db]],
 Biceps:[['Barbell Curl',bar],['EZ Bar Curl',bar],['Incline Dumbbell Curl',db],['Concentration Curl',db],['Rope Hammer Curl',machine],['Dumbbell Preacher Curl',db],['Biceps Curl Machine',machine],['Reverse EZ Bar Curl',bar],['Spider Curl (Dumbbell)',db],['Cross Body Hammer Curl',db]],
 Triceps:[['Rope Triceps Pushdown',machine],['V-Bar Triceps Pushdown',machine],['Single Arm Cable Pushdown',machine],['Reverse Grip Cable Pushdown',machine],['EZ Bar Skull Crusher',bar],['Dumbbell Skull Crusher',db],['Dumbbell Kickback',db],['Cable Kickback',machine],['Close Grip Bench Press',bar],['Triceps Dip Machine',machine]],
 Bacak:[['Barbell Back Squat',bar],['Goblet Squat','Tek dambıl / kettlebell'],['Dumbbell Bulgarian Split Squat',db],['Dumbbell Walking Lunge',db],['Barbell Hip Thrust',bar],['Seated Leg Curl',machine],['Hack Squat','Eklenen plakaların toplamı'],['Hip Abduction Machine',machine],['Hip Adduction Machine',machine],['Seated Calf Raise','Eklenen plakaların toplamı']],
 Karın:[['Reverse Crunch',extra],['Bicycle Crunch',extra],['Hanging Knee Raise',extra],['Captain’s Chair Knee Raise',extra],['Decline Sit-up',extra],['Ab Crunch Machine',machine],['Russian Twist',total],['Cable Woodchop',machine],['Ab Wheel Rollout',extra],['Dead Bug',extra]],
};
export const defaults:Exercise[]=[
 ...Object.entries(original).flatMap(([group,names])=>names.map((name,i):Exercise=>({id:group+'-'+i,kind:'exercise',name,group,unit:/Dumbbell|Lateral|Hammer/.test(name)?db:/Bench|Deadlift/.test(name)?bar:/Crunch|Leg Raise/.test(name)&&name!=='Cable Crunch'?extra:machine,updated:1}))),
 ...Object.entries(additions).flatMap(([group,items])=>items.map(([name,unit],i):Exercise=>({id:group+'-extra-'+i,kind:'exercise',name,group,unit,updated:1}))),
 {id:'mat-glute-bridge',kind:'exercise',name:'Glute Bridge (Matta Kalça Köprüsü)',group:'Bacak',unit:'Vücut ağırlığı',tracking:'bodyweight',updated:1},
 {id:'mat-sit-up',kind:'exercise',name:'Sit-up (Mekik)',group:'Karın',unit:'Vücut ağırlığı',tracking:'bodyweight',updated:1},
 {id:'mat-plank',kind:'exercise',name:'Plank',group:'Karın',unit:'Süre',tracking:'timed',updated:1},
 {id:'mat-side-plank',kind:'exercise',name:'Side Plank (Yan Plank)',group:'Karın',unit:'Süre',tracking:'timed',updated:1},
];

export function mergeExerciseCatalog(saved:Exercise[]){return [...new Map([...defaults,...saved].map(e=>[e.id,e])).values()]}

export const matGroup='Mat / Vücut ağırlığı';
export function trackingFor(e?:Exercise):TrackingMode{
 if(e?.tracking)return e.tracking;
 if(/plank/i.test(e?.name||''))return 'timed';
 if(e?.unit==='Ek ağırlık'||e?.unit==='Vücut ağırlığı')return 'bodyweight';
 return 'weighted';
}
export function exerciseSummary(e:Exercise){const m=trackingFor(e);return m==='timed'?'Süre · saniye':m==='bodyweight'?'Vücut ağırlığı · tekrar':e.unit+' · kg'}
export function inExerciseGroup(e:Exercise,group:string){return group===matGroup?trackingFor(e)!=='weighted':e.group===group}

// Keep a tombstone so offline devices and default catalogs cannot revive a removed item.
// Retain identity for historical sets; discard the user-uploaded image.
export function removeExercisePermanently(e:Exercise):Exercise{return {...e,archived:true,deleted:true,photoData:null}}
export function visibleExercises(exercises:Exercise[]){return exercises.filter(e=>!e.archived&&!e.deleted)}
export function archivedExercises(exercises:Exercise[]){return exercises.filter(e=>e.archived&&!e.deleted)}
