import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useAuth } from '../state/AuthContext.js';
import { useSeedingState } from '../state/useSeedingState.js';

export const SeedingScreen: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const { auth } = useAuth();
  const { seeding, seedPool, checkStatus } = useSeedingState();
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    initializeSeeding();
  }, []);

  const initializeSeeding = async () => {
    try {
      // Check if already seeded
      await checkStatus();

      if (!seeding.isComplete) {
        // Start seeding process
        setStartTime(Date.now());
        await seedPool('en', 20);
      }
    } catch (error) {
      console.error('Failed to initialize seeding:', error);
    }
  };

  const handleComplete = () => {
    if (seeding.readyForFull) {
      onComplete?.();
    }
  };

  const completionPercentage =
    seeding.seededVerbs.length > 0
      ? (seeding.completedScenarios / seeding.seededVerbs.length) * 100
      : 0;

  // Show completion screen when done
  if (seeding.isComplete && seeding.readyForFull) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.completionContainer}>
          <Text style={styles.completionTitle}>🎉</Text>
          <Text style={styles.completionHeading}>Pool Seeded!</Text>
          <Text style={styles.completionSubtitle}>
            You've learned {seeding.completedScenarios} core Spanish verbs
          </Text>

          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{seeding.seededVerbs.length}</Text>
              <Text style={styles.statLabel}>Verbs Learned</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>
                {seeding.completedScenarios}
              </Text>
              <Text style={styles.statLabel}>Scenarios</Text>
            </View>
          </View>

          {seeding.seededVerbs.length > 0 && (
            <View style={styles.verbsContainer}>
              <Text style={styles.verbsTitle}>Your Verbs:</Text>
              <View style={styles.verbsList}>
                {seeding.seededVerbs.map((verb) => (
                  <View key={verb} style={styles.verbBadge}>
                    <Text style={styles.verbBadgeText}>{verb}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleComplete}
          >
            <Text style={styles.buttonText}>Continue to App</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // Show loading/seeding screen
  return (
    <ScrollView style={styles.container}>
      <View style={styles.seedingContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Learning Spanish Verbs</Text>
          <Text style={styles.subtitle}>
            Building your verb pool in recognition mode
          </Text>
        </View>

        {seeding.isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066cc" />
            <Text style={styles.loadingText}>Preparing your learning journey...</Text>
          </View>
        ) : null}

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressPercent}>
              {Math.round(completionPercentage)}%
            </Text>
          </View>
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${completionPercentage}%` },
              ]}
            />
          </View>

          {seeding.completedScenarios > 0 && (
            <Text style={styles.progressText}>
              {seeding.completedScenarios} scenario{seeding.completedScenarios !== 1 ? 's' : ''} recognized
            </Text>
          )}
        </View>

        {/* Seeded Verbs */}
        {seeding.seededVerbs.length > 0 && (
          <View style={styles.seededContainer}>
            <Text style={styles.seededTitle}>Verbs Learned So Far:</Text>
            <View style={styles.seededList}>
              {seeding.seededVerbs.slice(0, 10).map((verb) => (
                <View key={verb} style={styles.seededBadge}>
                  <Text style={styles.seededBadgeText}>{verb}</Text>
                </View>
              ))}
              {seeding.seededVerbs.length > 10 && (
                <Text style={styles.moreText}>
                  +{seeding.seededVerbs.length - 10} more
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Error State */}
        {seeding.error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{seeding.error}</Text>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => seedPool('en', 20)}
            >
              <Text style={styles.buttonTextSecondary}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Recognition Mode</Text>
          <Text style={styles.infoText}>
            You're learning through recognition, not production. Each verb is presented in a
            natural context. Your brain learns by matching the verb to its meaning.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  seedingContainer: {
    padding: 16,
    paddingTop: 24,
  },
  completionContainer: {
    padding: 16,
    paddingTop: 40,
    alignItems: 'center',
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
  },
  progressSection: {
    marginBottom: 32,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066cc',
  },
  progressContainer: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0066cc',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  seededContainer: {
    marginBottom: 32,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
  },
  seededTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  seededList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  seededBadge: {
    backgroundColor: '#e8f4f8',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  seededBadgeText: {
    fontSize: 12,
    color: '#0066cc',
    fontWeight: '500',
  },
  moreText: {
    fontSize: 12,
    color: '#666',
    paddingVertical: 6,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    marginBottom: 12,
  },
  infoContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066cc',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1565c0',
    lineHeight: 20,
  },
  completionTitle: {
    fontSize: 60,
    marginBottom: 16,
  },
  completionHeading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  completionSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 32,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  verbsContainer: {
    marginBottom: 32,
  },
  verbsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  verbsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  verbBadge: {
    backgroundColor: '#e8f4f8',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  verbBadgeText: {
    fontSize: 13,
    color: '#0066cc',
    fontWeight: '500',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#0066cc',
  },
  secondaryButton: {
    backgroundColor: '#e0e0e0',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
});
