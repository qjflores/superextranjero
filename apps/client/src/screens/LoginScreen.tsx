import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../state/AuthContext.js';

export const LoginScreen: React.FC = () => {
  const { auth, login, register, clearError } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async () => {
    clearError();

    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (isRegister && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (isRegister && password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    try {
      if (isRegister) {
        await register(email, password);
      } else {
        await login(email, password);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      Alert.alert('Error', message);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    clearError();
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Survival Spanish</Text>
        <Text style={styles.subtitle}>{isRegister ? 'Create Account' : 'Sign In'}</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            editable={!auth.isLoading}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            editable={!auth.isLoading}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        {isRegister && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!auth.isLoading}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>
        )}

        {auth.error && <Text style={styles.error}>{auth.error}</Text>}

        <TouchableOpacity
          style={[styles.button, styles.primaryButton, auth.isLoading && styles.disabled]}
          onPress={handleSubmit}
          disabled={auth.isLoading}
        >
          {auth.isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{isRegister ? 'Create Account' : 'Sign In'}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Toggle Mode */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
        </Text>
        <TouchableOpacity onPress={toggleMode} disabled={auth.isLoading}>
          <Text style={styles.link}>{isRegister ? 'Sign In' : 'Create Account'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    paddingTop: 40,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
  },
  error: {
    color: '#d32f2f',
    fontSize: 14,
    marginBottom: 16,
    marginTop: -8,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#0066cc',
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  link: {
    fontSize: 14,
    color: '#0066cc',
    fontWeight: '600',
  },
});
