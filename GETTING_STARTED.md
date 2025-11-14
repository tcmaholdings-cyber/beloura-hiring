# Getting Started with Deployment

## Current Status ✅

All deployment files have been created and the database is online. You're ready to deploy!

## Quick Deployment Steps

### Prerequisites
- Push your code to a GitHub repository (required for Digital Ocean App Platform)
- Ensure you have the Digital Ocean API key authenticated

### Step 1: Push to GitHub

```bash
cd /Users/michaelaston/Documents/beloura-hiring

# Initialize git if not already done
git init
git add .
git commit -m "Initial commit with deployment configuration"

# Add your GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/beloura-hiring.git
git push -u origin main
```

### Step 2: Create App on Digital Ocean

**Option A: Using doctl CLI**
```bash
# Update .do/app.yaml with your GitHub repo details
# Then create the app
doctl apps create --spec .do/app.yaml
```

**Option B: Using Digital Ocean Dashboard (Easier)**
1. Go to https://cloud.digitalocean.com/apps
2. Click "Create App"
3. Select "GitHub" as source
4. Choose your repository: `beloura-hiring`
5. Select branch: `main`
6. Digital Ocean will auto-detect the Dockerfiles

### Step 3: Configure Environment Variables

In the Digital Ocean App Platform dashboard:

**Backend Service Environment Variables:**
- `DATABASE_URL` (secret): `postgresql://doadmin:<PASSWORD>@beloura-hiring-db-do-user-27680736-0.l.db.ondigitalocean.com:25060/defaultdb?sslmode=require`
- `JWT_SECRET` (secret): `<GENERATE_RANDOM_SECRET>`
- `JWT_REFRESH_SECRET` (secret): `<GENERATE_RANDOM_SECRET>`
- `NODE_ENV`: `production`
- `PORT`: `3001`
- `CORS_ORIGIN`: (will be auto-filled after frontend is deployed)

**Frontend Service Environment Variables:**
- `VITE_API_URL`: `https://your-app-name.ondigitalocean.app/api`

### Step 4: Deploy

Click "Deploy" in the Digital Ocean dashboard. The platform will:
1. Build your Docker images
2. Run database migrations (automatic in backend Dockerfile)
3. Deploy both frontend and backend
4. Assign a public URL

### Step 5: Create Admin User

After deployment, create your first admin user:

```bash
curl -X POST https://your-app-name.ondigitalocean.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@beloura.com",
    "password": "YourSecurePassword123!",
    "name": "Admin User"
  }'
```

Then update the user role to `chatting_managers` in the database or via admin panel.

### Step 6: Access Your Application

Frontend: `https://your-app-name.ondigitalocean.app`
Backend API: `https://your-app-name.ondigitalocean.app/api`

## Files Ready for Deployment

✅ Backend Dockerfile (`backend/Dockerfile`)
✅ Frontend Dockerfile (`frontend/Dockerfile`)
✅ Nginx configuration (`frontend/nginx.conf`)
✅ Environment templates (`.env.production.example`)
✅ Database migrations (`backend/prisma/migrations/`)
✅ App specification (`.do/app.yaml`)
✅ Deployment documentation (`DEPLOYMENT.md`)

## Database Details

- **Name:** beloura-hiring-db
- **Status:** Online ✅
- **Engine:** PostgreSQL 18
- **Region:** NYC3
- **ID:** f95927ae-ec6a-45af-9dbd-ffbe9d3ad169

## Need Help?

See `DEPLOYMENT.md` for detailed documentation and troubleshooting.

## Estimated Monthly Cost

- Database: $15
- Backend: $5
- Frontend: $5
**Total: ~$25/month**

---

**Next Action:** Push your code to GitHub and create the app in Digital Ocean App Platform!
