# 🚀 CampVerse Production Deployment Guide

## 📋 Overview

CampVerse is now a fully production-ready college management system with comprehensive features for students, faculty, and administrators. This guide covers deployment, configuration, and maintenance.

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Context API with real-time updates
- **Authentication**: Firebase Auth + JWT tokens
- **Build Tool**: Vite
- **Error Handling**: Comprehensive error boundaries
- **Loading States**: Skeleton loading system

### Backend (Node.js + Express)
- **Framework**: Express.js with TypeScript support
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + Firebase Admin SDK
- **File Upload**: Multer with validation
- **API Documentation**: RESTful API with proper error handling
- **Real-time**: WebSocket support for live updates
- **Security**: Rate limiting, CORS, authentication middleware

### Database Schema
```
Users (Students, Faculty, Admin)
├── PlacementJobs
│   └── JobApplications
├── Announcements
├── Events
├── Assignments
│   └── AssignmentSubmissions
└── Other collections...
```

## 🔧 Prerequisites

### System Requirements
- **Node.js**: v16.0.0 or higher
- **npm/yarn**: Latest version
- **MongoDB**: v4.4 or higher
- **Memory**: Minimum 2GB RAM
- **Storage**: Minimum 10GB free space

### Services Required
- **MongoDB Atlas** (or self-hosted MongoDB)
- **Firebase Project** (for authentication)
- **Domain & SSL Certificate** (for production)
- **Email Service** (optional, for notifications)

## 📦 Installation & Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd campverse

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Environment Configuration

#### Frontend Environment (.env)
```bash
# Copy the environment template
cp .env.example .env

# Edit the environment variables
nano .env
```

Required variables for production:
```env
VITE_NODE_ENV=production
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_FIREBASE_API_KEY=your-actual-firebase-api-key
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
# ... other Firebase config
```

#### Backend Environment (backend/.env)
```bash
# Copy backend environment template
cp backend/.env.example backend/.env

# Edit backend environment variables
nano backend/.env
```

Required variables:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/campverse
JWT_SECRET=your-super-secure-jwt-secret
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

### 3. Database Setup

#### MongoDB Atlas Setup
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Whitelist your server IP
5. Get the connection string

#### Local Database Schema
```bash
# The application will automatically create collections
# Run the seed script to create initial admin user
cd backend
npm run seed-admin
```

### 4. Firebase Setup

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Authentication
4. Enable Email/Password authentication
5. Generate service account key

#### Download Service Account
1. Go to Project Settings > Service Accounts
2. Generate new private key
3. Download JSON file
4. Extract values for backend environment

## 🚀 Deployment

### Option 1: Traditional Server Deployment

#### Frontend (Nginx + Static Files)
```bash
# Build frontend
npm run build

# Configure Nginx
sudo nano /etc/nginx/sites-available/campverse
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/campverse/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Backend (PM2)
```bash
# Install PM2 globally
npm install -g pm2

# Start backend with PM2
cd backend
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup
```

### Option 2: Docker Deployment

#### Docker Compose
```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - backend
      
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
    depends_on:
      - mongodb
      
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
      
volumes:
  mongodb_data:
```

### Option 3: Cloud Deployment (Recommended)

#### Vercel (Frontend)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
vercel --prod
```

#### Railway/Render (Backend)
1. Connect your GitHub repository
2. Add environment variables
3. Deploy automatically

#### MongoDB Atlas (Database)
- Already cloud-hosted
- Automatic backups
- High availability

## 🔒 Security Configuration

### SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

### Security Headers
Add to Nginx configuration:
```nginx
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
```

### Firebase Security Rules
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# Backend health check
curl https://your-api-domain.com/api/health

# Response should be:
# {"status":"OK","message":"CampVerse API is running"}
```

### Log Monitoring
```bash
# PM2 logs
pm2 logs

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Database Maintenance
```bash
# MongoDB backup
mongodump --uri="mongodb+srv://..." --out=backup-$(date +%Y%m%d)

# MongoDB restore
mongorestore --uri="mongodb+srv://..." backup-folder/
```

### Performance Monitoring
1. **Frontend**: Use Lighthouse for performance audits
2. **Backend**: Monitor API response times
3. **Database**: Monitor query performance in MongoDB Atlas

## 🎯 Feature Configuration

### Real-time Updates
- WebSocket connection for live placement updates
- Automatic refresh of announcements
- Real-time notifications

### AI Chatbot
- OpenAI GPT integration ready
- College-specific knowledge base
- Contextual responses

### File Upload System
- Resume uploads for placements
- Assignment submissions
- Document attachments
- Automatic file validation

### Notification System
- Email notifications (requires SMTP setup)
- In-app notifications
- Push notifications (PWA ready)

## 🔧 Maintenance Tasks

### Daily
- Monitor server resources
- Check error logs
- Verify backup completion

### Weekly
- Update dependencies (security patches)
- Review user feedback
- Performance optimization

### Monthly
- Full system backup
- Security audit
- Feature usage analytics

## 🆘 Troubleshooting

### Common Issues

#### "Failed to fetch" errors
- Check API_BASE_URL in frontend environment
- Verify backend is running and accessible
- Check CORS configuration

#### Authentication issues
- Verify Firebase configuration
- Check JWT_SECRET in backend
- Ensure user exists in MongoDB

#### Database connection errors
- Check MongoDB URI
- Verify database user permissions
- Check network connectivity

#### File upload failures
- Check file size limits
- Verify upload directory permissions
- Check multer configuration

### Error Reporting
- Frontend errors logged to browser console
- Backend errors logged to server logs
- Production errors can be sent to Sentry

## 📞 Support

### Technical Support
- **Email**: tech-support@campverse.edu
- **Documentation**: [Internal Wiki]
- **Issue Tracker**: [GitHub Issues]

### Emergency Contacts
- **System Administrator**: +91-XXX-XXX-XXXX
- **Database Administrator**: +91-XXX-XXX-XXXX
- **Network Administrator**: +91-XXX-XXX-XXXX

## 📈 Scaling Considerations

### Horizontal Scaling
- Load balancer for multiple backend instances
- CDN for static assets
- Database read replicas

### Performance Optimization
- Redis for session storage
- Image optimization
- API response caching
- Database indexing

### Future Enhancements
- Mobile application
- Advanced analytics
- Integration with existing college systems
- Multi-tenant support

---

**Note**: This is a comprehensive production system. Follow security best practices and keep all dependencies updated. Regular monitoring and maintenance are essential for optimal performance.
