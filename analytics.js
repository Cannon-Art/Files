// Analytics Integration - Only loads when user accepts cookies
// Privacy-friendly analytics by Plausible
(function() {
    'use strict';

    const cookieConsent = localStorage.getItem('cookieConsent');

    if (cookieConsent !== 'accepted') {
        return;
    }

    // Avoid double-init if analytics.js is injected more than once
    if (window.__cannonPlausibleScriptReady) {
        return;
    }
    window.__cannonPlausibleScriptReady = true;

    window.plausible = window.plausible || function () {
        (plausible.q = plausible.q || []).push(arguments);
    };
    plausible.init = plausible.init || function (i) {
        plausible.o = i || {};
    };
    plausible.init();

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://plausible.io/js/pa-TaheL_Itki-ZZ1_7ldtY-.js';
    document.head.appendChild(script);
})();
