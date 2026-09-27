/* =========================================================
   MEI GROUP - ADMIN TRAINING MANAGEMENT
   File: js/admin-training.js
   Version: 20260927
   ========================================================= */

(function () {
    "use strict";

    let trainingSessions = [];
    let trainingCourses = [];
    let trainingRegistrations = [];

    const $ = (id) => document.getElementById(id);

    /* =========================================================
       HELPERS
       ========================================================= */

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatDate(dateValue) {
        if (!dateValue) return "—";

        const date = new Date(dateValue + "T00:00:00");

        if (Number.isNaN(date.getTime())) {
            return dateValue;
        }

        return date.toLocaleDateString("en-KE", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    function formatTime(timeValue) {
        if (!timeValue) return "—";

        const parts = String(timeValue).split(":");
        if (parts.length < 2) return timeValue;

        let hour = parseInt(parts[0], 10);
        const minute = parts[1];

        if (Number.isNaN(hour)) return timeValue;

        const suffix = hour >= 12 ? "PM" : "AM";
        hour = hour % 12 || 12;

        return `${hour}:${minute} ${suffix}`;
    }

    function formatMoney(value) {
        const amount = Number(value || 0);

        return amount.toLocaleString("en-KE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function getSupabase() {
        if (!window.supabaseClient) {
            throw new Error(
                "Supabase client is not initialized. Check admin.html configuration."
            );
        }

        return window.supabaseClient;
    }

    async function requireSupabaseAuth() {
        const supabase = getSupabase();

        const {
            data: { session },
            error
        } = await supabase.auth.getSession();

        if (error) {
            throw error;
        }

        if (!session) {
            throw new Error(
                "No Supabase Auth session found. Please sign in through admin-login.html using Supabase Auth."
            );
        }

        return session;
    }

    function showMessage(message, type = "success") {
        if (typeof window.showToast === "function") {
            window.showToast(message, type);
            return;
        }

        const existing = $("trainingFormMessage");

        if (existing) {
            existing.textContent = message;
            existing.style.display = "block";
            existing.className = `form-message ${type}`;

            setTimeout(() => {
                existing.style.display = "none";
            }, 5000);

            return;
        }

        if (type === "error") {
            console.error(message);
        } else {
            console.log(message);
        }
    }

    function getCourseById(id) {
        return trainingCourses.find(
            course => String(course.id) === String(id)
        );
    }

    function getSessionById(id) {
        return trainingSessions.find(
            session => String(session.id) === String(id)
        );
    }

    function getCourseName(courseId) {
        const course = getCourseById(courseId);

        return course
            ? course.course_name
            : "Training Course";
    }

    /* =========================================================
       LOAD TRAINING COURSES
       ========================================================= */

    async function loadTrainingCourses() {
        const supabase = getSupabase();

        const { data, error } = await supabase
            .from("training_courses")
            .select("*")
            .order("display_order", { ascending: true })
            .order("course_name", { ascending: true });

        if (error) {
            throw error;
        }

        trainingCourses = data || [];

        populateCourseSelect();

        return trainingCourses;
    }

    function populateCourseSelect(selectedId = null) {
        const select = $("trainingCourse");

        if (!select) return;

        const currentValue =
            selectedId !== null
                ? String(selectedId)
                : String(select.value || "");

        select.innerHTML = `
            <option value="">Select training course</option>
        `;

        trainingCourses
            .filter(course => course.active !== false)
            .forEach(course => {
                const option = document.createElement("option");

                option.value = course.id;

                option.textContent =
                    `${course.course_code ? course.course_code + " - " : ""}${course.course_name}`;

                if (String(course.id) === currentValue) {
                    option.selected = true;
                }

                select.appendChild(option);
            });
    }

    /* =========================================================
       COURSE AUTO-FILL
       ========================================================= */

    function syncCourseFields() {
        const courseId = $("trainingCourse")?.value;

        if (!courseId) {
            return;
        }

        const course = getCourseById(courseId);

        if (!course) {
            return;
        }

        const serviceField = $("trainingService");
        const titleField = $("trainingTitle");
        const priceField = $("trainingPrice");

        if (serviceField && course.service) {
            serviceField.value = course.service;
        }

        if (titleField && !titleField.value.trim()) {
            titleField.value = course.course_name || "";
        }

        if (
            priceField &&
            (
                priceField.value === "" ||
                Number(priceField.value) === 0
            )
        ) {
            priceField.value = course.default_price || 0;
        }
    }

    /* =========================================================
       LOAD TRAINING SESSIONS
       ========================================================= */

    async function loadAdminTrainingSessions() {
        try {
            const supabase = getSupabase();

            await requireSupabaseAuth();

            await loadTrainingCourses();

            const { data, error } = await supabase
                .from("training_sessions")
                .select("*")
                .order("session_date", { ascending: true })
                .order("start_time", { ascending: true });

            if (error) {
                throw error;
            }

            trainingSessions = data || [];

            renderTrainingSessions();

            return trainingSessions;

        } catch (error) {
            console.error(
                "TRAINING SESSION LOAD ERROR:",
                error
            );

            const table = $("trainingSessionsTable");

            if (table) {
                table.innerHTML = `
                    <tr>
                        <td colspan="10" style="text-align:center;padding:30px;">
                            <strong>Unable to load training sessions</strong>
                            <div style="margin-top:8px;color:#b91c1c;">
                                ${escapeHTML(error.message)}
                            </div>
                        </td>
                    </tr>
                `;
            }

            showMessage(error.message, "error");

            return [];
        }
    }

    /* =========================================================
       RENDER TRAINING SESSIONS
       ========================================================= */

    function renderTrainingSessions() {
        const table = $("trainingSessionsTable");

        if (!table) return;

        const serviceFilter =
            $("trainingServiceFilter")?.value || "";

        const statusFilter =
            $("trainingStatusFilter")?.value || "";

        let rows = [...trainingSessions];

        if (serviceFilter) {
            rows = rows.filter(
                session =>
                    String(session.service || "") ===
                    String(serviceFilter)
            );
        }

        if (statusFilter) {
            rows = rows.filter(
                session =>
                    String(session.status || "") ===
                    String(statusFilter)
            );
        }

        updateTrainingStats(rows);

        const count = $("trainingCount");

        if (count) {
            count.textContent = rows.length;
        }

        if (!rows.length) {
            table.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align:center;padding:35px;">
                        <strong>No training sessions found.</strong>
                        <div style="margin-top:6px;color:#64748b;">
                            Create a training session or change the filters.
                        </div>
                    </td>
                </tr>
            `;

            return;
        }

        table.innerHTML = rows.map(session => {

            const courseName =
                getCourseName(session.course_id);

            const status =
                String(session.status || "scheduled");

            const statusClass =
                getStatusClass(status);

            const published =
                session.published === true;

            const registrationCount =
                trainingRegistrations.filter(
                    reg =>
                        String(reg.session_id) ===
                        String(session.id)
                ).length;

            return `
                <tr>

                    <td>
                        <strong>
                            ${escapeHTML(session.session_title || courseName)}
                        </strong>

                        <div style="
                            font-size:12px;
                            color:#64748b;
                            margin-top:3px;
                        ">
                            ${escapeHTML(courseName)}
                        </div>
                    </td>

                    <td>
                        ${escapeHTML(session.service || "—")}
                    </td>

                    <td>
                        <strong>
                            ${formatDate(session.session_date)}
                        </strong>

                        <div style="
                            font-size:12px;
                            color:#64748b;
                            margin-top:3px;
                        ">
                            ${formatTime(session.start_time)}
                            -
                            ${formatTime(session.end_time)}
                        </div>
                    </td>

                    <td>
                        ${escapeHTML(session.venue || "—")}
                    </td>

                    <td>
                        ${escapeHTML(session.trainer_name || "—")}
                    </td>

                    <td>
                        ${session.capacity ?? "—"}
                    </td>

                    <td>
                        ${registrationCount}
                    </td>

                    <td>
                        <span class="status-badge ${statusClass}">
                            ${escapeHTML(status)}
                        </span>
                    </td>

                    <td>
                        ${
                            published
                                ? `
                                    <span class="status-badge status-success">
                                        Published
                                    </span>
                                  `
                                : `
                                    <span class="status-badge status-warning">
                                        Hidden
                                    </span>
                                  `
                        }
                    </td>

                    <td>
                        <div style="
                            display:flex;
                            gap:6px;
                            flex-wrap:wrap;
                        ">

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

                        </div>
                    </td>

                </tr>
            `;

        }).join("");
    }

    /* =========================================================
       TRAINING STATISTICS
       ========================================================= */

    function updateTrainingStats(rows) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const total = rows.length;

        const published =
            rows.filter(
                session => session.published === true
            ).length;

        const open =
            rows.filter(
                session => session.status === "open"
            ).length;

        const upcoming =
            rows.filter(session => {
                if (!session.session_date) return false;

                const date =
                    new Date(
                        session.session_date + "T00:00:00"
                    );

                return (
                    date >= today &&
                    !["cancelled", "postponed", "completed"]
                        .includes(session.status)
                );
            }).length;

        if ($("trainingTotal")) {
            $("trainingTotal").textContent = total;
        }

        if ($("trainingPublished")) {
            $("trainingPublished").textContent = published;
        }

        if ($("trainingOpen")) {
            $("trainingOpen").textContent = open;
        }

        if ($("trainingUpcoming")) {
            $("trainingUpcoming").textContent = upcoming;
        }
    }

    function getStatusClass(status) {
        switch (String(status).toLowerCase()) {
            case "open":
                return "status-success";

            case "scheduled":
                return "status-info";

            case "full":
                return "status-warning";

            case "in_progress":
                return "status-info";

            case "completed":
                return "status-success";

            case "cancelled":
                return "status-danger";

            case "postponed":
                return "status-warning";

            default:
                return "status-neutral";
        }
    }

    /* =========================================================
       OPEN TRAINING MODAL
       ========================================================= */

    window.openTrainingModal = async function (id = null) {

        const modal = $("trainingModal");
        const form = $("trainingForm");

        if (!modal || !form) {
            console.error("Training modal/form not found.");
            return;
        }

        try {
            if (!trainingCourses.length) {
                await loadTrainingCourses();
            }
        } catch (error) {
            showMessage(error.message, "error");
            return;
        }

        form.reset();

        if ($("trainingId")) {
            $("trainingId").value = "";
        }

        if ($("trainingPublished")) {
            $("trainingPublished").checked = true;
        }

        if ($("trainingStatus")) {
            $("trainingStatus").value = "open";
        }

        if ($("trainingCapacity")) {
            $("trainingCapacity").value = "25";
        }

        if ($("trainingPrice")) {
            $("trainingPrice").value = "0";
        }

        const title =
            modal.querySelector(".modal-title") ||
            modal.querySelector("h2") ||
            modal.querySelector("h3");

        if (id !== null) {

            const session =
                getSessionById(id);

            if (!session) {
                showMessage(
                    "Training session could not be found.",
                    "error"
                );
                return;
            }

            if ($("trainingId")) {
                $("trainingId").value = session.id;
            }

            populateCourseSelect(session.course_id);

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
                    session.capacity ?? 25;
            }

            if ($("trainingPrice")) {
                $("trainingPrice").value =
                    session.price ?? 0;
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

            if (title) {
                title.textContent =
                    "Edit Training Session";
            }

        } else {

            populateCourseSelect();

            if ($("trainingStartTime")) {
                $("trainingStartTime").value = "09:00";
            }

            if ($("trainingEndTime")) {
                $("trainingEndTime").value = "16:00";
            }

            if ($("trainingVenue")) {
                $("trainingVenue").value =
                    "MEI Group Training Centre";
            }

            if ($("trainingCapacity")) {
                $("trainingCapacity").value = "25";
            }

            if ($("trainingStatus")) {
                $("trainingStatus").value = "open";
            }

            if ($("trainingPublished")) {
                $("trainingPublished").checked = true;
            }

            if ($("saveTrainingButton")) {
                $("saveTrainingButton").textContent =
                    "Save Training Session";
            }

            if (title) {
                title.textContent =
                    "Add Training Session";
            }
        }

        modal.style.display = "flex";
        modal.classList.add("active");

        document.body.classList.add("modal-open");
    };

    /* =========================================================
       CLOSE MODAL
       ========================================================= */

    window.closeTrainingModal = function () {

        const modal = $("trainingModal");

        if (!modal) return;

        modal.style.display = "none";
        modal.classList.remove("active");

        document.body.classList.remove("modal-open");
    };

    /* =========================================================
       EDIT
       ========================================================= */

    window.editTrainingSession = function (id) {
        window.openTrainingModal(id);
    };

    /* =========================================================
       SAVE TRAINING SESSION
       ========================================================= */

    async function saveTrainingSession(event) {

        event.preventDefault();

        const button = $("saveTrainingButton");

        try {

            const supabase = getSupabase();

            const authSession =
                await requireSupabaseAuth();

            const courseId =
                $("trainingCourse")?.value;

            if (!courseId) {
                throw new Error(
                    "Please select a training course."
                );
            }

            const course =
                getCourseById(courseId);

            if (!course) {
                throw new Error(
                    "The selected training course could not be found."
                );
            }

            const sessionId =
                $("trainingId")?.value;

            const sessionDate =
                $("trainingDate")?.value;

            if (!sessionDate) {
                throw new Error(
                    "Please select the training date."
                );
            }

            const title =
                $("trainingTitle")?.value.trim() ||
                course.course_name;

            const service =
                course.service ||
                $("trainingService")?.value ||
                "";

            const payload = {
                course_id: Number(courseId),

                service: service,

                session_title: title,

                session_date:
                    sessionDate,

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
                        $("trainingCapacity")?.value || 25
                    ),

                registration_deadline:
                    $("trainingDeadline")?.value ||
                    null,

                price:
                    Number(
                        $("trainingPrice")?.value || 0
                    ),

                currency: "KES",

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

            if (button) {
                button.disabled = true;
                button.textContent =
                    sessionId
                        ? "Updating..."
                        : "Saving...";
            }

            let result;

            if (sessionId) {

                result = await supabase
                    .from("training_sessions")
                    .update(payload)
                    .eq("id", sessionId)
                    .select()
                    .single();

            } else {

                payload.created_by =
                    authSession.user.id;

                result = await supabase
                    .from("training_sessions")
                    .insert(payload)
                    .select()
                    .single();
            }

            if (result.error) {
                throw result.error;
            }

            showMessage(
                sessionId
                    ? "Training session updated successfully."
                    : "Training session created successfully.",
                "success"
            );

            window.closeTrainingModal();

            await loadAdminTrainingSessions();

        } catch (error) {

            console.error(
                "SAVE TRAINING SESSION ERROR:",
                error
            );

            showMessage(
                error.message ||
                "Unable to save training session.",
                "error"
            );

        } finally {

            if (button) {
                button.disabled = false;

                button.textContent =
                    $("trainingId")?.value
                        ? "Update Training Session"
                        : "Save Training Session";
            }
        }
    }

    /* =========================================================
       DELETE TRAINING SESSION
       ========================================================= */

    window.deleteTrainingSession = async function (id) {

        const session =
            getSessionById(id);

        if (!session) {
            showMessage(
                "Training session not found.",
                "error"
            );
            return;
        }

        const confirmed =
            window.confirm(
                `Delete "${session.session_title}" on ${formatDate(session.session_date)}?\n\nThis action cannot be undone.`
            );

        if (!confirmed) {
            return;
        }

        try {

            const supabase = getSupabase();

            await requireSupabaseAuth();

            const { error } =
                await supabase
                    .from("training_sessions")
                    .delete()
                    .eq("id", id);

            if (error) {
                throw error;
            }

            showMessage(
                "Training session deleted successfully.",
                "success"
            );

            await loadAdminTrainingSessions();

            if (
                typeof window.loadTrainingRegistrations ===
                "function"
            ) {
                await window.loadTrainingRegistrations();
            }

        } catch (error) {

            console.error(
                "DELETE TRAINING SESSION ERROR:",
                error
            );

            showMessage(
                error.message ||
                "Unable to delete training session.",
                "error"
            );
        }
    };

    /* =========================================================
       LOAD REGISTRATIONS
       ========================================================= */

    window.loadTrainingRegistrations =
        async function () {

            try {

                const supabase =
                    getSupabase();

                await requireSupabaseAuth();

                const { data, error } =
                    await supabase
                        .from("training_registrations")
                        .select("*")
                        .order(
                            "created_at",
                            {
                                ascending: false
                            }
                        );

                if (error) {
                    throw error;
                }

                trainingRegistrations =
                    data || [];

                renderTrainingRegistrations();

                return trainingRegistrations;

            } catch (error) {

                console.error(
                    "TRAINING REGISTRATION LOAD ERROR:",
                    error
                );

                const table =
                    $("trainingRegistrationsTable");

                if (table) {
                    table.innerHTML = `
                        <tr>
                            <td colspan="10"
                                style="text-align:center;padding:30px;">
                                <strong>
                                    Unable to load registrations
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

                showMessage(
                    error.message,
                    "error"
                );

                return [];
            }
        };

    /* =========================================================
       RENDER REGISTRATIONS
       ========================================================= */

    function renderTrainingRegistrations() {

        const table =
            $("trainingRegistrationsTable");

        if (!table) return;

        const count =
            $("registrationsCount");

        const badge =
            $("regBadge");

        if (count) {
            count.textContent =
                trainingRegistrations.length;
        }

        if (badge) {
            badge.textContent =
                trainingRegistrations.length;
        }

        if (!trainingRegistrations.length) {

            table.innerHTML = `
                <tr>
                    <td colspan="10"
                        style="text-align:center;padding:35px;">
                        <strong>
                            No training registrations yet.
                        </strong>

                        <div style="
                            margin-top:6px;
                            color:#64748b;
                        ">
                            Registrations submitted from the
                            public training calendar will appear here.
                        </div>
                    </td>
                </tr>
            `;

            return;
        }

        table.innerHTML =
            trainingRegistrations.map(reg => {

                const session =
                    getSessionById(
                        reg.session_id
                    );

                const status =
                    String(
                        reg.registration_status ||
                        "registered"
                    );

                const paymentStatus =
                    String(
                        reg.payment_status ||
                        "unpaid"
                    );

                return `
                    <tr>

                        <td>
                            <strong>
                                ${escapeHTML(
                                    reg.registration_number ||
                                    "—"
                                )}
                            </strong>
                        </td>

                        <td>
                            <strong>
                                ${escapeHTML(
                                    reg.full_name ||
                                    "—"
                                )}
                            </strong>

                            <div style="
                                font-size:12px;
                                color:#64748b;
                                margin-top:3px;
                            ">
                                ${escapeHTML(
                                    reg.email || ""
                                )}
                            </div>
                        </td>

                        <td>
                            ${escapeHTML(
                                reg.phone || "—"
                            )}
                        </td>

                        <td>
                            ${
                                session
                                    ? escapeHTML(
                                        session.session_title
                                    )
                                    : "Training Session"
                            }

                            <div style="
                                font-size:12px;
                                color:#64748b;
                                margin-top:3px;
                            ">
                                ${
                                    session
                                        ? formatDate(
                                            session.session_date
                                        )
                                        : "—"
                                }
                            </div>
                        </td>

                        <td>
                            ${escapeHTML(
                                reg.organization || "—"
                            )}
                        </td>

                        <td>
                            KES ${formatMoney(
                                reg.amount_due
                            )}
                        </td>

                        <td>
                            KES ${formatMoney(
                                reg.amount_paid
                            )}
                        </td>

                        <td>
                            <span class="
                                status-badge
                                ${getPaymentStatusClass(
                                    paymentStatus
                                )}
                            ">
                                ${escapeHTML(
                                    paymentStatus
                                )}
                            </span>
                        </td>

                        <td>
                            <span class="
                                status-badge
                                ${getRegistrationStatusClass(
                                    status
                                )}
                            ">
                                ${escapeHTML(
                                    status
                                )}
                            </span>
                        </td>

                        <td>

                            <div style="
                                display:flex;
                                gap:5px;
                                flex-wrap:wrap;
                            ">

                                ${
                                    status !== "confirmed"
                                        ? `
                                            <button
                                                type="button"
                                                class="btn btn-sm"
                                                onclick="updateTrainingRegistration(${reg.id}, 'confirmed')"
                                            >
                                                Confirm
                                            </button>
                                          `
                                        : ""
                                }

                                ${
                                    status !== "completed"
                                        ? `
                                            <button
                                                type="button"
                                                class="btn btn-sm"
                                                onclick="updateTrainingRegistration(${reg.id}, 'completed')"
                                            >
                                                Complete
                                            </button>
                                          `
                                        : ""
                                }

                                ${
                                    status !== "cancelled"
                                        ? `
                                            <button
                                                type="button"
                                                class="btn btn-sm btn-danger"
                                                onclick="updateTrainingRegistration(${reg.id}, 'cancelled')"
                                            >
                                                Cancel
                                            </button>
                                          `
                                        : ""
                                }

                            </div>

                        </td>

                    </tr>
                `;

            }).join("");
    }

    function getPaymentStatusClass(status) {

        switch (
            String(status).toLowerCase()
        ) {

            case "paid":
                return "status-success";

            case "partial":
                return "status-warning";

            case "refunded":
                return "status-info";

            case "unpaid":
            default:
                return "status-danger";
        }
    }

    function getRegistrationStatusClass(status) {

        switch (
            String(status).toLowerCase()
        ) {

            case "confirmed":
                return "status-success";

            case "completed":
                return "status-success";

            case "registered":
                return "status-info";

            case "waitlisted":
                return "status-warning";

            case "cancelled":
                return "status-danger";

            case "no_show":
                return "status-danger";

            default:
                return "status-neutral";
        }
    }

    /* =========================================================
       UPDATE REGISTRATION
       ========================================================= */

    window.updateTrainingRegistration =
        async function (id, status) {

            const allowed = [
                "registered",
                "confirmed",
                "waitlisted",
                "cancelled",
                "completed",
                "no_show"
            ];

            if (!allowed.includes(status)) {
                showMessage(
                    "Invalid registration status.",
                    "error"
                );
                return;
            }

            try {

                const supabase =
                    getSupabase();

                await requireSupabaseAuth();

                const { error } =
                    await supabase
                        .from("training_registrations")
                        .update({
                            registration_status:
                                status
                        })
                        .eq("id", id);

                if (error) {
                    throw error;
                }

                showMessage(
                    `Registration marked as ${status}.`,
                    "success"
                );

                await window.loadTrainingRegistrations();

            } catch (error) {

                console.error(
                    "UPDATE REGISTRATION ERROR:",
                    error
                );

                showMessage(
                    error.message ||
                    "Unable to update registration.",
                    "error"
                );
            }
        };

    /* =========================================================
       FILTER EVENTS
       ========================================================= */

    function setupFilters() {

        const serviceFilter =
            $("trainingServiceFilter");

        const statusFilter =
            $("trainingStatusFilter");

        if (serviceFilter) {
            serviceFilter.addEventListener(
                "change",
                renderTrainingSessions
            );
        }

        if (statusFilter) {
            statusFilter.addEventListener(
                "change",
                renderTrainingSessions
            );
        }
    }

    /* =========================================================
       MODAL EVENTS
       ========================================================= */

    function setupModal() {

        const form =
            $("trainingForm");

        if (form) {
            form.addEventListener(
                "submit",
                saveTrainingSession
            );
        }

        const course =
            $("trainingCourse");

        if (course) {
            course.addEventListener(
                "change",
                syncCourseFields
            );
        }

        const modal =
            $("trainingModal");

        if (modal) {

            modal.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target === modal
                    ) {
                        window.closeTrainingModal();
                    }
                }
            );
        }
    }

    /* =========================================================
       REFRESH TRAINING DATA
       ========================================================= */

    window.refreshTrainingData =
        async function () {

            await loadAdminTrainingSessions();

            await window.loadTrainingRegistrations();

            showMessage(
                "Training data refreshed.",
                "success"
            );
        };

    /* =========================================================
       PUBLIC ACCESS
       ========================================================= */

    window.loadAdminTrainingSessions =
        loadAdminTrainingSessions;

    /* =========================================================
       INITIALIZE
       ========================================================= */

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            setupFilters();
            setupModal();

            /*
             * We intentionally do not force-load the dashboard here.
             * The existing admin.html switchTab() controls when the
             * Training Sessions and Registrations sections are loaded.
             */

            console.log(
                "MEI Training Admin module initialized."
            );
        }
    );

})();
