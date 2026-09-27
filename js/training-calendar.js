let activeFilter="all";
let dbSessions=[];

const CALENDAR_DATA=[
{
date:"2026-10-08",
service:"Road Safety Training",
title:"Road Safety Awareness Training"
},
{
date:"2026-10-15",
service:"Occupational Safety & Health",
title:"First Aid Training"
},
{
date:"2026-10-22",
service:"Road Safety Training",
title:"Defensive Driving Training"
},
{
date:"2026-10-29",
service:"Occupational Safety & Health",
title:"Fire Safety Training"
}
];

function escapeHTML(value){
return String(value??"")
.replace(/&/g,"&amp;")
.replace(/</g,"&lt;")
.replace(/>/g,"&gt;")
.replace(/"/g,"&quot;")
.replace(/'/g,"&#039;");
}

function getProgramType(service=""){
const s=service.toLowerCase();

if(s.includes("road")){
return"roadsafety";
}

if(s.includes("occupational")||s.includes("osh")){
return"osh";
}

return"education";
}

function getProgramLabel(service=""){
const type=getProgramType(service);

if(type==="roadsafety")return"Road Safety";
if(type==="osh")return"Occupational Safety & Health";

return"Education";
}

function formatDate(date){
if(!date)return"";

const d=new Date(`${date}T00:00:00`);

return d.toLocaleDateString("en-KE",{
weekday:"short",
day:"numeric",
month:"short",
year:"numeric"
});
}

function formatMonth(date){
const d=new Date(`${date}T00:00:00`);

return d.toLocaleDateString("en-KE",{
month:"long",
year:"numeric"
});
}

function formatTime(time){
if(!time)return"";

const parts=time.split(":");
const h=parseInt(parts[0],10);
const m=parts[1]||"00";

const suffix=h>=12?"PM":"AM";
const hour=h%12||12;

return`${hour}:${m} ${suffix}`;
}

function formatPrice(price,currency="KES"){
if(price===null||price===undefined||price===""){
return"Contact us";
}

const amount=Number(price);

if(!Number.isFinite(amount)||amount<=0){
return"Contact us";
}

return`${currency||"KES"} ${amount.toLocaleString("en-KE")}`;
}

function updateHighlights(){

const sessions=dbSessions.filter(session=>{
return!["cancelled","postponed"].includes(
String(session.status||"").toLowerCase()
);
});

const months=new Set(
sessions
.map(s=>s.session_date)
.filter(Boolean)
.map(d=>d.substring(0,7))
);

const road=sessions.filter(
s=>getProgramType(s.service)==="roadsafety"
).length;

const osh=sessions.filter(
s=>getProgramType(s.service)==="osh"
).length;

document.getElementById("monthCount").textContent=months.size;
document.getElementById("roadCount").textContent=road;
document.getElementById("oshCount").textContent=osh;
document.getElementById("totalCount").textContent=sessions.length;
}

function getFilteredSessions(){

if(activeFilter==="all"){
return dbSessions;
}

return dbSessions.filter(
session=>getProgramType(session.service)===activeFilter
);
}

function renderSession(session){

const programType=getProgramType(session.service);
const programLabel=getProgramLabel(session.service);

const date=formatDate(session.session_date);

const time=[
formatTime(session.start_time),
formatTime(session.end_time)
].filter(Boolean).join(" – ");

const venue=session.venue||session.location||"MEI Group Training Centre";

const capacity=session.capacity
?`${session.capacity} places`
:"Contact us";

const status=String(session.status||"open").toLowerCase();

const isClosed=[
"cancelled",
"postponed",
"completed",
"in_progress"
].includes(status);

const registerUrl=`register.html?session_id=${encodeURIComponent(session.id)}`;

const price=formatPrice(
session.price,
session.currency||"KES"
);

return`
<article class="session" data-program="${programType}">

<div class="session-top">

<div class="session-type">
${escapeHTML(programLabel)}
</div>

<h3>
${escapeHTML(session.session_title||"Training Session")}
</h3>

</div>

<div class="session-body">

<div class="info">

<div class="info-item">
Date
<strong>${escapeHTML(date)}</strong>
</div>

<div class="info-item">
Time
<strong>${escapeHTML(time||"Full Day")}</strong>
</div>

<div class="info-item">
Venue
<strong>${escapeHTML(venue)}</strong>
</div>

<div class="info-item">
Capacity
<strong>${escapeHTML(capacity)}</strong>
</div>

</div>

${
session.description
?`<div class="description">${escapeHTML(session.description)}</div>`
:""
}

</div>

<div class="session-footer">

<div class="price">
${escapeHTML(price)}
</div>

${
isClosed
?`<span>${escapeHTML(status.replace("_"," "))}</span>`
:`<a class="register-btn" href="${registerUrl}">Register Now</a>`
}

</div>

</article>
`;
}

function renderCalendar(){

const grid=document.getElementById("calendarGrid");

if(!grid)return;

const sessions=getFilteredSessions();

if(!sessions.length){

grid.innerHTML=`
<div class="empty-state">
<strong>No training sessions found.</strong>
<p>
There are currently no published sessions for this programme.
</p>
</div>
`;

return;
}

const groups={};

sessions.forEach(session=>{

if(!session.session_date)return;

const key=session.session_date.substring(0,7);

if(!groups[key]){
groups[key]=[];
}

groups[key].push(session);

});

const months=Object.keys(groups).sort();

let html="";

months.forEach(month=>{

const monthSessions=groups[month];

html+=`
<div class="month">

<div class="month-title">

<h2>
${escapeHTML(formatMonth(`${month}-01`))}
</h2>

<span>
${monthSessions.length}
${monthSessions.length===1?"session":"sessions"}
</span>

</div>

<div class="sessions">
`;

monthSessions.forEach(session=>{
html+=renderSession(session);
});

html+=`
</div>
</div>
`;

});

grid.innerHTML=html;
}

function initializeFilters(){

document.querySelectorAll(".filter-btn[data-filter]")
.forEach(button=>{

button.addEventListener("click",()=>{

document.querySelectorAll(".filter-btn[data-filter]")
.forEach(btn=>{
btn.classList.remove("active");
});

button.classList.add("active");

activeFilter=button.dataset.filter||"all";

renderCalendar();

});

});

}

function initializeDownload(){

const button=document.getElementById("downloadPdf");

if(!button)return;

button.addEventListener("click",()=>{

window.print();

});

}

async function loadTrainingSessions(){

const grid=document.getElementById("calendarGrid");
const errorBox=document.getElementById("errorBox");

try{

if(!window.supabaseClient){

throw new Error(
"Supabase client was not initialized. Check js/config.js."
);

}

const{
data,
error
}=await window.supabaseClient
.from("training_sessions")
.select("*")
.eq("published",true)
.order("session_date",{ascending:true})
.order("start_time",{ascending:true});

if(error)throw error;

dbSessions=(data||[])
.filter(session=>{
return!["cancelled","postponed"].includes(
String(session.status||"").toLowerCase()
);
});

console.log(
"Training sessions loaded:",
dbSessions.length,
dbSessions
);

if(errorBox){
errorBox.style.display="none";
errorBox.innerHTML="";
}

updateHighlights();
renderCalendar();

}catch(error){

console.error(
"TRAINING CALENDAR ERROR:",
error
);

if(errorBox){

errorBox.style.display="block";

errorBox.innerHTML=`
<strong>Training calendar connection error</strong>
<br>
${escapeHTML(error.message||"Unknown error")}
`;

}

if(grid){

grid.innerHTML=`
<div class="empty-state">

<strong>
Unable to load training sessions.
</strong>

<p>
${escapeHTML(
error.message||
"Please check the Supabase connection."
)}
</p>

</div>
`;

}

}

}

document.addEventListener("DOMContentLoaded",()=>{

initializeFilters();
initializeDownload();

loadTrainingSessions();

});
