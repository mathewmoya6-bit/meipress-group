/* =========================================================
   MEI GROUP
   DRIVER RECRUITMENT & PLACEMENT
   Dynamic Job Seeker / Employer Application
   ========================================================= */

(function () {
    "use strict";

    const SUPABASE_URL =
        "https://qkchnrrxrewmlvvxuuqe.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_-ki98JwzbWWiVXm7nzAAgQ_5H2qjXz7";


    /* ---------------------------------------------------------
       SUPABASE INITIALIZATION
       --------------------------------------------------------- */

    let client = window.supabaseClient || null;

    try {
        if (!client) {
            if (
                !window.supabase ||
                typeof window.supabase.createClient !== "function"
            ) {
                throw new Error(
                    "Supabase library was not loaded."
                );
            }

            client = window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );

            window.supabaseClient = client;
        }
    } catch (error) {
        console.error(
            "Supabase initialization error:",
            error
        );
    }


    /* ---------------------------------------------------------
       DOM
       --------------------------------------------------------- */

    const form =
        document.getElementById("driverApplyForm");

    const applicantType =
        document.getElementById("applicantType");

    const jobSeekerFields =
        document.getElementById("jobSeekerFields");

    const employerFields =
        document.getElementById("employerFields");

    const typePlaceholder =
        document.getElementById("typePlaceholder");

    const submitArea =
        document.getElementById("submitArea");

    const submitBtn =
        document.getElementById("submitBtn");

    const formMessage =
        document.getElementById("formMessage");


    if (!form || !applicantType) {
        console.error(
            "Driver recruitment form was not found."
        );
        return;
    }


    /* ---------------------------------------------------------
       HELPERS
       --------------------------------------------------------- */

    function getValue(id) {
        const element = document.getElementById(id);

        if (!element) {
            return "";
        }

        return element.value.trim();
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


    function getSelectValue(id) {
        return getValue(id);
    }


    function normalizePhone(phone) {
        let value = String(phone || "")
            .trim()
            .replace(/[^\d+]/g, "");

        if (value.startsWith("07")) {
            value = "+254" + value.substring(1);
        }

        if (value.startsWith("01")) {
            value = "+254" + value.substring(1);
        }

        if (value.startsWith("254") && !value.startsWith("+")) {
            value = "+" + value;
        }

        return value;
    }


    function normalizeEmail(email) {
        return String(email || "")
            .trim()
            .toLowerCase();
    }


    function showMessage(type, message) {
        formMessage.className =
            "message show " + type;

        formMessage.textContent = message;

        formMessage.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
    }


    function clearMessage() {
        formMessage.className = "message";
        formMessage.textContent = "";
    }


    function setRequired(ids, required) {
        ids.forEach(function (id) {
            const element =
                document.getElementById(id);

            if (element) {
                element.required = required;
            }
        });
    }


    function clearFields(ids) {
        ids.forEach(function (id) {
            const element =
                document.getElementById(id);

            if (!element) {
                return;
            }

            if (element.type === "checkbox") {
                element.checked = false;
            } else {
                element.value = "";
            }
        });
    }


    /* ---------------------------------------------------------
       FIELD GROUPS
       --------------------------------------------------------- */

    const jobSeekerRequiredFields = [
        "jobFullName",
        "jobPhone",
        "jobEmail",
        "currentLocation",
        "licenseClass"
    ];


    const employerRequiredFields = [
        "companyName",
        "contactPerson",
        "employerPhone",
        "employerEmail",
        "companyLocation",
        "driversRequired",
        "requiredLicenseClass",
        "vehicleType",
        "employmentLocation",
        "placementScope",
        "jobDescription"
    ];


    const jobSeekerFieldsAll = [
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


    const employerFieldsAll = [
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


    /* ---------------------------------------------------------
       SWITCH FORM
       --------------------------------------------------------- */

    function switchApplicantType() {

        clearMessage();

        const type =
            applicantType.value;


        // Hide everything first
        jobSeekerFields.classList.add("hidden");
        employerFields.classList.add("hidden");

        typePlaceholder.style.display = "none";
        submitArea.style.display = "none";


        // Remove required flags from both forms
        setRequired(
            jobSeekerRequiredFields,
            false
        );

        setRequired(
            employerRequiredFields,
            false
        );


        if (type === "Job Seeker") {

            jobSeekerFields.classList.remove(
                "hidden"
            );

            setRequired(
                jobSeekerRequiredFields,
                true
            );

            submitArea.style.display = "block";

        } else if (type === "Employer") {

            employerFields.classList.remove(
                "hidden"
            );

            setRequired(
                employerRequiredFields,
                true
            );

            submitArea.style.display = "block";

        } else {

            typePlaceholder.style.display =
                "block";
        }
    }


    applicantType.addEventListener(
        "change",
        switchApplicantType
    );


    /* ---------------------------------------------------------
       VALIDATION
       --------------------------------------------------------- */

    function validateJobSeeker() {

        const name =
            getValue("jobFullName");

        const phone =
            getValue("jobPhone");

        const email =
            getValue("jobEmail");

        const location =
            getValue("currentLocation");

        const licence =
            getSelectValue("licenseClass");


        if (!name) {
            return "Please enter your full name.";
        }

        if (!phone) {
            return "Please enter your phone number.";
        }

        if (!email) {
            return "Please enter your email address.";
        }

        if (!location) {
            return "Please enter your current location.";
        }

        if (!licence) {
            return "Please select your driving licence class.";
        }


        const normalizedPhone =
            normalizePhone(phone);

        if (
            normalizedPhone.length < 10
        ) {
            return "Please enter a valid phone number.";
        }


        const normalizedEmail =
            normalizeEmail(email);

        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                normalizedEmail
            )
        ) {
            return "Please enter a valid email address.";
        }


        return null;
    }


    function validateEmployer() {

        const company =
            getValue("companyName");

        const contact =
            getValue("contactPerson");

        const phone =
            getValue("employerPhone");

        const email =
            getValue("employerEmail");

        const companyLocation =
            getValue("companyLocation");

        const driversRequired =
            getNumber("driversRequired");

        const licence =
            getSelectValue(
                "requiredLicenseClass"
            );

        const vehicle =
            getValue("vehicleType");

        const employmentLocation =
            getValue("employmentLocation");

        const placementScope =
            getSelectValue("placementScope");

        const jobDescription =
            getValue("jobDescription");


        if (!company) {
            return "Please enter the company name.";
        }

        if (!contact) {
            return "Please enter the contact person's name.";
        }

        if (!phone) {
            return "Please enter the employer phone number.";
        }

        if (!email) {
            return "Please enter the employer email address.";
        }

        if (!companyLocation) {
            return "Please enter the company location.";
        }

        if (
            driversRequired === null ||
            driversRequired < 1
        ) {
            return "Please enter the number of drivers required.";
        }

        if (!licence) {
            return "Please select the required licence class.";
        }

        if (!vehicle) {
            return "Please specify the vehicle type.";
        }

        if (!employmentLocation) {
            return "Please enter the employment location.";
        }

        if (!placementScope) {
            return "Please select the placement scope.";
        }

        if (!jobDescription) {
            return "Please provide the job description or driver requirements.";
        }


        const normalizedPhone =
            normalizePhone(phone);

        if (
            normalizedPhone.length < 10
        ) {
            return "Please enter a valid employer phone number.";
        }


        const normalizedEmail =
            normalizeEmail(email);

        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                normalizedEmail
            )
        ) {
            return "Please enter a valid employer email address.";
        }


        return null;
    }


    /* ---------------------------------------------------------
       PAYLOAD BUILDERS
       --------------------------------------------------------- */

    function buildJobSeekerPayload() {

        return {

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
                getSelectValue("licenseClass") || null,

            years_experience:
                getNumber("yearsExperience"),

            current_employer:
                getValue("currentEmployer") || null,

            vehicle_experience:
                getValue("vehicleExperience") || null,

            availability:
                getSelectValue("availability") || null,

            international_placement:
                getSelectValue(
                    "internationalPlacement"
                ) || null,

            passport_status:
                getSelectValue(
                    "passportStatus"
                ) || null,

            documents_status:
                getValue("documentsStatus") || null,

            additional_details:
                getValue(
                    "jobAdditionalDetails"
                ) || null,

            status: "new",

            source: "website"
        };
    }


    function buildEmployerPayload() {

        return {

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
                getValue("companyName"),

            company_location:
                getValue("companyLocation"),

            drivers_required:
                getNumber("driversRequired"),

            required_license_class:
                getSelectValue(
                    "requiredLicenseClass"
                ),

            vehicle_type:
                getValue("vehicleType"),

            minimum_experience_years:
                getNumber(
                    "minimumExperienceYears"
                ),

            employment_location:
                getValue(
                    "employmentLocation"
                ),

            placement_scope:
                getSelectValue(
                    "placementScope"
                ),

            salary_range:
                getValue("salaryRange") || null,

            accommodation_benefits:
                getValue(
                    "accommodationBenefits"
                ) || null,

            job_description:
                getValue("jobDescription"),

            recruitment_timeline:
                getSelectValue(
                    "recruitmentTimeline"
                ) || null,

            status: "new",

            source: "website"
        };
    }


    /* ---------------------------------------------------------
       SUBMIT
       --------------------------------------------------------- */

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            clearMessage();


            if (!client) {

                showMessage(
                    "error",
                    "The application system could not connect to Supabase. Please try again."
                );

                return;
            }


            const type =
                applicantType.value;


            if (!type) {

                showMessage(
                    "error",
                    "Please select whether you are a Job Seeker or Employer."
                );

                return;
            }


            let validationError = null;

            if (type === "Job Seeker") {
                validationError =
                    validateJobSeeker();
            }

            if (type === "Employer") {
                validationError =
                    validateEmployer();
            }


            if (validationError) {

                showMessage(
                    "error",
                    validationError
                );

                return;
            }


            let payload;

            if (type === "Job Seeker") {
                payload =
                    buildJobSeekerPayload();
            } else {
                payload =
                    buildEmployerPayload();
            }


            submitBtn.disabled = true;

            submitBtn.textContent =
                "Submitting Application...";


            try {

                const {
                    data,
                    error
                } = await client
                    .from("driver_applications")
                    .insert(payload)
                    .select(
                        "id, application_number"
                    )
                    .single();


                if (error) {

                    console.error(
                        "Supabase application error:",
                        error
                    );

                    throw error;
                }


                const applicationNumber =
                    data &&
                    data.application_number
                        ? data.application_number
                        : "submitted successfully";


                showMessage(
                    "success",
                    "Your " +
                    type.toLowerCase() +
                    " application has been submitted successfully. " +
                    "Application Number: " +
                    applicationNumber +
                    ". MEI Group recruitment staff will review your information."
                );


                // Reset the form
                form.reset();


                // Hide dynamic sections
                jobSeekerFields.classList.add(
                    "hidden"
                );

                employerFields.classList.add(
                    "hidden"
                );

                typePlaceholder.style.display =
                    "block";

                submitArea.style.display =
                    "none";


                window.scrollTo({
                    top:
                        formMessage.getBoundingClientRect()
                            .top +
                        window.scrollY -
                        100,
                    behavior: "smooth"
                });


            } catch (error) {

                let message =
                    "We could not submit your application. Please try again.";

                if (error && error.message) {

                    console.error(
                        error.message
                    );

                    if (
                        error.code === "42501"
                    ) {
                        message =
                            "The application form does not currently have permission to submit. Please contact the MEI administrator.";
                    } else if (
                        error.code === "23503"
                    ) {
                        message =
                            "A required database reference is missing. Please contact the MEI administrator.";
                    } else if (
                        error.code === "23514"
                    ) {
                        message =
                            "One of the application values is not accepted by the database. Please review the form.";
                    }
                }


                showMessage(
                    "error",
                    message
                );

            } finally {

                submitBtn.disabled = false;

                submitBtn.textContent =
                    "Submit Application";
            }
        }
    );


    /* ---------------------------------------------------------
       INITIAL STATE
       --------------------------------------------------------- */

    switchApplicantType();

})();
