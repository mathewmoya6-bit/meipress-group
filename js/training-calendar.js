const CALENDAR_DATA=[
{month:"October",year:2025,programs:[{type:"education",title:"International Education – Spring Intake",desc:"Applications and counselling for international study opportunities.",tag:"Education"}]},
{month:"November",year:2025,programs:[{type:"education",title:"International Education – Applications",desc:"Application support, admissions guidance and document preparation.",tag:"Education"}]},
{month:"December",year:2025,programs:[{type:"education",title:"International Education – January Intake",desc:"Final application support and January intake preparation.",tag:"Education"}]},
{month:"January",year:2026,programs:[{type:"education",title:"International Education – New Intake",desc:"Study-abroad counselling and admissions support.",tag:"Education"}]},
{month:"February",year:2026,programs:[{type:"education",title:"International Education – Applications",desc:"University applications and student counselling.",tag:"Education"}]},
{month:"March",year:2026,programs:[{type:"education",title:"International Education – Intake Planning",desc:"Admissions and study-abroad planning.",tag:"Education"}]},
{month:"April",year:2026,programs:[{type:"education",title:"International Education – Counselling",desc:"International education counselling and application support.",tag:"Education"}]},
{month:"May",year:2026,programs:[{type:"education",title:"International Education – Applications",desc:"University application and admissions support.",tag:"Education"}]},
{month:"June",year:2026,programs:[{type:"education",title:"International Education – Intake",desc:"Study-abroad applications and student guidance.",tag:"Education"}]},
{month:"July",year:2026,programs:[{type:"education",title:"International Education – Counselling",desc:"International education and admissions counselling.",tag:"Education"}]},
{month:"August",year:2026,programs:[{type:"education",title:"International Education – Applications",desc:"University applications and admissions guidance.",tag:"Education"}]},
{month:"September",year:2026,programs:[{type:"education",title:"International Education – Intake Planning",desc:"Study-abroad admissions and application preparation.",tag:"Education"}]}
];

let activeFilter="all";
let dbSessions=[];

function escapeHTML(value){
return String(value??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}

function getProgramIcon(type){
return type==="roadsafety"?"🚗":type==="osh"?"🦺":"🎓";
}

function getSessionType(service){
return service==="Road Safety Training"?"roadsafety":"osh";
}

function formatDate(date){
if(!date)return"";
return new Date(date+"T00:00:00").toLocaleDateString("en-KE",{day:"numeric",month:"short",year:"numeric"});
}

function formatTime(time){
if(!time)return"";
return new Date("2000-01-01T"+time).toLocaleTimeString("en-KE",{hour:"numeric",minute:"2-digit"});
}

function updateHighlights(){
const road=dbSessions.filter(s=>getSessionType(s.service)==="roadsafety").length;
const osh=dbSessions.filter(s=>getSessionType(s.service)==="osh").length;
const months=new Set(dbSessions.map(s=>s.session_date?.substring(0,7))).size;
const month=document.getElementById("monthCount");
const roadCount=document.getElementById("roadCount");
const oshCount=document.getElementById("oshCount");
const total=document.getElementById("totalCount");
if(month)month.textContent=months;
if(roadCount)roadCount.textContent=road;
if(oshCount)oshCount.textContent=osh;
if(total)total.textContent=dbSessions.length;
}

function renderSession(session){
const type=getSessionType(session.service);
const price=Number(session.price||0);
return `<div class="program ${type}" data-type="${type}">
<div class="program-icon">${getProgramIcon(type)}</div>
<div class="program-content">
<div class="program-tag">${escapeHTML(type==="roadsafety"?"Road Safety":"OSH")}</div>
<h3>${escapeHTML(session.session_title)}</h3>
<p>${escapeHTML(session.description||"Professional training programme.")}</p>
<div class="program-meta">
<span>📅 ${formatDate(session.session_date)}</span>
<span>🕐 ${formatTime(session.start_time)} – ${formatTime(session.end_time)}</span>
<span>📍 ${escapeHTML(session.venue||session.location||"MEI Group")}</span>
<span>👥 ${session.capacity||0} places</span>
${price>0?`<span>💰 KES ${price.toLocaleString()}</span>`:"<span>💰 Contact MEI Group</span>"}
</div>
<div class="program-bottom">
<span class="program-status">${escapeHTML(session.status||"open")}</span>
<a class="register-btn" href="register.html?session_id=${encodeURIComponent(session.id)}">Register</a>
</div>
</div>
</div>`;
}

function renderEducation(program){
return `<div class="program education" data-type="education">
<div class="program-icon">🎓</div>
<div class="program-content">
<div class="program-tag">Education</div>
<h3>${escapeHTML(program.title)}</h3>
<p>${escapeHTML(program.desc)}</p>
<div class="program-bottom">
<span class="program-status">Information</span>
<a class="register-btn" href="education.html">Learn More</a>
</div>
</div>
</div>`;
}

function renderCalendar(){
const grid=document.getElementById("calendarGrid");
if(!grid)return;

let html="";
const grouped={};

dbSessions.forEach(session=>{
const d=new Date(session.session_date+"T00:00:00");
const key=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");
if(!grouped[key]){
grouped[key]={
month:d.toLocaleString("en-US",{month:"long"}),
year:d.getFullYear(),
sessions:[]
};
}
grouped[key].sessions.push(session);
});

Object.values(grouped).forEach(group=>{
const sessions=group.sessions.filter(session=>{
return activeFilter==="all"||getSessionType(session.service)===activeFilter;
});
if(!sessions.length)return;

html+=`<section class="calendar-month">
<div class="month-header">
<h2>${group.month} ${group.year}</h2>
<span>${sessions.length} session${sessions.length===1?"":"s"}</span>
</div>
<div class="program-list">
${sessions.map(renderSession).join("")}
</div>
</section>`;
});

if(activeFilter==="all"||activeFilter==="education"){
CALENDAR_DATA.forEach(month=>{
if(activeFilter!=="all"&&activeFilter!=="education")return;
html+=`<section class="calendar-month">
<div class="month-header">
<h2>${month.month} ${month.year}</h2>
<span>Education</span>
</div>
<div class="program-list">
${month.programs.map(renderEducation).join("")}
</div>
</section>`;
});
}

if(!html)html='<div class="empty-state">No training sessions found.</div>';

grid.innerHTML=html;
}

async function loadTrainingSessions(){
const grid=document.getElementById("calendarGrid");

try{
if(!window.supabaseClient){
if(typeof supabase==="undefined"){
throw new Error("Supabase JavaScript library was not loaded.");
}

if(!window.SUPABASE_URL){
throw new Error("SUPABASE_URL is missing from js/config.js.");
}

if(!window.SUPABASE_ANON_KEY){
throw new Error("SUPABASE_ANON_KEY is missing from js/config.js.");
}

window.supabaseClient=supabase.createClient(
window.SUPABASE_URL,
window.SUPABASE_ANON_KEY
);
}

console.log("Supabase connected:",window.SUPABASE_URL);

const{data,error}=await window.supabaseClient
.from("training_sessions")
.select("*")
.eq("published",true)
.not("status","in","(cancelled,postponed)")
.order("session_date",{ascending:true})
.order("start_time",{ascending:true});

if(error)throw error;

console.log("Training sessions returned:",data);

dbSessions=data||[];

updateHighlights();
renderCalendar();

if(!dbSessions.length){
if(grid){
grid.innerHTML=`<div class="empty-state">
<strong>No published training sessions were returned.</strong>
<p>Supabase connected successfully, but the browser could not retrieve the 10 sessions.</p>
</div>`;
}
}

}catch(error){
console.error("TRAINING CALENDAR ERROR:",error);

if(grid){
grid.innerHTML=`<div class="empty-state">
<strong>Training calendar connection error</strong>
<p>${escapeHTML(error.message||"Unknown error")}</p>
</div>`;
}

const month=document.getElementById("monthCount");
const road=document.getElementById("roadCount");
const osh=document.getElementById("oshCount");
const total=document.getElementById("totalCount");

if(month)month.textContent="0";
if(road)road.textContent="0";
if(osh)osh.textContent="0";
if(total)total.textContent="0";
}
}

function initializeFilters(){
document.querySelectorAll(".filter-btn").forEach(button=>{
if(button.id==="downloadPdf")return;

button.addEventListener("click",()=>{
document.querySelectorAll(".filter-btn").forEach(b=>b.classList.remove("active"));
button.classList.add("active");

activeFilter=button.dataset.filter||"all";

if(activeFilter==="road-safety")activeFilter="roadsafety";

renderCalendar();
});
});
}

function initializeDownload(){
const button=document.getElementById("downloadPdf");
if(button){
button.addEventListener("click",()=>{
window.print();
});
}
}

document.addEventListener("DOMContentLoaded",async()=>{
if(typeof meiInitCommon==="function")meiInitCommon();
initializeFilters();
initializeDownload();
await loadTrainingSessions();
});
