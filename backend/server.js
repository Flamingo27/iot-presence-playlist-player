const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mqtt = require('mqtt');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const winston = require('winston');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// MQTT Client
const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883');

mqttClient.on('connect', () => {
  logger.info('Connected to MQTT broker');
  
  // Subscribe to presence detection topics
  mqttClient.subscribe('presence/zone1');
  mqttClient.subscribe('presence/zone2');
  mqttClient.subscribe('presence/zone3');
  mqttClient.subscribe('music/control');
  mqttClient.subscribe('music/playlist');
});

mqttClient.on('message', (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    logger.info(`MQTT message received on ${topic}:`, data);
    
    // Broadcast to connected clients
    io.emit('mqtt-message', { topic, data });
    
    // Handle specific topics
    switch (topic) {
      case 'presence/zone1':
      case 'presence/zone2':
      case 'presence/zone3':
        handlePresenceUpdate(topic, data);
        break;
      case 'music/control':
        handleMusicControl(data);
        break;
      case 'music/playlist':
        handlePlaylistUpdate(data);
        break;
    }
  } catch (error) {
    logger.error('Error processing MQTT message:', error);
  }
});

mqttClient.on('error', (error) => {
  logger.error('MQTT connection error:', error);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info('Client connected:', socket.id);
  
  socket.on('join-zone', (zoneId) => {
    socket.join(`zone-${zoneId}`);
    logger.info(`Client ${socket.id} joined zone ${zoneId}`);
  });
  
  socket.on('leave-zone', (zoneId) => {
    socket.leave(`zone-${zoneId}`);
    logger.info(`Client ${socket.id} left zone ${zoneId}`);
  });
  
  socket.on('music-control', (data) => {
    // Publish music control to MQTT
    mqttClient.publish('music/control', JSON.stringify(data));
    logger.info('Music control published:', data);
  });
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected:', socket.id);
  });
});

// Presence management
let presenceData = {
  zone1: { present: false, people: [], lastUpdate: null },
  zone2: { present: false, people: [], lastUpdate: null },
  zone3: { present: false, people: [], lastUpdate: null }
};

function handlePresenceUpdate(topic, data) {
  const zoneId = topic.split('/')[1];
  const zone = presenceData[zoneId];
  
  if (zone) {
    zone.present = data.present;
    zone.people = data.people || [];
    zone.lastUpdate = new Date();
    
    // Broadcast to zone-specific clients
    io.to(`zone-${zoneId}`).emit('presence-update', {
      zone: zoneId,
      data: zone
    });
    
    // Update music based on presence
    updateMusicForZone(zoneId, zone);
  }
}

function handleMusicControl(data) {
  const { zone, action, track, volume } = data;
  
  // Broadcast music control to specific zone
  io.to(`zone-${zone}`).emit('music-control', {
    action,
    track,
    volume
  });
  
  logger.info(`Music control for zone ${zone}:`, data);
}

function handlePlaylistUpdate(data) {
  const { zone, playlist } = data;
  
  // Broadcast playlist update to specific zone
  io.to(`zone-${zone}`).emit('playlist-update', {
    zone,
    playlist
  });
  
  logger.info(`Playlist updated for zone ${zone}`);
}

function updateMusicForZone(zoneId, zoneData) {
  if (zoneData.present && zoneData.people.length > 0) {
    // Start music for zone
    const musicData = {
      zone: zoneId,
      action: 'play',
      people: zoneData.people
    };
    
    mqttClient.publish('music/control', JSON.stringify(musicData));
    logger.info(`Starting music for zone ${zoneId}`);
  } else {
    // Stop music for zone
    const musicData = {
      zone: zoneId,
      action: 'stop'
    };
    
    mqttClient.publish('music/control', JSON.stringify(musicData));
    logger.info(`Stopping music for zone ${zoneId}`);
  }
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/presence', (req, res) => {
  res.json(presenceData);
});

app.get('/api/presence/:zone', (req, res) => {
  const zone = req.params.zone;
  if (presenceData[zone]) {
    res.json(presenceData[zone]);
  } else {
    res.status(404).json({ error: 'Zone not found' });
  }
});

app.post('/api/music/control', (req, res) => {
  const { zone, action, track, volume } = req.body;
  
  if (!zone || !action) {
    return res.status(400).json({ error: 'Zone and action are required' });
  }
  
  const musicData = { zone, action, track, volume };
  mqttClient.publish('music/control', JSON.stringify(musicData));
  
  res.json({ success: true, message: 'Music control sent' });
});

app.post('/api/playlist/update', (req, res) => {
  const { zone, playlist } = req.body;
  
  if (!zone || !playlist) {
    return res.status(400).json({ error: 'Zone and playlist are required' });
  }
  
  const playlistData = { zone, playlist };
  mqttClient.publish('music/playlist', JSON.stringify(playlistData));
  
  res.json({ success: true, message: 'Playlist update sent' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info('MQTT broker:', process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  mqttClient.end();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  mqttClient.end();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

