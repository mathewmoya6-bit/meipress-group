/* =========================================================
   MEI PRESS GROUP
   Shared Brand / Logo Configuration
   ========================================================= */

window.MEI_BRAND = {
    name: "MEI Press Group",

    assets: {
        logo: "assets/logo.svg",
        logoWhite: "assets/logo-white.svg",
        logoMark: "assets/logo-mark.svg",
        logoMarkWhite: "assets/logo-mark-white.svg",
        favicon: "assets/favicon.svg"
    },

    colors: {
        navy: "#071a2b",
        navy2: "#0b304a",
        green: "#18c77a",
        greenDark: "#07985a",
        greenLight: "#e4f8ef"
    }
};


/* =========================================================
   AUTOMATIC FAVICON
   ========================================================= */

(function () {
    const favicon = document.querySelector(
        'link[rel="icon"], link[rel="shortcut icon"]'
    );

    if (favicon) {
        favicon.href = window.MEI_BRAND.assets.favicon;
    } else {
        const link = document.createElement("link");
        link.rel = "icon";
        link.type = "image/svg+xml";
        link.href = window.MEI_BRAND.assets.favicon;
        document.head.appendChild(link);
    }
})();


/* =========================================================
   AUTOMATIC LOGO
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /*
     * Any element with:
     *
     * data-mei-logo
     *
     * will automatically receive logo.svg.
     */

    document.querySelectorAll("[data-mei-logo]").forEach(function (element) {

        if (element.tagName.toLowerCase() === "img") {

            element.src = window.MEI_BRAND.assets.logo;

            if (!element.alt) {
                element.alt = window.MEI_BRAND.name;
            }

        } else {

            element.innerHTML = `
                <img
                    src="${window.MEI_BRAND.assets.logo}"
                    alt="${window.MEI_BRAND.name}"
                    class="mei-logo"
                >
            `;
        }
    });


    /*
     * White logo
     */
    document.querySelectorAll("[data-mei-logo-white]").forEach(function (element) {

        if (element.tagName.toLowerCase() === "img") {

            element.src = window.MEI_BRAND.assets.logoWhite;

            if (!element.alt) {
                element.alt = window.MEI_BRAND.name;
            }

        } else {

            element.innerHTML = `
                <img
                    src="${window.MEI_BRAND.assets.logoWhite}"
                    alt="${window.MEI_BRAND.name}"
                    class="mei-logo mei-logo-white"
                >
            `;
        }
    });


    /*
     * Logo mark
     */
    document.querySelectorAll("[data-mei-logo-mark]").forEach(function (element) {

        if (element.tagName.toLowerCase() === "img") {

            element.src = window.MEI_BRAND.assets.logoMark;

            if (!element.alt) {
                element.alt = window.MEI_BRAND.name;
            }

        } else {

            element.innerHTML = `
                <img
                    src="${window.MEI_BRAND.assets.logoMark}"
                    alt="${window.MEI_BRAND.name}"
                    class="mei-logo-mark"
                >
            `;
        }
    });


    /*
     * White logo mark
     */
    document.querySelectorAll("[data-mei-logo-mark-white]").forEach(function (element) {

        if (element.tagName.toLowerCase() === "img") {

            element.src = window.MEI_BRAND.assets.logoMarkWhite;

            if (!element.alt) {
                element.alt = window.MEI_BRAND.name;
            }

        } else {

            element.innerHTML = `
                <img
                    src="${window.MEI_BRAND.assets.logoMarkWhite}"
                    alt="${window.MEI_BRAND.name}"
                    class="mei-logo-mark"
                >
            `;
        }
    });

});
