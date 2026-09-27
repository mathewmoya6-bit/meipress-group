// ============================================================
// MEI GROUP – TRAINING CALENDAR
// 12-month schedule: October 2025 → September 2026
// ============================================================

const CALENDAR_DATA = [

    // ============================================================
    // OCTOBER 2025
    // ============================================================
    {
        month: 'October',
        year: '2025',
        emoji: '🍂',
        current: false,

        programs: [
            {
                type: 'education',
                title: 'Fall Intake – Final Applications',
                desc: 'USA & Canada Fall 2025 late admissions',
                tag: 'Intake',
                register: false
            },
            {
                type: 'roadsafety',
                title: 'Safe to & from School – Cohort 1',
                desc: 'Primary & secondary school programs',
                tag: 'Workshop',
                register: true
            },
            {
                type: 'osh',
                title: 'First Aid Certification',
                desc: '3-day CPR & emergency response course',
                tag: 'Certification',
                register: true
            }
        ]
    },

    // ============================================================
    // NOVEMBER 2025
    // ============================================================
    {
        month: 'November',
        year: '2025',
        emoji: '🌧️',
        current: false,

        programs: [
            {
                type: 'education',
                title: 'Spring 2026 Applications Open',
                desc: 'USA, Canada, Australia, UK intakes',
                tag: 'Intake',
                register: false
            },
            {
                type: 'roadsafety',
                title: 'Defensive Driving – Corporate',
                desc: 'Advanced driver training for fleets',
                tag: 'Corporate',
                register: true
            },
            {
                type: 'osh',
                title: 'Fire & Safety Training',
                desc: 'Fire risk assessment, drills & extinguisher use',
                tag: 'Certification',
                register: true
            }
        ]
    },

    // ============================================================
    // DECEMBER 2025
    // ============================================================
    {
        month: 'December',
        year: '2025',
        emoji: '🎄',
        current: false,

        programs: [
            {
                type: 'education',
                title: 'Spring 2026 Visa Prep',
                desc: 'Mock visa interviews & document review',
                tag: 'Visa',
                register: false
            },
            {
                type: 'roadsafety',
                title: 'Driver Profiling – Q4',
                desc: 'Assessment & behavior analysis',
                tag: 'Assessment',
                register: true
            },
            {
                type: 'osh',
                title: 'OSH (OSHA 2007) – Compliance',
                desc: 'End-of-year regulatory training',
                tag: 'Compliance',
                register: true
            }
        ]
    },

    // ============================================================
    // JANUARY 2026
    // ============================================================
    {
        month: 'January',
        year: '2026',
        emoji: '❄️',
        current: false,

        programs: [
            {
                type: 'education',
                title: 'Spring 2026 Intake Begins',
                desc: 'Students depart to USA, Canada, Australia',
                tag: 'Intake',
                register: false
            },
            {
                type: 'roadsafety',
                title: 'Safe to & from School – Cohort 2',
                desc: 'New school term launches',
                tag: 'Workshop',
                register: true
            },
            {
                type: 'osh',
                title: 'First Aid Certification',
                desc: 'New year, new safety skills',
                tag: 'Certification',
                register: true
            }
        ]
    },

    // ============================================================
    // FEBRUARY 2026
    // ============================================================
    {
        month: 'February',
        year: '2026',
        emoji: '❤️',
        current: false,

        programs: [
            {
                type: 'education',
                title: 'Fall 2026 Applications Open',
                desc: 'Early-bird applications for USA/Canada',
                tag: 'Intake',
                register: false
            },
            {
                type: 'roadsafety',
                title: 'Defensive Driving – Open',
                desc: 'Individual driver certification',
                tag: 'Workshop',
                register: true
            },
            {
                type: 'osh',
                title: 'Fire & Safety Training',
                desc: 'Practical fire drills + extinguisher use',
                tag: 'Certification',
                register: true
            }
        ]
    },

    // ============================================================
    // MARCH 2026
    // ============================================================
    {
        month: 'March',
        year: '2026',
        emoji: '🌸',
        current: false,

        programs: [
            {
                type: 'education',
                title: 'Scholarship Guidance Week',
                desc: 'Free consultations & financial planning',
                tag: 'Support',
                register: false
            },
            {
                type: 'roadsafety',
                title: 'Fleet Safety Assessment',
                desc: 'Transport company audits',
                tag: 'Assessment',
                register: true
            },
            {
                type: 'osh',
                title: 'OSH (OSHA 2007) – Certification',
                desc: 'Compliance for new organizations',
                tag: 'Compliance',
                register: true
            }
        ]
    },

    // ============================================================
    // APRIL 2026
    // ============================================================
    {
        month: 'April',
        year: '2026',
        emoji: '🌷',
        current: false,

        programs: [
            {
                type: 'education',
                title: 'Fall 2026 Priority Deadline',
                desc: 'USA Ivy League + Canada U15',
                tag: 'Deadline',
                register: false
            },
            {
                type: 'roadsafety',
                title: 'Safe to & from School – Cohort 3',
                desc: 'April school holiday sessions',
                tag: 'Workshop',
                register: true
            },
            {
                type: 'osh',
                title: 'First Aid Recertification',
                desc: 'Renewal course for past participants',
                tag: 'Certification',
                register: true
            }
        ]
    },

    // ============================================================
    // MAY 2026
    // ============================================================
    {
        month: 'May',
        year: '2026',
        emoji: '🌻',
        current: false,

        programs: [
            {
                type: 'education',
                title: 'Summer 2026 Intake',
                desc: 'Short courses & summer programs',
                tag: 'Intake',
                register: false
            },
            {
                type: 'roadsafety',
                title: 'Driver Profiling – Q2',
                desc: 'Mid-year fleet assessments',
                tag: 'Assessment',
                register: true
            },
            {
                type: 'osh',
                title: 'Fire & Safety Training',
                desc: 'Corporate group sessions',
                tag: 'Certification',
                register: true
            }
        ]
    },

    // ============================================================
    // JUNE 2026
    // ============================================================
    {
        month: 'June',
        year: '2026',
        emoji: '☀️',
        current: false,

        programs: [
            {
                type: 'education',
                title: 'Visa Interview Prep – Fall',
                desc: 'For Fall 2026 applicants',
                tag: 'Visa',
                register: false
            },
            {
                type: 'roadsafety',
                title: 'Defensive Driving – Corporate',
                desc: 'Nairobi & Mombasa cohorts',
                tag: 'Corporate',
                register: true
            },
            {
                type: 'osh',
                title: 'OSH (OSHA 2007) – Compliance',
                desc: 'Mid-year regulatory refresher',
                tag: 'Compliance',
                register: true
            }
        ]
    },

    // ============================================================
    // JULY 2026
    // ============================================================
    {
        month: 'July',
        year: '2026',
        emoji: '🏖️',
        current: false,

        programs: [
            {
                type: 'education',
                title: 'Fall 2026 Final Deadline',
                desc: 'Last chance for Fall admissions',
                tag: 'Deadline',
                register: false
            },
            {
                type: 'roadsafety',
                title: 'Safe to & from School – Cohort 4',
                desc: 'Pre-term safety workshops',
                tag: 'Workshop',
                register: true
            },
            {
                type: 'osh',
                title: 'First Aid Certification',
                desc: 'Holiday intensive course',
                tag: 'Certification',
                register: true
            }
        ]
    },

    // ============================================================
    // AUGUST 2026
    // ============================================================
    {
        month: 'August',
        year: '2026',
        emoji: '🎒',
        current: false,

        programs: [
            {
                type: 'education',
                title: 'Fall 2026 Pre-Departure',
                desc: 'Travel, accommodation & orientation',
                tag: 'Support',
                register: false
            },
            {
                type: 'roadsafety',
                title: 'Back-to-School Safety Drive',
                desc: 'Nationwide school campaigns',
                tag: 'Workshop',
                register: true
            },
            {
                type: 'osh',
                title: 'Fire & Safety Training',
                desc: 'Q3 corporate cohorts',
                tag: 'Certification',
                register: true
            }
        ]
    },

    // ============================================================
    // SEPTEMBER 2026
    // ============================================================
    {
        month: 'September',
        year: '2026',
        emoji: '🍁',
        current: false,

        programs: [
            {
                type: 'education',
                title: 'Fall 2026 Intake Departs',
                desc: 'Students fly to their destinations',
                tag: 'Intake',
                register: false
            },
            {
                type: 'roadsafety',
                title: 'Driver Profiling – Q3',
                desc: 'End-of-quarter assessments',
                tag: 'Assessment',
                register: true
            },
            {
                type: 'osh',
                title: 'OSH (OSHA 2007) – Certification',
                desc: 'Q3 compliance training',
                tag: 'Compliance',
                register: true
            }
        ]
    }
];


// ============================================================
// CALENDAR STATE
// ============================================================

let activeFilter = 'all';


// ============================================================
// ESCAPE HTML
// Prevents accidental HTML injection from calendar data
// ============================================================

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return '';
    }

    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


// ============================================================
// CREATE REGISTER URL
// ============================================================

function getRegisterURL(month, program) {

    const params = new URLSearchParams();

    params.set('month', month.month);
    params.set('year', month.year);
    params.set('title', program.title);
    params.set('type', program.type);
    params.set('tag', program.tag);

    return `register.html?${params.toString()}`;
}


// ============================================================
// PROGRAM ICON
// ============================================================

function getProgramIcon(type) {

    if (type === 'education') {
        return '🎓';
    }

    if (type === 'roadsafety') {
        return '🚸';
    }

    if (type === 'osh') {
        return '🏭';
    }

    return '📚';
}


// ============================================================
// RENDER PROGRAM
// ============================================================

function renderProgram(program, month) {

    const icon = getProgramIcon(program.type);

    let registerHTML = '';

    /*
     * Education entries are information/intake items
     * for now, so only Road Safety and OSH have
     * training registration buttons.
     */

    if (program.register === true) {

        const registerURL = getRegisterURL(month, program);

        registerHTML = `
            <a
                href="${registerURL}"
                class="register-btn"
                aria-label="Register for ${escapeHTML(program.title)}"
            >
                <span>Register</span>
                <span>→</span>
            </a>
        `;
    }

    return `
        <div class="program ${escapeHTML(program.type)}">

            <div class="icon-wrap">
                ${icon}
            </div>

            <div class="program-content">

                <div class="program-title">
                    ${escapeHTML(program.title)}
                </div>

                <div class="program-desc">
                    ${escapeHTML(program.desc)}
                </div>

                <div class="program-bottom">

                    <span class="program-tag">
                        ${escapeHTML(program.tag)}
                    </span>

                    ${registerHTML}

                </div>

            </div>

        </div>
    `;
}


// ============================================================
// RENDER CALENDAR
// ============================================================

function renderCalendar() {

    const grid = document.getElementById('calendarGrid');

    if (!grid) {
        return;
    }

    grid.innerHTML = '';

    CALENDAR_DATA.forEach(function (month) {

        const visiblePrograms = month.programs.filter(function (program) {

            return (
                activeFilter === 'all' ||
                program.type === activeFilter
            );

        });

        if (visiblePrograms.length === 0) {
            return;
        }

        const card = document.createElement('div');

        card.className =
            'month-card' +
            (month.current ? ' current' : '');

        let programsHTML = '';

        visiblePrograms.forEach(function (program) {

            programsHTML += renderProgram(
                program,
                month
            );

        });

        card.innerHTML = `

            <div class="month-header">

                ${
                    month.current
                        ? '<span class="badge-now">Now</span>'
                        : ''
                }

                <div>

                    <div class="month-name">
                        ${escapeHTML(month.month)}
                    </div>

                    <div class="month-year">
                        ${escapeHTML(month.year)}
                    </div>

                </div>

                <div class="month-emoji">
                    ${month.emoji}
                </div>

            </div>

            <div class="month-body">

                ${programsHTML}

            </div>
        `;

        grid.appendChild(card);

    });


    // ========================================================
    // EMPTY STATE
    // ========================================================

    if (grid.children.length === 0) {

        grid.innerHTML = `

            <div
                style="
                    grid-column:1 / -1;
                    text-align:center;
                    padding:60px 20px;
                    color:var(--text-secondary);
                "
            >

                <i
                    class="fas fa-calendar-times"
                    style="
                        font-size:3rem;
                        color:var(--text-light);
                        margin-bottom:12px;
                    "
                ></i>

                <p>
                    No programs found for this filter.
                </p>

            </div>
        `;
    }
}


// ============================================================
// FILTERS
// ============================================================

function initializeFilters() {

    document
        .querySelectorAll('.filter-btn')
        .forEach(function (button) {

            button.addEventListener('click', function () {

                document
                    .querySelectorAll('.filter-btn')
                    .forEach(function (btn) {

                        btn.classList.remove('active');

                    });

                this.classList.add('active');

                activeFilter =
                    this.dataset.filter || 'all';

                renderCalendar();

            });

        });

}


// ============================================================
// DOWNLOAD / PRINT PDF
// ============================================================

function initializeDownload() {

    const downloadButton =
        document.getElementById('downloadBtn');

    if (!downloadButton) {
        return;
    }

    downloadButton.addEventListener(
        'click',
        function () {

            window.print();

        }
    );
}


// ============================================================
// INITIALIZE
// ============================================================

document.addEventListener(
    'DOMContentLoaded',
    function () {

        if (typeof meiInitCommon === 'function') {
            meiInitCommon();
        }

        initializeFilters();

        initializeDownload();

        renderCalendar();

        console.log(
            '✅ MEI Group – Training Calendar loaded'
        );

    }
);
