// ============================================================
// MEI GROUP – TRAINING CALENDAR
// 12-month schedule: October 2025 → September 2026
// ============================================================

const CALENDAR_DATA = [
    // ============================================================
    // OCTOBER 2025
    // ============================================================
    {
        month: 'October', year: '2025', emoji: '🍂', current: false,
        programs: [
            { type: 'education',  title: 'Fall Intake – Final Applications', desc: 'USA & Canada Fall 2025 late admissions', tag: 'Intake' },
            { type: 'roadsafety', title: 'Safe to & from School – Cohort 1', desc: 'Primary & secondary school programs', tag: 'Workshop' },
            { type: 'osh',        title: 'First Aid Certification', desc: '3-day CPR & emergency response course', tag: 'Certification' }
        ]
    },
    // ============================================================
    // NOVEMBER 2025
    // ============================================================
    {
        month: 'November', year: '2025', emoji: '🌧️', current: false,
        programs: [
            { type: 'education',  title: 'Spring 2026 Applications Open', desc: 'USA, Canada, Australia, UK intakes', tag: 'Intake' },
            { type: 'roadsafety', title: 'Defensive Driving – Corporate', desc: 'Advanced driver training for fleets', tag: 'Corporate' },
            { type: 'osh',        title: 'Fire & Safety Training', desc: 'Fire risk assessment, drills & extinguisher use', tag: 'Certification' }
        ]
    },
    // ============================================================
    // DECEMBER 2025
    // ============================================================
    {
        month: 'December', year: '2025', emoji: '🎄', current: false,
        programs: [
            { type: 'education',  title: 'Spring 2026 Visa Prep', desc: 'Mock visa interviews & document review', tag: 'Visa' },
            { type: 'roadsafety', title: 'Driver Profiling – Q4', desc: 'Assessment & behavior analysis', tag: 'Assessment' },
            { type: 'osh',        title: 'OSH (OSHA 2007) – Compliance', desc: 'End-of-year regulatory training', tag: 'Compliance' }
        ]
    },
    // ============================================================
    // JANUARY 2026
    // ============================================================
    {
        month: 'January', year: '2026', emoji: '❄️', current: false,
        programs: [
            { type: 'education',  title: 'Spring 2026 Intake Begins', desc: 'Students depart to USA, Canada, Australia', tag: 'Intake' },
            { type: 'roadsafety', title: 'Safe to & from School – Cohort 2', desc: 'New school term launches', tag: 'Workshop' },
            { type: 'osh',        title: 'First Aid Certification', desc: 'New year, new safety skills', tag: 'Certification' }
        ]
    },
    // ============================================================
    // FEBRUARY 2026
    // ============================================================
    {
        month: 'February', year: '2026', emoji: '❤️', current: false,
        programs: [
            { type: 'education',  title: 'Fall 2026 Applications Open', desc: 'Early-bird applications for USA/Canada', tag: 'Intake' },
            { type: 'roadsafety', title: 'Defensive Driving – Open', desc: 'Individual driver certification', tag: 'Workshop' },
            { type: 'osh',        title: 'Fire & Safety Training', desc: 'Practical fire drills + extinguisher use', tag: 'Certification' }
        ]
    },
    // ============================================================
    // MARCH 2026
    // ============================================================
    {
        month: 'March', year: '2026', emoji: '🌸', current: false,
        programs: [
            { type: 'education',  title: 'Scholarship Guidance Week', desc: 'Free consultations & financial planning', tag: 'Support' },
            { type: 'roadsafety', title: 'Fleet Safety Assessment', desc: 'Transport company audits', tag: 'Assessment' },
            { type: 'osh',        title: 'OSH (OSHA 2007) – Certification', desc: 'Compliance for new organizations', tag: 'Compliance' }
        ]
    },
    // ============================================================
    // APRIL 2026
    // ============================================================
    {
        month: 'April', year: '2026', emoji: '🌷', current: false,
        programs: [
            { type: 'education',  title: 'Fall 2026 Priority Deadline', desc: 'USA Ivy League + Canada U15', tag: 'Deadline' },
            { type: 'roadsafety', title: 'Safe to & from School – Cohort 3', desc: 'April school holiday sessions', tag: 'Workshop' },
            { type: 'osh',        title: 'First Aid Recertification', desc: 'Renewal course for past participants', tag: 'Certification' }
        ]
    },
    // ============================================================
    // MAY 2026
    // ============================================================
    {
        month: 'May', year: '2026', emoji: '🌻', current: false,
        programs: [
            { type: 'education',  title: 'Summer 2026 Intake', desc: 'Short courses & summer programs', tag: 'Intake' },
            { type: 'roadsafety', title: 'Driver Profiling – Q2', desc: 'Mid-year fleet assessments', tag: 'Assessment' },
            { type: 'osh',        title: 'Fire & Safety Training', desc: 'Corporate group sessions', tag: 'Certification' }
        ]
    },
    // ============================================================
    // JUNE 2026
    // ============================================================
    {
        month: 'June', year: '2026', emoji: '☀️', current: false,
        programs: [
            { type: 'education',  title: 'Visa Interview Prep – Fall', desc: 'For Fall 2026 applicants', tag: 'Visa' },
            { type: 'roadsafety', title: 'Defensive Driving – Corporate', desc: 'Nairobi & Mombasa cohorts', tag: 'Corporate' },
            { type: 'osh',        title: 'OSH (OSHA 2007) – Compliance', desc: 'Mid-year regulatory refresher', tag: 'Compliance' }
        ]
    },
    // ============================================================
    // JULY 2026
    // ============================================================
    {
        month: 'July', year: '2026', emoji: '🏖️', current: false,
        programs: [
            { type: 'education',  title: 'Fall 2026 Final Deadline', desc: 'Last chance for Fall admissions', tag: 'Deadline' },
            { type: 'roadsafety', title: 'Safe to & from School – Cohort 4', desc: 'Pre-term safety workshops', tag: 'Workshop' },
            { type: 'osh',        title: 'First Aid Certification', desc: 'Holiday intensive course', tag: 'Certification' }
        ]
    },
    // ============================================================
    // AUGUST 2026
    // ============================================================
    {
        month: 'August', year: '2026', emoji: '🎒', current: false,
        programs: [
            { type: 'education',  title: 'Fall 2026 Pre-Departure', desc: 'Travel, accommodation & orientation', tag: 'Support' },
            { type: 'roadsafety', title: 'Back-to-School Safety Drive', desc: 'Nationwide school campaigns', tag: 'Workshop' },
            { type: 'osh',        title: 'Fire & Safety Training', desc: 'Q3 corporate cohorts', tag: 'Certification' }
        ]
    },
    // ============================================================
    // SEPTEMBER 2026
    // ============================================================
    {
        month: 'September', year: '2026', emoji: '🍁', current: false,
        programs: [
            { type: 'education',  title: 'Fall 2026 Intake Departs', desc: 'Students fly to their destinations', tag: 'Intake' },
            { type: 'roadsafety', title: 'Driver Profiling – Q3', desc: 'End-of-quarter assessments', tag: 'Assessment' },
            { type: 'osh',        title: 'OSH (OSHA 2007) – Certification', desc: 'Q3 compliance training', tag: 'Compliance' }
        ]
    }
];

// ============================================================
// RENDER
// ============================================================
let activeFilter = 'all';

function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    if (!grid) return;

    grid.innerHTML = '';

    CALENDAR_DATA.forEach(function (month) {
        // Filter programs
        const visiblePrograms = month.programs.filter(function (p) {
            return activeFilter === 'all' || p.type === activeFilter;
        });

        // Skip month entirely if no matching programs
        if (visiblePrograms.length === 0) return;

        const card = document.createElement('div');
        card.className = 'month-card' + (month.current ? ' current' : '');

        let programsHTML = '';
        visiblePrograms.forEach(function (p) {
            programsHTML += `
                <div class="program ${p.type}">
                    <div class="icon-wrap">
                        ${p.type === 'education' ? '🎓' : p.type === 'roadsafety' ? '🚸' : '🏭'}
                    </div>
                    <div class="program-content">
                        <div class="program-title">${p.title}</div>
                        <div class="program-desc">${p.desc}</div>
                        <span class="program-tag">${p.tag}</span>
                    </div>
                </div>
            `;
        });

        card.innerHTML = `
            <div class="month-header">
                ${month.current ? '<span class="badge-now">Now</span>' : ''}
                <div>
                    <div class="month-name">${month.month}</div>
                    <div class="month-year">${month.year}</div>
                </div>
                <div class="month-emoji">${month.emoji}</div>
            </div>
            <div class="month-body">
                ${programsHTML}
            </div>
        `;

        grid.appendChild(card);
    });

    // Empty state
    if (grid.children.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align:center; padding:60px 20px; color:var(--text-secondary);">
                <i class="fas fa-calendar-times" style="font-size:3rem; color:var(--text-light); margin-bottom:12px;"></i>
                <p>No programs found for this filter.</p>
            </div>
        `;
    }
}

// ============================================================
// FILTERS
// ============================================================
document.querySelectorAll('.filter-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        activeFilter = this.dataset.filter;
        renderCalendar();
    });
});

// ============================================================
// DOWNLOAD (Print to PDF)
// ============================================================
document.getElementById('downloadBtn')?.addEventListener('click', function () {
    window.print();
});

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    meiInitCommon();
    renderCalendar();
    console.log('✅ MEI Group – Training Calendar loaded');
});
