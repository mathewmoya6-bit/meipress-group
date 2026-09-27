const CALENDAR_DATA=[
{month:"October",year:2025,programs:[
{type:"education",title:"International Education – Spring Intake",desc:"Applications and counselling for international study opportunities.",tag:"Education"},
{type:"roadsafety",title:"Road Safety Awareness",desc:"Practical road safety awareness and responsible road-user behaviour.",tag:"Road Safety"},
{type:"osh",title:"First Aid Training",desc:"Workplace first aid awareness and emergency response.",tag:"OSH"}]},
{month:"November",year:2025,programs:[
{type:"education",title:"International Education – Applications",desc:"Application support, admissions guidance and document preparation.",tag:"Education"},
{type:"roadsafety",title:"Defensive Driving Training",desc:"Hazard perception, defensive driving and accident prevention.",tag:"Road Safety"},
{type:"osh",title:"Fire Safety Training",desc:"Fire prevention, emergency response and evacuation procedures.",tag:"OSH"}]},
{month:"December",year:2025,programs:[
{type:"education",title:"International Education – January Intake",desc:"Final application support and January intake preparation.",tag:"Education"},
{type:"roadsafety",title:"Fleet Safety Management",desc:"Fleet risk management, driver monitoring and vehicle safety.",tag:"Road Safety"},
{type:"osh",title:"Occupational Safety & Health",desc:"Workplace safety, risk assessment and OSH awareness.",tag:"OSH"}]},
{month:"January",year:2026,programs:[
{type:"education",title:"International Education – New Intake",desc:"Study-abroad counselling and admissions support.",tag:"Education"},
{type:"roadsafety",title:"Road Safety Awareness",desc:"Road safety awareness and risk prevention.",tag:"Road Safety"},
{type:"osh",title:"First Aid Training",desc:"First aid procedures and emergency response.",tag:"OSH"}]},
{month:"February",year:2026,programs:[
{type:"education",title:"International Education – Applications",desc:"University applications and student counselling.",tag:"Education"},
{type:"roadsafety",title:"Defensive Driving Training",desc:"Defensive driving techniques and hazard management.",tag:"Road Safety"},
{type:"osh",title:"Fire Safety Training",desc:"Fire prevention and workplace emergency procedures.",tag:"OSH"}]},
{month:"March",year:2026,programs:[
{type:"education",title:"International Education – Intake Planning",desc:"Admissions and study-abroad planning.",tag:"Education"},
{type:"roadsafety",title:"Fleet Safety Management",desc:"Fleet safety policies and driver risk management.",tag:"Road Safety"},
{type:"osh",title:"Occupational Safety & Health",desc:"Workplace OSH awareness and risk assessment.",tag:"OSH"}]},
{month:"April",year:2026,programs:[
{type:"education",title:"International Education – Counselling",desc:"International education counselling and application support.",tag:"Education"},
{type:"roadsafety",title:"Road Safety Awareness",desc:"Road safety awareness and accident prevention.",tag:"Road Safety"},
{type:"osh",title:"First Aid Training",desc:"First aid and workplace emergency response.",tag:"OSH"}]},
{month:"May",year:2026,programs:[
{type:"education",title:"International Education – Applications",desc:"University application and admissions support.",tag:"Education"},
{type:"roadsafety",title:"Defensive Driving Training",desc:"Defensive driving and hazard perception.",tag:"Road Safety"},
{type:"osh",title:"Fire Safety Training",desc:"Fire prevention, evacuation and emergency response.",tag:"OSH"}]},
{month:"June",year:2026,programs:[
{type:"education",title:"International Education – Intake",desc:"Study-abroad applications and student guidance.",tag:"Education"},
{type:"roadsafety",title:"Fleet Safety Management",desc:"Fleet risk management and driver safety.",tag:"Road Safety"},
{type:"osh",title:"Occupational Safety & Health",desc:"Occupational safety, health and workplace risk management.",tag:"OSH"}]},
{month:"July",year:2026,programs:[
{type:"education",title:"International Education – Counselling",desc:"International education and admissions counselling.",tag:"Education"},
{type:"roadsafety",title:"Road Safety Awareness",desc:"Road safety awareness and responsible road use.",tag:"Road Safety"},
{type:"osh",title:"First Aid Training",desc:"First aid awareness and emergency response.",tag:"OSH"}]},
{month:"August",year:2026,programs:[
{type:"education",title:"International Education – Applications",desc:"University applications and admissions guidance.",tag:"Education"},
{type:"roadsafety",title:"Defensive Driving Training",desc:"Defensive driving and accident prevention.",tag:"Road Safety"},
{type:"osh",title:"Fire Safety Training",desc:"Fire safety awareness and emergency procedures.",tag:"OSH"}]},
{month:"September",year:2026,programs:[
{type:"education",title:"International Education – Intake Planning",desc:"Study-abroad admissions and application preparation.",tag:"Education"},
{type:"roadsafety",title:"Fleet Safety Management",desc:"Fleet safety management and driver risk control.",tag:"Road Safety"},
{type:"osh",title:"Occupational Safety & Health",desc:"Workplace OSH awareness and compliance.",tag:"OSH"}]}
];

let activeFilter="all";
let dbSessions=[];

function escapeHTML(value){
return String(value??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}

function getProgramIcon(type){
return type==="roadsafety"?"🚗":type==="osh"?"🦺":"🎓";
}

function formatDate(date){
if(!date)return"";
return new Date(date+"T00:00:00").toLocaleDateString("en-KE",{day:"numeric",month:"short",year:"numeric"});
}

function formatTime(time){
if(!time)return"";
return new Date("2000-01-01T"+time).toLocaleTimeString("en-KE",{hour:"numeric",minute:"2-digit"});
}

function getSessionType(service){
return service==="Road Safety Training"?"roadsafety":"osh";
}

function updateHighlights(){
const road=dbSessions.filter(s=>getSessionType(s.service)==="roadsafety").length;
const osh=dbSessions.filter(s=>getSessionType(s.service)==="osh").length;
const months=new Set(dbSessions.map(s=>s.session_date?.substring(0,7))).size;
const monthCount=document.getElementById("monthCount");
const roadCount=document.getElementById("roadCount");
const oshCount=document.getElementById("oshCount");
const totalCount=document.getElementById("totalCount");
if(monthCount)monthCount.textContent=months||0;
if(roadCount)roadCount.textContent=road;
if(oshCount)oshCount.textContent=osh;
if(totalCount)totalCount.textContent=dbSessions.length;
}

function renderDBSession(session){
const type=getSessionType(session.service);
const price=Number(session.price||0);
const registerURL=`register.html?session_id=${encodeURIComponent(session.id)}`;
return `<div class="program ${type}" data-type="${type}">
<div class="program-icon">${getProgramIcon(type)}</div>
<div class="program-content">
<div class="program-tag">${escapeHTML(type==="roadsafety"?"Road Safety":"OSH")}</div>
<h3>${escapeHTML(session.session_title)}</h3>
<p>${escapeHTML(session.description||"Professional training programme.")}</p>
<div class="program-meta">
<span>📅 ${formatDate(session.session_date)}</span>
<span>🕐 ${formatTime(session.start_time)}${session.end_time?" – "+formatTime(session.end_time):""}</span>
<span>📍 ${escapeHTML(session.venue||session.location||"MEI Group")}</span>
<span>👥 ${session.capacity||"Open"} places</span>
${price>0?`<span>💰 KES ${price.toLocaleString()}</span>`:"<span>💰 Contact MEI Group</span>"}
</div>
<div class="program-bottom">
<span class="program-status">${escapeHTML(session.status||"open")}</span>
<a class="register-btn" href="${registerURL}">Register</a>
</div>
</div>
</div>`;
}

function renderStaticProgram(program){
return `<div class="program ${program.type}" data-type="${program.type}">
<div class="program-icon">${getProgramIcon(program.type)}</div>
<div class="program-content">
<div class="program-tag">${escapeHTML(program.tag)}</div>
<h3>${escapeHTML(program.title)}</h3>
<p>${escapeHTML(program.desc)}</p>
<div class="program-bottom">
<span class="program-status">Information</span>
${program.type==="education"?'<a class="register-btn" href="education.html">Learn More</a>':""}
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
const date=new Date(session.session_date+"T00:00:00");
const key=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}`;
if(!grouped[key]){
grouped[key]={
month:date.toLocaleString("en-US",{month:"long"}),
year:date.getFullYear(),
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
<div class="program-list">${sessions.map(renderDBSession).join("")}</div>
</section>`;
});

if(activeFilter==="all"||activeFilter==="education"){
CALENDAR_DATA.forEach(month=>{
const programs=month.programs.filter(program=>activeFilter==="all"||program.type==="education");
if(!programs.length)return;

html+=`<section class="calendar-month">
<div class="month-header">
<h2>${month.month} ${month.year}</h2>
<span>${programs.length} program${programs.length===1?"":"s"}</span>
</div>
<div class="program-list">${programs.map(renderStaticProgram).join("")}</div>
</section>`;
});
}

if(!html)html='<div class="empty-state">No training sessions found for this filter.</div>';

grid.innerHTML=html;
}

async function loadTrainingSessions(){
try{
if(!window.supabaseClient){
if(window.SUPABASE_URL&&window.SUPABASE_ANON_KEY){
window.supabaseClient=supabase.createClient(
window.SUPABASE_URL,
window.SUPABASE_ANON_KEY
);
}
}

if(!window.supabaseClient)throw new Error("Supabase client unavailable");

const{data,error}=await window.supabaseClient
.from("public_training_calendar")
.select("*")
.order("session_date",{ascending:true})
.order("start_time",{ascending:true});

if(error)throw error;

dbSessions=data||[];
updateHighlights();
renderCalendar();
}catch(error){
console.error("Training calendar error:",error);
dbSessions=[];
updateHighlights();
renderCalendar();
}
}

function initializeFilters(){
document.querySelectorAll(".filter-btn").forEach(button=>{
if(button.id==="downloadPdf")return;

button.addEventListener("click",()=>{
document.querySelectorAll(".filter-btn").forEach(btn=>btn.classList.remove("active"));
button.classList.add("active");

const filter=button.dataset.filter||"all";
activeFilter=filter==="road-safety"?"roadsafety":filter;
renderCalendar();
});
});
}

function initializeDownload(){
const button=document.getElementById("downloadPdf");
if(button)button.addEventListener("click",()=>window.print());
}

document.addEventListener("DOMContentLoaded",async()=>{
if(typeof meiInitCommon==="function")meiInitCommon();
initializeFilters();
initializeDownload();
await loadTrainingSessions();
});
