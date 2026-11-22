(()=> {
const KEY='gunplalog_v2_data';
const GLASS_KEY='framezero_glass_transparency';
let glassLevel=55;
try{const stored=localStorage.getItem(GLASS_KEY);if(stored!==null)glassLevel=Math.max(0,Math.min(100,Number(stored)||0))}catch{}
function applyGlass(level){
 glassLevel=Math.max(0,Math.min(100,Number(level)||0));
 const root=document.documentElement;
 root.style.setProperty('--glass-opacity',(0.94-glassLevel*0.0088).toFixed(3));
 root.style.setProperty('--glass-light-opacity',(0.18-glassLevel*0.0013).toFixed(3));
 root.style.setProperty('--glass-border-opacity',(0.27+glassLevel*0.0024).toFixed(3));
 root.style.setProperty('--glass-blur','0px');
 const value=document.getElementById('glassValue');if(value)value.textContent=glassLevel+' %';
 const slider=document.getElementById('glassSlider');if(slider&&Number(slider.value)!==glassLevel)slider.value=glassLevel;
}
applyGlass(glassLevel);

const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const newId=()=>typeof crypto!=='undefined'&&typeof crypto.randomUUID==='function'?crypto.randomUUID():'fz-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
const today=()=>new Date().toLocaleDateString('de-DE');
const fmt=ms=>{let sec=Math.floor(ms/1000),h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;return [h,m,s].map(x=>String(x).padStart(2,'0')).join(':')};
const fresh=()=>({profile:{username:'',avatar:'',bio:'',favorite:''},projects:[],activeId:null,diary:[],paints:[],tools:[]});
let data;try{data=JSON.parse(localStorage.getItem(KEY))||fresh()}catch{data=fresh()}
data.projects=Array.isArray(data.projects)?data.projects:[];
data.diary=Array.isArray(data.diary)?data.diary:[];
data.paints=Array.isArray(data.paints)?data.paints:[];
data.tools=Array.isArray(data.tools)?data.tools:[];
data.profile=data.profile||fresh().profile;
// Legacy versions stored model series in the scale field. Migrate without dropping actual scale values.
for(const project of data.projects){
 if(['30MS','30MM','30MF','PokePla'].includes(project.scale)){
  if(!project.modelLine)project.modelLine=project.scale;
  project.scale='';
 }
}

let page='dashboard',timerTick=null,detailId=null;
function save(){try{localStorage.setItem(KEY,JSON.stringify(data));return true}catch(e){alert('Speicherplatz nicht ausreichend. Bitte Bilder verkleinern oder Daten sichern.');return false}}
function toast(t){let el=$('#toast');el.textContent=t;el.className='toast';setTimeout(()=>el.className='',2400)}
function completed(p){return p.status==='completed'||p.completed===true}
function active(){return data.projects.find(p=>p.id===data.activeId&&!completed(p))||data.projects.find(p=>!completed(p))||null}
function openProjects(){return data.projects.filter(p=>!completed(p)).sort((a,b)=>(b.id===data.activeId)-(a.id===data.activeId))}
function matches(p,q){return [p.name,p.grade,p.scale,p.modelLine,p.series,p.number].some(v=>String(v||'').toLocaleLowerCase('de').includes(q.toLocaleLowerCase('de')))}

function elapsed(p){if(!p)return 0;return (p.sessions||[]).reduce((a,s)=>a+s.duration,0)+(p.runningSince?Date.now()-p.runningSince:0)}
function pct(p){if(p?.oldProject)return 100;return p&&p.steps?.length?Math.round(p.steps.filter(s=>s.done).length/p.steps.length*100):0}
function projectImages(p){if(!p)return [];return Array.isArray(p.images)&&p.images.length?p.images.filter(Boolean).slice(0,3):(p.image?[p.image]:[])}
function img(p,cls='model-image'){const first=projectImages(p)[0];return first?`<img class="${cls}" src="${first}" alt="${esc(p.name)}">`:`<div class="model-placeholder ${cls}">⬡</div>`}
function heading(k,t,s){return `<div class="eyebrow">${k}</div><h1 class="page-title">${t}</h1><p class="sub">${s||''}</p>`}
function projectCard(p){return `<article class="card" data-open="${p.id}"><div class="card-row">${img(p)}<div style="min-width:0;flex:1"><h3>${esc(p.name)}</h3><small>${esc(p.modelLine||'Modellreihe offen')} · ${esc(p.grade||'Grade offen')} · ${esc(p.scale||'Maßstab offen')}</small><div class="progress"><i style="width:${pct(p)}%"></i></div><small>${pct(p)} % · ${fmt(elapsed(p))}</small></div></div><div class="actions"><button class="btn ghost" data-active="${p.id}">${p.id===data.activeId?'● AKTIV':'Als aktiv setzen'}</button></div></article>`}
function runningProject(){return data.projects.find(x=>x.runningSince&&!completed(x))||null}
function dashboard(){
 const p=active(),r=runningProject(),profile=data.profile||{},name=profile.username?.trim()||'Gundam Meister';
 const allTime=data.projects.reduce((sum,project)=>sum+elapsed(project),0);
 const completedCount=data.projects.filter(completed).length;
 const activities=data.projects.flatMap(x=>(x.sessions||[]).map(y=>({name:x.name,date:y.date,time:fmt(y.duration)}))).slice(-4).reverse();
 const avatar=profile.avatar||'';
 const steps=p?.steps||[];
 $('#page-dashboard').innerHTML=`
 <div class="hud-command">
  <section class="hud-pilot-holo" aria-label="Animierte Pilotenkarte">
   <div class="pilot-circuit" aria-hidden="true"><svg viewBox="0 0 1000 240" preserveAspectRatio="none"><g fill="none" stroke="currentColor" stroke-width="1.3"><path d="M0 46H100L137 82H258"/><path d="M0 84H85L140 140H245"/><path d="M0 192H96L153 160H265"/><path d="M735 34H846L891 75H1000"/><path d="M735 85H885L918 118H1000"/><path d="M736 163H840L906 207H1000"/><path d="M738 206H865L907 175H1000"/></g><g fill="currentColor"><circle cx="258" cy="82" r="3"/><circle cx="245" cy="140" r="3"/><circle cx="265" cy="160" r="3"/><circle cx="735" cy="34" r="3"/><circle cx="736" cy="163" r="3"/></g></svg></div>
   <div class="pilot-glass-layer pilot-glass-layer-back" aria-hidden="true"></div>
   <div class="pilot-glass-layer pilot-glass-layer-front" aria-hidden="true"></div>
   <div class="pilot-holo-top"><span><i class="pilot-beacon" aria-hidden="true"></i> PILOTEN-DOSSIER <em>// PERSONNEL DATABASE</em></span><span class="pilot-signal">● IDENTITY VERIFIED</span></div>
   <div class="pilot-holo-main">
    <div class="pilot-holo-portrait"><div class="pilot-orbit pilot-orbit-one" aria-hidden="true"></div><div class="pilot-orbit pilot-orbit-two" aria-hidden="true"></div><div class="pilot-portrait-core">${avatar?`<img src="${avatar}" alt="Profilbild von ${esc(name)}">`:`<div class="pilot-holo-placeholder" aria-label="Kein Profilbild"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="33" r="18" fill="currentColor"/><path d="M15 91c0-21 15-33 35-33s35 12 35 33" fill="currentColor"/></svg></div>`}</div><span class="pilot-orbit-node" aria-hidden="true"></span></div>
    <div class="pilot-holo-identity"><div class="pilot-holo-kicker">FRAME//ZERO <span> / PILOT IDENTIFICATION</span></div><h1>${esc(name)}</h1><p>${profile.bio?esc(profile.bio):'Deine Kommandozentrale für den Modellbau.'}</p><button class="pilot-holo-edit" data-page="profile">◈ PILOTENPROFIL BEARBEITEN <span aria-hidden="true">›</span></button></div>
    ${r?`<button type="button" class="pilot-live-timer pilot-live-enter" data-action="pilot-timer-stop" data-id="${r.id}" aria-label="Timer stoppen und Bauzeit für ${esc(r.name)} speichern" title="Antippen: Timer stoppen und Zeit speichern">
     <span class="pilot-live-orbit pilot-live-orbit-a" aria-hidden="true"></span><span class="pilot-live-orbit pilot-live-orbit-b" aria-hidden="true"></span>
     <span class="pilot-live-core"><span class="pilot-live-label"><span class="pilot-live-dot"></span> BAU-TIMER // LIVE</span><strong class="pilot-live-value" id="pilotLiveTimer" role="timer" aria-live="off">${fmt(elapsed(r))}</strong><span class="pilot-live-project">${esc(r.name)}</span><span class="pilot-live-open">■ STOPP & SPEICHERN</span></span>
    </button>`:`<div class="pilot-timer-start-zone"><button type="button" class="pilot-timer-start-btn" data-action="${p?'timer-start':'new-project'}" aria-label="${p?'Timer für aktives Projekt starten':'Projekt anlegen, um Timer zu starten'}" title="${p?'Timer starten':'Projekt anlegen'}"><span class="pilot-timer-start-icon" aria-hidden="true">▶</span><span>${p?'TIMER STARTEN':'PROJEKT +'}</span></button></div>`}
    <div class="pilot-holo-stats" aria-label="Pilotenstatistik"><div><span>PROJEKTE</span><strong>${data.projects.length}</strong></div><div><span>ABGESCHLOSSEN</span><strong>${completedCount}</strong></div><div><span>BAUZEIT GESAMT</span><strong>${fmt(allTime)}</strong></div></div>
   </div>
   <div class="pilot-holo-bottom" aria-hidden="true"><span>F//Z // USER TERMINAL</span><span class="pilot-holo-progress"><i></i></span><span>SECURE CONNECTION</span></div>
  </section>
  <div class="hud-titlebar"><div><div class="eyebrow">FRAME//ZERO // MODEL BUILD CONTROL SYSTEM</div><h2>KOMMANDOZENTRALE</h2></div><div class="hud-title-mark">F//Z <span>BUILD CONTROL</span></div></div>
  <div class="hud-layout hud-layout-pilot">
   <div class="hud-left">
    <section class="panel hud-module hud-active"><div class="hud-heading">◈ AKTIVES PROJEKT <span>01 // BUILD</span></div>
    ${p?`<div class="hud-active-row">${img(p,'hud-project-image')}<div class="hud-active-info"><h2>${esc(p.name)}</h2><p>${esc(p.modelLine||'—')} // ${esc(p.grade||'—')} // ${esc(p.scale||'—')}</p><div class="hud-progress-line"><span>FORTSCHRITT</span><b>${pct(p)} %</b></div><div class="progress"><i style="width:${pct(p)}%"></i></div><button class="btn primary" data-open="${p.id}">PROJEKT ÖFFNEN</button></div></div>`:`<div class="empty">Noch kein aktives Projekt.<button class="btn primary" data-action="new-project">＋ PROJEKT ANLEGEN</button></div>`}
    </section>
   </div>
   <div class="hud-right">
    <section class="panel hud-module"><div class="hud-heading">⌁ BAUTÄTIGKEIT <span>02 // ANALYSE</span></div><div class="hud-stage-bars">${steps.slice(0,5).map(step=>`<div><span>${esc(step.name)}</span><div class="hud-track"><i style="width:${step.done?'100%':'0%'}"></i></div><b>${step.done?'100':'0'}%</b></div>`).join('')||'<p class="muted">Noch keine Bauschritte erfasst.</p>'}</div></section>
    <section class="panel hud-module hud-session-panel"><div class="hud-heading"><button type="button" class="hud-stats-open" data-build-stats aria-label="Baustatistik öffnen">◷ LETZTE SITZUNGEN <span class="hud-stats-open-hint">↗ BAUSTATISTIK ANSEHEN</span></button><span>03 // LOG</span></div><div class="hud-activity">${activities.map(a=>`<div><span>◉ ${esc(a.name)}</span><span class="hud-session-meta"><time>${esc(a.date||"Datum unbekannt")}</time><b>${esc(a.time)}</b></span></div>`).join('')||'<p class="muted">Noch keine Bauzeiten protokolliert.</p>'}</div></section>
    <section class="panel hud-module"><div class="hud-heading">⬡ SCHNELLZUGRIFF <span>04 // MODULE</span></div><div class="hud-quick"><button data-action="new-project">▦<small>NEUES PROJEKT</small></button><button data-page="tools">⚒<small>WERKZEUGE</small></button><button data-page="paint">◈<small>PAINT LAB</small></button></div></section>
   </div>
  </div>
 </div>`}
function projects(){let list=openProjects();$('#page-projects').innerHTML=`${heading('BUILD MANAGEMENT','PROJEKTE','Deine laufenden und geplanten Modellbau-Projekte.') }<div class="section-head"><h2>OFFENE PROJEKTE (${list.length})</h2><button class="btn primary" data-action="new-project">＋ NEUES PROJEKT</button></div><div class="field"><label for="projectSearch">Projekte durchsuchen</label><input id="projectSearch" type="search" placeholder="Name, Modellreihe, Serie, Grade, Maßstab …" autocomplete="off"></div><div class="grid two" id="projectResults">${list.map(projectCard).join('')||'<div class="empty">Keine offenen Projekte.</div>'}</div>`;let input=$('#projectSearch');input.oninput=()=>{$('#projectResults').innerHTML=list.filter(p=>matches(p,input.value)).map(projectCard).join('')||'<div class="empty">Keine Treffer.</div>';bind()}}
function hangar(){let list=data.projects.filter(completed);$('#page-hangar').innerHTML=`${heading('MODEL STORAGE','MODELL-HANGAR','Deine abgeschlossenen Modelle.') }<div class="section-head"><h2>FERTIGE MODELLE (${list.length})</h2></div><div class="field"><label for="hangarSearch">Hangar durchsuchen</label><input id="hangarSearch" type="search" placeholder="Name, Modellreihe, Serie, Grade, Maßstab …" autocomplete="off"></div><div class="hangar-grid" id="hangarResults">${list.map(hangarCard).join('')||'<div class="empty">Noch keine abgeschlossenen Modelle.</div>'}</div>`;$('#hangarSearch').oninput=e=>{$('#hangarResults').innerHTML=list.filter(p=>matches(p,e.target.value)).map(hangarCard).join('')||'<div class="empty">Keine Treffer.</div>';bind()}}
function hangarCard(p){return `<article class="card hangar-card" data-open="${p.id}">${img(p)}<h3>${esc(p.name)}</h3>${p.oldProject?'<span class="old-project-tag">OLD PROJEKT</span>':''}<div class="mini-meta">${esc(p.modelLine||'—')} · ${esc(p.grade||'—')} · ${esc(p.scale||'—')}</div><div class="progress"><i style="width:${pct(p)}%"></i></div><small>${pct(p)} % · ${fmt(elapsed(p))}</small><div class="mini-meta">${p.oldProject?'ARCHIVIERT':'ABGESCHLOSSEN'} · ÖFFNEN ›</div></article>`}
// All periods are calendar periods, not rolling 7/30/365-day windows.
function buildSessionDate(value){
 const raw=String(value||'').trim();let m,y,mo,day;
 if((m=/^(\d{2})\.(\d{2})\.(\d{4})$/.exec(raw))){day=+m[1];mo=+m[2];y=+m[3]}
 else if((m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(raw))){y=+m[1];mo=+m[2];day=+m[3]}
 else return null;
 const d=new Date(y,mo-1,day);
 return d.getFullYear()===y&&d.getMonth()===mo-1&&d.getDate()===day?d:null;
}
function buildPeriodKey(date,period){
 const y=date.getFullYear(),m=date.getMonth()+1;
 if(period==='year')return String(y);
 if(period==='month')return `${y}-${String(m).padStart(2,'0')}`;
 const d=new Date(date.getFullYear(),date.getMonth(),date.getDate());
 const weekday=(d.getDay()+6)%7;d.setDate(d.getDate()-weekday+3);
 const isoYear=d.getFullYear();const firstThursday=new Date(isoYear,0,4);
 firstThursday.setDate(firstThursday.getDate()-((firstThursday.getDay()+6)%7));
 const week=1+Math.round((d-firstThursday)/604800000);
 return `${isoYear}-W${String(week).padStart(2,'0')}`;
}
function buildStats(period='week'){
 const periods=new Map();let total=0,count=0,undated=0,completedTotal=0,undatedCompleted=0;
 for(const project of data.projects){
  for(const session of project.sessions||[]){
   const duration=Number(session.duration);
   if(!Number.isFinite(duration)||duration<0)continue;
   const date=buildSessionDate(session.date);
   if(!date){undated++;continue}
   const key=buildPeriodKey(date,period);
   if(!periods.has(key))periods.set(key,{key,duration:0,count:0,completed:0,projects:new Map()});
   const bucket=periods.get(key);bucket.duration+=duration;bucket.count++;
   bucket.projects.set(project.name,(bucket.projects.get(project.name)||0)+duration);
   total+=duration;count++;
  }
 }
 for(const project of data.projects){
  if(!completed(project))continue;
  completedTotal++;
  const finish=buildSessionDate(project.oldProject?project.oldProjectDate:project.completedDate);
  if(!finish){undatedCompleted++;continue}
  const key=buildPeriodKey(finish,period);
  if(!periods.has(key))periods.set(key,{key,duration:0,count:0,completed:0,projects:new Map()});
  periods.get(key).completed++;
 }
 return {buckets:[...periods.values()].sort((a,b)=>b.key.localeCompare(a.key)),total,count,undated,completedTotal,undatedCompleted};
}
function showBuildStats(period='week'){
 if(!['week','month','year'].includes(period))period='week';
 const stats=buildStats(period),max=Math.max(1,...stats.buckets.map(x=>x.duration));
 const label={week:'WOCHEN',month:'MONATE',year:'JAHRE'};
 const periodLabel=key=>period==='week'?key.replace('-W',' // KW '):period==='month'?key.slice(5)+'.'+key.slice(0,4):key;
 const existingStatsModal=$('#modal-root .build-stats-modal');
 const statsMarkup=`<div class="modal-backdrop" data-close><div class="modal build-stats-modal" role="dialog" aria-modal="true" aria-label="Baustatistik" onclick="event.stopPropagation()"><div class="modal-head"><h2>◷ BAUSTATISTIK // ZEITANALYSE</h2><button class="close" type="button" data-close aria-label="Schließen">×</button></div>
 <p class="muted">Bauzeiten aus allen gespeicherten Projektsitzungen, einschließlich Old Projekts.</p>
 <div class="stats-periods" role="group" aria-label="Zeitraum wählen">${['week','month','year'].map(k=>`<button type="button" class="btn ${period===k?'primary':'ghost'}" data-stats-period="${k}" aria-pressed="${period===k}">${label[k]}</button>`).join('')}</div>
 <div class="stats-summary"><div><small>GESAMTBAUZEIT</small><strong>${fmt(stats.total)}</strong></div><div><small>SITZUNGEN</small><strong>${stats.count}</strong></div><div><small>FERTIGGESTELLTE PROJEKTE</small><strong>${stats.completedTotal}</strong></div><div><small>ZEITRÄUME</small><strong>${stats.buckets.length}</strong></div></div>
 <div class="stats-chart" aria-label="Bauzeiten nach ${label[period].toLowerCase()}">${stats.buckets.map(b=>`<div class="stats-bucket"><div class="stats-bucket-label"><b>${esc(periodLabel(b.key))}</b><span>${fmt(b.duration)} · ${b.count} ${b.count===1?'Sitzung':'Sitzungen'} · ${b.completed} ${b.completed===1?'Abschluss':'Abschlüsse'}</span></div><div class="stats-track"><i style="width:${Math.max(0,Math.min(100,b.duration/max*100))}%"></i></div><div class="stats-projects">${[...b.projects].sort((a,b)=>b[1]-a[1]).map(([name,duration])=>`<span>${esc(name)} <b>${fmt(duration)}</b></span>`).join('')}</div></div>`).join('')||'<p class="muted">Für diesen Zeitraum sind noch keine Bauzeiten vorhanden.</p>'}</div>
 ${stats.undated?`<p class="muted">${stats.undated} Sitzung(en) ohne gültiges Datum konnten nicht zugeordnet werden.</p>`:''}${stats.undatedCompleted?`<p class="muted">${stats.undatedCompleted} ältere abgeschlossene Projekte ohne gespeichertes Abschlussdatum sind in der Gesamtzahl enthalten, aber keinem Zeitraum zugeordnet.</p>`:''}
 </div></div>`;
 if(existingStatsModal){
  // Keep the existing overlay mounted while switching periods.
  const parsed=document.createElement('template');
  parsed.innerHTML=statsMarkup.trim();
  const next=parsed.content.querySelector('.build-stats-modal');
  const previousScroll=existingStatsModal.scrollTop;
  existingStatsModal.innerHTML=next.innerHTML;
  existingStatsModal.scrollTop=previousScroll;
  const close=existingStatsModal.querySelector('[data-close]');
  if(close)close.onclick=()=>{$('#modal-root').innerHTML=''};
 }else{
  $('#modal-root').innerHTML=statsMarkup;
  bind();
 }
 $('#modal-root').querySelectorAll('[data-stats-period]').forEach(b=>{
  b.onclick=e=>{e.preventDefault();showBuildStats(b.dataset.statsPeriod)};
 });
}
function projectDetail(id){let p=data.projects.find(x=>x.id===id);if(!p)return;detailId=id;$('#modal-root').innerHTML=`<div class="modal-backdrop" data-close><div class="modal" onclick="event.stopPropagation()"><div class="modal-head"><h2>PROJEKT // DETAILANSICHT</h2><button class="close" data-close>×</button></div><div class="detail-hero">${img(p)}<div><div class="eyebrow">${esc(p.modelLine||'Modellreihe offen')} · ${esc(p.grade||'')} · ${esc(p.scale||'')}</div><h2>${esc(p.name)}</h2><div class="progress"><i style="width:${pct(p)}%"></i></div><b class="cyan">${pct(p)} % abgeschlossen</b><p class="muted">Gesamtbauzeit: ${fmt(elapsed(p))}<br>Timersitzungen: ${(p.sessions||[]).length}</p>${completed(p)?'':`<button class="btn primary" data-active="${p.id}">${p.id===data.activeId?'AKTIVES PROJEKT':'ALS AKTIV FESTLEGEN'}</button>`}</div></div>
<div class="panel hud-detail-timer"><div class="hud-heading">◷ PROJEKTZEIT // ${esc(p.name)}</div><div class="hud-time hud-detail-time" id="detailTimer">${fmt(elapsed(p))}</div><div class="actions">${!completed(p)?(p.runningSince?`<button class="btn danger" data-action="timer-stop" data-id="${p.id}">■ STOPP & SPEICHERN</button>`:`<button class="btn primary" data-action="timer-start" data-id="${p.id}">▶ TIMER STARTEN</button>`):''}</div></div>
<div class="section-head"><h2>PROJEKTGALERIE (${projectImages(p).length}/3)</h2><button class="btn ghost" data-action="edit-project" data-id="${p.id}">BILDER VERWALTEN</button></div>
<div class="project-gallery">${projectImages(p).map((src,i)=>`<button class="gallery-thumb" type="button" data-gallery-view="${p.id}" data-index="${i}" aria-label="Bild ${i+1} vergrößern"><img src="${src}" alt="${esc(p.name)} – Bild ${i+1}"></button>`).join('')||'<p class="muted">Noch keine Projektbilder gespeichert.</p>'}</div>
<div class="actions">${p.oldProject?'':`<button class="btn ${completed(p)?'ghost':'primary'}" data-action="toggle-completed" data-id="${p.id}">${completed(p)?'WIEDER ÖFFNEN':'PROJEKT ABSCHLIESSEN'}</button>`}</div>${p.oldProject?'':`<div class="section-head"><h2>BAUSCHRITTE</h2><button class="btn ghost" data-action="add-step" data-id="${p.id}">＋ SCHRITT</button></div>${(p.steps||[]).map((s,i)=>`<div class="checkrow step-sort-row ${s.done?'done':''}" data-sort-step="${i}" data-project="${p.id}"><input type="checkbox" data-step="${p.id}" data-index="${i}" aria-label="${esc(s.name)} abhaken" ${s.done?'checked':''}><span class="step-sort-name">${esc(s.name)}</span><button type="button" class="step-drag-handle" data-drag-step="${i}" aria-label="${esc(s.name)} verschieben" title="Zum Sortieren ziehen">⠿</button></div>`).join('')||'<p class="muted">Noch keine Bauschritte hinterlegt.</p>'}`}
<div class="section-head"><h2>BAUZEITPROTOKOLL</h2></div>${(p.sessions||[]).slice().reverse().map(s=>`<div class="session"><span>${esc(s.date)} <small class="muted">${esc(s.started||'')}</small></span><b class="cyan">${fmt(s.duration)}</b></div>`).join('')||'<p class="muted">Noch keine Timersitzungen gespeichert.</p>'}
<div class="actions"><button class="btn" data-action="edit-project" data-id="${p.id}">BEARBEITEN</button><button class="btn danger" data-action="delete-project" data-id="${p.id}">LÖSCHEN</button></div></div></div>`;bind()}
function timer(){let p=runningProject()||active();$('#page-timer').innerHTML=`<button class="btn ghost" data-page="dashboard" style="margin-bottom:14px">‹ ZUR KOMMANDOZENTRALE</button>${heading('TIME TRACKING','BAUZEITTIMER','Jede Bausitzung wird dem aktiven Projekt zugeordnet.')}${p?`<div class="panel" style="max-width:700px;margin:auto;text-align:center"><div class="eyebrow">ACTIVE BUILD // ${esc(p.name)}</div><div class="timer-face ${p.runningSince?'running':''}"><strong id="timerDisplay">${fmt(elapsed(p))}</strong></div><div class="muted">${esc(p.modelLine||'')} · ${esc(p.grade||'')} · ${esc(p.scale||'')}</div><div class="actions" style="justify-content:center"><button class="btn primary" data-action="timer-start" ${p.runningSince?'disabled':''}>▶ START</button><button class="btn danger" data-action="timer-stop" ${!p.runningSince?'disabled':''}>■ STOP & SPEICHERN</button></div><p class="muted">Beim Stoppen wird die Sitzung sofort mit Datum und Dauer gespeichert.</p></div><div class="panel" style="margin-top:16px"><div class="section-head"><h2>ALLE TIMER-SITZUNGEN</h2><b class="cyan">${fmt(elapsed(p))} GESAMT</b></div>${(p.sessions||[]).slice().reverse().map(s=>`<div class="session"><span>${esc(s.date)} · ${esc(s.started||'')}</span><b class="cyan">${fmt(s.duration)}</b></div>`).join('')||'<p class="muted">Noch keine Sitzungen.</p>'}</div>`:'<div class="empty">Lege zuerst ein Projekt an und markiere es als aktiv.</div>'}`}
function diary(){ $('#page-diary').innerHTML=`${heading('BUILD LOG','BAUTAGEBUCH','Notizen und Beobachtungen zu deinen Bausitzungen.') }<div class="panel"><div class="field"><label>Eintrag</label><textarea id="diaryText" placeholder="Was hast du heute gebaut?"></textarea></div><button class="btn primary" data-action="add-diary">EINTRAG SPEICHERN</button></div><div class="panel" style="margin-top:15px">${data.diary.slice().reverse().map(d=>`<div class="list-item"><div><b>${esc(d.date)}</b><p>${esc(d.text)}</p></div><div class="actions"><button class="btn ghost" data-action="edit-diary" data-id="${d.id}">BEARBEITEN</button><button class="btn danger" data-action="delete-diary" data-id="${d.id}">LÖSCHEN</button></div></div>`).join('')||'<p class="muted">Noch keine Einträge.</p>'}</div>`}
function inventory(which){
 const arr=data[which],isPaint=which==='paints',title=isPaint?'PAINT LAB':'WERKZEUGE & MATERIALIEN',label=isPaint?'Farbe / Hersteller':'Werkzeug / Material';
 const root=$('#page-'+(isPaint?'paint':'tools'));
 root.innerHTML=`${heading('INVENTORY SYSTEM',title,'Dein persönlicher Modellbau-Bestand.')}
 <div class="panel"><div class="form-grid">
 <div class="field"><label for="${which}-name">${label}</label><input id="${which}-name" maxlength="100" placeholder="Bezeichnung"></div>
 <div class="field"><label for="${which}-note">Notiz (optional)</label><input id="${which}-note" maxlength="300" placeholder="Farbcode, Menge, Zustand …"></div></div>
 <button class="btn primary" data-action="add-inventory" data-kind="${which}">＋ HINZUFÜGEN</button></div>
 <div class="panel" style="margin-top:15px">${arr.map(x=>`<div class="list-item"><div><b>${esc(x.name)}</b><div class="muted">${esc(x.note||'')}</div></div>
 <div class="actions"><button class="btn ghost" data-action="edit-inventory" data-kind="${which}" data-id="${x.id}">BEARBEITEN</button>
 <button class="btn danger" data-action="delete-inventory" data-kind="${which}" data-id="${x.id}">LÖSCHEN</button></div></div>`).join('')||'<div class="empty">Noch keine Einträge vorhanden.</div>'}</div>`;
}
function inventoryEditor(kind,id){
 const entry=data[kind]?.find(x=>x.id===id);
 if(!entry)return;
 const isPaint=kind==='paints';
 $('#modal-root').innerHTML=`<div class="modal-backdrop" data-close><div class="modal" onclick="event.stopPropagation()">
 <div class="modal-head"><h2>${isPaint?'FARBE':'WERKZEUG'} BEARBEITEN</h2><button class="close" data-close aria-label="Schließen">×</button></div>
 <form id="inventoryEditForm"><div class="field"><label for="inventoryEditName">Bezeichnung</label><input id="inventoryEditName" maxlength="100" required value="${esc(entry.name)}"></div>
 <div class="field"><label for="inventoryEditNote">Notiz</label><textarea id="inventoryEditNote" maxlength="300">${esc(entry.note||'')}</textarea></div>
 <button class="btn primary" type="submit">ÄNDERUNGEN SPEICHERN</button></form></div></div>`;
 bind();
 $('#inventoryEditForm').onsubmit=e=>{
  e.preventDefault();
  const name=$('#inventoryEditName').value.trim();
  if(!name)return;
  entry.name=name;entry.note=$('#inventoryEditNote').value.trim();
  save();$('#modal-root').innerHTML='';render();toast('Eintrag aktualisiert.');
 };
}
function more(){ $('#page-more').innerHTML=`${heading('SYSTEM MODULES','MEHR','Weitere Bereiche deiner FRAME//ZERO-Werkstatt.') }<div class="more-grid"><button class="panel more-link" data-page="diary"><span class="more-icon">▤</span><b>BAUTAGEBUCH</b><small>Notizen und Bausitzungen</small></button><button class="panel more-link" data-page="paint"><span class="more-icon">◈</span><b>PAINT LAB</b><small>Farben und Lacke verwalten</small></button><button class="panel more-link" data-page="tools"><span class="more-icon">⚒</span><b>WERKZEUGE</b><small>Materialien und Zubehör</small></button><button class="panel more-link" data-page="profile"><span class="more-icon">◉</span><b>MEIN PROFIL</b><small>Pilotdaten bearbeiten</small></button><button class="panel more-link" data-page="settings"><span class="more-icon">⚙</span><b>EINSTELLUNGEN</b><small>Datensicherung und System</small></button></div>`}
function profile(){let p=data.profile;$('#page-profile').innerHTML=`${heading('PILOT IDENTIFICATION','MEIN PROFIL','Deine persönliche Kennung in FRAME//ZERO.') }<div class="panel" style="max-width:700px"><div class="card-row"><img class="avatar" src="${p.avatar||'icon-192.png'}" id="avatarPreview"><div><div class="eyebrow">PILOT PROFILE</div><h2>${esc(p.username||'Gundam Meister')}</h2><span class="muted">Dein Name erscheint auf der Kommandozentrale.</span></div></div><div class="field"><label>Benutzername</label><input id="username" maxlength="32" value="${esc(p.username)}" placeholder="Gundam Meister"></div><div class="field"><label>Profilbild / Avatar</label><input id="avatarFile" type="file" accept="image/*"><div class="file-note">Bild auswählen, Ausschnitt verschieben und bis zu 400 % zoomen. Das runde Profilbild wird lokal gespeichert.</div><button type="button" class="btn ghost" id="avatarRecrop">AKTUELLEN AUSSCHNITT BEARBEITEN</button></div><div class="field"><label>Kurzbeschreibung</label><textarea id="bio" placeholder="Dein Modellbau-Profil …">${esc(p.bio)}</textarea></div><div class="field"><label>Lieblings-Grades / Gunpla-Gebiet</label><input id="favorite" value="${esc(p.favorite)}" placeholder="z. B. Master Grade, Universal Century"></div><button class="btn primary" data-action="save-profile">PROFIL SPEICHERN</button></div>`}
function settings(){ $('#page-settings').innerHTML=`${heading('SYSTEM CONFIGURATION','EINSTELLUNGEN','Lokale Datensicherung und App-Verhalten.') }
<div class="panel glass-settings-panel"><h2>LIQUID GLASS</h2><p class="muted">Passe die Durchsichtigkeit der Glasflächen an. Die Änderung ist sofort sichtbar und bleibt gespeichert.</p>
<div class="glass-slider-head"><label for="glassSlider">TRANSPARENZ</label><strong id="glassValue">${glassLevel} %</strong></div>
<input id="glassSlider" class="glass-slider" type="range" min="0" max="100" step="1" value="${glassLevel}" aria-label="Liquid Glass Transparenz">
<div class="glass-slider-ends"><span>Wenig durchsichtig</span><span>Ganz durchsichtig</span></div>
<div class="glass-preview" aria-hidden="true"><div class="glass-preview-surface"><span>FRAME//ZERO</span><b>LIQUID GLASS // LIVE</b><small>Vorschau der Transparenz</small></div></div>
<p class="muted glass-info">Text und Bedienelemente bleiben gut sichtbar. Bei aktivierter iOS-Option „Transparenz reduzieren“ verwendet die App einen deckenderen Hintergrund.</p>
<button class="btn ghost" type="button" id="glassReset">STANDARD WIEDERHERSTELLEN</button></div>
<div class="grid two" style="margin-top:15px"><div class="panel"><h2>DATENSICHERUNG</h2><p class="muted">Exportiere deine Projekte, Timer, Sammlung und Profilinformationen als JSON-Datei.</p><div class="actions"><button class="btn primary" data-action="export">DATEN EXPORTIEREN</button><label class="btn ghost" style="display:inline-block">IMPORTIEREN<input id="importFile" type="file" accept="application/json" hidden></label></div></div><div class="panel"><h2>ANIMATIONEN</h2><p class="muted">Systemanimationen folgen der Einstellung „Bewegung reduzieren“ deines Geräts.</p><p class="muted">FRAME//ZERO speichert Daten lokal in diesem Browser. Regelmäßige Exporte werden empfohlen.</p></div></div><div class="panel" style="margin-top:15px"><h2>OFFLINE-STATUS</h2><p class="muted">${navigator.onLine?'Netzwerkverbindung vorhanden.':'Offline-Modus aktiv.'} Die App-Oberfläche wird nach dem ersten Online-Laden zwischengespeichert.</p><button class="btn danger" data-action="reset">ALLE LOKALEN DATEN LÖSCHEN</button></div>`;applyGlass(glassLevel)}
function render(){dashboard();
 const pilotRing=document.querySelector('.pilot-live-timer');
 if(pilotRing){
  const running=runningProject();
  const runningKey=running?String(running.id)+':'+String(running.runningSince):'';
  if(window.__pilotLiveEntranceKey===runningKey)pilotRing.classList.remove('pilot-live-enter');
  else window.__pilotLiveEntranceKey=runningKey;
 }else window.__pilotLiveEntranceKey='';
projects();hangar();timer();more();diary();inventory('paints');inventory('tools');profile();settings();bind();if(timerTick)clearInterval(timerTick);timerTick=setInterval(()=>{let d=$('#timerDisplay'),p=active();if(d&&p)d.textContent=fmt(elapsed(p));let r=runningProject(),dt=$('#dashboardTimer'),pilot=$('#pilotLiveTimer'),detail=$('#detailTimer');if(pilot&&r)pilot.textContent=fmt(elapsed(r));if(dt)dt.textContent=fmt(elapsed(r||active()));if(detail&&detailId){let dp=data.projects.find(x=>x.id===detailId);if(dp)detail.textContent=fmt(elapsed(dp));}},1000)}
function go(pg){page=pg;document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id==='page-'+pg));document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x.dataset.page===(['diary','paint','tools','profile','settings'].includes(pg)?'more':pg)));if(pg==='dashboard')dashboard();if(pg==='more')more();if(pg==='projects')projects();if(pg==='hangar')hangar();if(pg==='timer')timer();if(pg==='diary')diary();if(pg==='paint')inventory('paints');if(pg==='tools')inventory('tools');if(pg==='profile')profile();if(pg==='settings')settings();bind();window.scrollTo({top:0,behavior:'smooth'})}
function openProject(id){projectDetail(id)}
function modalForm(p){let editing=!!p;$('#modal-root').innerHTML=`<div class="modal-backdrop" data-close><div class="modal" onclick="event.stopPropagation()"><div class="modal-head"><h2>${editing?'PROJEKT BEARBEITEN':'NEUES MODELL ERFASSEN'}</h2><button class="close" data-close>×</button></div><form id="projectForm"><div class="form-grid"><div class="field wide"><label>Modellname *</label><input name="name" required maxlength="80" value="${esc(p?.name||'')}" placeholder="z. B. RX-78-2 Gundam"></div><div class="field"><label>Grade</label><select name="grade">${['','HG','RG','MG','PG','SD','EG','FM','FRM','FRS','RE/100','Sonstige'].concat(p?.grade&&!['','HG','RG','MG','PG','SD','EG','FM','FRM','FRS','RE/100','Sonstige'].includes(p.grade)?[p.grade]:[]).map(v=>`<option ${p?.grade===v?'selected':''} value="${v}">${v||'Bitte auswählen'}</option>`).join('')}</select></div><div class="field"><label>Modellreihe</label><select name="modelLine">${['','Gunpla','30MS','30MM','30MF','PokePla','Sonstige'].concat(p?.modelLine&&!['','Gunpla','30MS','30MM','30MF','PokePla','Sonstige'].includes(p.modelLine)?[p.modelLine]:[]).map(v=>`<option ${p?.modelLine===v?'selected':''} value="${esc(v)}">${v||'Bitte auswählen'}</option>`).join('')}</select></div><div class="field"><label>Modellmaßstab</label><select name="scale">${['','1/100','1/144','1/60','1/35'].concat(p?.scale&&!['','1/100','1/144','1/60','1/35'].includes(p.scale)?[p.scale]:[]).map(v=>`<option ${p?.scale===v?'selected':''} value="${v}">${v||'Bitte auswählen'}</option>`).join('')}</select></div><div class="field"><label>Serie</label><input name="series" value="${esc(p?.series||'')}"></div><div class="field"><label>Modellnummer</label><input name="number" value="${esc(p?.number||'')}"></div><div class="field wide old-project-option"><label class="old-project-check"><input type="checkbox" name="oldProject" id="oldProjectToggle" ${p?.oldProject?'checked':''}> <span>OLD PROJEKT – bereits früher gebaut (direkt in den Hangar)</span></label><small class="muted">Historische Modelle ohne laufenden Timer erfassen.</small></div><div id="oldProjectFields" class="old-project-fields field wide" ${p?.oldProject?'':'hidden'}><div class="form-grid"><div class="field"><label for="oldProjectDate">Abschlussdatum *</label><input type="date" id="oldProjectDate" name="oldProjectDate" value="${esc(p?.oldProjectDate||'')}"></div><div class="field"><label for="oldProjectHours">Bauzeit – Stunden *</label><input type="number" id="oldProjectHours" name="oldProjectHours" min="0" max="99999" step="1" value="${p?.oldProject?Math.floor((p.manualDuration||0)/3600000):''}" placeholder="z. B. 12"></div><div class="field"><label for="oldProjectMinutes">Bauzeit – Minuten *</label><input type="number" id="oldProjectMinutes" name="oldProjectMinutes" min="0" max="59" step="1" value="${p?.oldProject?Math.floor(((p.manualDuration||0)%3600000)/60000):''}" placeholder="z. B. 30"></div></div></div><div class="field wide"><label>PROJEKTBILDER (MAXIMAL 3)</label><div id="projectImageList" class="project-image-list"></div><label class="btn ghost gallery-add" for="projectImageFile">＋ BILD HINZUFÜGEN</label><input id="projectImageFile" type="file" accept="image/*" hidden><div class="file-note">Bilder können vergrößert, verschoben, zugeschnitten, ersetzt und entfernt werden. Gespeichert werden komprimierte Ausschnitte.</div></div><div class="field wide"><label>Beschreibung</label><textarea name="description">${esc(p?.description||'')}</textarea></div></div><button class="btn primary" type="submit">SPEICHERN</button></form></div></div>`;bind();
const oldToggle=$('#oldProjectToggle'),oldFields=$('#oldProjectFields');if(oldToggle&&oldFields){const update=()=>{oldFields.hidden=!oldToggle.checked;oldFields.querySelectorAll('input').forEach(el=>el.required=oldToggle.checked)};oldToggle.onchange=update;update()}
let draftImages=projectImages(p).slice();
const updateGalleryForm=()=>{
 const holder=$('#projectImageList');if(!holder)return;
 holder.innerHTML=draftImages.map((src,i)=>`<div class="project-image-item"><img src="${src}" alt="Projektbild ${i+1}"><div><b>Bild ${i+1}</b><div class="actions"><button type="button" class="btn ghost" data-image-edit="${i}">AUSSCHNITT</button><button type="button" class="btn ghost" data-image-replace="${i}">ERSETZEN</button><button type="button" class="btn danger" data-image-remove="${i}">ENTFERNEN</button></div></div></div>`).join('')||'<p class="muted">Noch keine Bilder ausgewählt.</p>';
 const add=$('#projectImageFile');add.disabled=draftImages.length>=3;
 const label=document.querySelector('label[for="projectImageFile"]');if(label)label.hidden=draftImages.length>=3;
 holder.querySelectorAll('[data-image-remove]').forEach(b=>b.onclick=()=>{draftImages.splice(+b.dataset.imageRemove,1);updateGalleryForm()});
 holder.querySelectorAll('[data-image-edit]').forEach(b=>b.onclick=async()=>{const i=+b.dataset.imageEdit;const blob=await (await fetch(draftImages[i])).blob();openCropEditor(blob,result=>{draftImages[i]=result;updateGalleryForm()})});
 holder.querySelectorAll('[data-image-replace]').forEach(b=>b.onclick=()=>chooseReplacement(+b.dataset.imageReplace));
};
function chooseReplacement(index){const input=document.createElement('input');input.type='file';input.accept='image/*';input.onchange=()=>{if(input.files[0])openCropEditor(input.files[0],result=>{draftImages[index]=result;updateGalleryForm()})};input.click()}
$('#projectImageFile').onchange=e=>{const file=e.target.files[0];e.target.value='';if(file&&draftImages.length<3)openCropEditor(file,result=>{draftImages.push(result);updateGalleryForm()})};
updateGalleryForm();
$('#projectForm').onsubmit=async e=>{e.preventDefault();let f=e.target,fd=new FormData(f);let obj={name:fd.get('name').trim(),grade:fd.get('grade'),modelLine:fd.get('modelLine'),scale:fd.get('scale'),series:fd.get('series'),number:fd.get('number'),description:fd.get('description'),images:draftImages.slice(0,3),image:draftImages[0]||''};const isOld=fd.get('oldProject')==='on';let manualDuration=0,oldDate='';if(isOld){const h=Number(fd.get('oldProjectHours')),m=Number(fd.get('oldProjectMinutes'));oldDate=String(fd.get('oldProjectDate')||'');if(!/^\d{4}-\d{2}-\d{2}$/.test(oldDate)||!Number.isInteger(h)||!Number.isInteger(m)||h<0||h>99999||m<0||m>59||(h===0&&m===0)){alert('Bitte gültiges Abschlussdatum und eine Bauzeit über 0 Minuten eingeben.');return}manualDuration=(h*60+m)*60000;}obj.oldProject=isOld;obj.oldProjectDate=isOld?oldDate:'';obj.manualDuration=isOld?manualDuration:0;const before=JSON.stringify(data);if(p){if(isOld&&p.runningSince){alert('Bitte zuerst den laufenden Timer stoppen.');return}if(p.oldProject){p.sessions=(p.sessions||[]).filter(x=>!x.manualOld)}Object.assign(p,obj);if(isOld){p.status='completed';p.completedDate=oldDate;p.runningSince=null;p.sessions=[...(p.sessions||[]),{date:oldDate.split('-').reverse().join('.'),started:'Manuell erfasst',duration:manualDuration,manualOld:true}];}else if(p.oldProject===false&&p.status==='completed'&&!p.steps?.some(x=>x.done)){p.status='open'}if(completed(p)&&data.activeId===p.id)data.activeId=null;}else{let np={...obj,id:newId(),steps:isOld?[]:['Vorbereitung','Zusammenbau','Detailarbeiten','Decals','Abschluss'].map(name=>({name,done:false})),sessions:isOld?[{date:oldDate.split('-').reverse().join('.'),started:'Manuell erfasst',duration:manualDuration,manualOld:true}]:[],runningSince:null,status:isOld?'completed':'open',completedDate:isOld?oldDate:'',created:today()};data.projects.push(np);if(!isOld&&(!data.activeId||!data.projects.some(x=>x.id===data.activeId&&!completed(x))))data.activeId=np.id;}if(!save()){data=JSON.parse(before);return}$('#modal-root').innerHTML='';render();toast('Projekt gespeichert.');};}
function openCropEditor(file,onSave){
 if(!file.type.startsWith('image/')){alert('Bitte eine Bilddatei auswählen.');return}
 const url=URL.createObjectURL(file),image=new Image();
 image.onload=()=>{
  const editor=document.createElement('div');editor.className='crop-overlay';editor.innerHTML=`<div class="crop-dialog" role="dialog" aria-modal="true" aria-label="Bildausschnitt wählen"><div class="modal-head"><h2>BILDAUSSCHNITT</h2><button class="close" type="button" data-crop-cancel aria-label="Schließen">×</button></div><p class="muted">Mit einem Finger verschieben, mit dem Regler zoomen. Der quadratische Ausschnitt wird gespeichert.</p><div class="crop-stage"><canvas id="cropCanvas" width="600" height="600" aria-label="Vorschau des Bildausschnitts"></canvas></div><div class="field"><label for="cropZoom">Zoom: <span id="cropZoomValue">100 %</span></label><input id="cropZoom" type="range" min="100" max="400" value="100" step="1"></div><div class="actions"><button class="btn ghost" type="button" data-crop-reset>ZURÜCKSETZEN</button><button class="btn primary" type="button" data-crop-save>AUSSCHNITT ÜBERNEHMEN</button></div></div>`;
  document.body.appendChild(editor);
  const canvas=editor.querySelector('canvas'),ctx=canvas.getContext('2d');let zoom=1,ox=0,oy=0,drag=null;
  const minScale=Math.max(600/image.naturalWidth,600/image.naturalHeight);
  function clamp(){const w=image.naturalWidth*minScale*zoom,h=image.naturalHeight*minScale*zoom;ox=Math.max((600-w)/2,Math.min((w-600)/2,ox));oy=Math.max((600-h)/2,Math.min((h-600)/2,oy))}
  function draw(){clamp();ctx.clearRect(0,0,600,600);const w=image.naturalWidth*minScale*zoom,h=image.naturalHeight*minScale*zoom;ctx.drawImage(image,(600-w)/2+ox,(600-h)/2+oy,w,h)}
  const close=()=>{editor.remove();URL.revokeObjectURL(url)};
  editor.querySelector('[data-crop-cancel]').onclick=close;
  editor.querySelector('[data-crop-reset]').onclick=()=>{zoom=1;ox=oy=0;editor.querySelector('#cropZoom').value=100;editor.querySelector('#cropZoomValue').textContent='100 %';draw()};
  editor.querySelector('#cropZoom').oninput=e=>{const next=+e.target.value/100;const ratio=next/zoom;ox*=ratio;oy*=ratio;zoom=next;editor.querySelector('#cropZoomValue').textContent=e.target.value+' %';draw()};
  canvas.onpointerdown=e=>{drag={x:e.clientX,y:e.clientY,ox,oy};canvas.setPointerCapture(e.pointerId)};
  canvas.onpointermove=e=>{if(!drag)return;const r=canvas.getBoundingClientRect();ox=drag.ox+(e.clientX-drag.x)*600/r.width;oy=drag.oy+(e.clientY-drag.y)*600/r.height;draw()};
  canvas.onpointerup=canvas.onpointercancel=()=>{drag=null};
  editor.querySelector('[data-crop-save]').onclick=()=>{try{const out=document.createElement('canvas');out.width=out.height=480;out.getContext('2d').drawImage(canvas,0,0,480,480);onSave(out.toDataURL('image/jpeg',.7));close()}catch(err){alert('Bild konnte nicht gespeichert werden.')}};
  draw();
 };
 image.onerror=()=>{URL.revokeObjectURL(url);alert('Dieses Bildformat kann nicht geöffnet werden.')};
 image.src=url;
}
function galleryViewer(id,index){
 const p=data.projects.find(x=>x.id===id),images=p&&projectImages(p);if(!images?.length)return;
 let current=Math.max(0,Math.min(images.length-1,index));
 const overlay=document.createElement('div');overlay.className='gallery-overlay';overlay.innerHTML=`<div class="gallery-viewer" role="dialog" aria-modal="true" aria-label="Projektbilder"><div class="modal-head"><h2>BILDER ANSEHEN</h2><button class="close" type="button" aria-label="Schließen">×</button></div><img alt="Projektbild vergrößert"><div class="actions"><button class="btn ghost" data-prev>‹ ZURÜCK</button><span class="gallery-counter"></span><button class="btn ghost" data-next>WEITER ›</button></div><p class="muted">Bild mit zwei Fingern vergrößern oder verkleinern.</p></div>`;
 document.body.appendChild(overlay);
 const photo=overlay.querySelector('img');let scale=1;
 function show(){photo.src=images[current];photo.style.transform='scale(1)';scale=1;overlay.querySelector('.gallery-counter').textContent=(current+1)+' / '+images.length;overlay.querySelector('[data-prev]').disabled=current===0;overlay.querySelector('[data-next]').disabled=current===images.length-1}
 overlay.querySelector('.close').onclick=()=>overlay.remove();overlay.onclick=e=>{if(e.target===overlay)overlay.remove()};
 overlay.querySelector('[data-prev]').onclick=()=>{if(current>0){current--;show()}};
 overlay.querySelector('[data-next]').onclick=()=>{if(current<images.length-1){current++;show()}};
 photo.ondblclick=()=>{scale=scale===1?2:1;photo.style.transform=`scale(${scale})`};
 photo.onwheel=e=>{e.preventDefault();scale=Math.max(1,Math.min(4,scale+(e.deltaY<0?.2:-.2)));photo.style.transform=`scale(${scale})`};
 show();
}
function readImage(file){return new Promise((resolve,reject)=>{let r=new FileReader();r.onload=()=>{let im=new Image();im.onload=()=>{let c=document.createElement('canvas'),max=700,scale=Math.min(1,max/Math.max(im.width,im.height));c.width=im.width*scale;c.height=im.height*scale;c.getContext('2d').drawImage(im,0,0,c.width,c.height);resolve(c.toDataURL('image/jpeg',.78))};im.onerror=reject;im.src=r.result};r.onerror=reject;r.readAsDataURL(file)})}
// Drag sorting: dedicated touch handle avoids accidental checkbox toggles and preserves scrolling elsewhere.
function bindStepSorting(){
 document.querySelectorAll('.step-drag-handle').forEach(handle=>{
  handle.onpointerdown=e=>{
   if(e.button!==0 || !e.isPrimary)return;
   const row=handle.closest('.step-sort-row'),projectId=row?.dataset.project;
   const p=data.projects.find(x=>x.id===projectId);
   if(!row||!p)return;
   e.preventDefault();
   const start=+row.dataset.sortStep;
   let target=start,moved=false;
   const rows=()=>[...document.querySelectorAll(`.step-sort-row[data-project="${projectId}"]`)];
   row.classList.add('step-dragging');
   handle.setPointerCapture(e.pointerId);
   const move=ev=>{
    ev.preventDefault();
    if(Math.abs(ev.clientY-e.clientY)>6)moved=true;
    const others=rows();
    const hit=others.find(r=>{const b=r.getBoundingClientRect();return ev.clientY>=b.top&&ev.clientY<=b.bottom});
    if(hit){target=+hit.dataset.sortStep;others.forEach(r=>r.classList.toggle('step-drop-target',r===hit&&r!==row));}
    const modal=row.closest('.modal');if(modal){const bounds=modal.getBoundingClientRect();if(ev.clientY>bounds.bottom-48)modal.scrollTop+=12;else if(ev.clientY<bounds.top+48)modal.scrollTop-=12;}
   };
   const end=ev=>{
    handle.removeEventListener('pointermove',move);
    handle.removeEventListener('pointerup',end);
    handle.removeEventListener('pointercancel',cancel);
    row.classList.remove('step-dragging');rows().forEach(r=>r.classList.remove('step-drop-target'));
    if(handle.hasPointerCapture(ev.pointerId))handle.releasePointerCapture(ev.pointerId);
    if(!moved||target===start)return;
    const previous=p.steps.slice();const [item]=p.steps.splice(start,1);p.steps.splice(target,0,item);
    if(!save()){p.steps=previous;toast('Reihenfolge konnte nicht gespeichert werden.');return;}
    const modal=row.closest('.modal');const scroll=modal?.scrollTop||0;
    projectDetail(projectId);
    const updated=$('#modal-root .modal');if(updated)updated.scrollTop=scroll;
    toast('Bauschritt verschoben.');
   };
   const cancel=ev=>{handle.removeEventListener('pointermove',move);handle.removeEventListener('pointerup',end);handle.removeEventListener('pointercancel',cancel);row.classList.remove('step-dragging');rows().forEach(r=>r.classList.remove('step-drop-target'));};
   handle.addEventListener('pointermove',move);handle.addEventListener('pointerup',end);handle.addEventListener('pointercancel',cancel);
  };
 });
}
function bind(){bindStepSorting();document.querySelectorAll('[data-build-stats]').forEach(b=>b.onclick=()=>showBuildStats());document.querySelectorAll('[data-gallery-view]').forEach(b=>b.onclick=()=>galleryViewer(b.dataset.galleryView,+b.dataset.index));document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>go(b.dataset.page));document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>openProject(b.dataset.open));document.querySelectorAll('[data-active]').forEach(b=>b.onclick=e=>{e.stopPropagation();data.activeId=b.dataset.active;save();$('#modal-root').innerHTML='';render();toast('Aktives Projekt geändert.');});document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>{detailId=null;$('#modal-root').innerHTML=''});document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>action(b.dataset.action,b));document.querySelectorAll('[data-step]').forEach(c=>c.onchange=()=>{let p=data.projects.find(x=>x.id===c.dataset.step);if(!p)return;const step=p.steps[+c.dataset.index];if(!step)return;const previous=step.done;step.done=c.checked;if(!save()){step.done=previous;c.checked=previous;return}c.closest('.checkrow')?.classList.toggle('done',c.checked);const modal=c.closest('.modal');if(modal){const bar=modal.querySelector('.detail-hero .progress i');if(bar)bar.style.width=pct(p)+'%';const label=modal.querySelector('.detail-hero .cyan');if(label)label.textContent=pct(p)+' % abgeschlossen';}dashboard();projects();hangar();bind();});let av=$('#avatarFile');if(av)av.onchange=()=>{const file=av.files?.[0];av.value='';if(file)openCropEditor(file,result=>{const preview=$('#avatarPreview');if(preview){preview.src=result;preview.dataset.new=result}})};let recrop=$('#avatarRecrop');if(recrop)recrop.onclick=async()=>{const preview=$('#avatarPreview');if(!preview)return;const src=preview.dataset.new||data.profile.avatar;if(!src){toast('Bitte zuerst ein Profilbild auswählen.');return}try{const blob=await(await fetch(src)).blob();openCropEditor(blob,result=>{const current=$('#avatarPreview');if(current){current.src=result;current.dataset.new=result}})}catch(err){toast('Bild konnte nicht geöffnet werden.')}};let imp=$('#importFile');if(imp)imp.onchange=importData;
let glass=$('#glassSlider');if(glass)glass.oninput=()=>{applyGlass(glass.value);try{localStorage.setItem(GLASS_KEY,String(glassLevel))}catch{}};
let glassReset=$('#glassReset');if(glassReset)glassReset.onclick=()=>{applyGlass(55);try{localStorage.setItem(GLASS_KEY,'55')}catch{}};
}
async function action(a,b){let id=b.dataset.id,p=data.projects.find(x=>x.id===id);switch(a){
case'new-project':modalForm();break;
case'edit-project':modalForm(p);break;
case'delete-project':if(confirm(`Projekt „${p.name}“ und seine zugehörigen Bauzeiten und Projektdaten wirklich löschen?`)){if(p.runningSince){p.sessions.push({date:today(),started:new Date(p.runningSince).toLocaleTimeString('de-DE'),duration:Date.now()-p.runningSince});}data.projects=data.projects.filter(x=>x.id!==id);if(data.activeId===id)data.activeId=data.projects.find(x=>x.id!==id&&!completed(x))?.id||null;save();$('#modal-root').innerHTML='';render();toast('Projekt gelöscht.')}break;
case'add-step':{let n=prompt('Name des neuen Bauschritts:');if(n?.trim()){p.steps.push({name:n.trim(),done:false});save();projectDetail(id)}}break;
case'timer-start':{p=id?data.projects.find(x=>x.id===id):active();let other=runningProject();if(other&&other.id!==p?.id){toast('Bitte zuerst den laufenden Timer stoppen.');break;}if(p&&!completed(p)&&!p.runningSince){data.activeId=p.id;p.runningSince=Date.now();p.lastStarted=new Date().toLocaleTimeString('de-DE');if(save()){render();if(detailId)projectDetail(detailId)}}}break;
case'pilot-timer-stop':{
 // Keep the ring mounted during its exit animation, then reuse the existing
 // stop-and-save logic so sessions and totals are recorded exactly as before.
 const ring=b.closest('.pilot-live-timer');
 if(!ring||ring.dataset.stopping==='true')break;
 const running=runningProject();
 if(!running||running.id!==id)break;
 ring.dataset.stopping='true';ring.disabled=true;
 ring.classList.remove('pilot-live-enter');
 ring.classList.add('pilot-live-exit');
 const reduceMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 window.setTimeout(()=>{if(runningProject()?.id===id)action('timer-stop',b)},reduceMotion?0:430);
 break;
}
case'timer-stop':{p=id?data.projects.find(x=>x.id===id):runningProject();if(p?.runningSince){let end=Date.now(),duration=Math.max(0,end-p.runningSince);p.sessions.push({date:today(),started:p.lastStarted||'',duration});p.runningSince=null;p.lastStarted=null;if(save()){render();if(detailId)projectDetail(detailId);toast('Timersitzung gespeichert.')}}}break;
case'toggle-completed':if(p){if(!completed(p)&&p.runningSince){let end=Date.now();p.sessions.push({date:today(),started:p.lastStarted||'',duration:end-p.runningSince});p.runningSince=null;p.lastStarted=null}const wasCompleted=completed(p);p.status=wasCompleted?'open':'completed';p.completedDate=wasCompleted?'':today();if(completed(p)&&data.activeId===p.id)data.activeId=openProjects().find(x=>x.id!==p.id)?.id||null;if(!completed(p)&&!active())data.activeId=p.id;save();$('#modal-root').innerHTML='';detailId=null;render();toast(completed(p)?'Projekt in den Hangar verschoben.':'Projekt wieder geöffnet.')}break;
case'edit-diary':{let d=data.diary.find(x=>x.id===id);if(!d)break;let t=prompt('Tagebucheintrag bearbeiten:',d.text);if(t!==null&&t.trim()){d.text=t.trim();let date=prompt('Datum des Eintrags (TT.MM.JJJJ):',d.date);if(date!==null&&/^\d{2}\.\d{2}\.\d{4}$/.test(date.trim()))d.date=date.trim();save();render();toast('Tagebucheintrag aktualisiert.')}}break;
case'add-diary':{let t=$('#diaryText').value.trim();if(t){data.diary.push({id:newId(),date:today(),text:t,projectId:data.activeId});save();render();toast('Tagebucheintrag gespeichert.')}}break;
case'delete-diary':if(confirm('Eintrag löschen?')){data.diary=data.diary.filter(x=>x.id!==id);save();render()}break;
case'add-inventory':{let kind=b.dataset.kind,n=$('#'+kind+'-name').value.trim();if(!n){alert('Bitte eine Bezeichnung eingeben.');break;}data[kind].push({id:newId(),name:n,note:$('#'+kind+'-note').value.trim()});save();render();toast('Eintrag hinzugefügt.')}break;
case'edit-inventory':inventoryEditor(b.dataset.kind,id);break;
case'delete-inventory':{let kind=b.dataset.kind,entry=data[kind]?.find(x=>x.id===id);if(entry&&confirm('„'+entry.name+'“ wirklich löschen?')){data[kind]=data[kind].filter(x=>x.id!==id);save();render();toast('Eintrag gelöscht.')}}break;
case'save-profile':data.profile.username=$('#username').value.trim();data.profile.bio=$('#bio').value;data.profile.favorite=$('#favorite').value;let avatar=$('#avatarPreview').dataset.new;if(avatar)data.profile.avatar=avatar;save();render();toast('Profil gespeichert.');break;
case'export':{let blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='FRAME-ZERO-Backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();URL.revokeObjectURL(u);toast('Datensicherung exportiert.')}break;
case'reset':if(confirm('Wirklich alle FRAME//ZERO-Daten auf diesem Gerät löschen? Dieser Vorgang kann nicht rückgängig gemacht werden.')){localStorage.removeItem(KEY);data=fresh();render();toast('Lokale Daten gelöscht.')}break;
}}
function importData(e){let file=e.target.files[0];if(!file)return;let r=new FileReader();r.onload=()=>{try{let d=JSON.parse(r.result);if(!d.projects||!d.profile)throw Error();data=d;save();render();toast('Datensicherung importiert.')}catch{alert('Die Datei ist keine gültige FRAME//ZERO-Sicherung.')}};r.readAsText(file)}
if($('#profileShortcut'))$('#profileShortcut').onclick=()=>go('profile');
document.querySelectorAll('.brand').forEach(x=>x.onclick=()=>go('dashboard'));
document.querySelectorAll('.nav').forEach(x=>x.onclick=()=>go(x.dataset.page));
$('#clock').textContent='SYSTEM ONLINE // '+new Date().toLocaleDateString('de-DE');
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
render();go('dashboard');
})();
/* v35: modal/keyboard-aware dock; avoid moving it into the visible keyboard area. */
(function initDockSafety(){
 const root=document.getElementById('modal-root');
 const dock=document.querySelector('.bottom-nav');
 if(!root||!dock)return;
 const sync=()=>{
  const hasModal=!!root.querySelector('.modal-backdrop');
  const el=document.activeElement;
  const isEditing=el&&(/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)||el.isContentEditable);
  document.body.classList.toggle('fz-modal-open',hasModal);
  document.body.classList.toggle('fz-keyboard-open',!!isEditing);
  dock.setAttribute('aria-hidden',hasModal||!!isEditing?'true':'false');
  dock.inert=!!(hasModal||isEditing);
 };
 new MutationObserver(sync).observe(root,{childList:true,subtree:true});
 document.addEventListener('focusin',sync,true);
 document.addEventListener('focusout',()=>requestAnimationFrame(sync),true);
 window.addEventListener('pageshow',sync);
 window.addEventListener('resize',sync,{passive:true});
 if(window.visualViewport)window.visualViewport.addEventListener('resize',sync,{passive:true});
 sync();
})();
