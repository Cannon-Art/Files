# Control Panel Password Setup

## Current Status
⚠️ **The default password "password" is still active and needs to be changed!**

## How to Change the Password

### Step 1: Choose a Strong Password
Create a secure password that:
- Is at least 12 characters long
- Contains uppercase and lowercase letters
- Contains numbers
- Contains special characters (!@#$%^&*)
- Is NOT a dictionary word or personal information

**Example strong passwords:**
- `C@nn0nArt2026!Gallery`
- `ArtM@n@g3m3nt!2026`
- `G@ll3ry@dm1n#Secure`

### Step 2: Generate the SHA-256 Hash

1. Go to: https://emn178.github.io/online-tools/sha256.html
2. Enter your new password in the input field
3. Copy the generated hash (it will be a long string of letters and numbers)

### Step 3: Update the Code

1. Open `control-panel.js` in your editor
2. Find the line that says:
   ```javascript
   const PASSWORD_HASH = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8';
   ```
3. Replace the hash value with your new hash
4. Save the file
5. Commit and push to GitHub:
   ```bash
   git add control-panel.js
   git commit -m "Update control panel password"
   git push origin main
   ```

### Step 4: Test

1. Wait 1-2 minutes for GitHub Pages to update
2. Go to: https://cannon-art.github.io/Files/control-panel.html
3. Try logging in with your new password
4. If it works, delete this file (PASSWORD_SETUP.md) for security

## Security Notes

- **Never commit the actual password** - only the hash
- **Never share the password** with unauthorized users
- **Change the password periodically** (every 90 days recommended)
- **Use a password manager** to store the password securely

## Quick Reference

- **File to edit:** `control-panel.js`
- **Line to change:** Line 14 (PASSWORD_HASH constant)
- **Hash generator:** https://emn178.github.io/online-tools/sha256.html
