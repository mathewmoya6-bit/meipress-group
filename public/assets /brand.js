(function () {
    "use strict";

    /*
    =========================================================
    MEI GROUP SHARED BRAND SYSTEM
    =========================================================

    File:
        /assets/brand.js

    Include on every public page:

        <script src="assets/brand.js"></script>

    Expected assets:

        /assets/brand.js
        /assets/logo.svg
        /assets/logo-white.svg
        /assets/logo-mark.svg
        /assets/logo-mark-white.svg
        /assets/favicon.svg
    =========================================================
    */


    /* =====================================================
       FIND THE FOLDER CONTAINING brand.js
    ===================================================== */

    const currentScript =
        document.currentScript ||
        document.querySelector(
            'script[src*="brand.js"]'
        );

    let assetBase = "assets/";

    if (currentScript && currentScript.src) {

        try {

            const scriptURL =
                new URL(
                    currentScript.src,
                    window.location.href
                );

            assetBase =
                scriptURL.href.substring(
                    0,
                    scriptURL.href.lastIndexOf("/") + 1
                );

        } catch (error) {

            console.warn(
                "MEI Brand: Could not determine asset path.",
                error
            );

        }
    }


    /* =====================================================
       BRAND INFORMATION
    ===================================================== */

    const MEI_BRAND = {

        companyName:
            "MEI Group",

        legalName:
            "MEI Press Holdings Ltd",

        phone:
            "+254 720 216 985",

        email:
            "info@meipressgroup.com",

        location:
            "Kenya",

        logo:
            assetBase + "logo.svg",

        logoWhite:
            assetBase + "logo-white.svg",

        logoMark:
            assetBase + "logo-mark.svg",

        logoMarkWhite:
            assetBase + "logo-mark-white.svg",

        favicon:
            assetBase + "favicon.svg"

    };


    window.MEI_BRAND =
        MEI_BRAND;


    /* =====================================================
       NAVIGATION
    ===================================================== */

    const navigation = [

        {
            label: "Home",
            href: "index.html"
        },

        {
            label: "Services",
            href: "index.html#services"
        },

        {
            label: "Education",
            href: "education.html"
        },

        {
            label: "Road Safety",
            href: "road-safety.html"
        },

        {
            label: "OSH",
            href: "occupational-safety.html"
        },

        {
            label: "Driver Recruitment",
            href: "driver-recruitment.html"
        },

        {
            label: "Training Calendar",
            href: "training-calendar.html"
        }

    ];


    /* =====================================================
       CURRENT PAGE
    ===================================================== */

    function getCurrentPage() {

        let page =
            window.location.pathname
                .split("/")
                .pop()
                .toLowerCase();

        if (!page) {
            page = "index.html";
        }

        return page;

    }


    const currentPage =
        getCurrentPage();


    /* =====================================================
       FAVICON
    ===================================================== */

    function createFavicon() {

        if (
            document.querySelector(
                'link[data-mei-favicon="1"]'
            )
        ) {
            return;
        }


        const favicon =
            document.createElement("link");

        favicon.rel = "icon";

        favicon.type =
            "image/svg+xml";

        favicon.href =
            MEI_BRAND.favicon;

        favicon.dataset.meiFavicon =
            "1";


        document.head.appendChild(
            favicon
        );

    }


    /* =====================================================
       CSS
    ===================================================== */

    function createStyles() {

        if (
            document.getElementById(
                "mei-brand-css"
            )
        ) {
            return;
        }


        const style =
            document.createElement("style");


        style.id =
            "mei-brand-css";


        style.textContent = `

        /* ================================================
           HEADER
        ================================================ */

        .mei-site-header {

            position: relative;

            z-index: 9999;

            width: 100%;

            background: #071a2b;

            color: #ffffff;

            border-bottom:
                1px solid
                rgba(255,255,255,.08);

            box-shadow:
                0 4px 18px
                rgba(0,0,0,.10);

        }


        .mei-header-inner {

            width:
                calc(100% - 40px);

            max-width:
                1180px;

            min-height:
                76px;

            margin:
                0 auto;

            display:
                flex;

            align-items:
                center;

            justify-content:
                space-between;

            gap:
                25px;

        }


        /* ================================================
           LOGO
        ================================================ */

        .mei-brand-logo {

            display:
                flex;

            align-items:
                center;

            gap:
                11px;

            flex-shrink:
                0;

            text-decoration:
                none;

            color:
                #ffffff;

        }


        .mei-brand-logo img {

            display:
                block;

            width:
                48px;

            height:
                48px;

            object-fit:
                contain;

        }


        .mei-brand-name {

            display:
                block;

            color:
                #ffffff;

            font-size:
                18px;

            line-height:
                1.1;

            font-weight:
                900;

        }


        .mei-brand-legal {

            display:
                block;

            margin-top:
                4px;

            color:
                rgba(255,255,255,.60);

            font-size:
                9px;

            line-height:
                1.1;

            font-weight:
                600;

        }


        /* ================================================
           DESKTOP NAVIGATION
        ================================================ */

        .mei-main-nav {

            display:
                flex;

            align-items:
                center;

            gap:
                2px;

        }


        .mei-main-nav a {

            position:
                relative;

            display:
                flex;

            align-items:
                center;

            justify-content:
                center;

            min-height:
                42px;

            padding:
                0 10px;

            border-radius:
                7px;

            color:
                rgba(255,255,255,.78);

            text-decoration:
                none;

            font-size:
                12px;

            font-weight:
                700;

            white-space:
                nowrap;

            transition:
                .2s ease;

        }


        .mei-main-nav a:hover {

            color:
                #ffffff;

            background:
                rgba(255,255,255,.07);

        }


        .mei-main-nav a.active {

            color:
                #18c77a;

        }


        .mei-main-nav a.active::after {

            content:
                "";

            position:
                absolute;

            left:
                10px;

            right:
                10px;

            bottom:
                3px;

            height:
                2px;

            border-radius:
                2px;

            background:
                #18c77a;

        }


        .mei-main-nav a.mei-nav-contact {

            margin-left:
                7px;

            padding:
                0 16px;

            background:
                #18c77a;

            color:
                #071a2b;

            font-weight:
                900;

        }


        .mei-main-nav a.mei-nav-contact:hover {

            background:
                #ffffff;

            color:
                #071a2b;

        }


        .mei-main-nav a.mei-nav-contact.active::after {

            display:
                none;

        }


        /* ================================================
           MOBILE BUTTON
        ================================================ */

        .mei-menu-toggle {

            display:
                none;

            width:
                44px;

            height:
                44px;

            border:
                1px solid
                rgba(255,255,255,.18);

            border-radius:
                8px;

            background:
                rgba(255,255,255,.05);

            color:
                #ffffff;

            cursor:
                pointer;

            font-size:
                23px;

            align-items:
                center;

            justify-content:
                center;

        }


        /* ================================================
           MOBILE NAV
        ================================================ */

        .mei-mobile-nav {

            display:
                none;

            width:
                100%;

            padding:
                10px 20px 18px;

            background:
                #071a2b;

            border-top:
                1px solid
                rgba(255,255,255,.08);

        }


        .mei-mobile-nav.open {

            display:
                block;

        }


        .mei-mobile-nav a {

            display:
                flex;

            align-items:
                center;

            min-height:
                46px;

            padding:
                0 12px;

            margin:
                2px 0;

            border-radius:
                7px;

            color:
                rgba(255,255,255,.82);

            text-decoration:
                none;

            font-size:
                14px;

            font-weight:
                700;

        }


        .mei-mobile-nav a:hover {

            color:
                #18c77a;

            background:
                rgba(255,255,255,.06);

        }


        .mei-mobile-nav a.active {

            color:
                #18c77a;

            background:
                rgba(24,199,122,.08);

        }


        .mei-mobile-nav a.mei-mobile-contact {

            margin-top:
                10px;

            justify-content:
                center;

            background:
                #18c77a;

            color:
                #071a2b;

        }


        /* ================================================
           FOOTER
        ================================================ */

        .mei-site-footer {

            background:
                #071a2b;

            color:
                #ffffff;

        }


        .mei-footer-inner {

            width:
                calc(100% - 40px);

            max-width:
                1180px;

            margin:
                0 auto;

            padding:
                55px 0 30px;

            display:
                grid;

            grid-template-columns:
                1.4fr
                1fr
                1fr
                1fr;

            gap:
                40px;

        }


        .mei-footer-brand {

            max-width:
                340px;

        }


        .mei-footer-logo {

            display:
                flex;

            align-items:
                center;

            gap:
                10px;

            margin-bottom:
                17px;

            text-decoration:
                none;

            color:
                #ffffff;

        }


        .mei-footer-logo img {

            width:
                44px;

            height:
                44px;

            object-fit:
                contain;

        }


        .mei-footer-logo strong {

            font-size:
                18px;

            font-weight:
                900;

        }


        .mei-footer-brand p {

            margin:
                0;

            color:
                rgba(255,255,255,.58);

            font-size:
                13px;

            line-height:
                1.7;

        }


        .mei-footer-column h4 {

            margin:
                0 0 15px;

            color:
                #ffffff;

            font-size:
                12px;

            font-weight:
                900;

            text-transform:
                uppercase;

            letter-spacing:
                .6px;

        }


        .mei-footer-column a {

            display:
                block;

            width:
                fit-content;

            margin-bottom:
                9px;

            color:
                rgba(255,255,255,.58);

            font-size:
                13px;

            text-decoration:
                none;

            transition:
                .2s ease;

        }


        .mei-footer-column a:hover {

            color:
                #18c77a;

        }


        .mei-footer-contact {

            display:
                grid;

            gap:
                12px;

        }


        .mei-footer-contact-item {

            color:
                rgba(255,255,255,.58);

            font-size:
                13px;

        }


        .mei-footer-contact-item strong {

            display:
                block;

            margin-bottom:
                2px;

            color:
                #ffffff;

            font-size:
                11px;

        }


        .mei-footer-bottom {

            width:
                calc(100% - 40px);

            max-width:
                1180px;

            margin:
                0 auto;

            padding:
                18px 0;

            border-top:
                1px solid
                rgba(255,255,255,.08);

            display:
                flex;

            align-items:
                center;

            justify-content:
                space-between;

            gap:
                20px;

        }


        .mei-footer-bottom span {

            color:
                rgba(255,255,255,.45);

            font-size:
                11px;

        }


        .mei-footer-tagline {

            color:
                #18c77a !important;

            font-weight:
                700;

        }


        /* ================================================
           RESPONSIVE
        ================================================ */

        @media (max-width: 1100px) {

            .mei-main-nav {

                display:
                    none;

            }


            .mei-menu-toggle {

                display:
                    flex;

            }

        }


        @media (max-width: 700px) {

            .mei-header-inner {

                width:
                    calc(100% - 28px);

                min-height:
                    68px;

            }


            .mei-brand-logo img {

                width:
                    42px;

                height:
                    42px;

            }


            .mei-brand-name {

                font-size:
                    16px;

            }


            .mei-brand-legal {

                font-size:
                    8px;

            }


            .mei-footer-inner {

                width:
                    calc(100% - 28px);

                grid-template-columns:
                    1fr 1fr;

                gap:
                    30px 20px;

            }


            .mei-footer-brand {

                grid-column:
                    1 / -1;

                max-width:
                    none;

            }


            .mei-footer-bottom {

                width:
                    calc(100% - 28px);

                flex-direction:
                    column;

                align-items:
                    flex-start;

            }

        }


        @media (max-width: 450px) {

            .mei-footer-inner {

                grid-template-columns:
                    1fr;

            }

        }

        `;


        document.head.appendChild(
            style
        );

    }


    /* =====================================================
       CHECK ACTIVE PAGE
    ===================================================== */

    function isActive(item) {

        const href =
            item.href;

        const hash =
            window.location.hash;


        if (
            href === "index.html"
        ) {

            return (
                currentPage ===
                "index.html" &&
                hash === ""
            );

        }


        if (
            href ===
            "index.html#services"
        ) {

            return (
                currentPage ===
                "index.html" &&
                hash === "#services"
            );

        }


        return (
            currentPage ===
            href.toLowerCase()
        );

    }


    /* =====================================================
       CREATE DESKTOP NAV
    ===================================================== */

    function createDesktopNav() {

        let html = "";


        navigation.forEach(
            item => {

                html += `
                    <a
                        href="${item.href}"
                        class="${isActive(item) ? "active" : ""}"
                    >
                        ${item.label}
                    </a>
                `;

            }
        );


        html += `
            <a
                href="index.html#contact"
                class="mei-nav-contact"
            >
                Contact Us
            </a>
        `;


        return html;

    }


    /* =====================================================
       CREATE MOBILE NAV
    ===================================================== */

    function createMobileNav() {

        let html = "";


        navigation.forEach(
            item => {

                html += `
                    <a
                        href="${item.href}"
                        class="${isActive(item) ? "active" : ""}"
                    >
                        ${item.label}
                    </a>
                `;

            }
        );


        html += `
            <a
                href="index.html#contact"
                class="mei-mobile-contact"
            >
                Contact Us
            </a>
        `;


        return html;

    }


    /* =====================================================
       CREATE HEADER
    ===================================================== */

    function createHeader() {

        if (
            document.querySelector(
                ".mei-site-header"
            )
        ) {
            return;
        }


        const header =
            document.createElement(
                "header"
            );


        header.className =
            "mei-site-header";


        header.innerHTML = `

            <div class="mei-header-inner">

                <a
                    href="index.html"
                    class="mei-brand-logo"
                    aria-label="MEI Group"
                >

                    <img
                        src="${MEI_BRAND.logoWhite}"
                        alt="MEI Group logo"
                    >

                    <span>

                        <span class="mei-brand-name">
                            MEI Group
                        </span>

                        <span class="mei-brand-legal">
                            MEI Press Holdings Ltd
                        </span>

                    </span>

                </a>


                <nav
                    class="mei-main-nav"
                    aria-label="Main navigation"
                >

                    ${createDesktopNav()}

                </nav>


                <button
                    type="button"
                    class="mei-menu-toggle"
                    id="meiMenuToggle"
                    aria-label="Open menu"
                    aria-expanded="false"
                >
                    ☰
                </button>

            </div>


            <div
                class="mei-mobile-nav"
                id="meiMobileNav"
            >

                ${createMobileNav()}

            </div>

        `;


        /*
         * Put the header at the very top.
         */

        document.body.insertBefore(
            header,
            document.body.firstChild
        );


        setupMobileMenu();

    }


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    function setupMobileMenu() {

        const button =
            document.getElementById(
                "meiMenuToggle"
            );


        const menu =
            document.getElementById(
                "meiMobileNav"
            );


        if (
            !button ||
            !menu
        ) {
            return;
        }


        button.addEventListener(
            "click",
            function () {

                const open =
                    menu.classList.toggle(
                        "open"
                    );


                button.textContent =
                    open
                        ? "×"
                        : "☰";


                button.setAttribute(
                    "aria-expanded",
                    open
                        ? "true"
                        : "false"
                );

            }
        );


        menu
            .querySelectorAll("a")
            .forEach(
                link => {

                    link.addEventListener(
                        "click",
                        function () {

                            menu.classList.remove(
                                "open"
                            );


                            button.textContent =
                                "☰";


                            button.setAttribute(
                                "aria-expanded",
                                "false"
                            );

                        }
                    );

                }
            );


        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Escape"
                ) {

                    menu.classList.remove(
                        "open"
                    );


                    button.textContent =
                        "☰";


                    button.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }

            }
        );

    }


    /* =====================================================
       CREATE FOOTER
    ===================================================== */

    function createFooter() {

        if (
            document.querySelector(
                ".mei-site-footer"
            )
        ) {
            return;
        }


        const footer =
            document.createElement(
                "footer"
            );


        footer.className =
            "mei-site-footer";


        const year =
            new Date().getFullYear();


        footer.innerHTML = `

            <div class="mei-footer-inner">


                <div class="mei-footer-brand">

                    <a
                        href="index.html"
                        class="mei-footer-logo"
                    >

                        <img
                            src="${MEI_BRAND.logoWhite}"
                            alt="MEI Group logo"
                        >

                        <strong>
                            MEI Group
                        </strong>

                    </a>


                    <p>
                        MEI Group, a division of
                        MEI Press Holdings Ltd,
                        provides professional services
                        in international education,
                        road safety, occupational safety
                        and health, and driver recruitment.
                    </p>

                </div>


                <div class="mei-footer-column">

                    <h4>
                        Services
                    </h4>

                    <a href="education.html">
                        International Education
                    </a>

                    <a href="road-safety.html">
                        Road Safety
                    </a>

                    <a href="occupational-safety.html">
                        Occupational Safety & Health
                    </a>

                    <a href="driver-recruitment.html">
                        Driver Recruitment
                    </a>

                </div>


                <div class="mei-footer-column">

                    <h4>
                        Quick Links
                    </h4>

                    <a href="index.html">
                        Home
                    </a>

                    <a href="index.html#services">
                        Services
                    </a>

                    <a href="index.html#about">
                        About
                    </a>

                    <a href="training-calendar.html">
                        Training Calendar
                    </a>

                    <a href="index.html#contact">
                        Contact
                    </a>

                </div>


                <div class="mei-footer-column">

                    <h4>
                        Contact
                    </h4>


                    <div class="mei-footer-contact">

                        <div class="mei-footer-contact-item">

                            <strong>
                                Phone
                            </strong>

                            ${MEI_BRAND.phone}

                        </div>


                        <div class="mei-footer-contact-item">

                            <strong>
                                Email
                            </strong>

                            ${MEI_BRAND.email}

                        </div>


                        <div class="mei-footer-contact-item">

                            <strong>
                                Location
                            </strong>

                            ${MEI_BRAND.location}

                        </div>

                    </div>

                </div>


            </div>


            <div class="mei-footer-bottom">

                <span>
                    © ${year}
                    ${MEI_BRAND.legalName}.
                    All rights reserved.
                </span>


                <span class="mei-footer-tagline">
                    Professional. Practical. Opportunity Focused.
                </span>

            </div>

        `;


        document.body.appendChild(
            footer
        );

    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function initializeMEI() {

        try {

            createFavicon();

            createStyles();

            createHeader();

            createFooter();


            console.log(
                "MEI Group brand system loaded successfully."
            );

        } catch (error) {

            console.error(
                "MEI Group brand system error:",
                error
            );

        }

    }


    /* =====================================================
       START
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeMEI
        );

    } else {

        initializeMEI();

    }

})();
