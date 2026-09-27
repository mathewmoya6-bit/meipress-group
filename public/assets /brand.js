/* =========================================================
   MEI PRESS GROUP
   AUTOMATIC SHARED HEADER / BRAND SYSTEM
   ========================================================= */

(function () {
    "use strict";

    const BRAND = {
        name: "MEI Press Group",
        tagline: "Professional Services. Trusted Solutions.",

        logo: "assets/logo.svg",
        logoWhite: "assets/logo-white.svg",
        logoMark: "assets/logo-mark.svg",
        logoMarkWhite: "assets/logo-mark-white.svg",
        favicon: "assets/favicon.svg",

        colors: {
            navy: "#071a2b",
            navy2: "#0b304a",
            green: "#18c77a",
            greenDark: "#07985a",
            greenLight: "#e4f8ef"
        }
    };

    window.MEI_BRAND = BRAND;


    /* =====================================================
       FAVICON
       ===================================================== */

    function createFavicon() {
        let favicon = document.querySelector(
            'link[rel="icon"], link[rel="shortcut icon"]'
        );

        if (!favicon) {
            favicon = document.createElement("link");
            favicon.rel = "icon";
            document.head.appendChild(favicon);
        }

        favicon.type = "image/svg+xml";
        favicon.href = BRAND.favicon;
    }


    /* =====================================================
       GLOBAL BRAND CSS
       ===================================================== */

    function injectStyles() {

        if (document.getElementById("mei-brand-styles")) {
            return;
        }

        const style = document.createElement("style");

        style.id = "mei-brand-styles";

        style.textContent = `
            :root {
                --mei-navy: ${BRAND.colors.navy};
                --mei-navy-2: ${BRAND.colors.navy2};
                --mei-green: ${BRAND.colors.green};
                --mei-green-dark: ${BRAND.colors.greenDark};
                --mei-green-light: ${BRAND.colors.greenLight};
            }

            .mei-site-header {
                width: 100%;
                background: var(--mei-navy);
                color: #ffffff;
                position: relative;
                z-index: 9999;
                box-shadow: 0 2px 15px rgba(0,0,0,.12);
            }

            .mei-header-inner {
                max-width: 1200px;
                margin: 0 auto;
                padding: 14px 24px;
                min-height: 76px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 30px;
            }

            .mei-brand {
                display: inline-flex;
                align-items: center;
                text-decoration: none;
                flex-shrink: 0;
            }

            .mei-brand img {
                width: 180px;
                height: auto;
                display: block;
            }

            .mei-main-nav {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 6px;
            }

            .mei-main-nav a {
                color: #ffffff;
                text-decoration: none;
                font-size: 14px;
                font-weight: 600;
                padding: 10px 12px;
                border-radius: 7px;
                transition: .2s ease;
                white-space: nowrap;
            }

            .mei-main-nav a:hover {
                background: rgba(255,255,255,.08);
                color: var(--mei-green);
            }

            .mei-main-nav a.mei-active {
                color: var(--mei-green);
            }

            .mei-nav-cta {
                background: var(--mei-green) !important;
                color: var(--mei-navy) !important;
                margin-left: 5px;
            }

            .mei-nav-cta:hover {
                background: #ffffff !important;
                color: var(--mei-navy) !important;
            }

            .mei-menu-button {
                display: none;
                border: 0;
                background: transparent;
                color: #ffffff;
                cursor: pointer;
                width: 44px;
                height: 44px;
                border-radius: 8px;
                align-items: center;
                justify-content: center;
                font-size: 25px;
            }

            .mei-menu-button:hover {
                background: rgba(255,255,255,.08);
            }

            .mei-mobile-nav {
                display: none;
                background: var(--mei-navy-2);
                padding: 10px 20px 20px;
            }

            .mei-mobile-nav.open {
                display: block;
            }

            .mei-mobile-nav a {
                display: block;
                color: #ffffff;
                text-decoration: none;
                padding: 13px 10px;
                border-bottom: 1px solid rgba(255,255,255,.08);
                font-weight: 600;
            }

            .mei-mobile-nav a:hover {
                color: var(--mei-green);
            }

            .mei-mobile-nav .mei-nav-cta {
                margin: 12px 0 0;
                text-align: center;
                border-radius: 7px;
            }

            @media (max-width: 1000px) {

                .mei-main-nav {
                    display: none;
                }

                .mei-menu-button {
                    display: inline-flex;
                }

                .mei-header-inner {
                    min-height: 68px;
                    padding: 10px 18px;
                }

                .mei-brand img {
                    width: 150px;
                }
            }

            @media (max-width: 480px) {

                .mei-header-inner {
                    padding: 9px 14px;
                }

                .mei-brand img {
                    width: 135px;
                }
            }
        `;

        document.head.appendChild(style);
    }


    /* =====================================================
       NAVIGATION
       ===================================================== */

    const navigation = [
        {
            label: "Home",
            href: "index.html"
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
            label: "Training",
            href: "training-calendar.html"
        },
        {
            label: "Driver Recruitment",
            href: "driver-recruitment.html"
        }
    ];


    /* =====================================================
       GET CURRENT PAGE
       ===================================================== */

    function getCurrentPage() {

        let page = window.location.pathname.split("/").pop();

        if (!page || page === "") {
            page = "index.html";
        }

        return page.toLowerCase();
    }


    /* =====================================================
       CREATE NAVIGATION LINKS
       ===================================================== */

    function createNavigation(className) {

        const nav = document.createElement("nav");
        nav.className = className;

        navigation.forEach(item => {

            const link = document.createElement("a");

            link.href = item.href;
            link.textContent = item.label;

            if (getCurrentPage() === item.href.toLowerCase()) {
                link.classList.add("mei-active");
                link.setAttribute("aria-current", "page");
            }

            nav.appendChild(link);
        });

        const contact = document.createElement("a");

        contact.href = "index.html#contact";
        contact.textContent = "Contact";
        contact.className = "mei-nav-cta";

        nav.appendChild(contact);

        return nav;
    }


    /* =====================================================
       CREATE HEADER
       ===================================================== */

    function createHeader() {

        /* Prevent duplicate header */
        if (document.querySelector(".mei-site-header")) {
            return;
        }

        const header = document.createElement("header");

        header.className = "mei-site-header";

        header.innerHTML = `
            <div class="mei-header-inner">

                <a
                    href="index.html"
                    class="mei-brand"
                    aria-label="${BRAND.name} Home"
                >
                    <img
                        src="${BRAND.logoWhite}"
                        alt="${BRAND.name}"
                    >
                </a>

                <div class="mei-desktop-navigation"></div>

                <button
                    type="button"
                    class="mei-menu-button"
                    aria-label="Open navigation menu"
                    aria-expanded="false"
                >
                    ☰
                </button>

            </div>

            <div class="mei-mobile-navigation"></div>
        `;


        /* Desktop navigation */

        const desktopContainer =
            header.querySelector(".mei-desktop-navigation");

        desktopContainer.appendChild(
            createNavigation("mei-main-nav")
        );


        /* Mobile navigation */

        const mobileContainer =
            header.querySelector(".mei-mobile-navigation");

        mobileContainer.appendChild(
            createNavigation("mei-mobile-nav")
        );


        /* Mobile menu */

        const menuButton =
            header.querySelector(".mei-menu-button");

        const mobileNav =
            header.querySelector(".mei-mobile-nav");


        menuButton.addEventListener("click", function () {

            const isOpen =
                mobileNav.classList.toggle("open");

            menuButton.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );

            menuButton.textContent =
                isOpen ? "×" : "☰";
        });


        /* Insert header at beginning of body */

        document.body.insertBefore(
            header,
            document.body.firstChild
        );
    }


    /* =====================================================
       OPTIONAL FOOTER
       ===================================================== */

    function createFooter() {

        if (document.querySelector(".mei-site-footer")) {
            return;
        }

        const footer = document.createElement("footer");

        footer.className = "mei-site-footer";

        footer.innerHTML = `
            <div style="
                background:${BRAND.colors.navy};
                color:#ffffff;
                padding:35px 20px;
                margin-top:40px;
            ">
                <div style="
                    max-width:1200px;
                    margin:0 auto;
                    display:flex;
                    align-items:center;
                    justify-content:space-between;
                    gap:20px;
                    flex-wrap:wrap;
                ">

                    <div>
                        <img
                            src="${BRAND.logoWhite}"
                            alt="${BRAND.name}"
                            style="width:150px;height:auto;"
                        >
                    </div>

                    <div style="
                        color:rgba(255,255,255,.75);
                        font-size:13px;
                    ">
                        © ${new Date().getFullYear()}
                        ${BRAND.name}.
                        All rights reserved.
                    </div>

                </div>
            </div>
        `;

        document.body.appendChild(footer);
    }


    /* =====================================================
       INITIALIZE
       ===================================================== */

    function initializeMEIBrand() {

        createFavicon();

        injectStyles();

        createHeader();

        /*
         * Enable this line if you want the shared footer
         * automatically added to all public pages.
         */
        createFooter();
    }


    /* =====================================================
       START
       ===================================================== */

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            initializeMEIBrand
        );

    } else {

        initializeMEIBrand();

    }

})();
