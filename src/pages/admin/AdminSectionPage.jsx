import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Plus, Pencil, Trash2, X, Save, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { ADMIN_NAV } from '@/config/adminNav'
import { CONTENT_SCHEMAS } from '@/config/contentSchemas'
import { deleteContent, listContent, saveContent, setPublished } from '@/services/contentService'

const routeToTable={'profile':'profiles','academics':'academic_records','schooling':'education_records','intermediate':'education_records','skills':'skills','coding-profiles':'coding_profiles','projects':'projects','internships':'internships','certifications':'certifications','hackathons':'hackathons','research':'research','achievements':'achievements','links':'professional_links','learning':'learning_timeline','resume':'profiles','settings':'website_settings'}
const blank=(schema)=>Object.fromEntries(schema.fields.map(([key,,type])=>[key,type==='checkbox'?false:type==='number'?'':'' ]))
const pretty=(v)=>Array.isArray(v)?v.join(', '):(v??'')

export default function AdminSectionPage(){
 const {pathname}=useLocation(); const segment=pathname.split('/').filter(Boolean)[1]||''; const table=routeToTable[segment]; const schema=CONTENT_SCHEMAS[table]
 const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[editing,setEditing]=useState(null),[form,setForm]=useState({}),[error,setError]=useState(''),[refresh,setRefresh]=useState(0)
const title=ADMIN_NAV.find(x=>x.to===pathname)?.label||schema?.label||'Admin section'
 const load=useCallback(async()=>{ if(!schema)return; setLoading(true);setError('');try{setRows(await listContent(table))}catch(e){setError(e.message||'Could not load records.')}finally{setLoading(false)} },[schema,table])
 // Loading is an external data synchronization; the callback owns its loading/error state.
 // eslint-disable-next-line react-hooks/set-state-in-effect
 useEffect(()=>{void load()},[load,refresh])
 const startNew=()=>{setEditing('new');setForm(blank(schema));setError('')}
 const startEdit=(row)=>{setEditing(row.id||'singleton');setForm(Object.fromEntries(schema.fields.map(([key,,type])=>[key,type==='tags'?pretty(row[key]):(row[key]??(type==='checkbox'?false:''))])));setError('')}
 const close=()=>{setEditing(null);setForm({});setError('')}
 const change=(key,value)=>setForm(old=>({...old,[key]:value}))
 async function submit(e){e.preventDefault();setSaving(true);setError('');try{
  const payload={...form}; schema.fields.forEach(([key,,type])=>{if(type==='number')payload[key]=payload[key]===''||payload[key]===null?null:Number(payload[key]);if(type==='tags')payload[key]=String(payload[key]||'').split(',').map(x=>x.trim()).filter(Boolean)})
  await saveContent(table,payload,editing==='new'?null:(editing==='singleton'?null:editing));toast.success(`${schema.singular} saved`);close();setRefresh(x=>x+1)
 }catch(e){setError(e.message||'Could not save. Check the values and try again.')}finally{setSaving(false)}}
 async function remove(row){if(!window.confirm(`Delete this ${schema.singular.toLowerCase()}? This cannot be undone.`))return;try{await deleteContent(table,row.id);toast.success('Deleted');setRefresh(x=>x+1)}catch(e){toast.error(e.message||'Delete failed')}}
 async function publish(row,value){try{await setPublished(table,row.id,value);toast.success(value?'Published':'Moved to draft');setRefresh(x=>x+1)}catch(e){toast.error(e.message||'Could not update publish status')}}
 if(!schema)return <Card><h1 className="text-2xl font-bold">Page not found</h1><p className="mt-2 text-muted">This admin page does not exist.</p></Card>
 return <div className="mx-auto max-w-6xl space-y-6">
  <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-muted">Content management</p><h1 className="text-3xl font-bold">{title}</h1><p className="mt-1 text-sm text-muted">Save as draft first, then publish when the information is accurate.</p></div><div className="flex gap-2"><Button variant="secondary" onClick={()=>setRefresh(x=>x+1)}><RefreshCw className="h-4 w-4"/> Refresh</Button>{!schema.singleton&&<Button onClick={startNew}><Plus className="h-4 w-4"/> Add {schema.singular}</Button>}</div></div>
  {error&& !editing&&<p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm text-danger">{error}</p>}
  {editing!==null&&<Card><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-semibold">{editing==='new'?`Add ${schema.singular}`:`Edit ${schema.singular}`}</h2><button onClick={close} aria-label="Close"><X/></button></div><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">{schema.fields.map(([key,label,type,extra])=><div key={key} className={type==='textarea'?'sm:col-span-2':''}>{type==='checkbox'?<label className="flex items-center gap-3 rounded-xl border border-border p-3 text-sm"><input type="checkbox" checked={Boolean(form[key])} onChange={e=>change(key,e.target.checked)}/>{label}</label>:<label className="block space-y-1.5"><span className="text-sm font-medium">{label}{extra===true?' *':''}</span>{type==='textarea'?<textarea required={extra===true} value={form[key]??''} onChange={e=>change(key,e.target.value)} rows={4} className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm"/>:type==='select'?<select value={form[key]??''} onChange={e=>change(key,e.target.value)} className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm"><option value="">Select…</option>{extra.map(v=><option key={v} value={v}>{v.replaceAll('_',' ')}</option>)}</select>:<input type={type==='tags'?'text':type} required={extra===true} min={type==='number'?0:undefined} max={['cgpa','sgpa'].includes(key)?10:undefined} step={type==='number'?'any':undefined} inputMode={type==='number'?'decimal':undefined} value={pretty(form[key])} onChange={e=>change(key,e.target.value)} placeholder={type==='tags'?'e.g. React, JavaScript, Supabase':''} className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm"/>}</label>}</div>)}{error&&<p role="alert" className="sm:col-span-2 text-sm text-danger">{error}</p>}<div className="sm:col-span-2 flex flex-wrap gap-2"><Button type="submit" disabled={saving}><Save className="h-4 w-4"/>{saving?'Saving…':'Save changes'}</Button><Button type="button" variant="secondary" onClick={close}>Cancel</Button></div></form></Card>}
  {loading?<Card>Loading records…</Card>:rows.length===0?<Card><div className="py-8 text-center"><h2 className="font-semibold">No {title.toLowerCase()} added yet</h2><p className="mt-1 text-sm text-muted">Add only information you can verify. Nothing has been invented or pre-filled.</p>{schema.singleton&&<Button className="mt-4" onClick={startNew}>Set up {schema.singular}</Button>}</div></Card>:<div className="grid gap-3">{rows.map(row=><Card key={row.id||'singleton'} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{row.title||row.name||row.full_name||row.platform||row.company||row.site_title||`${schema.singular} ${row.semester_number||''}`}</h2><Badge tone={row.is_published?'success':'default'}>{row.is_published?'Published':'Draft'}</Badge></div><p className="mt-1 line-clamp-2 text-sm text-muted">{row.short_description||row.headline||row.description||row.url||row.academic_year||row.role||row.meta_description||'No summary added'}</p></div><div className="flex shrink-0 flex-wrap gap-2"><Button size="sm" variant="secondary" onClick={()=>startEdit(row)}><Pencil className="h-4 w-4"/> Edit</Button>{!schema.singleton&&<Button size="sm" variant="danger" onClick={()=>remove(row)}><Trash2 className="h-4 w-4"/> Delete</Button>}{'is_published'in row&&<Button size="sm" variant="ghost" onClick={()=>publish(row,!row.is_published)}>{row.is_published?'Unpublish':'Publish'}</Button>}</div></Card>)}</div>}
  <p className="text-xs text-muted">Changes are saved directly to your existing Supabase database. Public visitors can only see published records according to your existing RLS rules.</p>
 </div>
}
