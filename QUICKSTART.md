# 🚀 Quick Start Guide - IoT Presence Music System

Get your zonal music system up and running in minutes!

## ⚡ Prerequisites

- **Laptop/Server**: Running Linux, macOS, or Windows with Docker
- **4 Phones**: 1 main control phone + 3 sensor phones
- **Network**: All devices on same WiFi network
- **Software**: Docker, Docker Compose, Node.js 18+

## 🏃‍♂️ Quick Setup (5 minutes)

### 1. Clone and Setup
```bash
git clone <your-repo>
cd iot-presence-playlist-player
chmod +x setup.sh
./setup.sh
```

### 2. Configure Network
Edit `.env` file with your phone IPs:
```bash
# Replace with your actual phone IP addresses
ZONE1_IP=192.168.1.101  # Phone 1 (Zone 1)
ZONE2_IP=192.168.1.102  # Phone 2 (Zone 2) 
ZONE3_IP=192.168.1.103  # Phone 3 (Zone 3)
MAIN_PHONE_IP=192.168.1.100  # Main control phone
```

### 3. Start Services
```bash
docker-compose up -d
```

### 4. Install Apps on Phones

#### Sensor Phones (3x)
```bash
cd sensor-app
npm start
# Scan QR code with Expo Go app
```

#### Main Control Phone
```bash
cd main-app
npm start
# Scan QR code with Expo Go app
```

## 📱 Phone Setup

### Sensor Phones (Zones 1, 2, 3)
1. Install **Expo Go** from App Store/Play Store
2. Run sensor app
3. Configure zone number (1, 2, or 3)
4. Grant camera and location permissions
5. Set MQTT broker to your laptop's IP

### Main Control Phone
1. Install **Expo Go** from App Store/Play Store
2. Run main app
3. Configure MQTT broker settings
4. Set up music preferences

## 🔧 Configuration

### MQTT Broker
- **URL**: `mqtt://YOUR_LAPTOP_IP:1883`
- **Port**: 1883
- **WebSocket**: `ws://YOUR_LAPTOP_IP:9001`

### Frigate (Object Detection)
- **Web UI**: `http://YOUR_LAPTOP_IP:5000`
- **API**: `http://YOUR_LAPTOP_IP:5000/api`

### Backend API
- **URL**: `http://YOUR_LAPTOP_IP:3000`
- **Health Check**: `http://YOUR_LAPTOP_IP:3000/api/health`

## 🎵 How It Works

1. **Sensor phones** continuously monitor their zones using cameras
2. **Presence detection** triggers MQTT messages to the server
3. **Server** processes presence data and updates zone status
4. **Main app** receives updates and controls music accordingly
5. **Music plays** in zones where people are present
6. **Playlists** are customized based on detected individuals

## 🎯 Test the System

### 1. Check Services
```bash
# Check if all services are running
docker-compose ps

# View logs
docker-compose logs -f
```

### 2. Test MQTT
```bash
# Install MQTT client
npm install -g mqtt-cli

# Subscribe to presence topics
mqtt sub -h localhost -t "presence/#"
```

### 3. Test Presence Detection
- Walk in front of sensor phone cameras
- Check MQTT messages
- Verify zone status updates in main app

## 🚨 Troubleshooting

### Common Issues

#### MQTT Connection Failed
```bash
# Check MQTT broker status
docker-compose logs mosquitto

# Restart MQTT service
docker-compose restart mosquitto
```

#### Camera Not Working
- Ensure camera permissions are granted
- Check if phone supports camera API
- Verify zone configuration

#### Music Not Playing
- Check audio permissions
- Verify playlist configuration
- Ensure MQTT messages are being received

#### Network Issues
```bash
# Check network connectivity
ping YOUR_LAPTOP_IP

# Check firewall settings
sudo ufw status
```

### Reset Everything
```bash
# Stop and remove all containers
docker-compose down -v

# Remove all images
docker system prune -a

# Start fresh
./setup.sh
```

## 📚 Next Steps

1. **Customize Playlists**: Add your favorite music
2. **Adjust Detection**: Fine-tune presence detection sensitivity
3. **Add Zones**: Configure additional zones if needed
4. **Integrate Services**: Connect Spotify, Apple Music, etc.
5. **Advanced Features**: Set up user recognition, mood-based music

## 🆘 Need Help?

- Check logs: `docker-compose logs -f [service-name]`
- Restart service: `docker-compose restart [service-name]`
- Rebuild: `docker-compose up -d --build`
- Full reset: `./setup.sh`

## 🎉 You're All Set!

Your IoT presence-based zonal music system is now running! 

- **3 sensor phones** are monitoring zones
- **1 main phone** controls the music
- **Server** manages everything via MQTT
- **Frigate** provides advanced object detection

Enjoy your smart home music experience! 🎵🏠

