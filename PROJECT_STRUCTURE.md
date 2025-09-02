# 🏗️ Project Structure - IoT Presence Music System

Complete overview of the system architecture and file organization.

## 📁 Root Directory Structure

```
iot-presence-playlist-player/
├── 📱 main-app/                 # Main music control app (React Native)
├── 📡 sensor-app/               # Sensor app for presence detection (React Native)
├── 🖥️ backend/                  # Backend server (Node.js + Express)
├── 🐳 docker-compose.yml        # Docker services orchestration
├── 🚀 setup.sh                  # Automated setup script
├── 📋 package.json              # Root project configuration
├── 🔧 env.example               # Environment configuration template
├── 📖 README.md                 # Project documentation
├── 🏃‍♂️ QUICKSTART.md           # Quick start guide
├── 🏗️ PROJECT_STRUCTURE.md      # This file
├── 📁 mosquitto/                # MQTT broker configuration
└── 📁 frigate/                  # Object detection configuration
```

## 📱 Main App (`main-app/`)

**Purpose**: Primary music control interface for the main phone

```
main-app/
├── 📱 App.js                    # Main app with bottom tab navigation
├── 📋 package.json              # Dependencies and scripts
├── 📁 screens/                  # App screens
│   ├── 🏠 DashboardScreen.js    # System overview and status
│   ├── 🗺️ ZonesScreen.js        # Zone management and monitoring
│   ├── 🎵 MusicScreen.js        # Music playback controls
│   ├── 📝 PlaylistsScreen.js    # Playlist management
│   └── ⚙️ SettingsScreen.js     # App configuration
├── 📁 context/                  # React context providers
│   ├── 🎵 MusicContext.js       # Music state and controls
│   ├── 📡 MQTTContext.js        # MQTT communication
│   └── 🗺️ ZoneContext.js        # Zone management
├── 📁 components/               # Reusable UI components
│   ├── 🎵 MusicPlayer.js        # Music player controls
│   ├── 🗺️ ZoneCard.js           # Zone status display
│   ├── 📊 StatusIndicator.js    # Connection status
│   └── 🎛️ VolumeControl.js      # Volume adjustment
└── 📁 utils/                    # Helper functions
    ├── 🔗 mqtt.js               # MQTT utilities
    ├── 🎵 music.js              # Music processing
    └── 🗺️ zones.js              # Zone utilities
```

## 📡 Sensor App (`sensor-app/`)

**Purpose**: Presence detection app for the 3 sensor phones

```
sensor-app/
├── 📱 App.js                    # Main app with stack navigation
├── 📋 package.json              # Dependencies and scripts
├── 📁 screens/                  # App screens
│   ├── 🏠 HomeScreen.js         # Dashboard and status overview
│   ├── 📷 CameraScreen.js       # Camera view and detection
│   ├── ⚙️ SettingsScreen.js     # App configuration
│   └── 📊 StatusScreen.js       # System status and logs
├── 📁 context/                  # React context providers
│   ├── 📡 MQTTContext.js        # MQTT communication
│   └── 📷 SensorContext.js      # Camera and sensor management
├── 📁 components/               # Reusable UI components
│   ├── 📷 CameraView.js         # Camera interface
│   ├── 📊 DetectionStatus.js    # Presence detection status
│   ├── 🔗 ConnectionStatus.js   # MQTT connection status
│   └── ⚙️ SettingsForm.js       # Configuration forms
└── 📁 utils/                    # Helper functions
    ├── 📷 camera.js             # Camera utilities
    ├── 🔍 detection.js          # Presence detection logic
    └── 🔗 mqtt.js               # MQTT utilities
```

## 🖥️ Backend Server (`backend/`)

**Purpose**: Central server managing MQTT, presence data, and music control

```
backend/
├── 🚀 server.js                 # Main Express server
├── 📋 package.json              # Dependencies and scripts
├── 📁 routes/                   # API endpoints
│   ├── 🎵 music.js              # Music control endpoints
│   ├── 🗺️ zones.js              # Zone management endpoints
│   ├── 👥 presence.js           # Presence detection endpoints
│   └── 📝 playlists.js          # Playlist management endpoints
├── 📁 middleware/               # Express middleware
│   ├── 🔐 auth.js               # Authentication middleware
│   ├── 📝 validation.js         # Request validation
│   └── 📊 logging.js            # Request logging
├── 📁 services/                 # Business logic
│   ├── 🎵 musicService.js       # Music management
│   ├── 🗺️ zoneService.js        # Zone management
│   ├── 👥 presenceService.js    # Presence processing
│   └── 📝 playlistService.js    # Playlist management
├── 📁 models/                   # Data models
│   ├── 🗺️ Zone.js               # Zone data model
│   ├── 👥 Person.js             # Person data model
│   ├── 📝 Playlist.js           # Playlist data model
│   └── 🎵 Track.js              # Music track model
├── 📁 utils/                    # Helper functions
│   ├── 🔗 mqtt.js               # MQTT utilities
│   ├── 📊 frigate.js            # Frigate integration
│   └── 🎵 music.js              # Music processing
└── 📁 logs/                     # Application logs
    ├── error.log                # Error logs
    └── combined.log             # Combined logs
```

## 🐳 Docker Services

**Purpose**: Containerized services for easy deployment and management

### MQTT Broker (Mosquitto)
```
mosquitto/
├── 📁 config/
│   └── 📄 mosquitto.conf        # MQTT broker configuration
├── 📁 data/                     # Persistent MQTT data
└── 📁 log/                      # MQTT broker logs
```

**Features**:
- MQTT protocol support (port 1883)
- WebSocket support (port 9001)
- Anonymous connections (development)
- Message persistence
- Configurable security

### Object Detection (Frigate)
```
frigate/
└── 📁 config/
    └── 📄 config.yml            # Frigate configuration
```

**Features**:
- Real-time object detection
- Multiple camera support
- MQTT integration
- Recording and snapshots
- Zone-based detection

### Backend API
```
backend/
├── 📄 Dockerfile                # Container build instructions
└── 📄 .dockerignore             # Files to exclude from build
```

**Features**:
- Node.js runtime
- Express server
- MQTT client
- Socket.IO for real-time updates
- RESTful API endpoints

## 🔗 Communication Architecture

### MQTT Topics
```
presence/zone1                   # Zone 1 presence updates
presence/zone2                   # Zone 2 presence updates
presence/zone3                   # Zone 3 presence updates
music/control                    # Music control commands
music/playlist                   # Playlist updates
frigate/+/+/objects             # Frigate object detection
```

### Data Flow
1. **Sensor Phones** → **MQTT Broker** → **Backend Server**
2. **Backend Server** → **MQTT Broker** → **Main App**
3. **Main App** → **MQTT Broker** → **Backend Server**
4. **Frigate** → **MQTT Broker** → **Backend Server**

## 🎵 Music System

### Supported Sources
- Local music files
- Spotify integration
- Apple Music (future)
- Custom playlists
- Zone-specific music

### Features
- Automatic music selection based on presence
- Volume control per zone
- Crossfade between zones
- Mood-based playlist selection
- User preference learning

## 🔐 Security Features

- MQTT authentication (configurable)
- HTTPS support
- JWT token authentication
- Rate limiting
- Input validation
- CORS configuration

## 📊 Monitoring & Logging

### Logs
- Application logs (Winston)
- MQTT broker logs
- Frigate detection logs
- Docker container logs

### Metrics
- Presence detection accuracy
- MQTT message throughput
- Music playback statistics
- Zone activity patterns

## 🚀 Deployment Options

### Development
```bash
./setup.sh                      # Automated setup
docker-compose up -d            # Start services
npm run dev                     # Start all apps
```

### Production
```bash
# Build production images
docker-compose -f docker-compose.prod.yml up -d

# Use PM2 for process management
pm2 start ecosystem.config.js
```

### Cloud Deployment
- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Instances
- Kubernetes clusters

## 🔧 Configuration Management

### Environment Variables
- Network configuration
- Service endpoints
- API keys
- Database connections
- Security settings

### Dynamic Configuration
- MQTT broker settings
- Zone definitions
- Detection parameters
- Music preferences

## 📱 Mobile App Features

### Sensor App
- Real-time camera feed
- Presence detection
- MQTT communication
- Zone configuration
- Status monitoring

### Main App
- Zone overview
- Music controls
- Playlist management
- Presence monitoring
- Settings configuration

## 🎯 Future Enhancements

### Planned Features
- User recognition (face detection)
- Mood-based music selection
- Multi-room audio sync
- Voice control integration
- Smart home integration
- Machine learning optimization

### Scalability
- Multiple zone support
- Load balancing
- Microservices architecture
- Database clustering
- CDN integration

## 📚 Documentation

- **README.md**: Project overview
- **QUICKSTART.md**: Getting started guide
- **PROJECT_STRUCTURE.md**: This file
- **API_DOCS.md**: Backend API documentation
- **DEPLOYMENT.md**: Deployment instructions
- **TROUBLESHOOTING.md**: Common issues and solutions

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch
3. Make changes
4. Run tests
5. Submit pull request

### Code Standards
- ESLint configuration
- Prettier formatting
- TypeScript support
- Unit test coverage
- Documentation updates

This structure provides a solid foundation for a scalable, maintainable IoT presence-based music system that can grow with your needs! 🎵🏠

