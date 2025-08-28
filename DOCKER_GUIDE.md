# 🐳 Theatre Seat Plan - Docker Setup Guide

## 🚀 Quick Start with Docker

### Prerequisites
- **Docker Desktop** installed and running
- **Docker Compose** (included with Docker Desktop)

### One-Command Startup

```bash
# Development Environment (with hot reload)
./docker.sh dev

# Production Environment (optimized)
./docker.sh prod
```

---

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `./docker.sh dev` | Start development environment |
| `./docker.sh prod` | Start production environment |
| `./docker.sh build` | Build all Docker images |
| `./docker.sh stop` | Stop all containers |
| `./docker.sh clean` | Remove containers & images |
| `./docker.sh logs` | View application logs |
| `./docker.sh status` | Show container status |
| `./docker.sh shell` | Open shell in backend |
| `./docker.sh db` | Connect to database |

---

## 🔧 Environment Details

### Development Environment
- **Frontend**: http://localhost:3000 (hot reload enabled)
- **Backend**: http://localhost:5001 (nodemon auto-restart)
- **Database**: localhost:5432
- **Features**: Live code updates, debugging enabled

### Production Environment
- **Application**: http://localhost (nginx serving React build)
- **Alternative**: http://localhost:3000 
- **API**: http://localhost:5001
- **Features**: Optimized builds, nginx reverse proxy

---

## 🏗 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │    │   (Node.js)     │    │   (PostgreSQL)  │
│   Port: 80/3000 │◄──►│   Port: 5001    │◄──►│   Port: 5432    │
│   nginx         │    │   Express       │    │   postgres:15   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Services
1. **Frontend**: React app served by nginx with reverse proxy
2. **Backend**: Node.js/Express API server
3. **Database**: PostgreSQL with automatic initialization

---

## 🚀 Getting Started

### 1. First Time Setup
```bash
# Clone/navigate to project
cd /Users/jasonwong/theatre_seat_plan

# Make script executable (if not already)
chmod +x docker.sh

# Start development environment
./docker.sh dev
```

### 2. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001/api/hello
- **Database**: Connect via any PostgreSQL client to localhost:5432

### 3. Development Workflow
```bash
# View logs in real-time
./docker.sh logs

# Open backend shell for debugging
./docker.sh shell

# Connect to database
./docker.sh db

# Stop everything
./docker.sh stop
```

---

## 📁 Docker Files Structure

```
theatre_seat_plan/
├── docker-compose.yml          # Production configuration
├── docker-compose.dev.yml      # Development configuration
├── docker.sh                   # Management script
├── .env.production             # Production environment variables
├── .env.development            # Development environment variables
├── database/
│   └── init.sql               # Database initialization
├── backend/
│   ├── Dockerfile             # Production backend image
│   ├── Dockerfile.dev         # Development backend image
│   └── .dockerignore          # Ignore patterns
└── frontend/
    ├── Dockerfile             # Production frontend image
    ├── Dockerfile.dev         # Development frontend image
    ├── nginx.conf             # Nginx configuration
    └── .dockerignore          # Ignore patterns
```

---

## 🌐 Network Access & Deployment

### Local Network Access
The containers are configured to allow access from other devices on your network:

```bash
# Find your IP address
ifconfig | grep "inet " | grep -v 127.0.0.1

# Access from other devices
http://YOUR_IP:3000   # Development
http://YOUR_IP:80     # Production
```

### Cloud Deployment
Ready for deployment to:
- **AWS ECS/Fargate**
- **Google Cloud Run**
- **Azure Container Instances**
- **DigitalOcean App Platform**
- **Any Docker-compatible hosting**

---

## 🔒 Security Features

### Production Configuration
- Nginx serving static files with security headers
- API reverse proxy to hide backend
- PostgreSQL with isolated network
- Multi-stage builds for minimal image size
- Health checks for all services

### Environment Variables
Sensitive data managed through `.env` files:
- Database credentials
- API endpoints
- Environment-specific settings

---

## 📊 Monitoring & Debugging

### View Logs
```bash
# All services
./docker.sh logs

# Specific service
docker-compose logs frontend
docker-compose logs backend
docker-compose logs database
```

### Health Checks
All services include health checks:
- Frontend: `http://localhost/health`
- Backend: `http://localhost:5001/api/hello`
- Database: PostgreSQL ready check

### Container Status
```bash
# Quick status
./docker.sh status

# Detailed info
docker-compose ps
docker stats
```

---

## 🛠 Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Stop any running containers
./docker.sh stop

# Check what's using the ports
lsof -i :3000
lsof -i :5001
lsof -i :5432
```

**2. Database Connection Issues**
```bash
# Check database container
docker logs theatre_db

# Reset database
./docker.sh clean
./docker.sh dev
```

**3. Build Failures**
```bash
# Clean rebuild
./docker.sh clean
./docker.sh build
```

**4. Permission Issues**
```bash
# Fix script permissions
chmod +x docker.sh

# Check Docker daemon
docker info
```

### Reset Everything
```bash
# Complete reset (removes all data)
./docker.sh clean

# Fresh start
./docker.sh dev
```

---

## ⚡ Performance Tips

### Development
- Use `./docker.sh dev` for hot reload
- Mount volumes for live code updates
- Use Docker Desktop's resource limits

### Production
- Images are multi-stage and optimized
- Nginx gzip compression enabled
- Static asset caching configured
- Health checks for reliability

---

## 📱 Mobile Testing

### Same Network
```bash
# Start production environment
./docker.sh prod

# Get your IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Access from mobile: http://YOUR_IP
```

### External Access (using ngrok)
```bash
# Start local environment
./docker.sh prod

# In another terminal
brew install ngrok
ngrok http 80
```

---

## 🎯 Production Deployment

### Example: Deploy to DigitalOcean
```bash
# Build and push images
docker build -t your-registry/theatre-frontend ./frontend
docker build -t your-registry/theatre-backend ./backend
docker push your-registry/theatre-frontend
docker push your-registry/theatre-backend

# Update docker-compose.yml with your images
# Deploy using your preferred method
```

### Environment Variables for Production
Update `.env.production` with your production values:
```env
POSTGRES_PASSWORD=your-secure-password
REACT_APP_API_URL=https://your-domain.com
```

---

## 📝 Development Notes

### Hot Reload
- Frontend: React hot reload enabled
- Backend: Nodemon restarts on file changes
- Database: Persistent volumes for data

### Adding Dependencies
```bash
# Backend
./docker.sh shell
npm install new-package

# Rebuild if needed
./docker.sh build
```

### Database Changes
```bash
# Connect to database
./docker.sh db

# Run SQL commands
\dt                    # List tables
SELECT * FROM events;  # Query data
```

---

**🎉 Your theatre seating plan is now containerized and ready for deployment anywhere!**
