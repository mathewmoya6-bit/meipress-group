/* ============================================================
   MEI GROUP
   DRIVER RECRUITMENT & PLACEMENT
   Dynamic Job Seeker / Employer Application
   ============================================================ */

(function () {
    "use strict";

    /* ==========================================================
       SUPABASE
       ========================================================== */

    const SUPABASE_URL =
        "https://qkchnrrxrewmlvvxuuqe.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_-ki98JwzbWWiVXm7nzAAgQ_5H2qjXz7";

    let supabaseClient = null;


    function initializeSupabase() {

        /*
         * Use existing client if js/config.js
         * has already created one.
         */

        if (
            window.supabaseClient &&
            typeof window.supabaseClient.from === "function"
        ) {
            supabaseClient = window.supabaseClient;
            return;
        }


        /*
         * Otherwise create our own client.
         */

        if (
            window.supabase &&
            typeof window.supabase.createClient === "function"
        ) {

            supabaseClient =
                window.supabase.createClient(
                    SUPABASE_URL,
                    SUPABASE_KEY
                );

            window.supabaseClient =
                supabaseClient;

        } else {

            console.error(
                "Supabase library was not loaded."
            );
        }
    }


    /* ==========================================================
       HELPERS
       ========================================================== */

    function getElement(id) {
        return document.getElementById(id);
    }


    function getValue(id) {

        const element = getElement(id);

        if (!element) {
            return "";
        }

        return String(element.value || "").trim();
    }


    function getNumber(id) {

        const value = getValue(id);

        if (value === "") {
            return null;
        }

        const number = Number(value);

        return Number.isFinite(number)
            ? number
            : null;
    }


    function normalizePhone(phone) {

        let value =
            String(phone || "")
                .trim()
                .replace(/[^\d+]/g, "");


        /*
         * Kenya local format:
         * 0712345678
         * -> +254712345678
         */

        if (
            value.startsWith("07") &&
            value.length === 10
        ) {

            value =
                "+254" +
                value.substring(1);
        }


        /*
         * Kenya local format:
         * 0112345678
         * -> +254112345678
         */

        if (
            value.startsWith("01") &&
            value.length === 10
        ) {

            value =
                "+254" +
                value.substring(1);
        }


        return value;
    }


    function normalizeEmail(email) {

        return String(email || "")
            .trim()
            .toLowerCase();
    }


    function showMessage(message, type) {

        const element =
            getElement("formMessage");

        if (!element) {
            alert(message);
            return;
        }


        element.textContent =
            message;

        element.className =
            "message " +
            (type || "");


        element.classList.add("show");


        if (type === "success") {

            element.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }
    }


    function clearMessage() {

        const element =
            getElement("formMessage");

        if (!element) {
            return;
        }

        element.textContent = "";

        element.className =
            "message";
    }


    /* ==========================================================
       REQUIRED FIELD CONTROL
       ========================================================== */

    function setRequired(id, required) {

        const element =
            getElement(id);

        if (!element) {
            return;
        }

        element.required =
            required;
    }


    /* ==========================================================
       JOB SEEKER FIELDS
       ========================================================== */

    const jobSeekerFields = [
        "jobFullName",
        "jobPhone",
        "jobEmail",
        "nationality",
        "currentLocation",
        "preferredLocation",
        "licenseClass",
        "yearsExperience",
        "currentEmployer",
        "availability",
        "internationalPlacement",
        "passportStatus",
        "documentsStatus",
        "vehicleExperience",
        "jobAdditionalDetails"
    ];


    /* ==========================================================
       EMPLOYER FIELDS
       ========================================================== */

    const employerFields = [
        "companyName",
        "contactPerson",
        "employerPhone",
        "employerEmail",
        "companyLocation",
        "driversRequired",
        "requiredLicenseClass",
        "vehicleType",
        "minimumExperienceYears",
        "employmentLocation",
        "placementScope",
        "salaryRange",
        "recruitmentTimeline",
        "accommodationBenefits",
        "jobDescription"
    ];


    /* ==========================================================
       SHOW / HIDE DYNAMIC FORM
       ========================================================== */

    function switchApplicantType() {

        const applicantType =
            getElement("applicantType");

        const jobSeekerSection =
            getElement("jobSeekerFields");

        const employerSection =
            getElement("employerFields");

        const placeholder =
            getElement("typePlaceholder");

        const submitArea =
            getElement("submitArea");


        if (!applicantType) {

            console.error(
                "applicantType element not found."
            );

            return;
        }


        const type =
            applicantType.value;


        console.log(
            "MEI Driver Recruitment:",
            "Selected type =",
            type
        );


        /*
         * Start with everything hidden.
         */

        if (jobSeekerSection) {

            jobSeekerSection.classList.add(
                "hidden"
            );

            jobSeekerSection.style.display =
                "none";
        }


        if (employerSection) {

            employerSection.classList.add(
                "hidden"
            );

            employerSection.style.display =
                "none";
        }


        if (placeholder) {

            placeholder.style.display =
                "block";
        }


        if (submitArea) {

            submitArea.style.display =
                "none";
        }


        /*
         * Remove required from dynamic fields.
         */

        jobSeekerFields.forEach(function (id) {

            setRequired(
                id,
                false
            );

        });


        employerFields.forEach(function (id) {

            setRequired(
                id,
                false
            );

        });


        /*
         * Nothing selected.
         */

        if (!type) {

            console.log(
                "No applicant type selected."
            );

            return;
        }


        /* ======================================================
           JOB SEEKER / DRIVER
           ====================================================== */

        if (type === "Job Seeker") {

            console.log(
                "Showing Job Seeker form."
            );


            if (jobSeekerSection) {

                jobSeekerSection.classList.remove(
                    "hidden"
                );

                jobSeekerSection.style.display =
                    "block";
            }


            if (placeholder) {

                placeholder.style.display =
                    "none";
            }


            if (submitArea) {

                submitArea.style.display =
                    "block";
            }


            /*
             * Required Job Seeker fields
             */

            setRequired(
                "jobFullName",
                true
            );

            setRequired(
                "jobPhone",
                true
            );

            setRequired(
                "jobEmail",
                true
            );

            setRequired(
                "currentLocation",
                true
            );

            setRequired(
                "licenseClass",
                true
            );

            setRequired(
                "yearsExperience",
                true
            );


            return;
        }


        /* ======================================================
           EMPLOYER / COMPANY
           ====================================================== */

        if (type === "Employer") {

            console.log(
                "Showing Employer form."
            );


            if (employerSection) {

                employerSection.classList.remove(
                    "hidden"
                );

                employerSection.style.display =
                    "block";
            }


            if (placeholder) {

                placeholder.style.display =
                    "none";
            }


            if (submitArea) {

                submitArea.style.display =
                    "block";
            }


            /*
             * Required Employer fields
             */

            setRequired(
                "companyName",
                true
            );

            setRequired(
                "contactPerson",
                true
            );

            setRequired(
                "employerPhone",
                true
            );

            setRequired(
                "employerEmail",
                true
            );

            setRequired(
                "companyLocation",
                true
            );

            setRequired(
                "driversRequired",
                true
            );

            setRequired(
                "requiredLicenseClass",
                true
            );

            setRequired(
                "vehicleType",
                true
            );

            setRequired(
                "employmentLocation",
                true
            );

            setRequired(
                "placementScope",
                true
            );

            setRequired(
                "jobDescription",
                true
            );


            return;
        }


        console.warn(
            "Unknown applicant type:",
            type
        );
    }


    /* ==========================================================
       VALIDATE JOB SEEKER
       ========================================================== */

    function validateJobSeeker() {

        const fields = [
            {
                id: "jobFullName",
                label: "Full Name"
            },
            {
                id: "jobPhone",
                label: "Phone Number"
            },
            {
                id: "jobEmail",
                label: "Email Address"
            },
            {
                id: "currentLocation",
                label: "Current Location"
            },
            {
                id: "licenseClass",
                label: "Driving Licence Class"
            },
            {
                id: "yearsExperience",
                label: "Years of Driving Experience"
            }
        ];


        for (const field of fields) {

            const value =
                getValue(field.id);


            if (!value) {

                showMessage(
                    "Please complete: " +
                    field.label +
                    ".",
                    "error"
                );


                const element =
                    getElement(field.id);


                if (element) {
                    element.focus();
                }


                return false;
            }
        }


        /*
         * Validate email
         */

        const email =
            getValue("jobEmail");


        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {

            showMessage(
                "Please enter a valid email address.",
                "error"
            );

            getElement("jobEmail").focus();

            return false;
        }


        return true;
    }


    /* ==========================================================
       VALIDATE EMPLOYER
       ========================================================== */

    function validateEmployer() {

        const fields = [
            {
                id: "companyName",
                label: "Company Name"
            },
            {
                id: "contactPerson",
                label: "Contact Person"
            },
            {
                id: "employerPhone",
                label: "Phone Number"
            },
            {
                id: "employerEmail",
                label: "Email Address"
            },
            {
                id: "companyLocation",
                label: "Company Location"
            },
            {
                id: "driversRequired",
                label: "Number of Drivers Required"
            },
            {
                id: "requiredLicenseClass",
                label: "Required Licence Class"
            },
            {
                id: "vehicleType",
                label: "Vehicle Type"
            },
            {
                id: "employmentLocation",
                label: "Employment Location"
            },
            {
                id: "placementScope",
                label: "Placement Scope"
            },
            {
                id: "jobDescription",
                label: "Job Description / Driver Requirements"
            }
        ];


        for (const field of fields) {

            const value =
                getValue(field.id);


            if (!value) {

                showMessage(
                    "Please complete: " +
                    field.label +
                    ".",
                    "error"
                );


                const element =
                    getElement(field.id);


                if (element) {
                    element.focus();
                }


                return false;
            }
        }


        /*
         * Validate email
         */

        const email =
            getValue("employerEmail");


        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {

            showMessage(
                "Please enter a valid email address.",
                "error"
            );

            getElement("employerEmail").focus();

            return false;
        }


        return true;
    }


    /* ==========================================================
       BUILD JOB SEEKER PAYLOAD
       ========================================================== */

    function buildJobSeekerPayload() {

        return {

            applicant_type:
                "Job Seeker",

            full_name:
                getValue("jobFullName"),

            phone:
                normalizePhone(
                    getValue("jobPhone")
                ),

            email:
                normalizeEmail(
                    getValue("jobEmail")
                ),

            nationality:
                getValue("nationality") || null,

            current_location:
                getValue("currentLocation") || null,

            preferred_location:
                getValue("preferredLocation") || null,

            license_class:
                getValue("licenseClass") || null,

            years_experience:
                getNumber("yearsExperience"),

            current_employer:
                getValue("currentEmployer") || null,

            vehicle_experience:
                getValue("vehicleExperience") || null,

            availability:
                getValue("availability") || null,

            international_placement:
                getValue("internationalPlacement") || null,

            passport_status:
                getValue("passportStatus") || null,

            documents_status:
                getValue("documentsStatus") || null,

            additional_details:
                getValue("jobAdditionalDetails") || null,

            status:
                "new",

            source:
                "website"
        };
    }


    /* ==========================================================
       BUILD EMPLOYER PAYLOAD
       ========================================================== */

    function buildEmployerPayload() {

        return {

            applicant_type:
                "Employer",

            full_name:
                getValue("contactPerson"),

            phone:
                normalizePhone(
                    getValue("employerPhone")
                ),

            email:
                normalizeEmail(
                    getValue("employerEmail")
                ),

            company_name:
                getValue("companyName") || null,

            company_location:
                getValue("companyLocation") || null,

            drivers_required:
                getNumber("driversRequired"),

            required_license_class:
                getValue("requiredLicenseClass") || null,

            vehicle_type:
                getValue("vehicleType") || null,

            minimum_experience_years:
                getNumber(
                    "minimumExperienceYears"
                ),

            employment_location:
                getValue("employmentLocation") || null,

            placement_scope:
                getValue("placementScope") || null,

            salary_range:
                getValue("salaryRange") || null,

            accommodation_benefits:
                getValue("accommodationBenefits") || null,

            job_description:
                getValue("jobDescription") || null,

            recruitment_timeline:
                getValue("recruitmentTimeline") || null,

            status:
                "new",

            source:
                "website"
        };
    }


    /* ==========================================================
       SUBMIT APPLICATION
       ========================================================== */

    async function submitApplication(event) {

        event.preventDefault();


        clearMessage();


        initializeSupabase();


        if (!supabaseClient) {

            showMessage(
                "The application system could not connect to Supabase. Please refresh the page and try again.",
                "error"
            );

            return;
        }


        const applicantType =
            getValue("applicantType");


        if (!applicantType) {

            showMessage(
                "Please select Job Seeker / Driver or Employer / Company.",
                "error"
            );

            return;
        }


        const submitButton =
            getElement("submitBtn");


        if (submitButton) {

            submitButton.disabled =
                true;

            submitButton.textContent =
                "Submitting...";
        }


        try {

            let payload;


            /* ==================================================
               JOB SEEKER
               ================================================== */

            if (
                applicantType ===
                "Job Seeker"
            ) {

                if (!validateJobSeeker()) {

                    if (submitButton) {

                        submitButton.disabled =
                            false;

                        submitButton.textContent =
                            "Submit Application";
                    }

                    return;
                }


                payload =
                    buildJobSeekerPayload();
            }


            /* ==================================================
               EMPLOYER
               ================================================== */

            else if (
                applicantType ===
                "Employer"
            ) {

                if (!validateEmployer()) {

                    if (submitButton) {

                        submitButton.disabled =
                            false;

                        submitButton.textContent =
                            "Submit Application";
                    }

                    return;
                }


                payload =
                    buildEmployerPayload();
            }


            else {

                showMessage(
                    "Invalid application type selected.",
                    "error"
                );

                return;
            }


            console.log(
                "Submitting driver application:",
                payload
            );


            /*
             * IMPORTANT:
             *
             * We intentionally do NOT use:
             *
             * .select()
             *
             * because anonymous users are allowed
             * to INSERT applications but should not
             * be allowed to read the application table.
             */

            const {
                error
            } = await supabaseClient
                .from("driver_applications")
                .insert(payload);


            if (error) {

                console.error(
                    "Supabase driver application error:",
                    error
                );


                showMessage(
                    "Application could not be submitted: " +
                    error.message,
                    "error"
                );

                return;
            }


            /* ==================================================
               SUCCESS
               ================================================== */

            showMessage(
                "Application submitted successfully. Thank you. The MEI Group recruitment team will review your information and contact you.",
                "success"
            );


            /*
             * Reset the form.
             */

            const form =
                getElement("driverApplyForm");


            if (form) {
                form.reset();
            }


            /*
             * Return to initial selection state.
             */

            switchApplicantType();


        } catch (error) {

            console.error(
                "Unexpected driver recruitment error:",
                error
            );


            showMessage(
                "An unexpected error occurred. Please try again.",
                "error"
            );

        } finally {

            if (submitButton) {

                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Submit Application";
            }
        }
    }


    /* ==========================================================
       INITIALIZE
       ========================================================== */

    function initialize() {

        console.log(
            "MEI Driver Recruitment initializing..."
        );


        initializeSupabase();


        const applicantType =
            getElement("applicantType");


        if (!applicantType) {

            console.error(
                "applicantType not found."
            );

            return;
        }


        /*
         * Applicant type change
         */

        applicantType.addEventListener(
            "change",
            switchApplicantType
        );


        /*
         * Application form
         */

        const form =
            getElement("driverApplyForm");


        if (!form) {

            console.error(
                "driverApplyForm not found."
            );

            return;
        }


        form.addEventListener(
            "submit",
            submitApplication
        );


        /*
         * Initial state
         */

        switchApplicantType();


        console.log(
            "MEI Driver Recruitment initialized successfully."
        );
    }


    /* ==========================================================
       START
       ========================================================== */

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


    /*
     * Make function available globally.
     * Useful for debugging from browser console.
     */

    window.switchApplicantType =
        switchApplicantType;

})();
