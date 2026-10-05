import { getChatGPTUser } from '../../chatgpt-auth';
import { getRawDb } from '../../../db';
import {correctExerciseRecord,correctedExerciseId} from '../../../lib/record-corrections';
import {isRecord} from '../../../lib/training';
export async function POST(req: Request) {
 const user = await getChatGPTUser();
 if(!user) return Response.json({error:'Oturum açman gerekiyor.'},{status:401});
 try {
 const body = await req.json() as {records?: any};
 if(!Array.isArray(body.records)||body.records.length>500) return Response.json({error:'Geçersiz kayıt.'},{status:400});
 const db=getRawDb();
 const statements=[];
 for(const r of body.records){
 if(!isRecord(r)||JSON.stringify(r).length>200000) return Response.json({error:'Geçersiz kayıt.'},{status:400});
 statements.push(db.prepare('INSERT INTO records (user_id,id,payload,updated) VALUES (?,?,?,?) ON CONFLICT(user_id,id) DO UPDATE SET payload=excluded.payload,updated=excluded.updated WHERE excluded.updated>records.updated').bind(user.userId,r.id,JSON.stringify(r),r.updated));
 }
 for(let i=0;i<statements.length;i+=50) await db.batch(statements.slice(i,i+50));
 const existing=await db.prepare('SELECT payload FROM records WHERE user_id=? AND id=?').bind(user.userId,correctedExerciseId).first<{payload:string}>();
 if(existing){const original=JSON.parse(existing.payload);const corrected=correctExerciseRecord(original);if(corrected!==original)await db.prepare('UPDATE records SET payload=?,updated=? WHERE user_id=? AND id=? AND updated=?').bind(JSON.stringify(corrected),corrected.updated,user.userId,corrected.id,original.updated).run()}
 const result=await db.prepare('SELECT payload FROM records WHERE user_id=?').bind(user.userId).all();
 return Response.json({records:result.results.map((r:any)=>JSON.parse(r.payload))},{headers:{'Cache-Control':'no-store'}});
 } catch(e) { console.error('Sync failed', e); return Response.json({error:'Yedekleme şu an yapılamadı.'},{status:503}); }
}
