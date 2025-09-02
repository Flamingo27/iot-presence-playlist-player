import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMQTT } from '../context/MQTTContext';
import { useSensor } from '../context/SensorContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation();
  const { isConnected, connectionStatus, settings } = useMQTT();
  const { 
    isRecording, 
    presenceDetected, 
    detectionConfidence,
    hasPermission 
  } = useSensor();

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return '#4CAF50';
      case 'connecting': return '#FF9800';
      case 'error': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'error': return 'Connection Error';
      default: return 'Disconnected';
    }
  };

  const handleStartMonitoring = () => {
    if (!hasPermission) {
      Alert.alert(
        'Permissions Required',
        'Camera and location permissions are required to start monitoring.',
        [{ text: 'OK', onPress: () => navigation.navigate('Settings') }]
      );
      return;
    }

    if (!isConnected) {
      Alert.alert(
        'MQTT Not Connected',
        'Please ensure MQTT connection is established before starting monitoring.',
        [{ text: 'OK' }]
      );
      return;
    }

    navigation.navigate('Camera');
  };

  const StatCard = ({ title, value, icon, color, onPress }) => (
    <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress}>
      <View style={styles.statHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>IoT Sensor Dashboard</Text>
        <Text style={styles.subtitle}>Zone: {settings.zone}</Text>
      </View>

      {/* Connection Status */}
      <View style={styles.statusSection}>
        <Text style={styles.sectionTitle}>Connection Status</Text>
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(connectionStatus) }]} />
            <Text style={styles.statusText}>
              MQTT: {getStatusText(connectionStatus)}
            </Text>
          </View>
          <Text style={styles.brokerText}>
            Broker: {settings.brokerUrl}
          </Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Presence"
            value={presenceDetected ? 'Detected' : 'None'}
            icon={presenceDetected ? 'person' : 'person-outline'}
            color={presenceDetected ? '#4CAF50' : '#9E9E9E'}
            onPress={() => navigation.navigate('Status')}
          />
          <StatCard
            title="Confidence"
            value={`${Math.round(detectionConfidence * 100)}%`}
            icon="analytics"
            color="#2196F3"
            onPress={() => navigation.navigate('Status')}
          />
          <StatCard
            title="Monitoring"
            value={isRecording ? 'Active' : 'Inactive'}
            icon={isRecording ? 'recording' : 'stop-circle'}
            color={isRecording ? '#4CAF50' : '#9E9E9E'}
            onPress={() => navigation.navigate('Camera')}
          />
          <StatCard
            title="Zone"
            value={settings.zone}
            icon="location"
            color="#FF9800"
            onPress={() => navigation.navigate('Settings')}
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Actions</Text>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: isRecording ? '#F44336' : '#4CAF50' }]}
          onPress={handleStartMonitoring}
        >
          <Ionicons 
            name={isRecording ? 'stop-circle' : 'play-circle'} 
            size={24} 
            color="white" 
          />
          <Text style={styles.actionButtonText}>
            {isRecording ? 'Stop Monitoring' : 'Start Monitoring'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButtonSecondary}
          onPress={() => navigation.navigate('Camera')}
        >
          <Ionicons name="camera" size={24} color="#2196F3" />
          <Text style={styles.actionButtonTextSecondary}>Camera View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButtonSecondary}
          onPress={() => navigation.navigate('Status')}
        >
          <Ionicons name="stats-chart" size={24} color="#FF9800" />
          <Text style={styles.actionButtonTextSecondary}>System Status</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButtonSecondary}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings" size={24} color="#9E9E9E" />
          <Text style={styles.actionButtonTextSecondary}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      <View style={styles.activitySection}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          <Text style={styles.activityText}>
            {presenceDetected 
              ? `Presence detected with ${Math.round(detectionConfidence * 100)}% confidence`
              : 'No recent activity detected'
            }
          </Text>
          <Text style={styles.activityTime}>
            Last update: {new Date().toLocaleTimeString()}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
  },
  statusSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  statusCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  brokerText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  statsSection: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    width: (width - 50) / 2,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionsSection: {
    padding: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  actionButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonTextSecondary: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  activitySection: {
    padding: 20,
    paddingBottom: 40,
  },
  activityCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activityText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  activityTime: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});

