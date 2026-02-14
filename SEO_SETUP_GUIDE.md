# SEO Setup Guide for Cannon Art Gallery

This guide outlines the SEO optimizations that have been implemented and what needs to be updated when the site goes live with your actual domain.

## ✅ What Has Been Implemented

### 1. Meta Tags Added to All HTML Pages
All pages now include:
- **Primary Meta Tags**: title, description, keywords, author, robots
- **Cache-Control**: Prevents browser caching issues
- **Open Graph Tags**: For Facebook and social media sharing
- **Twitter Card Tags**: For Twitter sharing
- **Canonical URLs**: To prevent duplicate content issues
- **Google Search Console Verification**: Placeholder for verification code

**Pages Updated:**
- `index.html` - Home/Gallery main page
- `dc-characters.html` - DC Characters collection
- `marvel-characters.html` - Marvel Characters collection
- `music-legends.html` - Music Legends collection
- `recovery-art.html` - Recovery Art collection
- `miscellaneous.html` - Miscellaneous collection
- `terms-of-use.html` - Terms of Use page

### 2. Structured Data (JSON-LD)
Added Schema.org structured data to help Google understand your content:
- **CollectionPage** schema on all gallery pages
- **ItemList** schema for art collections
- **VisualArtwork** schema for individual artworks
- **Person** schema for artist information (on main page)

### 3. Sitemap Created
- `sitemap.xml` - Lists all pages with priorities and update frequencies
- Location: Root directory
- Current URL: `https://cannon-art.github.io/Files/`

### 4. Robots.txt Created
- `robots.txt` - Tells search engines how to crawl your site
- Location: Root directory
- Disallows `/Archive/` directory
- Points to sitemap location

---

## 🔧 Required Updates When Site Goes Live

### 1. Update Google Search Console Verification Code

**Current Status:** Placeholder code `YOUR_VERIFICATION_CODE_HERE` is in all HTML files.

**To Update:**
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property: `https://cannon-art.github.io/Files/`
3. Choose "HTML tag" verification method
4. Copy the verification code from the meta tag
5. Replace `YOUR_VERIFICATION_CODE_HERE` in all HTML files with your actual code

**Files to Update:**
- `index.html` (line ~16)
- `dc-characters.html` (line ~18)
- `marvel-characters.html` (line ~18)
- `music-legends.html` (line ~18)
- `recovery-art.html` (line ~18)
- `miscellaneous.html` (line ~18)
- `terms-of-use.html` (line ~11)

### 2. Update Last Modified Dates in Sitemap

In `sitemap.xml`, update the `<lastmod>` dates to the current date when going live (format: YYYY-MM-DD).

**Current dates:** 2025-01-27
**Action:** Update to current date when deploying

### 3. Add Social Media Profiles (Optional)

In the structured data, you can add social media profiles to the `sameAs` array:

**Example:**
```json
"sameAs": [
  "https://www.facebook.com/yourprofile",
  "https://twitter.com/yourprofile",
  "https://instagram.com/yourprofile"
]
```

Files to update: `index.html` (in the Structured Data section)

### 4. Add Google Analytics (Optional but Recommended)

Add this code before the closing `</head>` tag in all HTML files:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### 5. Submit to Google Search Console

Once your site is live:
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property: `https://cannon-art.github.io/Files/`
3. Verify ownership using the HTML tag method (code already in place)
4. Submit your `sitemap.xml` file: `https://cannon-art.github.io/Files/sitemap.xml`

### 6. Submit to Bing Webmaster Tools (Optional)

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Add your site: `https://cannon-art.github.io/Files/`
3. Submit your sitemap: `https://cannon-art.github.io/Files/sitemap.xml`

---

## 📊 SEO Features Implemented

### Meta Tags
- ✅ Descriptive titles for all pages
- ✅ Unique meta descriptions (150-160 characters)
- ✅ Relevant keywords
- ✅ Author attribution
- ✅ Canonical URLs
- ✅ Cache-Control headers
- ✅ Meta name="title" for consistency

### Open Graph (Facebook)
- ✅ og:type, og:url, og:title, og:description
- ✅ og:image for social sharing
- ✅ og:site_name

### Twitter Cards
- ✅ twitter:card set to "summary_large_image"
- ✅ twitter:title, twitter:description, twitter:image
- ✅ twitter:url

### Structured Data (Schema.org)
- ✅ CollectionPage schema
- ✅ ItemList schema
- ✅ VisualArtwork schema
- ✅ Person schema (on main page)

### Technical SEO
- ✅ Sitemap.xml
- ✅ Robots.txt
- ✅ Canonical URLs
- ✅ UTF-8 encoding
- ✅ Viewport meta tag for mobile
- ✅ Cache-Control meta tag

---

## 🎯 Next Steps

1. **Get Google Search Console verification code** and replace placeholder
2. **Update the `<lastmod>` dates** in sitemap.xml to current date
3. **Submit sitemap to Google Search Console**
4. **Monitor performance** using Google Search Console
5. **Consider adding Google Analytics** for detailed traffic insights

---

## 📝 Notes

- All images are currently hosted on GitHub (`https://raw.githubusercontent.com/Cannon-Art/Files/...`)
- The site is already mobile-friendly with the viewport meta tag
- Alt text has been added to images for better accessibility and SEO
- The site uses semantic HTML which helps with SEO
- Current domain: `https://cannon-art.github.io/Files/`
- If you get a custom domain, update all URLs in meta tags, sitemap.xml, and robots.txt

---

## 🔍 Testing Your SEO

After going live, test your implementation:

1. **Google Rich Results Test**: https://search.google.com/test/rich-results
   - Enter your URL to validate structured data

2. **Google Mobile-Friendly Test**: https://search.google.com/test/mobile-friendly
   - Ensure mobile usability

3. **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
   - Test Open Graph tags
   - Enter: `https://cannon-art.github.io/Files/`

4. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
   - Test Twitter Card tags

5. **Schema.org Validator**: https://validator.schema.org/
   - Validate structured data

6. **Google Search Console**: https://search.google.com/search-console
   - Monitor indexing status
   - Check for crawl errors
   - View search performance

---

## 📧 Questions?

If you need any adjustments or have questions about the SEO setup, refer to this guide or contact your developer.

---

**Last Updated:** December 2025


