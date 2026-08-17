// Cookie-gated analytics loader. Uses the free simple-analytics store (no Plausible).
(function() {
    'use strict';

    if (localStorage.getItem('cookieConsent') !== 'accepted') return;
    if (window.__simpleAnalyticsLoaded) return;
    window.__simpleAnalyticsLoaded = true;

    const script = document.createElement('script');
    const base = document.currentScript && document.currentScript.src
        ? document.currentScript.src
        : location.href;
    try {
        script.src = new URL('simple-analytics.js', base).href;
    } catch (e) {
        script.src = 'simple-analytics.js';
    }
    document.head.appendChild(script);
})();
