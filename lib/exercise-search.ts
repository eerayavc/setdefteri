import type {Exercise} from './exercises';
export function normalizeSearch(text:string){return text.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i').trim()}
export function matchesExercise(exercise:Exercise,query:string){const haystack=normalizeSearch(`${exercise.name} ${exercise.group}`);return normalizeSearch(query).split(/\s+/).every(word=>haystack.includes(word))}

// Prefer exercise-name matches over broad muscle-group matches.
export function searchExercises(exercises:Exercise[],query:string){
 const normalized=normalizeSearch(query);
 const tokens=normalized.split(/\s+/);
 const rank=(exercise:Exercise)=>{
  const name=normalizeSearch(exercise.name);
  if(name===normalized)return 0;
  if(name.startsWith(normalized))return 1;
  if(name.includes(normalized))return 2;
  if(tokens.every(token=>name.includes(token)))return 3;
  return 4;
 };
 const matches=exercises.filter(exercise=>matchesExercise(exercise,query));
 return normalized?matches.sort((a,b)=>rank(a)-rank(b)):matches;
}
