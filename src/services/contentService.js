import { supabase } from '@/lib/supabaseClient'
import { CONTENT_SCHEMAS } from '@/config/contentSchemas'

function client(){ if(!supabase) throw new Error('Supabase is not configured. Check your .env file and restart the dev server.') ; return supabase }
export async function listContent(table){
 const schema=CONTENT_SCHEMAS[table]; if(!schema) throw new Error('Unknown content section.')
 let q=client().from(table).select('*')
 if(table==='profiles'||table==='website_settings') q=q.eq('id',1)
 else if(table==='academic_records') q=q.order('semester_number',{ascending:true})
 else q=q.order('display_order',{ascending:true}).order('created_at',{ascending:false})
 const {data,error}=await q; if(error) throw error; return data||[]
}
export async function saveContent(table,values,id){
 const schema=CONTENT_SCHEMAS[table]; if(!schema) throw new Error('Unknown content section.')
 const payload={...values}
 if(table==='profiles'||table==='website_settings') payload.id=1
 let q
 if(schema.singleton) q=client().from(table).upsert(payload,{onConflict:'id'}).select().single()
 else if(id) q=client().from(table).update(payload).eq('id',id).select().single()
 else q=client().from(table).insert(payload).select().single()
 const {data,error}=await q; if(error) throw error; return data
}
export async function deleteContent(table,id){
 const schema=CONTENT_SCHEMAS[table]; if(schema?.singleton) throw new Error('This is a single-row setting and cannot be deleted.')
 const {error}=await client().from(table).delete().eq('id',id); if(error) throw error
}
export async function setPublished(table,id,value){
 const {error}=await client().from(table).update({is_published:value}).eq('id',id); if(error) throw error
}
export async function uploadPortfolioFile(file,bucket='profile-photos'){
 if(!file) return null
 const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'-')
 const path=`${Date.now()}-${crypto.randomUUID()}-${safe}`
 const {data,error}=await client().storage.from(bucket).upload(path,file,{upsert:false,contentType:file.type||undefined})
 if(error) throw error
 if(bucket==='private-docs') return data.path
 const {data:publicData}=client().storage.from(bucket).getPublicUrl(data.path)
 return publicData.publicUrl
}
