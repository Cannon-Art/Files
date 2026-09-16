// Menu Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');

    // The open/closed state lives in a CSS class, which screen readers cannot
    // see. Mirroring it onto aria-expanded is what announces the menu as
    // collapsed or expanded.
    function setMenuOpen(open) {
        mainNav.classList.toggle('active', open);
        menuToggle.classList.toggle('active', open);
        menuToggle.setAttribute('aria-expanded', String(open));
    }

    setMenuOpen(mainNav.classList.contains('active'));

    // Toggle menu on click
    menuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        setMenuOpen(!mainNav.classList.contains('active'));
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!mainNav.contains(e.target) && !menuToggle.contains(e.target)) {
            setMenuOpen(false);
        }
    });

    // Without this the menu can only be dismissed with a mouse.
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mainNav.classList.contains('active')) {
            setMenuOpen(false);
            menuToggle.focus();
        }
    });
    
    // Handle submenu toggle
    const hasSubmenuItems = document.querySelectorAll('.has-submenu');
    hasSubmenuItems.forEach(item => {
        const link = item.querySelector('.nav-link');
        const submenu = item.querySelector('.submenu');
        
        link.setAttribute('aria-expanded', 'false');
        if (submenu && !submenu.id) {
            submenu.id = 'submenu-' + Math.random().toString(36).slice(2, 8);
        }
        if (submenu) {
            link.setAttribute('aria-controls', submenu.id);
        }

        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Close other submenus
            hasSubmenuItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('submenu-active');
                    const otherLink = otherItem.querySelector('.nav-link');
                    if (otherLink) {
                        otherLink.setAttribute('aria-expanded', 'false');
                    }
                }
            });

            // Toggle current submenu
            const open = item.classList.toggle('submenu-active');
            link.setAttribute('aria-expanded', String(open));
        });
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                document.querySelector(href).scrollIntoView({
                    behavior: 'smooth'
                });
                // Close menu after navigation
                mainNav.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });
    });
});

