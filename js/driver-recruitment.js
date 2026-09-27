/* ============================================================
   MEI GROUP - DRIVER RECRUITMENT
   Dynamic Job Seeker / Employer Application
   ============================================================ */

(function () {
    "use strict";

    /* ----------------------------------------------------------
       SUPABASE CONFIG
       ---------------------------------------------------------- */

    const SUPABASE_URL =
        "https://qkchnrrxrewmlvvxuuqe.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_-ki98JwzbWWiVXm7nzAAgQ_5H2qjXz7";

    let supabaseClient = null;

    function initializeSupabase() {

        if (
            window.supabaseClient &&
            typeof window.supabaseClient.from === "function"
        ) {
            supabaseClient = window.supabaseClient;
            return;
        }

        if (
            window.supabase &&
            typeof window.supabase.createClient === "function"
        ) {
            supabaseClient =
                window.supabase.createClient(
                    SUPABASE_URL,
                    SUPABASE_KEY
                );

            window.supabaseClient = supabaseClient;
        }
    }


    /* ----------------------------------------------------------
       HELPERS
       ---------------------------------------------------------- */

    function byId(id) {
        return document.getElementById(id);
    }

    function getValue(id) {
        const element = byId(id);
        return element ? element.value.trim() : "";
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

    function setRequired(id, required) {

        const element = byId(id);

        if (!element) {
            return;
        }

        element.required = required;
    }


    /* ----------------------------------------------------------
       FORM SECTIONS
       ---------------------------------------------------------- */

    function getJobSeekerSection() {

        return (
            byId("jobSeekerFields") ||
            byId("jobSeekerSection") ||
            byId("job-seeker-fields") ||
            byId("job-seeker-section")
        );
    }

    function getEmployerSection() {

        return (
            byId("employerFields") ||
            byId("employerSection") ||
            byId("employer-fields") ||
            byId("employer-section")
        );
    }


    /* ----------------------------------------------------------
       SHOW / HIDE APPLICANT FORMS
       ---------------------------------------------------------- */

    function switchApplicantType() {

        const selector =
            byId("applicantType") ||
            byId("applicationType") ||
            byId("applicant_type");

        const jobSeekerSection =
            getJobSeekerSection();

        const employerSection =
            getEmployerSection();

        const message =
            byId("formInstruction") ||
            byId("selectionMessage") ||
            byId("formMessage");

        if (!selector) {
            console.error(
                "MEI Driver Recruitment: applicant type selector not found."
            );
            return;
        }

        const type = selector.value;

        console.log(
            "Selected applicant type:",
            type
        );

        /* Hide everything first */

        if (jobSeekerSection) {
            jobSeekerSection.style.display = "none";
        }

        if (employerSection) {
            employerSection.style.display = "none";
        }

        if (message) {
            message.style.display = "block";
        }


        /* Remove required attributes */

        const jobFields = [
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

        jobFields.forEach(function (id) {
            setRequired(id, false);
        });

        employerFields.forEach(function (id) {
            setRequired(id, false);
        });


        /* ------------------------------------------------------
           JOB SEEKER
           ------------------------------------------------------ */

        if (
            type === "Job Seeker" ||
            type === "job_seeker" ||
            type === "Job Seeker / Driver"
        ) {

            if (jobSeekerSection) {
                jobSeekerSection.style.display = "block";
            }

            if (message) {
                message.style.display = "none";
            }

            setRequired("jobFullName", true);
            setRequired("jobPhone", true);
            setRequired("jobEmail", true);
            setRequired("licenseClass", true);
            setRequired("yearsExperience", true);

            return;
        }


        /* ------------------------------------------------------
           EMPLOYER
           ------------------------------------------------------ */

        if (
            type === "Employer" ||
            type === "employer" ||
            type === "Employer / Company"
        ) {

            if (employerSection) {
                employerSection.style.display = "block";
            }

            if (message) {
                message.style.display = "none";
            }

            setRequired("companyName", true);
            setRequired("contactPerson", true);
            setRequired("employerPhone", true);
            setRequired("employerEmail", true);
            setRequired("driversRequired", true);
            setRequired("requiredLicenseClass", true);

            return;
        }
    }


    /* ----------------------------------------------------------
       VALIDATION
       ---------------------------------------------------------- */

    function validateJobSeeker() {

        const requiredFields = [
            ["jobFullName", "Full name"],
            ["jobPhone", "Phone number"],
            ["jobEmail", "Email address"],
            ["licenseClass", "Driving licence class"],
            ["yearsExperience", "Years of experience"]
        ];

        for (const item of requiredFields) {

            const value = getValue(item[0]);

            if (!value) {

                alert(
                    "Please enter your " +
                    item[1] +
                    "."
                );

                const element = byId(item[0]);

                if (element) {
                    element.focus();
                }

                return false;
            }
        }

        return true;
    }


    function validateEmployer() {

        const requiredFields = [
            ["companyName", "Company name"],
            ["contactPerson", "Contact person"],
            ["employerPhone", "Phone number"],
            ["employerEmail", "Email address"],
            ["driversRequired", "Number of drivers required"],
            ["requiredLicenseClass", "Required licence class"]
        ];

        for (const item of requiredFields) {

            const value = getValue(item[0]);

            if (!value) {

                alert(
                    "Please enter " +
                    item[1] +
                    "."
                );

                const element = byId(item[0]);

                if (element) {
                    element.focus();
                }

                return false;
            }
        }

        return true;
    }


    /* ----------------------------------------------------------
       PHONE NORMALIZATION
       ---------------------------------------------------------- */

    function normalizePhone(phone) {

        let value =
            String(phone || "")
                .trim()
                .replace(/[^\d+]/g, "");

        if (
            value.startsWith("07") &&
            value.length === 10
        ) {
            value =
                "+254" +
                value.substring(1);
        }

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


    /* ----------------------------------------------------------
       EMAIL NORMALIZATION
       ---------------------------------------------------------- */

    function normalizeEmail(email) {

        return String(email || "")
            .trim()
            .toLowerCase();
    }


    /* ----------------------------------------------------------
       MESSAGE
       ---------------------------------------------------------- */

    function showMessage(message, type) {

        const element =
            byId("formMessage") ||
            byId("submissionMessage") ||
            byId("successMessage");

        if (!element) {
            alert(message);
            return;
        }

        element.textContent = message;

        element.style.display = "block";

        element.className =
            "form-message " +
            (type || "info");

        if (type === "success") {
            element.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }
    }


    /* ----------------------------------------------------------
       SUBMIT APPLICATION
       ---------------------------------------------------------- */

    async function submitApplication(event) {

        event.preventDefault();

        initializeSupabase();

        if (!supabaseClient) {

            showMessage(
                "The application system could not connect to Supabase. Please refresh the page and try again.",
                "error"
            );

            return;
        }

        const selector =
            byId("applicantType") ||
            byId("applicationType") ||
            byId("applicant_type");

        if (!selector) {
            alert("Application type field is missing.");
            return;
        }

        const type = selector.value;


        /* ------------------------------------------------------
           JOB SEEKER
           ------------------------------------------------------ */

        if (
            type === "Job Seeker" ||
            type === "job_seeker" ||
            type === "Job Seeker / Driver"
        ) {

            if (!validateJobSeeker()) {
                return;
            }

            const payload = {

                applicant_type: "Job Seeker",

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

                status: "new",

                source: "website"
            };


            await saveApplication(
                payload,
                event.target
            );

            return;
        }


        /* ------------------------------------------------------
           EMPLOYER
           ------------------------------------------------------ */

        if (
            type === "Employer" ||
            type === "employer" ||
            type === "Employer / Company"
        ) {

            if (!validateEmployer()) {
                return;
            }

            const payload = {

                applicant_type: "Employer",

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

                status: "new",

                source: "website"
            };


            await saveApplication(
                payload,
                event.target
            );

            return;
        }


        alert(
            "Please select whether you are applying as a Job Seeker / Driver or Employer / Company."
        );
    }


    /* ----------------------------------------------------------
       SAVE TO SUPABASE
       ---------------------------------------------------------- */

    async function saveApplication(
        payload,
        form
    ) {

        const submitButton =
            form.querySelector(
                'button[type="submit"]'
            );

        if (submitButton) {

            submitButton.disabled = true;

            submitButton.dataset.originalText =
                submitButton.textContent;

            submitButton.textContent =
                "Submitting...";
        }


        showMessage(
            "Submitting your application...",
            "info"
        );


        try {

            /*
             * IMPORTANT:
             * Do not use .select() here.
             *
             * Public users can INSERT applications,
             * but they are intentionally not allowed
             * to SELECT other applications.
             */

            const { error } =
                await supabaseClient
                    .from("driver_applications")
                    .insert(payload);


            if (error) {

                console.error(
                    "Driver application error:",
                    error
                );

                showMessage(
                    "We could not submit your application. " +
                    error.message,
                    "error"
                );

                return;
            }


            /* --------------------------------------------------
               SUCCESS
               -------------------------------------------------- */

            showMessage(
                "Thank you. Your driver recruitment application has been submitted successfully. Our recruitment team will review your information and contact you.",
                "success"
            );


            form.reset();

            switchApplicantType();


        } catch (error) {

            console.error(error);

            showMessage(
                "An unexpected error occurred while submitting your application. Please try again.",
                "error"
            );

        } finally {

            if (submitButton) {

                submitButton.disabled = false;

                submitButton.textContent =
                    submitButton.dataset.originalText ||
                    "Submit Application";
            }
        }
    }


    /* ----------------------------------------------------------
       INITIALIZE
       ---------------------------------------------------------- */

    function initializeDriverRecruitment() {

        initializeSupabase();


        const selector =
            byId("applicantType") ||
            byId("applicationType") ||
            byId("applicant_type");


        if (!selector) {

            console.error(
                "MEI Driver Recruitment: applicant type selector not found."
            );

            return;
        }


        /* Dropdown change */

        selector.addEventListener(
            "change",
            switchApplicantType
        );


        /* Form submission */

        const form =
            byId("driverRecruitmentForm") ||
            byId("driverApplicationForm") ||
            document.querySelector(
                "form[data-driver-recruitment]"
            );


        if (form) {

            form.addEventListener(
                "submit",
                submitApplication
            );

        } else {

            console.error(
                "MEI Driver Recruitment: application form not found."
            );
        }


        /* Initial state */

        switchApplicantType();
    }


    /* ----------------------------------------------------------
       MAKE FUNCTION AVAILABLE TO HTML
       ---------------------------------------------------------- */

    window.switchApplicantType =
        switchApplicantType;


    /* ----------------------------------------------------------
       START
       ---------------------------------------------------------- */

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeDriverRecruitment
        );

    } else {

        initializeDriverRecruitment();
    }

})();
