const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const dotenv = require('dotenv');
const os = require('os');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const flash = require('connect-flash');

// Load environment variables
dotenv.config();

// Initialize express app and create http server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'stagelink-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Flash messages middleware
app.use(flash());

// Body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set static folder for public assets
app.use(express.static(path.join(__dirname, 'public')));

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.isAuthenticated) {
    return next();
  }
  res.redirect('/login');
};

// Routes
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', (req, res) => {
  const { password } = req.body;
  const hostPassword = process.env.HOST_PASSWORD || '6969';

  if (password === hostPassword) {
    req.session.isAuthenticated = true;
    res.redirect('/host');
  } else {
    // Instead of using flash messages, redirect with query parameter
    res.redirect('/login?error=true');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.get('/host', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'host.html'));
});

app.get('/viewer', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'viewer.html'));
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to check authentication status
app.get('/api/auth/status', (req, res) => {
  res.json({ isAuthenticated: req.session.isAuthenticated === true });});

// Store current show settings
let showSettings = {
  name: 'Untitled Show',
  selectedCamera: 0
};

// Store host peer ID
let hostPeerId = null;

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Send current show settings to the new client
  socket.emit('showSettings', showSettings);
  
  // Handle host ready with peer ID
  socket.on('hostReady', (peerId) => {
    hostPeerId = peerId;
    console.log('Host ready with peer ID:', hostPeerId);
    // Broadcast to all viewers that host is ready
    socket.broadcast.emit('hostId', hostPeerId);
  });

  // Handle viewer ready with peer ID
  socket.on('viewerReady', (peerId) => {
    console.log('Viewer ready with peer ID:', peerId);
    // If host is already connected, send host ID to this viewer
    if (hostPeerId) {
      socket.emit('hostId', hostPeerId);
    }
  });

  // Handle show settings update
  socket.on('updateShowSettings', (settings) => {
    showSettings = settings;
    io.emit('showSettings', showSettings);
    console.log('Show settings updated:', showSettings);
  });

  // Handle theme change from host
  socket.on('themeChange', (theme) => {
    console.log('Theme changed to:', theme);
    // Broadcast the theme change to all clients except the sender
    socket.broadcast.emit('themeUpdate', theme);
  });

  // Handle camera selection
  socket.on('selectCamera', (cameraIndex) => {
    showSettings.selectedCamera = cameraIndex;
    io.emit('showSettings', showSettings);
    console.log('Camera selected:', cameraIndex);
  });

  // Handle request for current show settings
  socket.on('getShowSettings', () => {
    socket.emit('showSettings', showSettings);
    console.log('Show settings requested and sent');
  });

  // Handle client disconnect
  // Handle chat messages
  socket.on('chatMessage', (message) => {
    console.log('Chat message received:', message);
    // Broadcast the message to all other clients
    socket.broadcast.emit('chatMessage', message);
  });

  socket.on('disconnect', () => {
    // If the host disconnects, clear the host peer ID
    if (socket.id === hostPeerId) {
      hostPeerId = null;
      console.log('Host disconnected');
    }
    console.log('Client disconnected');
  });
});

// Set up PeerJS server
const { PeerServer } = require('peer');
const peerServer = PeerServer({
  port: 9000,
  path: '/peerjs',
  proxied: true,
  debug: true,
  ssl: false
});

app.use('/peerjs', require('express').static(path.join(__dirname, 'node_modules/peerjs/dist')));

// Log when peer server events occur
peerServer.on('connection', (client) => {
  console.log('PeerJS client connected:', client.id);
});

peerServer.on('disconnect', (client) => {
  console.log('PeerJS client disconnected:', client.id);
});

// Set port and start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  // Get local IP address
  const networkInterfaces = os.networkInterfaces();
  const localIp = Object.values(networkInterfaces)
    .flat()
    .filter(details => details.family === 'IPv4' && !details.internal)
    .map(details => details.address)[0];

  console.log('Stage Link Server Information:');
  console.log('-----------------------------');
  console.log(`Local URL: http://localhost:${PORT}`);
  console.log(`Network URL: http://${localIp}:${PORT}`);
  console.log('\nAvailable Routes:');
  console.log('----------------');
  console.log(`Main page: http://${localIp}:${PORT}/`);
  console.log(`Host page: http://${localIp}:${PORT}/host.html`);
  console.log(`Viewer page: http://${localIp}:${PORT}/viewer.html`);
  console.log(`PeerJS server: http://${localIp}:9000/peerjs`);
  console.log('\nCreated by Christian Furr');
});

// Handle server shutdown
process.on('SIGINT', () => {
  console.log('Shutting down Stage Link server...');
  process.exit(0);
});