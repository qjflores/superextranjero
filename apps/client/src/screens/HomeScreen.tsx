import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../state/AuthContext.js';
import apiClient from '../api/client.js';

export const HomeScreen: React.FC = () => {
  const { auth, logout } = useAuth();
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callBackend = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.hello();
      setResponse(res.message);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to call backend'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Survival Spanish</Text>
        <Text style={styles.email}>{auth.email}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>Progress</Text>

        {response && (
          <Text style={styles.response}>
            Backend says: {response}
          </Text>
        )}

        {error && <Text style={styles.error}>Error: {error}</Text>}

        <TouchableOpacity
          style={styles.button}
          onPress={callBackend}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Test Backend</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.logoutButton]}
        onPress={logout}
      >
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  content: {
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  response: {
    fontSize: 14,
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    color: '#2e7d32',
  },
  error: {
    fontSize: 14,
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    color: '#c62828',
  },
  button: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  logoutButton: {
    backgroundColor: '#d32f2f',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
