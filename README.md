# Video Upload, Processing & Streaming Platform

A full-stack application that enables users to upload videos, processes them for content sensitivity analysis, and provides seamless video streaming with real-time progress tracking.

##  Features

### Core Features
-  **Video Upload** - Upload videos with title and description
-  **Real-Time Processing** - Live progress updates using Socket.io
-  **Sensitivity Analysis** - Automatic content screening (safe/flagged classification)
-  **Video Streaming** - HTTP range request support for efficient streaming
-  **Multi-Tenant Architecture** - Organization-based user isolation
-  **Role-Based Access Control** - Three-tier permission system

### User Roles
- **Viewer** - Can view and stream own videos only
- **Editor** - Can upload, manage videos, and view all organization videos
- **Admin** - Full system access including user management and statistics

### Advanced Features
- Real-time dashboard with live updates
- Video library with filtering and search
- Admin panel for user and system management
- Responsive design for all devices
- Comprehensive error handling

##  Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose [Here i use Atlas]
- **Real-Time:** Socket.io
- **Authentication:** JWT (JSON Web Tokens)
- **File Upload:** Multer
- **Password Hashing:** bcrypt

### Frontend
- **Build Tool:** Vite
- **Framework:** React
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Real-Time:** Socket.io Client
- **State Management:** React Context API

##  Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

##  Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd video-platform
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```env
PORT=8000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/videoplayer
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:5173
```

Create uploads directory:
```bash
mkdir uploads
```

Start backend server:
```bash
npm run dev
```

Backend will run on: `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file in frontend directory:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_SOCKET_URL=http://localhost:8000
```

Start frontend development server:
```bash
npm run dev
```

Frontend will run on: `http://localhost:5173`

##  API Endpoints

### Authentication
```
POST   /api/v1/users/register       - Register new user
POST   /api/v1/users/login          - User login
GET    /api/v1/users/me             - Get current user details
```

### Videos
```
POST   /api/v1/videos/upload        - Upload video (editor/admin only)
GET    /api/v1/videos               - Get all organization videos
GET    /api/v1/videos/filter        - Filter videos (status, search, sort)
GET    /api/v1/videos/:id           - Get specific video details
DELETE /api/v1/videos/:id           - Delete video (owner/admin only)
GET    /api/v1/videos/stream/:id    - Stream video with range support
```

### Admin (Admin only)
```
GET    /api/v1/admin/users          - Get all organization users
PATCH  /api/v1/admin/users/:id/role - Update user role
DELETE /api/v1/admin/users/:id      - Delete user
GET    /api/v1/admin/videos         - Get all organization videos
GET    /api/v1/admin/stats          - Get system statistics
```

##  Usage Guide

### 1. Register an Account
- Navigate to `/register`
- Fill in: Name, Email, Password, Organization ID, Role
- Organization ID groups users together (e.g., "org_company1")

### 2. Login
- Navigate to `/login`
- Enter email and password

### 3. Upload Video (Editor/Admin only)
- Click on "Upload Video" section
- Select video file (max 500MB)
- Enter title and description
- Click "Upload Video"
- Watch real-time processing progress

### 4. View Videos
- All videos appear in the Video Library
- Use filters to sort by status, date, or search by title
- Click "Watch" to play processed videos

### 5. Admin Panel (Admin only)
- Switch to "Admin Panel" tab
- Manage users: change roles, delete users
- View system statistics

##  Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Multi-tenant data isolation
- Input validation and sanitization
- CORS protection
- Secure file upload handling

##  Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum ["viewer", "editor", "admin"],
  organizationId: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Video Model
```javascript
{
  videoFile: String,
  title: String,
  description: String,
  status: Enum ["processing", "safe", "flagged"],
  owner: ObjectId (ref: User),
  organizationId: String,
  duration: Number,
  fileSize: Number,
  mimeType: String,
  processingProgress: Number,
  flagReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

##  Deployment

### Backend (Render)
1. Create account on Render.com
2. Create new Web Service
3. Connect GitHub repository
4. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add environment variables:
   - `PORT=8000`
   - `MONGODB_URI=<your-mongodb-atlas-uri>`
   - `JWT_SECRET=<your-secret>`
   - `CORS_ORIGIN=<your-frontend-url>`
   - `NODE_ENV=production`

### Frontend (Vercel)
1. Create account on Vercel.com
2. Import GitHub repository
3. Configure:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variables:
   - `VITE_API_BASE_URL=<your-backend-url>/api/v1`
   - `VITE_SOCKET_URL=<your-backend-url>`

##  Testing

### Test User Accounts
After registration, you can create test accounts with different roles:

**Admin Account:**
```
Email: admin@test.com
Password: admin123
Organization: org_demo
Role: admin
```

**Editor Account:**
```
Email: editor@test.com
Password: editor123
Organization: org_demo
Role: editor
```

**Viewer Account:**
```
Email: viewer@test.com
Password: viewer123
Organization: org_demo
Role: viewer
```

### Testing Workflow
1. Register 3 users with different roles in the same organization
2. Login as editor and upload a video
3. Observe real-time processing updates
4. Login as admin and access admin panel
5. Test role restrictions (viewer cannot upload)

##  Project Structure

```
video-platform/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── user.controller.js
│   │   │   ├── video.controller.js
│   │   │   └── admin.controller.js
│   │   ├── models/
│   │   │   ├── user.model.js
│   │   │   └── video.model.js
│   │   ├── routes/
│   │   │   ├── user.routes.js
│   │   │   ├── video.routes.js
│   │   │   └── admin.routes.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js
│   │   │   ├── multer.middleware.js
│   │   │   └── rbac.middleware.js
│   │   ├── db/
│   │   │   └── index.js
│   │   ├── app.js
│   │   ├── index.js
│   │   └── constants.js
│   ├── uploads/
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   ├── Dashboard/
│   │   │   │   └── Dashboard.jsx
│   │   │   ├── Admin/
│   │   │   │   └── AdminPanel.jsx
│   │   │   ├── Layout/
│   │   │   │   └── Navbar.jsx
│   │   │   └── video/
│   │   │       ├── VideoUpload.jsx
│   │   │       ├── VideoList.jsx
│   │   │       ├── VideoCard.jsx
│   │   │       └── VideoPlayer.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env
│
└── README.md
```

##  Troubleshooting

### Video not streaming
- Check if backend is running
- Verify authentication token is valid
- Ensure video file exists in uploads directory
- Check browser console for errors

### Socket.io not connecting
- Verify CORS settings
- Check if backend Socket.io is configured correctly
- Ensure JWT token is being sent in socket auth

### File upload fails
- Check file size (max 500MB)
- Verify file type is supported
- Ensure uploads directory exists
- Check multer configuration

##  License

ISC

##  Author

Anirban Das

##  Acknowledgments

Built as part of Full Stack Developer assignment for Pulse Talent Team.
