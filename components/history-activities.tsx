'use client';
import {Accordion,AccordionItem,AccordionTrigger,AccordionContent} from '@/components/ui/accordion';
import {entryIsMat,setLabel,caloriesFor,type Workout,type Entry} from '@/lib/training';
import type {Exercise} from '@/lib/exercises';
export function HistoryActivities({workout,exercises}:{workout:Workout;exercises:Exercise[]}){
 const entries=workout.entries.filter(e=>e.sets.length),mat=entries.filter(e=>entryIsMat(e,exercises)),strength=entries.filter(e=>!entryIsMat(e,exercises)),calories=caloriesFor(workout);
 const movement=(entry:Entry)=><AccordionItem key={entry.exerciseId} value={entry.exerciseId}><AccordionTrigger><span>{exercises.find(e=>e.id===entry.exerciseId)?.name||'Hareket'}<small>{entry.sets.length} set</small></span></AccordionTrigger><AccordionContent><p>{entry.sets.map(setLabel).join(' / ')}</p></AccordionContent></AccordionItem>;
 return <Accordion type="multiple" className="workout-folds">
 {strength.map(movement)}
 {(mat.length>0||!!workout.calorie?.matMinutes)&&<AccordionItem value="mat"><AccordionTrigger><span>Mat / Vücut ağırlığı<small>{mat.length} hareket{workout.calorie?` · ${workout.calorie.matMinutes||0} dk · ≈ ${calories?.mat||0} kcal`:''}</small></span></AccordionTrigger><AccordionContent><Accordion type="multiple" className="workout-folds nested-folds">{mat.map(movement)}</Accordion></AccordionContent></AccordionItem>}
 {!!workout.cardio?.length&&<AccordionItem value="cardio"><AccordionTrigger><span>Kardiyo<small>{workout.cardio.reduce((sum,c)=>sum+c.minutes,0)} dk{calories?` · ≈ ${calories.cardio} kcal`:''}</small></span></AccordionTrigger><AccordionContent><Accordion type="multiple" className="workout-folds nested-folds">{workout.cardio.map(c=><AccordionItem key={c.id} value={c.id}><AccordionTrigger><span>{c.label}<small>{c.minutes} dk</small></span></AccordionTrigger><AccordionContent><p>{c.effort}</p></AccordionContent></AccordionItem>)}</Accordion></AccordionContent></AccordionItem>}
 </Accordion>;
}
