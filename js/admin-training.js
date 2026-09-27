(function () {
    "use strict";

    let trainingSessions = [];
    let trainingCourses = [];
    let trainingRegistrations = [];

    const $ = (id) => document.getElementById(id);

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatDate(value) {
        if (!value) return "—";

        const date = new Date(value + "T00:00:00");

        if (isNaN(date.getTime())) return value;

        return date.toLocaleDateString("en-KE", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    function formatTime(value) {
        if (!value) return "—";

        const parts = String(value).split(":");

        if (parts.length < 2) return value;

        let hour = Number(parts[0]);
        const minute = parts[1];

        const suffix = hour >= 12 ? "PM" : "AM";

        hour = hour % 12 || 12;

        return `${hour}:${minute} ${suffix}`;
    }

    function formatMoney(value) {
        return Number(value || 0).toLocaleString("en-KE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function getSupabase() {
        if (!window.supabaseClient) {
            throw new Error(
                "Supabase client is not initialized."
            );
        }

        return window.supabaseClient;
    }

    async function checkSupabaseSession() {
        const supabase = getSupabase();

        const {
            data,
            error
        } = await supabase.auth.getSession();

        if (error) {
            throw error;
        }

        if (!data.session) {
            throw new Error(
                "No active Supabase Auth session."
            );
        }

        return data.session;
    }

    function notify(message, type = "success") {
        if (typeof window.showToast === "function") {
            window.showToast(message, type);
            return;
        }

        console.log(
            `[${type.toUpperCase()}] ${message}`
        );
    }

    /* =========================================================
       COURSES
       ========================================================= */

    async function loadTrainingCourses() {
        const supabase = getSupabase();

        const {
            data,
            error
        } = await supabase
            .from("training_courses")
            .select("*")
            .order("display_order", {
                ascending: true
            })
            .order("course_name", {
                ascending: true
            });

        if (error) throw error;

        trainingCourses = data || [];

        populateCourseSelect();

        return trainingCourses;
    }

    function populateCourseSelect(selectedId = "") {

        const select =
            $("trainingCourse");

        if (!select) return;

        select.innerHTML =
            `<option value="">Select training course</option>`;

        trainingCourses
            .filter(course => course.active !== false)
            .forEach(course => {

                const option =
                    document.createElement("option");

                option.value = course.id;

                option.textContent =
                    `${course.course_code ? course.course_code + " - " : ""}${course.course_name}`;

                if (
                    String(course.id) ===
                    String(selectedId)
                ) {
                    option.selected = true;
                }

                select.appendChild(option);
            });
    }

    function getCourse(id) {
        return trainingCourses.find(
            course =>
                String(course.id) ===
                String(id)
        );
    }

    function getSession(id) {
        return trainingSessions.find(
            session =>
                String(session.id) ===
                String(id)
        );
    }

    function syncCourseFields() {

        const courseId =
            $("trainingCourse")?.value;

        if (!courseId) return;

        const course =
            getCourse(courseId);

        if (!course) return;

        if ($("trainingService")) {
            $("trainingService").value =
                course.service || "";
        }

        if ($("trainingTitle")) {
            $("trainingTitle").value =
                course.course_name || "";
        }

        if ($("trainingPrice")) {
            $("trainingPrice").value =
                course.default_price || 0;
        }
    }

    /* =========================================================
       LOAD SESSIONS
       ========================================================= */

    async function loadAdminTrainingSessions() {

        const table =
            $("trainingSessionsTable");

        try {

            const supabase =
                getSupabase();

            await checkSupabaseSession();

            if (!trainingCourses.length) {
                await loadTrainingCourses();
            }

            const {
                data,
                error
            } = await supabase
                .from("training_sessions")
                .select("*")
                .order("session_date", {
                    ascending: true
                })
                .order("start_time", {
                    ascending: true
                });

            if (error) throw error;

            trainingSessions =
                data || [];

            renderTrainingSessions();

            console.log(
                "Training sessions loaded:",
                trainingSessions.length
            );

        } catch (error) {

            console.error(
                "TRAINING SESSIONS ERROR:",
                error
            );

            if (table) {
                table.innerHTML = `
                    <tr>
                        <td colspan="10"
                            style="text-align:center;padding:30px;">
                            <strong>
                                Unable to load training sessions
                            </strong>
                            <div style="
                                margin-top:8px;
                                color:#b91c1c;
                            ">
                                ${escapeHTML(error.message)}
                            </div>
                        </td>
                    </tr>
                `;
            }
        }
    }

    /* =========================================================
       RENDER SESSIONS
       ========================================================= */

    function renderTrainingSessions() {

        const table =
            $("trainingSessionsTable");

        if (!table) return;

        let rows =
            [...trainingSessions];

        const service =
            $("trainingServiceFilter")?.value || "";

        const status =
            $("trainingStatusFilter")?.value || "";

        if (service) {
            rows =
                rows.filter(
                    row =>
                        row.service === service
                );
        }

        if (status) {
            rows =
                rows.filter(
                    row =>
                        row.status === status
                );
        }

        updateStatistics(rows);

        if ($("trainingCount")) {
            $("trainingCount").textContent =
                rows.length;
        }

        if (!rows.length) {

            table.innerHTML = `
                <tr>
                    <td colspan="10"
                        style="text-align:center;padding:35px;">
                        No training sessions found.
                    </td>
                </tr>
            `;

            return;
        }

        table.innerHTML =
            rows.map(session => {

                const course =
                    getCourse(session.course_id);

                const courseName =
                    course?.course_name ||
                    "Training Course";

                const registrationCount =
                    trainingRegistrations.filter(
                        registration =>
                            String(
                                registration.session_id
                            ) ===
                            String(session.id)
                    ).length;

                return `
                    <tr>

                        <td>
                            <strong>
                                ${formatDate(
                                    session.session_date
                                )}
                            </strong>
                            <div style="
                                font-size:12px;
                                color:#64748b;
                            ">
                                ${formatTime(
                                    session.start_time
                                )}
                                -
                                ${formatTime(
                                    session.end_time
                                )}
                            </div>
                        </td>

                        <td>
                            <strong>
                                ${escapeHTML(
                                    session.session_title ||
                                    courseName
                                )}
                            </strong>

                            <div style="
                                font-size:12px;
                                color:#64748b;
                            ">
                                ${escapeHTML(
                                    session.course_code ||
                                    course?.course_code ||
                                    ""
                                )}
                            </div>
                        </td>

                        <td>
                            ${escapeHTML(
                                session.service || "—"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                session.venue || "—"
                            )}
                        </td>

                        <td>
                            ${session.capacity ?? "—"}
                        </td>

                        <td>
                            ${registrationCount}
                        </td>

                        <td>
                            <span class="status-badge">
                                ${escapeHTML(
                                    session.status || "—"
                                )}
                            </span>
                        </td>

                        <td>
                            ${
                                session.published
                                    ? `
                                        <span class="status-badge status-success">
                                            Yes
                                        </span>
                                      `
                                    : `
                                        <span class="status-badge status-warning">
                                            No
                                        </span>
                                      `
                            }
                        </td>

                        <td>
                            <button
                                type="button"
                                class="btn btn-sm"
                                onclick="editTrainingSession(${session.id})"
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                class="btn btn-sm btn-danger"
                                onclick="deleteTrainingSession(${session.id})"
                            >
                                Delete
                            </button>
                        </td>

                    </tr>
                `;

            }).join("");
    }

    /* =========================================================
       STATISTICS
       ========================================================= */

    function updateStatistics(rows) {

        const today =
            new Date();

        today.setHours(
            0, 0, 0, 0
        );

        const total =
            rows.length;

        const published =
            rows.filter(
                row => row.published === true
            ).length;

        const open =
            rows.filter(
                row => row.status === "open"
            ).length;

        const upcoming =
            rows.filter(row => {

                if (!row.session_date) {
                    return false;
                }

                const date =
                    new Date(
                        row.session_date +
                        "T00:00:00"
                    );

                return (
                    date >= today &&
                    ![
                        "cancelled",
                        "postponed",
                        "completed"
                    ].includes(row.status)
                );

            }).length;

        if ($("trainingTotal")) {
            $("trainingTotal").textContent =
                total;
        }

        if ($("trainingPublished")) {
            $("trainingPublished").textContent =
                published;
        }

        if ($("trainingOpen")) {
            $("trainingOpen").textContent =
                open;
        }

        if ($("trainingUpcoming")) {
            $("trainingUpcoming").textContent =
                upcoming;
        }
    }

    /* =========================================================
       OPEN MODAL
       ========================================================= */

    async function openTrainingModal(id = null) {

        const modal =
            $("trainingModal");

        const form =
            $("trainingForm");

        if (!modal || !form) {
            console.error(
                "Training modal not found."
            );
            return;
        }

        try {

            if (!trainingCourses.length) {
                await loadTrainingCourses();
            }

            form.reset();

            if ($("trainingId")) {
                $("trainingId").value = "";
            }

            if ($("trainingPublished")) {
                $("trainingPublished").checked =
                    true;
            }

            if ($("trainingStatus")) {
                $("trainingStatus").value =
                    "open";
            }

            if ($("trainingStartTime")) {
                $("trainingStartTime").value =
                    "09:00";
            }

            if ($("trainingEndTime")) {
                $("trainingEndTime").value =
                    "16:00";
            }

            if ($("trainingCapacity")) {
                $("trainingCapacity").value =
                    "25";
            }

            if ($("trainingPrice")) {
                $("trainingPrice").value =
                    "0";
            }

            if ($("trainingVenue")) {
                $("trainingVenue").value =
                    "MEI Group Training Centre";
            }

            if (id !== null) {

                const session =
                    getSession(id);

                if (!session) {
                    throw new Error(
                        "Training session not found."
                    );
                }

                if ($("trainingId")) {
                    $("trainingId").value =
                        session.id;
                }

                populateCourseSelect(
                    session.course_id
                );

                if ($("trainingCourse")) {
                    $("trainingCourse").value =
                        session.course_id || "";
                }

                if ($("trainingService")) {
                    $("trainingService").value =
                        session.service || "";
                }

                if ($("trainingTitle")) {
                    $("trainingTitle").value =
                        session.session_title || "";
                }

                if ($("trainingDate")) {
                    $("trainingDate").value =
                        session.session_date || "";
                }

                if ($("trainingDeadline")) {
                    $("trainingDeadline").value =
                        session.registration_deadline || "";
                }

                if ($("trainingStartTime")) {
                    $("trainingStartTime").value =
                        session.start_time || "";
                }

                if ($("trainingEndTime")) {
                    $("trainingEndTime").value =
                        session.end_time || "";
                }

                if ($("trainingVenue")) {
                    $("trainingVenue").value =
                        session.venue || "";
                }

                if ($("trainingLocation")) {
                    $("trainingLocation").value =
                        session.location || "";
                }

                if ($("trainingTrainer")) {
                    $("trainingTrainer").value =
                        session.trainer_name || "";
                }

                if ($("trainingCapacity")) {
                    $("trainingCapacity").value =
                        session.capacity || 25;
                }

                if ($("trainingPrice")) {
                    $("trainingPrice").value =
                        session.price || 0;
                }

                if ($("trainingStatus")) {
                    $("trainingStatus").value =
                        session.status || "scheduled";
                }

                if ($("trainingDescription")) {
                    $("trainingDescription").value =
                        session.description || "";
                }

                if ($("trainingNotes")) {
                    $("trainingNotes").value =
                        session.notes || "";
                }

                if ($("trainingPublished")) {
                    $("trainingPublished").checked =
                        session.published === true;
                }

                if ($("saveTrainingButton")) {
                    $("saveTrainingButton").textContent =
                        "Update Training Session";
                }

            } else {

                populateCourseSelect();

                if ($("saveTrainingButton")) {
                    $("saveTrainingButton").textContent =
                        "Save Training Session";
                }
            }

            modal.style.display =
                "flex";

            modal.classList.add(
                "active"
            );

        } catch (error) {

            console.error(
                "OPEN TRAINING MODAL ERROR:",
                error
            );

            notify(
                error.message,
                "error"
            );
        }
    }

    /* =========================================================
       CLOSE MODAL
       ========================================================= */

    function closeTrainingModal() {

        const modal =
            $("trainingModal");

        if (!modal) return;

        modal.style.display =
            "none";

        modal.classList.remove(
            "active"
        );
    }

    /* =========================================================
       SAVE
       ========================================================= */

    async function saveTrainingSession(event) {

        event.preventDefault();

        try {

            const supabase =
                getSupabase();

            const authSession =
                await checkSupabaseSession();

            const courseId =
                $("trainingCourse")?.value;

            if (!courseId) {
                throw new Error(
                    "Please select a training course."
                );
            }

            const course =
                getCourse(courseId);

            if (!course) {
                throw new Error(
                    "Selected training course not found."
                );
            }

            const date =
                $("trainingDate")?.value;

            if (!date) {
                throw new Error(
                    "Please select a training date."
                );
            }

            const payload = {

                course_id:
                    Number(courseId),

                service:
                    course.service,

                session_title:
                    $("trainingTitle")?.value.trim() ||
                    course.course_name,

                session_date:
                    date,

                start_time:
                    $("trainingStartTime")?.value ||
                    null,

                end_time:
                    $("trainingEndTime")?.value ||
                    null,

                venue:
                    $("trainingVenue")?.value.trim() ||
                    null,

                location:
                    $("trainingLocation")?.value.trim() ||
                    null,

                trainer_name:
                    $("trainingTrainer")?.value.trim() ||
                    null,

                capacity:
                    Number(
                        $("trainingCapacity")?.value ||
                        25
                    ),

                registration_deadline:
                    $("trainingDeadline")?.value ||
                    null,

                price:
                    Number(
                        $("trainingPrice")?.value ||
                        0
                    ),

                currency:
                    "KES",

                status:
                    $("trainingStatus")?.value ||
                    "scheduled",

                description:
                    $("trainingDescription")?.value.trim() ||
                    null,

                notes:
                    $("trainingNotes")?.value.trim() ||
                    null,

                published:
                    $("trainingPublished")?.checked === true
            };

            const id =
                $("trainingId")?.value;

            let result;

            if (id) {

                result =
                    await supabase
                        .from("training_sessions")
                        .update(payload)
                        .eq("id", id)
                        .select()
                        .single();

            } else {

                payload.created_by =
                    authSession.user.id;

                result =
                    await supabase
                        .from("training_sessions")
                        .insert(payload)
                        .select()
                        .single();
            }

            if (result.error) {
                throw result.error;
            }

            notify(
                id
                    ? "Training session updated successfully."
                    : "Training session created successfully.",
                "success"
            );

            closeTrainingModal();

            await loadAdminTrainingSessions();

        } catch (error) {

            console.error(
                "SAVE TRAINING ERROR:",
                error
            );

            notify(
                error.message,
                "error"
            );
        }
    }

    /* =========================================================
       DELETE
       ========================================================= */

    async function deleteTrainingSession(id) {

        const session =
            getSession(id);

        if (!session) {
            notify(
                "Training session not found.",
                "error"
            );
            return;
        }

        if (
            !confirm(
                `Delete "${session.session_title}" on ${formatDate(session.session_date)}?`
            )
        ) {
            return;
        }

        try {

            const supabase =
                getSupabase();

            await checkSupabaseSession();

            const {
                error
            } = await supabase
                .from("training_sessions")
                .delete()
                .eq("id", id);

            if (error) throw error;

            notify(
                "Training session deleted.",
                "success"
            );

            await loadAdminTrainingSessions();

        } catch (error) {

            console.error(
                "DELETE TRAINING ERROR:",
                error
            );

            notify(
                error.message,
                "error"
            );
        }
    }

    /* =========================================================
       REGISTRATIONS
       ========================================================= */

    async function loadTrainingRegistrations() {

        try {

            const supabase =
                getSupabase();

            await checkSupabaseSession();

            const {
                data,
                error
            } = await supabase
                .from("training_registrations")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );

            if (error) throw error;

            trainingRegistrations =
                data || [];

            if ($("registrationsCount")) {
                $("registrationsCount").textContent =
                    trainingRegistrations.length;
            }

            if ($("regBadge")) {
                $("regBadge").textContent =
                    trainingRegistrations.length;
            }

            return trainingRegistrations;

        } catch (error) {

            console.error(
                "REGISTRATIONS ERROR:",
                error
            );

            return [];
        }
    }

    async function updateTrainingRegistration(
        id,
        status
    ) {

        try {

            const supabase =
                getSupabase();

            await checkSupabaseSession();

            const {
                error
            } = await supabase
                .from("training_registrations")
                .update({
                    registration_status:
                        status
                })
                .eq("id", id);

            if (error) throw error;

            notify(
                `Registration updated to ${status}.`,
                "success"
            );

            await loadTrainingRegistrations();

        } catch (error) {

            console.error(
                "REGISTRATION UPDATE ERROR:",
                error
            );

            notify(
                error.message,
                "error"
            );
        }
    }

    /* =========================================================
       REFRESH
       ========================================================= */

    async function refreshTrainingData() {

        await loadAdminTrainingSessions();

        await loadTrainingRegistrations();

        notify(
            "Training data refreshed.",
            "success"
        );
    }

    /* =========================================================
       FILTERS
       ========================================================= */

    function setupFilters() {

        $("trainingServiceFilter")
            ?.addEventListener(
                "change",
                renderTrainingSessions
            );

        $("trainingStatusFilter")
            ?.addEventListener(
                "change",
                renderTrainingSessions
            );
    }

    /* =========================================================
       FORM
       ========================================================= */

    function setupForm() {

        $("trainingForm")
            ?.addEventListener(
                "submit",
                saveTrainingSession
            );

        $("trainingCourse")
            ?.addEventListener(
                "change",
                syncCourseFields
            );
    }

    /* =========================================================
       MODAL
       ========================================================= */

    function setupModal() {

        const modal =
            $("trainingModal");

        if (!modal) return;

        modal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === modal
                ) {
                    closeTrainingModal();
                }

            }
        );
    }

    /* =========================================================
       EXPOSE FUNCTIONS GLOBALLY
       THIS FIXES onclick="openTrainingModal()"
       ========================================================= */

    window.openTrainingModal =
        openTrainingModal;

    window.closeTrainingModal =
        closeTrainingModal;

    window.editTrainingSession =
        function (id) {
            openTrainingModal(id);
        };

    window.deleteTrainingSession =
        deleteTrainingSession;

    window.loadAdminTrainingSessions =
        loadAdminTrainingSessions;

    window.loadTrainingRegistrations =
        loadTrainingRegistrations;

    window.updateTrainingRegistration =
        updateTrainingRegistration;

    window.refreshTrainingData =
        refreshTrainingData;

    /* =========================================================
       INITIALIZE
       ========================================================= */

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            setupFilters();
            setupForm();
            setupModal();

            console.log(
                "✅ MEI Training Management initialized"
            );
        }
    );

})();
