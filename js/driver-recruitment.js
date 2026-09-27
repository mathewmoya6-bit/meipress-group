(function () {
    "use strict";

    /*
     * ============================================================
     * MEI GROUP - DRIVER RECRUITMENT & PLACEMENT
     * Supabase Application Handler
     * ============================================================
     */

    const SUPABASE_URL =
        "https://qkchnrrxrewmlvvxuuqe.supabase.co";

    const SUPABASE_ANON_KEY =
        "sb_publishable_-ki98JwzbWWiVXm7nzAAgQ_5H2qjXz7";


    let supabaseClient = null;


    /*
     * ============================================================
     * INITIALIZE SUPABASE
     * ============================================================
     */

    function initializeSupabase() {

        try {

            if (
                !window.supabase ||
                typeof window.supabase.createClient !== "function"
            ) {
                throw new Error(
                    "Supabase library was not loaded."
                );
            }

            supabaseClient =
                window.supabase.createClient(
                    SUPABASE_URL,
                    SUPABASE_ANON_KEY
                );

            /*
             * Make available globally for compatibility
             * with other MEI Group pages.
             */
            window.supabaseClient =
                supabaseClient;

            console.log(
                "MEI Group Supabase initialized."
            );

            return true;

        } catch (error) {

            console.error(
                "Supabase initialization failed:",
                error
            );

            return false;
        }
    }


    /*
     * ============================================================
     * ELEMENTS
     * ============================================================
     */

    const form =
        document.getElementById(
            "driverApplyForm"
        );

    const submitButton =
        document.getElementById(
            "driverSubmitBtn"
        );

    const successAlert =
        document.getElementById(
            "driverFormSuccess"
        );

    const errorAlert =
        document.getElementById(
            "driverFormError"
        );


    /*
     * ============================================================
     * ALERT HELPERS
     * ============================================================
     */

    function showSuccess(message) {

        if (!successAlert) return;

        successAlert.textContent =
            "✅ " + message;

        successAlert.classList.add(
            "show"
        );

        if (errorAlert) {
            errorAlert.classList.remove(
                "show"
            );
        }
    }


    function showError(message) {

        if (!errorAlert) return;

        errorAlert.textContent =
            "❌ " + message;

        errorAlert.classList.add(
            "show"
        );

        if (successAlert) {
            successAlert.classList.remove(
                "show"
            );
        }
    }


    function clearAlerts() {

        if (successAlert) {
            successAlert.classList.remove(
                "show"
            );
        }

        if (errorAlert) {
            errorAlert.classList.remove(
                "show"
            );
        }
    }


    /*
     * ============================================================
     * VALIDATION
     * ============================================================
     */

    function normalizePhone(phone) {

        return String(phone || "")
            .trim()
            .replace(/\s+/g, " ");
    }


    function normalizeEmail(email) {

        return String(email || "")
            .trim()
            .toLowerCase();
    }


    function validateForm() {

        const applicantType =
            document.getElementById(
                "applicantType"
            ).value.trim();

        const applicantName =
            document.getElementById(
                "applicantName"
            ).value.trim();

        const applicantPhone =
            document.getElementById(
                "applicantPhone"
            ).value.trim();

        const applicantEmail =
            document.getElementById(
                "applicantEmail"
            ).value.trim();


        if (!applicantType) {

            throw new Error(
                "Please select whether you are a job seeker or employer."
            );
        }


        if (!applicantName) {

            throw new Error(
                "Please enter your full name."
            );
        }


        if (!applicantPhone) {

            throw new Error(
                "Please enter your phone number."
            );
        }


        if (!applicantEmail) {

            throw new Error(
                "Please enter your email address."
            );
        }


        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (
            !emailPattern.test(
                applicantEmail
            )
        ) {

            throw new Error(
                "Please enter a valid email address."
            );
        }


        return {
            applicantType,
            applicantName,
            applicantPhone,
            applicantEmail
        };
    }


    /*
     * ============================================================
     * SUBMIT APPLICATION
     * ============================================================
     */

    async function submitApplication(event) {

        event.preventDefault();

        clearAlerts();


        if (!supabaseClient) {

            showError(
                "The application service is not connected. Please refresh the page and try again."
            );

            return;
        }


        let values;


        try {

            values =
                validateForm();

        } catch (error) {

            showError(
                error.message
            );

            return;
        }


        /*
         * Disable button
         */

        if (submitButton) {

            submitButton.disabled = true;

            submitButton.innerHTML =
                '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        }


        try {

            const license =
                document.getElementById(
                    "applicantLicense"
                ).value.trim();


            const region =
                document.getElementById(
                    "applicantRegion"
                ).value.trim();


            const message =
                document.getElementById(
                    "applicantMessage"
                ).value.trim();


            /*
             * ====================================================
             * CHECK FOR RECENT DUPLICATE
             * ====================================================
             *
             * We do not expose all applications.
             * The query only checks whether an active application
             * already exists for the same email.
             *
             * The SQL RLS policy below controls what anonymous
             * users can access.
             */

            const {
                data: existing,
                error: duplicateError
            } = await supabaseClient

                .from("driver_applications")

                .select(
                    "id,application_number,status"
                )

                .eq(
                    "email",
                    values.applicantEmail
                )

                .neq(
                    "status",
                    "rejected"
                )

                .limit(1);


            /*
             * A permission error should not prevent submission
             * if the database policy intentionally blocks reads.
             *
             * Therefore only treat unexpected errors as fatal.
             */

            if (
                duplicateError &&
                duplicateError.code !== "42501"
            ) {

                console.warn(
                    "Duplicate check warning:",
                    duplicateError
                );
            }


            if (
                !duplicateError &&
                existing &&
                existing.length > 0
            ) {

                const previous =
                    existing[0];

                throw new Error(
                    `An application already exists for this email. Application number: ${
                        previous.application_number ||
                        "already submitted"
                    }.`
                );
            }


            /*
             * ====================================================
             * APPLICATION PAYLOAD
             * ====================================================
             */

            const payload = {

                applicant_type:
                    values.applicantType,

                full_name:
                    values.applicantName,

                phone:
                    normalizePhone(
                        values.applicantPhone
                    ),

                email:
                    normalizeEmail(
                        values.applicantEmail
                    ),

                license_class:
                    license || null,

                region_company:
                    region || null,

                additional_details:
                    message || null,

                status:
                    "new",

                source:
                    "website",

                created_at:
                    new Date().toISOString()

            };


            console.log(
                "Submitting driver application..."
            );


            /*
             * ====================================================
             * INSERT
             * ====================================================
             */

            const {
                data,
                error
            } = await supabaseClient

                .from(
                    "driver_applications"
                )

                .insert(
                    payload
                )

                .select(
                    "application_number"
                )
                .single();


            if (error) {

                console.error(
                    "Driver application insert error:",
                    error
                );

                throw error;
            }


            /*
             * ====================================================
             * SUCCESS
             * ====================================================
             */

            const applicationNumber =
                data &&
                data.application_number
                    ? data.application_number
                    : "submitted";


            showSuccess(
                `Application received successfully. Your application number is ${applicationNumber}. Our team will contact you within 24 hours.`
            );


            /*
             * Reset form
             */

            if (form) {
                form.reset();
            }


            /*
             * Update button
             */

            if (submitButton) {

                submitButton.disabled = false;

                submitButton.innerHTML =
                    '<i class="fas fa-check"></i> Application Submitted';

                /*
                 * Restore button after a short delay.
                 */

                setTimeout(
                    function () {

                        submitButton.innerHTML =
                            '<i class="fas fa-paper-plane"></i> Submit Application';

                    },
                    5000
                );
            }


            /*
             * Scroll user to success message.
             */

            if (successAlert) {

                successAlert.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }


        } catch (error) {

            console.error(
                "DRIVER APPLICATION ERROR:",
                error
            );


            let message =
                error.message ||
                "Something went wrong while submitting your application.";


            /*
             * Friendly Supabase messages
             */

            if (
                message.includes(
                    "duplicate key"
                )
            ) {

                message =
                    "An application with these details already exists.";
            }


            if (
                message.includes(
                    "row-level security"
                ) ||
                message.includes(
                    "violates row-level security"
                )
            ) {

                message =
                    "The application could not be submitted because the database security policy needs to be configured.";
            }


            showError(
                message
            );


            if (submitButton) {

                submitButton.disabled = false;

                submitButton.innerHTML =
                    '<i class="fas fa-paper-plane"></i> Submit Application';
            }
        }
    }


    /*
     * ============================================================
     * INITIALIZE PAGE
     * ============================================================
     */

    function initialize() {

        const connected =
            initializeSupabase();


        if (!connected) {

            showError(
                "Application service could not be initialized. Please refresh the page."
            );

            return;
        }


        if (!form) {

            console.error(
                "driverApplyForm was not found."
            );

            return;
        }


        form.addEventListener(
            "submit",
            submitApplication
        );


        console.log(
            "Driver recruitment form ready."
        );
    }


    /*
     * ============================================================
     * DOM READY
     * ============================================================
     */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );

    } else {

        initialize();
    }

})();
