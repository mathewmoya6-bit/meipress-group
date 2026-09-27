let adminTrainingSessions=[];
let trainingCourses=[];

async function checkAdminAccess(){

const{
data:{session}
}=await window.supabaseClient.auth.getSession();

if(!session){
window.location.href="admin-login.html";
return false;
}

const{
data:admin,
error
}=await window.supabaseClient
.from("admin_users")
.select("id,email,full_name,role,active")
.eq("id",session.user.id)
.maybeSingle();

if(error){
console.error(error);
alert("Unable to verify administrator access.");
return false;
}

if(!admin||admin.active===false){
await window.supabaseClient.auth.signOut();
localStorage.removeItem("mei_admin_session");
window.location.href="admin-login.html";
return false;
}

return true;
}

async function loadTrainingCourses(){

const{
data,
error
}=await window.supabaseClient
.from("training_courses")
.select("*")
.eq("active",true)
.order("display_order",{ascending:true})
.order("course_name",{ascending:true});

if(error){
console.error("COURSES ERROR:",error);
return;
}

trainingCourses=data||[];

const select=document.getElementById("trainingCourse");

if(!select)return;

select.innerHTML='<option value="">Select course</option>';

trainingCourses.forEach(course=>{

const option=document.createElement("option");

option.value=course.id;
option.textContent=
course.course_code
?`${course.course_code} — ${course.course_name}`
:course.course_name;

select.appendChild(option);

});
}

async function loadAdminTrainingSessions(){

const service=
document.getElementById("trainingServiceFilter")?.value||"";

const status=
document.getElementById("trainingStatusFilter")?.value||"";

let query=window.supabaseClient
.from("training_sessions")
.select(`
*,
training_courses(
course_name,
course_code
)
`)
.order("session_date",{ascending:true})
.order("start_time",{ascending:true});

if(service){
query=query.eq("service",service);
}

if(status){
query=query.eq("status",status);
}

const{
data,
error
}=await query;

if(error){
console.error("TRAINING SESSIONS ERROR:",error);

const table=document.getElementById("trainingSessionsTable");

if(table){
table.innerHTML=`
<tr>
<td colspan="8" style="text-align:center;padding:30px;color:#b42318">
${escapeAdminHTML(error.message)}
</td>
</tr>`;
}

return;
}

adminTrainingSessions=data||[];

renderAdminTrainingSessions();
updateTrainingStats();
}

function renderAdminTrainingSessions(){

const table=document.getElementById("trainingSessionsTable");

if(!table)return;

if(!adminTrainingSessions.length){

table.innerHTML=`
<tr>
<td colspan="8" style="text-align:center;padding:30px">
No training sessions found.
</td>
</tr>`;

return;
}

table.innerHTML=adminTrainingSessions.map(session=>{

const course=session.training_courses||{};

const date=session.session_date
?new Date(`${session.session_date}T00:00:00`).toLocaleDateString(
"en-GB",
{
day:"2-digit",
month:"short",
year:"numeric"
}
)
:"—";

const statusClass=
`status-${String(session.status||"").replaceAll("_","-")}`;

return`
<tr>

<td>${date}</td>

<td>
<strong>${escapeAdminHTML(course.course_name||session.session_title||"—")}</strong>
<br>
<small>${escapeAdminHTML(course.course_code||"")}</small>
</td>

<td>${escapeAdminHTML(session.service||"—")}</td>

<td>${escapeAdminHTML(session.venue||"—")}</td>

<td>${session.capacity??"—"}</td>

<td>
<span class="status-badge ${statusClass}">
${escapeAdminHTML((session.status||"").replaceAll("_"," "))}
</span>
</td>

<td>
<span class="${session.published?"published-yes":"published-no"}">
${session.published?"Yes":"No"}
</span>
</td>

<td>

<button
class="action-btn edit-btn"
onclick="editTrainingSession(${session.id})">
Edit
</button>

<button
class="action-btn publish-btn"
onclick="toggleTrainingPublished(${session.id},${!session.published})">
${session.published?"Unpublish":"Publish"}
</button>

<button
class="action-btn delete-btn"
onclick="deleteTrainingSession(${session.id})">
Delete
</button>

</td>

</tr>`;

}).join("");
}

function updateTrainingStats(){

const today=new Date();
today.setHours(0,0,0,0);

const total=adminTrainingSessions.length;

const published=
adminTrainingSessions.filter(s=>s.published).length;

const open=
adminTrainingSessions.filter(s=>s.status==="open").length;

const upcoming=
adminTrainingSessions.filter(s=>{
if(!s.session_date)return false;
const date=new Date(`${s.session_date}T00:00:00`);
return date>=today&&
!["cancelled","postponed","completed"].includes(s.status);
}).length;

document.getElementById("trainingTotal").textContent=total;
document.getElementById("trainingPublished").textContent=published;
document.getElementById("trainingOpen").textContent=open;
document.getElementById("trainingUpcoming").textContent=upcoming;
}

function openTrainingModal(session=null){

const modal=document.getElementById("trainingModal");

if(!modal)return;

document.getElementById("trainingModalTitle").textContent=
session
?"Edit Training Session"
:"Add Training Session";

document.getElementById("trainingId").value=session?.id||"";
document.getElementById("trainingTitle").value=session?.session_title||"";
document.getElementById("trainingService").value=
session?.service||"Road Safety Training";
document.getElementById("trainingDate").value=
session?.session_date||"";
document.getElementById("trainingDeadline").value=
session?.registration_deadline||"";
document.getElementById("trainingStartTime").value=
session?.start_time||"09:00";
document.getElementById("trainingEndTime").value=
session?.end_time||"16:00";
document.getElementById("trainingVenue").value=
session?.venue||"MEI Group Training Centre";
document.getElementById("trainingLocation").value=
session?.location||"";
document.getElementById("trainingTrainer").value=
session?.trainer_name||"";
document.getElementById("trainingTrainerContact").value=
session?.trainer_contact||"";
document.getElementById("trainingCapacity").value=
session?.capacity??25;
document.getElementById("trainingPrice").value=
session?.price??0;
document.getElementById("trainingCurrency").value=
session?.currency||"KES";
document.getElementById("trainingStatus").value=
session?.status||"open";
document.getElementById("trainingDescription").value=
session?.description||"";
document.getElementById("trainingNotes").value=
session?.notes||"";
document.getElementById("trainingPublished").checked=
session?.published!==false;

document.getElementById("trainingCourse").value=
session?.course_id||"";

document.getElementById("trainingFormMessage").textContent="";

modal.classList.add("open");
}

function closeTrainingModal(){

document.getElementById("trainingModal")?.classList.remove("open");
}

document.getElementById("trainingForm")?.addEventListener(
"submit",
async function(event){

event.preventDefault();

const saveButton=document.getElementById("saveTrainingButton");

saveButton.disabled=true;
saveButton.textContent="Saving...";

const id=document.getElementById("trainingId").value;

const payload={
course_id:Number(document.getElementById("trainingCourse").value),
service:document.getElementById("trainingService").value,
session_title:document.getElementById("trainingTitle").value.trim(),
session_date:document.getElementById("trainingDate").value,
start_time:document.getElementById("trainingStartTime").value||null,
end_time:document.getElementById("trainingEndTime").value||null,
venue:document.getElementById("trainingVenue").value.trim()||null,
location:document.getElementById("trainingLocation").value.trim()||null,
trainer_name:document.getElementById("trainingTrainer").value.trim()||null,
trainer_contact:document.getElementById("trainingTrainerContact").value.trim()||null,
capacity:Number(document.getElementById("trainingCapacity").value)||25,
registration_deadline:
document.getElementById("trainingDeadline").value||null,
price:Number(document.getElementById("trainingPrice").value)||0,
currency:document.getElementById("trainingCurrency").value.trim()||"KES",
status:document.getElementById("trainingStatus").value,
description:document.getElementById("trainingDescription").value.trim()||null,
notes:document.getElementById("trainingNotes").value.trim()||null,
published:document.getElementById("trainingPublished").checked
};

try{

let result;

if(id){

result=await window.supabaseClient
.from("training_sessions")
.update(payload)
.eq("id",id)
.select()
.single();

}else{

result=await window.supabaseClient
.from("training_sessions")
.insert(payload)
.select()
.single();

}

if(result.error)throw result.error;

closeTrainingModal();

await loadAdminTrainingSessions();

alert(id
?"Training session updated successfully."
:"Training session created successfully."
);

}catch(error){

console.error("SAVE TRAINING ERROR:",error);

document.getElementById("trainingFormMessage").textContent=
error.message||"Unable to save training session.";

document.getElementById("trainingFormMessage").style.color="#b42318";

}finally{

saveButton.disabled=false;
saveButton.textContent="Save Training Session";

}

});

function editTrainingSession(id){

const session=adminTrainingSessions.find(
item=>String(item.id)===String(id)
);

if(session){
openTrainingModal(session);
}
}

async function toggleTrainingPublished(id,published){

const{
error
}=await window.supabaseClient
.from("training_sessions")
.update({
published
})
.eq("id",id);

if(error){

alert(error.message);
return;
}

await loadAdminTrainingSessions();
}

async function deleteTrainingSession(id){

const session=adminTrainingSessions.find(
item=>String(item.id)===String(id)
);

if(!session)return;

const confirmed=confirm(
`Delete "${session.session_title}"?\n\nThis action cannot be undone.`
);

if(!confirmed)return;

const{
error
}=await window.supabaseClient
.from("training_sessions")
.delete()
.eq("id",id);

if(error){

alert(
"Unable to delete this session.\n\n"+
error.message
);

return;
}

await loadAdminTrainingSessions();
}

async function loadTrainingRegistrations(){

const table=document.getElementById(
"trainingRegistrationsTable"
);

if(!table)return;

const{
data,
error
}=await window.supabaseClient
.from("training_registrations")
.select(`
id,
registration_number,
full_name,
email,
phone,
organization,
payment_status,
registration_status,
training_sessions(
session_title,
session_date
)
`)
.order("created_at",{ascending:false});

if(error){

console.error(error);

table.innerHTML=`
<tr>
<td colspan="7" style="text-align:center;color:#b42318;padding:30px">
${escapeAdminHTML(error.message)}
</td>
</tr>`;

return;
}

if(!data?.length){

table.innerHTML=`
<tr>
<td colspan="7" style="text-align:center;padding:30px">
No registrations found.
</td>
</tr>`;

return;
}

table.innerHTML=data.map(row=>{

const session=row.training_sessions||{};

const date=session.session_date
?new Date(`${session.session_date}T00:00:00`)
.toLocaleDateString("en-GB")
:"—";

return`
<tr>

<td>
<strong>${escapeAdminHTML(row.registration_number||"—")}</strong>
</td>

<td>
${escapeAdminHTML(row.full_name||"—")}
<br>
<small>${escapeAdminHTML(row.email||"")}</small>
</td>

<td>${escapeAdminHTML(row.phone||"—")}</td>

<td>${escapeAdminHTML(session.session_title||"—")}</td>

<td>${date}</td>

<td>
${escapeAdminHTML(
String(row.payment_status||"unpaid").replaceAll("_"," ")
)}
</td>

<td>
${escapeAdminHTML(
String(row.registration_status||"registered").replaceAll("_"," ")
)}
</td>

</tr>`;

}).join("");
}

function escapeAdminHTML(value){

return String(value??"")
.replaceAll("&","&amp;")
.replaceAll("<","&lt;")
.replaceAll(">","&gt;")
.replaceAll('"',"&quot;")
.replaceAll("'","&#039;");
}

window.openTrainingModal=openTrainingModal;
window.closeTrainingModal=closeTrainingModal;
window.loadAdminTrainingSessions=loadAdminTrainingSessions;
window.loadTrainingRegistrations=loadTrainingRegistrations;
window.editTrainingSession=editTrainingSession;
window.deleteTrainingSession=deleteTrainingSession;
window.toggleTrainingPublished=toggleTrainingPublished;
