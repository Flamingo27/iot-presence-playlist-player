# IoT Presence-Based Zonal Music System

A smart home automation system that uses 4 phones to create a zonal music experience with presence detection.

## 🏗️ Architecture

- **1 Main Phone**: React Native app for music control and playback
- **3 Sensor Phones**: Camera-based presence detection + MQTT clients
- **Backend Server**: Node.js server with MQTT broker and Frigate integration
- **Communication**: MQTT for real-time presence updates and music control

## 🚀 Features

- **Presence Detection**: Uses phone cameras to detect people in different zones
- **Zonal Music**: Custom playlists for each person in different zones
- **Real-time Updates**: MQTT-based communication for instant presence changes
- **Smart Playlists**: Automatic music selection based on who's present
- **Cross-platform**: Works on both Android and iOS

## 📱 Phone Setup

### Main Phone (Music Controller)
- Install the React Native app
- Controls music playback and zone management
- Displays presence status and playlist controls

### Sensor Phones (3x)
- Run presence detection app
- Use camera for people detection
- Send MQTT updates to server
- Can also play music in their zones

## 🖥️ Server Requirements

- Node.js 18+
- MQTT Broker (Mosquitto)
- Frigate for advanced object detection
- Docker (optional)

## 🛠️ Installation

1. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Sensor Phone Setup**
   ```bash
   cd sensor-app
   npm install
   npm start
   ```

3. **Main App Setup**
   ```bash
   cd main-app
   npm install
   npx react-native run-android  # or run-ios
   ```

## 🔧 Configuration

- Update MQTT broker settings in config files
- Configure camera permissions on sensor phones
- Set up Frigate object detection models
- Customize zone definitions and playlists

## 📊 How It Works

1. Sensor phones continuously monitor their zones using cameras
2. When presence is detected, MQTT messages are sent to the server
3. Server processes presence data and updates zone status
4. Main app receives updates and controls music accordingly
5. Music plays in zones where people are present
6. Playlists are customized based on detected individuals

## 🎵 Music Integration

- Supports Spotify, local files, and streaming services
- Custom playlists per person and zone
- Automatic volume and genre adjustment
- Seamless transitions between zones

## 🔐 Security

- MQTT authentication and encryption
- Camera permissions management
- Secure API endpoints
- User authentication for main app

## 📱 Supported Platforms

- Android 8.0+
- iOS 12.0+
- Web dashboard (optional)

## 🤝 Contributing

This is an open challenge project. Feel free to enhance and extend the functionality!
