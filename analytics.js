// Analytics Integration - Only loads when user accepts cookies
(function() {
    'use strict';
    
    const cookieConsent = localStorage.getItem('cookieConsent');
    
    if (cookieConsent === 'accepted') {
        // Plausible Analytics - Privacy-focused, open source, GDPR compliant
        // Add this hostname in your Plausible dashboard (must match how visitors reach the site)
        const domain = 'cannon-art.github.io';
        
        const script = document.createElement('script');
        script.defer = true;
        script.dataset.domain = domain;
        script.src = 'https://plausible.io/js/script.js';
        document.head.appendChild(script);
        
        window.plausible = window.plausible || function() {
            (window.plausible.q = window.plausible.q || []).push(arguments);
        };
    }
    
    // Alternative: Umami Analytics (self-hosted option)
    /*
    if (cookieConsent === 'accepted') {
        const script = document.createElement('script');
        script.defer = true;
        script.src = 'https://your-umami-instance.com/script.js';
        script.dataset.websiteId = 'your-website-id';
        document.head.appendChild(script);
    }
    */
    
    // Alternative: Matomo Analytics (self-hosted option)
    /*
    if (cookieConsent === 'accepted') {
        var _paq = window._paq = window._paq || [];
        _paq.push(['trackPageView']);
        _paq.push(['enableLinkTracking']);
        (function() {
            var u = 'https://your-matomo-instance.com/';
            _paq.push(['setTrackerUrl', u + 'matomo.php']);
            _paq.push(['setSiteId', '1']);
            var d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
            g.async = true; g.src = u + 'matomo.js'; s.parentNode.insertBefore(g, s);
        })();
    }
    */
})();
