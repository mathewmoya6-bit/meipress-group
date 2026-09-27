/*
=========================================================
MEI GROUP — SHARED BRAND SYSTEM
MEI Press Holdings Ltd
=========================================================

File:
    assets/brand.js

Used by:
    index.html
    education.html
    road-safety.html
    occupational-safety.html
    training-calendar.html
    training-registration.html
    driver-recruitment.html
    admin.html / other public pages as required

Assets expected:
    assets/logo.svg
    assets/logo-white.svg
    assets/logo-mark.svg
    assets/logo-mark-white.svg
    assets/favicon.svg
=========================================================
*/

(function () {

    "use strict";


    /* =====================================================
       BRAND CONFIGURATION
    ===================================================== */

    const MEI_BRAND = {

        companyName: "MEI Group",

        legalName: "MEI Press Holdings Ltd",

        logo: "assets/logo.svg",

        logoWhite: "assets/logo-white.svg",

        logoMark: "assets/logo-mark.svg",

        logoMarkWhite: "assets/logo-mark-white.svg",

        favicon: "assets/favicon.svg",

        phone: "+254 720 216 985",

        email: "info@meipressgroup.com",

        website: "meipressgroup.com",

        location: "Kenya"

    };


    /*
     * Make brand information available globally.
     */

    window.MEI_BRAND = MEI_BRAND;


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
       DETERMINE CURRENT PAGE
    ===================================================== */

    function getCurrentPage() {

        let path =
            window.location.pathname
                .split("/")
                .pop()
                .toLowerCase();

        if (!path) {
            path = "index.html";
        }

        return path;

    }


    const currentPage =
        getCurrentPage();


    /* =====================================================
       FAVICON
    ===================================================== */

    function createFavicon() {

        /*
         * Prevent duplicate favicon.
         */

        if (
            document.querySelector(
                'link[data-mei-favicon="true"]'
            )
        ) {
            return;
        }


        const favicon =
            document.createElement("link");


        favicon.rel = "icon";

        favicon.type = "image/svg+xml";

        favicon.href =
            MEI_BRAND.favicon;

        favicon.dataset.meiFavicon =
            "true";


        document.head.appendChild(
            favicon
        );

    }


    /* =====================================================
       SHARED CSS
    ===================================================== */

    function injectStyles() {

        if (
            document.getElementById(
                "mei-brand-styles"
            )
        ) {
            return;
        }


        const style =
            document.createElement("style");


        style.id =
            "mei-brand-styles";


        style.textContent = `

        /* =================================================
           MEI HEADER
        ================================================= */

        .mei-site-header {

            position: sticky;

            top: 0;

            z-index: 9999;

            width: 100%;

            background:
                #071a2b;

            color: #ffffff;

            border-bottom:
                1px solid rgba(
                    255,
                    255,
                    255,
                    0.08
                );

            box-shadow:
                0 5px 20px
                rgba(
                    0,
                    0,
                    0,
                    0.12
                );

        }


        .mei-header-inner {

            width:
                min(
                    calc(100% - 40px),
                    1180px
                );

            min-height: 76px;

            margin: 0 auto;

            display: flex;

            align-items: center;

            justify-content: space-between;

            gap: 25px;

        }


        /* =================================================
           LOGO
        ================================================= */

        .mei-brand-logo {

            display: inline-flex;

            align-items: center;

            gap: 12px;

            flex-shrink: 0;

            text-decoration: none;

            color: #ffffff;

        }


        .mei-brand-logo img {

            width: 48px;

            height: 48px;

            object-fit: contain;

        }


        .mei-brand-text {

            display: flex;

            flex-direction: column;

            line-height: 1.1;

        }


        .mei-brand-name {

            font-size: 18px;

            font-weight: 900;

            letter-spacing: -0.3px;

            color: #ffffff;

        }


        .mei-brand-legal {

            margin-top: 4px;

            font-size: 9px;

            font-weight: 600;

            color:
                rgba(
                    255,
                    255,
                    255,
                    0.60
                );

            letter-spacing: 0.3px;

        }


        /* =================================================
           DESKTOP NAVIGATION
        ================================================= */

        .mei-main-nav {

            display: flex;

            align-items: center;

            justify-content: flex-end;

            gap: 3px;

        }


        .mei-main-nav a {

            position: relative;

            display: inline-flex;

            align-items: center;

            justify-content: center;

            min-height: 42px;

            padding:
                0 11px;

            border-radius: 7px;

            color:
                rgba(
                    255,
                    255,
                    255,
                    0.78
                );

            text-decoration: none;

            font-size: 12px;

            font-weight: 700;

            transition:
                background 0.2s ease,
                color 0.2s ease;

        }


        .mei-main-nav a:hover {

            color: #ffffff;

            background:
                rgba(
                    255,
                    255,
                    255,
                    0.07
                );

        }


        .mei-main-nav a.active {

            color: #18c77a;

        }


        .mei-main-nav a.active::after {

            content: "";

            position: absolute;

            left: 11px;

            right: 11px;

            bottom: 3px;

            height: 2px;

            border-radius: 2px;

            background:
                #18c77a;

        }


        .mei-main-nav .mei-nav-cta {

            margin-left: 7px;

            padding:
                0 16px;

            background:
                #18c77a;

            color:
                #071a2b;

            font-weight: 900;

        }


        .mei-main-nav .mei-nav-cta:hover {

            background:
                #ffffff;

            color:
                #071a2b;

        }


        .mei-main-nav .mei-nav-cta.active::after {

            display: none;

        }


        /* =================================================
           MOBILE MENU BUTTON
        ================================================= */

        .mei-menu-toggle {

            width: 44px;

            height: 44px;

            display: none;

            align-items: center;

            justify-content: center;

            border: 1px solid
                rgba(
                    255,
                    255,
                    255,
                    0.15
                );

            border-radius: 8px;

            background:
                rgba(
                    255,
                    255,
                    255,
                    0.05
                );

            color: #ffffff;

            cursor: pointer;

            font-size: 22px;

            line-height: 1;

        }


        .mei-menu-toggle:hover {

            background:
                rgba(
                    24,
                    199,
                    122,
                    0.15
                );

        }


        /* =================================================
           MOBILE NAVIGATION
        ================================================= */

        .mei-mobile-nav {

            display: none;

            background:
                #071a2b;

            border-top:
                1px solid
                rgba(
                    255,
                    255,
                    255,
                    0.08
                );

            padding:
                10px 20px 18px;

        }


        .mei-mobile-nav.open {

            display: block;

        }


        .mei-mobile-nav a {

            display: flex;

            align-items: center;

            min-height: 46px;

            padding:
                0 12px;

            border-radius: 7px;

            color:
                rgba(
                    255,
                    255,
                    255,
                    0.82
                );

            text-decoration: none;

            font-size: 14px;

            font-weight: 700;

        }


        .mei-mobile-nav a:hover {

            background:
                rgba(
                    255,
                    255,
                    255,
                    0.06
                );

            color:
                #18c77a;

        }


        .mei-mobile-nav a.active {

            color:
                #18c77a;

            background:
                rgba(
                    24,
                    199,
                    122,
                    0.08
                );

        }


        .mei-mobile-nav .mei-mobile-cta {

            margin-top: 8px;

            justify-content: center;

            background:
                #18c77a;

            color:
                #071a2b;

        }


        .mei-mobile-nav .mei-mobile-cta:hover {

            background:
                #ffffff;

            color:
                #071a2b;

        }


        /* =================================================
           FOOTER
        ================================================= */

        .mei-site-footer {

            background:
                #071a2b;

            color:
                #ffffff;

            border-top:
                1px solid
                rgba(
                    255,
                    255,
                    255,
                    0.07
                );

        }


        .mei-footer-main {

            width:
                min(
                    calc(100% - 40px),
                    1180px
                );

            margin:
                0 auto;

            padding:
                55px 0 35px;

            display: grid;

            grid-template-columns:
                1.3fr
                1fr
                1fr
                1fr;

            gap: 40px;

        }


        .mei-footer-brand {

            max-width: 330px;

        }


        .mei-footer-logo {

            display:
                inline-flex;

            align-items:
                center;

            gap: 11px;

            margin-bottom:
                18px;

            text-decoration:
                none;

            color:
                #ffffff;

        }


        .mei-footer-logo img {

            width: 45px;

            height: 45px;

            object-fit: contain;

        }


        .mei-footer-logo strong {

            display: block;

            font-size: 18px;

            font-weight: 900;

        }


        .mei-footer-brand p {

            color:
                rgba(
                    255,
                    255,
                    255,
                    0.60
                );

            font-size: 13px;

            line-height: 1.7;

        }


        .mei-footer-column h4 {

            margin:
                0 0 16px;

            color:
                #ffffff;

            font-size: 13px;

            font-weight: 900;

            text-transform:
                uppercase;

            letter-spacing:
                0.5px;

        }


        .mei-footer-column a {

            display:
                block;

            width:
                fit-content;

            margin-bottom:
                10px;

            color:
                rgba(
                    255,
                    255,
                    255,
                    0.60
                );

            font-size: 13px;

            text-decoration:
                none;

            transition:
                color 0.2s ease;

        }


        .mei-footer-column a:hover {

            color:
                #18c77a;

        }


        .mei-footer-contact {

            display:
                grid;

            gap: 10px;

        }


        .mei-footer-contact div {

            color:
                rgba(
                    255,
                    255,
                    255,
                    0.60
                );

            font-size: 13px;

            line-height: 1.5;

        }


        .mei-footer-contact strong {

            display:
                block;

            color:
                #ffffff;

            font-size:
                11px;

            margin-bottom:
                2px;

        }


        .mei-footer-bottom {

            width:
                min(
                    calc(100% - 40px),
                    1180px
                );

            margin:
                0 auto;

            padding:
                18px 0;

            border-top:
                1px solid
                rgba(
                    255,
                    255,
                    255,
                    0.08
                );

            display:
                flex;

            align-items:
                center;

            justify-content:
                space-between;

            gap:
                20px;

        }


        .mei-footer-bottom p {

            margin:
                0;

            color:
                rgba(
                    255,
                    255,
                    255,
                    0.48
                );

            font-size:
                11px;

        }


        .mei-footer-tagline {

            color:
                #18c77a !important;

            font-weight:
                700;

        }


        /* =================================================
           RESPONSIVE
        ================================================= */

        @media (max-width: 1100px) {

            .mei-main-nav {

                display: none;

            }


            .mei-menu-toggle {

                display: inline-flex;

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


            .mei-footer-main {

                width:
                    calc(100% - 28px);

                grid-template-columns:
                    1fr 1fr;

                gap:
                    30px 20px;

                padding:
                    40px 0 25px;

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

            .mei-footer-main {

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
       CREATE HEADER
    ===================================================== */

    function createHeader() {

        /*
         * Prevent duplicate headers.
         */

        if (
            document.querySelector(
                ".mei-site-header"
            )
        ) {
            return;
        }


        const header =
            document.createElement("header");


        header.className =
            "mei-site-header";


        header.innerHTML = `

            <div class="mei-header-inner">

                <a
                    href="index.html"
                    class="mei-brand-logo"
                    aria-label="MEI Group Home"
                >

                    <img
                        src="${MEI_BRAND.logoWhite}"
                        alt="MEI Group"
                    >

                    <span class="mei-brand-text">

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

                    ${createDesktopNavigation()}

                </nav>


                <button
                    type="button"
                    class="mei-menu-toggle"
                    id="meiMenuToggle"
                    aria-label="Open navigation menu"
                    aria-expanded="false"
                >
                    ☰
                </button>

            </div>


            <div
                class="mei-mobile-nav"
                id="meiMobileNav"
            >

                ${createMobileNavigation()}

            </div>

        `;


        /*
         * Insert header at the beginning of body.
         */

        document.body.insertBefore(
            header,
            document.body.firstChild
        );


        initializeMobileMenu();

    }


    /* =====================================================
       DESKTOP NAVIGATION HTML
    ===================================================== */

    function createDesktopNavigation() {

        return navigation.map(
            item => {

                const active =
                    isNavigationItemActive(
                        item
                    );

                const isContact =
                    item.href.includes(
                        "#contact"
                    );


                return `

                    <a
                        href="${item.href}"
                        class="${active ? "active" : ""} ${isContact ? "mei-nav-cta" : ""}"
                    >
                        ${item.label}
                    </a>

                `;

            }
        ).join("");

    }


    /* =====================================================
       MOBILE NAVIGATION HTML
    ===================================================== */

    function createMobileNavigation() {

        const mobileItems =
            navigation.filter(
                item =>
                    !item.href.includes(
                        "#contact"
                    )
            );


        let html =
            mobileItems.map(
                item => {

                    const active =
                        isNavigationItemActive(
                            item
                        );


                    return `

                        <a
                            href="${item.href}"
                            class="${active ? "active" : ""}"
                        >
                            ${item.label}
                        </a>

                    `;

                }
            ).join("");


        html += `

            <a
                href="index.html#contact"
                class="mei-mobile-cta"
            >
                Contact Us
            </a>

        `;


        return html;

    }


    /* =====================================================
       ACTIVE NAVIGATION
    ===================================================== */

    function isNavigationItemActive(item) {

        const href =
            item.href;


        /*
         * Home.
         */

        if (
            href === "index.html"
        ) {

            return (
                currentPage ===
                    "index.html" &&
                !window.location.hash
            );

        }


        /*
         * Services section.
         */

        if (
            href ===
                "index.html#services"
        ) {

            return (
                currentPage ===
                    "index.html" &&
                window.location.hash ===
                    "#services"
            );

        }


        /*
         * Normal page.
         */

        return (
            href.toLowerCase() ===
            currentPage
        );

    }


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    function initializeMobileMenu() {

        const toggle =
            document.getElementById(
                "meiMenuToggle"
            );


        const mobileNav =
            document.getElementById(
                "meiMobileNav"
            );


        if (
            !toggle ||
            !mobileNav
        ) {
            return;
        }


        toggle.addEventListener(
            "click",
            function () {

                const isOpen =
                    mobileNav.classList.toggle(
                        "open"
                    );


                toggle.setAttribute(
                    "aria-expanded",
                    isOpen
                        ? "true"
                        : "false"
                );


                toggle.setAttribute(
                    "aria-label",
                    isOpen
                        ? "Close navigation menu"
                        : "Open navigation menu"
                );


                toggle.textContent =
                    isOpen
                        ? "×"
                        : "☰";

            }
        );


        /*
         * Close mobile navigation after
         * clicking a link.
         */

        mobileNav
            .querySelectorAll("a")
            .forEach(link => {

                link.addEventListener(
                    "click",
                    function () {

                        mobileNav.classList.remove(
                            "open"
                        );


                        toggle.setAttribute(
                            "aria-expanded",
                            "false"
                        );


                        toggle.setAttribute(
                            "aria-label",
                            "Open navigation menu"
                        );


                        toggle.textContent =
                            "☰";

                    }
                );

            });


        /*
         * Close menu when Escape is pressed.
         */

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Escape"
                ) {

                    mobileNav.classList.remove(
                        "open"
                    );


                    toggle.setAttribute(
                        "aria-expanded",
                        "false"
                    );


                    toggle.textContent =
                        "☰";

                }

            }
        );

    }


    /* =====================================================
       CREATE FOOTER
    ===================================================== */

    function createFooter() {

        /*
         * Prevent duplicate footer.
         */

        if (
            document.querySelector(
                ".mei-site-footer"
            )
        ) {
            return;
        }


        const footer =
            document.createElement("footer");


        footer.className =
            "mei-site-footer";


        const year =
            new Date().getFullYear();


        footer.innerHTML = `

            <div class="mei-footer-main">


                <div class="mei-footer-brand">

                    <a
                        href="index.html"
                        class="mei-footer-logo"
                    >

                        <img
                            src="${MEI_BRAND.logoWhite}"
                            alt="MEI Group"
                        >

                        <span>

                            <strong>
                                MEI Group
                            </strong>

                        </span>

                    </a>


                    <p>
                        MEI Group, a division of
                        MEI Press Holdings Ltd, provides
                        professional services in international
                        education, road safety, occupational
                        safety and health, and driver recruitment.
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


                    <a href="index.html#about">
                        About Us
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

                        <div>

                            <strong>
                                Phone
                            </strong>

                            ${MEI_BRAND.phone}

                        </div>


                        <div>

                            <strong>
                                Email
                            </strong>

                            ${MEI_BRAND.email}

                        </div>


                        <div>

                            <strong>
                                Location
                            </strong>

                            ${MEI_BRAND.location}

                        </div>

                    </div>

                </div>


            </div>


            <div class="mei-footer-bottom">

                <p>
                    © ${year}
                    ${MEI_BRAND.legalName}.
                    All rights reserved.
                </p>


                <p class="mei-footer-tagline">
                    Professional. Practical. Opportunity Focused.
                </p>

            </div>

        `;


        document.body.appendChild(
            footer
        );

    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function initializeMEIBrand() {

        /*
         * Run all brand functions.
         */

        createFavicon();

        injectStyles();

        createHeader();

        createFooter();


        /*
         * Make sure body does not accidentally
         * inherit old fixed header spacing.
         */

        document.body.classList.add(
            "mei-brand-loaded"
        );

    }


    /* =====================================================
       DOM READY
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeMEIBrand
        );

    } else {

        initializeMEIBrand();

    }


})();
