# How to Create the .env File

## Step 1: Create the File
1. Open File Explorer
2. Navigate to: `D:\neuro\neurocare\backend`
3. Right-click in the empty space
4. Select "New" → "Text Document"
5. Name it exactly: `.env` (with the dot at the beginning)
6. If Windows asks about the extension, click "Yes"

## Step 2: Add Content
1. Right-click the `.env` file
2. Select "Open with" → "Notepad"
3. Copy and paste this exact content:

```
MONGODB_URI=mongodb://localhost:27017/neurocare
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=3002
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

4. Save the file

## Step 3: Restart Server
1. Open PowerShell
2. Navigate to: `D:\neuro\neurocare\backend`
3. Run: `npm run dev`

## Troubleshooting
- Make sure the file is named exactly `.env` (with the dot)
- Make sure it's in the correct folder
- Restart the server after creating the file