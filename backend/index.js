const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Routes
const authRoutes = require('./routes/auth');
const graphRoutes = require('./routes/graph');
const aiRoutes = require('./routes/ai');
const folderRoutes = require('./routes/folder');
const uploadRoutes = require('./routes/upload');
const activityRoutes = require('./routes/activity');
const notificationRoutes = require('./routes/notifications');
const path = require('path');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:5173',
  'https://frontend-zeta-six-38.vercel.app',
  'https://nexus-visuals.vercel.app',
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : [])
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/graphs', graphRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/notifications', notificationRoutes);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// In-memory store for active users per graph { graphId: { socketId: { x, y, user } } }
const activeUsers = {};

// Socket.io for Real-time Graph Collaboration
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join_graph', ({ graphId, user }) => {
    socket.join(graphId);
    
    // Initialize graph state if not exists
    if (!activeUsers[graphId]) {
      activeUsers[graphId] = {};
    }
    
    // Add user to active state with safe defaults
    activeUsers[graphId][socket.id] = { 
      user: user || { username: 'Anonymous' },
      x: 0, 
      y: 0 
    };
    
    io.to(graphId).emit('presence_update', activeUsers[graphId]);
  });

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on('node-move', ({ roomId, nodeId, position }) => {
    socket.to(roomId).emit('node-move', { nodeId, position });
  });

  socket.on('node-add', ({ roomId, node }) => {
    socket.to(roomId).emit('node-add', node);
  });

  socket.on('edge-add', ({ roomId, edge }) => {
    socket.to(roomId).emit('edge-add', edge);
  });

  socket.on('node-delete', ({ roomId, nodeId }) => {
    socket.to(roomId).emit('node-delete', nodeId);
  });

  socket.on('node-update', ({ roomId, node }) => {
    socket.to(roomId).emit('node-update', node);
  });

  socket.on('chat-message', ({ roomId, message }) => {
    socket.to(roomId).emit('chat-message', message);
  });

  const handleDisconnect = (graphIdToLeave = null) => {
     // Find which rooms the user was in and remove them
     Object.keys(activeUsers).forEach(gId => {
       if (graphIdToLeave && gId !== graphIdToLeave) return;

       if (activeUsers[gId][socket.id]) {
         const username = activeUsers[gId][socket.id].user?.username;
         delete activeUsers[gId][socket.id];
         io.to(gId).emit('presence_update', activeUsers[gId]);
         console.log(`User ${username} removed from graph ${gId}`);
       }
       // Cleanup empty rooms
       if (Object.keys(activeUsers[gId]).length === 0) {
         delete activeUsers[gId];
       }
     });
  };

  socket.on('leave_graph', (graphId) => {
    socket.leave(graphId);
    handleDisconnect(graphId);
  });

  // Relay node changes to others in the same room
  socket.on('nodes_change', ({ graphId, changes }) => {
    socket.to(graphId).emit('nodes_change', changes);
  });

  // Relay edge changes
  socket.on('edges_change', ({ graphId, changes }) => {
    socket.to(graphId).emit('edges_change', changes);
  });

  socket.on('cursor-move', ({ roomId, x, y }) => {
    if (activeUsers[roomId] && activeUsers[roomId][socket.id]) {
       activeUsers[roomId][socket.id].x = x;
       activeUsers[roomId][socket.id].y = y;
       socket.to(roomId).emit('cursor-move', { socketId: socket.id, x, y });
    }
  });

  socket.on('disconnect', () => {
    handleDisconnect();
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
