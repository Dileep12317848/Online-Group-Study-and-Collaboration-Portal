# Student Collaboration Platform

A full-stack MERN application for students to collaborate, share resources, chat in real-time, and create study groups.

///mongodb+srv://ladi60143:Santosh123@cluster0.2kudmcu.mongodb.net/student-collaboration?retryWrites=true&w=majority&appName=Cluster0

## Features

✅ User Authentication (Register/Login)  
✅ Real-time Chat with Socket.io  
✅ Resource Sharing (Upload/Download files)  
✅ Study Groups (Create, Join, Manage)  
✅ Responsive Design  

---

## Prerequisites

Before running this project, make sure you have these installed on your computer:

### 1. **Node.js** (v14 or higher)
- Download from: https://nodejs.org/
- Check if installed: Open terminal/command prompt and run:
```bash
  node --version
  npm --version
```

### 2. **MongoDB Atlas Account** (Cloud Database)
- Sign up for free at: https://www.mongodb.com/cloud/atlas
- No local MongoDB installation needed!

---

## Installation Steps

### Step 1: Extract the ZIP File
- Extract the ZIP file to a folder on your computer
- Open the folder in VS Code or your preferred code editor

### Step 2: Setup MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas and sign in
2. Create a new cluster (Free M0 tier)
3. Create a database user:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Set username and password
   - Give "Read and write to any database" permission
4. Setup Network Access:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
5. Get Connection String:
   - Go to "Database" → Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string

### Step 3: Configure Environment Variables

1. Navigate to the `server` folder
2. Create a file named `.env` (exactly this name, starting with a dot)
3. Add these lines (replace with your actual values):
```env
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/student-collaboration?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_super_secret_key_12345_change_this
NODE_ENV=development
```

**Important:** Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with your MongoDB Atlas credentials!

### Step 4: Install Backend Dependencies

Open terminal/command prompt in the project folder:
```bash
cd server
npm install
```

This will install all required packages for the backend.

### Step 5: Install Frontend Dependencies

Open a **NEW** terminal/command prompt:
```bash
cd client
npm install
```

This will install all required packages for the frontend.

### Step 6: Create Uploads Folder

Make sure there's an `uploads` folder in the `server` directory:
```bash
cd server
mkdir uploads
```

---

## Running the Application

You need to run both backend and frontend servers:

### Terminal 1 - Backend Server:
```bash
cd server
npm run dev
```

You should see:
```
✅ MongoDB Connected Successfully
🚀 Server running on port 5000
💬 Socket.io ready for real-time chat
```

### Terminal 2 - Frontend Server:
```bash
cd client
npm run dev
```

You should see:
```
VITE ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Access the Application:
Open your browser and go to: **http://localhost:5173**

---

## Default Test Account (Optional)

You can create a new account by clicking "Register" or use these test credentials if provided:

- Email: test@example.com
- Password: test123

---

## Project Structure
```
student-collaboration-platform/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/    # React Components
│   │   ├── context/       # Auth Context
│   │   ├── services/      # API Services
│   │   ├── App.jsx
│   │   └── App.css
│   └── package.json
├── server/                # Express Backend
│   ├── config/           # Database Config
│   ├── models/           # MongoDB Models
│   ├── routes/           # API Routes
│   ├── middleware/       # Auth Middleware
│   ├── uploads/          # Uploaded Files
│   ├── socket.js         # Socket.io Config
│   ├── server.js         # Main Server File
│   └── package.json
└── README.md             # This file
```

---

## Troubleshooting

### Issue 1: "Cannot find module"
**Solution:** Make sure you ran `npm install` in both `client` and `server` folders

### Issue 2: "MongoDB Connection Error"
**Solution:** 
- Check your MongoDB Atlas connection string in `.env`
- Make sure username and password are correct
- Verify Network Access allows 0.0.0.0/0

### Issue 3: "Port already in use"
**Solution:** 
- Backend: Change PORT in `.env` to 5001
- Frontend: Vite will automatically suggest another port

### Issue 4: "CORS Error"
**Solution:** 
- Make sure backend is running on port 5000
- Make sure frontend is running on port 5173

### Issue 5: Files won't upload
**Solution:** 
- Make sure `uploads` folder exists in `server` directory
- Check file size is under 10MB

---

## Technologies Used

- **Frontend:** React, Vite, Socket.io-client, Axios
- **Backend:** Node.js, Express, Socket.io, Multer
- **Database:** MongoDB Atlas
- **Authentication:** JWT (JSON Web Tokens), bcryptjs

---

## Features Guide

### 1. Register/Login
- Create a new account or login with existing credentials
- Secure password hashing with bcryptjs

### 2. Chat
- Real-time messaging with Socket.io
- See messages from all users instantly

### 3. Resources
- Upload study materials (PDF, DOC, PPT, Images, Excel)
- Download resources shared by others
- Delete your own uploads

### 4. Study Groups
- Create public or private study groups
- Join groups by clicking or using invite codes
- Leave groups or delete your own groups

---

## Support

If you encounter any issues:
1. Make sure all prerequisites are installed
2. Check that both servers are running
3. Verify MongoDB Atlas connection
4. Clear browser cache (Ctrl+Shift+R)

---

## Developer

Created by: Santosh
Email: santuabc123@gmail.com

---

## License

This project is for educational purposes.
```

---

## **Additional Files to Include**

### **Create .gitignore (if sharing via Git)**

Create `.gitignore` in the root folder:
```
# Dependencies
node_modules/
client/node_modules/
server/node_modules/

# Environment variables
.env
server/.env

# Build files
client/dist/
client/build/

# Uploads
server/uploads/*
!server/uploads/.gitkeep

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*