import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import { Accelerometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SensorContext = createContext();

export const useSensor = () => {
  const context = useContext(SensorContext);
  if (!context) {
    throw new Error('useSensor must be used within a SensorProvider');
  }
  return context;
};

export const SensorProvider = ({ children }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [isRecording, setIsRecording] = useState(false);
  const [presenceDetected, setPresenceDetected] = useState(false);
  const [detectionConfidence, setDetectionConfidence] = useState(0);
  const [sensorData, setSensorData] = useState({
    location: null,
    accelerometer: { x: 0, y: 0, z: 0 },
    battery: null,
    network: null
  });
  
  const [settings, setSettings] = useState({
    detectionSensitivity: 0.7,
    detectionInterval: 2000,
    enableAudio: true,
    enableLocation: true,
    enableAccelerometer: true,
    autoPublish: true
  });

  const cameraRef = useRef(null);
  const detectionInterval = useRef(null);
  const accelerometerSubscription = useRef(null);

  // Load settings from storage
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('sensorSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error('Error loading sensor settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('sensorSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving sensor settings:', error);
    }
  };

  // Request permissions
  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: audioStatus } = await Audio.requestPermissionsAsync();
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      
      setHasPermission(
        cameraStatus === 'granted' && 
        audioStatus === 'granted' && 
        locationStatus === 'granted'
      );
    })();
  }, []);

  // Start presence detection
  const startDetection = () => {
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
    }

    detectionInterval.current = setInterval(() => {
      performPresenceDetection();
    }, settings.detectionInterval);
  };

  const stopDetection = () => {
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
      detectionInterval.current = null;
    }
  };

  // Perform presence detection using camera
  const performPresenceDetection = async () => {
    if (!cameraRef.current) return;

    try {
      // Take a photo for analysis
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: true,
        skipProcessing: true
      });

      // Simple motion detection (in a real app, you'd use ML models)
      const hasMotion = await detectMotion(photo.base64);
      
      if (hasMotion) {
        setPresenceDetected(true);
        setDetectionConfidence(0.85);
        
        // Publish presence status if auto-publish is enabled
        if (settings.autoPublish) {
          // This would be called from the MQTT context
          // publishPresenceStatus(true, ['person']);
        }
      } else {
        setPresenceDetected(false);
        setDetectionConfidence(0.15);
        
        if (settings.autoPublish) {
          // publishPresenceStatus(false, []);
        }
      }
    } catch (error) {
      console.error('Error during presence detection:', error);
    }
  };

  // Simple motion detection (placeholder for ML model)
  const detectMotion = async (base64Image) => {
    // In a real implementation, you would:
    // 1. Send image to Frigate server for ML analysis
    // 2. Use TensorFlow.js for on-device detection
    // 3. Compare with previous frame for motion detection
    
    // For now, simulate detection with random values
    return Math.random() > 0.5;
  };

  // Start accelerometer monitoring
  const startAccelerometer = () => {
    if (settings.enableAccelerometer) {
      accelerometerSubscription.current = Accelerometer.addListener(({ x, y, z }) => {
        setSensorData(prev => ({
          ...prev,
          accelerometer: { x, y, z }
        }));
      });
    }
  };

  const stopAccelerometer = () => {
    if (accelerometerSubscription.current) {
      accelerometerSubscription.current.remove();
      accelerometerSubscription.current = null;
    }
  };

  // Get location
  const getLocation = async () => {
    if (settings.enableLocation) {
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        setSensorData(prev => ({
          ...prev,
          location: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy
          }
        }));
      } catch (error) {
        console.error('Error getting location:', error);
      }
    }
  };

  // Update settings
  const updateSettings = (newSettings) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveSettings(updated);
    
    // Restart detection if interval changed
    if (updated.detectionInterval !== settings.detectionInterval) {
      if (isRecording) {
        stopDetection();
        startDetection();
      }
    }
  };

  // Start/stop monitoring
  const startMonitoring = () => {
    setIsRecording(true);
    startDetection();
    startAccelerometer();
    
    // Get initial location
    getLocation();
    
    // Set up periodic location updates
    const locationInterval = setInterval(getLocation, 30000); // Every 30 seconds
    
    return () => {
      clearInterval(locationInterval);
    };
  };

  const stopMonitoring = () => {
    setIsRecording(false);
    stopDetection();
    stopAccelerometer();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDetection();
      stopAccelerometer();
    };
  }, []);

  const value = {
    hasPermission,
    cameraType,
    setCameraType,
    isRecording,
    presenceDetected,
    detectionConfidence,
    sensorData,
    settings,
    cameraRef,
    startMonitoring,
    stopMonitoring,
    updateSettings,
    performPresenceDetection
  };

  return (
    <SensorContext.Provider value={value}>
      {children}
    </SensorContext.Provider>
  );
};

