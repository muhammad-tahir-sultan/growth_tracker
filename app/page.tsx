 "use client";
import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Flame, Trophy, CheckCircle2, Target, CalendarDays } from "lucide-react";

type Task = { _id:string; title:string; category:string; description?:string; target:number; unit:string; points:number; frequency:string };
type Completion = { _id:string; taskId:string; dateKey:string; count:number; done:boolean; pointsAwarded:number };
type Stats = { taskCount:number; todayCompleted:number; todayPoints:number; totalPoints:number; streak:number; last7:{dateKey:string;completed:number}[] };
const today = () => new Date().toLocaleDateString("en-CA");
const blank = { title:"", category:"General", description:"", target:1, unit:"completion", points:10, frequency:"daily" };

export default function Home() {
  const [tasks,setTasks] = useState<Task[]>([]);
  const [completions,setCompletions] = useState<Completion[]>([]);
  const [stats,setStats] = useState<Stats | null>(null);
  const [date,setDate] = useState(today());
  const [modal,setModal] = useState(false);
  const [editing,setEditing] = useState<Task|null>(null);
  const [form,setForm] = useState<any>(blank);
  const [busy,setBusy] = useState(false);
  const [notice,setNotice] = useState("");

  async function load() {
    const [t,c,s] = await Promise.all([fetch("/api/tasks"),fetch("/api/completions"),fetch("/api/stats")]);
    setTasks(await t.json()); setCompletions(await c.json()); setStats(await s.json());
  }
  useEffect(()=>{ load(); },[]);
  const records = useMemo(()=>Object.fromEntries(completions.filter(c=>c.dateKey===date).map(c=>[c.taskId,c])),[completions,date]);
  const doneCount = tasks.filter(t=>records[t._id]?.done).length;
  const dayPoints = tasks.reduce((sum,t)=>sum+(records[t._id]?.pointsAwarded||0),0);

  async function saveProgress(task:Task,count:number) {
    const done = count >= task.target;
    await fetch("/api/completions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({taskId:task._id,dateKey:date,count,done})});
    await load();
  }
  function openNew(){setEditing(null);setForm(blank);setModal(true);}
  function openEdit(t:Task){setEditing(t);setForm({...t});setModal(true);}
  async function saveTask(e:React.FormEvent){
    e.preventDefault(); setBusy(true);
    await fetch(editing?`/api/tasks/${editing._id}`:"/api/tasks",{method:editing?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
    setBusy(false);setModal(false);await load();
  }
  async function deleteTask(t:Task){
    if(!confirm(`Delete "${t.title}"? Its completion history will remain in the database.`)) return;
    await fetch(`/api/tasks/${t._id}`,{method:"DELETE"});await load();
  }
  const pct = tasks.length ? Math.round(doneCount/tasks.length*100) : 0;

  return <main className="shell">
    <header style={{display:"flex",justifyContent:"space-between",gap:16,alignItems:"center",flexWrap:"wrap"}}>
      <div><div className="muted" style={{fontSize:12,letterSpacing:2,fontWeight:700}}>PERSONAL EXECUTION SYSTEM</div><h1 style={{fontSize:30,fontWeight:750,margin:"8px 0"}}>Daily Growth Tracker</h1><div className="muted">Build consistency. Measure output. Improve every week.</div></div>
      <button className="primary" onClick={openNew}><Plus size={17} style={{display:"inline",verticalAlign:"middle",marginRight:6}}/>Add checklist</button>
    </header>

    <section className="grid-stats">
      <div className="panel stat"><div className="muted">Current streak</div><strong><Flame size={22} style={{display:"inline",color:"#f6a84a"}}/> {stats?.streak ?? 0} days</strong></div>
      <div className="panel stat"><div className="muted">Points earned today</div><strong>{dayPoints}</strong></div>
      <div className="panel stat"><div className="muted">All-time points</div><strong><Trophy size={21} style={{display:"inline",color:"#e9c76c"}}/> {stats?.totalPoints ?? 0}</strong></div>
      <div className="panel stat"><div className="muted">Tasks completed today</div><strong>{doneCount} / {tasks.length}</strong></div>
    </section>

    <section className="panel" style={{padding:20,marginBottom:20}}>
      <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",flexWrap:"wrap"}}>
        <div><div style={{fontWeight:700,fontSize:17}}>Daily execution</div><div className="muted" style={{fontSize:13,marginTop:5}}>Progress for the selected day</div></div>
        <label className="muted" style={{display:"flex",alignItems:"center",gap:8}}><CalendarDays size={16}/><input className="field" style={{width:155}} type="date" value={date} max={today()} onChange={e=>setDate(e.target.value)}/></label>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:20,fontSize:13}}><span>{doneCount} of {tasks.length} tasks complete</span><b>{pct}%</b></div>
      <div className="progress"><span style={{width:`${pct}%`}}/></div>
      <div className="muted" style={{fontSize:12,marginTop:10}}>Selected date points: {dayPoints} · Completion rate: {pct}%</div>
    </section>

    <section className="panel">
      <div style={{padding:"18px 18px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><h2 style={{fontSize:18,margin:0}}>Daily checklist</h2><div className="muted" style={{fontSize:12,marginTop:5}}>Enter actual counts; a task earns points when its target is reached.</div></div><span className="tag">{date===today()?"TODAY":date}</span></div>
      {tasks.map(t=>{
        const rec = records[t._id]; const count = rec?.count ?? 0; const complete = !!rec?.done;
        return <div className="task" key={t._id}>
          <button aria-label="Toggle task completion" onClick={()=>saveProgress(t,complete?0:t.target)} style={{background:"transparent",border:0,color:complete?"#72d6a1":"#65718a",padding:0}}><CheckCircle2 size={23}/></button>
          <div style={{flex:1,minWidth:190}}>
            <div style={{fontWeight:650,textDecoration:complete?"line-through":"none",color:complete?"#9ca8ba":"#eef2ff"}}>{t.title}</div>
            <div style={{display:"flex",gap:7,alignItems:"center",marginTop:7,flexWrap:"wrap"}}><span className="tag">{t.category}</span><span className="muted" style={{fontSize:11}}>Target: {t.target} {t.unit} · {t.points} pts · {t.frequency}</span></div>
            <div className="progress" style={{maxWidth:300}}><span style={{width:`${Math.min(100,count/t.target*100)}%`}}/></div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:7}}><input aria-label={`Count for ${t.title}`} type="number" min="0" value={count} onChange={e=>saveProgress(t,Math.max(0,Number(e.target.value)))} /><span className="muted" style={{fontSize:12}}>/ {t.target}</span></div>
          <div style={{minWidth:58,textAlign:"right",fontSize:12,color:complete?"#72d6a1":"#929bb0"}}>{complete?`+${t.points} pts`:"Pending"}</div>
          <button className="secondary" title="Edit task" onClick={()=>openEdit(t)}><Pencil size={15}/></button>
          <button className="danger" title="Delete task" onClick={()=>deleteTask(t)}><Trash2 size={16}/></button>
        </div>;
      })}
      {tasks.length===0&&<div className="muted" style={{padding:24}}>No checklist items yet. Add your first task.</div>}
    </section>

    <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:14,marginTop:20}}>
      <div className="panel" style={{padding:18}}><h3 style={{margin:"0 0 12px",fontSize:16}}>Last 7 days</h3><div style={{display:"flex",alignItems:"end",gap:9,height:90}}>{(stats?.last7||[]).map(d=><div key={d.dateKey} style={{flex:1,textAlign:"center"}}><div title={`${d.completed} completed`} style={{height:Math.max(5,Math.min(72,d.completed*9)),background:"#8173ed",borderRadius:"5px 5px 0 0"}}/><div className="muted" style={{fontSize:10,marginTop:6}}>{new Date(d.dateKey+"T12:00:00").toLocaleDateString("en",{weekday:"short"})}</div></div>)}</div></div>
      <div className="panel" style={{padding:18}}><h3 style={{margin:"0 0 10px",fontSize:16}}>Scoring rules</h3><p className="muted" style={{fontSize:13,lineHeight:1.6,margin:0}}>Each checklist item has a point value. Points are awarded once the target count is reached for that date. Your overall streak increments when at least one task is completed on consecutive days. Aim to complete your core daily checklist to make the streak meaningful.</p></div>
    </section>

    {modal&&<div onMouseDown={e=>{if(e.target===e.currentTarget)setModal(false)}} style={{position:"fixed",inset:0,background:"#000a",display:"grid",placeItems:"center",padding:16,zIndex:10}}>
      <form className="panel" onSubmit={saveTask} style={{width:"min(520px,100%)",padding:22,display:"grid",gap:12}}>
        <h2 style={{margin:0,fontSize:20}}>{editing?"Edit checklist item":"Create checklist item"}</h2>
        <label className="muted">Task title<input className="field" required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label>
        <label className="muted">Category<input className="field" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}/></label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <label className="muted">Target<input className="field" type="number" min="1" value={form.target} onChange={e=>setForm({...form,target:Number(e.target.value)})}/></label>
          <label className="muted">Unit<input className="field" value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})}/></label>
          <label className="muted">Points<input className="field" type="number" min="0" value={form.points} onChange={e=>setForm({...form,points:Number(e.target.value)})}/></label>
          <label className="muted">Frequency<select className="field" value={form.frequency} onChange={e=>setForm({...form,frequency:e.target.value})}><option value="daily">Daily</option><option value="every-2-days">Every 2 days</option><option value="weekly">Weekly</option></select></label>
        </div>
        <div style={{display:"flex",justifyContent:"end",gap:9,marginTop:5}}><button type="button" className="secondary" onClick={()=>setModal(false)}>Cancel</button><button className="primary" disabled={busy}>{busy?"Saving...":"Save task"}</button></div>
      </form>
    </div>}
  </main>;
}