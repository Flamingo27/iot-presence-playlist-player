import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MQTTContext = createContext();

export const useMQTT = () => {
  const context = useContext(MQTTContext);
  if (!context) {
    throw new Error('useMQTT must be used within an MQTTProvider');
  }
  return context;
};

export const MQTTProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastMessage, setLastMessage] = useState(null);
  const [messageHistory, setMessageHistory] = useState([]);
  const [settings, setSettings] = useState({
    brokerUrl: 'mqtt://192.168.1.100:1883',
    clientId: `sensor_${Math.random().toString(36).substr(2, 9)}`,
    username: '',
    password: '',
    zone: 'zone1',
    topic: 'presence/zone1'
  });

  const mqttClient = useRef(null);
  const reconnectTimer = useRef(null);

  // Load settings from storage
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('mqttSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error('Error loading MQTT settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('mqttSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving MQTT settings:', error);
    }
  };

  const connect = async () => {
    try {
      setConnectionStatus('connecting');
      
      // Import MQTT client dynamically
      const mqtt = require('react-native-mqtt');
      
      mqttClient.current = mqtt.connect(settings.brokerUrl, {
        clientId: settings.clientId,
        username: settings.username,
        password: settings.password,
        keepalive: 60,
        reconnectPeriod: 5000,
        connectTimeout: 30 * 1000,
        clean: true,
      });

      mqttClient.current.on('connect', () => {
        console.log('MQTT Connected');
        setIsConnected(true);
        setConnectionStatus('connected');
        
        // Subscribe to zone topic
        mqttClient.current.subscribe(settings.topic);
        
        // Publish initial presence status
        publishPresenceStatus(false, []);
      });

      mqttClient.current.on('message', (topic, message) => {
        const messageData = {
          topic,
          message: message.toString(),
          timestamp: new Date().toISOString()
        };
        
        setLastMessage(messageData);
        setMessageHistory(prev => [messageData, ...prev.slice(0, 49)]); // Keep last 50 messages
      });

      mqttClient.current.on('error', (error) => {
        console.error('MQTT Error:', error);
        setConnectionStatus('error');
        setIsConnected(false);
      });

      mqttClient.current.on('close', () => {
        console.log('MQTT Connection closed');
        setConnectionStatus('disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect
        if (reconnectTimer.current) {
          clearTimeout(reconnectTimer.current);
        }
        reconnectTimer.current = setTimeout(() => {
          if (!isConnected) {
            connect();
          }
        }, 5000);
      });

    } catch (error) {
      console.error('Error connecting to MQTT:', error);
      setConnectionStatus('error');
      setIsConnected(false);
    }
  };

  const disconnect = () => {
    if (mqttClient.current) {
      mqttClient.current.end();
      mqttClient.current = null;
    }
    setIsConnected(false);
    setConnectionStatus('disconnected');
    
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
  };

  const publishPresenceStatus = (present, people = []) => {
    if (mqttClient.current && isConnected) {
      const message = {
        present,
        people,
        timestamp: new Date().toISOString(),
        deviceId: settings.clientId,
        zone: settings.zone
      };
      
      mqttClient.current.publish(settings.topic, JSON.stringify(message));
      console.log('Published presence status:', message);
    }
  };

  const publishMessage = (topic, message) => {
    if (mqttClient.current && isConnected) {
      mqttClient.current.publish(topic, JSON.stringify(message));
    }
  };

  const updateSettings = (newSettings) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveSettings(updated);
    
    // Reconnect if broker URL changed
    if (updated.brokerUrl !== settings.brokerUrl && isConnected) {
      disconnect();
      setTimeout(() => connect(), 1000);
    }
  };

  const updateZone = (newZone) => {
    if (mqttClient.current && isConnected) {
      // Unsubscribe from old topic
      mqttClient.current.unsubscribe(settings.topic);
      
      // Update settings
      const newTopic = `presence/${newZone}`;
      const updated = { ...settings, zone: newZone, topic: newTopic };
      setSettings(updated);
      saveSettings(updated);
      
      // Subscribe to new topic
      mqttClient.current.subscribe(newTopic);
    }
  };

  // Auto-connect on mount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, []);

  const value = {
    isConnected,
    connectionStatus,
    lastMessage,
    messageHistory,
    settings,
    connect,
    disconnect,
    publishPresenceStatus,
    publishMessage,
    updateSettings,
    updateZone
  };

  return (
    <MQTTContext.Provider value={value}>
      {children}
    </MQTTContext.Provider>
  );
};

