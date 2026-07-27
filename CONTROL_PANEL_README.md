# Control Panel Usage Guide

## Overview
The Control Panel allows you to manage gallery images through a web interface. With a GitHub token configured, Add / Edit / Delete automatically update `gallery-data.json` and regenerate the gallery HTML pages.

## Site-specific Medium list (Cannon-Art vs PaulCasso)
The **Medium** dropdown options depend on the site:

- **Cannon-Art** (default): Watercolour, Acrylic, Pencil, Pen, Pen & Pencil, Mixed Media — no Oil.
- **PaulCasso**: Oil, Watercolour, Acrylic, Pencil, Mixed Media.

Set the site in `control-panel.html` with a meta tag in `<head>`:

- Cannon-Art: `<meta name="gallery-site" content="cannon-art">`
- PaulCasso: `<meta name="gallery-site" content="paulcasso">`

If the meta tag is omitted, the script treats the host as PaulCasso when `location.hostname` contains `paulcasso`; otherwise it uses Cannon-Art.

## Access
1. Navigate to the main gallery page
2. Click "Admin" in the menu (at the bottom)
3. Enter the password to access the control panel

## Admin password (device-local) — chosen approach for now

There is **no email “forgot password”** service: the admin password is **only enforced in the browser**.

- **Custom password:** After you change it in the panel, a **SHA-256 hash** of that password is kept in this browser’s **localStorage** (with a **cookie mirror** to survive some partial “clear data” actions). It is **not** synced to other computers or other browsers.
- **Stay logged in:** A separate **session** value can skip the login screen on return visits until site data is cleared or the password no longer matches.
- **Security note:** Anyone who can use this browser profile can open Admin. For stronger protection later, consider moving to **GitHub sign-in** or a hosted auth provider.

### Initial (default) password

If you have **never** set a custom password in the panel (or you cleared all site data and the browser no longer has your custom hash), the site falls back to the **built-in default**.

**Default login password (type exactly):** `&Can1989non`

You can confirm this matches the shipped code by opening `control-panel.js` and reading the comment on the same line as `DEFAULT_PASSWORD_HASH`.

### Changing the password (normal case)

Use the control panel after login: when the site still uses the default, you may be prompted to set a new password; otherwise change it from the panel flow you already use. You do **not** need to edit `control-panel.js` by hand for day-to-day password changes.

### Documented recovery (if you forget the custom password)

1. **Try the built-in default** from the `DEFAULT_PASSWORD_HASH` comment in `control-panel.js` (only works if no custom hash is stored in that browser, e.g. after a full clear of site data for this origin).
2. **On a browser or device that never had the custom password saved**, the default still applies — log in there, then set a new password in the panel.
3. **Optional break-glass (repo owner):** Ship a new default by replacing `DEFAULT_PASSWORD_HASH` in `control-panel.js` with the SHA-256 of a new initial password (e.g. from https://emn178.github.io/online-tools/sha256.html), commit, and tell operators the new initial secret out of band.

Later you can adopt **GitHub-based admin** or a hosted IdP without changing how gallery data works.

## Adding a New Picture

1. **Upload Image to GitHub:**
   - Upload your image file to: `https://github.com/Cannon-Art/Files/tree/main/Art_Examples`
   - Copy the raw GitHub URL (format: `https://raw.githubusercontent.com/Cannon-Art/Files/main/Art_Examples/YourImage.jpg`)

2. **Fill in the Form:**
   - **Picture Name** (required): The title of the artwork
   - **Section** (required): Choose which gallery section
   - **Medium** (required): Options depend on site (see **Site-specific Medium list** above)
   - **Image URL** (required): Paste the GitHub raw URL from step 1
   - **Year** (optional): Year the artwork was created
   - **Notes** (optional): Description or story about the artwork (supports spell-checking)

3. **Click "Add Picture"**
   - The picture is added to the data
   - With a GitHub token configured, `gallery-data.json` and gallery HTML pages are updated automatically

## Editing Existing Pictures

1. Scroll to the "Edit Existing Pictures" section
2. Use the section tabs to filter by gallery section
3. Edit any field directly:
   - Picture Name
   - Image URL
   - Medium (dropdown)
   - Year
   - Notes (textarea with spell-checking)
4. Changes save automatically as you type (JSON + HTML to GitHub when a token is configured)
5. Click "Delete" to remove a picture (with confirmation); delete also updates JSON + HTML on GitHub

## How changes are published

Add, Edit, and Delete all sync automatically when a GitHub token is configured via **Save Token**:

1. `gallery-data.json` is updated on GitHub
2. Gallery HTML pages are regenerated and saved:
   - `dc-characters.html`
   - `marvel-characters.html`
   - `music-legends.html`
   - `recovery-art.html`
   - `miscellaneous.html`

There is no separate “export JSON” or “regenerate HTML” step for normal admin use.

**What's Included in generated pages:**
- All SEO meta tags and structured data
- Proper navigation and header/footer
- Gallery grid with all images from JSON
- Notes expansion/collapse functionality
- Full-size image viewer modals
- All security scripts (protection.js, canvas-protection.js)

## Important Notes

- **Image Upload:** You can now upload images directly from the control panel if you have a GitHub Personal Access Token configured. Otherwise, manually upload to GitHub and provide the URL.

- **Session security:** The password check is client-side only (device-local). Treat recovery as operational (see **Admin password** above), or add server-side auth when you are ready.

## Data Structure

The `gallery-data.json` file structure:
```json
{
  "sections": {
    "dc-characters": [
      {
        "id": "dc-001",
        "name": "Picture Name",
        "imageUrl": "https://...",
        "medium": "Mixed Media",
        "notes": "Optional notes",
        "year": "2026"
      }
    ],
    "marvel-characters": [...],
    "music-legends": [...],
    "recovery-art": [...],
    "miscellaneous": [...]
  }
}
```

## Troubleshooting

- **Can't load gallery data:** Ensure `gallery-data.json` exists in the repository root
- **Password not working:** Use the password that matches what is stored **in this browser** (custom), or the **default** from the `DEFAULT_PASSWORD_HASH` comment in `control-panel.js` if no custom hash remains. Custom passwords are not stored in the repo.
- **Images not displaying:** Verify the GitHub raw URL is correct and the image file exists
- **Changes not saving:** Ensure a GitHub token is configured via **Save Token**, then retry Add / Edit / Delete
