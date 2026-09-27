// js/admin-training.js
(function () {
    "use strict";

    console.log("🚀 admin-training.js loading...");

    const sb = window.supabaseClient;

    if (!sb) {
        console.error("❌ Supabase client not found.");
        return;
    }

    console.log("✅ Supabase client found.");

    let trainingSessions = [];
    let trainingCourses = [];

    // --------------------------------------------------
    // HELPERS
    // --------------------------------------------------

    function escapeHTML(value) {
        if (value === null || value === undefined) return "";

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatDate(date) {
        if (!date) return "-";

        return new Date(date + "T00:00:00").toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "short",
                day: "numeric"
            }
        );
    }

    function formatMoney(value, currency = "KES") {
        const amount = Number(value || 0);

        return `${currency} ${amount.toLocaleString("en-KE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    }

    function statusBadge(status) {
        const safe = escapeHTML(status || "scheduled");

        return `
            <span class="status-badge status-${safe}">
                ${safe.replace(/_/g, " ")}
            </span>
        `;
    }

    // --------------------------------------------------
    // LOAD TRAINING COURSES
    // --------------------------------------------------

    async function loadTrainingCourses() {
        const { data, error } = await sb
            .from("training_courses")
            .select("*")
            .eq("active", true)
            .order("display_order", { ascending: true })
            .order("course_name", { ascending: true });

        if (error) {
            console.error("❌ TRAINING COURSES ERROR:", error);
            trainingCourses = [];
            return;
        }

        trainingCourses = data || [];

        populateCourseDropdown();
    }

    // --------------------------------------------------
    // COURSE DROPDOWN
    // --------------------------------------------------

    function populateCourseDropdown() {
        const select = document.getElementById("trainingCourse");

        if (!select) {
            console.warn("⚠️ trainingCourse element not found.");
            return;
        }

        const currentValue = select.value;

        select.innerHTML = `
            <option value="">Select course</option>
            ${trainingCourses.map(course => `
                <option
                    value="${course.id}"
                    data-service="${escapeHTML(course.service || "")}"
                    data-price="${course.default_price || 0}"
                >
                    ${escapeHTML(course.course_name)}
                </option>
            `).join("")}
        `;

        if (currentValue) {
            select.value = currentValue;
        }
    }

    // --------------------------------------------------
    // LOAD SESSIONS
    // --------------------------------------------------

    async function loadAdminTrainingSessions() {

        console.log("📅 Loading training sessions...");

        const table = document.getElementById("trainingSessionsTable");

        if (!table) {
            console.error("❌ trainingSessionsTable not found.");
            return;
        }

        table.innerHTML = `
            <tr>
                <td colspan="10" style="text-align:center;padding:30px;">
                    Loading training sessions...
                </td>
            </tr>
        `;

        try {

            const { data, error } = await sb
                .from("training_sessions")
                .select(`
                    *,
                    training_courses (
                        id,
                        course_name,
                        course_code
                    )
                `)
                .order("session_date", { ascending: true })
                .order("start_time", { ascending: true });

            if (error) {
                console.error("❌ TRAINING SESSION ERROR:", error);

                table.innerHTML = `
                    <tr>
                        <td colspan="10" style="text-align:center;padding:30px;color:#b91c1c;">
                            ${escapeHTML(error.message)}
                        </td>
                    </tr>
                `;

                return;
            }

            trainingSessions = data || [];

            console.log(
                `✅ ${trainingSessions.length} training sessions loaded.`
            );

            updateTrainingStats();
            renderTrainingSessions();

        } catch (error) {

            console.error("❌ TRAINING LOAD EXCEPTION:", error);

            table.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align:center;padding:30px;color:#b91c1c;">
                        ${escapeHTML(error.message || "Unable to load training sessions.")}
                    </td>
                </tr>
            `;
        }
    }

    // --------------------------------------------------
    // RENDER TABLE
    // --------------------------------------------------

    function renderTrainingSessions() {

        const table = document.getElementById("trainingSessionsTable");

        if (!table) {
            console.error("❌ trainingSessionsTable not found.");
            return;
        }

        const serviceFilter =
            document.getElementById("trainingServiceFilter")?.value || "";

        const statusFilter =
            document.getElementById("trainingStatusFilter")?.value || "";

        let rows = [...trainingSessions];

        if (serviceFilter) {
            rows = rows.filter(
                session => session.service === serviceFilter
            );
        }

        if (statusFilter) {
            rows = rows.filter(
                session => session.status === statusFilter
            );
        }

        const count = document.getElementById("trainingCount");

        if (count) {
            count.textContent = rows.length;
        }

        if (!rows.length) {

            table.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align:center;padding:30px;">
                        No training sessions found.
                    </td>
                </tr>
            `;

            return;
        }

        table.innerHTML = rows.map(session => {

            const courseName =
                session.training_courses?.course_name ||
                session.session_title ||
                "Training Session";

            return `
                <tr>

                    <td>
                        <strong>
                            ${escapeHTML(courseName)}
                        </strong>
                        ${
                            session.session_title &&
                            session.session_title !== courseName
                                ? `<br><small>${escapeHTML(session.session_title)}</small>`
                                : ""
                        }
                    </td>

                    <td>
                        ${escapeHTML(session.service || "-")}
                    </td>

                    <td>
                        ${formatDate(session.session_date)}
                    </td>

                    <td>
                        ${escapeHTML(session.start_time || "-")}
                        -
                        ${escapeHTML(session.end_time || "-")}
                    </td>

                    <td>
                        ${escapeHTML(session.venue || "-")}
                        ${
                            session.location
                                ? `<br><small>${escapeHTML(session.location)}</small>`
                                : ""
                        }
                    </td>

                    <td>
                        ${escapeHTML(session.trainer_name || "-")}
                    </td>

                    <td>
                        ${session.capacity ?? "-"}
                    </td>

                    <td>
                        ${formatMoney(
                            session.price,
                            session.currency || "KES"
                        )}
                    </td>

                    <td>
                        ${statusBadge(session.status)}
                        ${
                            session.published
                                ? `<br><small style="color:#15803d;">Published</small>`
                                : `<br><small style="color:#64748b;">Draft</small>`
                        }
                    </td>

                    <td>
                        <div style="display:flex;gap:6px;flex-wrap:wrap;">

                            <button
                                type="button"
                                class="btn btn-sm"
                                onclick="editTrainingSession(${session.id})"
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                class="btn btn-sm"
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

    // --------------------------------------------------
    // STATS
    // --------------------------------------------------

    function updateTrainingStats() {

        const total = trainingSessions.length;

        const published =
            trainingSessions.filter(s => s.published === true).length;

        const open =
            trainingSessions.filter(s => s.status === "open").length;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming =
            trainingSessions.filter(s => {
                if (!s.session_date) return false;

                const date =
                    new Date(s.session_date + "T00:00:00");

                return (
                    date >= today &&
                    !["cancelled", "completed", "postponed"].includes(
                        s.status
                    )
                );
            }).length;

        const totalEl = document.getElementById("trainingTotal");
        const publishedEl = document.getElementById("trainingPublished");
        const openEl = document.getElementById("trainingOpen");
        const upcomingEl = document.getElementById("trainingUpcoming");

        if (totalEl) totalEl.textContent = total;
        if (publishedEl) publishedEl.textContent = published;
        if (openEl) openEl.textContent = open;
        if (upcomingEl) upcomingEl.textContent = upcoming;
    }

    // --------------------------------------------------
    // OPEN MODAL
    // --------------------------------------------------

    function openTrainingModal(id = null) {

        const modal = document.getElementById("trainingModal");
        const form = document.getElementById("trainingForm");

        if (!modal || !form) {
            console.error("❌ Training modal/form not found.");
            return;
        }

        form.reset();

        document.getElementById("trainingId").value = "";

        if (id) {

            const session =
                trainingSessions.find(
                    s => Number(s.id) === Number(id)
                );

            if (!session) {
                console.error("Training session not found:", id);
                return;
            }

            document.getElementById("trainingId").value =
                session.id;

            document.getElementById("trainingCourse").value =
                session.course_id || "";

            document.getElementById("trainingService").value =
                session.service || "";

            document.getElementById("trainingTitle").value =
                session.session_title || "";

            document.getElementById("trainingDate").value =
                session.session_date || "";

            document.getElementById("trainingDeadline").value =
                session.registration_deadline || "";

            document.getElementById("trainingStartTime").value =
                session.start_time || "";

            document.getElementById("trainingEndTime").value =
                session.end_time || "";

            document.getElementById("trainingVenue").value =
                session.venue || "";

            document.getElementById("trainingLocation").value =
                session.location || "";

            document.getElementById("trainingTrainer").value =
                session.trainer_name || "";

            document.getElementById("trainingCapacity").value =
                session.capacity ?? "";

            document.getElementById("trainingPrice").value =
                session.price ?? "";

            document.getElementById("trainingStatus").value =
                session.status || "scheduled";

            document.getElementById("trainingDescription").value =
                session.description || "";

            document.getElementById("trainingNotes").value =
                session.notes || "";

            document.getElementById("trainingPublished").checked =
                session.published === true;
        }

        modal.style.display = "flex";
    }

    // --------------------------------------------------
    // CLOSE MODAL
    // --------------------------------------------------

    function closeTrainingModal() {

        const modal =
            document.getElementById("trainingModal");

        if (modal) {
            modal.style.display = "none";
        }
    }

    // --------------------------------------------------
    // SAVE
    // --------------------------------------------------

    async function saveTrainingSession(event) {

        event.preventDefault();

        const button =
            document.getElementById("saveTrainingButton");

        const message =
            document.getElementById("trainingFormMessage");

        if (message) {
            message.textContent = "Saving...";
        }

        if (button) {
            button.disabled = true;
        }

        try {

            const id =
                document.getElementById("trainingId").value;

            const courseId =
                document.getElementById("trainingCourse").value;

            const course =
                trainingCourses.find(
                    c => String(c.id) === String(courseId)
                );

            const payload = {

                course_id:
                    courseId ? Number(courseId) : null,

                service:
                    document.getElementById("trainingService").value,

                session_title:
                    document.getElementById("trainingTitle").value.trim(),

                session_date:
                    document.getElementById("trainingDate").value,

                registration_deadline:
                    document.getElementById("trainingDeadline").value ||
                    null,

                start_time:
                    document.getElementById("trainingStartTime").value ||
                    null,

                end_time:
                    document.getElementById("trainingEndTime").value ||
                    null,

                venue:
                    document.getElementById("trainingVenue").value.trim(),

                location:
                    document.getElementById("trainingLocation").value.trim(),

                trainer_name:
                    document.getElementById("trainingTrainer").value.trim(),

                capacity:
                    Number(
                        document.getElementById("trainingCapacity").value
                    ) || null,

                price:
                    Number(
                        document.getElementById("trainingPrice").value
                    ) || 0,

                currency: "KES",

                status:
                    document.getElementById("trainingStatus").value,

                description:
                    document.getElementById("trainingDescription").value.trim(),

                notes:
                    document.getElementById("trainingNotes").value.trim(),

                published:
                    document.getElementById("trainingPublished").checked
            };

            if (course) {

                if (!payload.service) {
                    payload.service = course.service;
                }

                if (!payload.price) {
                    payload.price =
                        Number(course.default_price || 0);
                }
            }

            let result;

            if (id) {

                result = await sb
                    .from("training_sessions")
                    .update(payload)
                    .eq("id", id);

            } else {

                result = await sb
                    .from("training_sessions")
                    .insert(payload);

            }

            if (result.error) {
                throw result.error;
            }

            if (message) {
                message.textContent =
                    "Training session saved successfully.";
            }

            closeTrainingModal();

            await loadAdminTrainingSessions();

        } catch (error) {

            console.error("❌ SAVE TRAINING ERROR:", error);

            if (message) {
                message.textContent =
                    error.message || "Unable to save training session.";
            }

        } finally {

            if (button) {
                button.disabled = false;
            }
        }
    }

    // --------------------------------------------------
    // DELETE
    // --------------------------------------------------

    async function deleteTrainingSession(id) {

        if (!confirm("Delete this training session?")) {
            return;
        }

        try {

            const { error } = await sb
                .from("training_sessions")
                .delete()
                .eq("id", id);

            if (error) {
                throw error;
            }

            await loadAdminTrainingSessions();

        } catch (error) {

            console.error("❌ DELETE TRAINING ERROR:", error);

            alert(
                error.message ||
                "Unable to delete training session."
            );
        }
    }

    // --------------------------------------------------
    // EDIT
    // --------------------------------------------------

    function editTrainingSession(id) {
        openTrainingModal(id);
    }

    // --------------------------------------------------
    // REGISTRATIONS
    // --------------------------------------------------

    async function loadTrainingRegistrations() {

        const table =
            document.getElementById("trainingRegistrationsTable");

        if (!table) return;

        table.innerHTML = `
            <tr>
                <td colspan="10" style="text-align:center;padding:30px;">
                    Loading registrations...
                </td>
            </tr>
        `;

        const { data, error } = await sb
            .from("training_registrations")
            .select(`
                *,
                training_sessions (
                    session_title,
                    session_date
                )
            `)
            .order("created_at", { ascending: false });

        if (error) {

            console.error(
                "❌ TRAINING REGISTRATIONS ERROR:",
                error
            );

            table.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align:center;padding:30px;">
                        ${escapeHTML(error.message)}
                    </td>
                </tr>
            `;

            return;
        }

        const registrations = data || [];

        const count =
            document.getElementById("registrationsCount");

        if (count) {
            count.textContent = registrations.length;
        }

        const badge =
            document.getElementById("regBadge");

        if (badge) {
            badge.textContent = registrations.length;
        }

        if (!registrations.length) {

            table.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align:center;padding:30px;">
                        No registrations found.
                    </td>
                </tr>
            `;

            return;
        }

        table.innerHTML = registrations.map(reg => `

            <tr>

                <td>
                    ${escapeHTML(reg.registration_number || "-")}
                </td>

                <td>
                    ${escapeHTML(reg.full_name || "-")}
                </td>

                <td>
                    ${escapeHTML(reg.email || "-")}
                </td>

                <td>
                    ${escapeHTML(reg.phone || "-")}
                </td>

                <td>
                    ${escapeHTML(
                        reg.training_sessions?.session_title || "-"
                    )}
                </td>

                <td>
                    ${formatDate(
                        reg.training_sessions?.session_date
                    )}
                </td>

                <td>
                    ${escapeHTML(reg.payment_status || "-")}
                </td>

                <td>
                    ${escapeHTML(reg.registration_status || "-")}
                </td>

            </tr>

        `).join("");
    }

    // --------------------------------------------------
    // FILTERS
    // --------------------------------------------------

    function applyTrainingFilters() {
        renderTrainingSessions();
    }

    // --------------------------------------------------
    // REFRESH
    // --------------------------------------------------

    async function refreshTrainingData() {
        await loadTrainingCourses();
        await loadAdminTrainingSessions();
        await loadTrainingRegistrations();
    }

    // --------------------------------------------------
    // FORM EVENT
    // --------------------------------------------------

    document.addEventListener("DOMContentLoaded", function () {

        console.log("📋 admin-training DOM ready.");

        const form =
            document.getElementById("trainingForm");

        if (form) {
            form.addEventListener(
                "submit",
                saveTrainingSession
            );
        }

        const serviceFilter =
            document.getElementById("trainingServiceFilter");

        if (serviceFilter) {
            serviceFilter.addEventListener(
                "change",
                applyTrainingFilters
            );
        }

        const statusFilter =
            document.getElementById("trainingStatusFilter");

        if (statusFilter) {
            statusFilter.addEventListener(
                "change",
                applyTrainingFilters
            );
        }

        loadTrainingCourses();

        // Load immediately if the training section exists.
        if (document.getElementById("trainingSessionsTable")) {
            loadAdminTrainingSessions();
        }

    });

    // --------------------------------------------------
    // EXPOSE GLOBAL FUNCTIONS
    // --------------------------------------------------

    window.loadAdminTrainingSessions =
        loadAdminTrainingSessions;

    window.loadTrainingRegistrations =
        loadTrainingRegistrations;

    window.openTrainingModal =
        openTrainingModal;

    window.closeTrainingModal =
        closeTrainingModal;

    window.editTrainingSession =
        editTrainingSession;

    window.deleteTrainingSession =
        deleteTrainingSession;

    window.refreshTrainingData =
        refreshTrainingData;

    window.applyTrainingFilters =
        applyTrainingFilters;

    console.log(
        "✅ admin-training.js loaded. Functions exposed:",
        typeof window.loadAdminTrainingSessions,
        typeof window.openTrainingModal
    );

})();
