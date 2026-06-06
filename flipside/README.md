# Flipside — Deployment Instructions

## Deploy to Vercel (5 minutes)

### Step 1 — Get your Anthropic API key
1. Go to console.anthropic.com
2. Click "API Keys" in the left sidebar
3. Click "Create Key", name it "flipside", copy it

### Step 2 — Upload to Vercel
1. Go to vercel.com and log in
2. Click "Add New Project"
3. Click "Upload" (you don't need GitHub for this)
4. Drag and drop the entire `flipside` folder, or zip it and upload the zip
5. Click "Deploy"

### Step 3 — Add your API key
1. Once deployed, go to your project in Vercel
2. Click "Settings" → "Environment Variables"
3. Add a new variable:
   - Name: ANTHROPIC_API_KEY
   - Value: (paste your key from Step 1)
4. Click "Save"
5. Go to "Deployments" and click "Redeploy" on the latest deployment

### Step 4 — Add to your phone home screen
1. Open your Vercel URL in Safari (iPhone) or Chrome (Android)
2. iPhone: tap the Share button → "Add to Home Screen"
3. Android: tap the three dots → "Add to Home Screen"

That's it — Flipside is live!
