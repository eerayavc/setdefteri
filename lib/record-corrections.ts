import type {RecordItem} from './training';
// User-requested correction of one existing custom exercise; preserve its ID and history.
export const correctedExerciseId='a4e0f8e4-21d1-4478-89b3-53977825c46c';
export function correctExerciseRecord<T extends RecordItem>(record:T,now=Date.now()):T {
 if(record.kind==='exercise'&&record.id===correctedExerciseId&&record.name==='Romanian Deadlift'&&record.group==='Karın')return {...record,group:'Bacak',updated:Math.max(now,record.updated+1)};
 return record;
}
