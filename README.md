# CloudVault - Cloud Storage Platform

A professional cloud storage and file management application with **Next.js** frontend, **Express.js** backend, and **MySQL** database, fully containerized and ready for deployment.

## 🏗️ Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  Next.js        │─────▶│  Express.js     │─────▶│  MySQL          │
│  Dashboard      │      │  REST API       │      │  Database       │
│  Port: 3000     │      │  Port: 4000     │      │  Port: 3306     │
│                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

## 🐳 OpenShift Deployment (Project IT460)

CloudVault is optimized for Red Hat OpenShift. To deploy the full stack:

1. **Configure Environment**:
   ```bash
   oc apply -f openshift/
   ```
2. **Expose Public URLs**:
   ```bash
   oc get routes
   ```

For detailed architecture and scaling details, see [ARCHITECTURE.md](ARCHITECTURE.md) and [OPENSHIFT_GUIDE.md](OPENSHIFT_GUIDE.md).

## 🚀 Features

- ✅ **Cloud Storage** - Upload, organize, and manage files
- ✅ **Folder Management** - Create nested folder structures
- ✅ **File Sharing** - Share files with other users
- ✅ **Analytics Dashboard** - Storage usage and activity tracking
- ✅ **Search & Filter** - Find files quickly
- ✅ **Activity Logs** - Track all user actions
- ✅ **Storage Quotas** - Monitor storage usage
- ✅ **RESTful API** - Complete backend API
- ✅ **Docker Ready** - Fully containerized services
- ✅ **Modern UI** - Beautiful, responsive interface

## 📋 Prerequisites

- [Docker](https://www.docker.com/get-started) (20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (2.0+)
- [Node.js](https://nodejs.org/) (18+) - Only for local development without Docker

## 🛠️ Quick Start

### Using Docker (Recommended)

1. **Clone and navigate to the project:**
   ```bash
   cd cloud_project
   ```

2. **Set up environment variables:**
   ```bash
   copy .env.example .env
   ```
   
   Edit `.env` if you want to customize any settings.

3. **Start all services:**
   ```bash
   docker-compose up -d
   ```

4. **Access the application:**
   - 🌐 **Frontend:** http://localhost:3000
   - 🔌 **Backend API:** http://localhost:4000
   - 🗄️ **MySQL:** localhost:3306

5. **View logs:**
   ```bash
   # All services
   docker-compose logs -f

   # Specific service
   docker-compose logs -f frontend
   docker-compose logs -f backend
   docker-compose logs -f mysql
   ```

6. **Stop all services:**
   ```bash
   docker-compose down
   ```

7. **Stop and remove all data:**
   ```bash
   docker-compose down -v
   ```

### Local Development (Without Docker)

#### Backend

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   copy .env.example .env
   ```
   Update the `.env` file with your local MySQL credentials.

4. **Start the server:**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

#### Frontend

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   copy .env.example .env.local
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## 📁 Project Structure

```
cloud_project/
├── frontend/                 # Next.js application
│   ├── app/                  # Next.js App Router
│   │   ├── page.js           # Main page
│   │   ├── layout.js         # Root layout
│   │   └── globals.css       # Global styles
│   ├── lib/                  # Utilities
│   │   └── api.js            # API client
│   ├── Dockerfile            # Frontend Docker configuration
│   ├── next.config.js        # Next.js config
│   ├── package.json          # Dependencies
│   └── .env.example          # Environment template
│
├── backend/                  # Express.js application
│   ├── config/               # Configuration files
│   │   └── database.js       # Database connection
│   ├── controllers/          # Route controllers
│   │   └── userController.js # User CRUD operations
│   ├── routes/               # API routes
│   │   └── api.js            # API endpoints
│   ├── server.js             # Express server
│   ├── Dockerfile            # Backend Docker configuration
│   ├── package.json          # Dependencies
│   └── .env.example          # Environment template
│
├── database/                 # Database files
│   └── init.sql              # Database initialization script
│
├── docker-compose.yml        # Docker Compose orchestration
├── .env.example              # Root environment template
└── README.md                 # This file
```

## 🔧 API Endpoints

### Health Check
```
GET /api/health
```

### Users
```
GET    /api/users              # Get all users
GET    /api/users/:id          # Get user by ID
GET    /api/users/:id/profile  # Get user profile with stats
POST   /api/users              # Create new user
PUT    /api/users/:id          # Update user
DELETE /api/users/:id          # Delete user
```

### Folders
```
GET    /api/folders            # Get folders (query: userId, parentId)
GET    /api/folders/:id        # Get folder with contents
POST   /api/folders            # Create new folder
PUT    /api/folders/:id        # Update folder
DELETE /api/folders/:id        # Delete folder
```

### Files
```
GET    /api/files              # Get files (query: userId, folderId, favorite)
GET    /api/files/:id          # Get file details
GET    /api/files/search       # Search files (query: query, userId)
POST   /api/files              # Upload file
PUT    /api/files/:id          # Update file
DELETE /api/files/:id          # Delete file
```

### Shares
```
GET    /api/shares/with-me     # Get files shared with user
GET    /api/shares/by-me       # Get files shared by user
POST   /api/shares             # Share a file
DELETE /api/shares/:id         # Unshare a file
```

### Analytics
```
GET    /api/activity           # Get activity logs (query: userId, limit)
GET    /api/stats              # Get dashboard statistics
```

### Example Requests
```bash
# Get dashboard stats
curl http://localhost:4000/api/stats?userId=1

# Create a folder
curl -X POST http://localhost:4000/api/folders \
  -H "Content-Type: application/json" \
  -d '{"name":"Documents","userId":1,"color":"#4f46e5"}'

# Upload a file
curl -X POST http://localhost:4000/api/files \
  -H "Content-Type: application/json" \
  -d '{"filename":"report.pdf","fileSize":1024000,"fileType":"application/pdf","userId":1}'

# Share a file
curl -X POST http://localhost:4000/api/shares \
  -H "Content-Type: application/json" \  -d '{"fileId":1,"sharedByUserId":1,"sharedWithUserId":2,"permission":"view"}'
```

## 🔐 Environment Variables

### Root `.env`
```env
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=myapp_db
BACKEND_PORT=4000
FRONTEND_PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:4000
NODE_ENV=production
```

### Backend `.env`
```env
PORT=4000
NODE_ENV=development
DB_HOST=localhost  # Use 'mysql' for Docker
DB_PORT=3306
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=myapp_db
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 🐳 Docker Commands

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build frontend

# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart a service
docker-compose restart backend

# Execute command in container
docker-compose exec backend npm run dev

# Access MySQL
docker-compose exec mysql mysql -u root -prootpassword myapp_db
```

## 🧪 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🎨 UI Features

- **Dark Theme** - Modern dark color scheme with gradients
- **Responsive Design** - Works on all device sizes
- **Real-time Status** - API connection status indicator
- **Smooth Animations** - Hover effects and transitions
- **User Management** - Full CRUD interface for users
- **Error Handling** - User-friendly error messages

## 🔍 Troubleshooting

### Port Already in Use
If you get a "port already in use" error, you can either:
1. Stop the service using that port
2. Change the port in `.env` file

### Database Connection Failed
- Ensure MySQL container is healthy: `docker-compose ps`
- Check MySQL logs: `docker-compose logs mysql`
- Verify environment variables in `.env`

### Frontend Can't Connect to Backend
- Ensure `NEXT_PUBLIC_API_URL` matches your backend URL
- Check CORS settings in `backend/server.js`
- Verify backend is running: `curl http://localhost:4000/api/health`

## 📝 Development Notes

- The database data persists in a Docker volume named `mysql_data`
- Frontend uses Server-Side Rendering (SSR) by default
- API calls are made from the client side using the `NEXT_PUBLIC_API_URL`
- Health checks ensure services start in the correct order

## 🚢 Production Deployment

For production deployment:

1. Update environment variables for production
2. Use secure passwords for database
3. Configure proper CORS origins
4. Enable HTTPS/SSL
5. Consider using a reverse proxy (nginx)
6. Set up proper logging and monitoring

## 📄 License

ISC

## 👨‍💻 Author

Your Name

---

**Happy Coding! 🚀**
