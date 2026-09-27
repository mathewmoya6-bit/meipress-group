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

    // FIX: the CSS defines badge colors as ".status-badge.open",
    // ".status-badge.paid" etc — two separate classes, plus a ".dot"
    // child. The old version emitted class="status-badge status-open",
    // which the CSS never matches, so badges rendered unstyled.
    function statusBadge(status) {
        const safe = escapeHTML((status || "scheduled").toLowerCase());
        const label = (status || "scheduled").replace(/_/g, " ");

        return `
            <span class="status-badge ${safe}">
                <span class="dot"></span> ${escapeHTML(label)}
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

    // FIX: table has 10 columns now (see thead patch below), so
    // the loading/error rows use colspan="10" to match.
    const SESSIONS_COLSPAN = 10;
    const REGISTRATIONS_COLSPAN = 9;

    // Shows a persistent on-page diagnostic banner above the training
    // table, so auth/RLS problems are visible without opening dev tools.
    function showDiagnostic(html) {
        let box = document.getElementById("trainingDiagnostic");
        if (!box) {
            box = document.createElement("div");
            box.id = "trainingDiagnostic";
            box.style.cssText =
                "margin-bottom:16px;padding:14px 18px;border-radius:10px;" +
                "background:#fff7ed;border:1px solid #fdba74;color:#7c2d12;" +
                "font-size:13px;line-height:1.6;white-space:pre-wrap;";
            const table = document.getElementById("trainingSessionsTable");
            const container = table?.closest(".table-container");
            if (container) container.parentNode.insertBefore(box, container);
        }
        box.innerHTML = html;
        box.style.display = html ? "block" : "none";
    }

    function clearDiagnostic() {
        const box = document.getElementById("trainingDiagnostic");
        if (box) box.style.display = "none";
    }

    async function loadAdminTrainingSessions() {

        console.log("📅 Loading training sessions...");

        const table = document.getElementById("trainingSessionsTable");

        if (!table) {
            console.error("❌ trainingSessionsTable not found.");
            return;
        }

        table.innerHTML = `
            <tr>
                <td colspan="${SESSIONS_COLSPAN}" style="text-align:center;padding:30px;">
                    Loading training sessions...
                </td>
            </tr>
        `;

        // Check the actual auth state this client is running as, since
        // "logged in" in the UI and "authenticated" to Supabase/RLS are
        // two different things. This is the #1 diagnostic to see.
        let authLine = "Auth check failed.";
        try {
            const { data: userData, error: userError } = await sb.auth.getUser();
            if (userError) {
                authLine = `Auth error: ${userError.message}`;
            } else if (userData?.user) {
                authLine = `Authenticated as: ${userData.user.email} (id: ${userData.user.id})`;
            } else {
                authLine = "NOT authenticated — Supabase sees this session as anonymous (anon role). " +
                    "This is almost always why admin-only data doesn't show, even while you appear " +
                    "'logged in' in the dashboard UI.";
            }
        } catch (e) {
            authLine = `Auth check exception: ${e.message}`;
        }

        try {

            const { data, error, status, statusText } = await sb
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

                showDiagnostic(
                    `<strong>Could not load training sessions.</strong>\n${authLine}\n` +
                    `Supabase error: ${escapeHTML(error.message)}` +
                    (error.hint ? `\nHint: ${escapeHTML(error.hint)}` : "") +
                    (error.code ? `\nCode: ${escapeHTML(error.code)}` : "")
                );

                table.innerHTML = `
                    <tr>
                        <td colspan="${SESSIONS_COLSPAN}" style="text-align:center;padding:30px;color:#b91c1c;">
                            ${escapeHTML(error.message)}
                        </td>
                    </tr>
                `;

                return;
            }

            trainingSessions = data || [];

            console.log(
                `✅ Query succeeded (HTTP ${status} ${statusText}). ` +
                `${trainingSessions.length} training sessions returned.`
            );

            if (trainingSessions.length === 0) {
                // No error, but nothing came back either. This is the
                // classic signature of an RLS policy silently filtering
                // out rows — the request succeeds, it just returns 0
                // rows because the current role/identity doesn't match
                // any SELECT policy's condition.
                showDiagnostic(
                    `<strong>Query succeeded but returned 0 sessions.</strong>\n${authLine}\n` +
                    `If sessions exist in the database and appear on the public training calendar, ` +
                    `this means Row Level Security is filtering them out for this session — ` +
                    `most likely because this browser session isn't recognized as an admin ` +
                    `(is_mei_admin() returning false), or the login session expired/never carried ` +
                    `a valid Supabase auth token.`
                );
            } else {
                clearDiagnostic();
            }

            updateTrainingStats();
            renderTrainingSessions();

        } catch (error) {

            console.error("❌ TRAINING LOAD EXCEPTION:", error);

            showDiagnostic(
                `<strong>Unexpected error loading training sessions.</strong>\n${authLine}\n` +
                `${escapeHTML(error.message || "Unknown error")}`
            );

            table.innerHTML = `
                <tr>
                    <td colspan="${SESSIONS_COLSPAN}" style="text-align:center;padding:30px;color:#b91c1c;">
                        ${escapeHTML(error.message || "Unable to load training sessions.")}
                    </td>
                </tr>
            `;
        }
    }

    // --------------------------------------------------
    // RENDER TABLE
    // --------------------------------------------------

    // FIX: row cell order now matches the new 10-column thead exactly:
    // Course | Program | Date | Time | Venue | Trainer | Capacity | Price | Status | Actions
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
                    <td colspan="${SESSIONS_COLSPAN}" style="text-align:center;padding:30px;">
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
                        <strong>${escapeHTML(courseName)}</strong>
                        ${
                            session.session_title &&
                            session.session_title !== courseName
                                ? `<br><small>${escapeHTML(session.session_title)}</small>`
                                : ""
                        }
                    </td>

                    <td>${escapeHTML(session.service || "-")}</td>

                    <td>${formatDate(session.session_date)}</td>

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

                    <td>${escapeHTML(session.trainer_name || "-")}</td>

                    <td>${session.capacity ?? "-"}</td>

                    <td>${formatMoney(session.price, session.currency || "KES")}</td>

                    <td>
                        ${statusBadge(session.status)}
                        ${
                            session.published
                                ? `<br><small style="color:#15803d;">Published</small>`
                                : `<br><small style="color:#64748b;">Draft</small>`
                        }
                    </td>

                    <td>
                        <div class="action-btns">
                            <button type="button" class="edit-btn" onclick="editTrainingSession(${session.id})">
                                Edit
                            </button>
                            <button type="button" class="delete-btn" onclick="deleteTrainingSession(${session.id})">
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
    // MODAL (open/close) — FIX: use the same classList('active')
    // pattern the CSS animation/backdrop expects (was style.display
    // directly before, which skipped the fade-in and had no
    // click-outside / Escape handling).
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

            document.getElementById("trainingId").value = session.id;
            document.getElementById("trainingCourse").value = session.course_id || "";
            document.getElementById("trainingService").value = session.service || "";
            document.getElementById("trainingTitle").value = session.session_title || "";
            document.getElementById("trainingDate").value = session.session_date || "";
            document.getElementById("trainingDeadline").value = session.registration_deadline || "";
            document.getElementById("trainingStartTime").value = session.start_time || "";
            document.getElementById("trainingEndTime").value = session.end_time || "";
            document.getElementById("trainingVenue").value = session.venue || "";
            document.getElementById("trainingLocation").value = session.location || "";
            document.getElementById("trainingTrainer").value = session.trainer_name || "";
            document.getElementById("trainingCapacity").value = session.capacity ?? "";
            document.getElementById("trainingPrice").value = session.price ?? "";
            document.getElementById("trainingStatus").value = session.status || "scheduled";
            document.getElementById("trainingDescription").value = session.description || "";
            document.getElementById("trainingNotes").value = session.notes || "";
            document.getElementById("trainingPublished").checked = session.published === true;
        }

        const message = document.getElementById("trainingFormMessage");
        if (message) message.textContent = "";

        modal.classList.add("active");
    }

    function closeTrainingModal() {
        const modal = document.getElementById("trainingModal");
        if (modal) modal.classList.remove("active");
    }

    // --------------------------------------------------
    // SAVE
    // --------------------------------------------------

    async function saveTrainingSession(event) {

        event.preventDefault();

        const button = document.getElementById("saveTrainingButton");
        const message = document.getElementById("trainingFormMessage");

        if (message) message.textContent = "Saving...";
        if (button) button.disabled = true;

        try {

            const id = document.getElementById("trainingId").value;
            const courseId = document.getElementById("trainingCourse").value;

            const course =
                trainingCourses.find(
                    c => String(c.id) === String(courseId)
                );

            const payload = {
                course_id: courseId ? Number(courseId) : null,
                service: document.getElementById("trainingService").value,
                session_title: document.getElementById("trainingTitle").value.trim(),
                session_date: document.getElementById("trainingDate").value,
                registration_deadline: document.getElementById("trainingDeadline").value || null,
                start_time: document.getElementById("trainingStartTime").value || null,
                end_time: document.getElementById("trainingEndTime").value || null,
                venue: document.getElementById("trainingVenue").value.trim(),
                location: document.getElementById("trainingLocation").value.trim(),
                trainer_name: document.getElementById("trainingTrainer").value.trim(),
                capacity: Number(document.getElementById("trainingCapacity").value) || null,
                price: Number(document.getElementById("trainingPrice").value) || 0,
                currency: "KES",
                status: document.getElementById("trainingStatus").value,
                description: document.getElementById("trainingDescription").value.trim(),
                notes: document.getElementById("trainingNotes").value.trim(),
                published: document.getElementById("trainingPublished").checked
            };

            if (course) {
                if (!payload.service) payload.service = course.service;
                if (!payload.price) payload.price = Number(course.default_price || 0);
            }

            let result;

            if (id) {
                result = await sb.from("training_sessions").update(payload).eq("id", id);
            } else {
                result = await sb.from("training_sessions").insert(payload);
            }

            if (result.error) throw result.error;

            if (message) message.textContent = "Training session saved successfully.";

            closeTrainingModal();

            await loadAdminTrainingSessions();

        } catch (error) {

            console.error("❌ SAVE TRAINING ERROR:", error);

            if (message) {
                message.textContent = error.message || "Unable to save training session.";
            }

        } finally {
            if (button) button.disabled = false;
        }
    }

    // --------------------------------------------------
    // DELETE
    // --------------------------------------------------

    async function deleteTrainingSession(id) {

        if (!confirm("Delete this training session?")) return;

        try {

            const { error } = await sb
                .from("training_sessions")
                .delete()
                .eq("id", id);

            if (error) throw error;

            await loadAdminTrainingSessions();

        } catch (error) {
            console.error("❌ DELETE TRAINING ERROR:", error);
            alert(error.message || "Unable to delete training session.");
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

    // FIX: header has 9 columns (Reg. No, Participant, Email, Phone,
    // Course, Date, Payment, Status, Actions). The old version only
    // rendered 8 <td>s and dropped Payment/Status badges + Actions
    // entirely. Now emits all 9, with badges + a View action.
    async function loadTrainingRegistrations() {

        const table = document.getElementById("trainingRegistrationsTable");

        if (!table) return;

        table.innerHTML = `
            <tr>
                <td colspan="${REGISTRATIONS_COLSPAN}" style="text-align:center;padding:30px;">
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

            console.error("❌ TRAINING REGISTRATIONS ERROR:", error);

            table.innerHTML = `
                <tr>
                    <td colspan="${REGISTRATIONS_COLSPAN}" style="text-align:center;padding:30px;">
                        ${escapeHTML(error.message)}
                    </td>
                </tr>
            `;

            return;
        }

        const registrations = data || [];

        const count = document.getElementById("registrationsCount");
        if (count) count.textContent = registrations.length;

        const badge = document.getElementById("regBadge");
        if (badge) badge.textContent = registrations.length;

        if (!registrations.length) {

            table.innerHTML = `
                <tr>
                    <td colspan="${REGISTRATIONS_COLSPAN}" style="text-align:center;padding:30px;">
                        No registrations found.
                    </td>
                </tr>
            `;

            return;
        }

        window.__meiRegistrations = registrations;

        table.innerHTML = registrations.map((reg, idx) => `
            <tr>
                <td>${escapeHTML(reg.registration_number || "-")}</td>
                <td>${escapeHTML(reg.full_name || "-")}</td>
                <td>${escapeHTML(reg.email || "-")}</td>
                <td>${escapeHTML(reg.phone || "-")}</td>
                <td>${escapeHTML(reg.training_sessions?.session_title || "-")}</td>
                <td>${formatDate(reg.training_sessions?.session_date)}</td>
                <td>${statusBadge(reg.payment_status || "unpaid")}</td>
                <td>${statusBadge(reg.registration_status || "pending")}</td>
                <td>
                    <div class="action-btns">
                        <button type="button" class="view" onclick="viewTrainingRegistration(${idx})">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join("");
    }

    function viewTrainingRegistration(idx) {
        const reg = (window.__meiRegistrations || [])[idx];
        if (!reg) return;

        alert(
            `Registration ${reg.registration_number || ""}\n\n` +
            `Name: ${reg.full_name || "-"}\n` +
            `Email: ${reg.email || "-"}\n` +
            `Phone: ${reg.phone || "-"}\n` +
            `Course: ${reg.training_sessions?.session_title || "-"}\n` +
            `Payment: ${reg.payment_status || "-"}\n` +
            `Status: ${reg.registration_status || "-"}`
        );
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
    // FORM / MODAL EVENTS
    // --------------------------------------------------

    document.addEventListener("DOMContentLoaded", function () {

        console.log("📋 admin-training DOM ready.");

        const form = document.getElementById("trainingForm");
        if (form) form.addEventListener("submit", saveTrainingSession);

        const serviceFilter = document.getElementById("trainingServiceFilter");
        if (serviceFilter) serviceFilter.addEventListener("change", applyTrainingFilters);

        const statusFilter = document.getElementById("trainingStatusFilter");
        if (statusFilter) statusFilter.addEventListener("change", applyTrainingFilters);

        // FIX: give trainingModal the same click-outside-to-close and
        // Escape-to-close behavior the generic #modalOverlay already has.
        const trainingModal = document.getElementById("trainingModal");
        if (trainingModal) {
            trainingModal.addEventListener("click", function (e) {
                if (e.target === trainingModal) closeTrainingModal();
            });
        }
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && trainingModal?.classList.contains("active")) {
                closeTrainingModal();
            }
        });

        loadTrainingCourses();

        if (document.getElementById("trainingSessionsTable")) {
            loadAdminTrainingSessions();
        }

    });

    // --------------------------------------------------
    // EXPOSE GLOBAL FUNCTIONS
    // --------------------------------------------------

    window.loadAdminTrainingSessions = loadAdminTrainingSessions;
    window.loadTrainingRegistrations = loadTrainingRegistrations;
    window.openTrainingModal = openTrainingModal;
    window.closeTrainingModal = closeTrainingModal;
    window.editTrainingSession = editTrainingSession;
    window.deleteTrainingSession = deleteTrainingSession;
    window.viewTrainingRegistration = viewTrainingRegistration;
    window.refreshTrainingData = refreshTrainingData;
    window.applyTrainingFilters = applyTrainingFilters;

    console.log(
        "✅ admin-training.js loaded. Functions exposed:",
        typeof window.loadAdminTrainingSessions,
        typeof window.openTrainingModal
    );

})();
