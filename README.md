# BELOURA HIRING

Full-stack recruitment pipeline management system with role-based access control.

## Features

- **Candidate Management** - Track candidates through hiring stages
- **Source Tracking** - Monitor recruitment sources and analytics
- **Referrer Management** - Manage employee referrals and external referrers
- **User Management** - Role-based access control (Sourcer, Interviewer, Chatting Managers)
- **Authentication** - Secure JWT-based authentication with refresh tokens
- **Dashboard** - Real-time analytics and statistics

## Tech Stack

### Backend
- Node.js + Express + TypeScript
- PostgreSQL with Prisma ORM
- JWT authentication
- RESTful API architecture

### Frontend
- React + TypeScript + Vite
- TanStack Query for state management
- React Router for navigation
- Tailwind CSS for styling

## Quick Start

### Local Development

```bash
# Setup (first time only)
./scripts/setup-local.sh

# Daily development
cd docker && docker-compose up -d
cd backend && npm run dev    # Terminal 1
cd frontend && npm run dev   # Terminal 2
```

### Access Points (Local)

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- pgAdmin: http://localhost:5050
- Prisma Studio: `cd backend && npx prisma studio`

## Deployment

### 🚀 Ready for Production!

All deployment files are configured and the database is ready. See deployment guides:

- **Quick Start:** [GETTING_STARTED.md](GETTING_STARTED.md)
- **Complete Guide:** [DEPLOYMENT.md](DEPLOYMENT.md)
- **Progress Summary:** [PHASE_1_PROGRESS.md](PHASE_1_PROGRESS.md)
- **Build Details:** [BUILD_COMPLETE.md](BUILD_COMPLETE.md)

### Deployment Checklist ✅

- ✅ PostgreSQL database created (beloura-hiring-db) - **ONLINE**
- ✅ Backend Dockerfile configured
- ✅ Frontend Dockerfile with Nginx
- ✅ Environment variables configured
- ✅ JWT secrets generated
- ✅ Digital Ocean App Spec ready
- ✅ Database migrations automated

### Next Steps

1. Push code to GitHub
2. Deploy via Digital Ocean App Platform
3. Configure secrets in dashboard
4. Create admin user

See [GETTING_STARTED.md](GETTING_STARTED.md) for step-by-step instructions.

## Documentation

- [System Design](../beloura-hiring-design.md)
- [Local Setup](../beloura-hiring-local-setup.md)
- [Implementation Plan](../beloura-hiring-implementation-plan.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Getting Started](GETTING_STARTED.md)

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout

### Candidates
- `GET /api/v1/candidates` - List candidates (with filters)
- `POST /api/v1/candidates` - Create candidate
- `GET /api/v1/candidates/:id` - Get candidate
- `PATCH /api/v1/candidates/:id` - Update candidate
- `DELETE /api/v1/candidates/:id` - Delete candidate
- `GET /api/v1/candidates/stats` - Get statistics
- `POST /api/v1/candidates/bulk/update-stages` - Bulk update stages

### Sources
- `GET /api/v1/sources` - List sources
- `POST /api/v1/sources` - Create source
- `GET /api/v1/sources/:id` - Get source
- `PATCH /api/v1/sources/:id` - Update source
- `DELETE /api/v1/sources/:id` - Delete source
- `GET /api/v1/sources/stats` - Get statistics
- `GET /api/v1/sources/analytics` - Get analytics

### Referrers
- `GET /api/v1/referrers` - List referrers
- `POST /api/v1/referrers` - Create referrer
- `GET /api/v1/referrers/:id` - Get referrer
- `PATCH /api/v1/referrers/:id` - Update referrer
- `DELETE /api/v1/referrers/:id` - Delete referrer
- `GET /api/v1/referrers/stats` - Get statistics

### Users (Chatting Managers Only)
- `GET /api/v1/users` - List all users
- `POST /api/v1/users` - Create user
- `GET /api/v1/users/:id` - Get user
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user
- `GET /api/v1/users/me` - Get current user
- `PATCH /api/v1/users/me` - Update current user

## Roles & Permissions

### Access Control
- **All authenticated users** - Full access to Candidates, Sources, Referrers, Dashboard
- **Chatting Managers only** - User Management

### Role Types
- `sourcer` - Recruitment sourcing team
- `interviewer` - Interview team
- `chatting_managers` - Administrators with full access

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/beloura
NODE_ENV=development
PORT=3001
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api/v1
```

## Project Structure

```
beloura-hiring/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── routes/         # API routes
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utilities (JWT, validation)
│   │   └── server.ts       # Express app
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── migrations/     # Database migrations
│   ├── Dockerfile          # Production container
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── store/          # State management
│   │   ├── lib/            # API client
│   │   └── main.tsx        # Entry point
│   ├── Dockerfile          # Production container
│   ├── nginx.conf          # Nginx configuration
│   └── package.json
├── docker/
│   └── docker-compose.yml  # Local development
├── scripts/
│   ├── setup-local.sh      # Local setup script
│   └── deploy.sh           # Deployment script
└── .do/
    └── app.yaml            # Digital Ocean spec
```

## License

Proprietary - Beloura

## Support

For deployment issues, see [DEPLOYMENT.md](DEPLOYMENT.md) troubleshooting section.

