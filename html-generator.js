/**
 * HTML Generator for Gallery Pages
 * Generates HTML files from gallery-data.json
 */

// Section metadata - titles, descriptions, etc.
const SECTION_METADATA = {
    'dc-characters': {
        title: 'DC Characters Collection - Batman & Joker Art | Cannon Art',
        heroTitle: 'DC Characters',
        heroSubtitle: 'Batman, The Joker, and the heroes and villains of the DC Universe',
        description: [
            'This collection explores the iconic characters of the DC Universe, focusing on the eternal struggle between Batman and The Joker. Each piece captures the duality of heroism and villainy that defines these legendary characters.',
            'The artworks blend traditional comic book aesthetics with contemporary artistic techniques, creating a unique visual narrative that honors the legacy of DC\'s most beloved characters.'
        ],
        keywords: 'DC characters, Batman art, Joker art, DC Universe, comic book art, superhero art, villain art, Batman vs Joker, Heath Ledger Joker, contemporary art, mixed media',
        ogDescription: 'Explore Cannon DC Characters collection featuring Batman, The Joker, and iconic DC Universe heroes and villains.'
    },
    'marvel-characters': {
        title: 'Marvel Characters Collection - Superhero Art | Cannon Art',
        heroTitle: 'Marvel Characters',
        heroSubtitle: 'Heroes and villains from the Marvel Universe',
        description: [
            'This collection will feature iconic characters from the Marvel Universe. Stay tuned for new artwork celebrating the heroes and villains that have captivated audiences for generations.'
        ],
        keywords: 'Marvel characters, superhero art, X-Men, Avengers, comic book art, Marvel Universe, contemporary art, mixed media',
        ogDescription: 'Explore Cannon Marvel Characters collection featuring iconic heroes and villains from the Marvel Universe.'
    },
    'music-legends': {
        title: 'Music Legends Collection - Rock & Roll Art | Cannon Art',
        heroTitle: 'Music Legends',
        heroSubtitle: 'Celebrating the icons of rock and roll history',
        description: [
            'This collection pays tribute to the legendary rock bands that defined generations. From The Rolling Stones\' timeless rock and roll energy to The Who\'s pioneering rock opera innovations, each piece captures the spirit and influence of these musical icons.',
            'The mixed media artworks blend contemporary techniques with the raw energy of rock music, creating visual tributes that honor their legendary status and enduring appeal across generations.'
        ],
        keywords: 'music legends, rock and roll art, The Rolling Stones, The Who, music art, contemporary art, mixed media, rock music',
        ogDescription: 'Explore Cannon Music Legends collection celebrating iconic rock and roll bands and musicians.'
    },
    'recovery-art': {
        title: 'Recovery Art Collection - Hope & Transformation | Cannon Art',
        heroTitle: 'Recovery Art',
        heroSubtitle: 'Artwork inspired by themes of recovery, hope, and personal transformation',
        description: [
            'This collection will feature artwork inspired by themes of recovery, hope, and personal transformation. Each piece will explore the journey of healing and the power of resilience.'
        ],
        keywords: 'recovery art, addiction recovery, hope, transformation, healing art, contemporary art, mixed media, personal growth',
        ogDescription: 'Explore Cannon Recovery Art collection featuring artwork inspired by themes of recovery, hope, and personal transformation.'
    },
    'miscellaneous': {
        title: 'Miscellaneous Collection - Diverse Creative Expressions | Cannon Art',
        heroTitle: 'Miscellaneous',
        heroSubtitle: 'A diverse collection of creative expressions',
        description: [
            'This collection features a diverse range of creative expressions that don\'t fit into a single category. Each piece represents a unique artistic vision and creative exploration.'
        ],
        keywords: 'miscellaneous art, diverse art, creative expressions, contemporary art, mixed media, unique artwork',
        ogDescription: 'Explore Cannon Miscellaneous collection featuring diverse creative expressions and unique artwork.'
    }
};

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Convert newlines to <br> tags for HTML display
 */
function nl2br(text) {
    if (!text) return '';
    return text.replace(/\n/g, '<br><br>');
}

/**
 * Generate preview text from full notes (first 150 characters)
 */
function getPreviewText(text) {
    if (!text) return '';
    const preview = text.substring(0, 150);
    return preview + (text.length > 150 ? '...' : '');
}

/**
 * Generate gallery item HTML for a single picture
 */
function generateGalleryItem(picture) {
    const hasNotes = picture.notes && picture.notes.trim().length > 0;
    const previewText = hasNotes ? getPreviewText(picture.notes) : '';
    const fullNotes = hasNotes ? nl2br(escapeHtml(picture.notes)) : '';
    const yearDisplay = picture.year ? ` (${picture.year})` : '';
    
    let html = `
                    <div class="gallery-item">
                        <div class="gallery-image-container">
                            <img src="${escapeHtml(picture.imageUrl)}" alt="${escapeHtml(picture.name)}" class="gallery-image">
                            <div class="gallery-overlay">
                                <button class="view-btn">View Full Size</button>
                            </div>
                        </div>
                        <div class="gallery-info">
                            <h3 class="gallery-title">${escapeHtml(picture.name)}${yearDisplay}</h3>
                            <p class="gallery-medium">${escapeHtml(picture.medium)}</p>
                        </div>`;
    
    if (hasNotes) {
        html += `
                        <div class="gallery-notes">
                            <div class="notes-preview">
                                <p class="notes-text-preview">${escapeHtml(previewText)}</p>
                                <button class="expand-notes-btn">... read more</button>
                            </div>
                            <div class="notes-full" style="display: none;">
                                <p class="notes-text-full">${fullNotes}</p>
                                <button class="collapse-notes-btn">... read less</button>
                            </div>
                        </div>`;
    }
    
    html += `
                    </div>`;
    
    return html;
}

/**
 * Generate the complete HTML for a gallery section
 */
function generateGalleryHTML(sectionId, pictures, metadata) {
    const fileName = `${sectionId}.html`;
    const url = `https://cannon-art.github.io/Files/${fileName}`;
    const imageUrl = pictures.length > 0 ? pictures[0].imageUrl : 'https://raw.githubusercontent.com/Cannon-Art/Files/CannonArt-patch-1/OIP.jpg';
    
    // Generate gallery items HTML
    let galleryItemsHTML = '';
    if (pictures.length === 0) {
        galleryItemsHTML = `
                    <div class="empty-gallery">
                        <p class="empty-message">New artwork coming soon...</p>
                    </div>`;
    } else {
        pictures.forEach(picture => {
            galleryItemsHTML += generateGalleryItem(picture);
        });
    }
    
    // Generate description HTML
    let descriptionHTML = '';
    metadata.description.forEach(para => {
        descriptionHTML += `                    <p>${escapeHtml(para)}</p>\n`;
    });
    
    // Generate structured data JSON-LD
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": `${metadata.heroTitle} Collection - Cannon Art`,
        "description": metadata.ogDescription,
        "url": url,
        "mainEntity": {
            "@type": "ItemList",
            "itemListElement": pictures.map((pic, index) => ({
                "@type": "VisualArtwork",
                "position": index + 1,
                "name": pic.name,
                "image": pic.imageUrl,
                "creator": {
                    "@type": "Person",
                    "name": "Cannon Art"
                },
                "artMedium": pic.medium,
                "copyrightYear": pic.year || new Date().getFullYear()
            }))
        }
    };
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    
    <!-- Primary Meta Tags -->
    <title>${escapeHtml(metadata.title)}</title>
    <meta name="title" content="${escapeHtml(metadata.title)}">
    <meta name="description" content="${escapeHtml(metadata.ogDescription)}">
    <meta name="keywords" content="${escapeHtml(metadata.keywords)}">
    <meta name="author" content="Cannon Art">
    <meta name="robots" content="index, follow">
    <meta name="language" content="English">
    
    <!-- Google Search Console Verification -->
    <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE_HERE" />
    
    <link rel="canonical" href="${url}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${escapeHtml(metadata.title)}">
    <meta property="og:description" content="${escapeHtml(metadata.ogDescription)}">
    <meta property="og:image" content="${escapeHtml(imageUrl)}">
    <meta property="og:site_name" content="Cannon Art">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${url}">
    <meta property="twitter:title" content="${escapeHtml(metadata.title)}">
    <meta property="twitter:description" content="${escapeHtml(metadata.ogDescription)}">
    <meta property="twitter:image" content="${escapeHtml(imageUrl)}">
    
    <!-- Structured Data (JSON-LD) -->
    <script type="application/ld+json">
    ${JSON.stringify(structuredData, null, 4)}
    </script>
    
    <link href="https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css?v=8">
    <link rel="stylesheet" href="gallery-styles.css?v=12">
</head>
<body>
    <header class="header">
        <div class="container header-container">
            <h1 class="logo">Cannon Art</h1>
            <button class="menu-toggle" id="menuToggle">Menu</button>
            <nav class="nav" id="mainNav">
                <div class="nav-item">
                    <a href="index.html" class="nav-link">Home</a>
                </div>
                <div class="nav-item has-submenu">
                    <a href="#" class="nav-link">Gallery</a>
                    <div class="submenu">
                        <a href="dc-characters.html" class="submenu-link${sectionId === 'dc-characters' ? ' active' : ''}">DC Characters</a>
                        <a href="marvel-characters.html" class="submenu-link${sectionId === 'marvel-characters' ? ' active' : ''}">Marvel Characters</a>
                        <a href="music-legends.html" class="submenu-link${sectionId === 'music-legends' ? ' active' : ''}">Music Legends</a>
                        <a href="recovery-art.html" class="submenu-link${sectionId === 'recovery-art' ? ' active' : ''}">Recovery Art</a>
                        <a href="miscellaneous.html" class="submenu-link${sectionId === 'miscellaneous' ? ' active' : ''}">Miscellaneous</a>
                    </div>
                </div>
                <div class="nav-item">
                    <a href="index.html#about" class="nav-link">About the Artist</a>
                </div>
                <div class="nav-item">
                    <a href="index.html#contact" class="nav-link">Contact Me</a>
                </div>
            </nav>
        </div>
    </header>

    <main class="main">
        <section class="hero">
            <div class="container">
                <h2 class="hero-title">${escapeHtml(metadata.heroTitle)}</h2>
                <p class="hero-subtitle">${escapeHtml(metadata.heroSubtitle)}</p>
            </div>
        </section>

        <section class="gallery">
            <div class="container">
                <h2 class="section-title">The Collection</h2>
                <div class="gallery-grid">
${galleryItemsHTML}
                </div>
            </div>
        </section>

        <section class="collection-description">
            <div class="container">
                <h2 class="section-title">About This Collection</h2>
                <div class="description-content">
${descriptionHTML.trim()}
                </div>
            </div>
        </section>

        <section class="copyright-notice">
            <div class="container">
                <p>All artwork is protected by copyright. Unauthorized reproduction or distribution is prohibited.</p>
                <p>For licensing inquiries: <a href="mailto:CannonNo1@iCloud.com">CannonNo1@iCloud.com</a></p>
            </div>
        </section>
    </main>

    <footer class="footer">
        <div class="container footer-content">
            <p class="footer-left">&copy; <span class="copyright-year">2026</span> Cannon Art | All Rights Reserved | <a href="terms-of-use.html" style="color: #00BFFF; font-weight: 600; text-decoration: underline; font-family: 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;">Terms of Use</a></p>
            <p class="footer-right" style="font-family: 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif; color: #fff;">| A v I d Digital |</p>
        </div>
    </footer>

    <script src="menu-script.js"></script>
    <script>
        // Auto-update copyright year
        document.querySelectorAll('.copyright-year').forEach(el => {
            el.textContent = new Date().getFullYear();
        });
    </script>
    <script src="protection.js"></script>
    <script src="canvas-protection.js"></script>
    <script>
        // Full size image viewer - handles both img and canvas elements
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const imageElement = this.closest('.gallery-item').querySelector('.gallery-image');
                const modal = document.createElement('div');
                modal.className = 'image-modal';
                
                let imageSrc;
                let imageAlt;
                
                // Check if it's a canvas (from canvas protection) or an img
                if (imageElement.tagName === 'CANVAS') {
                    // Use original source stored in data attribute (avoids CORS issues)
                    imageSrc = imageElement.dataset.originalSrc || imageElement.toDataURL('image/png');
                    imageAlt = imageElement.alt || imageElement.getAttribute('alt') || 'Artwork';
                } else {
                    // Regular img element
                    imageSrc = imageElement.src;
                    imageAlt = imageElement.alt || 'Artwork';
                }
                
                modal.innerHTML = \`
                    <button class="back-modal">Back</button>
                    <div class="modal-content">
                        <div class="modal-image-container">
                            <img src="\${imageSrc}" alt="\${imageAlt}" class="modal-image">
                        </div>
                    </div>
                \`;
                document.body.appendChild(modal);
                
                // Back button
                modal.querySelector('.back-modal').addEventListener('click', () => {
                    document.body.removeChild(modal);
                });
                
                // Close on background click
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        document.body.removeChild(modal);
                    }
                });
            });
        });

        // Expand/collapse notes functionality
        document.querySelectorAll('.expand-notes-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const notesPreview = this.closest('.gallery-notes').querySelector('.notes-preview');
                const notesFull = this.closest('.gallery-notes').querySelector('.notes-full');
                notesPreview.style.display = 'none';
                notesFull.style.display = 'block';
            });
        });

        document.querySelectorAll('.collapse-notes-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const notesPreview = this.closest('.gallery-notes').querySelector('.notes-preview');
                const notesFull = this.closest('.gallery-notes').querySelector('.notes-full');
                notesPreview.style.display = 'block';
                notesFull.style.display = 'none';
            });
        });
    </script>
</body>
</html>`;

    return html;
}

/**
 * Generate all gallery HTML files from gallery data
 */
function generateAllGalleryHTMLs(galleryData) {
    const results = {};
    
    Object.keys(galleryData.sections).forEach(sectionId => {
        const pictures = galleryData.sections[sectionId] || [];
        const metadata = SECTION_METADATA[sectionId];
        
        if (!metadata) {
            console.warn(`No metadata found for section: ${sectionId}`);
            return;
        }
        
        results[sectionId] = {
            filename: `${sectionId}.html`,
            html: generateGalleryHTML(sectionId, pictures, metadata)
        };
    });
    
    return results;
}

// Export for use in control panel (browser and Node.js)
if (typeof window !== 'undefined') {
    // Browser: expose globally
    window.generateGalleryHTML = generateGalleryHTML;
    window.generateAllGalleryHTMLs = generateAllGalleryHTMLs;
    window.SECTION_METADATA = SECTION_METADATA;
}

if (typeof module !== 'undefined' && module.exports) {
    // Node.js: export as module
    module.exports = {
        generateGalleryHTML,
        generateAllGalleryHTMLs,
        SECTION_METADATA
    };
}
