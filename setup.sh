#!/bin/bash

# IoT Presence Music System Setup Script
# This script sets up the complete system including backend, MQTT broker, and apps

set -e

echo "🚀 Setting up IoT Presence Music System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Check system requirements
print_status "Checking system requirements..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    print_status "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    print_status "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    print_status "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

print_success "System requirements met!"

# Create necessary directories
print_status "Creating project directories..."
mkdir -p mosquitto/config mosquitto/data mosquitto/log
mkdir -p frigate/config
mkdir -p backend/logs
mkdir -p backend/uploads
mkdir -p logs

print_success "Directories created!"

# Copy environment file
if [ ! -f .env ]; then
    print_status "Creating .env file from template..."
    cp env.example .env
    print_warning "Please edit .env file with your configuration before starting services"
else
    print_status ".env file already exists"
fi

# Install dependencies
print_status "Installing dependencies..."

# Install root dependencies
npm install

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
npm install
cd ..

# Install sensor app dependencies
print_status "Installing sensor app dependencies..."
cd sensor-app
npm install
cd ..

# Install main app dependencies
print_status "Installing main app dependencies..."
cd main-app
npm install
cd ..

print_success "Dependencies installed!"

# Set up MQTT configuration
print_status "Setting up MQTT configuration..."
if [ ! -f mosquitto/config/mosquitto.conf ]; then
    print_error "MQTT configuration file not found. Please ensure mosquitto/config/mosquitto.conf exists."
    exit 1
fi

# Set up Frigate configuration
print_status "Setting up Frigate configuration..."
if [ ! -f frigate/config/config.yml ]; then
    print_error "Frigate configuration file not found. Please ensure frigate/config/config.yml exists."
    exit 1
fi

# Set proper permissions
print_status "Setting proper permissions..."
chmod 755 mosquitto/config mosquitto/data mosquitto/log
chmod 755 frigate/config
chmod 755 backend/logs backend/uploads
chmod 755 logs

# Create Docker network if it doesn't exist
print_status "Setting up Docker network..."
docker network create iot-network 2>/dev/null || print_status "Docker network already exists"

# Build and start services
print_status "Building and starting Docker services..."
docker-compose up -d --build

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Check service status
print_status "Checking service status..."

# Check MQTT broker
if curl -s http://localhost:9001 > /dev/null 2>&1; then
    print_success "MQTT broker is running"
else
    print_warning "MQTT broker may not be fully ready yet"
fi

# Check Frigate
if curl -s http://localhost:5000 > /dev/null 2>&1; then
    print_success "Frigate is running"
else
    print_warning "Frigate may not be fully ready yet"
fi

# Check backend API
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    print_success "Backend API is running"
else
    print_warning "Backend API may not be fully ready yet"
fi

# Setup complete
echo ""
print_success "🎉 IoT Presence Music System setup complete!"
echo ""
echo "📱 Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Configure your phone IP addresses in the config files"
echo "3. Install the sensor app on 3 phones (zones 1, 2, 3)"
echo "4. Install the main app on your control phone"
echo "5. Configure MQTT broker settings in each app"
echo ""
echo "🌐 Access points:"
echo "- Backend API: http://localhost:3000"
echo "- Frigate Web UI: http://localhost:5000"
echo "- MQTT WebSocket: ws://localhost:9001"
echo ""
echo "📋 Useful commands:"
echo "- Start services: docker-compose up -d"
echo "- Stop services: docker-compose down"
echo "- View logs: docker-compose logs -f"
echo "- Restart services: docker-compose restart"
echo ""
echo "🔧 Troubleshooting:"
echo "- Check logs: docker-compose logs [service-name]"
echo "- Restart specific service: docker-compose restart [service-name]"
echo "- Rebuild services: docker-compose up -d --build"
echo ""

# Check if .env needs configuration
if grep -q "your-" .env; then
    print_warning "⚠️  Please configure your .env file before using the system!"
fi

print_success "Setup script completed successfully!"

