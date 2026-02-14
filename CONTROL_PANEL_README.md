# Control Panel Usage Guide

## Overview
The Control Panel allows you to manage gallery images through a web interface. All changes are exported as JSON that you commit to GitHub.

## Access
1. Navigate to the main gallery page
2. Click "Admin" in the menu (at the bottom)
3. Enter the password to access the control panel

## Default Password
The default password is: `password`

**To change the password:**
1. Open `control-panel.js`
2. Find the line: `const PASSWORD_HASH = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8';`
3. Go to https://emn178.github.io/online-tools/sha256.html
4. Enter your new password
5. Copy the generated SHA-256 hash
6. Replace the hash value in `control-panel.js`
7. Commit the change to GitHub

## Adding a New Picture

1. **Upload Image to GitHub:**
   - Upload your image file to: `https://github.com/Cannon-Art/Files/tree/main/Art_Examples`
   - Copy the raw GitHub URL (format: `https://raw.githubusercontent.com/Cannon-Art/Files/main/Art_Examples/YourImage.jpg`)

2. **Fill in the Form:**
   - **Picture Name** (required): The title of the artwork
   - **Section** (required): Choose which gallery section
   - **Medium** (required): Select from Oil, Watercolour, Acrylic, Pencil, or Mixed Media
   - **Image URL** (required): Paste the GitHub raw URL from step 1
   - **Year** (optional): Year the artwork was created
   - **Notes** (optional): Description or story about the artwork (supports spell-checking)

3. **Click "Add Picture"**
   - The picture is added to the data
   - The JSON export updates automatically

## Editing Existing Pictures

1. Scroll to the "Edit Existing Pictures" section
2. Use the section tabs to filter by gallery section
3. Edit any field directly:
   - Picture Name
   - Image URL
   - Medium (dropdown)
   - Year
   - Notes (textarea with spell-checking)
4. Changes save automatically as you type
5. Click "Delete" to remove a picture (with confirmation)

## Exporting and Committing Changes

1. Scroll to the "Export JSON Data" section
2. The JSON is automatically updated as you make changes
3. Click "Copy JSON to Clipboard"
4. Open `gallery-data.json` in your repository
5. Paste the copied JSON (replace entire file)
6. Commit and push to GitHub

## Important Notes

- **No Automatic HTML Generation:** The control panel manages the JSON data only. You'll need to either:
  - Manually update the HTML gallery pages, OR
  - Create a script to generate HTML from the JSON (future enhancement)

- **Image Upload:** The file picker in the control panel is for reference only. You must manually upload images to GitHub and provide the URL.

- **Session Security:** The password check is client-side only. For production, consider additional security measures if needed.

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
- **Password not working:** Check that you're using the correct hash in `control-panel.js`
- **Images not displaying:** Verify the GitHub raw URL is correct and the image file exists
- **Changes not saving:** Make sure to copy the JSON and commit it to GitHub
