(function(){
'use strict';

const db=window.supabaseClient;
let trainingSessions=[];
let trainingCourses=[];
let trainingRegistrations=[];
let editingTrainingId=null;

function esc(value){
    return String(value??'')
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;')
        .replace(/'/g,'&#039;');
}

function formatDate(date){
    if(!date)return '—';
    const d=new Date(date+'T00:00:00');
    return isNaN(d)?date:d.toLocaleDateString('en-GB',{
        day:'2-digit',
        month:'short',
        year:'numeric'
    });
}

function formatTime(time){
    if(!time)return '';
    return String(time).slice(0,5);
}

function money(value){
    const n=Number(value||0);
    return n.toLocaleString('en-KE',{
        minimumFractionDigits:2,
        maximumFractionDigits:2
    });
}

function statusBadge(status){
    const labels={
        scheduled:'Scheduled',
        open:'Open',
        full:'Full',
        in_progress:'In Progress',
        completed:'Completed',
        cancelled:'Cancelled',
        postponed:'Postponed',
        registered:'Registered',
        confirmed:'Confirmed',
        waitlisted:'Waitlisted',
        cancelled_registration:'Cancelled',
        no_show:'No Show',
        unpaid:'Unpaid',
        partial:'Partial',
        paid:'Paid',
        refunded:'Refunded'
    };

    const safe=String(status||'').replace(/[^a-zA-Z0-9_-]/g,'_');

    return `<span class="status-badge ${safe}">
        <span class="dot"></span>${esc(labels[status]||status||'Unknown')}
    </span>`;
}

function showError(message){
    if(typeof window.showToast==='function'){
        window.showToast(message,'error');
    }else{
        alert(message);
    }
}

function showSuccess(message){
    if(typeof window.showToast==='function'){
        window.showToast(message,'success');
    }
}

async function checkSupabaseSession(){
    if(!db){
        showError('Supabase client is not initialized.');
        return false;
    }

    try{
        const {data,error}=await db.auth.getSession();

        if(error){
            console.error(error);
            showError(error.message);
            return false;
        }

        if(!data.session){
            console.warn('No Supabase Auth session found.');
            return false;
        }

        return true;
    }catch(error){
        console.error(error);
        return false;
    }
}

async function loadCourses(){
    const select=document.getElementById('trainingCourse');

    try{
        const {data,error}=await db
            .from('training_courses')
            .select('*')
            .eq('active',true)
            .order('display_order',{ascending:true})
            .order('course_name',{ascending:true});

        if(error)throw error;

        trainingCourses=data||[];

        if(select){
            select.innerHTML='<option value="">Select course</option>';

            trainingCourses.forEach(course=>{
                const option=document.createElement('option');
                option.value=course.id;
                option.textContent=
                    `${course.course_code?course.course_code+' — ':''}${course.course_name}`;
                select.appendChild(option);
            });
        }

        return trainingCourses;
    }catch(error){
        console.error('TRAINING COURSES ERROR:',error);

        if(select){
            select.innerHTML='<option value="">Unable to load courses</option>';
        }

        showError('Could not load training courses: '+error.message);
        return [];
    }
}

async function loadAdminTrainingSessions(){
    const tbody=document.getElementById('trainingSessionsTable');

    if(!tbody)return;

    tbody.innerHTML=`
        <tr>
            <td colspan="8" style="text-align:center;padding:30px;color:var(--text-secondary);">
                <i class="fas fa-spinner fa-spin"></i> Loading training sessions...
            </td>
        </tr>`;

    try{
        if(!db)throw new Error('Supabase client is not initialized.');

        const service=document.getElementById('trainingServiceFilter')?.value||'';
        const status=document.getElementById('trainingStatusFilter')?.value||'';

        let query=db
            .from('training_sessions')
            .select('*')
            .order('session_date',{ascending:true})
            .order('start_time',{ascending:true});

        if(service)query=query.eq('service',service);
        if(status)query=query.eq('status',status);

        const {data,error}=await query;

        if(error)throw error;

        trainingSessions=data||[];

        renderTrainingStats();
        renderTrainingSessions();

    }catch(error){
        console.error('TRAINING SESSIONS ERROR:',error);

        tbody.innerHTML=`
            <tr>
                <td colspan="8">
                    <div class="empty-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h4>Unable to load training sessions</h4>
                        <p>${esc(error.message||'Unknown database error')}</p>
                    </div>
                </td>
            </tr>`;

        showError('Training sessions: '+error.message);
    }
}

function renderTrainingStats(){
    const today=new Date();
    today.setHours(0,0,0,0);

    const total=trainingSessions.length;
    const published=trainingSessions.filter(s=>s.published===true).length;
    const open=trainingSessions.filter(s=>s.status==='open').length;
    const upcoming=trainingSessions.filter(s=>{
        if(!s.session_date)return false;
        const d=new Date(s.session_date+'T00:00:00');
        return d>=today&&!['cancelled','postponed','completed'].includes(s.status);
    }).length;

    const set=(id,value)=>{
        const el=document.getElementById(id);
        if(el)el.textContent=value;
    };

    set('trainingTotal',total);
    set('trainingPublished',published);
    set('trainingOpen',open);
    set('trainingUpcoming',upcoming);
    set('trainingCount',total);
}

function renderTrainingSessions(){
    const tbody=document.getElementById('trainingSessionsTable');

    if(!tbody)return;

    if(!trainingSessions.length){
        tbody.innerHTML=`
            <tr>
                <td colspan="8">
                    <div class="empty-state">
                        <i class="fas fa-calendar-xmark"></i>
                        <h4>No training sessions found</h4>
                        <p>Create your first training session using the button above.</p>
                    </div>
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML=trainingSessions.map(session=>{
        const course=findCourse(session.course_id);
        const registrations=trainingRegistrations.filter(
            r=>Number(r.session_id)===Number(session.id)
        ).length;

        return `
            <tr>
                <td>
                    <strong>${formatDate(session.session_date)}</strong>
                    <div style="font-size:.72rem;color:var(--text-secondary);">
                        ${formatTime(session.start_time)}
                        ${session.end_time?' - '+formatTime(session.end_time):''}
                    </div>
                </td>

                <td>
                    <strong>${esc(course?.course_name||session.session_title||'Training')}</strong>
                    ${course?.course_code?`
                        <div style="font-size:.7rem;color:var(--text-secondary);">
                            ${esc(course.course_code)}
                        </div>`:''}
                </td>

                <td>${esc(session.service||'—')}</td>

                <td>
                    ${esc(session.venue||'—')}
                    ${session.location?`
                        <div style="font-size:.72rem;color:var(--text-secondary);">
                            ${esc(session.location)}
                        </div>`:''}
                </td>

                <td>
                    <strong>${Number(session.capacity||0)}</strong>
                    <div style="font-size:.7rem;color:var(--text-secondary);">
                        ${registrations} registered
                    </div>
                </td>

                <td>${statusBadge(session.status)}</td>

                <td>
                    ${session.published
                        ?'<span class="published-yes"><i class="fas fa-check-circle"></i> Yes</span>'
                        :'<span class="published-no"><i class="fas fa-eye-slash"></i> No</span>'
                    }
                </td>

                <td>
                    <div class="action-btns">
                        <button
                            class="view"
                            title="View registrations"
                            onclick="viewSessionRegistrations(${session.id})">
                            <i class="fas fa-users"></i>
                        </button>

                        <button
                            class="edit-btn"
                            onclick="editTrainingSession(${session.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>

                        <button
                            class="delete-btn"
                            onclick="deleteTrainingSession(${session.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
    }).join('');
}

function findCourse(id){
    return trainingCourses.find(c=>Number(c.id)===Number(id));
}

window.openTrainingModal=async function(sessionId=null){
    editingTrainingId=sessionId;

    const modal=document.getElementById('trainingModal');
    const title=document.getElementById('trainingModalTitle');
    const form=document.getElementById('trainingForm');
    const message=document.getElementById('trainingFormMessage');

    if(!modal)return;

    await loadCourses();

    form.reset();

    document.getElementById('trainingId').value='';
    document.getElementById('trainingStartTime').value='09:00';
    document.getElementById('trainingEndTime').value='16:00';
    document.getElementById('trainingVenue').value='MEI Group Training Centre';
    document.getElementById('trainingCapacity').value='25';
    document.getElementById('trainingPrice').value='0';
    document.getElementById('trainingPublished').checked=true;

    message.textContent='';
    message.style.color='';

    title.textContent=sessionId
        ? 'Edit Training Session'
        : 'Add Training Session';

    if(sessionId){
        const session=trainingSessions.find(
            s=>Number(s.id)===Number(sessionId)
        );

        if(!session){
            showError('Training session not found.');
            return;
        }

        document.getElementById('trainingId').value=session.id;
        document.getElementById('trainingCourse').value=session.course_id||'';
        document.getElementById('trainingService').value=session.service||'';
        document.getElementById('trainingTitle').value=session.session_title||'';
        document.getElementById('trainingDate').value=session.session_date||'';
        document.getElementById('trainingDeadline').value=session.registration_deadline||'';
        document.getElementById('trainingStartTime').value=formatTime(session.start_time)||'09:00';
        document.getElementById('trainingEndTime').value=formatTime(session.end_time)||'16:00';
        document.getElementById('trainingVenue').value=session.venue||'';
        document.getElementById('trainingLocation').value=session.location||'';
        document.getElementById('trainingTrainer').value=session.trainer_name||'';
        document.getElementById('trainingCapacity').value=session.capacity||25;
        document.getElementById('trainingPrice').value=session.price??0;
        document.getElementById('trainingStatus').value=session.status||'scheduled';
        document.getElementById('trainingDescription').value=session.description||'';
        document.getElementById('trainingNotes').value=session.notes||'';
        document.getElementById('trainingPublished').checked=!!session.published;
    }

    modal.classList.add('active');
};

window.editTrainingSession=function(id){
    window.openTrainingModal(id);
};

window.closeTrainingModal=function(){
    const modal=document.getElementById('trainingModal');
    if(modal)modal.classList.remove('active');
    editingTrainingId=null;
};

document.getElementById('trainingModal')?.addEventListener('click',function(e){
    if(e.target===this)window.closeTrainingModal();
});

document.getElementById('trainingForm')?.addEventListener('submit',async function(e){
    e.preventDefault();

    const button=document.getElementById('saveTrainingButton');
    const message=document.getElementById('trainingFormMessage');

    button.disabled=true;
    message.textContent='Saving...';
    message.style.color='var(--text-secondary)';

    try{
        const session={
            course_id:Number(document.getElementById('trainingCourse').value),
            service:document.getElementById('trainingService').value,
            session_title:document.getElementById('trainingTitle').value.trim(),
            session_date:document.getElementById('trainingDate').value,
            start_time:document.getElementById('trainingStartTime').value||null,
            end_time:document.getElementById('trainingEndTime').value||null,
            venue:document.getElementById('trainingVenue').value.trim()||null,
            location:document.getElementById('trainingLocation').value.trim()||null,
            trainer_name:document.getElementById('trainingTrainer').value.trim()||null,
            capacity:Number(document.getElementById('trainingCapacity').value||0),
            registration_deadline:document.getElementById('trainingDeadline').value||null,
            price:Number(document.getElementById('trainingPrice').value||0),
            currency:'KES',
            status:document.getElementById('trainingStatus').value,
            description:document.getElementById('trainingDescription').value.trim()||null,
            notes:document.getElementById('trainingNotes').value.trim()||null,
            published:document.getElementById('trainingPublished').checked
        };

        if(!session.course_id){
            throw new Error('Please select a course.');
        }

        if(!session.service){
            throw new Error('Please select a program.');
        }

        if(!session.session_title){
            throw new Error('Please enter the session title.');
        }

        if(!session.session_date){
            throw new Error('Please select the training date.');
        }

        if(session.capacity<1){
            throw new Error('Capacity must be at least 1.');
        }

        let result;

        if(editingTrainingId){
            result=await db
                .from('training_sessions')
                .update(session)
                .eq('id',editingTrainingId)
                .select()
                .single();
        }else{
            result=await db
                .from('training_sessions')
                .insert(session)
                .select()
                .single();
        }

        if(result.error)throw result.error;

        message.textContent='Saved successfully.';
        message.style.color='var(--green)';

        showSuccess(
            editingTrainingId
                ? 'Training session updated.'
                : 'Training session created.'
        );

        await loadAdminTrainingSessions();

        setTimeout(()=>{
            window.closeTrainingModal();
        },500);

    }catch(error){
        console.error('SAVE TRAINING ERROR:',error);
        message.textContent=error.message||'Unable to save training session.';
        message.style.color='var(--red)';
        showError(error.message||'Unable to save training session.');
    }finally{
        button.disabled=false;
    }
});

window.deleteTrainingSession=async function(id){
    const session=trainingSessions.find(s=>Number(s.id)===Number(id));

    if(!session)return;

    const registrations=trainingRegistrations.filter(
        r=>Number(r.session_id)===Number(id)
    );

    let message=
        `Delete "${session.session_title}" on ${formatDate(session.session_date)}?`;

    if(registrations.length){
        message+=
            `\n\nThis session has ${registrations.length} registration(s). `+
            `Delete the session only if you are sure the registrations should also be removed or handled first.`;
    }

    if(!confirm(message))return;

    try{
        const {error}=await db
            .from('training_sessions')
            .delete()
            .eq('id',id);

        if(error)throw error;

        showSuccess('Training session deleted.');

        await loadAdminTrainingSessions();
        await loadTrainingRegistrations();

    }catch(error){
        console.error('DELETE TRAINING ERROR:',error);
        showError(
            'Could not delete training session: '+error.message
        );
    }
};

async function loadRegistrationData(){
    try{
        const {data,error}=await db
            .from('training_registrations')
            .select('*')
            .order('created_at',{ascending:false});

        if(error)throw error;

        trainingRegistrations=data||[];

        return trainingRegistrations;
    }catch(error){
        console.error('REGISTRATION DATA ERROR:',error);
        trainingRegistrations=[];
        return [];
    }
}

window.loadTrainingRegistrations=async function(){
    const tbody=document.getElementById('trainingRegistrationsTable');

    if(!tbody)return;

    tbody.innerHTML=`
        <tr>
            <td colspan="9" style="text-align:center;padding:30px;color:var(--text-secondary);">
                <i class="fas fa-spinner fa-spin"></i> Loading registrations...
            </td>
        </tr>`;

    try{
        if(!db)throw new Error('Supabase client is not initialized.');

        await loadRegistrationData();

        const sessionIds=[
            ...new Set(trainingRegistrations.map(r=>r.session_id).filter(Boolean))
        ];

        let sessions=[];

        if(sessionIds.length){
            const {data,error}=await db
                .from('training_sessions')
                .select('*')
                .in('id',sessionIds);

            if(error)throw error;

            sessions=data||[];
        }

        const sessionMap=new Map(
            sessions.map(s=>[Number(s.id),s])
        );

        document.getElementById('registrationsCount').textContent=
            trainingRegistrations.length;

        document.getElementById('regBadge').textContent=
            trainingRegistrations.filter(r=>
                ['registered','confirmed','waitlisted'].includes(r.registration_status)
            ).length;

        if(!trainingRegistrations.length){
            tbody.innerHTML=`
                <tr>
                    <td colspan="9">
                        <div class="empty-state">
                            <i class="fas fa-users-slash"></i>
                            <h4>No registrations yet</h4>
                            <p>Public registrations will appear here.</p>
                        </div>
                    </td>
                </tr>`;
            return;
        }

        tbody.innerHTML=trainingRegistrations.map(reg=>{
            const session=sessionMap.get(Number(reg.session_id));
            const course=findCourse(session?.course_id);

            return `
                <tr>
                    <td>
                        <strong>${esc(reg.registration_number||'Pending')}</strong>
                    </td>

                    <td>
                        <strong>${esc(reg.full_name||'—')}</strong>
                        ${reg.organization?`
                            <div style="font-size:.7rem;color:var(--text-secondary);">
                                ${esc(reg.organization)}
                            </div>`:''}
                    </td>

                    <td>${esc(reg.email||'—')}</td>
                    <td>${esc(reg.phone||'—')}</td>

                    <td>
                        ${esc(
                            course?.course_name||
                            session?.session_title||
                            '—'
                        )}
                    </td>

                    <td>
                        ${formatDate(session?.session_date)}
                    </td>

                    <td>
                        ${statusBadge(reg.payment_status||'unpaid')}
                        <div style="font-size:.7rem;margin-top:3px;">
                            Due: KES ${money(reg.amount_due)}
                        </div>
                    </td>

                    <td>${statusBadge(reg.registration_status||'registered')}</td>

                    <td>
                        <div class="action-btns">
                            <button
                                class="view"
                                title="View registration"
                                onclick="viewTrainingRegistration(${reg.id})">
                                <i class="fas fa-eye"></i>
                            </button>

                            <button
                                class="edit-btn"
                                onclick="editTrainingRegistration(${reg.id})">
                                <i class="fas fa-edit"></i>
                            </button>

                            <button
                                class="delete-btn"
                                onclick="deleteTrainingRegistration(${reg.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>`;
        }).join('');

    }catch(error){
        console.error('REGISTRATION ERROR:',error);

        tbody.innerHTML=`
            <tr>
                <td colspan="9">
                    <div class="empty-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h4>Unable to load registrations</h4>
                        <p>${esc(error.message||'Unknown database error')}</p>
                    </div>
                </td>
            </tr>`;

        showError('Registrations: '+error.message);
    }
};

window.viewTrainingRegistration=function(id){
    const reg=trainingRegistrations.find(
        r=>Number(r.id)===Number(id)
    );

    if(!reg)return;

    const session=trainingSessions.find(
        s=>Number(s.id)===Number(reg.session_id)
    );

    const course=findCourse(session?.course_id);

    const content=`
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
            <div>
                <strong>Registration Number</strong>
                <div>${esc(reg.registration_number||'Pending')}</div>
            </div>

            <div>
                <strong>Status</strong>
                <div>${statusBadge(reg.registration_status||'registered')}</div>
            </div>

            <div>
                <strong>Participant</strong>
                <div>${esc(reg.full_name||'—')}</div>
            </div>

            <div>
                <strong>Participant Type</strong>
                <div>${esc(reg.participant_type||'—')}</div>
            </div>

            <div>
                <strong>Email</strong>
                <div>${esc(reg.email||'—')}</div>
            </div>

            <div>
                <strong>Phone</strong>
                <div>${esc(reg.phone||'—')}</div>
            </div>

            <div>
                <strong>Organization</strong>
                <div>${esc(reg.organization||'—')}</div>
            </div>

            <div>
                <strong>Job Title</strong>
                <div>${esc(reg.job_title||'—')}</div>
            </div>

            <div>
                <strong>Course</strong>
                <div>${esc(course?.course_name||session?.session_title||'—')}</div>
            </div>

            <div>
                <strong>Training Date</strong>
                <div>${formatDate(session?.session_date)}</div>
            </div>

            <div>
                <strong>Amount Due</strong>
                <div>KES ${money(reg.amount_due)}</div>
            </div>

            <div>
                <strong>Amount Paid</strong>
                <div>KES ${money(reg.amount_paid)}</div>
            </div>

            <div>
                <strong>Payment Status</strong>
                <div>${statusBadge(reg.payment_status||'unpaid')}</div>
            </div>

            <div>
                <strong>Registered</strong>
                <div>${formatDateTime(reg.created_at)}</div>
            </div>

            <div style="grid-column:1/-1;">
                <strong>Notes</strong>
                <div style="white-space:pre-wrap;margin-top:4px;">
                    ${esc(reg.notes||'—')}
                </div>
            </div>
        </div>

        <div style="margin-top:24px;padding-top:18px;border-top:1px solid var(--border);">
            <strong>Update Registration Status</strong>

            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">
                ${[
                    ['registered','Registered'],
                    ['confirmed','Confirmed'],
                    ['waitlisted','Waitlisted'],
                    ['completed','Completed'],
                    ['no_show','No Show'],
                    ['cancelled','Cancelled']
                ].map(([value,label])=>`
                    <button
                        onclick="updateRegistrationStatus(${reg.id},'${value}')"
                        class="btn btn-outline">
                        ${label}
                    </button>
                `).join('')}
            </div>
        </div>`;

    showModalForTraining('Registration Details',content);
};

function showModalForTraining(title,content){
    const titleEl=document.getElementById('modalTitle');
    const bodyEl=document.getElementById('modalBody');
    const modal=document.getElementById('modalOverlay');

    if(!titleEl||!bodyEl||!modal)return;

    titleEl.textContent=title;
    bodyEl.innerHTML=content;
    modal.classList.add('active');
}

window.editTrainingRegistration=function(id){
    const reg=trainingRegistrations.find(
        r=>Number(r.id)===Number(id)
    );

    if(!reg)return;

    const content=`
        <form id="registrationEditForm">
            <div class="form-grid">

                <div class="form-group">
                    <label>Registration Number</label>
                    <input value="${esc(reg.registration_number||'')}" disabled>
                </div>

                <div class="form-group">
                    <label>Participant</label>
                    <input value="${esc(reg.full_name||'')}" disabled>
                </div>

                <div class="form-group">
                    <label>Payment Status</label>
                    <select id="editRegPaymentStatus">
                        ${[
                            ['unpaid','Unpaid'],
                            ['partial','Partial'],
                            ['paid','Paid'],
                            ['refunded','Refunded']
                        ].map(([v,l])=>`
                            <option value="${v}" ${reg.payment_status===v?'selected':''}>
                                ${l}
                            </option>
                        `).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label>Amount Paid (KES)</label>
                    <input
                        type="number"
                        id="editRegAmountPaid"
                        min="0"
                        step="0.01"
                        value="${Number(reg.amount_paid||0)}">
                </div>

                <div class="form-group">
                    <label>Registration Status</label>
                    <select id="editRegStatus">
                        ${[
                            ['registered','Registered'],
                            ['confirmed','Confirmed'],
                            ['waitlisted','Waitlisted'],
                            ['cancelled','Cancelled'],
                            ['completed','Completed'],
                            ['no_show','No Show']
                        ].map(([v,l])=>`
                            <option value="${v}" ${reg.registration_status===v?'selected':''}>
                                ${l}
                            </option>
                        `).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label>Participant Type</label>
                    <select id="editRegParticipantType">
                        ${[
                            ['individual','Individual'],
                            ['corporate','Corporate'],
                            ['organization','Organization']
                        ].map(([v,l])=>`
                            <option value="${v}" ${reg.participant_type===v?'selected':''}>
                                ${l}
                            </option>
                        `).join('')}
                    </select>
                </div>

                <div class="form-group full">
                    <label>Notes</label>
                    <textarea id="editRegNotes" rows="4">${esc(reg.notes||'')}</textarea>
                </div>

            </div>

            <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px;">
                <button
                    type="button"
                    class="btn btn-outline"
                    onclick="closeModal()">
                    Cancel
                </button>

                <button
                    type="submit"
                    class="btn btn-primary">
                    <i class="fas fa-save"></i> Save
                </button>
            </div>
        </form>`;

    showModalForTraining('Edit Registration',content);

    document.getElementById('registrationEditForm').addEventListener(
        'submit',
        async function(e){
            e.preventDefault();

            try{
                const update={
                    payment_status:document.getElementById('editRegPaymentStatus').value,
                    amount_paid:Number(
                        document.getElementById('editRegAmountPaid').value||0
                    ),
                    registration_status:
                        document.getElementById('editRegStatus').value,
                    participant_type:
                        document.getElementById('editRegParticipantType').value,
                    notes:
                        document.getElementById('editRegNotes').value.trim()||null
                };

                const {error}=await db
                    .from('training_registrations')
                    .update(update)
                    .eq('id',id);

                if(error)throw error;

                showSuccess('Registration updated.');

                closeModal();

                await loadTrainingRegistrations();
                await loadRegistrationData();

                if(window.loadAdminTrainingSessions){
                    await window.loadAdminTrainingSessions();
                }

            }catch(error){
                console.error(error);
                showError(
                    'Could not update registration: '+error.message
                );
            }
        }
    );
};

window.updateRegistrationStatus=async function(id,status){
    try{
        const {error}=await db
            .from('training_registrations')
            .update({
                registration_status:status
            })
            .eq('id',id);

        if(error)throw error;

        showSuccess('Registration status updated.');

        closeModal();

        await loadTrainingRegistrations();
        await loadRegistrationData();

        if(window.loadAdminTrainingSessions){
            await window.loadAdminTrainingSessions();
        }

    }catch(error){
        console.error(error);
        showError(
            'Could not update registration: '+error.message
        );
    }
};

window.deleteTrainingRegistration=async function(id){
    const reg=trainingRegistrations.find(
        r=>Number(r.id)===Number(id)
    );

    if(!reg)return;

    if(!confirm(
        `Delete registration ${reg.registration_number||'#'+id} for ${reg.full_name||'this participant'}?`
    ))return;

    try{
        const {error}=await db
            .from('training_registrations')
            .delete()
            .eq('id',id);

        if(error)throw error;

        showSuccess('Registration deleted.');

        await loadTrainingRegistrations();
        await loadRegistrationData();

        if(window.loadAdminTrainingSessions){
            await window.loadAdminTrainingSessions();
        }

    }catch(error){
        console.error(error);
        showError(
            'Could not delete registration: '+error.message
        );
    }
};

window.viewSessionRegistrations=function(sessionId){
    window.switchTab('registrations');

    setTimeout(()=>{
        const filtered=trainingRegistrations.filter(
            r=>Number(r.session_id)===Number(sessionId)
        );

        const session=trainingSessions.find(
            s=>Number(s.id)===Number(sessionId)
        );

        if(!filtered.length){
            showSuccess(
                `No registrations yet for ${session?.session_title||'this session'}.`
            );
            return;
        }

        showSuccess(
            `${filtered.length} registration(s) for ${session?.session_title||'this session'}.`
        );

        const tbody=document.getElementById(
            'trainingRegistrationsTable'
        );

        if(!tbody)return;

        tbody.innerHTML=filtered.map(reg=>{
            const course=findCourse(session?.course_id);

            return `
                <tr>
                    <td><strong>${esc(reg.registration_number||'Pending')}</strong></td>
                    <td><strong>${esc(reg.full_name||'—')}</strong></td>
                    <td>${esc(reg.email||'—')}</td>
                    <td>${esc(reg.phone||'—')}</td>
                    <td>${esc(course?.course_name||session?.session_title||'—')}</td>
                    <td>${formatDate(session?.session_date)}</td>
                    <td>${statusBadge(reg.payment_status||'unpaid')}</td>
                    <td>${statusBadge(reg.registration_status||'registered')}</td>
                    <td>
                        <div class="action-btns">
                            <button
                                class="view"
                                onclick="viewTrainingRegistration(${reg.id})">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button
                                class="edit-btn"
                                onclick="editTrainingRegistration(${reg.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                    </td>
                </tr>`;
        }).join('');
    },100);
};

function formatDateTime(value){
    if(!value)return '—';

    const d=new Date(value);

    if(isNaN(d))return '—';

    return d.toLocaleString('en-GB',{
        day:'2-digit',
        month:'short',
        year:'numeric',
        hour:'2-digit',
        minute:'2-digit'
    });
}

async function initializeTrainingModule(){
    const ready=await checkSupabaseSession();

    if(!ready){
        console.warn(
            'Training admin module: no Supabase Auth session. '+
            'RLS-protected admin operations may fail.'
        );
    }

    await loadCourses();
    await loadRegistrationData();
    await loadAdminTrainingSessions();
}

window.loadAdminTrainingSessions=loadAdminTrainingSessions;

document.addEventListener('keydown',function(e){
    if(e.key==='Escape'){
        const modal=document.getElementById('trainingModal');
        if(modal?.classList.contains('active')){
            window.closeTrainingModal();
        }
    }
});

initializeTrainingModule();

console.log('✅ MEI Training Administration Module loaded');
})();
