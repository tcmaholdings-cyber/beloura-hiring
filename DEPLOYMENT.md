# Beloura Hiring - Deployment Guide

## Digital Ocean Deployment

This guide covers deploying the Beloura Hiring application to Digital Ocean.

### Prerequisites

- Digital Ocean account
- `doctl` CLI installed and authenticated
- Git repository pushed to GitHub

### Database Setup

The PostgreSQL database `beloura-hiring-db` has been created in the NYC3 region.

**Connection Details:**
- Host: `beloura-hiring-db-do-user-27680736-0.l.db.ondigitalocean.com`
- Port: `25060`
- Database: `defaultdb`
- User: `doadmin`
- SSL Mode: `require`

### Environment Variables

#### Backend (.env.production)
```bash
DATABASE_URL=postgresql://doadmin:<PASSWORD>@beloura-hiring-db-do-user-27680736-0.l.db.ondigitalocean.com:25060/defaultdb?sslmode=require
NODE_ENV=production
PORT=3001
JWT_SECRET=<GENERATE_RANDOM_SECRET>
JWT_REFRESH_SECRET=<GENERATE_RANDOM_SECRET>
CORS_ORIGIN=https://beloura-hiring.ondigitalocean.app
```

#### Frontend (.env.production)
```bash
VITE_API_URL=https://beloura-hiring.ondigitalocean.app/api
```

### Deployment Options

#### Option 1: Digital Ocean App Platform (Recommended)

1. **Create App from Spec:**
   ```bash
   doctl apps create --spec .do/app.yaml
   ```

2. **Configure Secrets:**
   After app creation, add secrets via Digital Ocean dashboard:
   - Navigate to App Settings → Environment Variables
   - Add `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET` as encrypted secrets

3. **Deploy:**
   The app will automatically deploy on push to the main branch.

#### Option 2: Docker Deployment

1. **Build Images:**
   ```bash
   ./scripts/deploy.sh
   ```

2. **Push to Container Registry:**
   ```bash
   docker tag beloura-hiring-backend:latest registry.digitalocean.com/your-registry/backend:latest
   docker push registry.digitalocean.com/your-registry/backend:latest

   docker tag beloura-hiring-frontend:latest registry.digitalocean.com/your-registry/frontend:latest
   docker push registry.digitalocean.com/your-registry/frontend:latest
   ```

3. **Deploy to App Platform using container images**

### Database Migration

The backend Dockerfile includes automatic migration on startup:
```bash
npx prisma migrate deploy
```

Or manually run migrations:
```bash
# Connect to database
DATABASE_URL="postgresql://doadmin:PASSWORD@HOST:25060/defaultdb?sslmode=require" npx prisma migrate deploy
```

### Post-Deployment

1. **Verify Backend Health:**
   ```bash
   curl https://beloura-hiring.ondigitalocean.app/api/health
   ```

2. **Test Frontend:**
   Open browser to `https://beloura-hiring.ondigitalocean.app`

3. **Create Admin User:**
   Use the `/api/v1/auth/register` endpoint or connect to database directly.

### Monitoring

- **Logs:** `doctl apps logs <app-id>`
- **App Details:** `doctl apps get <app-id>`
- **Database Metrics:** Digital Ocean Dashboard → Databases

### Troubleshooting

**Database Connection Issues:**
- Verify database is in "online" status
- Check SSL mode is set to `require`
- Ensure trusted sources include App Platform

**Build Failures:**
- Check Docker build logs
- Verify all dependencies in package.json
- Ensure Prisma schema is valid

**CORS Errors:**
- Update `CORS_ORIGIN` environment variable
- Verify frontend URL matches backend CORS settings

### Scaling

Current configuration uses `basic-xxs` instances. To scale:

1. Update instance size in `.do/app.yaml`
2. Increase instance count for high availability
3. Consider database read replicas for heavy loads

### Security Notes

- JWT secrets are randomly generated and should never be committed to Git
- Database credentials are provided via environment variables
- All connections use SSL/TLS
- Implement rate limiting in production (consider adding middleware)

### Cost Estimates

- Database (db-s-1vcpu-1gb): ~$15/month
- Backend App (basic-xxs): ~$5/month
- Frontend App (basic-xxs): ~$5/month
- **Total: ~$25/month**

### Support

For issues, check:
- Digital Ocean App Platform docs: https://docs.digitalocean.com/products/app-platform/
- Application logs via `doctl apps logs`
- Database connection pooler settings
