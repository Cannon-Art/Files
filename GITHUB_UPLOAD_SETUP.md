# GitHub Direct Upload Setup Guide

## Overview
The control panel now supports direct file uploads to GitHub! When you select an image file, it will be automatically uploaded to your GitHub repository and the URL will be generated for you.

## Initial Setup

### Step 1: Create a GitHub Personal Access Token

1. Go to [GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a descriptive name (e.g., "Cannon Art Gallery Upload")
4. Set expiration (recommended: 90 days or custom)
5. **Select the following scope:**
   - ✅ **`repo`** (Full control of private repositories) - This is required for uploading files
6. Click **"Generate token"**
7. **IMPORTANT:** Copy the token immediately - you won't be able to see it again!

### Step 2: Configure Token in Control Panel

1. Open the control panel: `https://cannon-art.github.io/Files/control-panel.html`
2. Login with your password
3. Scroll to the **"Settings"** section
4. Paste your GitHub token into the **"GitHub Personal Access Token"** field
5. Click **"Save Token"**
6. The token is now stored in your browser's localStorage (only on your device)

## How It Works

### Uploading Images

1. **Select Image File:** Click "Click to select image file" and choose your image
2. **Fill in Details:** Enter Picture Name, Section, Medium, etc.
3. **Click "Add Picture":**
   - The image is automatically uploaded to `Art_Examples/` folder on GitHub
   - The Image URL is auto-generated and filled in
   - The picture is added to `gallery-data.json` on GitHub
   - Everything happens automatically!

### File Naming

- Files are automatically named based on the "Picture Name" field
- Special characters are replaced with underscores
- Example: "My Art Piece" → `my_art_piece.jpg`
- The original file extension is preserved

### Automatic Updates

- When you edit a picture's details, `gallery-data.json` is automatically updated on GitHub
- When you delete a picture, `gallery-data.json` is automatically updated
- No need to manually copy/paste JSON anymore!

## Security Notes

- **Token Storage:** The token is stored in your browser's localStorage only (not in the code)
- **Token Scope:** The token only needs `repo` scope - it can read/write files in your repository
- **Token Security:** Never share your token or commit it to GitHub
- **Token Rotation:** You can regenerate tokens periodically for security

## Troubleshooting

### "GitHub token not configured"
- Make sure you've entered and saved your token in the Settings section
- Check that the token hasn't expired

### "Failed to upload file to GitHub"
- Verify your token has the `repo` scope
- Check that the token hasn't been revoked
- Ensure you have write access to the repository

### "Failed to update gallery-data.json"
- The image may have uploaded successfully, but the JSON update failed
- You can still copy the JSON manually and commit it
- Check your token permissions

### Images not appearing
- Wait a few seconds after upload - GitHub may need a moment to process
- Verify the image URL in the control panel matches the GitHub file path
- Check that the file was actually created in the `Art_Examples/` folder on GitHub

## Manual Fallback

If automatic uploads aren't working, you can still:
1. Manually upload images to GitHub
2. Copy the raw GitHub URL
3. Paste it into the Image URL field
4. Copy the JSON export and commit manually

## Token Management

- **View Status:** Check the Settings section to see if token is configured
- **Clear Token:** Click "Clear Token" to remove it (you'll need to re-enter it)
- **Update Token:** Enter a new token and click "Save Token" to replace the old one
