import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import apiClient from '../api/client';

interface ApiResponse {
  message: string;
}

export const HomeScreen: React.FC = () => {
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callBackend = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get<ApiResponse>('/hello');
      setResponse(res.data.message);
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
      <Text style={styles.title}>Survival Spanish</Text>
      <Text style={styles.subtitle}>Hello from Client</Text>

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
          <Text style={styles.buttonText}>Call Backend</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  response: {
    fontSize: 14,
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#e8f5e9',
    borderRadius: 5,
    color: '#2e7d32',
  },
  error: {
    fontSize: 14,
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#ffebee',
    borderRadius: 5,
    color: '#c62828',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
