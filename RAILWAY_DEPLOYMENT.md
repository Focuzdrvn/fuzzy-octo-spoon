# Railway Deployment Guide - Backend

## 🚂 Deploy to Railway

### Step 1: Prepare Repository

1. Push your backend code to GitHub: https://github.com/Focuzdrvn/fuzzy-octo-spoon

```bash
cd backend
git init
git add .
git commit -m "Initial backend commit for Railway deployment"
git remote add origin https://github.com/Focuzdrvn/fuzzy-octo-spoon.git
git push -u origin main
```

### Step 2: Create Railway Project

1. Go to [Railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose `Focuzdrvn/fuzzy-octo-spoon`
6. Railway will auto-detect Node.js and deploy

### Step 3: Set Environment Variables

In Railway dashboard, go to your project → Variables tab and add these:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/ecell-voting?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRE=24h
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
FRONTEND_URL=https://upvote.focuzdrvn.tech
ADMIN_USERNAME=admin
ADMIN_PASSWORD=$2a$10$YourBcryptHashedPasswordHere
```

### Step 4: Generate Required Credentials

#### JWT Secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Admin Password Hash:

```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('YourSecurePassword123', 10))"
```

### Step 5: MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster (M0)
3. Create a database user
4. **IMPORTANT**: In Network Access, add `0.0.0.0/0` (allow all IPs) or Railway's IPs
5. Get connection string from "Connect" → "Connect your application"
6. Replace `<password>` with your database user password

### Step 6: Supabase Setup

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to Authentication → Providers → Google
4. Enable Google provider
5. Add authorized redirect URLs:
   - `https://YOUR_RAILWAY_URL/api/auth/google/callback`
   - `https://upvote.focuzdrvn.tech/auth/callback`
6. Copy Project URL and Anon Key to Railway variables

### Step 7: Cloudinary Setup

1. Go to [Cloudinary](https://cloudinary.com)
2. Sign up for free account
3. Go to Dashboard
4. Copy: Cloud Name, API Key, API Secret
5. Add to Railway variables

### Step 8: Get Your Railway URL

1. After deployment, Railway assigns a URL like: `https://fuzzy-octo-spoon-production.up.railway.app`
2. Copy this URL
3. You'll need it for frontend configuration

### Step 9: Configure Custom Domain (Optional)

1. In Railway project → Settings → Domains
2. Add custom domain if you want: `api.focuzdrvn.tech`
3. Update DNS records as shown

### Step 10: Test Deployment

```bash
# Health check
curl https://YOUR_RAILWAY_URL/health

# Expected response:
# {"success":true,"message":"E-Cell Voting API is running","timestamp":"..."}
```

## 🔧 Troubleshooting

### Deployment Fails

- Check Railway logs in the Deployments tab
- Verify all environment variables are set
- Ensure MongoDB Atlas allows Railway IPs

### Connection Errors

- Verify MongoDB connection string is correct
- Check MongoDB Atlas network access settings
- Ensure Railway URL is using HTTPS

### CORS Errors

- Verify FRONTEND_URL matches exactly: `https://upvote.focuzdrvn.tech`
- No trailing slash in the URL

## 📊 Monitoring

Railway provides:

- Real-time logs
- CPU and Memory metrics
- Deployment history
- Automatic restarts on failure

Access via: Project → Deployments → View Logs

## 🔄 Continuous Deployment

Railway automatically redeploys when you push to GitHub:

```bash
git add .
git commit -m "Update backend"
git push origin main
```

## ✅ Backend Deployment Complete!

Your backend is now live at: `https://YOUR_RAILWAY_URL`

Next: Deploy frontend to Vercel
